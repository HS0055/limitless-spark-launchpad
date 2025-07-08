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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, targetLanguage, sourceLanguage = 'en', context = '', pagePath = '/' } = await req.json();

    if (!text || !targetLanguage) {
      throw new Error('Text and target language are required');
    }

    // Check if translation already exists
    const { data: existingTranslation } = await supabase
      .from('website_translations')
      .select('translated_text')
      .eq('original_text', text)
      .eq('target_language', targetLanguage)
      .eq('page_path', pagePath)
      .eq('is_active', true)
      .single();

    if (existingTranslation) {
      return new Response(JSON.stringify({ 
        translatedText: existingTranslation.translated_text,
        cached: true 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use AI for intelligent translation
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
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
            
            Context: ${context || 'General web content'}
            Source language: ${sourceLanguage}
            Target language: ${targetLanguage}
            
            Return only the translated text without explanations.`
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.1,
        max_tokens: 1000
      }),
    });

    if (!openAIResponse.ok) {
      throw new Error('Failed to translate with AI');
    }

    const aiResult = await openAIResponse.json();
    const translatedText = aiResult.choices[0].message.content.trim();

    // Store the translation in database
    await supabase
      .from('website_translations')
      .upsert({
        original_text: text,
        translated_text: translatedText,
        target_language: targetLanguage,
        source_language: sourceLanguage,
        page_path: pagePath,
        is_active: true
      });

    // Quality assessment using AI
    const qualityResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: `Assess the quality of this translation. Rate from 1-10 and provide brief feedback.
            Consider accuracy, fluency, cultural appropriateness, and tone preservation.
            
            Return a JSON object with: {"score": number, "feedback": "brief feedback"}`
          },
          {
            role: 'user',
            content: `Original (${sourceLanguage}): ${text}\nTranslation (${targetLanguage}): ${translatedText}`
          }
        ],
        temperature: 0.1,
        max_tokens: 200
      }),
    });

    let qualityAssessment = { score: 8, feedback: "AI-generated translation" };
    if (qualityResponse.ok) {
      try {
        const qualityResult = await qualityResponse.json();
        qualityAssessment = JSON.parse(qualityResult.choices[0].message.content);
      } catch (e) {
        console.warn('Failed to parse quality assessment:', e);
      }
    }

    return new Response(JSON.stringify({ 
      translatedText,
      cached: false,
      aiGenerated: true,
      quality: qualityAssessment
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-smart-translate:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});