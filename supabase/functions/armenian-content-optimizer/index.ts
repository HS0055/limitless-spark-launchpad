import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, context, type = 'general' } = await req.json();

    if (!text) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Armenian content optimization for: ${type}`);

    // Specialized Armenian content optimization
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicApiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        temperature: 0.1,
        messages: [
          {
            role: 'user',
            content: `You are an expert Armenian language specialist and UI/UX consultant focusing on modern Eastern Armenian.

🎯 TASK: Optimize this English text for Armenian users, considering both language and cultural context.

📍 CONTENT TYPE: ${type}
🏗️ CONTEXT: ${context || 'educational platform'}
🌍 SOURCE TEXT: "${text}"

🔥 ARMENIAN OPTIMIZATION REQUIREMENTS:

✅ LANGUAGE EXCELLENCE:
- Use contemporary Eastern Armenian (not Western Armenian)
- Prefer modern, accessible vocabulary over archaic terms
- Ensure natural flow and rhythm in Armenian
- Use appropriate formality level for educational content
- Avoid literal translations - adapt for cultural context

✅ UI/UX CONSIDERATIONS:
- Consider that Armenian text is typically 15-25% longer than English
- Use concise phrasing for buttons and navigation
- Ensure clarity for non-native speakers who learned Armenian as second language
- Apply proper Armenian punctuation and typography rules

✅ CULTURAL ADAPTATION:
- Use expressions that resonate with Armenian culture
- Adapt metaphors and examples to be culturally relevant
- Consider Armenian educational traditions and learning styles
- Use encouraging, warm tone typical in Armenian educational settings

✅ CONTENT-SPECIFIC RULES:
${type === 'button' ? '- Keep button text concise (max 3-4 words)\n- Use action verbs that feel natural in Armenian\n- Prefer imperative mood for CTAs' :
  type === 'heading' ? '- Maintain impact and clarity\n- Use parallel structure for consistency\n- Consider Armenian word order preferences' :
  type === 'navigation' ? '- Use standard Armenian web terminology\n- Keep navigation terms short and clear\n- Ensure consistency across the interface' :
  '- Focus on clarity and engagement\n- Use appropriate paragraph structure\n- Maintain educational tone'}

🎯 DELIVER: Only the optimized Armenian text that will engage and convert Armenian users effectively.

Armenian Translation:`
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
    const optimizedText = data.content[0].text.trim();
    
    // Calculate quality score based on Armenian-specific criteria
    const qualityMetrics = {
      lengthRatio: optimizedText.length / text.length,
      hasArmenianChars: /[\u0530-\u058F]/.test(optimizedText),
      appropriateLength: optimizedText.length > 3 && optimizedText.length < 500,
      noEnglishChars: !/[a-zA-Z]/.test(optimizedText.replace(/TopOne|Academy|AI/g, ''))
    };
    
    const qualityScore = Object.values(qualityMetrics).filter(Boolean).length / Object.keys(qualityMetrics).length;

    console.log('Armenian optimization successful:', optimizedText);

    return new Response(
      JSON.stringify({ 
        optimizedText,
        originalText: text,
        context,
        type,
        qualityMetrics,
        qualityScore,
        language: 'hy'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in armenian-content-optimizer function:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to optimize Armenian content', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});