import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Clock, User } from "lucide-react";

interface ArticleCardProps {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
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
  image,
  author,
  date,
  readTime,
  variant = "vertical",
}: ArticleCardProps) {
  if (variant === "horizontal") {
    return (
      <Link href={`/article/${slug}`} data-testid={`link-article-${slug}`}>
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
    <Link href={`/article/${slug}`} data-testid={`link-article-${slug}`}>
      <Card className="overflow-hidden hover-elevate active-elevate-2 transition-all cursor-pointer">
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
            data-testid={`img-article-${slug}`}
          />
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
