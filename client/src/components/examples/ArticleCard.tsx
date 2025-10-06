import ArticleCard from '../ArticleCard';
import businessImage from "@assets/generated_images/Business_category_thumbnail_9ec0fa35.png";

export default function ArticleCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
      <ArticleCard
        id="1"
        title="10 Strategies to Scale Your Startup in 2025"
        excerpt="Learn proven methods to grow your business efficiently with limited resources and maximum impact."
        category="Business"
        image={businessImage}
        author="Priya Sharma"
        date="Jan 15, 2025"
        readTime="5 min read"
        variant="vertical"
      />
      <ArticleCard
        id="2"
        title="The Future of Remote Work: Trends and Predictions"
        excerpt="Explore how remote work is evolving and what it means for businesses and employees worldwide."
        category="Business"
        image={businessImage}
        author="Rahul Mehta"
        date="Jan 14, 2025"
        readTime="7 min read"
        variant="horizontal"
      />
    </div>
  );
}
