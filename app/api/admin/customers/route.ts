import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/client';
import { logger } from '@/lib/logging/logger';

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin (you should implement proper admin role checking)
    const cookieStore = request.cookies;
    const user = await auth.getUser(cookieStore);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Add proper admin role checking
    // if (!user.isAdmin) {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }

    // Get customers with subscription and usage data
    const { data: customers, error } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        email,
        full_name,
        subscription_status,
        subscription_plan,
        trial_end_date,
        created_at,
        last_sign_in_at,
        stripe_customer_id,
        stripe_subscription_id
      `)
      .order('created_at', { ascending: false });

    if (error) {
      await logger.error('Error fetching customers:', error instanceof Error ? error : new Error(String(error)));
      return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
    }

    // Get usage statistics for each customer
    const customersWithUsage = await Promise.all(
      customers.map(async (customer) => {
        // Get AI responses count
        const { count: aiResponsesUsed } = await supabaseAdmin
          .from('ai_responses')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', customer.id);

        // Get user settings for limits
        const { data: userSettings } = await supabaseAdmin
          .from('user_settings')
          .select('ai_responses_limit')
          .eq('user_id', customer.id)
          .single();

        // Get total spent from subscriptions
        const { data: subscriptions } = await supabaseAdmin
          .from('subscriptions')
          .select('stripe_subscription_id')
          .eq('user_id', customer.id)
          .eq('status', 'active');

        // Calculate total spent (this would need to be calculated from Stripe data)
        const totalSpent = 0; // TODO: Calculate from Stripe invoices

        return {
          id: customer.id,
          email: customer.email,
          name: customer.full_name || 'Unknown',
          subscription_status: customer.subscription_status || 'trialing',
          subscription_plan: customer.subscription_plan || 'trial',
          trial_end_date: customer.trial_end_date,
          created_at: customer.created_at,
          last_login: customer.last_sign_in_at,
          ai_responses_used: aiResponsesUsed || 0,
          ai_responses_limit: userSettings?.ai_responses_limit || 100,
          total_spent: totalSpent,
          stripe_customer_id: customer.stripe_customer_id,
          stripe_subscription_id: customer.stripe_subscription_id
        };
      })
    );

    return NextResponse.json({
      customers: customersWithUsage,
      total: customersWithUsage.length
    });

  } catch (error) {
    await logger.error('Admin customers API error:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 