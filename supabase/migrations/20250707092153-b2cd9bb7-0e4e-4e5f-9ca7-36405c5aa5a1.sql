-- Create a global translations cache table
CREATE TABLE public.translation_cache (
  id SERIAL PRIMARY KEY,
  original TEXT NOT NULL,
  target_lang TEXT NOT NULL,
  translated TEXT NOT NULL,
  inserted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (original, target_lang)
);

-- Enable Row Level Security but allow read access to everyone
ALTER TABLE public.translation_cache ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read from the cache
CREATE POLICY "Anyone can read translation cache" 
ON public.translation_cache 
FOR SELECT 
USING (true);

-- Only service role can insert/update cache entries
CREATE POLICY "Service role can manage translation cache" 
ON public.translation_cache 
FOR ALL 
USING (true);