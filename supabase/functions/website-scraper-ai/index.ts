import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// HTML content extraction function
function extractTextContent(html: string): { title: string; content: string; metadata: any } {
  // Simple HTML parsing - extract text content and basic metadata
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : '';
  
  // Remove script and style tags
  let cleanHtml = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  cleanHtml = cleanHtml.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // Extract text content from common content areas
  const contentSelectors = [
    /<main[^>]*>([\s\S]*?)<\/main>/gi,
    /<article[^>]*>([\s\S]*?)<\/article>/gi,
    /<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    /<section[^>]*>([\s\S]*?)<\/section>/gi,
    /<p[^>]*>([\s\S]*?)<\/p>/gi,
    /<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi
  ];
  
  let extractedContent = '';
  for (const selector of contentSelectors) {
    const matches = cleanHtml.match(selector);
    if (matches) {
      matches.forEach(match => {
        // Remove HTML tags and get text content
        const textContent = match.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        if (textContent.length > 10) { // Only include meaningful content
          extractedContent += textContent + '\n';
        }
      });
    }
  }
  
  // Extract meta description
  const metaDescMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i);
  const description = metaDescMatch ? metaDescMatch[1] : '';
  
  return {
    title,
    content: extractedContent.trim() || cleanHtml.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(),
    metadata: {
      description,
      contentLength: extractedContent.length,
      originalHtmlLength: html.length
    }
  };
}

// Create content hash for deduplication
function createContentHash(content: string): string {
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
}

// Extract translatable text segments
function extractTranslatableSegments(content: string): string[] {
  // Split content into sentences and meaningful chunks
  const segments = content
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 5 && s.length < 500) // Reasonable length for translation
    .filter(s => /[a-zA-Z]/.test(s)) // Contains letters
    .slice(0, 50); // Limit to first 50 segments to avoid overload
    
  return segments;
}

// Translate text using OpenAI
async function translateText(text: string, targetLanguage: string): Promise<string> {
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a professional translator. Translate the following text to ${targetLanguage}. Maintain the original meaning, tone, and style. Return only the translation, no explanations.`
        },
        {
          role: 'user',
          content: text
        }
      ],
      temperature: 0.1,
      max_tokens: 1000
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, url, targetLanguages = ['es', 'fr', 'de'], maxPages = 10 } = await req.json();

    if (action === 'scrape') {
      console.log(`Starting scrape job for: ${url}`);
      
      // Create scraping job
      const { data: job, error: jobError } = await supabase
        .from('scraping_jobs')
        .insert({
          url,
          status: 'processing',
          metadata: { targetLanguages, maxPages }
        })
        .select()
        .single();

      if (jobError) {
        throw new Error(`Failed to create scraping job: ${jobError.message}`);
      }

      console.log(`Created scraping job: ${job.id}`);

      // Start scraping process (background)
      EdgeRuntime.waitUntil(performScraping(job.id, url, targetLanguages, maxPages));

      return new Response(JSON.stringify({ 
        success: true, 
        jobId: job.id,
        message: 'Scraping job started'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'status') {
      const { jobId } = await req.json();
      
      const { data: job, error } = await supabase
        .from('scraping_jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (error) {
        throw new Error(`Failed to get job status: ${error.message}`);
      }

      return new Response(JSON.stringify({ success: true, job }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Invalid action specified');

  } catch (error) {
    console.error('Scraper error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function performScraping(jobId: string, baseUrl: string, targetLanguages: string[], maxPages: number) {
  try {
    console.log(`Starting scraping for job ${jobId}`);
    
    const urlsToScrape = [baseUrl]; // Start with base URL
    const scrapedUrls = new Set<string>();
    let pagesProcessed = 0;

    while (urlsToScrape.length > 0 && pagesProcessed < maxPages) {
      const currentUrl = urlsToScrape.shift()!;
      
      if (scrapedUrls.has(currentUrl)) continue;
      
      try {
        console.log(`Scraping: ${currentUrl}`);
        
        // Fetch the page
        const response = await fetch(currentUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; WebScraper/1.0)'
          }
        });

        if (!response.ok) {
          console.warn(`Failed to fetch ${currentUrl}: ${response.statusText}`);
          continue;
        }

        const html = await response.text();
        const { title, content, metadata } = extractTextContent(html);
        
        if (content.length < 50) {
          console.warn(`Skipping ${currentUrl}: content too short`);
          continue;
        }

        const contentHash = createContentHash(content);

        // Check for duplicate content
        const { data: existing } = await supabase
          .from('scraped_content')
          .select('id')
          .eq('content_hash', contentHash)
          .limit(1);

        if (existing && existing.length > 0) {
          console.log(`Skipping ${currentUrl}: duplicate content`);
          scrapedUrls.add(currentUrl);
          pagesProcessed++;
          continue;
        }

        // Store scraped content
        const { error: insertError } = await supabase
          .from('scraped_content')
          .insert({
            url: currentUrl,
            title,
            content,
            content_hash: contentHash,
            metadata
          });

        if (insertError) {
          console.error(`Failed to store content for ${currentUrl}:`, insertError);
          continue;
        }

        // Extract and translate content
        const segments = extractTranslatableSegments(content);
        console.log(`Extracted ${segments.length} translatable segments from ${currentUrl}`);

        // Translate to each target language
        for (const language of targetLanguages) {
          for (const segment of segments) {
            try {
              const translation = await translateText(segment, language);
              
              // Store translation
              await supabase
                .from('website_translations')
                .upsert({
                  original_text: segment.trim(),
                  translated_text: translation,
                  target_language: language,
                  page_path: new URL(currentUrl).pathname,
                  source_language: 'en',
                  is_active: true
                }, {
                  onConflict: 'original_text,target_language,page_path'
                });

              // Small delay to avoid rate limiting
              await new Promise(resolve => setTimeout(resolve, 100));
              
            } catch (translationError) {
              console.error(`Translation failed for segment in ${language}:`, translationError);
            }
          }
        }

        // Find more URLs to scrape (simple link discovery)
        const linkMatches = html.match(/<a[^>]*href="([^"]*)"[^>]*>/gi);
        if (linkMatches) {
          for (const linkMatch of linkMatches.slice(0, 5)) { // Limit links per page
            const hrefMatch = linkMatch.match(/href="([^"]*)"/);
            if (hrefMatch) {
              let href = hrefMatch[1];
              
              // Convert relative URLs to absolute
              if (href.startsWith('/')) {
                const baseUrlObj = new URL(baseUrl);
                href = `${baseUrlObj.origin}${href}`;
              } else if (!href.startsWith('http')) {
                continue; // Skip invalid URLs
              }

              // Only scrape same domain
              try {
                const linkUrl = new URL(href);
                const baseUrlObj = new URL(baseUrl);
                if (linkUrl.hostname === baseUrlObj.hostname && !scrapedUrls.has(href)) {
                  urlsToScrape.push(href);
                }
              } catch {
                // Invalid URL, skip
              }
            }
          }
        }

        scrapedUrls.add(currentUrl);
        pagesProcessed++;

        // Update job progress
        await supabase
          .from('scraping_jobs')
          .update({
            pages_scraped: pagesProcessed,
            pages_found: urlsToScrape.length + scrapedUrls.size
          })
          .eq('id', jobId);

        console.log(`Processed ${pagesProcessed}/${maxPages} pages`);

      } catch (pageError) {
        console.error(`Error processing ${currentUrl}:`, pageError);
      }
    }

    // Mark job as completed
    await supabase
      .from('scraping_jobs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        pages_scraped: pagesProcessed,
        pages_found: urlsToScrape.length + scrapedUrls.size
      })
      .eq('id', jobId);

    console.log(`Scraping job ${jobId} completed. Processed ${pagesProcessed} pages.`);

  } catch (error) {
    console.error(`Scraping job ${jobId} failed:`, error);
    
    // Mark job as failed
    await supabase
      .from('scraping_jobs')
      .update({
        status: 'failed',
        error_message: error.message,
        completed_at: new Date().toISOString()
      })
      .eq('id', jobId);
  }
}