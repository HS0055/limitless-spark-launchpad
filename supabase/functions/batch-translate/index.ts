import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { texts, targetLang, context } = await req.json();

    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Texts array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📦 Batch translating ${texts.length} texts to ${targetLang}`);

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

    // Prepare texts for batch translation
    const textsToTranslate = texts.map((text, index) => `${index + 1}. ${text}`).join('\n');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicApiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        temperature: 0.1,
        messages: [
          {
            role: 'user',
            content: `TASK: Auto-detect source language and translate the following numbered list of texts to ${targetLanguage}.

CRITICAL REQUIREMENTS:
- Auto-detect the source language of each text (could be English, Armenian, Russian, Spanish, French, German, Chinese, Japanese, Korean, Arabic, etc.)
- Translate each text into ${targetLanguage}
- Preserve ALL HTML tags exactly as they appear (including <strong>, <em>, <span>, etc.)
- Maintain the numbered format (1. 2. 3. etc.)
- Translate only the text content, not HTML attributes or tags
- Use culturally appropriate expressions for the target language
- For UI elements: use standard web terminology
- For buttons/CTAs: use action-oriented language
- Maintain consistent tone and style throughout

CONTEXT: ${context || 'Web application UI elements and content'}

TEXTS TO TRANSLATE:
${textsToTranslate}

RESPONSE FORMAT: Return only the numbered translations, preserving the exact format and HTML structure.`
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Claude API error:', errorData);
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    const translatedContent = data.content[0].text.trim();

    // Parse the numbered translations back into an object
    const translations: Record<string, string> = {};
    const lines = translatedContent.split('\n');
    
    lines.forEach((line, index) => {
      const match = line.match(/^\d+\.\s*(.*)$/);
      if (match && texts[index]) {
        translations[texts[index]] = match[1].trim();
      }
    });

    // Fill in any missing translations with originals
    texts.forEach(text => {
      if (!translations[text]) {
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
    console.error('Error in batch-translate function:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to translate texts', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});