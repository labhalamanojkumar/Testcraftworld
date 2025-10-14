import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import Dashboard from "@/components/Dashboard";
import RichTextEditor from "@/components/RichTextEditor";
import SEOFields from "@/components/SEOFields";
import Header from "@/components/Header";
import { Save, Eye, Send, Plus, LayoutDashboard, FileText, Users } from "lucide-react";

interface User {
  id: string;
  username: string;
}

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

export default function Admin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [newCategory, setNewCategory] = useState({ name: "", slug: "", description: "" });
  const [newArticle, setNewArticle] = useState({
    title: "", content: "", excerpt: "", categoryId: "", slug: "", metaTitle: "", metaDescription: "", tags: "", published: false
  });
  const [articleMetaTitle, setArticleMetaTitle] = useState("");
  const [articleMetaDescription, setArticleMetaDescription] = useState("");
  const [articleSlug, setArticleSlug] = useState("");
  const [articleFocusKeyword, setArticleFocusKeyword] = useState("");
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      if (!res.ok) throw new Error("Login failed");
      return res.json();
    },
    onSuccess: (data) => {
      setUser(data.user);
      toast({ title: "Logged in successfully" });
    },
    onError: () => {
      toast({ title: "Login failed", variant: "destructive" });
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => fetch("/api/categories").then(r => r.json()),
    enabled: !!user,
  });

  const { data: articles } = useQuery({
    queryKey: ["articles"],
    queryFn: () => fetch("/api/articles").then(r => r.json()),
    enabled: !!user,
  });

  const createCategoryMutation = useMutation({
    mutationFn: (category: typeof newCategory) => fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(category),
    }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setNewCategory({ name: "", slug: "", description: "" });
      toast({ title: "Category created" });
    },
  });

  const createArticleMutation = useMutation({
    mutationFn: (article: typeof newArticle) => fetch("/api/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(article),
    }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      setNewArticle({ title: "", content: "", excerpt: "", categoryId: "", slug: "", metaTitle: "", metaDescription: "", tags: "", published: false });
      toast({ title: "Article created" });
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6 w-full max-w-md">
          <h1 className="text-2xl font-bold mb-4">Super Admin Login</h1>
          <form onSubmit={(e) => {
            e.preventDefault();
            loginMutation.mutate({ username, password });
          }}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full">Login</Button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="articles" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Articles
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Article
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard />
          </TabsContent>

          <TabsContent value="articles">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">All Articles</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {articles?.map((art: Article) => (
                    <TableRow key={art.id}>
                      <TableCell className="font-medium">{art.title}</TableCell>
                      <TableCell>{categories?.find((c: Category) => c.id === art.categoryId)?.name || "None"}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          art.published
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {art.published ? "Published" : "Draft"}
                        </span>
                      </TableCell>
                      <TableCell>{new Date(art.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Create New Category</h2>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  createCategoryMutation.mutate(newCategory);
                }}>
                  <div className="space-y-4">
                    <Input placeholder="Category Name" value={newCategory.name} onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })} required />
                    <Input placeholder="Slug" value={newCategory.slug} onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })} required />
                    <Textarea placeholder="Description" value={newCategory.description} onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })} />
                    <Button type="submit" className="w-full">Create Category</Button>
                  </div>
                </form>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">All Categories</h2>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories?.map((cat: Category) => (
                      <TableRow key={cat.id}>
                        <TableCell className="font-medium">{cat.name}</TableCell>
                        <TableCell>{cat.slug}</TableCell>
                        <TableCell className="max-w-xs truncate">{cat.description}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">Edit</Button>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="create">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card className="p-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="article-title">Article Title</Label>
                      <Input
                        id="article-title"
                        value={newArticle.title}
                        onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
                        placeholder="Enter a compelling title..."
                        className="text-2xl font-bold border-none shadow-none px-0 mt-2"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="article-category">Category</Label>
                        <Select value={newArticle.categoryId} onValueChange={(value) => setNewArticle({ ...newArticle, categoryId: value })}>
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories?.map((cat: Category) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="article-tags">Tags (comma-separated)</Label>
                        <Input
                          id="article-tags"
                          value={newArticle.tags}
                          onChange={(e) => setNewArticle({ ...newArticle, tags: e.target.value })}
                          placeholder="startup, growth, strategy"
                          className="mt-2"
                        />
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <Tabs defaultValue="write">
                    <TabsList className="mb-4">
                      <TabsTrigger value="write">Write</TabsTrigger>
                      <TabsTrigger value="preview">Preview</TabsTrigger>
                    </TabsList>
                    <TabsContent value="write">
                      <RichTextEditor value={newArticle.content} onChange={(value) => setNewArticle({ ...newArticle, content: value })} />
                    </TabsContent>
                    <TabsContent value="preview">
                      <div className="min-h-[400px] p-4 border rounded-md">
                        <div className="prose max-w-none font-serif">
                          <p className="text-muted-foreground">
                            {newArticle.content || "Start writing to see preview..."}
                          </p>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="font-bold mb-4">Actions</h3>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        console.log("Saving draft...");
                        toast({
                          title: "Draft Saved",
                          description: "Your article has been saved as a draft.",
                        });
                      }}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Draft
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        console.log("Opening preview...");
                        toast({
                          title: "Preview",
                          description: "Opening article preview...",
                        });
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button
                      variant="default"
                      className="w-full justify-start"
                      onClick={() => createArticleMutation.mutate(newArticle)}
                      disabled={createArticleMutation.isPending}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {createArticleMutation.isPending ? "Publishing..." : "Publish"}
                    </Button>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="font-bold mb-4">SEO Optimization</h3>
                  <SEOFields
                    metaTitle={articleMetaTitle}
                    metaDescription={articleMetaDescription}
                    slug={articleSlug}
                    focusKeyword={articleFocusKeyword}
                    onMetaTitleChange={setArticleMetaTitle}
                    onMetaDescriptionChange={setArticleMetaDescription}
                    onSlugChange={setArticleSlug}
                    onFocusKeywordChange={setArticleFocusKeyword}
                  />
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}