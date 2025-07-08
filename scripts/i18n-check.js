#!/usr/bin/env node
import glob from 'fast-glob';
import { readFileSync } from 'node:fs';

console.log('🔍 Checking i18n completeness...');

const locales = ['en', 'de', 'ru'];
let hasErrors = false;

for (const locale of locales) {
  const files = await glob(`locales/${locale}/**/*.json`);
  
  for (const file of files) {
    const json = JSON.parse(readFileSync(file, 'utf8'));
    const emptyKeys = Object.entries(json)
      .filter(([key, value]) => !value || value.trim() === '')
      .map(([key]) => key);
    
    if (emptyKeys.length > 0) {
      console.error(`❌ ${file} has ${emptyKeys.length} missing translations:`);
      emptyKeys.forEach(key => console.error(`   - ${key}`));
      hasErrors = true;
    } else {
      console.log(`✅ ${file} is complete`);
    }
  }
}

if (hasErrors) {
  console.error('\n❌ Translation check failed. Run "npm run i18n:fill" to auto-translate missing keys.');
  process.exit(1);
} else {
  console.log('\n✅ All translations are complete!');
}