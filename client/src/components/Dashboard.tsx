import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Eye, FileText, Users, TrendingUp, Calendar, Clock, BarChart3 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  categoryId: string | null;
  authorId: string;
  slug: string;
  metaTitle: string | null;
  metaDescription: string | null;
  tags: string | null;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AnalyticsData {
  totalArticles: number;
  totalPublishedArticles: number;
  totalCategories: number;
  totalViews: number;
  topArticles: Array<{ id: string; title: string; viewCount: number; slug: string }>;
  topCategories: Array<{ id: string; name: string; viewCount: number; slug: string }>;
}

export default function Dashboard() {
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => fetch("/api/categories").then(r => r.json()),
  });

  const { data: articles } = useQuery<Article[]>({
    queryKey: ["articles"],
    queryFn: () => fetch("/api/articles").then(r => r.json()),
  });

  const { data: analytics } = useQuery<AnalyticsData>({
    queryKey: ["analytics"],
    queryFn: () => fetch("/api/analytics").then(r => r.json()),
  });

  // Calculate statistics
  const totalArticles = articles?.length || 0;
  const publishedArticles = articles?.filter(a => a.published).length || 0;
  const draftArticles = totalArticles - publishedArticles;
  const totalCategories = categories?.length || 0;

  // Use real analytics data if available, otherwise fallback to basic counts
  const totalViews = analytics?.totalViews || 0;
  const topArticles = analytics?.topArticles || [];
  const topCategories = analytics?.topCategories || [];

  // Recent articles (last 5)
  const recentArticles = articles
    ?.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5) || [];

  const stats = [
    {
      title: "Total Articles",
      value: totalArticles,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Published",
      value: publishedArticles,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Drafts",
      value: draftArticles,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Categories",
      value: totalCategories,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  const viewStats = [
    {
      title: "Total Views",
      value: totalViews.toLocaleString(),
      change: analytics ? "Real-time data" : "Analytics not available",
      icon: Eye,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
    },
    {
      title: "Article Views",
      value: topArticles.reduce((sum, article) => sum + article.viewCount, 0).toLocaleString(),
      change: `${analytics?.totalPublishedArticles || 0} published articles`,
      icon: FileText,
      color: "text-cyan-600",
      bgColor: "bg-cyan-100",
    },
    {
      title: "Category Views",
      value: topCategories.reduce((sum, category) => sum + category.viewCount, 0).toLocaleString(),
      change: `${analytics?.totalCategories || 0} categories`,
      icon: BarChart3,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Dashboard Overview</h2>
        <p className="text-muted-foreground">Real-time insights and content management</p>
      </div>

      {/* Content Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* View Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {viewStats.map((stat) => (
          <Card key={stat.title} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-green-600 font-medium">{stat.change} from last period</p>
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Articles */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">Recent Articles</h3>
        <div className="space-y-3">
          {recentArticles.length > 0 ? (
            recentArticles.map((article) => (
              <div key={article.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium truncate">{article.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {categories?.find(c => c.id === article.categoryId)?.name || "Uncategorized"} •
                    {new Date(article.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    article.published
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {article.published ? "Published" : "Draft"}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-8">No articles yet. Create your first article!</p>
          )}
        </div>
      </Card>

      {/* Top Performing Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Articles */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Top Articles by Views
          </h3>
          <div className="space-y-3">
            {topArticles.length > 0 ? (
              topArticles.slice(0, 5).map((article, index) => (
                <div key={article.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-muted-foreground w-6">
                      #{index + 1}
                    </span>
                    <div className="flex-1">
                      <h4 className="font-medium truncate text-sm">{article.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {article.viewCount} views
                      </p>
                    </div>
                  </div>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8 text-sm">
                No view data available yet. Views will appear here once articles are accessed.
              </p>
            )}
          </div>
        </Card>

        {/* Top Categories */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Top Categories by Views
          </h3>
          <div className="space-y-3">
            {topCategories.length > 0 ? (
              topCategories.slice(0, 5).map((category, index) => (
                <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-muted-foreground w-6">
                      #{index + 1}
                    </span>
                    <div className="flex-1">
                      <h4 className="font-medium truncate text-sm">{category.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {category.viewCount} views
                      </p>
                    </div>
                  </div>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8 text-sm">
                No view data available yet. Views will appear here once categories are accessed.
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
            <FileText className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <h4 className="font-medium">New Article</h4>
            <p className="text-sm text-muted-foreground">Create a new blog post</p>
          </div>
          <div className="text-center p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
            <Users className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <h4 className="font-medium">Add Category</h4>
            <p className="text-sm text-muted-foreground">Create a new category</p>
          </div>
          <div className="text-center p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
            <Eye className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <h4 className="font-medium">View Analytics</h4>
            <p className="text-sm text-muted-foreground">Check site performance</p>
          </div>
        </div>
      </Card>
    </div>
  );
}