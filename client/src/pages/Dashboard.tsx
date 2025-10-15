import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Edit, Settings, LogOut, FileText, Eye, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";

interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  bio: string | null;
  avatar: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  authorId: string | null;
  categoryId: string | null;
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      // First check if user is authenticated
      const userResponse = await fetch("/api/me");
      if (userResponse.ok) {
        const userData = await userResponse.json();
        const currentUser = userData.user;
        if (!currentUser) {
          // User not authenticated, redirect to login
          setLocation("/login");
          return;
        }
        setUser(currentUser);

        // Now fetch user's articles since we know they're authenticated
        const [publishedResponse, draftsResponse] = await Promise.all([
          fetch("/api/my-published-articles"),
          fetch("/api/drafts")
        ]);

        let allArticles: Article[] = [];

        if (publishedResponse.ok) {
          const publishedData = await publishedResponse.json();
          allArticles = [...allArticles, ...publishedData];
        }

        if (draftsResponse.ok) {
          const draftsData = await draftsResponse.json();
          allArticles = [...allArticles, ...draftsData];
        }

        setArticles(allArticles);
      } else {
        // User not authenticated, redirect to login
        setLocation("/login");
        return;
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      setLocation("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  const publishedArticles = articles.filter(article => article.published);
  const draftArticles = articles.filter(article => !article.published);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Welcome back, {user.name}!
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setLocation("/editor")} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Write New Article
            </Button>
            <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.avatar || undefined} />
                  <AvatarFallback className="text-lg">
                    {user.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{user.name}</h3>
                  <p className="text-sm text-muted-foreground">@{user.username}</p>
                  <Badge variant={user.role === "admin" ? "default" : "secondary"} className="mt-1">
                    {user.role}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Email:</span>
                  <span>{user.email}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Member since:</span>
                  <span>{formatDate(user.createdAt)}</span>
                </div>
                {user.bio && (
                  <div className="pt-2">
                    <p className="text-sm text-muted-foreground mb-1">Bio:</p>
                    <p className="text-sm">{user.bio}</p>
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                className="w-full flex items-center gap-2"
                onClick={() => setLocation("/profile")}
              >
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>
            </CardContent>
          </Card>

          {/* Articles Overview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <FileText className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold">{articles.length}</p>
                      <p className="text-sm text-muted-foreground">Total Articles</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <Eye className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold">{publishedArticles.length}</p>
                      <p className="text-sm text-muted-foreground">Published</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <Edit className="h-8 w-8 text-orange-500" />
                    <div>
                      <p className="text-2xl font-bold">{draftArticles.length}</p>
                      <p className="text-sm text-muted-foreground">Drafts</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Articles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Your Articles
                </CardTitle>
                <CardDescription>
                  Manage your published articles and drafts
                </CardDescription>
              </CardHeader>
              <CardContent>
                {articles.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No articles yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start writing your first article to share your thoughts with the world.
                    </p>
                    <Button onClick={() => setLocation("/editor")}>
                      <Plus className="h-4 w-4 mr-2" />
                      Write Your First Article
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {articles.slice(0, 5).map((article) => (
                      <div
                        key={article.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{article.title}</h4>
                            <Badge variant={article.published ? "default" : "secondary"}>
                              {article.published ? "Published" : "Draft"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(article.createdAt)}
                            </span>
                            {article.excerpt && (
                              <span className="line-clamp-1">{article.excerpt}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setLocation(`/article/${article.slug}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setLocation(`/editor?id=${article.id}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {articles.length > 5 && (
                      <div className="text-center pt-4">
                        <Button variant="outline" onClick={() => setLocation('/articles')}>
                          View All Articles ({articles.length})
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}