import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// All supported languages
const ALL_LANGUAGES = [
  { code: 'hy', name: 'Armenian' },
  { code: 'ru', name: 'Russian' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ar', name: 'Arabic' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'it', name: 'Italian' },
  { code: 'nl', name: 'Dutch' },
  { code: 'pl', name: 'Polish' },
  { code: 'tr', name: 'Turkish' },
  { code: 'hi', name: 'Hindi' },
  { code: 'th', name: 'Thai' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'sv', name: 'Swedish' },
  { code: 'da', name: 'Danish' },
  { code: 'no', name: 'Norwegian' },
  { code: 'fi', name: 'Finnish' },
  { code: 'he', name: 'Hebrew' },
  { code: 'id', name: 'Indonesian' },
  { code: 'ms', name: 'Malay' },
  { code: 'uk', name: 'Ukrainian' },
  { code: 'cs', name: 'Czech' },
  { code: 'sk', name: 'Slovak' },
  { code: 'ro', name: 'Romanian' },
  { code: 'bg', name: 'Bulgarian' },
  { code: 'hr', name: 'Croatian' },
  { code: 'sr', name: 'Serbian' },
  { code: 'sl', name: 'Slovenian' },
  { code: 'et', name: 'Estonian' },
  { code: 'lv', name: 'Latvian' },
  { code: 'lt', name: 'Lithuanian' },
  { code: 'hu', name: 'Hungarian' },
  { code: 'mt', name: 'Maltese' },
  { code: 'ga', name: 'Irish' },
  { code: 'cy', name: 'Welsh' },
  { code: 'is', name: 'Icelandic' },
  { code: 'mk', name: 'Macedonian' },
  { code: 'sq', name: 'Albanian' },
  { code: 'eu', name: 'Basque' },
  { code: 'ca', name: 'Catalan' },
  { code: 'gl', name: 'Galician' },
  { code: 'sw', name: 'Swahili' },
  { code: 'zu', name: 'Zulu' },
  { code: 'af', name: 'Afrikaans' },
  { code: 'bn', name: 'Bengali' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'mr', name: 'Marathi' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'ur', name: 'Urdu' }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mode = 'continuous-monitor', maxTextsPerBatch = 50, targetLanguages = null } = await req.json();

    console.log(`🔍 Auto-translate started: mode=${mode}`);

    if (mode === 'continuous-monitor') {
      // Continuous background translation service
      const languagesToProcess = targetLanguages || ALL_LANGUAGES.map(l => l.code);
      
      // Check for pending translations in queue
      const { data: pendingTranslations } = await supabase
        .from('translation_queue')
        .select('*')
        .eq('status', 'pending')
        .limit(maxTextsPerBatch);

      if (pendingTranslations && pendingTranslations.length > 0) {
        console.log(`🔄 Processing ${pendingTranslations.length} queued translations`);
        
        for (const item of pendingTranslations) {
          try {
            const translation = await translateWithAI(item.original_text, item.target_language, item.page_path);
            
            // Store translation
            await supabase.from('website_translations').upsert({
              original_text: item.original_text,
              translated_text: translation,
              target_language: item.target_language,
              source_language: 'en',
              page_path: item.page_path,
              is_active: true
            }, {
              onConflict: 'original_text,target_language,page_path'
            });

            // Mark as completed
            await supabase
              .from('translation_queue')
              .update({ 
                status: 'completed', 
                translated_at: new Date().toISOString() 
              })
              .eq('id', item.id);

            console.log(`✅ Translated: "${item.original_text}" to ${item.target_language}`);
            
          } catch (error) {
            console.error(`❌ Failed to translate: "${item.original_text}"`, error);
            
            await supabase
              .from('translation_queue')
              .update({ 
                status: 'failed', 
                error_message: error.message 
              })
              .eq('id', item.id);
          }
        }
      }

      return new Response(JSON.stringify({
        success: true,
        mode: 'continuous-monitor',
        processed: pendingTranslations?.length || 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Invalid mode. Use: continuous-monitor');

  } catch (error) {
    console.error('❌ Auto-translate error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function translateWithAI(text: string, targetLanguage: string, pagePath: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a professional translator specializing in web content and user interfaces.
          
          Rules:
          1. Translate accurately while preserving the original meaning and tone
          2. Maintain formatting (HTML tags, special characters, emojis)
          3. Keep brand names and proper nouns unchanged unless they have official translations
          4. For UI elements, use conventional terminology for the target language
          5. Consider cultural context and localization preferences
          6. For marketing copy, maintain the emotional impact and call-to-action strength
          
          Target language: ${targetLanguage}
          Context: Web interface element
          
          Return only the translated text without explanations.`
        },
        {
          role: 'user',
          content: text
        }
      ],
      temperature: 0.1,
      max_tokens: 500
    }),
  });

  if (!response.ok) {
    throw new Error(`Translation API failed: ${response.statusText}`);
  }

  const result = await response.json();
  return result.choices[0].message.content.trim();
}