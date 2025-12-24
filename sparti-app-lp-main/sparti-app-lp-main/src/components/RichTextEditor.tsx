import React, { useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough, 
  Heading1, 
  Heading2, 
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Image as ImageIcon,
  Undo,
  Redo,
  Type,
  Sparkles,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  content?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
  showWordCount?: boolean;
  enableAI?: boolean;
  hideToolbar?: boolean;
  plainTextMode?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content = '',
  onChange,
  placeholder = 'Write something amazing...',
  className,
  minHeight = '300px',
  showWordCount = true,
  enableAI = true,
  hideToolbar = false,
  plainTextMode = false
}) => {
  const [imageUrl, setImageUrl] = useState('');
  const [showImageDialog, setShowImageDialog] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        paragraph: {
          HTMLAttributes: {
            class: 'notion-p',
          },
        },
        heading: {
          levels: [1, 2, 3],
          HTMLAttributes: {
            class: 'notion-heading',
          },
        },
        bulletList: {
          HTMLAttributes: {
            class: 'notion-ul',
          },
          itemTypeName: 'listItem',
          keepMarks: false,
          keepAttributes: false,
        },
        listItem: {
          HTMLAttributes: {
            class: 'notion-li',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'notion-ol',
          },
          itemTypeName: 'listItem',
          keepMarks: false,
          keepAttributes: false,
        },
        blockquote: {
          HTMLAttributes: {
            class: 'notion-blockquote',
          },
        },
        code: {
          HTMLAttributes: {
            class: 'notion-code',
          },
        },
        codeBlock: {
          HTMLAttributes: {
            class: 'notion-pre',
          },
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'notion-img',
        },
      }),
      Table.configure({
        resizable: false,
        HTMLAttributes: {
          class: 'notion-table',
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
      Underline,
      CharacterCount,
      Placeholder.configure({
        placeholder,
        showOnlyWhenEditable: true,
        showOnlyCurrent: false,
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: cn(
          'notion-editor-content focus:outline-none',
          className
        ),
        style: `min-height: ${minHeight}`,
      },
    },
    onUpdate: ({ editor }) => {
      if (plainTextMode) {
        onChange?.(editor.getText());
      } else {
        onChange?.(editor.getHTML());
      }
    },
  });

  const addImage = useCallback(() => {
    if (imageUrl && editor) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl('');
      setShowImageDialog(false);
      toast({
        title: "Image Added",
        description: "Image has been successfully added to your content.",
      });
    }
  }, [editor, imageUrl]);

  const handleAIRewrite = useCallback(async () => {
    if (!editor) return;
    
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to);
    
    if (!selectedText.trim()) {
      toast({
        title: "No Text Selected",
        description: "Please select some text to rewrite with AI.",
        variant: "destructive"
      });
      return;
    }

    try {
      toast({
        title: "AI Processing",
        description: "Rewriting your text with AI...",
      });

      const { data, error } = await supabase.functions.invoke('ai-content-enhancer', {
        body: {
          text: selectedText,
          action: 'rewrite',
          tone: 'professional',
          targetAudience: 'general audience'
        }
      });

      if (error) {
        throw error;
      }

      if (data?.success && data?.enhancedText) {
        editor.chain().focus().deleteSelection().insertContent(data.enhancedText).run();
        toast({
          title: "Text Rewritten",
          description: "Your text has been successfully rewritten with AI.",
        });
      } else {
        throw new Error(data?.error || 'Failed to enhance text');
      }
    } catch (error) {
      console.error('AI enhancement error:', error);
      toast({
        title: "AI Error",
        description: error instanceof Error ? error.message : "Failed to rewrite text with AI.",
        variant: "destructive"
      });
    }
  }, [editor]);

  const getCleanHTML = useCallback(() => {
    if (!editor) return '';
    
    // Get the HTML and clean it for WordPress/Shopify compatibility
    let html = editor.getHTML();
    
    // Clean up and ensure proper formatting
    html = html
      .replace(/<p><\/p>/g, '') // Remove empty paragraphs
      .replace(/class="[^"]*"/g, '') // Remove TipTap classes for clean output
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    return html;
  }, [editor]);

  const getWordCount = useCallback(() => {
    if (!editor) return 0;
    return editor.storage.characterCount?.words() || 0;
  }, [editor]);

  if (!editor) {
    return (
      <div className="border rounded-lg p-4 animate-pulse">
        <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded"></div>
          <div className="h-4 bg-muted rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="notion-editor bg-white border border-border/20 rounded-lg shadow-none">
      {/* Minimalist Toolbar */}
      {!hideToolbar && (
        <div className="notion-toolbar border-b border-border/30 px-6 py-2 bg-white/95 backdrop-blur-sm opacity-100 translate-y-0 transition-all duration-200 ease-out">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {/* Text Formatting */}
              <div className="flex items-center gap-0.5">
                <Button
                  variant={editor.isActive('bold') ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className="h-7 w-7 p-0 hover:bg-accent/50 transition-colors"
                  title="Bold"
                >
                  <Bold className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant={editor.isActive('italic') ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className="h-7 w-7 p-0 hover:bg-accent/50 transition-colors"
                  title="Italic"
                >
                  <Italic className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant={editor.isActive('underline') ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                  className="h-7 w-7 p-0 hover:bg-accent/50 transition-colors"
                  title="Underline"
                >
                  <UnderlineIcon className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant={editor.isActive('strike') ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => editor.chain().focus().toggleStrike().run()}
                  className="h-7 w-7 p-0 hover:bg-accent/50 transition-colors"
                  title="Strikethrough"
                >
                  <Strikethrough className="h-3.5 w-3.5" />
                </Button>
              </div>

              <Separator orientation="vertical" className="h-4 mx-1" />

              {/* Headings */}
              <div className="flex items-center gap-0.5">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 gap-1.5 px-2 text-xs hover:bg-accent/50 transition-colors"
                    >
                      <Type className="h-3.5 w-3.5" />
                      Text
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-40 border-border/50 shadow-lg">
                    <DropdownMenuItem 
                      onClick={() => editor.chain().focus().setParagraph().run()}
                      className={cn("text-sm py-2", editor.isActive('paragraph') && 'bg-accent')}
                    >
                      <Type className="h-4 w-4 mr-2" />
                      Paragraph
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                      className={cn("text-sm py-2", editor.isActive('heading', { level: 1 }) && 'bg-accent')}
                    >
                      <Heading1 className="h-4 w-4 mr-2" />
                      Heading 1
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                      className={cn("text-sm py-2", editor.isActive('heading', { level: 2 }) && 'bg-accent')}
                    >
                      <Heading2 className="h-4 w-4 mr-2" />
                      Heading 2
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                      className={cn("text-sm py-2", editor.isActive('heading', { level: 3 }) && 'bg-accent')}
                    >
                      <Heading3 className="h-4 w-4 mr-2" />
                      Heading 3
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <Separator orientation="vertical" className="h-4 mx-1" />

              {/* Lists */}
              <div className="flex items-center gap-0.5">
                <Button
                  variant={editor.isActive('bulletList') ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                  className="h-7 w-7 p-0 hover:bg-accent/50 transition-colors"
                  title="Bullet List"
                >
                  <List className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant={editor.isActive('orderedList') ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                  className="h-7 w-7 p-0 hover:bg-accent/50 transition-colors"
                  title="Numbered List"
                >
                  <ListOrdered className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant={editor.isActive('blockquote') ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => editor.chain().focus().toggleBlockquote().run()}
                  className="h-7 w-7 p-0 hover:bg-accent/50 transition-colors"
                  title="Quote"
                >
                  <Quote className="h-3.5 w-3.5" />
                </Button>
              </div>

              <Separator orientation="vertical" className="h-4 mx-1" />

              {/* Media & Code */}
              <div className="flex items-center gap-0.5">
                <DropdownMenu open={showImageDialog} onOpenChange={setShowImageDialog}>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0 hover:bg-accent/50 transition-colors"
                      title="Add Image"
                    >
                      <ImageIcon className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-80 p-0 border-border/50 shadow-lg">
                    <div className="p-4 space-y-3">
                      <div>
                        <label className="text-sm font-medium text-foreground/80">Image URL</label>
                        <Input
                          placeholder="https://example.com/image.jpg"
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          className="mt-2 border-border/50 focus:border-primary/50"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setShowImageDialog(false)}
                          className="text-xs"
                        >
                          Cancel
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={addImage}
                          disabled={!imageUrl.trim()}
                          className="text-xs"
                        >
                          Add Image
                        </Button>
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Button
                  variant={editor.isActive('codeBlock') ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                  className="h-7 w-7 p-0 hover:bg-accent/50 transition-colors"
                  title="Code Block"
                >
                  <Code className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {enableAI && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 gap-1.5 px-2 text-xs hover:bg-accent/50 transition-colors"
                      title="AI Tools"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      AI
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 border-border/50 shadow-lg">
                    <DropdownMenuItem onClick={handleAIRewrite} className="text-sm py-2">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Rewrite with AI
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={async () => {
                        const { from, to } = editor.state.selection;
                        const selectedText = editor.state.doc.textBetween(from, to);
                        
                        if (!selectedText.trim()) {
                          toast({
                            title: "No Text Selected",
                            description: "Please select some text to summarize.",
                            variant: "destructive"
                          });
                          return;
                        }

                        try {
                          toast({
                            title: "AI Processing",
                            description: "Summarizing your text with AI...",
                          });

                          const { data, error } = await supabase.functions.invoke('ai-content-enhancer', {
                            body: {
                              text: selectedText,
                              action: 'summarize',
                              tone: 'professional',
                              maxLength: 100
                            }
                          });

                          if (error) throw error;

                          if (data?.success && data?.enhancedText) {
                            editor.chain().focus().deleteSelection().insertContent(data.enhancedText).run();
                            toast({
                              title: "Text Summarized",
                              description: "Your text has been successfully summarized.",
                            });
                          } else {
                            throw new Error(data?.error || 'Failed to summarize text');
                          }
                        } catch (error) {
                          console.error('AI enhancement error:', error);
                          toast({
                            title: "AI Error", 
                            description: error instanceof Error ? error.message : "Failed to summarize text.",
                            variant: "destructive"
                          });
                        }
                      }}
                      className="text-sm py-2"
                    >
                      <MoreHorizontal className="h-4 w-4 mr-2" />
                      Summarize
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={async () => {
                        const { from, to } = editor.state.selection;
                        const selectedText = editor.state.doc.textBetween(from, to);
                        
                        if (!selectedText.trim()) {
                          toast({
                            title: "No Text Selected",
                            description: "Please select some text to make more engaging.",
                            variant: "destructive"
                          });
                          return;
                        }

                        try {
                          toast({
                            title: "AI Processing",
                            description: "Making your text more engaging...",
                          });

                          const { data, error } = await supabase.functions.invoke('ai-content-enhancer', {
                            body: {
                              text: selectedText,
                              action: 'make_engaging',
                              tone: 'creative',
                              targetAudience: 'general audience'
                            }
                          });

                          if (error) throw error;

                          if (data?.success && data?.enhancedText) {
                            editor.chain().focus().deleteSelection().insertContent(data.enhancedText).run();
                            toast({
                              title: "Text Enhanced",
                              description: "Your text has been made more engaging!",
                            });
                          } else {
                            throw new Error(data?.error || 'Failed to enhance text');
                          }
                        } catch (error) {
                          console.error('AI enhancement error:', error);
                          toast({
                            title: "AI Error",
                            description: error instanceof Error ? error.message : "Failed to enhance text.",
                            variant: "destructive"
                          });
                        }
                      }}
                      className="text-sm py-2"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Make Engaging
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              
              <Separator orientation="vertical" className="h-4 mx-1" />
              
              <div className="flex items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().undo().run()}
                  disabled={!editor.can().undo()}
                  className="h-7 w-7 p-0 hover:bg-accent/50 transition-colors disabled:opacity-30"
                  title="Undo"
                >
                  <Undo className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().redo().run()}
                  disabled={!editor.can().redo()}
                  className="h-7 w-7 p-0 hover:bg-accent/50 transition-colors disabled:opacity-30"
                  title="Redo"
                >
                  <Redo className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Editor Content - Clean and spacious like Notion */}
      <div className="notion-content relative group bg-white">
        <div className="max-w-none px-6 py-8 bg-white">
          <EditorContent editor={editor} />
        </div>
      </div>

      <Separator className="mx-6" />
      
      {/* Word Count Footer */}
      {showWordCount && (
        <div className="notion-footer px-6 py-3 bg-white border-t border-border/20">
          <div className="text-xs text-muted-foreground font-medium">
            {getWordCount()} words
          </div>
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;
