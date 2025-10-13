import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import FeaturedArticles from "@/components/FeaturedArticles";
import CategoryGrid from "@/components/CategoryGrid";
import AdSenseZone from "@/components/AdSenseZone";
import ArticleCard from "@/components/ArticleCard";
import { useQuery } from "@tanstack/react-query";

interface Article {
  id: string;
  title: string;
  excerpt: string | null;
  categoryId: string | null;
  slug: string;
  createdAt: string;
}

export default function Home() {
  const { data: articles } = useQuery<Article[]>({
    queryKey: ["articles"],
    queryFn: () => fetch("/api/articles").then(r => r.json()),
  });

  const recentArticles = articles?.slice(0, 3).map((art) => ({
    slug: art.slug,
    title: art.title,
    excerpt: art.excerpt || "",
    category: "Article", // Could fetch category name
    image: "", // Placeholder
    author: "Author",
    date: new Date(art.createdAt).toLocaleDateString(),
    readTime: "5 min read",
  })) || [];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <AdSenseZone slot="header-leaderboard" format="horizontal" className="container mx-auto px-4 my-4" />
        
        <HeroSection />
        
        <FeaturedArticles />
        
        <CategoryGrid />
        
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Recent Articles</h2>
            </div>
            <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">
              {recentArticles.map((article) => (
                <ArticleCard key={article.slug} {...article} variant="horizontal" />
              ))}
            </div>
          </div>
        </section>

        <AdSenseZone slot="footer-leaderboard" format="horizontal" className="container mx-auto px-4 my-8" />
      </main>
      
      <Footer />
    </div>
  );
}
