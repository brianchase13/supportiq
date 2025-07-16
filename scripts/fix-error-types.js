#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'lib/errors/SupportIQError.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Replace all context?: any with context?: Record<string, unknown>
content = content.replace(/context\?\: any/g, 'context?: Record<string, unknown>');

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Fixed all any types in SupportIQError.ts'); 