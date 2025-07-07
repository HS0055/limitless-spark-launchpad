import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Clock, User, MessageCircle, History } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BugReport {
  id: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  category: string;
  reporter_id: string;
  assigned_to?: string;
  steps_to_reproduce?: string;
  expected_behavior?: string;
  actual_behavior?: string;
  browser_info?: string;
  system_info?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  profiles?: {
    display_name?: string;
  };
}

interface BugDetailsProps {
  bug: BugReport;
  onUpdate: () => void;
  getSeverityColor: (severity: string) => string;
  getStatusColor: (status: string) => string;
}

interface Comment {
  id: string;
  comment: string;
  created_at: string;
  profiles?: {
    display_name?: string;
  };
}

const BugDetails = ({ bug, onUpdate, getSeverityColor, getStatusColor }: BugDetailsProps) => {
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [bug.id]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('bug_comments')
        .select(`
          *,
          profiles(display_name)
        `)
        .eq('bug_id', bug.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments((data as any) || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const updateBugStatus = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bug_reports')
        .update({ status: newStatus })
        .eq('id', bug.id);

      if (error) throw error;
      onUpdate();
      toast({
        title: "Success",
        description: "Bug status updated"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update bug status",
        variant: "destructive"
      });
    }
  };

  const updateBugSeverity = async (newSeverity: string) => {
    try {
      const { error } = await supabase
        .from('bug_reports')
        .update({ severity: newSeverity })
        .eq('id', bug.id);

      if (error) throw error;
      onUpdate();
      toast({
        title: "Success",
        description: "Bug severity updated"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update bug severity",
        variant: "destructive"
      });
    }
  };

  const addComment = async () => {
    if (!newComment.trim() || !user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('bug_comments')
        .insert({
          bug_id: bug.id,
          user_id: user.id,
          comment: newComment.trim()
        });

      if (error) throw error;
      setNewComment('');
      fetchComments();
      toast({
        title: "Success",
        description: "Comment added"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const canEdit = user && (user.id === bug.reporter_id || userRole === 'admin');

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{bug.title}</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Badge className={getSeverityColor(bug.severity)}>
              {bug.severity}
            </Badge>
            <Badge className={getStatusColor(bug.status)}>
              {bug.status.replace('_', ' ')}
            </Badge>
            <Badge variant="outline">
              {bug.category}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Description</h4>
            <p className="text-sm text-muted-foreground">{bug.description}</p>
          </div>

          {bug.steps_to_reproduce && (
            <div>
              <h4 className="font-medium mb-2">Steps to Reproduce</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {bug.steps_to_reproduce}
              </p>
            </div>
          )}

          {bug.expected_behavior && (
            <div>
              <h4 className="font-medium mb-2">Expected Behavior</h4>
              <p className="text-sm text-muted-foreground">{bug.expected_behavior}</p>
            </div>
          )}

          {bug.actual_behavior && (
            <div>
              <h4 className="font-medium mb-2">Actual Behavior</h4>
              <p className="text-sm text-muted-foreground">{bug.actual_behavior}</p>
            </div>
          )}

          {bug.tags && bug.tags.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Tags</h4>
              <div className="flex flex-wrap gap-1">
                {bug.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{bug.profiles?.display_name || 'Anonymous'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{formatDistanceToNow(new Date(bug.created_at), { addSuffix: true })}</span>
            </div>
          </div>

          {canEdit && (
            <div className="space-y-3 pt-4 border-t">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select value={bug.status} onValueChange={updateBugStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Severity</label>
                  <Select value={bug.severity} onValueChange={updateBugSeverity}>
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
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comments Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageCircle className="h-5 w-5" />
            Comments ({comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="border-l-2 border-muted pl-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-sm">
                  {comment.profiles?.display_name || 'Anonymous'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {comment.comment}
              </p>
            </div>
          ))}

          {user && (
            <div className="pt-4 border-t space-y-3">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                rows={3}
              />
              <Button 
                onClick={addComment} 
                disabled={loading || !newComment.trim()}
                size="sm"
              >
                {loading ? 'Adding...' : 'Add Comment'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BugDetails;