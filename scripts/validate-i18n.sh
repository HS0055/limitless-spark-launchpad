#!/bin/bash

# Translation validation pre-commit hook
# Checks for empty strings and missing keys in translation files

echo "🔍 Validating translation files..."

# Check for empty strings in JSON files
EMPTY_STRINGS=$(find locales -name "*.json" -exec grep -l '""' {} \; 2>/dev/null)

if [ ! -z "$EMPTY_STRINGS" ]; then
  echo "❌ Found empty translation strings in:"
  echo "$EMPTY_STRINGS"
  echo ""
  echo "Please fill in all empty translation values before committing."
  exit 1
fi

# Check for malformed JSON
JSON_ERRORS=""
for file in $(find locales -name "*.json" 2>/dev/null); do
  if ! jq empty "$file" 2>/dev/null; then
    JSON_ERRORS="$JSON_ERRORS\n$file"
  fi
done

if [ ! -z "$JSON_ERRORS" ]; then
  echo "❌ Found malformed JSON files:"
  echo -e "$JSON_ERRORS"
  echo ""
  echo "Please fix JSON syntax errors before committing."
  exit 1
fi

# Check for missing translation keys across languages
BASE_LANG="en"
MISSING_KEYS=""

if [ -d "locales/$BASE_LANG" ]; then
  for base_file in locales/$BASE_LANG/*.json; do
    if [ -f "$base_file" ]; then
      filename=$(basename "$base_file")
      base_keys=$(jq -r 'paths(scalars) as $p | $p | join(".")' "$base_file" 2>/dev/null | sort)
      
      for lang_dir in locales/*/; do
        lang=$(basename "$lang_dir")
        if [ "$lang" != "$BASE_LANG" ]; then
          lang_file="$lang_dir$filename"
          if [ -f "$lang_file" ]; then
            lang_keys=$(jq -r 'paths(scalars) as $p | $p | join(".")' "$lang_file" 2>/dev/null | sort)
            missing=$(comm -23 <(echo "$base_keys") <(echo "$lang_keys"))
            if [ ! -z "$missing" ]; then
              MISSING_KEYS="$MISSING_KEYS\n$lang_file missing keys:\n$missing\n"
            fi
          fi
        fi
      done
    fi
  done
fi

if [ ! -z "$MISSING_KEYS" ]; then
  echo "⚠️  Found missing translation keys:"
  echo -e "$MISSING_KEYS"
  echo "Note: Missing keys will be auto-translated by the AI system."
fi

echo "✅ Translation validation passed!"
exit 0