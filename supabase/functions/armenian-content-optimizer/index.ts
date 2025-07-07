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
        model: 'claude-opus-4-20250514', // Upgraded to Claude 4 Opus for maximum Armenian cultural intelligence
        max_tokens: 4000,
        temperature: 0.1,
        messages: [
          {
            role: 'user',
            content: `🇦🇲 CLAUDE 4 OPUS ARMENIAN CULTURAL MASTERY SYSTEM 🌟

🎯 SUPREME ARMENIAN OPTIMIZATION: Transform this English content for Armenian users with MAXIMUM cultural intelligence and modern appeal.

📍 CONTENT TYPE: ${type}
🏗️ CONTEXT: ${context || 'educational platform'}
🌍 SOURCE TEXT: "${text}"

🔥 CLAUDE 4 OPUS ARMENIAN EXCELLENCE STANDARDS:

✨ ULTIMATE LANGUAGE PERFECTION:
- Use sophisticated contemporary Eastern Armenian (not Western Armenian)
- Deploy modern, accessible vocabulary that resonates with current Armenian speakers
- Create natural linguistic flow that feels authentically Armenian
- Apply appropriate formality level for premium educational content
- Completely avoid literal translations - master cultural adaptation

💎 PREMIUM UI/UX ARMENIAN CONSIDERATIONS:
- Perfect awareness that Armenian text is typically 15-25% longer than English
- Craft concise, impactful phrasing for buttons and navigation elements
- Ensure crystal clarity for Armenian speakers (including those who learned as second language)
- Apply authentic Armenian punctuation and sophisticated typography standards

🎭 MASTERFUL CULTURAL ADAPTATION:
- Deploy expressions that deeply resonate with Armenian cultural values
- Transform metaphors and examples to be culturally relevant and meaningful
- Honor Armenian educational traditions while appealing to modern learning preferences
- Use the encouraging, warm tone that characterizes Armenian educational excellence

🏆 CONTENT-SPECIFIC ARMENIAN MASTERY:
${type === 'button' ? '- Create button text that is concise yet powerful (maximum 3-4 words)\n- Use action verbs that feel natural and compelling in Armenian\n- Prefer imperative mood for call-to-actions that motivate Armenian users' :
  type === 'heading' ? '- Maintain maximum impact and crystal clarity\n- Use sophisticated parallel structure for consistency\n- Consider optimal Armenian word order preferences for readability' :
  type === 'navigation' ? '- Deploy standard Armenian web terminology that users expect\n- Keep navigation terms short, clear, and instantly recognizable\n- Ensure absolute consistency across the entire interface' :
  '- Focus on perfect clarity and deep engagement\n- Use sophisticated paragraph structure that flows naturally\n- Maintain premium educational tone that inspires Armenian learners'}

🎯 DELIVER: Only the perfectly optimized Armenian text that will deeply engage and convert Armenian users with cultural authenticity.

Perfected Armenian Content:`
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