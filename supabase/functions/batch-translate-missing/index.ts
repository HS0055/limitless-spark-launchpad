import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    console.log('🔄 Starting batch translation of missing keys...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openaiApiKey) {
      return new Response('OpenAI API key not configured', { 
        status: 500, 
        headers: corsHeaders 
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get pending translations
    const { data: pendingKeys, error: fetchError } = await supabase
      .from('translation_queue')
      .select('*')
      .eq('status', 'pending')
      .limit(50); // Process in batches of 50

    if (fetchError) {
      throw new Error(`Failed to fetch pending translations: ${fetchError.message}`);
    }

    if (!pendingKeys || pendingKeys.length === 0) {
      console.log('✅ No pending translations to process');
      return new Response('No pending translations', { 
        status: 200, 
        headers: corsHeaders 
      });
    }

    console.log(`📝 Processing ${pendingKeys.length} pending translations`);

    const languageNames = {
      de: 'German',
      ru: 'Russian', 
      es: 'Spanish',
      fr: 'French'
    };

    let processed = 0;
    let failed = 0;

    // Group by language for efficient processing
    const keysByLanguage = pendingKeys.reduce((acc, key) => {
      if (!acc[key.target_language]) {
        acc[key.target_language] = [];
      }
      acc[key.target_language].push(key);
      return acc;
    }, {} as Record<string, typeof pendingKeys>);

    for (const [lng, keys] of Object.entries(keysByLanguage)) {
      const targetLanguage = languageNames[lng as keyof typeof languageNames] || lng;
      console.log(`🌍 Translating ${keys.length} keys to ${targetLanguage}`);

      for (const keyItem of keys) {
        try {
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openaiApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                {
                  role: 'system',
                  content: `You are a professional translator. Translate the given text to ${targetLanguage}. Return only the translation, no quotes or explanations. Maintain the same tone and style.`
                },
                {
                  role: 'user',
                  content: keyItem.fallback_text || keyItem.original_text
                }
              ],
              temperature: 0.1,
              max_tokens: 200
            }),
          });

          if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status}`);
          }

          const data = await response.json();
          const translation = data.choices[0].message.content.trim();

          console.log(`   ✅ ${keyItem.original_text} → "${translation}"`);

          // Store the translation
          const { error: storeError } = await supabase
            .from('website_translations')
            .upsert({
              original_text: keyItem.original_text,
              translated_text: translation,
              target_language: lng,
              source_language: 'en',
              page_path: keyItem.page_path || '/',
              is_active: true
            }, {
              onConflict: 'original_text,target_language'
            });

          if (storeError) {
            throw new Error(`Failed to store translation: ${storeError.message}`);
          }

          // Mark as completed
          await supabase
            .from('translation_queue')
            .update({ 
              status: 'completed', 
              translated_at: new Date().toISOString() 
            })
            .eq('id', keyItem.id);

          processed++;

          // Rate limiting: 2 requests per second
          await new Promise(resolve => setTimeout(resolve, 500));

        } catch (error) {
          console.error(`   ❌ Failed to translate "${keyItem.original_text}":`, error.message);
          
          // Mark as failed
          await supabase
            .from('translation_queue')
            .update({ 
              status: 'failed',
              error_message: error.message,
              translated_at: new Date().toISOString()
            })
            .eq('id', keyItem.id);

          failed++;
        }
      }
    }

    const summary = `✅ Batch translation complete! Processed: ${processed}, Failed: ${failed}`;
    console.log(summary);

    return new Response(JSON.stringify({
      success: true,
      processed,
      failed,
      message: summary
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Batch translation error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});