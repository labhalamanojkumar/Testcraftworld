import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Clock, User } from "lucide-react";

interface ArticleCardProps {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  categorySlug?: string;
  image: string;
  author: string;
  date: string;
  readTime: string;
  variant?: "horizontal" | "vertical";
}

export default function ArticleCard({
  slug,
  title,
  excerpt,
  category,
  categorySlug,
  image,
  author,
  date,
  readTime,
  variant = "vertical",
}: ArticleCardProps) {
  const articleUrl = categorySlug ? `/category/${categorySlug}/${slug}` : `/article/${slug}`;

  if (variant === "horizontal") {
    return (
      <Link href={articleUrl} data-testid={`link-article-${slug}`}>
        <Card className="overflow-hidden hover-elevate active-elevate-2 transition-all cursor-pointer">
          <div className="flex flex-col sm:flex-row gap-4 p-4">
            <div className="sm:w-64 h-48 sm:h-auto flex-shrink-0">
              <img
                src={image}
                alt={title}
                className="w-full h-full object-cover rounded-md"
                data-testid={`img-article-${slug}`}
              />
            </div>
            <div className="flex-1 flex flex-col justify-between min-w-0">
              <div>
                <Badge variant="secondary" className="mb-2" data-testid={`badge-category-${slug}`}>
                  {category}
                </Badge>
                <h3 className="text-xl font-bold mb-2 line-clamp-2" data-testid={`text-title-${slug}`}>
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3" data-testid={`text-excerpt-${slug}`}>
                  {excerpt}
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1" data-testid={`text-author-${slug}`}>
                  <User className="h-3 w-3" />
                  {author}
                </span>
                <span data-testid={`text-date-${slug}`}>{date}</span>
                <span className="flex items-center gap-1" data-testid={`text-readtime-${slug}`}>
                  <Clock className="h-3 w-3" />
                  {readTime}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  return (
    <Link href={articleUrl} data-testid={`link-article-${slug}`}>
      <Card className="overflow-hidden hover-elevate active-elevate-2 transition-all cursor-pointer">
        <div className="aspect-video w-full overflow-hidden bg-gray-100">
          {image ? (
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover"
              data-testid={`img-article-${slug}`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              {/* simple inline SVG placeholder */}
              <img
                src={`data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'><rect width='100%' height='100%' fill='%23f3f4f6'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='Arial' font-size='24'>No image</text></svg>`}
                alt="No image"
                className="w-full h-full object-cover"
                data-testid={`img-article-placeholder-${slug}`}
              />
            </div>
          )}
        </div>
        <div className="p-4">
          <Badge variant="secondary" className="mb-2" data-testid={`badge-category-${slug}`}>
            {category}
          </Badge>
          <h3 className="text-lg font-bold mb-2 line-clamp-2" data-testid={`text-title-${slug}`}>
            {title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-3 mb-3" data-testid={`text-excerpt-${slug}`}>
            {excerpt}
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1" data-testid={`text-author-${slug}`}>
              <User className="h-3 w-3" />
              {author}
            </span>
            <span data-testid={`text-date-${slug}`}>{date}</span>
            <span className="flex items-center gap-1" data-testid={`text-readtime-${slug}`}>
              <Clock className="h-3 w-3" />
              {readTime}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
