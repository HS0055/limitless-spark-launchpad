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
        model: 'claude-sonnet-4-20250514',
        max_tokens: 15,
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
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8000,
        temperature: 0.05,
        messages: [
          {
            role: 'user',
            content: visionMode ? 
              `You are Claude 4, the most advanced AI translator specializing in culturally-aware website localization.

🎯 TRANSLATION MISSION: Transform "${text}" from ${sourceLanguage} to ${targetLanguage}

📍 CONTEXT INTELLIGENCE: ${context || 'general web content'}
🏗️ ELEMENT TYPE: High-priority web interface component

🔥 PREMIUM LOCALIZATION STANDARDS:
✅ Deep Cultural Adaptation: Use region-specific expressions, idioms, and communication styles
✅ Advanced Context Analysis: Understand business domain, user intent, and conversion goals  
✅ UI/UX Optimization: Adapt text length, tone, and formality for target audience
✅ Brand Voice Consistency: Maintain professional yet approachable educational platform tone
✅ Technical Precision: Preserve formatting, emojis, and special characters exactly
✅ Conversion-Focused: For CTAs/buttons, use psychologically compelling language for target culture

🌍 LANGUAGE-SPECIFIC GUIDELINES:
${targetLanguage === 'Armenian' ? 
  '🇦🇲 ARMENIAN: Use formal yet warm tone. Prefer contemporary Eastern Armenian vocabulary. Educational content should sound engaging and accessible. Avoid overly complex expressions - use clear, modern Armenian that resonates with today\\'s learners.' :
  targetLanguage === 'Russian' ?
  '🇷🇺 RUSSIAN: Use contemporary business Russian. Maintain professional courtesy. Educational terminology should be clear and modern.' :
  '🇺🇸 ENGLISH: Keep original text as baseline reference.'
}

📋 CONTEXT: ${context}
💬 SOURCE TEXT: "${text}"

🎯 DELIVER: Only the perfect ${targetLanguage} translation that will convert and engage users.` 
              : 
              `You are Claude 4, expert translator. Translate "${text}" from ${sourceLanguage} to ${targetLanguage}.

RULES:
- Natural, culturally appropriate translation
- Maintain original meaning and tone
- Return ONLY the translated text
- No explanations or additions

Translation:`
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