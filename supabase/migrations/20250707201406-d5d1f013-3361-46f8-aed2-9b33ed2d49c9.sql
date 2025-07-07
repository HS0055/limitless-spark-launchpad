-- Create bug tracking tables
CREATE TABLE public.bug_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  category TEXT NOT NULL CHECK (category IN ('ui', 'performance', 'functionality', 'security', 'other')),
  reporter_id UUID NOT NULL,
  assigned_to UUID,
  steps_to_reproduce TEXT,
  expected_behavior TEXT,
  actual_behavior TEXT,
  browser_info TEXT,
  system_info TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  tags TEXT[] DEFAULT ARRAY[]::text[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bug comments table
CREATE TABLE public.bug_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bug_id UUID NOT NULL REFERENCES public.bug_reports(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  comment TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bug history table for tracking changes
CREATE TABLE public.bug_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bug_id UUID NOT NULL REFERENCES public.bug_reports(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  field_changed TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bug_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bug_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bug_reports
CREATE POLICY "Users can view all bug reports" 
ON public.bug_reports 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create bug reports" 
ON public.bug_reports 
FOR INSERT 
WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins and reporters can update bug reports" 
ON public.bug_reports 
FOR UPDATE 
USING (auth.uid() = reporter_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete bug reports" 
ON public.bug_reports 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for bug_comments
CREATE POLICY "Users can view comments on accessible bugs" 
ON public.bug_comments 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create comments" 
ON public.bug_comments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
ON public.bug_comments 
FOR UPDATE 
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins and comment authors can delete comments" 
ON public.bug_comments 
FOR DELETE 
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for bug_history
CREATE POLICY "Users can view bug history" 
ON public.bug_history 
FOR SELECT 
USING (true);

CREATE POLICY "Only system can insert bug history" 
ON public.bug_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_bug_reports_status ON public.bug_reports(status);
CREATE INDEX idx_bug_reports_severity ON public.bug_reports(severity);
CREATE INDEX idx_bug_reports_reporter ON public.bug_reports(reporter_id);
CREATE INDEX idx_bug_reports_assigned ON public.bug_reports(assigned_to);
CREATE INDEX idx_bug_reports_created ON public.bug_reports(created_at);
CREATE INDEX idx_bug_comments_bug_id ON public.bug_comments(bug_id);
CREATE INDEX idx_bug_history_bug_id ON public.bug_history(bug_id);

-- Create trigger for updated_at
CREATE TRIGGER update_bug_reports_updated_at
BEFORE UPDATE ON public.bug_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bug_comments_updated_at
BEFORE UPDATE ON public.bug_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to log bug changes
CREATE OR REPLACE FUNCTION public.log_bug_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Log status changes
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.bug_history (bug_id, user_id, action, old_value, new_value, field_changed)
    VALUES (NEW.id, auth.uid(), 'status_changed', OLD.status, NEW.status, 'status');
  END IF;
  
  -- Log severity changes
  IF OLD.severity IS DISTINCT FROM NEW.severity THEN
    INSERT INTO public.bug_history (bug_id, user_id, action, old_value, new_value, field_changed)
    VALUES (NEW.id, auth.uid(), 'severity_changed', OLD.severity, NEW.severity, 'severity');
  END IF;
  
  -- Log assignment changes
  IF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to THEN
    INSERT INTO public.bug_history (bug_id, user_id, action, old_value, new_value, field_changed)
    VALUES (NEW.id, auth.uid(), 'assignment_changed', OLD.assigned_to::text, NEW.assigned_to::text, 'assigned_to');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for logging changes
CREATE TRIGGER log_bug_report_changes
AFTER UPDATE ON public.bug_reports
FOR EACH ROW
EXECUTE FUNCTION public.log_bug_changes();