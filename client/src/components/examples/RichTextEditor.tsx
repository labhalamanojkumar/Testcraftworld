import RichTextEditor from '../RichTextEditor';
import { useState } from 'react';

export default function RichTextEditorExample() {
  const [content, setContent] = useState("Start writing your amazing blog post...");

  return (
    <div className="p-4">
      <RichTextEditor value={content} onChange={setContent} />
    </div>
  );
}
