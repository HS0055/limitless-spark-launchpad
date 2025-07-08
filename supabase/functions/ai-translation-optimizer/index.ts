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
    const { mode = 'analyze', language, limit = 20 } = await req.json();

    if (mode === 'analyze') {
      // Analyze existing translations for quality and consistency
      const { data: translations } = await supabase
        .from('website_translations')
        .select('*')
        .eq('target_language', language)
        .eq('is_active', true)
        .limit(limit);

      if (!translations || translations.length === 0) {
        return new Response(JSON.stringify({ 
          message: 'No translations found for analysis',
          improvements: []
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Use AI to analyze translation quality and suggest improvements
      const analysisPrompt = `Analyze these translations for a website interface from English to ${language}.
      
      Evaluate each translation for:
      1. Accuracy and correctness
      2. Cultural appropriateness
      3. Consistency with UI/UX terminology
      4. Natural flow and readability
      5. Brand tone alignment
      
      Provide specific improvement suggestions where needed.
      
      Translations to analyze:
      ${translations.map(t => `Original: "${t.original_text}" → Translation: "${t.translated_text}"`).join('\n')}
      
      Return JSON: {"improvements": [{"original": "text", "current": "translation", "suggested": "better translation", "reason": "explanation"}]}`;

      const analysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
              content: `You are a professional localization expert specializing in ${language} translations for web interfaces.`
            },
            {
              role: 'user',
              content: analysisPrompt
            }
          ],
          temperature: 0.1,
          max_tokens: 2000
        }),
      });

      if (!analysisResponse.ok) {
        throw new Error('Failed to analyze translations');
      }

      const result = await analysisResponse.json();
      const analysis = JSON.parse(result.choices[0].message.content);

      return new Response(JSON.stringify({
        analyzed: translations.length,
        language,
        ...analysis
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (mode === 'optimize') {
      // Auto-optimize translations by applying AI suggestions
      const { improvements } = await req.json();

      if (!improvements || !Array.isArray(improvements)) {
        throw new Error('Improvements array is required for optimization');
      }

      const optimized = [];
      for (const improvement of improvements) {
        try {
          const { data, error } = await supabase
            .from('website_translations')
            .update({ 
              translated_text: improvement.suggested,
              updated_at: new Date().toISOString()
            })
            .eq('original_text', improvement.original)
            .eq('target_language', language)
            .eq('is_active', true);

          if (!error) {
            optimized.push(improvement);
          }
        } catch (e) {
          console.warn('Failed to update translation:', e);
        }
      }

      return new Response(JSON.stringify({
        optimized: optimized.length,
        total: improvements.length,
        updated: optimized
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (mode === 'consistency-check') {
      // Check for terminology consistency across all translations
      const { data: allTranslations } = await supabase
        .from('website_translations')
        .select('*')
        .eq('target_language', language)
        .eq('is_active', true);

      const consistencyPrompt = `Analyze these ${language} translations for terminology consistency.
      
      Identify:
      1. Inconsistent translations for similar terms
      2. Brand/product names that should remain consistent
      3. Technical terms that need standardization
      4. UI elements that should use consistent language
      
      ${allTranslations?.map(t => `"${t.original_text}" → "${t.translated_text}"`).join('\n')}
      
      Return JSON: {"inconsistencies": [{"term": "English term", "variations": ["variation1", "variation2"], "recommended": "best translation"}]}`;

      const consistencyResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
              content: `You are a terminology consistency expert for ${language} localization.`
            },
            {
              role: 'user',
              content: consistencyPrompt
            }
          ],
          temperature: 0.1,
          max_tokens: 1500
        }),
      });

      if (!consistencyResponse.ok) {
        throw new Error('Failed to check consistency');
      }

      const result = await consistencyResponse.json();
      const consistency = JSON.parse(result.choices[0].message.content);

      return new Response(JSON.stringify({
        totalTranslations: allTranslations?.length || 0,
        language,
        ...consistency
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Invalid mode. Use: analyze, optimize, or consistency-check');

  } catch (error) {
    console.error('Error in ai-translation-optimizer:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});