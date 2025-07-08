#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mbwieeegglyprxoncckdj.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('📊 Translation Queue Status\n');

try {
  // Get queue statistics
  const { data: queueStats, error: queueError } = await supabase
    .from('translation_queue')
    .select('status, target_language, created_at');

  if (queueError) {
    throw new Error(`Failed to fetch queue stats: ${queueError.message}`);
  }

  // Get website translations statistics
  const { data: translationStats, error: translationError } = await supabase
    .from('website_translations')
    .select('target_language, created_at')
    .eq('is_active', true);

  if (translationError) {
    throw new Error(`Failed to fetch translation stats: ${translationError.message}`);
  }

  // Calculate queue status
  const pending = queueStats?.filter(item => item.status === 'pending').length || 0;
  const completed = queueStats?.filter(item => item.status === 'completed').length || 0;
  const failed = queueStats?.filter(item => item.status === 'failed').length || 0;
  
  // Calculate language coverage
  const activeLanguages = new Set(translationStats?.map(item => item.target_language) || []);
  const totalTranslations = translationStats?.length || 0;

  // Display results
  console.log('🔢 Queue Statistics:');
  console.log(`   ⏳ Pending:    ${pending}`);
  console.log(`   ✅ Completed:  ${completed}`);
  console.log(`   ❌ Failed:     ${failed}`);
  console.log(`   📊 Total:      ${pending + completed + failed}`);
  
  console.log('\n🌍 Translation Coverage:');
  console.log(`   🗣️  Languages:  ${activeLanguages.size}`);
  console.log(`   📝 Total Translations: ${totalTranslations}`);
  
  if (activeLanguages.size > 0) {
    console.log(`   🔤 Active Languages: ${Array.from(activeLanguages).join(', ')}`);
  }

  // Health indicators
  console.log('\n🏥 System Health:');
  console.log(`   ${pending === 0 ? '✅' : '⚠️ '} Queue Status: ${pending === 0 ? 'Empty (Good)' : `${pending} pending items`}`);
  console.log(`   ${failed === 0 ? '✅' : '❌'} Error Rate: ${failed === 0 ? 'No errors' : `${failed} failed translations`}`);
  console.log(`   ${activeLanguages.size >= 3 ? '✅' : '⚠️ '} Language Coverage: ${activeLanguages.size >= 3 ? 'Good' : 'Limited'}`);

  // Recent activity
  if (queueStats && queueStats.length > 0) {
    const recentItems = queueStats
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);
    
    console.log('\n🕒 Recent Queue Activity:');
    recentItems.forEach(item => {
      const time = new Date(item.created_at).toLocaleString();
      const status = item.status === 'pending' ? '⏳' : 
                    item.status === 'completed' ? '✅' : 
                    item.status === 'failed' ? '❌' : '❓';
      console.log(`   ${status} ${item.target_language} - ${time}`);
    });
  }

  // Recommendations
  console.log('\n💡 Recommendations:');
  if (pending > 10) {
    console.log('   🔄 Run: npm run i18n:batch (high queue backlog)');
  }
  if (failed > 0) {
    console.log('   🔍 Check: Translation Health Dashboard for error details');
  }
  if (activeLanguages.size < 3) {
    console.log('   🌍 Consider: Adding more target languages');
  }
  if (pending === 0 && failed === 0) {
    console.log('   🎉 Everything looks great! Translation system is healthy.');
  }

} catch (error) {
  console.error('❌ Failed to get queue status:', error.message);
  process.exit(1);
}