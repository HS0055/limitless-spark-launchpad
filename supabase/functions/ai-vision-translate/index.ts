import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TranslationRequest {
  text: string;
  sourceLang: string;
  targetLang: string;
  context?: string;
  screenshot?: string; // Base64 image data for vision context
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, sourceLang, targetLang, context, screenshot }: TranslationRequest = await req.json();

    if (!text || !targetLang) {
      throw new Error('Missing required fields: text, targetLang');
    }

    // Build messages for OpenAI with vision support
    const messages = [
      {
        role: 'system',
        content: `You are a professional translator with deep cultural understanding. Translate the given text from ${sourceLang} to ${targetLang}.

Context: ${context || 'General web content'}

Guidelines:
- Maintain the original tone and style
- Use natural, culturally appropriate expressions
- For UI elements, keep translations concise
- For business/marketing content, adapt to local market expectations
- Return ONLY the translated text, no explanations

If you see a screenshot, use it to understand the visual context for better translation accuracy.`
      }
    ];

    // Add vision content if screenshot is provided
    if (screenshot) {
      messages.push({
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Translate this text: "${text}"`
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/png;base64,${screenshot}`,
              detail: 'low' // Use low detail for faster processing
            }
          }
        ]
      });
    } else {
      messages.push({
        role: 'user',
        content: `Translate this text: "${text}"`
      });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Supports vision and is cost-effective
        messages,
        max_tokens: 500,
        temperature: 0.3 // Lower temperature for consistent translations
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    const translatedText = data.choices[0]?.message?.content?.trim();

    if (!translatedText) {
      throw new Error('No translation received from AI model');
    }

    return new Response(JSON.stringify({ 
      translatedText,
      sourceLang,
      targetLang,
      confidence: 0.95, // High confidence for GPT-4o-mini
      visionUsed: !!screenshot
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-vision-translate function:', error);
    return new Response(JSON.stringify({ 
      error: 'Translation failed',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});