import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MissingKeyPayload {
  key: string;
  fallback: string;
  lng: string;
  page_path?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
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
    const payload: MissingKeyPayload = await req.json();
    const { key, fallback, lng, page_path } = payload;

    console.log(`[Missing Key] ${lng}:${key} = "${fallback}" on ${page_path || 'unknown'}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Store missing key for batch processing
    const { error: insertError } = await supabase
      .from('translation_queue')
      .upsert({
        target_language: lng,
        original_text: key,
        fallback_text: fallback,
        page_path: page_path || '/',
        status: 'pending',
        created_at: new Date().toISOString()
      }, {
        onConflict: 'target_language,original_text',
        ignoreDuplicates: true
      });

    if (insertError) {
      console.error('Failed to queue missing key:', insertError);
      return new Response('Failed to queue translation', { 
        status: 500, 
        headers: corsHeaders 
      });
    }

    // If this is a high-priority key (short text), translate immediately
    if (fallback.length <= 50) {
      await translateImmediately(key, fallback, lng, supabase);
    }

    return new Response('Queued for translation', { 
      status: 202,
      headers: corsHeaders 
    });

  } catch (error) {
    console.error('Translation queue error:', error);
    return new Response('Internal server error', { 
      status: 500, 
      headers: corsHeaders 
    });
  }
});

async function translateImmediately(
  key: string, 
  fallback: string, 
  lng: string, 
  supabase: any
) {
  try {
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      console.warn('No OpenAI API key available for immediate translation');
      return;
    }

    const languageNames = {
      de: 'German',
      ru: 'Russian',
      es: 'Spanish',
      fr: 'French'
    };

    const targetLanguage = languageNames[lng as keyof typeof languageNames] || lng;

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
            content: fallback
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

    console.log(`[Immediate Translation] ${lng}:${key} = "${translation}"`);

    // Store the translation
    const { error } = await supabase
      .from('website_translations')
      .upsert({
        original_text: key,
        translated_text: translation,
        target_language: lng,
        source_language: 'en',
        page_path: page_path || '/',
        is_active: true
      }, {
        onConflict: 'original_text,target_language'
      });

    if (error) {
      console.error('Failed to store immediate translation:', error);
    } else {
      // Mark as completed in queue
      await supabase
        .from('translation_queue')
        .update({ status: 'completed', translated_at: new Date().toISOString() })
        .eq('target_language', lng)
        .eq('original_text', key);
    }

  } catch (error) {
    console.error('Immediate translation failed:', error);
  }
}