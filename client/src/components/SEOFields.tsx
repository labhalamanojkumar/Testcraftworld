import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface SEOFieldsProps {
  metaTitle: string;
  metaDescription: string;
  slug: string;
  focusKeyword: string;
  onMetaTitleChange: (value: string) => void;
  onMetaDescriptionChange: (value: string) => void;
  onSlugChange: (value: string) => void;
  onFocusKeywordChange: (value: string) => void;
}

export default function SEOFields({
  metaTitle,
  metaDescription,
  slug,
  focusKeyword,
  onMetaTitleChange,
  onMetaDescriptionChange,
  onSlugChange,
  onFocusKeywordChange,
}: SEOFieldsProps) {
  const titleLength = metaTitle.length;
  const descriptionLength = metaDescription.length;

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="meta-title">Meta Title</Label>
        <div className="flex items-center gap-2 mt-2">
          <Input
            id="meta-title"
            value={metaTitle}
            onChange={(e) => onMetaTitleChange(e.target.value)}
            placeholder="Optimized title for search engines (50-60 characters)"
            data-testid="input-meta-title"
          />
          <Badge variant={titleLength >= 50 && titleLength <= 60 ? "default" : "secondary"} data-testid="badge-title-length">
            {titleLength}
          </Badge>
        </div>
      </div>

      <div>
        <Label htmlFor="meta-description">Meta Description</Label>
        <div className="flex flex-col gap-2 mt-2">
          <Textarea
            id="meta-description"
            value={metaDescription}
            onChange={(e) => onMetaDescriptionChange(e.target.value)}
            placeholder="Brief description for search results (150-160 characters)"
            rows={3}
            data-testid="textarea-meta-description"
          />
          <Badge
            variant={descriptionLength >= 150 && descriptionLength <= 160 ? "default" : "secondary"}
            className="self-end"
            data-testid="badge-description-length"
          >
            {descriptionLength}
          </Badge>
        </div>
      </div>

      <div>
        <Label htmlFor="slug">URL Slug</Label>
        <Input
          id="slug"
          value={slug}
          onChange={(e) => onSlugChange(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
          placeholder="article-url-slug"
          className="mt-2"
          data-testid="input-slug"
        />
      </div>

      <div>
        <Label htmlFor="focus-keyword">Focus Keyword</Label>
        <Input
          id="focus-keyword"
          value={focusKeyword}
          onChange={(e) => onFocusKeywordChange(e.target.value)}
          placeholder="Primary keyword for SEO"
          className="mt-2"
          data-testid="input-focus-keyword"
        />
      </div>
    </div>
  );
}
