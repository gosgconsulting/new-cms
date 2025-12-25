import React, { useState, useEffect, useRef } from 'react';
import { useCMSSettings } from '../../context/CMSSettingsContext';
import { Type, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, ChevronDown, Palette, Link as LinkIcon } from 'lucide-react';
import { SpartiElement } from '../../types';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Link from '@tiptap/extension-link';

interface TextEditorProps {
  selectedElement: SpartiElement;
}

export const TextEditor: React.FC<TextEditorProps> = ({ selectedElement }) => {
  const [content, setContent] = useState('');
  const [isTypographyOpen, setIsTypographyOpen] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const typographyRef = useRef<HTMLDivElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const linkDialogRef = useRef<HTMLDivElement>(null);
  
  // Get CMS settings
  const { settings } = useCMSSettings();
  
  // Create color palette from CMS settings
  const colorPalette = [
    { name: 'Primary', value: settings.colors.primary },
    { name: 'Secondary', value: settings.colors.secondary },
    { name: 'Accent', value: settings.colors.accent },
    { name: 'Background', value: settings.colors.background },
    { name: 'Text', value: settings.colors.text },
    { name: 'Heading', value: settings.colors.heading },
    { name: 'Link', value: settings.colors.link },
    // Add some standard colors as well
    { name: 'Black', value: '#000000' },
    { name: 'White', value: '#ffffff' },
    { name: 'Red', value: '#ff0000' },
    { name: 'Blue', value: '#0066ff' }
  ];

  // State to track current format and color
  const [currentFormat, setCurrentFormat] = useState('paragraph');
  const [currentColor, setCurrentColor] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable the built-in link to avoid conflicts
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
          class: 'sparti-link',
        },
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      const htmlContent = editor.getHTML();
      
      // Update the element content
      if (selectedElement.element) {
        selectedElement.element.innerHTML = htmlContent;
        selectedElement.data.content = htmlContent;
      }
    },
    onSelectionUpdate: ({ editor }) => {
      // Update current format
      updateCurrentFormat(editor);
      // Update current color
      updateCurrentColor(editor);
    },
  });

  useEffect(() => {
    const { data } = selectedElement;
    const initialContent = data.content || '';
    setContent(initialContent);
    
    if (editor && initialContent !== editor.getHTML()) {
      editor.commands.setContent(initialContent);
    }
  }, [selectedElement, editor]);
  
  // Apply typography settings from CMS context
  useEffect(() => {
    if (!editor || !editor.view) return;
    
    const { headingFont, bodyFont, baseFontSize, lineHeight, letterSpacing } = settings.typography;
    
    // Apply typography settings to editor
    const editorElement = document.querySelector('.ProseMirror');
    if (editorElement) {
      // Apply base typography
      editorElement.setAttribute('style', `
        font-family: ${bodyFont}, sans-serif;
        font-size: ${baseFontSize}px;
        line-height: ${lineHeight};
        letter-spacing: ${letterSpacing}px;
      `);
      
      // Apply heading styles
      const headingElements = editorElement.querySelectorAll('h1, h2, h3, h4, h5, h6');
      headingElements.forEach(heading => {
        heading.setAttribute('style', `font-family: ${headingFont}, sans-serif;`);
      });
    }
  }, [settings.typography, editor]);
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (typographyRef.current && !typographyRef.current.contains(event.target as Node)) {
        setIsTypographyOpen(false);
      }
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setIsColorPickerOpen(false);
      }
      if (linkDialogRef.current && !linkDialogRef.current.contains(event.target as Node)) {
        setIsLinkDialogOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Helper function to update current format based on selection
  const updateCurrentFormat = (editor: any) => {
    if (!editor) return;
    
    if (editor.isActive('heading', { level: 1 })) {
      setCurrentFormat('h1');
    } else if (editor.isActive('heading', { level: 2 })) {
      setCurrentFormat('h2');
    } else if (editor.isActive('heading', { level: 3 })) {
      setCurrentFormat('h3');
    } else if (editor.isActive('heading', { level: 4 })) {
      setCurrentFormat('h4');
    } else if (editor.isActive('heading', { level: 5 })) {
      setCurrentFormat('h5');
    } else if (editor.isActive('heading', { level: 6 })) {
      setCurrentFormat('h6');
    } else {
      setCurrentFormat('paragraph');
    }
  };

  // Helper function to update current color based on selection
  const updateCurrentColor = (editor: any) => {
    if (!editor) return;
    
    const color = editor.getAttributes('textStyle').color;
    setCurrentColor(color || '');
  };
  
  
  // Helper function to get color name from value
  const getColorName = (colorValue: string) => {
    const color = colorPalette.find(c => c.value.toLowerCase() === colorValue.toLowerCase());
    return color ? color.name : colorValue;
  };

  const handleLinkAdd = () => {
    if (!editor) return;
    
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to);
    
    if (!selectedText) {
      alert('Please select text first to add a link');
      return;
    }
    
    setIsLinkDialogOpen(true);
    const existingHref = editor.getAttributes('link').href || '';
    setLinkUrl(existingHref);
  };

  const handleLinkSave = () => {
    if (!editor || !linkUrl.trim()) return;
    
    editor.chain().focus().setLink({ href: linkUrl }).run();
    setIsLinkDialogOpen(false);
    setLinkUrl('');
  };

  const handleLinkRemove = () => {
    if (!editor) return;
    editor.chain().focus().unsetLink().run();
    setIsLinkDialogOpen(false);
    setLinkUrl('');
  };
  
  // Update format and color when editor is ready or selection changes
  useEffect(() => {
    if (editor) {
      // Initial update
      updateCurrentFormat(editor);
      updateCurrentColor(editor);
      
      // Add transaction listener for more accurate updates
      const onTransaction = () => {
        updateCurrentFormat(editor);
        updateCurrentColor(editor);
      };
      
      // Add focus listener to ensure format is updated when editor gets focus
      const onFocus = () => {
        updateCurrentFormat(editor);
        updateCurrentColor(editor);
      };
      
      // Add blur listener to ensure format is updated when editor loses focus
      const onBlur = () => {
        updateCurrentFormat(editor);
        updateCurrentColor(editor);
      };
      
      editor.on('transaction', onTransaction);
      editor.on('focus', onFocus);
      editor.on('blur', onBlur);
      
      // Force an update after a short delay to ensure initial content is properly analyzed
      setTimeout(() => {
        updateCurrentFormat(editor);
        updateCurrentColor(editor);
      }, 100);
      
      return () => {
        editor.off('transaction', onTransaction);
        editor.off('focus', onFocus);
        editor.off('blur', onBlur);
      };
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="sparti-edit-section">
      <div className="sparti-edit-label">
        <Type size={16} />
        Rich Text Editor
      </div>
      
      <div className="sparti-tiptap-container">
        {/* Toolbar */}
        <div className="sparti-tiptap-toolbar">
          {/* Typography dropdown */}
          <div className="sparti-typography-dropdown" ref={typographyRef}>
            <button
              onClick={() => setIsTypographyOpen(!isTypographyOpen)}
              className={`sparti-toolbar-dropdown-btn ${currentFormat !== 'paragraph' ? 'active' : ''}`}
              type="button"
              title="Text style"
            >
              <Type size={14} />
              <span className="sparti-dropdown-label">
                {currentFormat === 'h1' && 'Heading 1'}
                {currentFormat === 'h2' && 'Heading 2'}
                {currentFormat === 'h3' && 'Heading 3'}
                {currentFormat === 'h4' && 'Heading 4'}
                {currentFormat === 'h5' && 'Heading 5'}
                {currentFormat === 'h6' && 'Heading 6'}
                {currentFormat === 'paragraph' && 'Paragraph'}
              </span>
              <ChevronDown size={14} />
            </button>
            
            {isTypographyOpen && (
              <div className="sparti-dropdown-menu">
                <button
                  onClick={() => {
                    editor.chain().focus().setParagraph().run();
                    setIsTypographyOpen(false);
                  }}
                  className={`sparti-dropdown-item ${editor.isActive('paragraph') ? 'active' : ''}`}
                >
                  <span className="sparti-dropdown-item-label">Paragraph</span>
                </button>
                <button
                  onClick={() => {
                    editor.chain().focus().toggleHeading({ level: 1 }).run();
                    setIsTypographyOpen(false);
                  }}
                  className={`sparti-dropdown-item ${editor.isActive('heading', { level: 1 }) ? 'active' : ''}`}
                >
                  <span className="sparti-dropdown-item-label h1">Heading 1</span>
                </button>
                <button
                  onClick={() => {
                    editor.chain().focus().toggleHeading({ level: 2 }).run();
                    setIsTypographyOpen(false);
                  }}
                  className={`sparti-dropdown-item ${editor.isActive('heading', { level: 2 }) ? 'active' : ''}`}
                >
                  <span className="sparti-dropdown-item-label h2">Heading 2</span>
                </button>
                <button
                  onClick={() => {
                    editor.chain().focus().toggleHeading({ level: 3 }).run();
                    setIsTypographyOpen(false);
                  }}
                  className={`sparti-dropdown-item ${editor.isActive('heading', { level: 3 }) ? 'active' : ''}`}
                >
                  <span className="sparti-dropdown-item-label h3">Heading 3</span>
                </button>
                <button
                  onClick={() => {
                    editor.chain().focus().toggleHeading({ level: 4 }).run();
                    setIsTypographyOpen(false);
                  }}
                  className={`sparti-dropdown-item ${editor.isActive('heading', { level: 4 }) ? 'active' : ''}`}
                >
                  <span className="sparti-dropdown-item-label h4">Heading 4</span>
                </button>
                <button
                  onClick={() => {
                    editor.chain().focus().toggleHeading({ level: 5 }).run();
                    setIsTypographyOpen(false);
                  }}
                  className={`sparti-dropdown-item ${editor.isActive('heading', { level: 5 }) ? 'active' : ''}`}
                >
                  <span className="sparti-dropdown-item-label h5">Heading 5</span>
                </button>
                <button
                  onClick={() => {
                    editor.chain().focus().toggleHeading({ level: 6 }).run();
                    setIsTypographyOpen(false);
                  }}
                  className={`sparti-dropdown-item ${editor.isActive('heading', { level: 6 }) ? 'active' : ''}`}
                >
                  <span className="sparti-dropdown-item-label h6">Heading 6</span>
                </button>
              </div>
            )}
          </div>
          
          <div className="sparti-toolbar-divider"></div>
          
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`sparti-toolbar-btn ${editor.isActive('bold') ? 'active' : ''}`}
            type="button"
            title="Bold"
          >
            <Bold size={14} />
          </button>
          
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`sparti-toolbar-btn ${editor.isActive('italic') ? 'active' : ''}`}
            type="button"
            title="Italic"
          >
            <Italic size={14} />
          </button>
          
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`sparti-toolbar-btn ${editor.isActive('underline') ? 'active' : ''}`}
            type="button"
            title="Underline"
          >
            <Underline size={14} />
          </button>
          
          <div className="sparti-toolbar-divider"></div>
          
          {/* Color picker */}
          <div className="sparti-color-dropdown" ref={colorPickerRef}>
            <button
              onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
              className="sparti-toolbar-btn sparti-color-btn"
              type="button"
              title={`Text color: ${currentColor ? getColorName(currentColor) : 'Default'}`}
              style={{
                borderBottom: `2px solid ${currentColor || 'transparent'}`
              }}
            >
              <Palette size={14} />
            </button>
            
            {isColorPickerOpen && (
              <div className="sparti-dropdown-menu sparti-color-picker-menu">
                <div className="sparti-color-picker-title">Text Color</div>
                <div className="sparti-color-grid">
                  {colorPalette.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => {
                        editor.chain().focus().setColor(color.value).run();
                        setIsColorPickerOpen(false);
                      }}
                      className={`sparti-color-swatch ${currentColor === color.value ? 'active' : ''}`}
                      title={color.name}
                      style={{ backgroundColor: color.value }}
                    />
                  ))}
                </div>
                <div className="sparti-color-custom">
                  <label htmlFor="custom-color" className="sparti-color-custom-label">Custom:</label>
                  <input 
                    id="custom-color"
                    type="color" 
                    value={currentColor || '#000000'}
                    onChange={(e) => {
                      editor.chain().focus().setColor(e.target.value).run();
                    }}
                    className="sparti-color-input"
                  />
                </div>
                <button
                  onClick={() => {
                    editor.chain().focus().unsetColor().run();
                    setIsColorPickerOpen(false);
                  }}
                  className="sparti-dropdown-item"
                >
                  <span className="sparti-dropdown-item-label">Default Color</span>
                </button>
              </div>
            )}
          </div>
          
          <div className="sparti-toolbar-divider"></div>
          
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`sparti-toolbar-btn ${editor.isActive({ textAlign: 'left' }) ? 'active' : ''}`}
            type="button"
            title="Align Left"
          >
            <AlignLeft size={14} />
          </button>
          
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`sparti-toolbar-btn ${editor.isActive({ textAlign: 'center' }) ? 'active' : ''}`}
            type="button"
            title="Align Center"
          >
            <AlignCenter size={14} />
          </button>
          
          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`sparti-toolbar-btn ${editor.isActive({ textAlign: 'right' }) ? 'active' : ''}`}
            type="button"
            title="Align Right"
          >
            <AlignRight size={14} />
          </button>
          
          <div className="sparti-toolbar-divider"></div>
          
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`sparti-toolbar-btn ${editor.isActive('bulletList') ? 'active' : ''}`}
            type="button"
            title="Bullet List"
          >
            <List size={14} />
          </button>
          
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`sparti-toolbar-btn ${editor.isActive('orderedList') ? 'active' : ''}`}
            type="button"
            title="Numbered List"
          >
            <ListOrdered size={14} />
          </button>

          <div className="sparti-toolbar-divider"></div>

          <button
            onClick={handleLinkAdd}
            className={`sparti-toolbar-btn ${editor.isActive('link') ? 'active' : ''}`}
            type="button"
            title="Add Link"
          >
            <LinkIcon size={14} />
          </button>
        </div>

        {/* Link Dialog */}
        {isLinkDialogOpen && (
          <div className="sparti-link-dialog" ref={linkDialogRef}>
            <div className="sparti-link-dialog-content">
              <h4>Add Link</h4>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="Enter URL (e.g., https://example.com)"
                className="sparti-link-input"
                autoFocus
              />
              <div className="sparti-link-actions">
                <button
                  type="button"
                  className="sparti-btn sparti-btn-primary"
                  onClick={handleLinkSave}
                  disabled={!linkUrl.trim()}
                >
                  Save
                </button>
                {editor?.isActive('link') && (
                  <button
                    type="button"
                    className="sparti-btn sparti-btn-secondary"
                    onClick={handleLinkRemove}
                  >
                    Remove Link
                  </button>
                )}
                <button
                  type="button"
                  className="sparti-btn sparti-btn-ghost"
                  onClick={() => setIsLinkDialogOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Editor */}
        <div className="sparti-tiptap-editor">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
};