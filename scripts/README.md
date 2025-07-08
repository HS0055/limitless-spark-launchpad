# Translation System Scripts

This directory contains scripts for managing the intelligent translation system.

## Scripts

### `validate-i18n.sh`
Pre-commit hook that validates translation files:
- Checks for empty strings in JSON files
- Validates JSON syntax  
- Reports missing translation keys across languages

**Usage:**
```bash
chmod +x scripts/validate-i18n.sh
./scripts/validate-i18n.sh
```

### `i18n-scan.js`
Advanced scanner that analyzes codebase for i18n keys:
- Extracts keys from translate() calls and <T> components
- Compares code keys with translation files
- Reports missing and unused translations
- Validates translation health

**Usage:**
```bash
node scripts/i18n-scan.js
```

## Git Hook Setup

To automatically validate translations before commits:

```bash
# Make scripts executable
chmod +x scripts/validate-i18n.sh

# Add to .git/hooks/pre-commit
echo "#!/bin/bash\n./scripts/validate-i18n.sh" > .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

## Manual Translation Processing

To manually trigger translation processing:

```bash
# Scan for new keys
node scripts/i18n-scan.js

# Process translation queue (via curl)
curl -X POST "https://mbwieeegglyprxoncckdj.supabase.co/functions/v1/auto-translate-system" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"mode": "continuous-monitor", "maxTextsPerBatch": 20}'
```

## Translation Health Dashboard

Visit `/translation-health` to monitor:
- 📊 Pending/completed/failed translations
- 🌍 Active language coverage  
- ⚡ Recent AI translations
- 🔍 System health status
- 🚀 Manual queue processing

## Best Practices

1. **Static translations first**: Add commonly used keys to `/locales/{lang}/` JSON files
2. **Auto-translate for new content**: Let AI system handle dynamic content  
3. **Regular validation**: Run i18n-scan.js before releases
4. **Monitor health**: Use Translation Health Dashboard (`/translation-health`)
5. **Git hooks**: Prevent empty translations from being committed

## Package.json Scripts

Add these to your `package.json`:

```json
{
  "scripts": {
    "i18n:scan": "node scripts/i18n-scan.js",
    "i18n:validate": "./scripts/validate-i18n.sh",
    "i18n:check": "npm run i18n:scan && npm run i18n:validate",
    "i18n:batch": "node scripts/i18n-batch-translate.mjs",
    "i18n:queue-status": "node scripts/i18n-queue-status.mjs",
    "prebuild": "npm run i18n:check"
  }
}
```

## Batch Translation Commands

### `npm run i18n:batch`
Processes pending translations from the queue:
- Fetches pending items from `translation_queue` table
- Calls AI translation service via edge function
- Updates translations in the database
- Reports success/failure statistics

### `npm run i18n:queue-status`
Shows translation system health in CLI:
- Queue statistics (pending/completed/failed)
- Language coverage metrics
- Recent activity log
- System health indicators
- Actionable recommendations

## CI/CD Integration

- **Pre-commit**: `validate-i18n.sh` prevents broken translations
- **Pre-build**: `i18n:check` validates translation health
- **Runtime**: Auto-translate system handles missing keys in real-time
- **Monitoring**: Translation Health Dashboard provides oversight