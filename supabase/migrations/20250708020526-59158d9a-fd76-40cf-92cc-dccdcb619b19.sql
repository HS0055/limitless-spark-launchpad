-- Create translation_reports table for user feedback
CREATE TABLE IF NOT EXISTS public.translation_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_text TEXT NOT NULL,
  current_translation TEXT NOT NULL,
  suggested_translation TEXT,
  target_language TEXT NOT NULL,
  page_path TEXT NOT NULL,
  user_id UUID,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.translation_reports ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can report translations" 
ON public.translation_reports 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can manage translation reports" 
ON public.translation_reports 
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view all translation reports" 
ON public.translation_reports 
FOR SELECT 
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_translation_reports_updated_at
BEFORE UPDATE ON public.translation_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for performance
CREATE INDEX idx_translation_reports_status ON public.translation_reports(status);
CREATE INDEX idx_translation_reports_language ON public.translation_reports(target_language);
CREATE INDEX idx_translation_reports_page ON public.translation_reports(page_path);