import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Highlight from '@tiptap/extension-highlight';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Underline from '@tiptap/extension-underline';

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const TiptapEditor: React.FC<TiptapEditorProps> = ({ 
  content, 
  onChange,
  placeholder = 'Write your post content here...'
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Configure link to be disabled in starter-kit since we'll add it separately
        link: false,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline',
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded',
        },
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Underline,
      Subscript,
      Superscript,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
        'data-placeholder': placeholder,
      },
    },
  });

  if (!editor) {
    return (
      <div className="w-full min-h-[2.5rem] p-3 text-muted-foreground">
        Loading editor...
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Editor Content */}
      <EditorContent
        editor={editor}
        className="w-full min-h-[2.5rem] max-w-none resize-none border-0 outline-0 focus:outline-0 focus:ring-0 [&_.ProseMirror]:min-h-[2.5rem] [&_.ProseMirror]:p-3 [&_.ProseMirror]:border-0 [&_.ProseMirror]:outline-0 [&_.ProseMirror]:focus:outline-0 [&_.ProseMirror]:focus:ring-0 [&_.ProseMirror]:resize-none [&_.ProseMirror]:overflow-hidden [&_.ProseMirror]:break-words [&_.ProseMirror]:whitespace-pre-wrap [&_.ProseMirror]:leading-relaxed"
      />
    </div>
  );
};

export default TiptapEditor;