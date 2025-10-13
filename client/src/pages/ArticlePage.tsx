import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Calendar } from "lucide-react";

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

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export default function ArticlePage() {
  const { slug } = useParams();

  const { data: article } = useQuery<Article>({
    queryKey: ["article", slug],
    queryFn: () => fetch(`/api/articles/slug/${slug}`).then(r => r.json()),
    enabled: !!slug,
  });

  const { data: category } = useQuery<Category>({
    queryKey: ["category", article?.categoryId],
    queryFn: () => fetch(`/api/categories/${article?.categoryId}`).then(r => r.json()),
    enabled: !!article?.categoryId,
  });

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-12">
        <article className="container mx-auto px-4 max-w-4xl">
          <header className="mb-8">
            <Badge variant="secondary" className="mb-4">
              {category?.name || "Uncategorized"}
            </Badge>
            <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Author
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(article.createdAt).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                5 min read
              </span>
            </div>
          </header>

          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-muted-foreground mb-8">{article.excerpt}</p>
            <div dangerouslySetInnerHTML={{ __html: article.content }} />
          </div>

          {article.tags && (
            <footer className="mt-12 pt-8 border-t">
              <div className="flex flex-wrap gap-2">
                {article.tags.split(',').map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag.trim()}
                  </Badge>
                ))}
              </div>
            </footer>
          )}
        </article>
      </main>
      
      <Footer />
    </div>
  );
}