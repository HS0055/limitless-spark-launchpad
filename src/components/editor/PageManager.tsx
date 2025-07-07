import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  Copy, 
  Settings,
  Globe,
  FileText,
  Calendar
} from 'lucide-react';
import { EditorPage } from '@/pages/EditorApp';
import { formatDistance } from 'date-fns';

interface PageManagerProps {
  pages: EditorPage[];
  currentPage: EditorPage | null;
  onSelectPage: (page: EditorPage) => void;
  onCreatePage: () => void;
  onDeletePage: (pageId: string) => void;
}

const PageManager = ({ 
  pages, 
  currentPage, 
  onSelectPage, 
  onCreatePage, 
  onDeletePage 
}: PageManagerProps) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [newPageSlug, setNewPageSlug] = useState('');

  const handleCreatePage = () => {
    if (newPageName.trim()) {
      onCreatePage();
      setNewPageName('');
      setNewPageSlug('');
      setIsCreateDialogOpen(false);
    }
  };

  const generateSlugFromName = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (name: string) => {
    setNewPageName(name);
    if (!newPageSlug || newPageSlug === generateSlugFromName(newPageName)) {
      setNewPageSlug(generateSlugFromName(name));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Pages</h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Page
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Page</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="page-name">Page Name</Label>
                <Input
                  id="page-name"
                  value={newPageName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="About Us"
                />
              </div>
              <div>
                <Label htmlFor="page-slug">URL Slug</Label>
                <Input
                  id="page-slug"
                  value={newPageSlug}
                  onChange={(e) => setNewPageSlug(e.target.value)}
                  placeholder="about-us"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  yoursite.com/{newPageSlug || 'page-slug'}
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePage} disabled={!newPageName.trim()}>
                  Create Page
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="h-[calc(100vh-300px)]">
        <div className="space-y-2">
          {pages.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h4 className="font-medium mb-2">No Pages Yet</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first page to get started
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Page
              </Button>
            </div>
          ) : (
            pages.map((page) => (
              <Card 
                key={page.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  currentPage?.id === page.id 
                    ? 'ring-2 ring-primary border-primary' 
                    : 'hover:border-primary/50'
                }`}
                onClick={() => onSelectPage(page)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-sm truncate">{page.name}</h4>
                        <div className="flex items-center gap-1">
                          {page.isPublished ? (
                            <Badge variant="secondary" className="text-xs">
                              <Globe className="w-3 h-3 mr-1" />
                              Live
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              <EyeOff className="w-3 h-3 mr-1" />
                              Draft
                            </Badge>
                          )}
                          {page.isTemplate && (
                            <Badge variant="secondary" className="text-xs">
                              Template
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        <p className="truncate">/{page.slug}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span>{page.components.length} components</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {page.id.startsWith('temp-') ? 'Unsaved' : 'Saved'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle duplicate page
                        }}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle page settings
                        }}
                      >
                        <Settings className="w-3 h-3" />
                      </Button>
                      {!page.id.startsWith('temp-') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Are you sure you want to delete this page?')) {
                              onDeletePage(page.id);
                            }
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {page.description && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                      {page.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Quick Stats */}
      <div className="pt-4 border-t">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary">{pages.length}</div>
            <div className="text-xs text-muted-foreground">Total Pages</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {pages.filter(p => p.isPublished).length}
            </div>
            <div className="text-xs text-muted-foreground">Published</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageManager;