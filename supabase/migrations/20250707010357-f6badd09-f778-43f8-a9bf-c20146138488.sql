-- Create translations table for storing user translation history
CREATE TABLE public.translations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  source_text TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  source_language TEXT NOT NULL,
  target_language TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own translations" 
ON public.translations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own translations" 
ON public.translations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own translations" 
ON public.translations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own translations" 
ON public.translations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_translations_updated_at
BEFORE UPDATE ON public.translations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better query performance
CREATE INDEX idx_translations_user_id_created_at ON public.translations(user_id, created_at DESC);