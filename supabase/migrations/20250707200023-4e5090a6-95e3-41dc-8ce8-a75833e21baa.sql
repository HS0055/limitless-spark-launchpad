-- Create visual editor database schema

-- Pages table for storing editor pages
CREATE TABLE public.editor_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  title TEXT,
  description TEXT,
  meta_data JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  is_published BOOLEAN DEFAULT false,
  is_template BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Components table for storing page components
CREATE TABLE public.editor_components (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID NOT NULL REFERENCES public.editor_pages(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'text', 'image', 'button', 'container', 'form', etc.
  content JSONB DEFAULT '{}',
  styles JSONB DEFAULT '{}',
  position JSONB DEFAULT '{}', -- x, y coordinates
  size JSONB DEFAULT '{}', -- width, height
  properties JSONB DEFAULT '{}', -- additional component properties
  parent_id UUID REFERENCES public.editor_components(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Templates table for pre-built templates
CREATE TABLE public.editor_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  category TEXT DEFAULT 'general',
  page_data JSONB NOT NULL, -- complete page structure
  components_data JSONB NOT NULL, -- components array
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Published sites table for deployment tracking
CREATE TABLE public.published_sites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID NOT NULL REFERENCES public.editor_pages(id) ON DELETE CASCADE,
  domain TEXT,
  deployment_url TEXT,
  status TEXT DEFAULT 'building', -- 'building', 'published', 'failed'
  build_log TEXT,
  published_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.editor_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editor_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editor_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.published_sites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for editor_pages
CREATE POLICY "Anyone can view published pages" 
ON public.editor_pages 
FOR SELECT 
USING (is_published = true OR auth.uid() = created_by OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can create pages" 
ON public.editor_pages 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Page creators and admins can update pages" 
ON public.editor_pages 
FOR UPDATE 
USING (auth.uid() = created_by OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Page creators and admins can delete pages" 
ON public.editor_pages 
FOR DELETE 
USING (auth.uid() = created_by OR has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for editor_components
CREATE POLICY "Anyone can view components of accessible pages" 
ON public.editor_components 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.editor_pages 
  WHERE id = editor_components.page_id 
  AND (is_published = true OR created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
));

CREATE POLICY "Page creators and admins can manage components" 
ON public.editor_components 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.editor_pages 
  WHERE id = editor_components.page_id 
  AND (created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
));

-- RLS Policies for editor_templates
CREATE POLICY "Everyone can view active templates" 
ON public.editor_templates 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage templates" 
ON public.editor_templates 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for published_sites
CREATE POLICY "Anyone can view published sites" 
ON public.published_sites 
FOR SELECT 
USING (true);

CREATE POLICY "Page creators and admins can manage published sites" 
ON public.published_sites 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.editor_pages 
  WHERE id = published_sites.page_id 
  AND (created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
));

-- Create indexes for better performance
CREATE INDEX idx_editor_pages_slug ON public.editor_pages(slug);
CREATE INDEX idx_editor_pages_published ON public.editor_pages(is_published) WHERE is_published = true;
CREATE INDEX idx_editor_components_page_id ON public.editor_components(page_id);
CREATE INDEX idx_editor_components_parent_id ON public.editor_components(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX idx_editor_templates_category ON public.editor_templates(category) WHERE is_active = true;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_editor_pages_updated_at
BEFORE UPDATE ON public.editor_pages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_editor_components_updated_at
BEFORE UPDATE ON public.editor_components
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_editor_templates_updated_at
BEFORE UPDATE ON public.editor_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();