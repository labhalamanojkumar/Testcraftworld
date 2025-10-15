import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArticleCard from "@/components/ArticleCard";
import { Badge } from "@/components/ui/badge";

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

export default function CategoryPage() {
  const { slug } = useParams();

  const { data: category } = useQuery<Category>({
    queryKey: ["category", slug],
    queryFn: () => fetch(`/api/categories/slug/${slug}`).then(r => r.json()),
    enabled: !!slug,
  });

  // Increment category view count when category page loads
  useEffect(() => {
    if (category?.id) {
      fetch(`/api/categories/${category.id}/view`, { method: "POST" }).catch(console.error);
    }
  }, [category?.id]);

  const { data: articles } = useQuery<Article[]>({
    queryKey: ["articles", category?.id],
    queryFn: () => fetch(`/api/categories/${category?.id}/articles`).then(r => r.json()),
    enabled: !!category?.id,
  });

  if (!category) {
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
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <Badge variant="secondary" className="mb-4">{category.name}</Badge>
            <h1 className="text-4xl font-bold mb-4">{category.name} Articles</h1>
            {category.description && (
              <p className="text-lg text-muted-foreground">{category.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles?.map((article) => {
              // Extract first image src from article.content HTML to use as thumbnail
              let imageSrc = '';
              try {
                if (article.content) {
                  const parser = new DOMParser();
                  const doc = parser.parseFromString(article.content, 'text/html');
                  const img = doc.querySelector('img');
                  imageSrc = img?.getAttribute('src') || '';
                }
              } catch (err) {
                // ignore parsing errors
                imageSrc = '';
              }

              return (
                <ArticleCard
                  key={article.slug}
                  slug={article.slug}
                  title={article.title}
                  excerpt={article.excerpt || ''}
                  category={category.name}
                  categorySlug={category.slug}
                  image={imageSrc}
                  author="Author"
                  date={new Date(article.createdAt).toLocaleDateString()}
                  readTime="5 min read"
                />
              );
            })}
          </div>

          {articles?.length === 0 && (
            <p className="text-center text-muted-foreground">No articles in this category yet.</p>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}