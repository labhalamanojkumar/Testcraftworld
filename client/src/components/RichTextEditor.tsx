import { useState, useRef } from "react";
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFormat = (format: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    let replacement = selectedText;

    switch (format) {
      case "bold":
        replacement = `**${selectedText}**`;
        break;
      case "italic":
        replacement = `*${selectedText}*`;
        break;
      case "heading":
        replacement = `## ${selectedText}`;
        break;
      case "bullet-list":
        replacement = selectedText.split('\n').map(line => `- ${line}`).join('\n');
        break;
      case "ordered-list":
        replacement = selectedText.split('\n').map((line, i) => `${i + 1}. ${line}`).join('\n');
        break;
      case "quote":
        replacement = selectedText.split('\n').map(line => `> ${line}`).join('\n');
        break;
      case "link":
        const url = prompt("Enter URL:");
        if (url) replacement = `[${selectedText}](${url})`;
        break;
      case "image":
        const imageUrl = prompt("Enter image URL:");
        if (imageUrl) replacement = `![${selectedText}](${imageUrl})`;
        break;
    }

    const newValue = value.substring(0, start) + replacement + value.substring(end);
    onChange(newValue);

    // Reset selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + replacement.length, start + replacement.length);
    }, 0);
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
        ref={textareaRef}
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
