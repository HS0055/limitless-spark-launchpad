import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, User } from 'lucide-react';

interface BugReport {
  id: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  category: string;
  reporter_id: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    display_name?: string;
  };
}

interface BugListProps {
  bugs: BugReport[];
  onSelectBug: (bug: BugReport) => void;
  selectedBug: BugReport | null;
  getSeverityColor: (severity: string) => string;
  getStatusColor: (status: string) => string;
}

const BugList = ({ bugs, onSelectBug, selectedBug, getSeverityColor, getStatusColor }: BugListProps) => {
  if (bugs.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No bugs found matching your criteria</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Bug Reports ({bugs.length})</h2>
      {bugs.map((bug) => (
        <Card 
          key={bug.id}
          className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
            selectedBug?.id === bug.id ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => onSelectBug(bug)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg font-medium line-clamp-2">
                {bug.title}
              </CardTitle>
              <div className="flex gap-2 ml-2">
                <Badge className={getSeverityColor(bug.severity)}>
                  {bug.severity}
                </Badge>
                <Badge className={getStatusColor(bug.status)}>
                  {bug.status.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
              {bug.description}
            </p>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>{bug.profiles?.display_name || 'Anonymous'}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {bug.category}
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{formatDistanceToNow(new Date(bug.created_at), { addSuffix: true })}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default BugList;