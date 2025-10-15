import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
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
  const search = useSearch();
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
  const [isEditing, setIsEditing] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, loading, setLocation]);

  // Auto-save functionality
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (hasUnsavedChanges && !isSaving && !isPublishing && title.trim() && content.trim() && user) {
        // Auto-save draft silently (without toast notification)
        handleSaveDraft(true).catch(error => {
          console.error('Auto-save failed:', error);
        });
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [hasUnsavedChanges, isSaving, isPublishing, title, content, category, tags, metaTitle, metaDescription, slug, focusKeyword, user, isEditing, editingArticleId]);

  const loadArticleForEditing = async (articleId: string) => {
    try {
      const response = await fetch(`/api/articles/${articleId}`);
      if (response.ok) {
        const article = await response.json();
        
        // Check if user owns this article
        if (article.authorId !== user?.id) {
          toast({
            title: "Access Denied",
            description: "You can only edit your own articles.",
            variant: "destructive",
          });
          setLocation("/dashboard");
          return;
        }

        // Populate form with article data
        setTitle(article.title || "");
        setContent(article.content || "");
        setCategory(article.categoryId || "");
        setTags(article.tags ? JSON.parse(article.tags).join(', ') : "");
        setMetaTitle(article.metaTitle || "");
        setMetaDescription(article.metaDescription || "");
        setSlug(article.slug || "");
        setFocusKeyword(""); // Not stored in current schema
        setIsEditing(true);
        setEditingArticleId(articleId);
      } else {
        toast({
          title: "Error",
          description: "Failed to load article for editing.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading article:", error);
      toast({
        title: "Error",
        description: "Failed to load article for editing.",
        variant: "destructive",
      });
    }
  };

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => fetch("/api/categories").then(r => r.json()),
  });

  const handleSaveDraft = async (silent = false) => {
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
        title: "Validation Error",
        description: "Title and content are required to save a draft.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
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

      const url = isEditing && editingArticleId 
        ? `/api/articles/${editingArticleId}` 
        : '/api/articles';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(draftData),
      });

      if (response.ok) {
        const savedDraft = await response.json();
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
        
        if (!silent) {
          toast({
            title: "Draft Saved",
            description: isEditing ? "Your article draft has been updated successfully." : "Your article has been saved as a draft.",
          });
        }
        
        // If this was a new article, update the editing state
        if (!isEditing) {
          setIsEditing(true);
          setEditingArticleId(savedDraft.id);
          // Update URL without causing a reload
          window.history.replaceState(null, '', `/editor?id=${savedDraft.id}`);
        }
      } else {
        const error = await response.json();
        if (!silent) {
          toast({
            title: "Save Failed",
            description: error.message || "Failed to save draft. Please try again.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Save draft error:', error);
      toast({
        title: "Save Failed",
        description: "An unexpected error occurred while saving. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    setPreviewOpen(true);
  };

  const handlePublish = async () => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to publish.",
        variant: "destructive",
      });
      return;
    }

    if (!title.trim() || !content.trim() || !category) {
      toast({
        title: "Validation Error",
        description: "Title, content, and category are required to publish.",
        variant: "destructive",
      });
      return;
    }

    // Enhanced validation for content quality
    const contentText = content.replace(/<[^>]*>/g, '').trim();
    if (contentText.length < 300) {
      const confirmed = window.confirm(
        `Your article content is quite short (${contentText.length} characters). For better reader engagement, we recommend at least 300 words. Do you want to publish anyway?`
      );
      if (!confirmed) return;
    }

    // SEO validation warnings
    let seoWarnings = [];
    if (!metaTitle.trim()) {
      seoWarnings.push("Meta title is missing");
    } else if (metaTitle.length > 60) {
      seoWarnings.push("Meta title is too long (over 60 characters)");
    }

    if (!metaDescription.trim()) {
      seoWarnings.push("Meta description is missing");
    } else if (metaDescription.length > 160) {
      seoWarnings.push("Meta description is too long (over 160 characters)");
    }

    if (seoWarnings.length > 0) {
      const confirmed = window.confirm(
        `SEO Issues Detected:\n${seoWarnings.join('\n')}\n\nDo you want to publish anyway?`
      );
      if (!confirmed) return;
    }

    setIsPublishing(true);
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
        published: true, // This is a published article
      };

      const url = isEditing && editingArticleId 
        ? `/api/articles/${editingArticleId}` 
        : '/api/articles';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(articleData),
      });

      if (response.ok) {
        const publishedArticle = await response.json();
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
        
        // Fetch category information to get the slug
        const categoryResponse = await fetch(`/api/categories/${category}`);
        if (categoryResponse.ok) {
          const categoryData = await categoryResponse.json();
          toast({
            title: "Article Published",
            description: isEditing ? "Your article has been updated and published successfully!" : "Your article is now live!",
          });
          // Redirect to the category-based article URL
          setLocation(`/category/${categoryData.slug}/${publishedArticle.slug}`);
        } else {
          toast({
            title: "Article Published",
            description: "Article published successfully, but there was an issue with redirection.",
          });
          setLocation('/articles');
        }
      } else {
        const error = await response.json();
        toast({
          title: "Publish Failed",
          description: error.message || "Failed to publish article. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Publish error:', error);
      toast({
        title: "Publish Failed",
        description: "An unexpected error occurred while publishing. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">
              {isEditing ? 'Edit Article' : 'Create New Article'}
            </h1>
            <p className="text-muted-foreground">
              {isEditing 
                ? 'Update your article content and settings'
                : 'Write engaging content optimized for search engines and readers'
              }
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
                      <div className="prose prose-lg max-w-none font-serif">
                        {content ? (
                          <div dangerouslySetInnerHTML={{ __html: content }} />
                        ) : (
                          <p className="text-muted-foreground">Start writing to see preview...</p>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </Card>
            </div>

            <div className="space-y-6">
            <Card className="p-6">
                <h3 className="font-bold mb-4 flex items-center justify-between">
                  Actions
                  {hasUnsavedChanges && (
                    <span className="text-sm text-orange-600 font-normal">
                      • Unsaved changes
                    </span>
                  )}
                </h3>
                {lastSaved && (
                  <p className="text-sm text-muted-foreground mb-4">
                    Last saved: {lastSaved.toLocaleTimeString()}
                  </p>
                )}
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleSaveDraft()}
                    disabled={isSaving || isPublishing}
                    data-testid="button-save-draft"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? "Saving..." : "Save Draft"}
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
                    disabled={isSaving || isPublishing}
                    data-testid="button-publish"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isPublishing ? "Publishing..." : "Publish"}
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
            <DialogTitle className="flex items-center justify-between">
              <span>{title || 'Article Preview'}</span>
              <span className="text-sm font-normal text-muted-foreground">
                {isEditing ? 'Draft' : 'New Article'}
              </span>
            </DialogTitle>
          </DialogHeader>
          
          {/* SEO Preview */}
          <div className="mb-6 p-4 border rounded-lg bg-muted/30">
            <h4 className="font-semibold mb-2">Search Result Preview</h4>
            <div className="space-y-2">
              <div className="text-blue-600 text-lg hover:underline cursor-pointer">
                {metaTitle || title || 'Article Title'}
              </div>
              <div className="text-green-700 text-sm">
                https://testcraft.world/article/{slug || 'article-slug'}
              </div>
              <div className="text-gray-600 text-sm">
                {metaDescription || (content ? content.replace(/<[^>]*>/g, '').substring(0, 160) + '...' : 'Article description...')}
              </div>
            </div>
          </div>

          {/* Article Content Preview */}
          <div className="prose prose-lg max-w-none mb-6">
            {title && <h1 className="mb-4 text-3xl font-bold">{title}</h1>}
            {content ? (
              <div dangerouslySetInnerHTML={{ __html: content }} />
            ) : (
              <p className="text-muted-foreground">Start writing to see preview...</p>
            )}
          </div>

          {/* Article Metadata */}
          {(category || tags) && (
            <div className="border-t pt-4">
              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                {category && categories && (
                  <span>
                    Category: <span className="font-medium">{categories.find(c => c.id === category)?.name}</span>
                  </span>
                )}
                {tags && (
                  <span>
                    Tags: <span className="font-medium">{tags}</span>
                  </span>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
}
