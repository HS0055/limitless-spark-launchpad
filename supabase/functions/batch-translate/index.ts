import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    
    // Log request details
    console.log('Request method:', req.method);
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));
    
    // Check API key first
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    console.log('ANTHROPIC_API_KEY present:', !!anthropicApiKey);
    console.log('ANTHROPIC_API_KEY length:', anthropicApiKey?.length || 0);
    
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
    
    const { texts, targetLang, context } = body;

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
    console.log('Sample texts:', texts.slice(0, 3));

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
    console.log(`Target language: ${targetLanguage}`);

    // Prepare simplified prompt
    const prompt = `Translate these texts to ${targetLanguage}. Keep HTML tags unchanged:

${texts.map((text, i) => `${i + 1}. ${text}`).join('\n')}

Return only the numbered translations.`;

    console.log('Prompt length:', prompt.length);
    console.log('Sending request to Claude API...');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicApiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        temperature: 0,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      }),
    });

    console.log(`Claude API response status: ${response.status}`);
    console.log(`Claude API response headers:`, Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Claude API error response:', errorText);
      
      // Try to parse as JSON for more details
      try {
        const errorJson = JSON.parse(errorText);
        console.error('❌ Claude API error details:', errorJson);
      } catch (e) {
        console.error('❌ Could not parse Claude error as JSON');
      }
      
      return new Response(
        JSON.stringify({ 
          error: 'Claude API error', 
          status: response.status,
          details: errorText.substring(0, 500) // Truncate for safety
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('Claude API response data:', data);

    if (!data.content || !data.content[0] || !data.content[0].text) {
      console.error('❌ Unexpected Claude API response structure:', data);
      return new Response(
        JSON.stringify({ error: 'Unexpected API response structure' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const translatedContent = data.content[0].text.trim();
    console.log('Claude translation result:', translatedContent);

    // Parse the numbered translations back into an object
    const translations: Record<string, string> = {};
    const lines = translatedContent.split('\n');
    
    lines.forEach((line, index) => {
      const match = line.match(/^\d+\.\s*(.*)$/);
      if (match && texts[index]) {
        translations[texts[index]] = match[1].trim();
        console.log(`Parsed: "${texts[index]}" → "${match[1].trim()}"`);
      }
    });

    // Fill in any missing translations with originals
    texts.forEach(text => {
      if (!translations[text]) {
        console.log(`Missing translation for "${text}", using original`);
        translations[text] = text;
      }
    });

    console.log(`✅ Batch translation completed: ${Object.keys(translations).length} texts`);

    return new Response(
      JSON.stringify({ 
        translations,
        targetLang,
        count: Object.keys(translations).length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ batch-translate error:', error);
    console.error('❌ Error stack:', error.stack);
    
    // Return detailed error information
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