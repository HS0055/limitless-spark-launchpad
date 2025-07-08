#!/bin/bash

# Comprehensive i18n validation script
set -e

echo "🔍 Running comprehensive i18n validation..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_LANG="en"
SUPPORTED_LANGS=("hy" "ru" "es" "fr" "de" "zh" "ja" "ko" "ar" "pt" "it" "nl" "pl" "tr" "hi" "th" "vi" "sv" "da" "no" "fi" "he" "id" "ms" "uk" "cs" "sk" "ro" "bg" "hr" "sr" "sl" "et" "lv" "lt" "hu" "mt" "ga" "cy" "is" "mk" "sq" "eu" "ca" "gl" "sw" "zu" "af" "bn" "gu" "kn" "ml" "mr" "pa" "ta" "te" "ur")
NAMESPACES=("common" "nav" "hero" "features" "pricing" "footer" "demo")

# Error counters
JSON_ERRORS=0
MISSING_KEYS=0
EMPTY_VALUES=0
TOTAL_CHECKS=0

echo -e "${BLUE}📋 Validation Configuration:${NC}"
echo "  Base language: $BASE_LANG"
echo "  Supported languages: ${#SUPPORTED_LANGS[@]}"
echo "  Namespaces: ${NAMESPACES[*]}"
echo ""

# Function to validate JSON syntax
validate_json() {
  local file="$1"
  if [ -f "$file" ]; then
    if ! jq empty "$file" 2>/dev/null; then
      echo -e "${RED}❌ JSON syntax error in $file${NC}"
      JSON_ERRORS=$((JSON_ERRORS + 1))
      return 1
    fi
  fi
  return 0
}

# Function to check missing keys
check_missing_keys() {
  local base_file="$1"
  local target_file="$2"
  local lang="$3"
  local namespace="$4"
  
  if [ -f "$base_file" ] && [ -f "$target_file" ]; then
    base_keys=$(jq -r 'paths(scalars) as $p | $p | join(".")' "$base_file" 2>/dev/null | sort)
    target_keys=$(jq -r 'paths(scalars) as $p | $p | join(".")' "$target_file" 2>/dev/null | sort)
    
    missing=$(comm -23 <(echo "$base_keys") <(echo "$target_keys"))
    if [ ! -z "$missing" ]; then
      echo -e "${YELLOW}⚠️  Missing keys in $lang/$namespace.json:${NC}"
      echo "$missing" | sed 's/^/    /'
      MISSING_KEYS=$((MISSING_KEYS + 1))
    fi
  fi
}

# Function to check empty values
check_empty_values() {
  local file="$1"
  local lang="$2"
  local namespace="$3"
  
  if [ -f "$file" ]; then
    empty_keys=$(jq -r 'paths(scalars) as $p | select(getpath($p) == "" or getpath($p) == null) | $p | join(".")' "$file" 2>/dev/null)
    if [ ! -z "$empty_keys" ]; then
      echo -e "${YELLOW}⚠️  Empty values in $lang/$namespace.json:${NC}"
      echo "$empty_keys" | sed 's/^/    /'
      EMPTY_VALUES=$((EMPTY_VALUES + 1))
    fi
  fi
}

# Main validation loop
echo -e "${BLUE}🔍 Validating JSON syntax...${NC}"
for namespace in "${NAMESPACES[@]}"; do
  for lang in "$BASE_LANG" "${SUPPORTED_LANGS[@]}"; do
    file="locales/$lang/$namespace.json"
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    if [ -f "$file" ]; then
      validate_json "$file"
    else
      echo -e "${YELLOW}⚠️  Missing file: $file${NC}"
    fi
  done
done

echo ""
echo -e "${BLUE}🔑 Checking for missing translation keys...${NC}"
for namespace in "${NAMESPACES[@]}"; do
  base_file="locales/$BASE_LANG/$namespace.json"
  
  if [ -f "$base_file" ]; then
    for lang in "${SUPPORTED_LANGS[@]}"; do
      target_file="locales/$lang/$namespace.json"
      check_missing_keys "$base_file" "$target_file" "$lang" "$namespace"
    done
  else
    echo -e "${YELLOW}⚠️  Base file missing: $base_file${NC}"
  fi
done

echo ""
echo -e "${BLUE}📝 Checking for empty values...${NC}"
for namespace in "${NAMESPACES[@]}"; do
  for lang in "$BASE_LANG" "${SUPPORTED_LANGS[@]}"; do
    file="locales/$lang/$namespace.json"
    check_empty_values "$file" "$lang" "$namespace"
  done
done

# String detection in source code
echo ""
echo -e "${BLUE}🔍 Scanning source code for untranslated strings...${NC}"

# Look for hardcoded English strings in components
untranslated_strings=$(grep -r --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" \
  -E "(>|=|:|\s+)['\"][A-Z][a-zA-Z\s]{3,}['\"]" src/ | \
  grep -v "data-i18n\|translate\|LocalizedText\|\.t(" | \
  grep -v "console\|import\|export\|interface\|type\|className" | \
  head -10) || true

if [ ! -z "$untranslated_strings" ]; then
  echo -e "${YELLOW}⚠️  Potential untranslated strings found:${NC}"
  echo "$untranslated_strings" | sed 's/^/    /'
fi

# RTL language checks
echo ""
echo -e "${BLUE}🔄 Checking RTL language support...${NC}"
rtl_langs=("ar" "he" "ur")
for lang in "${rtl_langs[@]}"; do
  if [[ " ${SUPPORTED_LANGS[@]} " =~ " ${lang} " ]]; then
    echo -e "${GREEN}✅ RTL language $lang is supported${NC}"
  else
    echo -e "${YELLOW}⚠️  RTL language $lang not in supported list${NC}"
  fi
done

# Performance check - file sizes
echo ""
echo -e "${BLUE}📊 Translation file size analysis...${NC}"
total_size=0
for namespace in "${NAMESPACES[@]}"; do
  for lang in "$BASE_LANG" "${SUPPORTED_LANGS[@]}"; do
    file="locales/$lang/$namespace.json"
    if [ -f "$file" ]; then
      size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
      total_size=$((total_size + size))
      if [ $size -gt 10240 ]; then  # Warn if file > 10KB
        echo -e "${YELLOW}⚠️  Large translation file: $file (${size} bytes)${NC}"
      fi
    fi
  done
done

echo "Total translation files size: $((total_size / 1024))KB"

# Summary
echo ""
echo -e "${BLUE}📋 Validation Summary:${NC}"
echo "  Total files checked: $TOTAL_CHECKS"
echo "  JSON syntax errors: $JSON_ERRORS"
echo "  Files with missing keys: $MISSING_KEYS"
echo "  Files with empty values: $EMPTY_VALUES"

# Exit with error if issues found
total_issues=$((JSON_ERRORS + MISSING_KEYS))
if [ $total_issues -gt 0 ]; then
  echo ""
  echo -e "${RED}❌ Validation failed with $total_issues critical issues${NC}"
  echo "Please fix the issues above before committing."
  exit 1
else
  echo ""
  echo -e "${GREEN}✅ All i18n validations passed!${NC}"
  exit 0
fi