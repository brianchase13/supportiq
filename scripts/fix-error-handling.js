#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Files to fix
const files = [
  'app/api/tickets/deflect/route.ts',
  'app/api/demo/book/route.ts',
  'app/api/intercom/config/route.ts',
  'app/api/admin/health/route.ts',
  'app/api/admin/customers/route.ts',
  'app/api/leads/route.ts'
];

function fixErrorHandling(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  console.log(`🔧 Processing: ${filePath}`);
  
  let content = fs.readFileSync(fullPath, 'utf8');
  const originalContent = content;

  // Fix error handling patterns
  content = content.replace(
    /await logger\.error\(([^,]+),\s*([^)]+)\)/g,
    'await logger.error($1, $2 instanceof Error ? $2 : new Error(String($2)))'
  );

  // Only write if content changed
  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Updated: ${filePath}`);
  } else {
    console.log(`ℹ️  No changes needed: ${filePath}`);
  }
}

function main() {
  console.log('🚀 Fixing error handling in API routes...\n');
  
  for (const file of files) {
    fixErrorHandling(file);
  }
  
  console.log('\n✨ Error handling fixes complete!');
}

main(); 