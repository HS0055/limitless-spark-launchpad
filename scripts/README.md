# i18n Automation Setup

## Required Package.json Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "i18n:scan": "node scripts/i18n-scan.js",
    "i18n:fill": "node scripts/i18n-auto-translate.mjs",
    "i18n:check": "node scripts/i18n-check.js",
    "i18n:sync": "npm run i18n:scan && npm run i18n:fill",
    "i18n:batch": "node scripts/i18n-batch-translate.mjs",
    "prebuild": "npm run i18n:check",
    "postbuild": "npm run i18n:batch"
  }
}
```

## Usage

1. **Scan for translatable strings:**
   ```bash
   npm run i18n:scan
   ```

2. **Auto-translate missing keys:**
   ```bash
   export OPENAI_API_KEY=sk-your-key-here
   npm run i18n:fill
   ```

4. **Full synchronization (scan + translate):**
   ```bash
   export OPENAI_API_KEY=sk-your-key-here
   npm run i18n:sync
   ```

5. **Check completeness:**
   ```bash
   npm run i18n:check
   ```

6. **Process queued missing translations:**
   ```bash
   npm run i18n:batch
   ```

## Real-time Missing Key Handler

The system now includes a real-time missing key detection system:

- **Production**: Missing translations are automatically queued and translated via AI
- **Development**: Missing keys logged to console for immediate feedback
- **Batch Processing**: Run `npm run i18n:batch` to process all queued translations
- **Database**: Queue stored in `translation_queue` table with status tracking

## Features

- Automatically finds all `<T>text</T>` components and `t('key')` calls
- Creates locale files for en/de/ru  
- Auto-translates missing keys using OpenAI GPT-4o-mini
- Real-time missing key detection and queueing in production
- Validates completeness before build
- Sorts keys alphabetically for better maintainability

## CI/CD Integration

The `prebuild` script automatically checks translation completeness. Build will fail if any translations are missing.
The `postbuild` script processes any missing translations that were queued during runtime.