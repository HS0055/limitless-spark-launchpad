-- Add styles column to website_texts table
ALTER TABLE public.website_texts 
ADD COLUMN styles JSONB DEFAULT '{}'::jsonb;