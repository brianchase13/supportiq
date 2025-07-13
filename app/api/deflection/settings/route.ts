import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { apiLimiter, checkRateLimit } from '@/lib/rate-limit';
import { supabaseAdmin } from '@/lib/supabase/client';
import { z } from 'zod';

const SettingsUpdateSchema = z.object({
  auto_response_enabled: z.boolean().optional(),
  confidence_threshold: z.number().min(0.0).max(1.0).optional(),
  escalation_threshold: z.number().min(0.0).max(1.0).optional(),
  response_language: z.string().optional(),
  business_hours_only: z.boolean().optional(),
  excluded_categories: z.array(z.string()).optional(),
  escalation_keywords: z.array(z.string()).optional(),
  custom_instructions: z.string().optional(),
});

// GET endpoint to retrieve current settings
export async function GET(request: NextRequest) {
  try {
    const user = await auth.getUser();
    const userId = user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current settings
    const { data: settings, error } = await supabaseAdmin
      .from('deflection_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Settings retrieval error:', error);
      return NextResponse.json(
        { error: 'Failed to retrieve settings' },
        { status: 500 }
      );
    }

    // Return default settings if none exist
    const defaultSettings = {
      auto_response_enabled: true,
      confidence_threshold: 0.75,
      escalation_threshold: 0.50,
      response_language: 'en',
      business_hours_only: false,
      excluded_categories: [],
      escalation_keywords: ['urgent', 'emergency', 'asap', 'immediately', 'critical', 'escalate', 'manager', 'supervisor'],
      custom_instructions: null,
    };

    const currentSettings = settings || defaultSettings;

    // Get usage statistics
    const usageStats = await getUsageStatistics(userId);

    // Get recommended settings based on usage
    const recommendations = await getSettingsRecommendations(userId, currentSettings);

    return NextResponse.json({
      success: true,
      settings: {
        id: currentSettings.id || null,
        user_id: userId,
        auto_response_enabled: currentSettings.auto_response_enabled,
        confidence_threshold: currentSettings.confidence_threshold,
        escalation_threshold: currentSettings.escalation_threshold,
        response_language: currentSettings.response_language,
        business_hours_only: currentSettings.business_hours_only,
        excluded_categories: currentSettings.excluded_categories || [],
        escalation_keywords: currentSettings.escalation_keywords || [],
        custom_instructions: currentSettings.custom_instructions,
        created_at: currentSettings.created_at,
        updated_at: currentSettings.updated_at,
      },
      usage_stats: usageStats,
      recommendations,
      available_languages: [
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Spanish' },
        { code: 'fr', name: 'French' },
        { code: 'de', name: 'German' },
        { code: 'it', name: 'Italian' },
        { code: 'pt', name: 'Portuguese' },
      ],
      category_options: await getAvailableCategories(userId),
    });

  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Settings retrieval failed' },
      { status: 500 }
    );
  }
}

// PUT endpoint to update settings
export async function PUT(request: NextRequest) {
  try {
    const user = await auth.getUser();
    const userId = user?.id;
    const clientIP = request.ip || 'unknown';

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const rateLimitResult = await checkRateLimit(apiLimiter, clientIP);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          retryAfter: rateLimitResult.msBeforeNext,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validationResult = SettingsUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid settings', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const updates = validationResult.data;

    // Validate confidence thresholds relationship
    if (updates.confidence_threshold && updates.escalation_threshold &&
        updates.confidence_threshold <= updates.escalation_threshold) {
      return NextResponse.json(
        { error: 'Confidence threshold must be higher than escalation threshold' },
        { status: 400 }
      );
    }

    // Check if settings exist
    const { data: existingSettings, error: fetchError } = await supabaseAdmin
      .from('deflection_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    let result;
    const now = new Date().toISOString();

    if (fetchError && fetchError.code === 'PGRST116') {
      // Create new settings
      const newSettings = {
        user_id: userId,
        auto_response_enabled: updates.auto_response_enabled ?? true,
        confidence_threshold: updates.confidence_threshold ?? 0.75,
        escalation_threshold: updates.escalation_threshold ?? 0.50,
        response_language: updates.response_language ?? 'en',
        business_hours_only: updates.business_hours_only ?? false,
        excluded_categories: updates.excluded_categories ?? [],
        escalation_keywords: updates.escalation_keywords ?? ['urgent', 'emergency', 'asap', 'immediately', 'critical', 'escalate', 'manager', 'supervisor'],
        custom_instructions: updates.custom_instructions,
        created_at: now,
        updated_at: now,
      };

      const { data: created, error: createError } = await supabaseAdmin
        .from('deflection_settings')
        .insert(newSettings)
        .select()
        .single();

      if (createError) {
        console.error('Settings creation error:', createError);
        return NextResponse.json(
          { error: 'Failed to create settings' },
          { status: 500 }
        );
      }

      result = created;
    } else if (existingSettings) {
      // Update existing settings
      const updatedSettings = {
        ...updates,
        updated_at: now,
      };

      const { data: updated, error: updateError } = await supabaseAdmin
        .from('deflection_settings')
        .update(updatedSettings)
        .eq('user_id', userId)
        .select()
        .single();

      if (updateError) {
        console.error('Settings update error:', updateError);
        return NextResponse.json(
          { error: 'Failed to update settings' },
          { status: 500 }
        );
      }

      result = updated;
    } else {
      console.error('Unexpected error fetching settings:', fetchError);
      return NextResponse.json(
        { error: 'Failed to retrieve existing settings' },
        { status: 500 }
      );
    }

    // Log settings change
    await logSettingsChange(userId, updates);

    // Get impact analysis
    const impact = await analyzeSettingsImpact(userId, updates);

    return NextResponse.json({
      success: true,
      settings: result,
      impact,
      message: 'Settings updated successfully',
      applied_at: now,
    });

  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Settings update failed' },
      { status: 500 }
    );
  }
}

// POST endpoint to reset settings to defaults
export async function POST(request: NextRequest) {
  try {
    const user = await auth.getUser();
    const userId = user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const action = body.action;

    if (action === 'reset_to_defaults') {
      const defaultSettings = {
        auto_response_enabled: true,
        confidence_threshold: 0.75,
        escalation_threshold: 0.50,
        response_language: 'en',
        business_hours_only: false,
        excluded_categories: [],
        escalation_keywords: ['urgent', 'emergency', 'asap', 'immediately', 'critical', 'escalate', 'manager', 'supervisor'],
        custom_instructions: null,
        updated_at: new Date().toISOString(),
      };

      const { data: reset, error } = await supabaseAdmin
        .from('deflection_settings')
        .upsert({
          user_id: userId,
          ...defaultSettings,
        })
        .select()
        .single();

      if (error) {
        console.error('Settings reset error:', error);
        return NextResponse.json(
          { error: 'Failed to reset settings' },
          { status: 500 }
        );
      }

      await logSettingsChange(userId, { action: 'reset_to_defaults' });

      return NextResponse.json({
        success: true,
        settings: reset,
        message: 'Settings reset to defaults successfully',
      });
    } else if (action === 'optimize_for_volume') {
      // Optimize settings for high-volume support
      const optimizedSettings = {
        auto_response_enabled: true,
        confidence_threshold: 0.8, // Higher threshold for volume
        escalation_threshold: 0.4, // Lower escalation threshold
        business_hours_only: false, // 24/7 for volume
        updated_at: new Date().toISOString(),
      };

      const { data: optimized, error } = await supabaseAdmin
        .from('deflection_settings')
        .upsert({
          user_id: userId,
          ...optimizedSettings,
        })
        .select()
        .single();

      if (error) {
        console.error('Settings optimization error:', error);
        return NextResponse.json(
          { error: 'Failed to optimize settings' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        settings: optimized,
        message: 'Settings optimized for high volume',
      });
    } else if (action === 'optimize_for_quality') {
      // Optimize settings for quality over quantity
      const qualitySettings = {
        auto_response_enabled: true,
        confidence_threshold: 0.9, // Very high threshold
        escalation_threshold: 0.6, // Higher escalation threshold
        business_hours_only: true, // Only during business hours
        updated_at: new Date().toISOString(),
      };

      const { data: quality, error } = await supabaseAdmin
        .from('deflection_settings')
        .upsert({
          user_id: userId,
          ...qualitySettings,
        })
        .select()
        .single();

      if (error) {
        console.error('Settings quality optimization error:', error);
        return NextResponse.json(
          { error: 'Failed to optimize settings for quality' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        settings: quality,
        message: 'Settings optimized for quality',
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Settings POST error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Settings operation failed' },
      { status: 500 }
    );
  }
}

async function getUsageStatistics(userId: string) {
  try {
    // Get last 30 days of metrics
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const { data: metrics, error } = await supabaseAdmin
      .from('deflection_metrics')
      .select('*')
      .eq('user_id', userId)
      .gte('date', thirtyDaysAgo);

    if (error || !metrics) {
      return {
        total_tickets: 0,
        auto_resolved: 0,
        escalated: 0,
        avg_confidence: 0,
        avg_satisfaction: 0,
      };
    }

    const totals = metrics.reduce(
      (acc, metric) => ({
        total_tickets: acc.total_tickets + (metric.total_tickets || 0),
        auto_resolved: acc.auto_resolved + (metric.auto_resolved || 0),
        escalated: acc.escalated + (metric.escalated || 0),
        satisfaction_sum: acc.satisfaction_sum + (metric.customer_satisfaction || 0),
        count: acc.count + 1,
      }),
      { total_tickets: 0, auto_resolved: 0, escalated: 0, satisfaction_sum: 0, count: 0 }
    );

    // Get average confidence from AI responses
    const { data: responses } = await supabaseAdmin
      .from('ai_responses')
      .select('confidence_score')
      .eq('user_id', userId)
      .gte('created_at', thirtyDaysAgo + 'T00:00:00Z');

    const avgConfidence = responses?.length 
      ? responses.reduce((sum, r) => sum + r.confidence_score, 0) / responses.length
      : 0;

    return {
      total_tickets: totals.total_tickets,
      auto_resolved: totals.auto_resolved,
      escalated: totals.escalated,
      deflection_rate: totals.total_tickets > 0 ? totals.auto_resolved / totals.total_tickets : 0,
      avg_confidence: avgConfidence,
      avg_satisfaction: totals.count > 0 ? totals.satisfaction_sum / totals.count : 0,
    };
  } catch (error) {
    console.error('Failed to get usage statistics:', error);
    return null;
  }
}

async function getSettingsRecommendations(userId: string, currentSettings: any) {
  try {
    const usageStats = await getUsageStatistics(userId);
    const recommendations = [];

    if (!usageStats) return [];

    // Confidence threshold recommendations
    if (usageStats.avg_confidence > 0.85 && currentSettings.confidence_threshold < 0.8) {
      recommendations.push({
        type: 'confidence_threshold',
        current: currentSettings.confidence_threshold,
        suggested: 0.8,
        reason: 'Your AI responses have high confidence. You can safely increase the threshold.',
        impact: 'Higher deflection rate with maintained quality',
      });
    } else if (usageStats.avg_confidence < 0.6 && currentSettings.confidence_threshold > 0.7) {
      recommendations.push({
        type: 'confidence_threshold',
        current: currentSettings.confidence_threshold,
        suggested: 0.65,
        reason: 'Lower average confidence suggests reducing threshold might improve deflection.',
        impact: 'Higher deflection rate but may reduce quality',
      });
    }

    // Satisfaction-based recommendations
    if (usageStats.avg_satisfaction < 0.7 && currentSettings.confidence_threshold < 0.8) {
      recommendations.push({
        type: 'quality_focus',
        current: currentSettings.confidence_threshold,
        suggested: 0.85,
        reason: 'Low satisfaction suggests focusing on quality over quantity.',
        impact: 'Better customer satisfaction but lower deflection rate',
      });
    }

    // Volume-based recommendations
    if (usageStats.total_tickets > 1000 && currentSettings.confidence_threshold > 0.8) {
      recommendations.push({
        type: 'volume_optimization',
        current: currentSettings.confidence_threshold,
        suggested: 0.75,
        reason: 'High ticket volume suggests optimizing for deflection rate.',
        impact: 'Higher deflection rate to handle volume',
      });
    }

    return recommendations;
  } catch (error) {
    console.error('Failed to get recommendations:', error);
    return [];
  }
}

async function getAvailableCategories(userId: string) {
  try {
    const { data: categories, error } = await supabaseAdmin
      .from('tickets')
      .select('category')
      .eq('user_id', userId)
      .not('category', 'is', null)
      .limit(100);

    if (error) {
      console.error('Failed to get categories:', error);
      return [];
    }

    // Get unique categories
    const uniqueCategories = [...new Set(categories?.map(t => t.category).filter(Boolean))];
    return uniqueCategories.sort();
  } catch (error) {
    console.error('Failed to get available categories:', error);
    return [];
  }
}

async function logSettingsChange(userId: string, changes: any) {
  try {
    await supabaseAdmin
      .from('settings_change_logs')
      .insert({
        user_id: userId,
        changes: changes,
        changed_at: new Date().toISOString(),
      });
  } catch (error) {
    console.error('Failed to log settings change:', error);
  }
}

async function analyzeSettingsImpact(userId: string, changes: any) {
  // Simplified impact analysis
  const impact = {
    deflection_rate_change: 0,
    quality_impact: 'neutral',
    volume_impact: 'neutral',
    estimated_effect: 'Unknown impact - monitor for 7 days',
  };

  if (changes.confidence_threshold !== undefined) {
    // Higher threshold = lower deflection rate but higher quality
    if (changes.confidence_threshold > 0.8) {
      impact.deflection_rate_change = -5; // 5% decrease
      impact.quality_impact = 'positive';
      impact.volume_impact = 'negative';
      impact.estimated_effect = 'Higher quality responses, lower volume';
    } else if (changes.confidence_threshold < 0.7) {
      impact.deflection_rate_change = 10; // 10% increase
      impact.quality_impact = 'negative';
      impact.volume_impact = 'positive';
      impact.estimated_effect = 'Higher volume, potential quality concerns';
    }
  }

  if (changes.auto_response_enabled === false) {
    impact.deflection_rate_change = -100;
    impact.volume_impact = 'very_negative';
    impact.estimated_effect = 'All tickets will be escalated to humans';
  }

  return impact;
}