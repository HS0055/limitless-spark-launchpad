import { useState, useEffect } from 'react';
import { Plus, Search, Filter, AlertTriangle, Bug, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import BugReportForm from '@/components/bug-tracker/BugReportForm';
import BugList from '@/components/bug-tracker/BugList';
import BugDetails from '@/components/bug-tracker/BugDetails';
import BugStats from '@/components/bug-tracker/BugStats';

interface BugReport {
  id: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  category: string;
  reporter_id: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  steps_to_reproduce?: string;
  expected_behavior?: string;
  actual_behavior?: string;
  browser_info?: string;
  system_info?: string;
  tags?: string[];
  profiles?: {
    display_name?: string;
  };
}

const BugTracker = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bugs, setBugs] = useState<BugReport[]>([]);
  const [filteredBugs, setFilteredBugs] = useState<BugReport[]>([]);
  const [selectedBug, setSelectedBug] = useState<BugReport | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBugs();
  }, []);

  useEffect(() => {
    filterBugs();
  }, [bugs, searchQuery, statusFilter, severityFilter]);

  const fetchBugs = async () => {
    try {
      const { data, error } = await supabase
        .from('bug_reports')
        .select(`
          *,
          profiles(display_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBugs((data as any) || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch bug reports",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterBugs = () => {
    let filtered = bugs;

    if (searchQuery) {
      filtered = filtered.filter(bug =>
        bug.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bug.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(bug => bug.status === statusFilter);
    }

    if (severityFilter !== 'all') {
      filtered = filtered.filter(bug => bug.severity === severityFilter);
    }

    setFilteredBugs(filtered);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-destructive text-destructive-foreground';
      case 'in_progress': return 'bg-orange-500 text-white';
      case 'resolved': return 'bg-green-500 text-white';
      case 'closed': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Bug className="mx-auto h-12 w-12 text-primary mb-2" />
            <CardTitle>Authentication Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              Please log in to access the bug tracking system.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Bug className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Bug Tracker</h1>
              <p className="text-muted-foreground">Track and manage critical system issues</p>
            </div>
          </div>
          
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Report Bug
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Report a New Bug</DialogTitle>
              </DialogHeader>
              <BugReportForm 
                onSuccess={() => {
                  setIsFormOpen(false);
                  fetchBugs();
                  toast({
                    title: "Success",
                    description: "Bug report submitted successfully"
                  });
                }}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <BugStats bugs={bugs} />

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search bugs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bug List */}
          <div className="lg:col-span-2">
            <BugList 
              bugs={filteredBugs}
              onSelectBug={(bug) => setSelectedBug(bug)}
              selectedBug={selectedBug}
              getSeverityColor={getSeverityColor}
              getStatusColor={getStatusColor}
            />
          </div>

          {/* Bug Details */}
          <div className="lg:col-span-1">
            {selectedBug ? (
              <BugDetails 
                bug={selectedBug}
                onUpdate={fetchBugs}
                getSeverityColor={getSeverityColor}
                getStatusColor={getStatusColor}
              />
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center text-muted-foreground">
                    <Bug className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Select a bug to view details</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BugTracker;