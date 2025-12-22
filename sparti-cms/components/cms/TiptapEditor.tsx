import React, { useEffect, useState, useRef } from 'react';
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
import {
  Bold,
  Italic,
  Strikethrough,
  Underline as UnderlineIcon,
  Code,
  Code2,
  Quote,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Image as ImageIcon,
  Minus,
  Undo,
  Redo,
  Palette,
  Highlighter,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Upload,
  X,
} from 'lucide-react';
import { Button } from '../../../src/components/ui/button';
import { Separator } from '../../../src/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../src/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '../../../src/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../src/components/ui/tabs';
import { Input } from '../../../src/components/ui/input';
import { Label } from '../../../src/components/ui/label';

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

// Preset colors for color picker
const PRESET_COLORS = [
  { name: 'Black', value: '#000000' },
  { name: 'White', value: '#ffffff' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Gray', value: '#6b7280' },
];

const TiptapEditor: React.FC<TiptapEditorProps> = ({ 
  content, 
  onChange,
  placeholder = 'Write your post content here...'
}) => {
  // State for dialogs and popovers
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageUploadMode, setImageUploadMode] = useState<'url' | 'upload'>('url');
  const [uploading, setUploading] = useState(false);
  const [textColorOpen, setTextColorOpen] = useState(false);
  const [highlightColorOpen, setHighlightColorOpen] = useState(false);
  const [currentTextColor, setCurrentTextColor] = useState('');
  const [currentHighlightColor, setCurrentHighlightColor] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

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
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[400px] p-4',
      },
    },
  });

  // Update editor content when content prop changes externally
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Update current colors when selection changes
  useEffect(() => {
    if (!editor) return;

    const updateColors = () => {
      const textColor = editor.getAttributes('textStyle').color || '';
      const highlightColor = editor.getAttributes('highlight').color || '';
      setCurrentTextColor(textColor);
      setCurrentHighlightColor(highlightColor);
    };

    editor.on('selectionUpdate', updateColors);
    editor.on('transaction', updateColors);

    return () => {
      editor.off('selectionUpdate', updateColors);
      editor.off('transaction', updateColors);
    };
  }, [editor]);

  if (!editor) {
    return (
      <div className="border rounded-lg min-h-[400px] bg-background p-4">
        <div className="text-muted-foreground">Loading editor...</div>
      </div>
    );
  }

  const ToolbarButton = ({
    onClick,
    isActive,
    children,
    title,
  }: {
    onClick: () => void;
    isActive?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <Button
      type="button"
      variant={isActive ? 'secondary' : 'ghost'}
      size="sm"
      onClick={onClick}
      title={title}
      className="h-8 w-8 p-0"
    >
      {children}
    </Button>
  );

  // Link handlers
  const handleLinkClick = () => {
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to);
    const existingLink = editor.getAttributes('link');
    
    if (existingLink.href) {
      setLinkUrl(existingLink.href);
    } else if (selectedText) {
      setLinkUrl('');
    } else {
      setLinkUrl('');
    }
    setLinkDialogOpen(true);
  };

  const handleLinkSave = () => {
    if (!linkUrl.trim()) return;
    
    // Basic URL validation
    let url = linkUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('mailto:')) {
      url = `https://${url}`;
    }
    
    editor.chain().focus().setLink({ href: url }).run();
    setLinkDialogOpen(false);
    setLinkUrl('');
  };

  const handleLinkRemove = () => {
    editor.chain().focus().unsetLink().run();
    setLinkDialogOpen(false);
    setLinkUrl('');
  };

  // Image handlers
  const handleImageUrlInsert = () => {
    if (!imageUrl.trim()) return;
    
    editor.chain().focus().setImage({ src: imageUrl }).run();
    setImageDialogOpen(false);
    setImageUrl('');
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Get auth token
      const token = localStorage.getItem('sparti-user-session');
      const authToken = token ? JSON.parse(token).token : null;

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      let uploadedUrl = result.url;

      // Ensure the URL is absolute
      if (uploadedUrl && !uploadedUrl.startsWith('http')) {
        const baseUrl = window.location.origin;
        uploadedUrl = `${baseUrl}${uploadedUrl.startsWith('/') ? '' : '/'}${uploadedUrl}`;
      }

      editor.chain().focus().setImage({ src: uploadedUrl }).run();
      setImageDialogOpen(false);
      setImageUrl('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('[testing] Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Color handlers
  const handleTextColorChange = (color: string) => {
    if (color) {
      editor.chain().focus().setColor(color).run();
    } else {
      editor.chain().focus().unsetColor().run();
    }
    setTextColorOpen(false);
  };

  const handleHighlightColorChange = (color: string) => {
    if (color) {
      editor.chain().focus().toggleHighlight({ color }).run();
    } else {
      editor.chain().focus().unsetHighlight().run();
    }
    setHighlightColorOpen(false);
  };

  const ColorPicker = ({ 
    isOpen, 
    onOpenChange, 
    currentColor, 
    onColorChange,
    title 
  }: {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    currentColor: string;
    onColorChange: (color: string) => void;
    title: string;
  }) => (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant={currentColor ? 'secondary' : 'ghost'}
          size="sm"
          className="h-8 w-8 p-0"
          title={title}
        >
          {title === 'Text Color' ? (
            <Palette className="h-4 w-4" />
          ) : (
            <Highlighter className="h-4 w-4" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="space-y-3">
          <div className="text-sm font-medium">{title}</div>
          <div className="grid grid-cols-5 gap-2">
            {PRESET_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => onColorChange(color.value)}
                className={`h-8 w-8 rounded border-2 transition-all ${
                  currentColor === color.value
                    ? 'border-primary ring-2 ring-primary ring-offset-1'
                    : 'border-border hover:border-primary/50'
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor={`custom-${title.toLowerCase().replace(' ', '-')}`} className="text-xs">
              Custom:
            </Label>
            <Input
              id={`custom-${title.toLowerCase().replace(' ', '-')}`}
              type="color"
              value={currentColor || '#000000'}
              onChange={(e) => onColorChange(e.target.value)}
              className="h-8 w-16 cursor-pointer"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => onColorChange('')}
          >
            Default
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );

  return (
    <div className="border rounded-lg overflow-hidden bg-background">
      {/* Toolbar */}
      <div className="bg-muted/50 border-b p-2 flex flex-wrap gap-1">
        {/* Text Formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title="Underline"
        >
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="h-8 mx-1" />

        {/* Headings */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="h-8 mx-1" />

        {/* Code & Quote */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          title="Inline Code"
        >
          <Code className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive('codeBlock')}
          title="Code Block"
        >
          <Code2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Blockquote"
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="h-8 mx-1" />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="h-8 mx-1" />

        {/* Text Alignment */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="h-8 mx-1" />

        {/* Media */}
        <ToolbarButton
          onClick={handleLinkClick}
          isActive={editor.isActive('link')}
          title="Add Link"
        >
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => {
            setImageUrl('');
            setImageUploadMode('url');
            setImageDialogOpen(true);
          }}
          title="Insert Image"
        >
          <ImageIcon className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="h-8 mx-1" />

        {/* Advanced Styling */}
        <ColorPicker
          isOpen={textColorOpen}
          onOpenChange={setTextColorOpen}
          currentColor={currentTextColor}
          onColorChange={handleTextColorChange}
          title="Text Color"
        />
        <ColorPicker
          isOpen={highlightColorOpen}
          onOpenChange={setHighlightColorOpen}
          currentColor={currentHighlightColor}
          onColorChange={handleHighlightColorChange}
          title="Highlight Color"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          isActive={editor.isActive('subscript')}
          title="Subscript"
        >
          <SubscriptIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          isActive={editor.isActive('superscript')}
          title="Superscript"
        >
          <SuperscriptIcon className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="h-8 mx-1" />

        {/* Structural */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
        >
          <Minus className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="h-8 mx-1" />

        {/* Undo/Redo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          title="Undo"
          isActive={false}
        >
          <Undo className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          title="Redo"
          isActive={false}
        >
          <Redo className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Editor Content */}
      <EditorContent
        editor={editor}
        className="min-h-[400px]"
      />

      {/* Link Dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Link</DialogTitle>
            <DialogDescription>
              Enter the URL for the link. Selected text will become the link.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="link-url">URL</Label>
              <Input
                id="link-url"
                type="url"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleLinkSave();
                  }
                }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            {editor.isActive('link') && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleLinkRemove}
              >
                Remove Link
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => setLinkDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleLinkSave}
              disabled={!linkUrl.trim()}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Image</DialogTitle>
            <DialogDescription>
              Insert an image by URL or upload a file.
            </DialogDescription>
          </DialogHeader>
          <Tabs value={imageUploadMode} onValueChange={(v) => setImageUploadMode(v as 'url' | 'upload')} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="url">From URL</TabsTrigger>
              <TabsTrigger value="upload">Upload File</TabsTrigger>
            </TabsList>
            <TabsContent value="url" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image-url">Image URL</Label>
                <Input
                  id="image-url"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleImageUrlInsert();
                    }
                  }}
                />
              </div>
              {imageUrl && (
                <div className="mt-4">
                  <Label>Preview</Label>
                  <div className="mt-2 border rounded-md p-2">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="max-w-full h-auto max-h-48 mx-auto"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}
              <Button
                type="button"
                onClick={handleImageUrlInsert}
                disabled={!imageUrl.trim()}
                className="w-full"
              >
                Insert Image
              </Button>
            </TabsContent>
            <TabsContent value="upload" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image-upload">Select Image</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="image-upload"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="cursor-pointer"
                  />
                </div>
                {uploading && (
                  <p className="text-sm text-muted-foreground">Uploading...</p>
                )}
              </div>
              <div className="border-2 border-dashed rounded-md p-8 text-center">
                <Upload className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Click the input above or drag and drop an image here
                </p>
                <p className="text-xs text-muted-foreground">
                  Supported formats: JPG, PNG, GIF, SVG, WebP
                </p>
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setImageDialogOpen(false);
                setImageUrl('');
              }}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TiptapEditor;
