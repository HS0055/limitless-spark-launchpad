import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Code, Eye, Hash, Type, Image, Link as LinkIcon } from 'lucide-react';

interface HTMLAnalyzerProps {
  htmlContent: string;
}

interface AnalysisResult {
  totalElements: number;
  divCount: number;
  textElements: number;
  imageElements: number;
  linkElements: number;
  headingElements: number;
  duplicateIds: string[];
  missingAltTexts: number;
  emptyElements: number;
}

export const HTMLAnalyzer: React.FC<HTMLAnalyzerProps> = ({ htmlContent }) => {
  const analysis = useMemo((): AnalysisResult => {
    if (!htmlContent) {
      return {
        totalElements: 0,
        divCount: 0,
        textElements: 0,
        imageElements: 0,
        linkElements: 0,
        headingElements: 0,
        duplicateIds: [],
        missingAltTexts: 0,
        emptyElements: 0,
      };
    }

    try {
      // Create a temporary DOM to parse the HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');
      const allElements = doc.querySelectorAll('*');

      // Count different element types
      const divCount = doc.querySelectorAll('div').length;
      const textElements = Array.from(allElements).filter(el => 
        el.textContent && el.textContent.trim().length > 0 && 
        !['script', 'style'].includes(el.tagName.toLowerCase())
      ).length;
      const imageElements = doc.querySelectorAll('img').length;
      const linkElements = doc.querySelectorAll('a').length;
      const headingElements = doc.querySelectorAll('h1, h2, h3, h4, h5, h6').length;

      // Find duplicate IDs
      const ids: string[] = [];
      const duplicateIds: string[] = [];
      allElements.forEach(el => {
        const id = el.getAttribute('id');
        if (id) {
          if (ids.includes(id)) {
            if (!duplicateIds.includes(id)) {
              duplicateIds.push(id);
            }
          } else {
            ids.push(id);
          }
        }
      });

      // Count images without alt text
      const missingAltTexts = Array.from(doc.querySelectorAll('img')).filter(
        img => !img.getAttribute('alt')
      ).length;

      // Count empty elements
      const emptyElements = Array.from(allElements).filter(el => 
        !el.textContent?.trim() && 
        !el.querySelector('img, input, textarea, select, iframe') &&
        !['br', 'hr', 'meta', 'link'].includes(el.tagName.toLowerCase())
      ).length;

      return {
        totalElements: allElements.length,
        divCount,
        textElements,
        imageElements,
        linkElements,
        headingElements,
        duplicateIds,
        missingAltTexts,
        emptyElements,
      };
    } catch (error) {
      console.error('Error analyzing HTML:', error);
      return {
        totalElements: 0,
        divCount: 0,
        textElements: 0,
        imageElements: 0,
        linkElements: 0,
        headingElements: 0,
        duplicateIds: [],
        missingAltTexts: 0,
        emptyElements: 0,
      };
    }
  }, [htmlContent]);

  if (!htmlContent) {
    return null;
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Code className="w-5 h-5" />
        <h3 className="text-lg font-semibold">HTML Analysis</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 rounded-lg bg-muted/50">
          <Hash className="w-6 h-6 mx-auto mb-2 text-primary" />
          <div className="text-2xl font-bold">{analysis.totalElements}</div>
          <div className="text-sm text-muted-foreground">Total Elements</div>
        </div>

        <div className="text-center p-4 rounded-lg bg-muted/50">
          <Code className="w-6 h-6 mx-auto mb-2 text-blue-500" />
          <div className="text-2xl font-bold">{analysis.divCount}</div>
          <div className="text-sm text-muted-foreground">Div Elements</div>
        </div>

        <div className="text-center p-4 rounded-lg bg-muted/50">
          <Type className="w-6 h-6 mx-auto mb-2 text-green-500" />
          <div className="text-2xl font-bold">{analysis.textElements}</div>
          <div className="text-sm text-muted-foreground">Text Elements</div>
        </div>

        <div className="text-center p-4 rounded-lg bg-muted/50">
          <Image className="w-6 h-6 mx-auto mb-2 text-purple-500" />
          <div className="text-2xl font-bold">{analysis.imageElements}</div>
          <div className="text-sm text-muted-foreground">Images</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Content Overview
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Heading Elements:</span>
              <Badge variant="secondary">{analysis.headingElements}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Link Elements:</span>
              <Badge variant="secondary">{analysis.linkElements}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Empty Elements:</span>
              <Badge variant={analysis.emptyElements > 0 ? "destructive" : "secondary"}>
                {analysis.emptyElements}
              </Badge>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <LinkIcon className="w-4 h-4" />
            Quality Issues
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Duplicate IDs:</span>
              <Badge variant={analysis.duplicateIds.length > 0 ? "destructive" : "secondary"}>
                {analysis.duplicateIds.length}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Missing Alt Texts:</span>
              <Badge variant={analysis.missingAltTexts > 0 ? "destructive" : "secondary"}>
                {analysis.missingAltTexts}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {analysis.duplicateIds.length > 0 && (
        <div className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <h5 className="font-medium text-destructive mb-2">Duplicate IDs Found:</h5>
          <div className="flex flex-wrap gap-1">
            {analysis.duplicateIds.map((id, index) => (
              <Badge key={index} variant="destructive" className="text-xs">
                {id}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};