#!/usr/bin/env node
import glob from 'fast-glob';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const sourceGlobs = ['src/**/*.{ts,tsx,md,mdx}'];
const defaultLocale = 'en';

console.log('🔍 Scanning for translatable strings...');

const keys = new Set();

// Find all T components and translate calls
for (const file of await glob(sourceGlobs)) {
  const code = readFileSync(file, 'utf8');
  
  // Match T component usage: <T>text</T>
  const tComponentMatches = code.matchAll(/<T[^>]*>([^<]+)<\/T>/g);
  for (const match of tComponentMatches) {
    const text = match[1].trim();
    if (text && !text.includes('{') && !text.includes('<')) {
      keys.add(text);
    }
  }
  
  // Match translate() calls: translate('key') or t('key')
  const translateMatches = code.matchAll(/(?:translate|t)\(['"`]([^'"`]+)['"`]\)/g);
  for (const match of translateMatches) {
    keys.add(match[1]);
  }
  
  // Match useTranslation calls with t function
  const tFunctionMatches = code.matchAll(/t\(['"`]([^'"`]+)['"`]\)/g);
  for (const match of tFunctionMatches) {
    keys.add(match[1]);
  }
}

console.log(`Found ${keys.size} translatable strings`);

// Update locale files
const localeFiles = await glob(`locales/${defaultLocale}/**/*.json`);
for (const file of localeFiles) {
  let json = {};
  try {
    json = JSON.parse(readFileSync(file, 'utf8'));
  } catch (error) {
    // File doesn't exist or is malformed, start fresh
    mkdirSync(dirname(file), { recursive: true });
  }
  
  let added = 0;
  
  keys.forEach(k => { 
    if (!json[k]) {
      json[k] = k; // Use the original text as the default value
      added++;
    }
  });
  
  // Sort keys alphabetically for better readability
  const sortedJson = Object.keys(json)
    .sort()
    .reduce((result, key) => {
      result[key] = json[key];
      return result;
    }, {});
  
  writeFileSync(file, JSON.stringify(sortedJson, null, 2) + '\n');
  console.log(`📝 Updated ${file} (+${added} new keys)`);
}

console.log('✨ i18n scan complete!');