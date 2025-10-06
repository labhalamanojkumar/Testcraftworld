import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import FeaturedArticles from "@/components/FeaturedArticles";
import CategoryGrid from "@/components/CategoryGrid";
import AdSenseZone from "@/components/AdSenseZone";
import ArticleCard from "@/components/ArticleCard";
import businessImage from "@assets/generated_images/Business_category_thumbnail_9ec0fa35.png";
import marketingImage from "@assets/generated_images/Marketing_category_thumbnail_3c537bd2.png";
import newsImage from "@assets/generated_images/Latest_News_category_thumbnail_db015d5c.png";

const recentArticles = [
  {
    id: "5",
    title: "Digital Marketing Strategies for Small Businesses in 2025",
    excerpt: "Boost your online presence with these proven marketing tactics tailored for small business owners.",
    category: "Marketing",
    image: marketingImage,
    author: "Sanjay Verma",
    date: "Jan 16, 2025",
    readTime: "7 min read",
  },
  {
    id: "6",
    title: "Breaking: New Tech Policy Could Transform Indian Startups",
    excerpt: "Government announces major reforms aimed at supporting innovation and entrepreneurship in the tech sector.",
    category: "Latest News",
    image: newsImage,
    author: "Priya Desai",
    date: "Jan 15, 2025",
    readTime: "4 min read",
  },
  {
    id: "7",
    title: "Financial Planning Tips Every Entrepreneur Should Know",
    excerpt: "Master the basics of business finance and learn how to manage cash flow effectively.",
    category: "Business",
    image: businessImage,
    author: "Amit Shah",
    date: "Jan 14, 2025",
    readTime: "9 min read",
  },
];

export default function Home() {
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
                <ArticleCard key={article.id} {...article} variant="horizontal" />
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
