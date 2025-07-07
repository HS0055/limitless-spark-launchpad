import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Upload, Users, BookOpen, Video, FileText } from 'lucide-react';
import { LoginForm } from '@/components/auth/LoginForm';
import { DragDropTextEditor } from '@/components/admin/DragDropTextEditor';

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  category: string;
  level: string;
  price: number;
  is_published: boolean;
  created_at: string;
  _count?: {
    lessons: number;
    enrollments: number;
  };
}

const AdminPanel = () => {
  const { user, userRole, loading } = useAuth();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    level: 'beginner',
    price: 0,
  });

  useEffect(() => {
    if (user && (userRole === 'admin' || userRole === 'instructor')) {
      fetchCourses();
    }
  }, [user, userRole]);

  const fetchCourses = async () => {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('instructor_id', user?.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching courses:', error);
      return;
    }

    setCourses(data || []);
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data, error } = await supabase
      .from('courses')
      .insert([
        {
          ...formData,
          instructor_id: user?.id,
        },
      ])
      .select()
      .single();

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to create course',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Success',
      description: 'Course created successfully',
    });

    setIsCreateDialogOpen(false);
    setFormData({
      title: '',
      description: '',
      category: '',
      level: 'beginner',
      price: 0,
    });
    fetchCourses();
  };

  const togglePublishCourse = async (courseId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('courses')
      .update({ is_published: !currentStatus })
      .eq('id', courseId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update course status',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Success',
      description: `Course ${!currentStatus ? 'published' : 'unpublished'} successfully`,
    });

    fetchCourses();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Admin Access Required</h1>
            <p className="text-muted-foreground">Sign in to access the admin panel</p>
          </div>
          <LoginForm />
        </div>
      </div>
    );
  }

  if (userRole !== 'admin' && userRole !== 'instructor') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">Access Denied</h2>
            <p className="text-muted-foreground mb-4">
              You don't have permission to access the admin panel.
            </p>
            <p className="text-sm text-muted-foreground">
              Contact an administrator to get instructor privileges.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="content-container py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground">Manage your courses and content</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Course
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Course</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateCourse} className="space-y-4">
                <Input
                  placeholder="Course Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
                <Textarea
                  placeholder="Course Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
                <Input
                  placeholder="Category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                />
                <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="Price"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                />
                <Button type="submit" className="w-full">Create Course</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="lessons">Lessons</TabsTrigger>
            <TabsTrigger value="content">Website Content</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="courses">
            <div className="grid grid-cols-1 gap-6">
              {courses.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No courses yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first course to get started
                    </p>
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Course
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                courses.map((course) => (
                  <Card key={course.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                              <BookOpen className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <div>
                              <h3 className="text-xl font-semibold">{course.title}</h3>
                              <p className="text-muted-foreground">{course.category}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant={course.is_published ? 'default' : 'secondary'}>
                                  {course.is_published ? 'Published' : 'Draft'}
                                </Badge>
                                <Badge variant="outline">{course.level}</Badge>
                                <Badge variant="outline">${course.price}</Badge>
                              </div>
                            </div>
                          </div>
                          <p className="text-muted-foreground mb-4">{course.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => togglePublishCourse(course.id, course.is_published)}
                          >
                            {course.is_published ? 'Unpublish' : 'Publish'}
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="lessons">
            <Card>
              <CardHeader>
                <CardTitle>Lesson Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Video className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Lesson Management</h3>
                  <p className="text-muted-foreground mb-4">
                    Select a course to manage its lessons
                  </p>
                  <div className="space-y-4">
                    <Button variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Video
                    </Button>
                    <Button variant="outline">
                      <FileText className="w-4 h-4 mr-2" />
                      Add Resources
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle>Website Content Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <Edit className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Website Text Editor</h3>
                    <p className="text-muted-foreground mb-4">
                      Edit all website texts and translations from here
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                      <Card>
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-2">Navigation & Buttons</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Home</span>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-3 h-3" />
                              </Button>
                            </div>
                            <div className="flex justify-between">
                              <span>Get Started</span>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-3 h-3" />
                              </Button>
                            </div>
                            <div className="flex justify-between">
                              <span>Learn More</span>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-2">Hero Section</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Main Title</span>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-3 h-3" />
                              </Button>
                            </div>
                            <div className="flex justify-between">
                              <span>Subtitle</span>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-3 h-3" />
                              </Button>
                            </div>
                            <div className="flex justify-between">
                              <span>Description</span>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-2">Features Section</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Visual Learning</span>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-3 h-3" />
                              </Button>
                            </div>
                            <div className="flex justify-between">
                              <span>Minute Lessons</span>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-3 h-3" />
                              </Button>
                            </div>
                            <div className="flex justify-between">
                              <span>Gamified Experience</span>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-2">FAQ Section</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Questions & Answers</span>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-3 h-3" />
                              </Button>
                            </div>
                            <div className="flex justify-between">
                              <span>Contact Support</span>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Courses</p>
                      <p className="text-2xl font-bold">{courses.length}</p>
                    </div>
                    <BookOpen className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Published</p>
                      <p className="text-2xl font-bold">
                        {courses.filter(c => c.is_published).length}
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                      <p className="text-2xl font-bold">
                        ${courses.reduce((sum, course) => sum + course.price, 0)}
                      </p>
                    </div>
                    <BookOpen className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Drag & Drop Text Editor - Always Available for Admins */}
      {userRole === 'admin' && <DragDropTextEditor />}
    </div>
  );
};

export default AdminPanel;