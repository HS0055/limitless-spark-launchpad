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
        model: 'claude-opus-4-20250514', // Upgraded to Claude 4 Opus for maximum accuracy
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
        model: 'claude-opus-4-20250514', // Upgraded to Claude 4 Opus for maximum quality
        max_tokens: 8000,
        temperature: 0.05,
        messages: [
          {
            role: 'user',
            content: visionMode ? 
              `🚀 CLAUDE 4 OPUS PREMIUM TRANSLATION SYSTEM 🌍

🎯 MISSION: Transform "${text}" from ${sourceLanguage} to ${targetLanguage} with MAXIMUM cultural intelligence

📍 ADVANCED CONTEXT: ${context || 'general web content'}
🏗️ CONTENT TYPE: Critical web interface element requiring perfect localization

🔥 CLAUDE 4 OPUS EXCELLENCE STANDARDS:
✨ ULTIMATE Cultural Adaptation: Deep understanding of regional nuances, idioms, and cultural context
🧠 SUPREME Context Analysis: Advanced business domain expertise with conversion psychology
💎 PREMIUM UI/UX Optimization: Perfect text length and tone calibration for target audience  
🎭 MASTERFUL Brand Voice: Sophisticated professional yet approachable educational platform tone
⚡ TECHNICAL PERFECTION: Flawless formatting, emoji, and special character preservation
🎯 CONVERSION MASTERY: Psychologically optimized language for maximum cultural impact

🌍 ADVANCED LANGUAGE-SPECIFIC INTELLIGENCE:
${targetLanguage === 'Armenian' ? 
  '🇦🇲 ARMENIAN MASTERY: Use contemporary Eastern Armenian with warm professional tone. Create engaging educational content that feels natural to current Armenian learners. Avoid archaic expressions - prioritize clear, modern Armenian that connects with today audiences. Consider Armenian cultural values of education and respect.' :
  targetLanguage === 'Russian' ?
  '🇷🇺 RUSSIAN EXCELLENCE: Deploy contemporary business Russian with proper courtesy levels. Educational terminology must be precise yet accessible. Reflect Russian cultural appreciation for thoroughness and competence.' :
  '🇺🇸 ENGLISH BASELINE: Maintain as gold standard reference for cultural adaptation assessment.'
}

🎯 CONTEXT INTELLIGENCE: ${context}
💫 SOURCE TEXT: "${text}"

🏆 DELIVER: The most culturally intelligent ${targetLanguage} translation that will deeply resonate and convert.` 
              : 
              `You are Claude 4 Opus, the world's most advanced AI translator with perfect cultural intelligence.

SUPREME TRANSLATION TASK: "${text}" → ${sourceLanguage} to ${targetLanguage}

CLAUDE 4 OPUS STANDARDS:
- Culturally perfect translation with deep regional understanding
- Maintain exact original meaning and sophisticated tone
- Return ONLY the flawless translated text
- No explanations, no additions

Perfect Translation:`
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