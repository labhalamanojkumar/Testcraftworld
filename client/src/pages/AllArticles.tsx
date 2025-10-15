import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import { useLocation } from "wouter";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  published: boolean;
  createdAt: string;
  authorId: string;
}

export default function AllArticles() {
  const [, setLocation] = useLocation();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showDrafts, setShowDrafts] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleEdit = (article: Article) => {
    setLocation(`/editor?id=${article.id}`);
  };

  const handleDelete = async (article: Article) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to delete articles.",
        variant: "destructive",
      });
      return;
    }

    if (article.authorId !== user.id && user.role !== 'admin' && user.role !== 'superadmin') {
      toast({
        title: "Access Denied",
        description: "You can only delete your own articles.",
        variant: "destructive",
      });
      return;
    }

    setArticleToDelete(article);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!articleToDelete) return;

    try {
      const response = await fetch(`/api/articles/${articleToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "Article Deleted",
          description: "The article has been successfully deleted.",
        });
        // Refresh the articles list
        queryClient.invalidateQueries({ queryKey: ["all-articles"] });
      } else {
        const error = await response.json();
        toast({
          title: "Delete Failed",
          description: error.message || "Failed to delete article. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete Failed",
        description: "An unexpected error occurred while deleting. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setArticleToDelete(null);
    }
  };

  const { data, isLoading } = useQuery({
    queryKey: ["all-articles", page, limit, showDrafts],
    queryFn: () => fetch(`/api/articles?page=${page}&limit=${limit}${showDrafts ? '&includeDrafts=true' : ''}`).then(r => r.json()),
  });

  const items: Article[] = data?.items || data || [];
  const total: number = data?.total ?? (Array.isArray(data) ? data.length : 0);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">All Articles</h1>
          <div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={showDrafts} onChange={(e) => setShowDrafts(e.target.checked)} disabled={!user} />
                Show drafts
              </label>
              <Button onClick={() => setLocation('/editor')}>Write New Article</Button>
            </div>
          </div>
        </div>

        <Card>
          <div className="p-4">
            {isLoading ? (
              <p>Loading...</p>
            ) : (
              <div className="space-y-4">
                {items.length === 0 ? (
                  <p>No articles found.</p>
                ) : (
                  items.map((a) => (
                    <div key={a.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <Link href={`/article/${a.slug}`}>
                            <a className="font-semibold text-blue-600 hover:underline">{a.title}</a>
                          </Link>
                          <p className="text-sm text-muted-foreground">{a.excerpt}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <div className="text-sm text-muted-foreground">
                            {new Date(a.createdAt).toLocaleDateString()}
                          </div>
                          {user && (user.id === a.authorId || user.role === 'admin' || user.role === 'superadmin') && (
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(a)}
                                className="h-8 w-8 p-0"
                                title="Edit article"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(a)}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Delete article"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}

                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center gap-3">
                    <Button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
                    {Array.from({ length: totalPages }).map((_, idx) => {
                      const p = idx + 1;
                      return (
                        <Button key={p} variant={p === page ? 'default' : 'outline'} size="sm" onClick={() => setPage(p)}>
                          {p}
                        </Button>
                      );
                    })}
                    <Button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-sm text-muted-foreground">Total: {total}</div>
                    <select value={limit} onChange={(e) => { setLimit(parseInt(e.target.value, 10)); setPage(1); }} className="border px-2 py-1 rounded">
                      {[5,10,20,50].map(n => <option key={n} value={n}>{n} / page</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Article</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{articleToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
