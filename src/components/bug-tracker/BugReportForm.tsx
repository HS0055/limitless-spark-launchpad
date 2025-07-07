import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BugReportFormProps {
  onSuccess: () => void;
}

const BugReportForm = ({ onSuccess }: BugReportFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    category: 'functionality' as 'ui' | 'performance' | 'functionality' | 'security' | 'other',
    steps_to_reproduce: '',
    expected_behavior: '',
    actual_behavior: '',
    browser_info: '',
    system_info: ''
  });
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('bug_reports')
        .insert({
          ...formData,
          reporter_id: user.id,
          tags,
          browser_info: formData.browser_info || navigator.userAgent,
          system_info: formData.system_info || `${navigator.platform} - ${navigator.language}`
        });

      if (error) throw error;
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit bug report",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="title">Bug Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Brief description of the issue"
            required
          />
        </div>

        <div>
          <Label htmlFor="severity">Severity *</Label>
          <Select value={formData.severity} onValueChange={(value: any) => setFormData({ ...formData, severity: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="category">Category *</Label>
          <Select value={formData.category} onValueChange={(value: any) => setFormData({ ...formData, category: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ui">UI/UX</SelectItem>
              <SelectItem value="performance">Performance</SelectItem>
              <SelectItem value="functionality">Functionality</SelectItem>
              <SelectItem value="security">Security</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Detailed description of the issue"
            rows={4}
            required
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="steps">Steps to Reproduce</Label>
          <Textarea
            id="steps"
            value={formData.steps_to_reproduce}
            onChange={(e) => setFormData({ ...formData, steps_to_reproduce: e.target.value })}
            placeholder="1. Go to...&#10;2. Click on...&#10;3. Observe..."
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="expected">Expected Behavior</Label>
          <Textarea
            id="expected"
            value={formData.expected_behavior}
            onChange={(e) => setFormData({ ...formData, expected_behavior: e.target.value })}
            placeholder="What should happen"
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="actual">Actual Behavior</Label>
          <Textarea
            id="actual"
            value={formData.actual_behavior}
            onChange={(e) => setFormData({ ...formData, actual_behavior: e.target.value })}
            placeholder="What actually happens"
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="browser">Browser Info</Label>
          <Input
            id="browser"
            value={formData.browser_info}
            onChange={(e) => setFormData({ ...formData, browser_info: e.target.value })}
            placeholder="Chrome 120.0.0.0"
          />
        </div>

        <div>
          <Label htmlFor="system">System Info</Label>
          <Input
            id="system"
            value={formData.system_info}
            onChange={(e) => setFormData({ ...formData, system_info: e.target.value })}
            placeholder="Windows 11, macOS 14.0"
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="tags">Tags</Label>
          <div className="flex gap-2 mb-2">
            <Input
              id="tags"
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              placeholder="Add tags"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            />
            <Button type="button" onClick={addTag} variant="outline">
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {tag}
                <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Bug Report'}
        </Button>
      </div>
    </form>
  );
};

export default BugReportForm;