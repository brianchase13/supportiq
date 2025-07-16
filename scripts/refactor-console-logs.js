#!/usr/bin/env node

/**
 * Script to replace console.log statements with proper logging
 * Usage: node scripts/refactor-console-logs.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const PROJECT_ROOT = path.resolve(__dirname, '..');
const LOGGER_IMPORT = "import { logger } from '@/lib/logging/logger';";

// Files that need console.log replacement
const FILES_TO_FIX = [
  'lib/rate-limit/index.ts',
  'lib/services/user-data.ts',
  'lib/analytics/results-tracker.ts',
  'lib/notifications/email-reports.ts',
  'lib/billing/money-back-guarantee.ts',
  'lib/notifications/slack.ts',
  'lib/pricing/value-calculator.ts',
  'lib/analytics/results-tracking.ts',
  'lib/webhooks/realtime-webhooks.ts',
  'lib/errors/SupportIQError.ts',
  'lib/ai/processor.ts',
  'lib/trial/manager.ts',
  'app/api/intercom/config/route.ts',
  'app/api/admin/customers/route.ts',
  'app/api/admin/health/route.ts',
  'app/api/leads/route.ts',
  'app/api/tickets/deflect/route.ts',
  'app/api/demo/book/route.ts'
];

// Console.log replacement patterns
const REPLACEMENTS = [
  {
    pattern: /console\.log\(`([^`]+)`\)/g,
    replacement: "await logger.info('$1')"
  },
  {
    pattern: /console\.log\(`([^`]+)`,\s*(\{[^}]+\})\)/g,
    replacement: "await logger.info('$1', $2)"
  },
  {
    pattern: /console\.error\(`([^`]+)`\)/g,
    replacement: "await logger.error('$1')"
  },
  {
    pattern: /console\.error\(`([^`]+)`,\s*(\w+)\)/g,
    replacement: "await logger.error('$1', $2)"
  },
  {
    pattern: /console\.warn\(`([^`]+)`\)/g,
    replacement: "await logger.warn('$1')"
  },
  {
    pattern: /console\.warn\(`([^`]+)`,\s*(\w+)\)/g,
    replacement: "await logger.warn('$1', $2)"
  },
  {
    pattern: /console\.log\(([^)]+)\)/g,
    replacement: "await logger.info($1)"
  },
  {
    pattern: /console\.error\(([^)]+)\)/g,
    replacement: "await logger.error($1)"
  },
  {
    pattern: /console\.warn\(([^)]+)\)/g,
    replacement: "await logger.warn($1)"
  }
];

function addLoggerImport(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check if logger is already imported
  if (content.includes("import { logger }")) {
    return content;
  }
  
  // Find the last import statement
  const lines = content.split('\n');
  let lastImportIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('import ')) {
      lastImportIndex = i;
    }
  }
  
  if (lastImportIndex >= 0) {
    lines.splice(lastImportIndex + 1, 0, LOGGER_IMPORT);
  } else {
    lines.unshift(LOGGER_IMPORT);
  }
  
  return lines.join('\n');
}

function replaceConsoleLogs(content) {
  let updatedContent = content;
  
  for (const replacement of REPLACEMENTS) {
    updatedContent = updatedContent.replace(replacement.pattern, replacement.replacement);
  }
  
  return updatedContent;
}

function processFile(filePath) {
  const fullPath = path.join(PROJECT_ROOT, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }
  
  console.log(`🔧 Processing: ${filePath}`);
  
  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;
    
    // Add logger import if needed
    content = addLoggerImport(fullPath);
    
    // Replace console.log statements
    content = replaceConsoleLogs(content);
    
    // Only write if content changed
    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
    } else {
      console.log(`ℹ️  No changes needed: ${filePath}`);
    }
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

function main() {
  console.log('🚀 Starting console.log refactoring...\n');
  
  for (const file of FILES_TO_FIX) {
    processFile(file);
  }
  
  console.log('\n✨ Console.log refactoring complete!');
  console.log('\nNext steps:');
  console.log('1. Run: npm run lint');
  console.log('2. Fix any remaining ESLint issues');
  console.log('3. Test the application');
}

if (require.main === module) {
  main();
}

module.exports = { processFile, replaceConsoleLogs, addLoggerImport }; 