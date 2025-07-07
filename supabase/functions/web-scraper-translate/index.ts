import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScrapedContent {
  text: string;
  html: string;
  title: string;
  meta: {
    description?: string;
    keywords?: string;
  };
  links: string[];
  images: string[];
}

interface TranslationRequest {
  url: string;
  targetLang: string;
  includeMeta?: boolean;
  preserveHtml?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, targetLang, includeMeta = true, preserveHtml = false }: TranslationRequest = await req.json();

    if (!url || !targetLang) {
      return new Response(
        JSON.stringify({ error: 'URL and target language are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Scraping and translating: ${url} → ${targetLang}`);

    // Step 1: Scrape the website
    const scrapeResponse = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WebScraper/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
      },
    });

    if (!scrapeResponse.ok) {
      throw new Error(`Failed to fetch ${url}: ${scrapeResponse.status}`);
    }

    const html = await scrapeResponse.text();
    
    // Step 2: Extract content using regex and basic parsing
    const extractContent = (html: string): ScrapedContent => {
      // Extract title
      const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/is);
      const title = titleMatch ? titleMatch[1].trim() : '';

      // Extract meta description
      const metaDescMatch = html.match(/<meta[^>]*name=['"](description|Description)['"][^>]*content=['"]([^'"]*)['"]/i);
      const metaKeywordsMatch = html.match(/<meta[^>]*name=['"](keywords|Keywords)['"][^>]*content=['"]([^'"]*)['"]/i);
      
      const meta = {
        description: metaDescMatch ? metaDescMatch[2] : undefined,
        keywords: metaKeywordsMatch ? metaKeywordsMatch[2] : undefined,
      };

      // Extract main content (remove script, style, nav, footer, etc.)
      let cleanHtml = html
        .replace(/<script[^>]*>.*?<\/script>/gis, '')
        .replace(/<style[^>]*>.*?<\/style>/gis, '')
        .replace(/<nav[^>]*>.*?<\/nav>/gis, '')
        .replace(/<footer[^>]*>.*?<\/footer>/gis, '')
        .replace(/<header[^>]*>.*?<\/header>/gis, '')
        .replace(/<!--.*?-->/gs, '');

      // Extract text content
      const text = cleanHtml
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 8000); // Limit content length

      // Extract links
      const linkMatches = html.matchAll(/<a[^>]*href=['"]([^'"]*)['"]/gi);
      const links = Array.from(linkMatches, m => m[1]).filter(link => 
        link.startsWith('http') || link.startsWith('/')
      ).slice(0, 20);

      // Extract images
      const imgMatches = html.matchAll(/<img[^>]*src=['"]([^'"]*)['"]/gi);
      const images = Array.from(imgMatches, m => m[1]).filter(img => 
        img.startsWith('http') || img.startsWith('/')
      ).slice(0, 10);

      return {
        text,
        html: cleanHtml,
        title,
        meta,
        links,
        images
      };
    };

    const scrapedContent = extractContent(html);

    // Step 3: Translate content using Claude
    const languageNames = {
      'en': 'English',
      'hy': 'Armenian', 
      'ru': 'Russian',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese',
      'ja': 'Japanese',
      'ko': 'Korean',
      'zh': 'Chinese',
      'ar': 'Arabic'
    };

    const targetLanguage = languageNames[targetLang as keyof typeof languageNames] || targetLang;

    // Translate main content
    const translateResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicApiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        temperature: 0.1,
        messages: [
          {
            role: 'user',
            content: `You are a professional website translator. Translate the following web content to ${targetLanguage} while preserving the meaning and context.

IMPORTANT INSTRUCTIONS:
- Maintain the original tone and style
- Adapt cultural references appropriately
- Use web-appropriate terminology
- Keep the structure and formatting
- Translate naturally for ${targetLanguage} speakers

CONTENT TO TRANSLATE:

TITLE: ${scrapedContent.title}

META DESCRIPTION: ${scrapedContent.meta.description || 'N/A'}

MAIN CONTENT:
${scrapedContent.text}

Return the translation in this exact JSON format:
{
  "title": "translated title",
  "metaDescription": "translated meta description",
  "content": "translated main content"
}`
          }
        ]
      }),
    });

    if (!translateResponse.ok) {
      const errorData = await translateResponse.json();
      console.error('Claude API error:', errorData);
      throw new Error(`Translation API error: ${translateResponse.status}`);
    }

    const translationData = await translateResponse.json();
    const translationText = translationData.content[0].text.trim();

    // Parse the JSON response
    let translatedContent;
    try {
      translatedContent = JSON.parse(translationText);
    } catch (parseError) {
      // Fallback: extract translations with regex
      const titleMatch = translationText.match(/"title":\s*"([^"]*)"/) || ['', scrapedContent.title];
      const metaMatch = translationText.match(/"metaDescription":\s*"([^"]*)"/) || ['', scrapedContent.meta.description];
      const contentMatch = translationText.match(/"content":\s*"([^"]*)"/) || ['', translationText];
      
      translatedContent = {
        title: titleMatch[1] || scrapedContent.title,
        metaDescription: metaMatch[1] || scrapedContent.meta.description,
        content: contentMatch[1] || translationText
      };
    }

    console.log('Translation completed successfully');

    const response = {
      success: true,
      url,
      targetLanguage: targetLang,
      original: {
        title: scrapedContent.title,
        metaDescription: scrapedContent.meta.description,
        content: scrapedContent.text.substring(0, 1000) + '...',
        links: scrapedContent.links,
        images: scrapedContent.images
      },
      translated: translatedContent,
      stats: {
        originalLength: scrapedContent.text.length,
        translatedLength: translatedContent.content?.length || 0,
        linksFound: scrapedContent.links.length,
        imagesFound: scrapedContent.images.length
      }
    };

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in web-scraper-translate function:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Failed to scrape and translate website', 
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});