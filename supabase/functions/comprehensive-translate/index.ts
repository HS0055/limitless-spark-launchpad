import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ComprehensiveTranslationRequest {
  mode: 'intelligent-batch' | 'priority-queue' | 'real-time' | 'visual-scan';
  strings?: Array<{
    text: string;
    context: string;
    namespace: string;
    page_path: string;
    priority?: 'high' | 'medium' | 'low';
  }>;
  target_languages?: string[];
  max_batch_size?: number;
  quality_level?: 'high' | 'standard' | 'fast';
}

const LANGUAGE_METADATA = {
  'hy': { name: 'Armenian', role: 'Professional translator', tone: 'formal', direction: 'ltr' },
  'ru': { name: 'Russian', role: 'C-suite copywriter', tone: 'formal Вы', direction: 'ltr' },
  'es': { name: 'Spanish', role: 'EdTech copywriter', tone: 'neutral tú', direction: 'ltr' },
  'fr': { name: 'French', role: 'SaaS copywriter', tone: 'formal vous', direction: 'ltr' },
  'de': { name: 'German', role: 'Business translator', tone: 'formal Sie', direction: 'ltr' },
  'zh': { name: 'Chinese', role: 'Professional translator', tone: 'formal', direction: 'ltr' },
  'ja': { name: 'Japanese', role: 'Professional translator', tone: 'polite', direction: 'ltr' },
  'ko': { name: 'Korean', role: 'Professional translator', tone: 'formal', direction: 'ltr' },
  'ar': { name: 'Arabic', role: 'Professional translator', tone: 'formal', direction: 'rtl' },
  'pt': { name: 'Portuguese', role: 'Professional translator', tone: 'formal', direction: 'ltr' },
  'it': { name: 'Italian', role: 'Professional translator', tone: 'formal', direction: 'ltr' },
  'nl': { name: 'Dutch', role: 'Professional translator', tone: 'formal', direction: 'ltr' },
  'pl': { name: 'Polish', role: 'Professional translator', tone: 'formal', direction: 'ltr' },
  'tr': { name: 'Turkish', role: 'Professional translator', tone: 'formal', direction: 'ltr' },
  'hi': { name: 'Hindi', role: 'Professional translator', tone: 'formal', direction: 'ltr' },
  'th': { name: 'Thai', role: 'Professional translator', tone: 'formal', direction: 'ltr' },
  'vi': { name: 'Vietnamese', role: 'Professional translator', tone: 'formal', direction: 'ltr' },
  'sv': { name: 'Swedish', role: 'Professional translator', tone: 'formal', direction: 'ltr' },
  'da': { name: 'Danish', role: 'Professional translator', tone: 'formal', direction: 'ltr' },
  'no': { name: 'Norwegian', role: 'Professional translator', tone: 'formal', direction: 'ltr' },
  'fi': { name: 'Finnish', role: 'Professional translator', tone: 'formal', direction: 'ltr' },
  'he': { name: 'Hebrew', role: 'Professional translator', tone: 'formal', direction: 'rtl' },
  'id': { name: 'Indonesian', role: 'Professional translator', tone: 'formal', direction: 'ltr' },
  'ms': { name: 'Malay', role: 'Professional translator', tone: 'formal', direction: 'ltr' },
  'uk': { name: 'Ukrainian', role: 'Professional translator', tone: 'formal', direction: 'ltr' },
  'cs': { name: 'Czech', role: 'Professional translator', tone: 'formal', direction: 'ltr' },
  'sk': { name: 'Slovak', role: 'Professional translator', tone: 'formal', direction: 'ltr' },
  'ro': { name: 'Romanian', role: 'Professional translator', tone: 'formal', direction: 'ltr' },
  'bg': { name: 'Bulgarian', role: 'Professional translator', tone: 'formal', direction: 'ltr' },
  'hr': { name: 'Croatian', role: 'Professional translator', tone: 'formal', direction: 'ltr' },
  'sr': { name: 'Serbian', role: 'Professional translator', tone: 'formal', direction: 'ltr' },
  'sl': { name: 'Slovenian', role: 'Professional translator', tone: 'formal', direction: 'ltr' },
  'et': { name: 'Estonian', role: 'Professional translator', tone: 'formal', direction: 'ltr' },
  'lv': { name: 'Latvian', role: 'Professional translator', tone: 'formal', direction: 'ltr' },
  'lt': { name: 'Lithuanian', role: 'Professional translator', tone: 'formal', direction: 'ltr' },
  'hu': { name: 'Hungarian', role: 'Professional translator', tone: 'formal', direction: 'ltr' },
  'mt': { name: 'Maltese', role: 'Professional translator', tone: 'formal', direction: 'ltr' },
  'ga': { name: 'Irish', role: 'Professional translator', tone: 'formal', direction: 'ltr' },
  'cy': { name: 'Welsh', role: 'Professional translator', tone: 'formal', direction: 'ltr' },
  'is': { name: 'Icelandic', role: 'Professional translator', tone: 'formal', direction: 'ltr' },
  'mk': { name: 'Macedonian', role: 'Professional translator', tone: 'formal', direction: 'ltr' },
  'sq': { name: 'Albanian', role: 'Professional translator', tone: 'formal', direction: 'ltr' },
  'eu': { name: 'Basque', role: 'Professional translator', tone: 'formal', direction: 'ltr' },
  'ca': { name: 'Catalan', role: 'Professional translator', tone: 'formal', direction: 'ltr' },
  'gl': { name: 'Galician', role: 'Professional translator', tone: 'formal', direction: 'ltr' },
  'sw': { name: 'Swahili', role: 'Professional translator', tone: 'formal', direction: 'ltr' },
  'zu': { name: 'Zulu', role: 'Professional translator', tone: 'formal', direction: 'ltr' },
  'af': { name: 'Afrikaans', role: 'Professional translator', tone: 'formal', direction: 'ltr' },
  'bn': { name: 'Bengali', role: 'Professional translator', tone: 'formal', direction: 'ltr' },
  'gu': { name: 'Gujarati', role: 'Professional translator', tone: 'formal', direction: 'ltr' },
  'kn': { name: 'Kannada', role: 'Professional translator', tone: 'formal', direction: 'ltr' },
  'ml': { name: 'Malayalam', role: 'Professional translator', tone: 'formal', direction: 'ltr' },
  'mr': { name: 'Marathi', role: 'Professional translator', tone: 'formal', direction: 'ltr' },
  'pa': { name: 'Punjabi', role: 'Professional translator', tone: 'formal', direction: 'ltr' },
  'ta': { name: 'Tamil', role: 'Professional translator', tone: 'formal', direction: 'ltr' },
  'te': { name: 'Telugu', role: 'Professional translator', tone: 'formal', direction: 'ltr' },
  'ur': { name: 'Urdu', role: 'Professional translator', tone: 'formal', direction: 'rtl' }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const {
      mode = 'intelligent-batch',
      strings = [],
      target_languages = ['hy', 'ru', 'es', 'fr', 'de'],
      max_batch_size = 50,
      quality_level = 'standard'
    }: ComprehensiveTranslationRequest = body;

    console.log(`🎯 Comprehensive translation started: mode=${mode}, quality=${quality_level}`);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let processedCount = 0;
    let results: any[] = [];

    switch (mode) {
      case 'intelligent-batch':
        results = await processIntelligentBatch(supabase, target_languages, max_batch_size, quality_level);
        processedCount = results.length;
        break;

      case 'priority-queue':
        results = await processPriorityQueue(supabase, target_languages, max_batch_size, quality_level);
        processedCount = results.length;
        break;

      case 'real-time':
        if (strings.length > 0) {
          results = await processRealTimeTranslation(supabase, strings, target_languages, quality_level);
          processedCount = results.length;
        }
        break;

      case 'visual-scan':
        results = await processVisualScan(supabase, target_languages, quality_level);
        processedCount = results.length;
        break;

      default:
        throw new Error(`Unknown mode: ${mode}`);
    }

    return new Response(JSON.stringify({
      success: true,
      mode,
      processed: processedCount,
      results,
      quality_level
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Comprehensive translation error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function processIntelligentBatch(supabase: any, targetLanguages: string[], maxBatchSize: number, qualityLevel: string) {
  console.log('🧠 Processing intelligent batch...');
  
  // Get pending translations with priority scoring
  const { data: pendingTranslations } = await supabase
    .from('translation_queue')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(maxBatchSize);

  if (!pendingTranslations || pendingTranslations.length === 0) {
    console.log('📭 No pending translations found');
    return [];
  }

  const results = [];
  
  // Group by language for batch processing
  const languageGroups = targetLanguages.reduce((acc, lang) => {
    acc[lang] = pendingTranslations.filter(t => t.target_language === lang);
    return acc;
  }, {} as Record<string, any[]>);

  for (const [language, translations] of Object.entries(languageGroups)) {
    if (translations.length === 0) continue;

    console.log(`🔄 Processing ${translations.length} translations for ${language}`);

    for (const item of translations) {
      try {
        const translation = await translateWithContextualAI(
          item.original_text,
          language,
          item.page_path,
          qualityLevel,
          {
            namespace: item.namespace || 'common',
            context: item.context || 'general'
          }
        );

        // Store translation
        await supabase.from('website_translations').upsert({
          original_text: item.original_text,
          translated_text: translation,
          target_language: language,
          source_language: 'en',
          page_path: item.page_path || '/',
          is_active: true
        }, {
          onConflict: 'original_text,target_language,page_path'
        });

        // Mark as completed
        await supabase
          .from('translation_queue')
          .update({
            status: 'completed',
            translated_at: new Date().toISOString()
          })
          .eq('id', item.id);

        results.push({
          original: item.original_text,
          translated: translation,
          language,
          quality: qualityLevel
        });

        console.log(`✅ Translated (${language}): "${item.original_text}" → "${translation}"`);

      } catch (error) {
        console.error(`❌ Failed to translate: "${item.original_text}"`, error);

        await supabase
          .from('translation_queue')
          .update({
            status: 'failed',
            error_message: error.message
          })
          .eq('id', item.id);
      }
    }
  }

  return results;
}

async function processPriorityQueue(supabase: any, targetLanguages: string[], maxBatchSize: number, qualityLevel: string) {
  console.log('⚡ Processing priority queue...');
  
  // Get high-priority translations (short text, navigation, buttons)
  const { data: priorityTranslations } = await supabase
    .from('translation_queue')
    .select('*')
    .eq('status', 'pending')
    .or(`original_text.like.*nav.*,original_text.like.*button.*,original_text.like.*btn.*`)
    .limit(maxBatchSize);

  if (!priorityTranslations || priorityTranslations.length === 0) {
    return await processIntelligentBatch(supabase, targetLanguages, maxBatchSize, qualityLevel);
  }

  return await processBatchTranslations(supabase, priorityTranslations, targetLanguages, qualityLevel);
}

async function processRealTimeTranslation(supabase: any, strings: any[], targetLanguages: string[], qualityLevel: string) {
  console.log('⚡ Processing real-time translations...');
  
  const results = [];
  
  for (const item of strings) {
    for (const language of targetLanguages) {
      try {
        const translation = await translateWithContextualAI(
          item.text,
          language,
          item.page_path,
          qualityLevel,
          {
            namespace: item.namespace,
            context: item.context
          }
        );

        // Store immediately
        await supabase.from('website_translations').upsert({
          original_text: item.text,
          translated_text: translation,
          target_language: language,
          source_language: 'en',
          page_path: item.page_path,
          is_active: true
        }, {
          onConflict: 'original_text,target_language,page_path'
        });

        results.push({
          original: item.text,
          translated: translation,
          language,
          priority: item.priority || 'medium'
        });

      } catch (error) {
        console.error(`Real-time translation failed for "${item.text}":`, error);
      }
    }
  }

  return results;
}

async function processVisualScan(supabase: any, targetLanguages: string[], qualityLevel: string) {
  console.log('👁️ Processing visual scan results...');
  
  // This would integrate with Playwright results
  // For now, process any untranslated UI strings
  const { data: missingUIStrings } = await supabase
    .from('translation_queue')
    .select('*')
    .eq('status', 'pending')
    .or(`page_path.like.*nav*,page_path.like.*header*,page_path.like.*footer*`)
    .limit(100);

  if (!missingUIStrings || missingUIStrings.length === 0) {
    return [];
  }

  return await processBatchTranslations(supabase, missingUIStrings, targetLanguages, qualityLevel);
}

async function processBatchTranslations(supabase: any, translations: any[], targetLanguages: string[], qualityLevel: string) {
  const results = [];

  for (const item of translations) {
    if (!targetLanguages.includes(item.target_language)) continue;

    try {
      const translation = await translateWithContextualAI(
        item.original_text,
        item.target_language,
        item.page_path,
        qualityLevel,
        {
          namespace: item.namespace || 'common',
          context: item.context || 'general'
        }
      );

      await supabase.from('website_translations').upsert({
        original_text: item.original_text,
        translated_text: translation,
        target_language: item.target_language,
        source_language: 'en',
        page_path: item.page_path || '/',
        is_active: true
      }, {
        onConflict: 'original_text,target_language,page_path'
      });

      await supabase
        .from('translation_queue')
        .update({
          status: 'completed',
          translated_at: new Date().toISOString()
        })
        .eq('id', item.id);

      results.push({
        original: item.original_text,
        translated: translation,
        language: item.target_language
      });

    } catch (error) {
      console.error(`Batch translation failed:`, error);
      
      await supabase
        .from('translation_queue')
        .update({
          status: 'failed',
          error_message: error.message
        })
        .eq('id', item.id);
    }
  }

  return results;
}

async function translateWithContextualAI(
  text: string,
  targetLanguage: string,
  pagePath: string,
  qualityLevel: string,
  context: { namespace: string; context: string }
): Promise<string> {
  const langMeta = LANGUAGE_METADATA[targetLanguage as keyof typeof LANGUAGE_METADATA];
  if (!langMeta) {
    throw new Error(`Unsupported language: ${targetLanguage}`);
  }

  const model = qualityLevel === 'high' ? 'gpt-4o' : 'gpt-4o-mini';
  const temperature = qualityLevel === 'high' ? 0.1 : 0.2;

  const contextPrompt = buildContextualPrompt(text, targetLanguage, langMeta, context, pagePath);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: contextPrompt
        },
        {
          role: 'user',
          content: text
        }
      ],
      temperature,
      max_tokens: 500
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const result = await response.json();
  return result.choices[0].message.content.trim();
}

function buildContextualPrompt(
  text: string,
  targetLanguage: string,
  langMeta: any,
  context: { namespace: string; context: string },
  pagePath: string
): string {
  const namespaceInstructions = {
    'nav': 'This is navigation text. Use concise, action-oriented language. Keep menu items short and clear.',
    'hero': 'This is hero section content. Use compelling, persuasive language that captures attention.',
    'features': 'This is feature description text. Be clear and benefit-focused.',
    'pricing': 'This is pricing content. Use trustworthy, clear language that builds confidence.',
    'footer': 'This is footer content. Use formal, informational tone.',
    'common': 'This is general UI text. Use clear, user-friendly language.'
  };

  return `You are a ${langMeta.role} specializing in ${langMeta.name} translations for web applications.

LANGUAGE: ${langMeta.name}
TONE: ${langMeta.tone}
TEXT DIRECTION: ${langMeta.direction}
CONTEXT: ${context.namespace} (${context.context})
PAGE: ${pagePath}

INSTRUCTIONS:
1. ${namespaceInstructions[context.namespace as keyof typeof namespaceInstructions] || namespaceInstructions.common}
2. Maintain the exact meaning while adapting to ${langMeta.name} cultural context
3. Preserve any HTML tags, placeholders ({{variables}}), or special formatting
4. Use ${langMeta.tone} tone appropriate for ${context.namespace} content
5. Keep brand names unchanged unless they have official ${langMeta.name} versions
6. For UI elements, use conventional ${langMeta.name} terminology
7. Ensure natural word flow for ${langMeta.direction} text direction

Return only the translated text without explanations or quotes.`;
}