import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { LoginForm } from '@/components/auth/LoginForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, Clock, Trophy, Users, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  category: string;
  level: string;
  progress: number;
  enrolled_at: string;
  instructor: {
    display_name: string;
  };
  _count: {
    lessons: number;
  };
}

const Dashboard = () => {
  const { user, loading } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    totalHours: 0,
    streakDays: 0,
  });

  useEffect(() => {
    if (user) {
      fetchEnrolledCourses();
      fetchUserStats();
    }
  }, [user]);

  const fetchEnrolledCourses = async () => {
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        progress,
        enrolled_at,
        courses:course_id (
          id,
          title,
          description,
          thumbnail_url,
          category,
          level,
          profiles:instructor_id (
            display_name
          )
        )
      `)
      .eq('user_id', user?.id);

    if (error) {
      console.error('Error fetching courses:', error);
      return;
    }

    // Transform data to match our interface
    const transformedCourses = data.map((enrollment: any) => ({
      id: enrollment.courses.id,
      title: enrollment.courses.title,
      description: enrollment.courses.description,
      thumbnail_url: enrollment.courses.thumbnail_url,
      category: enrollment.courses.category,
      level: enrollment.courses.level,
      progress: enrollment.progress,
      enrolled_at: enrollment.enrolled_at,
      instructor: {
        display_name: enrollment.courses.profiles?.display_name || 'Unknown',
      },
      _count: {
        lessons: 0, // Would need separate query for lesson count
      },
    }));

    setCourses(transformedCourses);
  };

  const fetchUserStats = async () => {
    // Fetch basic stats - in a real app, these would be more sophisticated
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('progress')
      .eq('user_id', user?.id);

    if (enrollments) {
      const totalCourses = enrollments.length;
      const completedCourses = enrollments.filter(e => e.progress === 100).length;
      
      setStats({
        totalCourses,
        completedCourses,
        totalHours: Math.floor(Math.random() * 50) + 10, // Mock data
        streakDays: Math.floor(Math.random() * 30) + 1, // Mock data
      });
    }
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
            <h1 className="text-3xl font-bold mb-2">Welcome to TopOne Academy</h1>
            <p className="text-muted-foreground">Sign in to access your dashboard</p>
          </div>
          <LoginForm />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="content-container py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Welcome back!</h1>
            <p className="text-muted-foreground">Continue your learning journey</p>
          </div>
          <Link to="/admin">
            <Button variant="outline">Admin Panel</Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Enrolled Courses</p>
                  <p className="text-2xl font-bold">{stats.totalCourses}</p>
                </div>
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{stats.completedCourses}</p>
                </div>
                <Trophy className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Learning Hours</p>
                  <p className="text-2xl font-bold">{stats.totalHours}</p>
                </div>
                <Clock className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Streak Days</p>
                  <p className="text-2xl font-bold">{stats.streakDays}</p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enrolled Courses */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">My Courses</h2>
            <Link to="/courses">
              <Button variant="outline">Browse All Courses</Button>
            </Link>
          </div>

          {courses.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No courses yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start your learning journey by enrolling in a course
                </p>
                <Link to="/courses">
                  <Button>Browse Courses</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-muted rounded-t-lg relative overflow-hidden">
                    {course.thumbnail_url ? (
                      <img
                        src={course.thumbnail_url}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <Badge variant="secondary">{course.level}</Badge>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        by {course.instructor.display_name}
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {course.description}
                      </p>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                    </div>

                    <Link to={`/course/${course.id}`}>
                      <Button className="w-full">
                        <Play className="w-4 h-4 mr-2" />
                        Continue Learning
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link to="/community">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Users className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Join Community</h3>
                  <p className="text-muted-foreground">Connect with other learners</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/courses">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <BookOpen className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Browse Courses</h3>
                  <p className="text-muted-foreground">Discover new learning paths</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/achievements">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Trophy className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Achievements</h3>
                  <p className="text-muted-foreground">View your progress</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;