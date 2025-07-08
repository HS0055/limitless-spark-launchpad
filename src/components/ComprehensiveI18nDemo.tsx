import React from 'react';
import { LocalizedText, TranslationSkeleton, LocalizedLoading, withTranslation } from '@/components/LocalizedComponents';
import { useTranslation } from '@/contexts/EnhancedTranslationContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const ComprehensiveI18nDemo = () => {
  const { currentLanguage, availableLanguages, setLanguage, isLoading } = useTranslation(['nav', 'features', 'demo']);

  const triggerComprehensiveTranslation = async () => {
    try {
      const response = await fetch('https://mbwieeegglyprxoncckdj.supabase.co/functions/v1/comprehensive-translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1id2llZWdnbHlwcnhvbmNja2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NzE3MzQsImV4cCI6MjA2NzM0NzczNH0.mSp5jZo9OgsP7xRYueRqUH9GyXiqoERbnoR2JHWnjPk'
        },
        body: JSON.stringify({
          mode: 'intelligent-batch',
          quality_level: 'high'
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Comprehensive translation completed:', result);
        window.dispatchEvent(new CustomEvent('translations-updated'));
      }
    } catch (error) {
      console.error('Translation error:', error);
    }
  };

  const runPlaywrightScan = async () => {
    try {
      const response = await fetch('https://mbwieeegglyprxoncckdj.supabase.co/functions/v1/playwright-i18n-scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1id2llZWdnbHlwcnhvbmNja2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NzE3MzQsImV4cCI6MjA2NzM0NzczNH0.mSp5jZo9OgsP7xRYueRqUH9GyXiqoERbnoR2JHWnjPk'
        },
        body: JSON.stringify({
          baseUrl: window.location.origin,
          targetLanguages: [currentLanguage],
          mode: 'comprehensive'
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('🎭 Playwright scan completed:', result);
      }
    } catch (error) {
      console.error('Playwright scan error:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            <LocalizedText namespace="demo" showReportButton>
              🌍 Comprehensive Multilingual System Demo
            </LocalizedText>
          </CardTitle>
          <CardDescription>
            <LocalizedText namespace="demo" showReportButton>
              100% string detection, automatic translation, and visual control
            </LocalizedText>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Language Selector */}
          <div className="flex flex-wrap gap-2">
            {availableLanguages.map((lang) => (
              <Button
                key={lang.code}
                variant={currentLanguage === lang.code ? "default" : "outline"}
                size="sm"
                onClick={() => setLanguage(lang.code)}
                className="flex items-center gap-1"
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </Button>
            ))}
          </div>

          {/* Features Demonstration */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  <LocalizedText namespace="features" showReportButton>
                    🔍 String Detection
                  </LocalizedText>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LocalizedText namespace="features" showReportButton>
                  Automatically detects all translatable strings in your application
                </LocalizedText>
                <Badge variant="secondary" className="mt-2">
                  <LocalizedText namespace="common">100% Coverage</LocalizedText>
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  <LocalizedText namespace="features" showReportButton>
                    🤖 AI Translation
                  </LocalizedText>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LocalizedText namespace="features" showReportButton>
                  GPT-4o powered contextual translations with quality control
                </LocalizedText>
                <Badge variant="secondary" className="mt-2">
                  <LocalizedText namespace="common">Near-Human Quality</LocalizedText>
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  <LocalizedText namespace="features" showReportButton>
                    ⚡ Real-time Updates
                  </LocalizedText>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LocalizedText namespace="features" showReportButton>
                  Zero-downtime updates with intelligent caching
                </LocalizedText>
                <Badge variant="secondary" className="mt-2">
                  <LocalizedText namespace="common">Live Updates</LocalizedText>
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={triggerComprehensiveTranslation}
              disabled={isLoading}
            >
              {isLoading ? (
                <LocalizedLoading message="Processing..." namespace="common" />
              ) : (
                <LocalizedText namespace="demo">
                  🚀 Run Comprehensive Translation
                </LocalizedText>
              )}
            </Button>
            
            <Button 
              variant="outline"
              onClick={runPlaywrightScan}
            >
              <LocalizedText namespace="demo">
                🎭 Run Visual Quality Scan
              </LocalizedText>
            </Button>
          </div>

          {/* Demo Content with Report Buttons */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">
              <LocalizedText namespace="demo" showReportButton>
                Sample Content for Translation Testing
              </LocalizedText>
            </h3>
            <div className="space-y-2 text-sm">
              <p>
                <LocalizedText namespace="demo" showReportButton>
                  This is a sample paragraph that should be automatically detected and translated.
                </LocalizedText>
              </p>
              <p>
                <LocalizedText namespace="demo" showReportButton>
                  User interface elements like buttons, labels, and navigation items are prioritized for translation.
                </LocalizedText>
              </p>
              <p>
                <LocalizedText namespace="demo" showReportButton>
                  The system maintains context awareness for accurate, culturally appropriate translations.
                </LocalizedText>
              </p>
            </div>
          </div>

          {/* System Status */}
          <div className="text-xs text-muted-foreground">
            <span>
              <LocalizedText namespace="demo">Current Language:</LocalizedText>
              {' '}
              {availableLanguages.find(l => l.code === currentLanguage)?.name}
            </span>
            {' • '}
            <LocalizedText namespace="demo">
              System Status: Active
            </LocalizedText>
            {isLoading && (
              <>
                {' • '}
                <LocalizedText namespace="demo">Loading translations...</LocalizedText>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default withTranslation(ComprehensiveI18nDemo, 'demo');