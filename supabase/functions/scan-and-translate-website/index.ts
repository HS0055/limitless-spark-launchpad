import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Website pages to scan for content
const WEBSITE_PAGES = [
  '/',
  '/business-fundamentals', 
  '/dashboard',
  '/admin',
  '/community',
  '/settings',
  '/league',
  '/python-tools',
  '/meme-coins',
  '/visual-business',
  '/ai-tools'
];

// Languages to translate to
const TARGET_LANGUAGES = [
  'hy', // Armenian
  'ru', // Russian  
  'es', // Spanish
  'fr', // French
  'de', // German
  'zh', // Chinese
  'ja', // Japanese
  'ko', // Korean
  'ar'  // Arabic
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🌐 Website translation scan initiated');
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey || !anthropicApiKey) {
      console.error('❌ Missing configuration');
      return new Response(
        JSON.stringify({ error: 'Configuration missing' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Parse request body
    const body = await req.json();
    const { baseUrl, targetLanguages = TARGET_LANGUAGES, pages = WEBSITE_PAGES } = body;
    
    if (!baseUrl) {
      return new Response(
        JSON.stringify({ error: 'baseUrl is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📋 Scanning ${pages.length} pages for content`);
    
    // 1. Extract all text content from website pages
    const allTexts = new Set<string>();
    const pageContents: Record<string, string[]> = {};
    
    for (const page of pages) {
      try {
        console.log(`🔍 Scanning page: ${page}`);
        const pageUrl = `${baseUrl}${page}`;
        
        // Fetch page HTML
        const response = await fetch(pageUrl);
        if (!response.ok) {
          console.log(`⚠️ Could not fetch ${page}: ${response.status}`);
          continue;
        }
        
        const html = await response.text();
        
        // Extract text content using regex (basic implementation)
        // Remove script/style tags first
        const cleanHtml = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
        
        // Extract text from common elements
        const textRegex = /<(?:h[1-6]|p|span|div|button|label|title|alt|placeholder)[^>]*>([^<]+)</gi;
        const texts: string[] = [];
        let match;
        
        while ((match = textRegex.exec(cleanHtml)) !== null) {
          const text = match[1].trim();
          if (text && text.length > 2 && !text.match(/^[\d\s\-\(\)]+$/)) {
            texts.push(text);
            allTexts.add(text);
          }
        }
        
        // Also extract title and meta description
        const titleMatch = html.match(/<title[^>]*>([^<]+)</i);
        if (titleMatch) {
          texts.push(titleMatch[1].trim());
          allTexts.add(titleMatch[1].trim());
        }
        
        const metaDescMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i);
        if (metaDescMatch) {
          texts.push(metaDescMatch[1].trim());
          allTexts.add(metaDescMatch[1].trim());
        }
        
        pageContents[page] = texts;
        console.log(`📄 Extracted ${texts.length} text elements from ${page}`);
        
      } catch (error) {
        console.error(`❌ Error scanning page ${page}:`, error);
      }
    }
    
    const uniqueTexts = Array.from(allTexts);
    console.log(`📚 Total unique texts found: ${uniqueTexts.length}`);
    
    if (uniqueTexts.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No text content found on website' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // 2. Translate content to all target languages
    const translationResults: Record<string, any> = {};
    
    for (const targetLang of targetLanguages) {
      console.log(`🌍 Translating to ${targetLang}...`);
      
      try {
        // Use batch translate function
        const batchResponse = await fetch(`${baseUrl.replace(/\/$/, '')}/functions/v1/batch-translate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            texts: uniqueTexts,
            targetLang
          })
        });
        
        if (batchResponse.ok) {
          const batchResult = await batchResponse.json();
          translationResults[targetLang] = batchResult;
          console.log(`✅ ${targetLang}: ${batchResult.count} translations completed`);
        } else {
          console.error(`❌ Batch translation failed for ${targetLang}:`, await batchResponse.text());
        }
        
      } catch (error) {
        console.error(`❌ Translation error for ${targetLang}:`, error);
      }
    }
    
    // 3. Store website translation mappings
    const websiteTranslations = [];
    
    for (const [page, texts] of Object.entries(pageContents)) {
      for (const [lang, result] of Object.entries(translationResults)) {
        if (result.translations) {
          const pageTranslations = texts.map(text => ({
            page_path: page,
            original_text: text,
            translated_text: result.translations[text] || text,
            target_language: lang,
            source_language: 'en'
          }));
          
          websiteTranslations.push(...pageTranslations);
        }
      }
    }
    
    // Store in website_translations table (we'll create this)
    if (websiteTranslations.length > 0) {
      console.log(`💾 Storing ${websiteTranslations.length} website translations...`);
      
      const { error: storeError } = await supabase
        .from('website_translations')
        .upsert(websiteTranslations, { 
          onConflict: 'page_path,original_text,target_language' 
        });
      
      if (storeError) {
        console.error('❌ Failed to store website translations:', storeError);
        // Continue anyway
      } else {
        console.log('✅ Website translations stored successfully');
      }
    }
    
    // 4. Return comprehensive results
    const summary = {
      pages_scanned: pages.length,
      unique_texts_found: uniqueTexts.length,
      languages_translated: Object.keys(translationResults).length,
      total_translations: Object.values(translationResults).reduce((sum: number, result: any) => 
        sum + (result.count || 0), 0
      ),
      translations_stored: websiteTranslations.length,
      languages: Object.keys(translationResults),
      results: translationResults
    };
    
    console.log('🎉 Website translation scan completed:', summary);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Website translation scan completed',
        summary,
        translationResults
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ Website translation scan error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to scan and translate website', 
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});