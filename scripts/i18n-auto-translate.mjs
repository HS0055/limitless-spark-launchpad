#!/usr/bin/env node
import fs from 'node:fs/promises';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import glob from 'fast-glob';
import OpenAI from 'openai';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

const locales = ['de', 'ru'];
const languageNames = {
  de: 'German',
  ru: 'Russian'
};

console.log('🤖 Starting auto-translation...');

if (!process.env.OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY environment variable is required');
  process.exit(1);
}

try {
  let base = {};
  try {
    base = JSON.parse(await fs.readFile('locales/en/common.json', 'utf8'));
  } catch (error) {
    console.log('⚠️  No en/common.json found. Run i18n:scan first.');
    process.exit(0);
  }
  const baseKeys = Object.keys(base);
  
  if (baseKeys.length === 0) {
    console.log('⚠️  No strings found in en/common.json. Run i18n:scan first.');
    process.exit(0);
  }

  for (const locale of locales) {
    console.log(`\n🌍 Translating to ${languageNames[locale]}...`);
    const path = `locales/${locale}/common.json`;
    
    let json = {};
    try {
      json = JSON.parse(await fs.readFile(path, 'utf8'));
    } catch (error) {
      // Create directory if it doesn't exist
      mkdirSync(dirname(path), { recursive: true });
    }
    
    let translated = 0;
    
    for (const [key, value] of Object.entries(base)) {
      if (!json[key] || json[key] === '') {
        try {
          console.log(`   Translating: "${value}"`);
          
          const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: `You are a professional translator. Translate the given text to ${languageNames[locale]}. Return only the translation, no quotes or explanations. Maintain the same tone and style.`
              },
              {
                role: 'user', 
                content: value
              }
            ],
            temperature: 0.1,
            max_tokens: 200
          });
          
          const translation = response.choices[0].message.content.trim();
          json[key] = translation;
          translated++;
          
          console.log(`   → "${translation}"`);
          
          // Rate limiting: 2 requests per second to be safe
          await new Promise(r => setTimeout(r, 500));
          
        } catch (error) {
          console.error(`   ❌ Failed to translate "${value}":`, error.message);
          json[key] = value; // Fallback to original text
        }
      }
    }
    
    // Sort keys alphabetically
    const sortedJson = Object.keys(json)
      .sort()
      .reduce((result, key) => {
        result[key] = json[key];
        return result;
      }, {});
    
    await fs.writeFile(path, JSON.stringify(sortedJson, null, 2) + '\n');
    console.log(`✅ ${locale}: ${translated} new translations added`);
  }
  
  console.log('\n🎉 Auto-translation complete!');
  
} catch (error) {
  console.error('❌ Translation failed:', error.message);
  process.exit(1);
}