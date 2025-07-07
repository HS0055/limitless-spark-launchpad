import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      content, 
      sourceLang, 
      targetLang, 
      context = '',
      translationType = 'standard' // standard, marketing, technical, cultural
    } = await req.json();

    if (!content || !sourceLang || !targetLang) {
      return new Response(
        JSON.stringify({ error: 'Content, source language, and target language are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Intelligent translation: ${sourceLang} → ${targetLang}, type: ${translationType}`);

    // First, analyze content with Perplexity for context
    const analysisResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: `Analyze this content for translation context. Identify key terms, cultural references, tone, and provide translation guidance for ${sourceLang} to ${targetLang}.`
          },
          {
            role: 'user',
            content: content
          }
        ],
        temperature: 0.1,
        max_tokens: 300,
        return_images: false,
        return_related_questions: false
      }),
    });

    let analysisResult = '';
    if (analysisResponse.ok) {
      const analysisData = await analysisResponse.json();
      analysisResult = analysisData.choices[0].message.content;
    }

    // Then, perform enhanced translation with GPT-4.1
    const languageNames = {
      'en': 'English',
      'hy': 'Armenian', 
      'ru': 'Russian'
    };

    const sourceLanguage = languageNames[sourceLang as keyof typeof languageNames] || sourceLang;
    const targetLanguage = languageNames[targetLang as keyof typeof languageNames] || targetLang;

    let systemPrompt = `You are an expert translator specializing in ${translationType} translation from ${sourceLanguage} to ${targetLanguage}.`;
    
    switch (translationType) {
      case 'marketing':
        systemPrompt += ' Focus on maintaining persuasive tone, cultural appeal, and brand voice. Adapt messaging for local market preferences.';
        break;
      case 'technical':
        systemPrompt += ' Maintain technical accuracy while ensuring clarity. Use appropriate technical terminology for the target language.';
        break;
      case 'cultural':
        systemPrompt += ' Adapt content for cultural nuances, idioms, and local customs. Ensure cultural appropriateness and relevance.';
        break;
      default:
        systemPrompt += ' Provide accurate, natural translation while preserving the original meaning and tone.';
    }

    systemPrompt += `\n\nContext analysis: ${analysisResult}\n\nAdditional context: ${context}`;

    const translationResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'o4-mini-2025-04-16',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: content
          }
        ],
        max_tokens: 2000,
        temperature: 0.2,
      }),
    });

    if (!translationResponse.ok) {
      const errorData = await translationResponse.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`Translation API error: ${translationResponse.status}`);
    }

    const translationData = await translationResponse.json();
    const translatedText = translationData.choices[0].message.content.trim();

    console.log('Intelligent translation successful');

    return new Response(
      JSON.stringify({ 
        translatedText,
        sourceLang,
        targetLang,
        translationType,
        analysis: analysisResult,
        confidence: 'high' // Could be enhanced with actual confidence scoring
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in intelligent-translate function:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to translate content', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});