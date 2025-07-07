import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');

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
    const { text, sourceLang, targetLang, detectOnly, context, visionMode, preferredModel } = await req.json();

    if (!text) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Multi-model language detection for higher accuracy
    if (detectOnly) {
      console.log('Multi-model language detection for:', text);
      
      const detectWithMultipleModels = async () => {
        const results = [];
        
        // Claude detection
        try {
          const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
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
              messages: [{
                role: 'user',
                content: `Language code only: 'en', 'hy', or 'ru' for: "${text}"`
              }]
            }),
          });
          
          if (claudeResponse.ok) {
            const claudeData = await claudeResponse.json();
            results.push(claudeData.content[0].text.trim().toLowerCase());
          }
        } catch (e) {
          console.log('Claude detection failed:', e);
        }

        // OpenAI detection as backup
        if (openaiApiKey) {
          try {
            const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${openaiApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'gpt-4o-mini',
                max_tokens: 5,
                temperature: 0,
                messages: [{
                  role: 'user',
                  content: `Return only language code: 'en', 'hy', or 'ru' for: "${text}"`
                }]
              }),
            });
            
            if (openaiResponse.ok) {
              const openaiData = await openaiResponse.json();
              results.push(openaiData.choices[0].message.content.trim().toLowerCase());
            }
          } catch (e) {
            console.log('OpenAI detection failed:', e);
          }
        }

        // Consensus or fallback
        const mostCommon = results.reduce((acc, lang) => {
          acc[lang] = (acc[lang] || 0) + 1;
          return acc;
        }, {});
        
        return Object.keys(mostCommon).reduce((a, b) => 
          mostCommon[a] > mostCommon[b] ? a : b
        ) || 'en';
      };

      const detectedLanguage = await detectWithMultipleModels();
      
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

    // Multi-model translation for better accuracy and speed
    const translateWithMultipleModels = async () => {
      const model = preferredModel || 'claude';
      
      if (model === 'openai' && openaiApiKey) {
        try {
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openaiApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              max_tokens: 2000,
              temperature: 0.1,
              messages: [{
                role: 'system',
                content: 'You are an expert translator. Translate precisely while maintaining context and cultural appropriateness.'
              }, {
                role: 'user',
                content: visionMode ? 
                  `Context: ${context || 'web content'}\nTranslate ${sourceLanguage} to ${targetLanguage}: "${text}"` :
                  `Translate from ${sourceLanguage} to ${targetLanguage}: "${text}"`
              }]
            }),
          });
          
          if (response.ok) {
            const data = await response.json();
            return data.choices[0].message.content.trim();
          }
        } catch (e) {
          console.log('OpenAI translation failed, fallback to Claude:', e);
        }
      }

      if (model === 'perplexity' && perplexityApiKey) {
        try {
          const response = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${perplexityApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'llama-3.1-sonar-small-128k-online',
              max_tokens: 1000,
              temperature: 0.1,
              messages: [{
                role: 'system',
                content: 'Expert translator with real-time context awareness.'
              }, {
                role: 'user',
                content: `Translate ${sourceLanguage} to ${targetLanguage}: "${text}"`
              }]
            }),
          });
          
          if (response.ok) {
            const data = await response.json();
            return data.choices[0].message.content.trim();
          }
        } catch (e) {
          console.log('Perplexity translation failed, fallback to Claude:', e);
        }
      }

      // Claude as primary/fallback
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
          temperature: 0.05,
          messages: [{
            role: 'user',
            content: visionMode ? 
              `Expert web translator. Context: ${context || 'web content'}
SOURCE: ${sourceLanguage} → TARGET: ${targetLanguage}
Translate with cultural awareness: "${text}"
Return ONLY the translation.` : 
              `Translate ${sourceLanguage} to ${targetLanguage}: "${text}"`
          }]
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Claude API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      return data.content[0].text.trim();
    };

    const translatedText = await translateWithMultipleModels();
    
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