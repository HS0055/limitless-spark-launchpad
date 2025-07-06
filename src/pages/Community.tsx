import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { LoginForm } from '@/components/auth/LoginForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Users, Plus, MessageCircle, Heart, Share, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Group {
  id: string;
  name: string;
  description: string;
  image_url: string;
  is_private: boolean;
  created_at: string;
  created_by: string;
  _count: {
    members: number;
    posts: number;
  };
  is_member?: boolean;
}

interface Post {
  id: string;
  title: string;
  content: string;
  image_url: string;
  created_at: string;
  user: {
    display_name: string;
  };
  group: {
    name: string;
  };
  _count: {
    comments: number;
  };
}

const Community = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [groups, setGroups] = useState<Group[]>([]);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [isCreateGroupDialogOpen, setIsCreateGroupDialogOpen] = useState(false);
  const [groupFormData, setGroupFormData] = useState({
    name: '',
    description: '',
    is_private: false,
  });

  useEffect(() => {
    if (user) {
      fetchGroups();
      fetchRecentPosts();
    }
  }, [user]);

  const fetchGroups = async () => {
    const { data, error } = await supabase
      .from('groups')
      .select(`
        *,
        group_members!inner(user_id)
      `)
      .limit(6);

    if (error) {
      console.error('Error fetching groups:', error);
      return;
    }

    // Transform data to include member counts
    const transformedGroups = data.map((group: any) => ({
      ...group,
      _count: {
        members: Math.floor(Math.random() * 50) + 5, // Mock data
        posts: Math.floor(Math.random() * 100) + 10, // Mock data
      },
      is_member: Math.random() > 0.5, // Mock membership status
    }));

    setGroups(transformedGroups);
  };

  const fetchRecentPosts = async () => {
    const { data, error } = await supabase
      .from('group_posts')
      .select(`
        *,
        profiles:user_id(display_name),
        groups:group_id(name)
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching posts:', error);
      return;
    }

    const transformedPosts = data.map((post: any) => ({
      ...post,
      user: {
        display_name: post.profiles?.display_name || 'Anonymous',
      },
      group: {
        name: post.groups?.name || 'Unknown Group',
      },
      _count: {
        comments: Math.floor(Math.random() * 20), // Mock data
      },
    }));

    setRecentPosts(transformedPosts);
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data, error } = await supabase
      .from('groups')
      .insert([
        {
          ...groupFormData,
          created_by: user?.id,
        },
      ])
      .select()
      .single();

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to create group',
        variant: 'destructive',
      });
      return;
    }

    // Add creator as group member
    await supabase.from('group_members').insert([
      {
        group_id: data.id,
        user_id: user?.id,
        role: 'admin',
      },
    ]);

    toast({
      title: 'Success',
      description: 'Group created successfully',
    });

    setIsCreateGroupDialogOpen(false);
    setGroupFormData({
      name: '',
      description: '',
      is_private: false,
    });
    fetchGroups();
  };

  const joinGroup = async (groupId: string) => {
    const { error } = await supabase
      .from('group_members')
      .insert([
        {
          group_id: groupId,
          user_id: user?.id,
        },
      ]);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to join group',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Success',
      description: 'Successfully joined the group',
    });

    fetchGroups();
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
            <h1 className="text-3xl font-bold mb-2">Join the Community</h1>
            <p className="text-muted-foreground">Sign in to connect with other learners</p>
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
            <h1 className="text-3xl font-bold">Community</h1>
            <p className="text-muted-foreground">Connect, learn, and grow together</p>
          </div>
          <Dialog open={isCreateGroupDialogOpen} onOpenChange={setIsCreateGroupDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Group
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Group</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateGroup} className="space-y-4">
                <Input
                  placeholder="Group Name"
                  value={groupFormData.name}
                  onChange={(e) => setGroupFormData({ ...groupFormData, name: e.target.value })}
                  required
                />
                <Textarea
                  placeholder="Group Description"
                  value={groupFormData.description}
                  onChange={(e) => setGroupFormData({ ...groupFormData, description: e.target.value })}
                  required
                />
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="private"
                    checked={groupFormData.is_private}
                    onChange={(e) => setGroupFormData({ ...groupFormData, is_private: e.target.checked })}
                  />
                  <label htmlFor="private" className="text-sm">Private Group</label>
                </div>
                <Button type="submit" className="w-full">Create Group</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Popular Groups */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Popular Groups</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {groups.map((group) => (
                  <Card key={group.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{group.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {group._count.members} members
                            </p>
                          </div>
                        </div>
                        {group.is_private && (
                          <Badge variant="secondary">Private</Badge>
                        )}
                      </div>
                      
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {group.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{group._count.posts} posts</span>
                          <span>•</span>
                          <span>{formatDistanceToNow(new Date(group.created_at))} ago</span>
                        </div>
                        
                        {group.is_member ? (
                          <Button variant="outline" size="sm">Joined</Button>
                        ) : (
                          <Button size="sm" onClick={() => joinGroup(group.id)}>
                            Join
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Recent Posts */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Recent Posts</h2>
              <div className="space-y-4">
                {recentPosts.map((post) => (
                  <Card key={post.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <Avatar>
                          <AvatarFallback>
                            {post.user.display_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-semibold">{post.user.display_name}</span>
                            <span className="text-muted-foreground">in</span>
                            <Badge variant="outline">{post.group.name}</Badge>
                            <span className="text-muted-foreground text-sm">
                              {formatDistanceToNow(new Date(post.created_at))} ago
                            </span>
                          </div>
                          
                          {post.title && (
                            <h4 className="font-semibold mb-2">{post.title}</h4>
                          )}
                          
                          <p className="text-muted-foreground mb-4">{post.content}</p>
                          
                          <div className="flex items-center space-x-4">
                            <Button variant="ghost" size="sm">
                              <Heart className="w-4 h-4 mr-1" />
                              Like
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MessageCircle className="w-4 h-4 mr-1" />
                              {post._count.comments} Comments
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Share className="w-4 h-4 mr-1" />
                              Share
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Community Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Groups</span>
                  <span className="font-semibold">{groups.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Members</span>
                  <span className="font-semibold">1,234</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Posts This Week</span>
                  <span className="font-semibold">89</span>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Calendar className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <h4 className="font-semibold text-sm">Weekly Study Group</h4>
                      <p className="text-xs text-muted-foreground">Tomorrow at 7:00 PM</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Calendar className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <h4 className="font-semibold text-sm">Business Workshop</h4>
                      <p className="text-xs text-muted-foreground">Friday at 2:00 PM</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;