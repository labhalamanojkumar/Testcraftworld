import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RichTextEditor from "@/components/RichTextEditor";
import SEOFields from "@/components/SEOFields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Save, Eye, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export default function Editor() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { isAuthenticated, loading, user } = useAuth();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [focusKeyword, setFocusKeyword] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, loading, setLocation]);

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => fetch("/api/categories").then(r => r.json()),
  });

  const handleSaveDraft = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save drafts.",
        variant: "destructive",
      });
      return;
    }

    if (!title.trim() || !content.trim()) {
      toast({
        title: "Error",
        description: "Title and content are required to save a draft.",
        variant: "destructive",
      });
      return;
    }

    try {
      const draftData = {
        title: title.trim(),
        content: content.trim(),
        categoryId: category || undefined,
        authorId: user.id,
        tags: tags ? tags.split(',').map(t => t.trim()).filter(t => t) : [],
        slug: slug.trim() || undefined,
        metaTitle: metaTitle.trim() || undefined,
        metaDescription: metaDescription.trim() || undefined,
        focusKeyword: focusKeyword.trim() || undefined,
        published: false, // This is a draft
      };

      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(draftData),
      });

      if (response.ok) {
        const newDraft = await response.json();
        toast({
          title: "Draft Saved",
          description: "Your article has been saved as a draft.",
        });
        // Optionally redirect to drafts page or stay here
      } else {
        const error = await response.json();
        toast({
          title: "Save Failed",
          description: error.message || "Failed to save draft.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Save draft error:', error);
      toast({
        title: "Save Failed",
        description: "An error occurred while saving the draft.",
        variant: "destructive",
      });
    }
  };

  const handlePreview = () => {
    setPreviewOpen(true);
  };

  const handlePublish = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to publish.",
        variant: "destructive",
      });
      return;
    }

    if (!title.trim() || !content.trim() || !category) {
      toast({
        title: "Error",
        description: "Title, content, and category are required.",
        variant: "destructive",
      });
      return;
    }

    try {
      const articleData = {
        title: title.trim(),
        content: content.trim(),
        categoryId: category,
        authorId: user.id,
        tags: tags ? tags.split(',').map(t => t.trim()).filter(t => t) : [],
        slug: slug.trim() || undefined,
        metaTitle: metaTitle.trim() || undefined,
        metaDescription: metaDescription.trim() || undefined,
        focusKeyword: focusKeyword.trim() || undefined,
      };

      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(articleData),
      });

      if (response.ok) {
        const newArticle = await response.json();
        toast({
          title: "Article Published",
          description: "Your article is now live!",
        });
        // Redirect to the article or home
        setLocation(`/articles/${newArticle.id}`);
      } else {
        const error = await response.json();
        toast({
          title: "Publish Failed",
          description: error.message || "Failed to publish article.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Publish error:', error);
      toast({
        title: "Publish Failed",
        description: "An error occurred while publishing.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Create New Article</h1>
            <p className="text-muted-foreground">
              Write engaging content optimized for search engines and readers
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Article Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter a compelling title..."
                      className="text-2xl font-bold border-none shadow-none px-0 mt-2"
                      data-testid="input-article-title"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="mt-2" data-testid="select-category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories?.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="tags">Tags (comma-separated)</Label>
                      <Input
                        id="tags"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="startup, growth, strategy"
                        className="mt-2"
                        data-testid="input-tags"
                      />
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <Tabs defaultValue="write">
                  <TabsList className="mb-4">
                    <TabsTrigger value="write" data-testid="tab-write">Write</TabsTrigger>
                    <TabsTrigger value="preview" data-testid="tab-preview">Preview</TabsTrigger>
                  </TabsList>
                  <TabsContent value="write">
                    <RichTextEditor value={content} onChange={setContent} />
                  </TabsContent>
                  <TabsContent value="preview">
                    <div className="min-h-[400px] p-4 border rounded-md">
                      <div className="prose max-w-none font-serif">
                        <p className="text-muted-foreground">
                          {content || "Start writing to see preview..."}
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
                    onClick={handleSaveDraft}
                    data-testid="button-save-draft"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Draft
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handlePreview}
                    data-testid="button-preview"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button
                    variant="default"
                    className="w-full justify-start"
                    onClick={handlePublish}
                    data-testid="button-publish"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Publish
                  </Button>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-bold mb-4">SEO Optimization</h3>
                <SEOFields
                  metaTitle={metaTitle}
                  metaDescription={metaDescription}
                  slug={slug}
                  focusKeyword={focusKeyword}
                  onMetaTitleChange={setMetaTitle}
                  onMetaDescriptionChange={setMetaDescription}
                  onSlugChange={setSlug}
                  onFocusKeywordChange={setFocusKeyword}
                />
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{title || 'Article Preview'}</DialogTitle>
          </DialogHeader>
          <div className="prose max-w-none">
            {title && <h1>{title}</h1>}
            {content ? (
              <div dangerouslySetInnerHTML={{ __html: content }} />
            ) : (
              <p className="text-muted-foreground">Start writing to see preview...</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
}
