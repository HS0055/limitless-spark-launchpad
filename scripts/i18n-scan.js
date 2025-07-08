#!/usr/bin/env node

/**
 * Advanced i18n scanner with validation and health checks
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BASE_LANG = 'en';
const LOCALES_DIR = 'locales';
const SRC_DIR = 'src';

// Extract i18n keys from source code
function extractKeysFromCode() {
  const keys = new Set();
  
  try {
    // Find all translate() calls
    const translateCalls = execSync(
      `grep -r "translate(" ${SRC_DIR} --include="*.tsx" --include="*.ts" -o | grep -o '"[^"]*"' | sed 's/"//g'`,
      { encoding: 'utf8' }
    ).split('\n').filter(Boolean);
    
    translateCalls.forEach(key => keys.add(key));
    
    // Find all <T> component usage
    const tComponentCalls = execSync(
      `grep -r "<T>" ${SRC_DIR} --include="*.tsx" -A1 | grep -v "^--" | grep -v "<T>" | sed 's/^[^:]*://g' | sed 's/^[ \t]*//' | sed 's/<\/T>.*//g'`,
      { encoding: 'utf8' }
    ).split('\n').filter(Boolean);
    
    tComponentCalls.forEach(key => {
      const cleanKey = key.trim().replace(/^['"]|['"]$/g, '');
      if (cleanKey) keys.add(cleanKey);
    });
    
  } catch (error) {
    console.warn('Warning: Could not extract keys from code:', error.message);
  }
  
  return Array.from(keys);
}

// Get all keys from translation files
function getTranslationKeys(lang) {
  const keys = new Set();
  const langDir = path.join(LOCALES_DIR, lang);
  
  if (!fs.existsSync(langDir)) {
    return Array.from(keys);
  }
  
  const files = fs.readdirSync(langDir).filter(f => f.endsWith('.json'));
  
  files.forEach(file => {
    try {
      const content = JSON.parse(fs.readFileSync(path.join(langDir, file), 'utf8'));
      
      function extractKeys(obj, prefix = '') {
        Object.keys(obj).forEach(key => {
          const fullKey = prefix ? `${prefix}.${key}` : key;
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            extractKeys(obj[key], fullKey);
          } else {
            keys.add(fullKey);
            keys.add(key); // Also add simple key
          }
        });
      }
      
      extractKeys(content);
    } catch (error) {
      console.warn(`Warning: Could not parse ${file}:`, error.message);
    }
  });
  
  return Array.from(keys);
}

function validateTranslations() {
  console.log('🔍 Validating translation health...');
  
  // Check for empty strings
  let hasEmptyStrings = false;
  if (fs.existsSync(LOCALES_DIR)) {
    const files = execSync(`find ${LOCALES_DIR} -name "*.json"`, { encoding: 'utf8' }).split('\n').filter(Boolean);
    
    files.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes('""')) {
          console.warn(`⚠️  Empty strings found in: ${file}`);
          hasEmptyStrings = true;
        }
      } catch (error) {
        console.warn(`Warning: Could not check ${file}`);
      }
    });
  }
  
  return !hasEmptyStrings;
}

function main() {
  console.log('🔍 Scanning codebase for i18n keys...');
  
  const codeKeys = extractKeysFromCode();
  const translationKeys = getTranslationKeys(BASE_LANG);
  
  console.log(`📊 Found ${codeKeys.length} keys in code`);
  console.log(`📊 Found ${translationKeys.length} keys in ${BASE_LANG} translations`);
  
  // Find missing keys
  const missingInTranslations = codeKeys.filter(key => 
    !translationKeys.some(tKey => tKey === key || tKey.endsWith(`.${key}`))
  );
  
  const unusedTranslations = translationKeys.filter(key => 
    !codeKeys.some(cKey => cKey === key || cKey.includes(key))
  );
  
  if (missingInTranslations.length > 0) {
    console.log('\n⚠️  Keys found in code but missing in translations:');
    missingInTranslations.forEach(key => console.log(`  - ${key}`));
  }
  
  if (unusedTranslations.length > 0) {
    console.log('\n🗑️  Keys in translations but not used in code:');
    unusedTranslations.slice(0, 10).forEach(key => console.log(`  - ${key}`));
    if (unusedTranslations.length > 10) {
      console.log(`  ... and ${unusedTranslations.length - 10} more`);
    }
  }
  
  // Validate translation health
  const isHealthy = validateTranslations();
  
  if (missingInTranslations.length === 0 && unusedTranslations.length === 0 && isHealthy) {
    console.log('\n✅ All i18n keys are in sync and healthy!');
  } else if (!isHealthy) {
    console.log('\n❌ Translation health check failed!');
    process.exit(1);
  }
  
  console.log('\n💡 Note: Missing keys will be auto-translated by the AI system when users switch languages.');
}

if (require.main === module) {
  main();
}