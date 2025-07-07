-- Create website_translations table for storing all website content translations
CREATE TABLE public.website_translations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path TEXT NOT NULL,
  original_text TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  source_language TEXT NOT NULL DEFAULT 'en',
  target_language TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(page_path, original_text, target_language)
);

-- Enable Row Level Security
ALTER TABLE public.website_translations ENABLE ROW LEVEL SECURITY;

-- Create policies for website translations
CREATE POLICY "Everyone can read active website translations" 
ON public.website_translations 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage all website translations" 
ON public.website_translations 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_website_translations_updated_at
BEFORE UPDATE ON public.website_translations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_website_translations_page_lang ON public.website_translations(page_path, target_language);
CREATE INDEX idx_website_translations_active ON public.website_translations(is_active) WHERE is_active = true;