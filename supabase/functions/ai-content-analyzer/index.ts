import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, url, analysisType = 'translation_quality' } = await req.json();

    if (!content) {
      return new Response(
        JSON.stringify({ error: 'Content is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Analyzing content for: ${url}, type: ${analysisType}`);

    let systemPrompt = '';
    switch (analysisType) {
      case 'translation_quality':
        systemPrompt = 'Analyze this web content for translation readiness. Identify key phrases, technical terms, cultural references, and suggest translation priorities. Focus on user-facing text that needs localization.';
        break;
      case 'content_structure':
        systemPrompt = 'Analyze the content structure and organization. Identify main sections, headings, call-to-actions, and suggest improvements for better user experience across different languages.';
        break;
      case 'localization_strategy':
        systemPrompt = 'Provide localization strategy recommendations for this content. Consider cultural adaptation, regional preferences, and market-specific messaging approaches.';
        break;
      default:
        systemPrompt = 'Analyze this web content comprehensively for translation and localization purposes.';
    }

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
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
        temperature: 0.2,
        top_p: 0.9,
        max_tokens: 1000,
        return_images: false,
        return_related_questions: false,
        frequency_penalty: 1,
        presence_penalty: 0
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Perplexity API error:', errorData);
      throw new Error(`Perplexity API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    console.log('Content analysis successful');

    return new Response(
      JSON.stringify({ 
        analysis,
        analysisType,
        url,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in ai-content-analyzer function:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to analyze content', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});