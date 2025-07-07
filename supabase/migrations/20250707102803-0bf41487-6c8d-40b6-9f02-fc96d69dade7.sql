-- Enable realtime for translation_cache table
ALTER TABLE public.translation_cache REPLICA IDENTITY FULL;

-- Add translation_cache to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.translation_cache;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_translation_cache_target_lang ON public.translation_cache(target_lang);
CREATE INDEX IF NOT EXISTS idx_translation_cache_original ON public.translation_cache(original);

-- Update RLS policy to allow authenticated read access
DROP POLICY IF EXISTS "Anyone can read translation cache" ON public.translation_cache;
CREATE POLICY "Everyone can read translation cache" 
ON public.translation_cache 
FOR SELECT 
USING (true);

-- Allow authenticated users to contribute translations
CREATE POLICY "Authenticated users can add translations" 
ON public.translation_cache 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);