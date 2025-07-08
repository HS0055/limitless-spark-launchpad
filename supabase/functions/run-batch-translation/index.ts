import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LANG_META = {
  fr: { name: 'French', role: 'SaaS copywriter', tone: 'formal vous', culture: 'European business context' },
  es: { name: 'Spanish', role: 'EdTech copywriter', tone: 'neutral tú', culture: 'Latin American market' },
  ru: { name: 'Russian', role: 'C-suite copywriter', tone: 'formal Вы', culture: 'Eastern European business' },
  hy: { name: 'Armenian', role: 'Business copywriter', tone: 'respectful', culture: 'Armenian business context' },
  de: { name: 'German', role: 'Technical copywriter', tone: 'formal Sie', culture: 'German precision and clarity' },
  it: { name: 'Italian', role: 'Marketing copywriter', tone: 'warm professional', culture: 'Mediterranean business style' },
  pt: { name: 'Portuguese', role: 'Digital copywriter', tone: 'friendly você', culture: 'Brazilian market' },
  ja: { name: 'Japanese', role: 'Business copywriter', tone: 'polite keigo', culture: 'Japanese business etiquette' },
  ko: { name: 'Korean', role: 'Tech copywriter', tone: 'respectful formal', culture: 'Korean business culture' },
  zh: { name: 'Chinese', role: 'Business copywriter', tone: 'professional', culture: 'Chinese business context' },
  ar: { name: 'Arabic', role: 'Business copywriter', tone: 'respectful formal', culture: 'Arabic business culture' },
  hi: { name: 'Hindi', role: 'Digital copywriter', tone: 'respectful professional', culture: 'Indian business context' }
};

function buildContextualPrompt(text: string, targetLang: string, namespace?: string): string {
  const langInfo = LANG_META[targetLang] || { 
    name: targetLang.toUpperCase(), 
    role: 'professional copywriter', 
    tone: 'professional', 
    culture: 'international business context' 
  };

  const contextualInstructions = namespace === 'marketing' 
    ? 'Use persuasive, engaging language that motivates action.'
    : namespace === 'nav' 
    ? 'Use concise, clear navigation terms.'
    : namespace === 'hero'
    ? 'Use inspiring, compelling language that captures attention.'
    : 'Use clear, professional business language.';

  return `You are a ${langInfo.role} specializing in ${langInfo.culture}.

Translate the following text from English to ${langInfo.name}:

GUIDELINES:
• Use ${langInfo.tone} tone throughout
• ${contextualInstructions}
• Preserve ALL placeholders exactly: {{variable}}, <tag></tag>, %s, etc.
• Maintain proper capitalization and punctuation
• Avoid anglicisms - use native expressions
• Consider cultural nuances for ${langInfo.culture}
• Keep the same emotional impact as the original

TEXT TO TRANSLATE:
"${text}"

Return ONLY the translation, no quotes or explanations.`;
}

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🔄 Starting manual batch translation...');

    // Get pending translations from queue
    const { data: queueItems, error: queueError } = await supabase
      .from('translation_queue')
      .select('*')
      .eq('status', 'pending')
      .limit(50);

    if (queueError) {
      throw new Error(`Failed to fetch queue: ${queueError.message}`);
    }

    if (!queueItems?.length) {
      return new Response(JSON.stringify({
        success: true,
        message: 'Translation queue is empty',
        processed: 0,
        failed: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`📋 Processing ${queueItems.length} pending translations`);

    let processed = 0;
    let failed = 0;

    for (const item of queueItems) {
      try {
        // Extract namespace from original_text if it contains a dot
        const namespace = item.original_text.includes('.') 
          ? item.original_text.split('.')[0] 
          : 'common';

        const contextualPrompt = buildContextualPrompt(
          item.fallback_text || item.original_text,
          item.target_language,
          namespace
        );

        console.log(`🔄 Translating: ${item.original_text} → ${item.target_language}`);

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'user', content: contextualPrompt }
            ],
            temperature: 0.3,
            max_tokens: 500
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        const translation = data.choices[0].message.content.trim();

        // Store the translation
        const { error: insertError } = await supabase
          .from('website_translations')
          .upsert({
            original_text: item.original_text,
            translated_text: translation,
            target_language: item.target_language,
            source_language: 'en',
            page_path: item.page_path || '/',
            is_active: true
          }, {
            onConflict: 'original_text,target_language,page_path'
          });

        if (insertError) {
          throw new Error(`Failed to store translation: ${insertError.message}`);
        }

        // Mark as completed in queue
        const { error: updateError } = await supabase
          .from('translation_queue')
          .update({ 
            status: 'completed', 
            translated_at: new Date().toISOString() 
          })
          .eq('id', item.id);

        if (updateError) {
          console.error('Failed to update queue status:', updateError);
        }

        processed++;
        console.log(`✅ ${item.original_text} → ${item.target_language}: "${translation}"`);

      } catch (error) {
        failed++;
        console.error(`❌ Failed to translate "${item.original_text}":`, error.message);
        
        // Mark as failed in queue
        await supabase
          .from('translation_queue')
          .update({ 
            status: 'failed', 
            error_message: error.message,
            translated_at: new Date().toISOString()
          })
          .eq('id', item.id);
      }
    }

    const result = {
      success: true,
      message: `Batch translation completed`,
      processed,
      failed,
      total: processed + failed
    };

    console.log(`🎉 Batch complete: ${processed} processed, ${failed} failed`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Batch translation error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});