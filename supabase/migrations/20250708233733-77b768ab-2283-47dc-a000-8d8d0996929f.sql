-- Create website scraper infrastructure (only missing tables)

-- Table for storing scraped website content
CREATE TABLE IF NOT EXISTS public.scraped_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  scraped_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  content_hash TEXT, -- For deduplication
  page_type TEXT DEFAULT 'page' -- page, article, product, etc.
);

-- Table for website scraping queue/jobs
CREATE TABLE IF NOT EXISTS public.scraping_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
  error_message TEXT,
  pages_found INTEGER DEFAULT 0,
  pages_scraped INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_scraped_content_url ON public.scraped_content(url);
CREATE INDEX IF NOT EXISTS idx_scraped_content_hash ON public.scraped_content(content_hash);
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_status ON public.scraping_jobs(status);

-- Enable RLS
ALTER TABLE public.scraped_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scraping_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for scraped_content
CREATE POLICY "Everyone can read scraped content" 
ON public.scraped_content FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage scraped content" 
ON public.scraped_content FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for scraping_jobs
CREATE POLICY "Admins can manage scraping jobs" 
ON public.scraping_jobs FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Everyone can view completed scraping jobs" 
ON public.scraping_jobs FOR SELECT 
USING (status = 'completed');

-- Triggers for updated_at
CREATE TRIGGER update_scraped_content_updated_at
  BEFORE UPDATE ON public.scraped_content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();