#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs/promises';
import path from 'node:path';

const supabaseUrl = 'https://mbwieeegglyprxoncckdj.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔄 Starting batch translation process...');

try {
  // Get pending translations from queue
  const { data: queue, error: queueError } = await supabase
    .from('translation_queue')
    .select('*')
    .eq('status', 'pending')
    .limit(50);

  if (queueError) {
    throw new Error(`Failed to fetch queue: ${queueError.message}`);
  }

  if (!queue?.length) {
    console.log('✅ Translation queue is empty');
    process.exit(0);
  }

  console.log(`📋 Found ${queue.length} pending translations`);

  let processed = 0;
  let failed = 0;

  for (const row of queue) {
    try {
      console.log(`🔄 Processing: ${row.original_text} → ${row.target_language}`);

      // Call the batch-translate-missing edge function
      const { data, error } = await supabase.functions.invoke('batch-translate-missing', {
        body: { 
          queueItems: [row],
          maxTextsPerBatch: 1 
        }
      });

      if (error) {
        throw new Error(`Edge function error: ${error.message}`);
      }

      if (data?.success) {
        processed++;
        console.log(`✅ ${row.original_text} → ${row.target_language}`);
      } else {
        throw new Error(data?.error || 'Translation failed');
      }

    } catch (error) {
      failed++;
      console.error(`❌ Failed to translate "${row.original_text}": ${error.message}`);
      
      // Mark as failed in queue
      await supabase
        .from('translation_queue')
        .update({ 
          status: 'failed', 
          error_message: error.message,
          translated_at: new Date().toISOString()
        })
        .eq('id', row.id);
    }
  }

  console.log(`\n🎉 Batch translation complete!`);
  console.log(`✅ Processed: ${processed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${processed + failed}`);

} catch (error) {
  console.error('❌ Batch translation failed:', error.message);
  process.exit(1);
}