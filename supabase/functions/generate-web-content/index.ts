import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    const { content, type, targetLanguage, tone } = await req.json();

    if (!content) {
      return new Response(
        JSON.stringify({ error: 'Content is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Generating ${type} content for:`, content.substring(0, 100));

    // Build system prompt based on generation type
    let systemPrompt = '';
    let userPrompt = '';

    switch (type) {
      case 'enhancement':
        systemPrompt = `You are an expert content writer specializing in improving web content. Your task is to enhance the provided content by making it more engaging, readable, and effective while maintaining the original message and intent. Use a ${tone || 'professional'} tone.`;
        userPrompt = `Please enhance the following content:\n\n${content}\n\nMake it more engaging and effective while preserving the core message.`;
        break;
        
      case 'structure':
        systemPrompt = 'You are an expert web developer and UX designer. Your task is to analyze content or HTML and provide structural improvements, better semantic markup, accessibility enhancements, and overall HTML best practices.';
        userPrompt = `Please analyze the following content/HTML and suggest structural improvements:\n\n${content}\n\nProvide specific HTML structure recommendations with explanations.`;
        break;
        
      case 'seo':
        systemPrompt = 'You are an SEO expert specializing in on-page optimization. Your task is to generate SEO-optimized content including meta descriptions, title tags, alt text, and keyword-rich content that improves search engine visibility.';
        userPrompt = `Please generate SEO-optimized content for:\n\n${content}\n\nInclude: meta description, title suggestions, keywords, and any SEO improvements.`;
        break;
        
      case 'translation':
        const languageNames: Record<string, string> = {
          es: 'Spanish', fr: 'French', de: 'German', it: 'Italian',
          pt: 'Portuguese', ru: 'Russian', ja: 'Japanese', ko: 'Korean', zh: 'Chinese'
        };
        const targetLangName = languageNames[targetLanguage] || targetLanguage;
        systemPrompt = `You are a professional translator specializing in web content localization. Translate content accurately while preserving meaning, context, and cultural relevance for the target audience. Use a ${tone || 'professional'} tone appropriate for ${targetLangName}.`;
        userPrompt = `Please translate the following content to ${targetLangName}:\n\n${content}\n\nEnsure the translation is culturally appropriate and maintains the original intent.`;
        break;
        
      default:
        systemPrompt = 'You are a helpful AI assistant specializing in web content optimization.';
        userPrompt = content;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 2000,
        temperature: type === 'translation' ? 0.3 : 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    console.log(`Generated ${type} content successfully`);

    return new Response(
      JSON.stringify({ 
        content: generatedContent,
        type,
        targetLanguage,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in generate-web-content function:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate content', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});