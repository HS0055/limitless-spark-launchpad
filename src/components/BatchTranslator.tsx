import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Languages, Download, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TranslationJob {
  id: string;
  content: string;
  translatedText?: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
}

const BatchTranslator = () => {
  const [jobs, setJobs] = useState<TranslationJob[]>([]);
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('hy');
  const [translationType, setTranslationType] = useState('standard');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'hy', name: 'Armenian', flag: '🇦🇲' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  ];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      const newJobs: TranslationJob[] = lines.map((content, index) => ({
        id: `job-${Date.now()}-${index}`,
        content: content.trim(),
        status: 'pending'
      }));

      setJobs(newJobs);
      toast({
        title: "File Loaded",
        description: `${newJobs.length} items ready for translation`,
      });
    } catch (error) {
      toast({
        title: "File Error",
        description: "Failed to read file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const processTranslations = async () => {
    if (jobs.length === 0) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      for (let i = 0; i < jobs.length; i++) {
        const job = jobs[i];
        
        setJobs(prev => prev.map(j => 
          j.id === job.id ? { ...j, status: 'processing' } : j
        ));

        try {
          const { data, error } = await supabase.functions.invoke('intelligent-translate', {
            body: {
              content: job.content,
              sourceLang,
              targetLang,
              translationType,
              context: 'Batch translation job'
            }
          });

          if (error) throw error;

          setJobs(prev => prev.map(j => 
            j.id === job.id 
              ? { ...j, status: 'completed', translatedText: data.translatedText }
              : j
          ));
        } catch (error) {
          setJobs(prev => prev.map(j => 
            j.id === job.id 
              ? { ...j, status: 'error', error: error.message }
              : j
          ));
        }

        setProgress(((i + 1) / jobs.length) * 100);
      }

      toast({
        title: "Batch Translation Complete",
        description: "All translations have been processed",
      });
    } catch (error) {
      toast({
        title: "Batch Processing Failed",
        description: "Failed to process translations",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const exportResults = () => {
    const completedJobs = jobs.filter(job => job.status === 'completed');
    
    if (completedJobs.length === 0) {
      toast({
        title: "No Results",
        description: "No completed translations to export",
        variant: "destructive",
      });
      return;
    }

    const csvContent = [
      'Original,Translation,Status',
      ...completedJobs.map(job => 
        `"${job.content}","${job.translatedText || ''}","${job.status}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `translations-${sourceLang}-to-${targetLang}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success';
      case 'processing': return 'bg-warning';
      case 'error': return 'bg-destructive';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="w-5 h-5" />
            Batch Translator
          </CardTitle>
          <CardDescription>
            Upload and translate multiple content items at once
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">From</label>
              <Select value={sourceLang} onValueChange={setSourceLang}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <span className="flex items-center gap-2">
                        {lang.flag} {lang.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">To</label>
              <Select value={targetLang} onValueChange={setTargetLang}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <span className="flex items-center gap-2">
                        {lang.flag} {lang.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Type</label>
              <Select value={translationType} onValueChange={setTranslationType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="cultural">Cultural</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={() => document.getElementById('file-upload')?.click()}
                variant="outline"
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </Button>
              <input
                id="file-upload"
                type="file"
                accept=".txt,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          {jobs.length > 0 && (
            <div className="flex items-center gap-4">
              <Button 
                onClick={processTranslations}
                disabled={isProcessing}
                className="flex-1"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Languages className="w-4 h-4 mr-2" />
                    Translate All ({jobs.length})
                  </>
                )}
              </Button>

              <Button 
                onClick={exportResults}
                variant="outline"
                disabled={!jobs.some(j => j.status === 'completed')}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          )}

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {jobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Translation Jobs</CardTitle>
            <CardDescription>
              {jobs.filter(j => j.status === 'completed').length} of {jobs.length} completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {jobs.map((job) => (
                <div key={job.id} className="flex items-start gap-3 p-3 border border-border rounded-lg">
                  <Badge 
                    variant="outline" 
                    className={`${getStatusColor(job.status)} text-white`}
                  >
                    {job.status}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{job.content}</div>
                    {job.translatedText && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {job.translatedText}
                      </div>
                    )}
                    {job.error && (
                      <div className="text-sm text-destructive mt-1">
                        Error: {job.error}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BatchTranslator;