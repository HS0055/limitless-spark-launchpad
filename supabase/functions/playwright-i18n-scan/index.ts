import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PlaywrightScanRequest {
  baseUrl: string;
  targetLanguages: string[];
  pages?: string[];
  mode: 'visual' | 'text' | 'comprehensive';
}

interface ScanResult {
  page: string;
  language: string;
  missingTranslations: string[];
  visualInconsistencies: Array<{
    element: string;
    expected: string;
    actual: string;
    screenshot?: string;
  }>;
  accessibility: Array<{
    issue: string;
    element: string;
    severity: 'low' | 'medium' | 'high';
  }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      baseUrl,
      targetLanguages = ['hy', 'ru', 'es', 'fr', 'de'],
      pages = ['/', '/about', '/pricing', '/contact'],
      mode = 'comprehensive'
    }: PlaywrightScanRequest = await req.json();

    console.log(`🎭 Starting Playwright scan: ${mode} mode for ${targetLanguages.length} languages`);

    const results: ScanResult[] = [];

    // Mock Playwright implementation (in real scenario, this would use actual Playwright)
    for (const language of targetLanguages) {
      for (const page of pages) {
        const scanResult = await scanPageForLanguage(baseUrl, page, language, mode);
        results.push(scanResult);
      }
    }

    // Generate comprehensive report
    const report = generateScanReport(results);

    return new Response(JSON.stringify({
      success: true,
      mode,
      scanned_pages: pages.length,
      scanned_languages: targetLanguages.length,
      total_issues: results.reduce((acc, r) => acc + r.missingTranslations.length + r.visualInconsistencies.length, 0),
      results,
      report
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Playwright scan error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function scanPageForLanguage(baseUrl: string, page: string, language: string, mode: string): Promise<ScanResult> {
  const url = `${baseUrl}${page}?lang=${language}`;
  console.log(`🔍 Scanning: ${url}`);

  // Mock scan results (in real implementation, this would use Playwright browser automation)
  const mockScanResult: ScanResult = {
    page,
    language,
    missingTranslations: [],
    visualInconsistencies: [],
    accessibility: []
  };

  try {
    // Simulate web scraping
    const response = await fetch(url);
    const html = await response.text();

    // Mock text extraction and analysis
    const englishTexts = extractTextContent(html);
    const missingTranslations = findMissingTranslations(englishTexts, language);
    
    mockScanResult.missingTranslations = missingTranslations;

    // Mock visual inconsistency detection
    if (mode === 'visual' || mode === 'comprehensive') {
      mockScanResult.visualInconsistencies = await detectVisualInconsistencies(url, language);
    }

    // Mock accessibility scan
    if (mode === 'comprehensive') {
      mockScanResult.accessibility = await scanAccessibility(url, language);
    }

  } catch (error) {
    console.error(`Failed to scan ${url}:`, error);
    mockScanResult.missingTranslations.push(`Error scanning page: ${error.message}`);
  }

  return mockScanResult;
}

function extractTextContent(html: string): string[] {
  // Mock text extraction (in real implementation, this would parse DOM)
  const textMatches = html.match(/>([^<]+)</g) || [];
  return textMatches
    .map(match => match.slice(1, -1).trim())
    .filter(text => text.length > 3 && /[a-zA-Z]/.test(text))
    .filter(text => !text.match(/^(script|style|meta)/i));
}

function findMissingTranslations(texts: string[], language: string): string[] {
  // Mock translation checking
  const englishPatterns = [
    /^[A-Z][a-z\s]+$/,  // English sentences
    /Get Started|Learn More|Contact Us|About Us/i,  // Common English phrases
    /nav\.|hero\.|features\./  // Translation keys
  ];

  return texts.filter(text => 
    englishPatterns.some(pattern => pattern.test(text))
  ).slice(0, 10); // Limit for demo
}

async function detectVisualInconsistencies(url: string, language: string) {
  // Mock visual inconsistency detection
  const mockInconsistencies = [
    {
      element: 'nav button',
      expected: 'Proper translated text with correct styling',
      actual: 'nav.getStarted (raw translation key visible)',
      screenshot: `screenshot-${language}-nav.png`
    }
  ];

  // Only return inconsistencies for demo languages that might have issues
  return ['ko', 'ar', 'he'].includes(language) ? mockInconsistencies : [];
}

async function scanAccessibility(url: string, language: string) {
  // Mock accessibility scanning
  const mockAccessibilityIssues = [
    {
      issue: 'Missing lang attribute for RTL language',
      element: 'html',
      severity: 'medium' as const
    },
    {
      issue: 'Untranslated aria-label',
      element: 'button[aria-label="Get Started"]',
      severity: 'low' as const
    }
  ];

  // Return issues for RTL languages
  return ['ar', 'he', 'ur'].includes(language) ? mockAccessibilityIssues : [];
}

function generateScanReport(results: ScanResult[]) {
  const totalIssues = results.reduce((acc, r) => 
    acc + r.missingTranslations.length + r.visualInconsistencies.length + r.accessibility.length, 0
  );

  const languageStats = results.reduce((acc, result) => {
    if (!acc[result.language]) {
      acc[result.language] = {
        missing_translations: 0,
        visual_issues: 0,
        accessibility_issues: 0
      };
    }
    acc[result.language].missing_translations += result.missingTranslations.length;
    acc[result.language].visual_issues += result.visualInconsistencies.length;
    acc[result.language].accessibility_issues += result.accessibility.length;
    return acc;
  }, {} as Record<string, any>);

  const recommendations = [];
  
  if (totalIssues > 0) {
    recommendations.push('Run comprehensive translation batch to fix missing translations');
  }
  
  const hasVisualIssues = results.some(r => r.visualInconsistencies.length > 0);
  if (hasVisualIssues) {
    recommendations.push('Review visual layout for RTL languages and long translations');
  }

  const hasAccessibilityIssues = results.some(r => r.accessibility.length > 0);
  if (hasAccessibilityIssues) {
    recommendations.push('Update HTML lang attributes and ARIA labels for proper accessibility');
  }

  return {
    summary: {
      total_issues: totalIssues,
      languages_scanned: Object.keys(languageStats).length,
      pages_scanned: new Set(results.map(r => r.page)).size
    },
    language_stats: languageStats,
    recommendations,
    priority_fixes: results
      .filter(r => r.missingTranslations.length > 0 || r.visualInconsistencies.length > 0)
      .map(r => ({
        page: r.page,
        language: r.language,
        issue_count: r.missingTranslations.length + r.visualInconsistencies.length
      }))
      .sort((a, b) => b.issue_count - a.issue_count)
      .slice(0, 10)
  };
}