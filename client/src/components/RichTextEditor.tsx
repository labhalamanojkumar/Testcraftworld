import { useState, useRef, useMemo } from "react";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Heading1,
  Heading2,
  Heading3,
  Type,
  Upload,
  Palette,
  Globe,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFont, setSelectedFont] = useState('Inter');
  const [imageUrlDialogOpen, setImageUrlDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const quillRef = useRef<ReactQuill>(null);
  const { toast } = useToast();

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        // Insert image at cursor position
        const quill = quillRef.current?.getEditor();
        if (quill) {
          const range = quill.getSelection(true);
          quill.insertEmbed(range.index, 'image', data.url);
          quill.setSelection(range.index + 1, 0);
        }

        toast({
          title: "Image Uploaded",
          description: "Image has been uploaded and inserted into your content.",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Upload Failed",
          description: error.error || "Failed to upload image.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "An error occurred while uploading the image.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUrlInsert = () => {
    if (!imageUrl.trim()) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid image URL.",
        variant: "destructive",
      });
      return;
    }

    // Insert image at cursor position
    const quill = quillRef.current?.getEditor();
    if (quill) {
      const range = quill.getSelection(true);
      quill.insertEmbed(range.index, 'image', imageUrl.trim());
      quill.setSelection(range.index + 1, 0);
    }

    setImageUrl('');
    setImageUrlDialogOpen(false);

    toast({
      title: "Image Inserted",
      description: "Image has been inserted into your content.",
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File",
          description: "Please select an image file.",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }

      handleImageUpload(file);
    }
    // Reset input
    event.target.value = '';
  };

  const handleLink = () => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;

    const range = quill.getSelection(true);
    if (range.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select text to create a link.",
        variant: "destructive",
      });
      return;
    }

    const url = prompt("Enter URL:");
    if (url) {
      quill.format('link', url);
    }
  };

  const handleFontChange = (font: string) => {
    setSelectedFont(font);
    const quill = quillRef.current?.getEditor();
    if (quill) {
      // Apply font to current selection or future text
      const range = quill.getSelection(true);
      if (range.length > 0) {
        quill.format('font', font.toLowerCase());
      }
    }
  };

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['link', 'image'],
        [{ 'color': [] }, { 'background': [] }],
        ['clean']
      ],
      handlers: {
        link: handleLink,
        image: () => fileInputRef.current?.click(),
      }
    },
    clipboard: {
      matchVisual: false,
    }
  }), []);

  const formats = [
    'header', 'bold', 'italic', 'underline',
    'list', 'bullet', 'link', 'image',
    'color', 'background'
  ];

  return (
    <div className="border rounded-md overflow-hidden">
      {/* Custom Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b bg-muted/30 flex-wrap">
        {/* Headings */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const quill = quillRef.current?.getEditor();
            quill?.format('header', 1);
          }}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const quill = quillRef.current?.getEditor();
            quill?.format('header', 2);
          }}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const quill = quillRef.current?.getEditor();
            quill?.format('header', 3);
          }}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Formatting */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const quill = quillRef.current?.getEditor();
            const format = quill?.getFormat();
            quill?.format('bold', !format?.bold);
          }}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const quill = quillRef.current?.getEditor();
            const format = quill?.getFormat();
            quill?.format('italic', !format?.italic);
          }}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const quill = quillRef.current?.getEditor();
            const format = quill?.getFormat();
            quill?.format('underline', !format?.underline);
          }}
          title="Underline"
        >
          <Underline className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Lists */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const quill = quillRef.current?.getEditor();
            quill?.format('list', 'ordered');
          }}
          title="Ordered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const quill = quillRef.current?.getEditor();
            quill?.format('list', 'bullet');
          }}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Font Selection */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" title="Font">
              <Type className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48">
            <div className="space-y-2">
              <label className="text-sm font-medium">Font Family</label>
              <Select value={selectedFont} onValueChange={handleFontChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inter">Inter</SelectItem>
                  <SelectItem value="Arial">Arial</SelectItem>
                  <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                  <SelectItem value="Georgia">Georgia</SelectItem>
                  <SelectItem value="Verdana">Verdana</SelectItem>
                  <SelectItem value="Courier New">Courier New</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </PopoverContent>
        </Popover>

        {/* Link and Image */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLink}
          title="Insert Link"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        
        {/* Image Upload */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          title="Upload Image"
        >
          {isUploading ? (
            <Upload className="h-4 w-4 animate-spin" />
          ) : (
            <ImageIcon className="h-4 w-4" />
          )}
        </Button>

        {/* Image URL */}
        <Dialog open={imageUrlDialogOpen} onOpenChange={setImageUrlDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              title="Insert Image by URL"
            >
              <Globe className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Insert Image by URL</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="image-url">Image URL</Label>
                <Input
                  id="image-url"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setImageUrl('');
                    setImageUrlDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleImageUrlInsert}>
                  Insert Image
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Color Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" title="Text Color">
              <Palette className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="grid grid-cols-8 gap-1">
              {[
                '#000000', '#374151', '#6B7280', '#9CA3AF',
                '#DC2626', '#EA580C', '#D97706', '#65A30D',
                '#059669', '#0891B2', '#2563EB', '#7C3AED',
                '#C026D3', '#DB2777', '#FFFFFF', '#F3F4F6'
              ].map(color => (
                <button
                  key={color}
                  className="w-6 h-6 rounded border border-gray-300"
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    const quill = quillRef.current?.getEditor();
                    quill?.format('color', color);
                  }}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Editor */}
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={(content, delta, source, editor) => {
          // Apply live markdown-like conversions for headings and basic formatting
          try {
            const quill = quillRef.current?.getEditor();
            const sel = quill?.getSelection(true);

            // If the user just typed, attempt to convert patterns at line start
            const text = editor.getText();
            const lines = text.split('\n');
            const lastLineIndex = Math.max(0, lines.length - 2);
            const lastLine = lines[lastLineIndex] || '';

            // Heading conversion: #, ##, ### at line start
            const headingMatch = lastLine.match(/^(#{1,3})\s+(.*)$/);
            if (headingMatch && quill) {
              const hashes = headingMatch[1];
              const contentText = headingMatch[2];
              const startIndex = text.lastIndexOf(lastLine);
              // Replace the line with heading node
              quill.deleteText(startIndex, lastLine.length);
              const level = hashes.length; // 1..3
              quill.insertText(startIndex, contentText, { header: level });
            }

            // Bold **text** and italic *text* inline conversion
            // We only attempt small replacements to avoid interfering with typing too much
            const html = editor.getHTML();
            const convertedHtml = html
              .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
              .replace(/\*(.+?)\*/g, '<em>$1</em>');

            if (convertedHtml !== html && quill) {
              const cursor = sel ? sel.index : undefined;
              quill.clipboard.dangerouslyPasteHTML(convertedHtml);
              if (typeof cursor === 'number') {
                quill.setSelection(cursor, 0);
              }
            }
          } catch (err) {
            // ignore conversion errors
            console.debug('Markdown conversion skipped:', err);
          }

          onChange(content);
        }}
        modules={modules}
        formats={formats}
        className="min-h-[400px]"
        style={{
          fontFamily: selectedFont
        }}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <style dangerouslySetInnerHTML={{
        __html: `
          .ql-editor {
            font-family: ${selectedFont}, sans-serif !important;
            font-size: 16px !important;
            line-height: 1.6 !important;
            min-height: 400px !important;
          }
          .ql-toolbar {
            border: none !important;
            border-bottom: 1px solid hsl(var(--border)) !important;
            background: hsl(var(--muted) / 0.3) !important;
          }
          .ql-container {
            border: none !important;
            font-family: ${selectedFont}, sans-serif !important;
          }
          .ql-editor.ql-blank::before {
            color: hsl(var(--muted-foreground)) !important;
            font-style: normal !important;
          }
        `
      }} />
    </div>
  );
}
