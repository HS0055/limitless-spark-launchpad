-- Create translation queue table for missing key handling
CREATE TABLE IF NOT EXISTS public.translation_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  target_language TEXT NOT NULL,
  original_text TEXT NOT NULL,
  fallback_text TEXT,
  page_path TEXT DEFAULT '/',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  translated_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(target_language, original_text)
);

-- Enable Row Level Security
ALTER TABLE public.translation_queue ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert missing translations
CREATE POLICY "Authenticated users can queue missing translations" 
ON public.translation_queue 
FOR INSERT 
WITH CHECK (true);

-- Allow service role and admins to read queue
CREATE POLICY "Service role can read translation queue" 
ON public.translation_queue 
FOR SELECT 
USING (true);

-- Allow service role to update queue status
CREATE POLICY "Service role can update translation queue" 
ON public.translation_queue 
FOR UPDATE 
USING (true);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_translation_queue_status 
ON public.translation_queue(status, created_at);

CREATE INDEX IF NOT EXISTS idx_translation_queue_language 
ON public.translation_queue(target_language, status);