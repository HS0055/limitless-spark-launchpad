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
    "prebuild": "npm run i18n:check"
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

3. **Full synchronization (scan + translate):**
   ```bash
   export OPENAI_API_KEY=sk-your-key-here
   npm run i18n:sync
   ```

4. **Check completeness:**
   ```bash
   npm run i18n:check
   ```

## Features

- Automatically finds all `<T>text</T>` components and `t('key')` calls
- Creates locale files for en/de/ru
- Auto-translates missing keys using OpenAI GPT-4o-mini
- Validates completeness before build
- Sorts keys alphabetically for better maintainability

## CI/CD Integration

The `prebuild` script automatically checks translation completeness. Build will fail if any translations are missing.