import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');

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
    const { text, sourceLang, targetLang, detectOnly, context, visionMode } = await req.json();

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
      
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicApiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 10,
        temperature: 0,
        messages: [
          {
            role: 'user',
            content: `Analyze this text and return ONLY the 2-letter language code from these options: 'en' (English), 'hy' (Armenian), 'ru' (Russian).

Rules:
- Return ONLY the language code, nothing else
- Armenian uses Armenian script (Հայերեն)
- Russian uses Cyrillic script (Русский) 
- English uses Latin script
- For mixed content, identify the dominant language

Text: "${text}"`
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
    const detectedLanguage = data.content[0].text.trim().toLowerCase();
      
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
            content: visionMode ? 
              `You are a professional website translator specializing in ${sourceLanguage} to ${targetLanguage} translation with deep cultural understanding.

TRANSLATION CONTEXT: ${context || 'general web content'}
CONTENT TYPE: ${context.includes('navigation') ? 'Navigation element' : 
              context.includes('button') ? 'Interactive button' : 
              context.includes('heading') ? 'Content heading' : 
              context.includes('hero') ? 'Hero section content' : 
              context.includes('pricing') ? 'Pricing content' : 
              context.includes('footer') ? 'Footer content' : 
              context.includes('card') ? 'Card content' : 
              context.includes('menu') ? 'Menu item' : 'Web content'}

EXPERT TRANSLATION REQUIREMENTS:
1. CULTURAL ADAPTATION: Adapt expressions, idioms, and cultural references for ${targetLanguage} speakers
2. UI/UX OPTIMIZATION: Use terminology familiar to ${targetLanguage} web users
3. TONE PRESERVATION: Maintain the original tone while making it natural in ${targetLanguage}
4. CONTEXT AWARENESS: Consider the webpage context and user experience
5. LOCALIZATION: Use appropriate currency, dates, and cultural conventions
6. CONSISTENCY: Maintain brand voice and messaging consistency

SPECIFIC GUIDELINES:
- For navigation: Use standard web navigation terms in ${targetLanguage}
- For buttons/CTAs: Use action-oriented language that motivates ${targetLanguage} users
- For headings: Preserve impact and hierarchy while being culturally appropriate
- For marketing copy: Adapt persuasive language for ${targetLanguage} market
- For technical terms: Use established ${targetLanguage} terminology
- For pricing: Consider local purchasing psychology and terminology

QUALITY STANDARDS:
- Professional business translation quality
- Native-level fluency and naturalness
- Culturally appropriate and engaging
- SEO-friendly when applicable
- Maintains original formatting and structure

SOURCE TEXT: "${text}"

Provide ONLY the expertly translated text that fits perfectly in this web context:` 
              : 
              `You are a professional translator. Translate the following ${sourceLanguage} text to ${targetLanguage} with cultural adaptation and natural fluency.

Context: ${context || 'general content'}
Text: "${text}"

Provide ONLY the translated text:`
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Claude API error:', errorData);
      throw new Error(`Claude API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const translatedText = data.content[0].text.trim();
    
    // Calculate confidence score based on response quality indicators
    const confidence = Math.min(0.95, Math.max(0.75, 
      (translatedText.length / text.length > 0.5 && translatedText.length / text.length < 2.0) ? 0.9 : 0.8
    ));

    console.log('Translation successful:', translatedText);

    return new Response(
      JSON.stringify({ 
        translatedText,
        sourceLang,
        targetLang,
        confidence: visionMode ? confidence : null,
        visionAnalysis: visionMode ? context : null
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