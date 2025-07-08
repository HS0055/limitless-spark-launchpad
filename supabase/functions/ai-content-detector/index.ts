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
    const { htmlContent, pagePath = '/', targetLanguages = ['fr', 'de', 'es'] } = await req.json();

    if (!htmlContent) {
      throw new Error('HTML content is required');
    }

    // Use AI to intelligently detect translatable content
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
            content: `You are an expert at analyzing web content for internationalization.
            
            Analyze the provided HTML/text and extract all user-facing text that should be translated.
            
            INCLUDE:
            - Headings and titles
            - Body text and paragraphs
            - Button text and labels
            - Navigation items
            - Form labels and placeholders
            - Alt text for images
            - Meta descriptions and titles
            - Error messages and notifications
            - Call-to-action text
            - Marketing copy
            
            EXCLUDE:
            - Technical attributes (class names, IDs)
            - URLs and email addresses
            - Code snippets
            - Brand names (unless they have official translations)
            - Numbers and dates (unless part of translatable text)
            - HTML tags and attributes
            
            For each text found, provide:
            1. The exact text to translate
            2. Context (what type of content it is)
            3. Priority (high/medium/low based on user impact)
            4. Suggested translation note/context
            
            Return as JSON array: [{"text": "exact text", "context": "button label", "priority": "high", "note": "call-to-action button"}]`
          },
          {
            role: 'user',
            content: htmlContent
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      }),
    });

    if (!analysisResponse.ok) {
      throw new Error('Failed to analyze content with AI');
    }

    const analysisResult = await analysisResponse.json();
    let detectedTexts: any[] = [];
    
    try {
      detectedTexts = JSON.parse(analysisResult.choices[0].message.content);
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      throw new Error('Failed to parse content analysis');
    }

    // Check which texts are already translated
    const textsToCheck = detectedTexts.map(item => item.text);
    const { data: existingTranslations } = await supabase
      .from('website_translations')
      .select('original_text, target_language')
      .in('original_text', textsToCheck)
      .eq('page_path', pagePath)
      .eq('is_active', true);

    // Create a map of existing translations
    const translationMap = new Map();
    existingTranslations?.forEach(t => {
      if (!translationMap.has(t.original_text)) {
        translationMap.set(t.original_text, new Set());
      }
      translationMap.get(t.original_text).add(t.target_language);
    });

    // Identify missing translations
    const missingTranslations = [];
    const priorityWeights = { high: 3, medium: 2, low: 1 };

    for (const item of detectedTexts) {
      const existingLangs = translationMap.get(item.text) || new Set();
      const missingLangs = targetLanguages.filter(lang => !existingLangs.has(lang));
      
      if (missingLangs.length > 0) {
        missingTranslations.push({
          ...item,
          missingLanguages: missingLangs,
          weight: priorityWeights[item.priority] || 1
        });
      }
    }

    // Sort by priority and add to translation queue
    missingTranslations.sort((a, b) => b.weight - a.weight);

    // Auto-translate high priority items
    const highPriorityItems = missingTranslations
      .filter(item => item.priority === 'high')
      .slice(0, 10); // Limit to avoid overwhelming the system

    const autoTranslations = [];
    for (const item of highPriorityItems) {
      for (const targetLang of item.missingLanguages) {
        try {
          // Call our smart translate function
          const translateResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/ai-smart-translate`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              text: item.text,
              targetLanguage: targetLang,
              context: `${item.context} - ${item.note}`,
              pagePath
            }),
          });

          if (translateResponse.ok) {
            const result = await translateResponse.json();
            autoTranslations.push({
              original: item.text,
              translated: result.translatedText,
              language: targetLang,
              context: item.context
            });
          }
        } catch (e) {
          console.warn(`Failed to auto-translate "${item.text}" to ${targetLang}:`, e);
        }
      }
    }

    return new Response(JSON.stringify({
      detectedTexts: detectedTexts.length,
      missingTranslations: missingTranslations.length,
      autoTranslations: autoTranslations.length,
      analysis: {
        totalTexts: detectedTexts,
        missing: missingTranslations,
        autoGenerated: autoTranslations
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-content-detector:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});