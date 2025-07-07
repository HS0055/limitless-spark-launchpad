-- Create table for storing website text edits
CREATE TABLE public.website_texts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  selector TEXT NOT NULL, -- CSS selector or text identifier
  original_text TEXT NOT NULL,
  edited_text TEXT NOT NULL,
  page_path TEXT NOT NULL, -- Which page this text appears on
  element_type TEXT DEFAULT 'text', -- type of element (text, button, header, etc.)
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true
);

-- Enable Row Level Security
ALTER TABLE public.website_texts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage all website texts" 
ON public.website_texts 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Everyone can read active website texts" 
ON public.website_texts 
FOR SELECT 
USING (is_active = true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_website_texts_updated_at
BEFORE UPDATE ON public.website_texts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_website_texts_page_path ON public.website_texts(page_path);
CREATE INDEX idx_website_texts_selector ON public.website_texts(selector);
CREATE INDEX idx_website_texts_active ON public.website_texts(is_active);

-- Add realtime functionality
ALTER TABLE public.website_texts REPLICA IDENTITY FULL;