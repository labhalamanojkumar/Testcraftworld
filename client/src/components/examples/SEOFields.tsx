import SEOFields from '../SEOFields';
import { useState } from 'react';

export default function SEOFieldsExample() {
  const [metaTitle, setMetaTitle] = useState("How to Build a Successful Blog in 2025");
  const [metaDescription, setMetaDescription] = useState(
    "Learn the essential strategies and tools to create a profitable blog. Expert tips on content creation, SEO, and monetization."
  );
  const [slug, setSlug] = useState("build-successful-blog-2025");
  const [focusKeyword, setFocusKeyword] = useState("blog success strategies");

  return (
    <div className="p-4 max-w-2xl">
      <SEOFields
        metaTitle={metaTitle}
        metaDescription={metaDescription}
        slug={slug}
        focusKeyword={focusKeyword}
        onMetaTitleChange={setMetaTitle}
        onMetaDescriptionChange={setMetaDescription}
        onSlugChange={setSlug}
        onFocusKeywordChange={setFocusKeyword}
      />
    </div>
  );
}
