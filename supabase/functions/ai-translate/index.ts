import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    const { text, sourceLang, targetLang, detectOnly } = await req.json();

    if (!text) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Language detection mode
    if (detectOnly) {
      console.log('Detecting language for:', text);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4.1-2025-04-14',
          messages: [
            {
              role: 'system',
              content: `You are a language detection expert. Analyze the given text and determine its language. 
              Return ONLY the language code from these options: 'en' for English, 'hy' for Armenian, 'ru' for Russian.
              If the language is not one of these three, return the closest match or 'en' as default.
              Return only the language code, nothing else.`
            },
            {
              role: 'user',
              content: text
            }
          ],
          max_tokens: 10,
          temperature: 0.1,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API error:', errorData);
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const detectedLanguage = data.choices[0].message.content.trim().toLowerCase();
      
      console.log('Language detected:', detectedLanguage);

      return new Response(
        JSON.stringify({ 
          detectedLanguage: detectedLanguage,
          originalText: text
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Translation mode
    if (!sourceLang || !targetLang) {
      return new Response(
        JSON.stringify({ error: 'Source language and target language are required for translation' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Translating from ${sourceLang} to ${targetLang}:`, text);

    const languageNames = {
      'en': 'English',
      'hy': 'Armenian', 
      'ru': 'Russian'
    };

    const sourceLanguage = languageNames[sourceLang as keyof typeof languageNames] || sourceLang;
    const targetLanguage = languageNames[targetLang as keyof typeof languageNames] || targetLang;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: `You are a professional translator. Translate the given text from ${sourceLanguage} to ${targetLanguage}. 
            Maintain the original meaning, tone, and context. For business or technical terms, use appropriate professional terminology.
            Only return the translated text, nothing else.`
          },
          {
            role: 'user',
            content: text
          }
        ],
        max_tokens: 2000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const translatedText = data.choices[0].message.content.trim();

    console.log('Translation successful:', translatedText);

    return new Response(
      JSON.stringify({ 
        translatedText,
        sourceLang,
        targetLang 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in ai-translate function:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to translate text', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});