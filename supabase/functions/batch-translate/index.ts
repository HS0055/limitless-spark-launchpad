import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('▶️ /batch-translate called');
    
    // Initialize Supabase client with service role key for cache access
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing Supabase configuration');
      return new Response(
        JSON.stringify({ error: 'Supabase configuration missing' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check API key
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    console.log('ANTHROPIC_API_KEY present:', !!anthropicApiKey);
    
    if (!anthropicApiKey) {
      console.error('❌ ANTHROPIC_API_KEY is not set in environment');
      return new Response(
        JSON.stringify({ error: 'ANTHROPIC_API_KEY is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body = await req.json();
    console.log('▶️ /batch-translate payload:', body);
    
    const { texts, targetLang } = body as { texts: string[], targetLang: string };

    // Validate inputs
    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      console.error('❌ Invalid texts array:', texts);
      return new Response(
        JSON.stringify({ error: 'Texts array is required and must not be empty' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (typeof targetLang !== 'string' || !targetLang) {
      console.error('❌ Invalid targetLang:', targetLang);
      return new Response(
        JSON.stringify({ error: 'targetLang is required and must be a string' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📦 Processing ${texts.length} texts for translation to ${targetLang}`);

    // 1) Check cache for existing translations
    console.log('🔍 Checking translation cache...');
    const { data: existing, error: cacheError } = await supabase
      .from('translation_cache')
      .select('original, translated')
      .in('original', texts)
      .eq('target_lang', targetLang);

    if (cacheError) {
      console.error('❌ Cache lookup error:', cacheError);
      return new Response(
        JSON.stringify({ error: 'Failed to check translation cache' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build cache map
    const cacheMap: Record<string, string> = {};
    if (existing) {
      existing.forEach(row => {
        cacheMap[row.original] = row.translated;
      });
    }

    console.log(`💾 Found ${Object.keys(cacheMap).length} cached translations`);

    // 2) Determine which strings need AI translation
    const toTranslate = texts.filter(text => !cacheMap[text]);
    console.log(`🤖 Need to translate ${toTranslate.length} new texts`);

    let newTranslations: Record<string, string> = {};

    if (toTranslate.length > 0) {
      // 3) Call Claude only for missing strings
      const languageNames = {
        'en': 'English',
        'hy': 'Armenian', 
        'ru': 'Russian',
        'es': 'Spanish',
        'fr': 'French',
        'de': 'German',
        'zh': 'Chinese',
        'ja': 'Japanese',
        'ko': 'Korean',
        'ar': 'Arabic'
      };

      const targetLanguage = languageNames[targetLang as keyof typeof languageNames] || targetLang;
      console.log(`🌐 Translating to: ${targetLanguage}`);

      const prompt = `You are an expert copywriter and translator specializing in marketing and business content. Translate the following texts from English to ${targetLanguage} with professional copywriting skills.

TRANSLATION GUIDELINES:
- Maintain the emotional impact and persuasive power of the original
- Use natural, native-sounding language that locals would use
- Adapt cultural references and idioms appropriately
- Keep the marketing tone and call-to-action strength
- For business terms, use industry-standard translations
- Preserve brand voice and personality
- Make it sound compelling and engaging, not robotic
- Preserve HTML tags exactly as they are

SPECIFIC INSTRUCTIONS:
- Headlines: Make them punchy and attention-grabbing
- Button text: Keep urgency and action-oriented language
- Value propositions: Maintain benefit-focused messaging
- Testimonials: Keep authentic and relatable tone
- Technical terms: Use accepted industry terminology
- Numbers and metrics: Adapt currency/measurement formats if needed

Texts to translate:
${toTranslate.map((text, i) => `${i + 1}. ${text}`).join('\n')}

Return only numbered translations (1., 2., 3., etc.) with the professionally translated and copywritten versions.`;

      console.log('📤 Sending request to Claude API...');

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': anthropicApiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-haiku-20241022', // Faster, cheaper model
          max_tokens: 1500, // Reduced for cost savings
          temperature: 0,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Claude API error:', errorText);
        return new Response(
          JSON.stringify({ 
            error: 'Claude API error', 
            status: response.status,
            details: errorText.substring(0, 500)
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const data = await response.json();
      
      if (!data.content || !data.content[0] || !data.content[0].text) {
        console.error('❌ Unexpected Claude API response structure:', data);
        return new Response(
          JSON.stringify({ error: 'Unexpected API response structure' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const translatedContent = data.content[0].text.trim();
      console.log('📥 Claude response received');

      // Parse translations
      const lines = translatedContent.split('\n');
      lines.forEach((line, index) => {
        const match = line.match(/^\d+\.\s*(.*)$/);
        if (match && toTranslate[index]) {
          newTranslations[toTranslate[index]] = match[1].trim();
        }
      });

      // Fill in any missing with originals
      toTranslate.forEach(text => {
        if (!newTranslations[text]) {
          newTranslations[text] = text;
        }
      });

      // 4) Store new translations in cache
      if (Object.keys(newTranslations).length > 0) {
        console.log('💾 Storing new translations in cache...');
        const upserts = Object.entries(newTranslations).map(([original, translated]) => ({
          original,
          target_lang: targetLang,
          translated
        }));

        const { error: upsertError } = await supabase
          .from('translation_cache')
          .upsert(upserts, { onConflict: 'original,target_lang' });

        if (upsertError) {
          console.error('❌ Failed to cache translations:', upsertError);
          // Continue anyway - we still have the translations
        } else {
          console.log(`✅ Cached ${Object.keys(newTranslations).length} new translations`);
        }
      }
    }

    // 5) Merge cache + new translations
    const allTranslations = { ...cacheMap, ...newTranslations };
    
    console.log(`✅ Translation completed: ${Object.keys(allTranslations).length} total translations`);

    return new Response(
      JSON.stringify({ 
        translations: allTranslations,
        targetLang,
        count: Object.keys(allTranslations).length,
        cached: Object.keys(cacheMap).length,
        new: Object.keys(newTranslations).length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ batch-translate error:', error);
    console.error('❌ Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to translate texts', 
        details: error.message,
        type: error.constructor.name
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});