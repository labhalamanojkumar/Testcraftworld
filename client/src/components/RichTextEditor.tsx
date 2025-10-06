import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Heading2,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleFormat = (format: string) => {
    console.log("Formatting:", format);
  };

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="flex items-center gap-1 p-2 border-b bg-muted/30">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleFormat("bold")}
          data-testid="button-format-bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleFormat("italic")}
          data-testid="button-format-italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleFormat("heading")}
          data-testid="button-format-heading"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleFormat("bullet-list")}
          data-testid="button-format-list"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleFormat("ordered-list")}
          data-testid="button-format-ordered-list"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleFormat("quote")}
          data-testid="button-format-quote"
        >
          <Quote className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleFormat("link")}
          data-testid="button-format-link"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleFormat("image")}
          data-testid="button-format-image"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
      </div>
      <textarea
        className="w-full min-h-[400px] p-4 font-serif text-lg leading-relaxed resize-none focus:outline-none"
        placeholder="Write your article here..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        data-testid="textarea-content"
      />
    </div>
  );
}
