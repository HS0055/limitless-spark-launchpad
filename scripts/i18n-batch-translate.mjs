#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mbwieeegglyprxoncckdj.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔄 Triggering batch translation of missing keys...');

try {
  const response = await fetch(`${supabaseUrl}/functions/v1/batch-translate-missing`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const result = await response.json();
  console.log('✅ Batch translation result:', result);
  
  if (result.success) {
    console.log(`🎉 Successfully processed ${result.processed} translations`);
    if (result.failed > 0) {
      console.warn(`⚠️  ${result.failed} translations failed`);
    }
  } else {
    console.error('❌ Batch translation failed:', result.error);
    process.exit(1);
  }
  
} catch (error) {
  console.error('❌ Failed to trigger batch translation:', error.message);
  process.exit(1);
}