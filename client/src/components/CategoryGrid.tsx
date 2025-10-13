import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import businessImage from "@assets/generated_images/Business_category_thumbnail_9ec0fa35.png";
import designImage from "@assets/generated_images/Design_category_thumbnail_1ab6d355.png";
import technologyImage from "@assets/generated_images/Technology_category_thumbnail_eb54c90d.png";
import lifestyleImage from "@assets/generated_images/Lifestyle_category_thumbnail_bb647a09.png";
import newsImage from "@assets/generated_images/Latest_News_category_thumbnail_db015d5c.png";
import marketingImage from "@assets/generated_images/Marketing_category_thumbnail_3c537bd2.png";

const categories = [
  { name: "Business", image: businessImage, count: 245 },
  { name: "Design", image: designImage, count: 189 },
  { name: "Technology", image: technologyImage, count: 312 },
  { name: "Lifestyle", image: lifestyleImage, count: 156 },
  { name: "Latest News", image: newsImage, count: 428 },
  { name: "Marketing", image: marketingImage, count: 203 },
  { name: "News", image: newsImage, count: 150 },
  { name: "Others", image: businessImage, count: 75 },
];

export default function CategoryGrid() {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">Explore by Category</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={`/category/${category.name.toLowerCase().replace(" ", "-")}`}
              data-testid={`link-category-card-${category.name.toLowerCase().replace(" ", "-")}`}
            >
              <Card className="overflow-hidden hover-elevate active-elevate-2 transition-all cursor-pointer">
                <div className="relative aspect-video w-full overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                    data-testid={`img-category-${category.name.toLowerCase().replace(" ", "-")}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-xl font-bold text-white mb-1" data-testid={`text-category-name-${category.name.toLowerCase().replace(" ", "-")}`}>
                      {category.name}
                    </h3>
                    <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white border-white/30" data-testid={`badge-count-${category.name.toLowerCase().replace(" ", "-")}`}>
                      {category.count} articles
                    </Badge>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
