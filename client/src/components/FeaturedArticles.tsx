import ArticleCard from "./ArticleCard";
import businessImage from "@assets/generated_images/Business_category_thumbnail_9ec0fa35.png";
import designImage from "@assets/generated_images/Design_category_thumbnail_1ab6d355.png";
import technologyImage from "@assets/generated_images/Technology_category_thumbnail_eb54c90d.png";
import lifestyleImage from "@assets/generated_images/Lifestyle_category_thumbnail_bb647a09.png";

const featuredArticles = [
  {
    id: "1",
    title: "How to Build a Profitable Online Business from Scratch",
    excerpt: "Starting an online business can be overwhelming. Learn the essential steps, tools, and strategies to launch successfully.",
    category: "Business",
    image: businessImage,
    author: "Anjali Patel",
    date: "Jan 20, 2025",
    readTime: "8 min read",
  },
  {
    id: "2",
    title: "UI/UX Design Trends That Will Dominate 2025",
    excerpt: "Discover the latest design trends shaping user experiences across web and mobile platforms this year.",
    category: "Design",
    image: designImage,
    author: "Rohan Kumar",
    date: "Jan 19, 2025",
    readTime: "6 min read",
  },
  {
    id: "3",
    title: "AI and Machine Learning: A Beginner's Guide",
    excerpt: "Demystifying artificial intelligence and machine learning concepts for those just getting started in the field.",
    category: "Technology",
    image: technologyImage,
    author: "Vikram Singh",
    date: "Jan 18, 2025",
    readTime: "10 min read",
  },
  {
    id: "4",
    title: "Mindful Living: Simple Habits for Better Mental Health",
    excerpt: "Practical tips and daily habits to improve your mental well-being and lead a more balanced life.",
    category: "Lifestyle",
    image: lifestyleImage,
    author: "Neha Gupta",
    date: "Jan 17, 2025",
    readTime: "5 min read",
  },
];

export default function FeaturedArticles() {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8">Featured Articles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredArticles.map((article) => (
            <ArticleCard key={article.id} {...article} variant="vertical" />
          ))}
        </div>
      </div>
    </section>
  );
}
