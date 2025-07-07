import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Grid, 
  Star, 
  Download, 
  Search,
  Filter,
  Layout,
  FileText,
  Store,
  Briefcase,
  Camera,
  Heart
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Template {
  id: string;
  name: string;
  description: string;
  thumbnail_url: string;
  category: string;
  page_data: any;
  components_data: any;
  is_active: boolean;
  created_at: string;
}

interface TemplateManagerProps {
  onApplyTemplate: (template: Template) => void;
}

const TemplateManager = ({ onApplyTemplate }: TemplateManagerProps) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { toast } = useToast();

  const categories = [
    { id: 'all', name: 'All Templates', icon: Grid },
    { id: 'business', name: 'Business', icon: Briefcase },
    { id: 'portfolio', name: 'Portfolio', icon: Camera },
    { id: 'blog', name: 'Blog', icon: FileText },
    { id: 'ecommerce', name: 'E-commerce', icon: Store },
    { id: 'landing', name: 'Landing Page', icon: Layout },
    { id: 'personal', name: 'Personal', icon: Heart }
  ];

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('editor_templates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Failed to load templates:', error);
      toast({
        title: "Error",
        description: "Failed to load templates",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Mock templates for demonstration
  const mockTemplates: Template[] = [
    {
      id: 'mock-1',
      name: 'Modern Business',
      description: 'Professional business landing page with hero section, services, and contact form',
      thumbnail_url: '/api/placeholder/300/200',
      category: 'business',
      page_data: {},
      components_data: [],
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'mock-2',
      name: 'Creative Portfolio',
      description: 'Showcase your work with this stunning portfolio template',
      thumbnail_url: '/api/placeholder/300/200',
      category: 'portfolio',
      page_data: {},
      components_data: [],
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'mock-3',
      name: 'Blog Starter',
      description: 'Clean and minimal blog design perfect for writers',
      thumbnail_url: '/api/placeholder/300/200',
      category: 'blog',
      page_data: {},
      components_data: [],
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'mock-4',
      name: 'E-commerce Store',
      description: 'Complete online store template with product showcase',
      thumbnail_url: '/api/placeholder/300/200',
      category: 'ecommerce',
      page_data: {},
      components_data: [],
      is_active: true,
      created_at: new Date().toISOString()
    }
  ];

  const allTemplates = [...filteredTemplates, ...mockTemplates];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Templates</h3>
        <Badge variant="outline" className="text-xs">
          {allTemplates.length} Available
        </Badge>
      </div>

      {/* Search and Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            <TabsTrigger value="business" className="text-xs">Business</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-2 gap-2">
        {categories.slice(0, 6).map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            className="justify-start text-xs h-8"
            onClick={() => setSelectedCategory(category.id)}
          >
            <category.icon className="w-3 h-3 mr-2" />
            {category.name}
          </Button>
        ))}
      </div>

      {/* Templates Grid */}
      <ScrollArea className="h-[calc(100vh-400px)]">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-24 bg-muted rounded mb-3"></div>
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : allTemplates.length === 0 ? (
          <div className="text-center py-8">
            <Grid className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h4 className="font-medium mb-2">No Templates Found</h4>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {allTemplates.map((template) => (
              <Card 
                key={template.id}
                className="cursor-pointer hover:shadow-md transition-all duration-200 group"
                onClick={() => onApplyTemplate(template)}
              >
                <CardContent className="p-4">
                  {/* Thumbnail */}
                  <div className="aspect-video bg-muted rounded-lg mb-3 overflow-hidden">
                    {template.thumbnail_url ? (
                      <img 
                        src={template.thumbnail_url}
                        alt={template.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Layout className="w-8 h-8" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-sm">{template.name}</h4>
                      <Badge variant="secondary" className="text-xs capitalize">
                        {template.category}
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {template.description}
                    </p>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="w-3 h-3 fill-current text-yellow-400" />
                        <span>4.8</span>
                        <span>•</span>
                        <span>1.2k uses</span>
                      </div>
                      
                      <Button size="sm" className="h-7 text-xs">
                        <Download className="w-3 h-3 mr-1" />
                        Use Template
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer Info */}
      <div className="pt-4 border-t text-center">
        <p className="text-xs text-muted-foreground">
          More templates coming soon! 
          <br />
          Create your own and share with the community.
        </p>
      </div>
    </div>
  );
};

export default TemplateManager;