#!/usr/bin/env node

/**
 * Script to replace 'any' types with proper TypeScript interfaces
 * Usage: npx tsx scripts/fix-types.ts
 */

import fs from 'fs';
import path from 'path';

// Configuration
const PROJECT_ROOT = path.resolve(__dirname, '..');

// Files that need type fixes
const FILES_TO_FIX = [
  'lib/ai/faq-generator.ts',
  'lib/integrations/intercom.ts',
  'lib/ai/ticket-deflection.ts',
  'lib/testing/page-test-runner.ts',
  'lib/monitoring/monitor.ts',
  'lib/testing/test-framework.ts',
  'lib/ai/processor.ts',
  'lib/ai/ticket-deflection-engine.ts',
  'lib/ai/response-templates.ts',
  'lib/testing/auth-test-utils.ts',
  'lib/analytics/results-tracker.ts'
];

// Type replacement patterns
const TYPE_REPLACEMENTS = [
  // Common patterns
  {
    pattern: /: any\b/g,
    replacement: ': unknown'
  },
  {
    pattern: /: any\[\]/g,
    replacement: ': unknown[]'
  },
  {
    pattern: /: Record<string, any>/g,
    replacement: ': Record<string, unknown>'
  },
  {
    pattern: /: Map<string, any>/g,
    replacement: ': Map<string, unknown>'
  },
  {
    pattern: /: Promise<any>/g,
    replacement: ': Promise<unknown>'
  },
  {
    pattern: /: Promise<any\[\]>/g,
    replacement: ': Promise<unknown[]>'
  },
  // Specific context replacements
  {
    pattern: /ticket: any/g,
    replacement: 'ticket: TicketData'
  },
  {
    pattern: /tickets: any\[\]/g,
    replacement: 'tickets: TicketData[]'
  },
  {
    pattern: /user: any/g,
    replacement: 'user: User'
  },
  {
    pattern: /session: any/g,
    replacement: 'session: Session'
  },
  {
    pattern: /error: any/g,
    replacement: 'error: Error'
  },
  {
    pattern: /data: any/g,
    replacement: 'data: Record<string, unknown>'
  },
  {
    pattern: /metadata: any/g,
    replacement: 'metadata: Record<string, unknown>'
  },
  {
    pattern: /variables: \{ \[key: string\]: any \}/g,
    replacement: 'variables: Record<string, string | number | boolean>'
  },
  {
    pattern: /overrides: Partial<any>/g,
    replacement: 'overrides: Partial<Record<string, unknown>>'
  },
  {
    pattern: /usageLogs: \(log: any\)/g,
    replacement: 'usageLogs: (log: UsageLog)'
  },
  {
    pattern: /log: any\)/g,
    replacement: 'log: UsageLog)'
  },
  {
    pattern: /supabase: any/g,
    replacement: 'supabase: SupabaseClient'
  },
  {
    pattern: /config: PageTestConfig, userSession\?: any/g,
    replacement: 'config: PageTestConfig, userSession?: Session'
  },
  {
    pattern: /userSession\?: any\): Promise<\{/g,
    replacement: 'userSession?: Session): Promise<{'
  },
  {
    pattern: /results: any\[\]/g,
    replacement: 'results: TestResult[]'
  },
  {
    pattern: /summary: any\): string/g,
    replacement: 'summary: TestSummary): string'
  },
  {
    pattern: /authResults: AuthTestResult\[\], pageResults\?: any\[\]/g,
    replacement: 'authResults: AuthTestResult[], pageResults?: PageTestResult[]'
  }
];

// Import statements to add
const IMPORTS_TO_ADD = {
  'lib/ai/faq-generator.ts': [
    "import { SupabaseClient } from '@supabase/supabase-js';",
    "import { FAQAnalytics } from '@/lib/types';"
  ],
  'lib/integrations/intercom.ts': [
    "import { IntercomMetadata, IntercomResponse } from '@/lib/types';"
  ],
  'lib/ai/ticket-deflection.ts': [
    "import { TicketData, TicketAnalysis, DeflectionResponse, TicketMetrics } from '@/lib/types';"
  ],
  'lib/testing/page-test-runner.ts': [
    "import { SupabaseClient } from '@supabase/supabase-js';",
    "import { Session, TestResult, PageTestResult } from '@/lib/types';"
  ],
  'lib/monitoring/monitor.ts': [
    "import { MetricData, AlertConfig } from '@/lib/types';"
  ],
  'lib/testing/test-framework.ts': [
    "import { TestResult, MockData } from '@/lib/types';"
  ],
  'lib/ai/processor.ts': [
    "import { TicketData, KnowledgeBaseEntry, ResponseTemplate, ConversationHistory } from '@/lib/types';"
  ],
  'lib/ai/ticket-deflection-engine.ts': [
    "import { TicketData, WorkingHours, DeflectionResponse } from '@/lib/types';"
  ],
  'lib/ai/response-templates.ts': [
    "import { SupabaseClient } from '@supabase/supabase-js';",
    "import { ResponseTemplate, TemplateVariables, UsageLog } from '@/lib/types';"
  ],
  'lib/testing/auth-test-utils.ts': [
    "import { SupabaseClient } from '@supabase/supabase-js';",
    "import { User, Session, AuthTestResult, PageTestResult } from '@/lib/types';"
  ],
  'lib/analytics/results-tracker.ts': [
    "import { SupabaseClient } from '@supabase/supabase-js';",
    "import { CustomerResults, TestimonialCandidate } from '@/lib/types';"
  ]
};

function addImports(filePath: string, content: string): string {
  const importsToAdd = IMPORTS_TO_ADD[filePath as keyof typeof IMPORTS_TO_ADD];
  if (!importsToAdd) return content;

  const lines = content.split('\n');
  let lastImportIndex = -1;

  // Find the last import statement
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('import ')) {
      lastImportIndex = i;
    }
  }

  if (lastImportIndex >= 0) {
    lines.splice(lastImportIndex + 1, 0, ...importsToAdd);
  } else {
    lines.unshift(...importsToAdd);
  }

  return lines.join('\n');
}

function replaceTypes(content: string): string {
  let updatedContent = content;

  for (const replacement of TYPE_REPLACEMENTS) {
    updatedContent = updatedContent.replace(replacement.pattern, replacement.replacement);
  }

  return updatedContent;
}

function processFile(filePath: string): void {
  const fullPath = path.join(PROJECT_ROOT, filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  console.log(`🔧 Processing: ${filePath}`);

  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;

    // Add necessary imports
    content = addImports(filePath, content);

    // Replace any types
    content = replaceTypes(content);

    // Only write if content changed
    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
    } else {
      console.log(`ℹ️  No changes needed: ${filePath}`);
    }

  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
  }
}

function main(): void {
  console.log('🚀 Starting type safety refactoring...\n');

  for (const file of FILES_TO_FIX) {
    processFile(file);
  }

  console.log('\n✨ Type safety refactoring complete!');
  console.log('\nNext steps:');
  console.log('1. Run: npm run type-check');
  console.log('2. Fix any remaining TypeScript errors');
  console.log('3. Run: npm run lint');
  console.log('4. Test the application');
}

if (require.main === module) {
  main();
}

export { processFile, replaceTypes, addImports }; 