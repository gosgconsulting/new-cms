import React, { useState } from 'react';
import { 
  Type, 
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link,
  Palette,
  ChevronDown,
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
  TextQuote
} from 'lucide-react';

// Branding colors and typography options
const BRANDING_COLORS = [
  { name: 'Primary', value: '#6200ee', gradient: 'linear-gradient(45deg, #6200ee, #9500ff)' },
  { name: 'Secondary', value: '#03dac6', gradient: 'linear-gradient(45deg, #03dac6, #00fff0)' },
  { name: 'Accent', value: '#ff4081', gradient: 'linear-gradient(45deg, #ff4081, #ff79b0)' },
  { name: 'Dark', value: '#121212', gradient: 'linear-gradient(45deg, #121212, #323232)' },
  { name: 'Light', value: '#f5f5f5', gradient: 'linear-gradient(45deg, #f5f5f5, #ffffff)' },
  { name: 'Warning', value: '#fb8c00', gradient: 'linear-gradient(45deg, #fb8c00, #ffbd45)' },
  { name: 'Error', value: '#b00020', gradient: 'linear-gradient(45deg, #b00020, #e53935)' },
  { name: 'Success', value: '#4caf50', gradient: 'linear-gradient(45deg, #4caf50, #80e27e)' },
];

// Text style options
const TEXT_STYLES = [
  { name: 'Paragraph', value: 'paragraph', component: Pilcrow, className: 'text-base' },
  { name: 'Heading 1', value: 'h1', component: Heading1, className: 'text-4xl font-bold' },
  { name: 'Heading 2', value: 'h2', component: Heading2, className: 'text-3xl font-bold' },
  { name: 'Heading 3', value: 'h3', component: Heading3, className: 'text-2xl font-bold' },
  { name: 'Heading 4', value: 'h4', component: Heading3, className: 'text-xl font-bold' },
  { name: 'Heading 5', value: 'h5', component: Heading3, className: 'text-lg font-bold' },
  { name: 'Heading 6', value: 'h6', component: Heading3, className: 'text-base font-bold' },
  { name: 'Quote', value: 'quote', component: TextQuote, className: 'italic border-l-4 border-gray-400 pl-4' }
];

// Font size options
const FONT_SIZES = [
  { name: 'Small', value: '12px' },
  { name: 'Normal', value: '16px' },
  { name: 'Medium', value: '20px' },
  { name: 'Large', value: '24px' },
  { name: 'X-Large', value: '32px' },
  { name: 'XX-Large', value: '48px' }
];

interface TextEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  className?: string;
}

export const TextEditor: React.FC<TextEditorProps> = ({
  content = '',
  onChange,
  placeholder = 'Enter text...',
  className = ''
}) => {
  const [editorContent, setEditorContent] = useState<string>(content);
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const [showTextStylePicker, setShowTextStylePicker] = useState<boolean>(false);
  const [showFontSizePicker, setShowFontSizePicker] = useState<boolean>(false);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedTextStyle, setSelectedTextStyle] = useState<string>('paragraph');
  const [selectedFontSize, setSelectedFontSize] = useState<string>('16px');

  // Text selection and formatting handlers
  const getSelectedText = () => {
    if (window.getSelection) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        return {
          selection,
          range: selection.getRangeAt(0),
          text: selection.toString()
        };
      }
    }
    return null;
  };
  
  const applyFormatToSelection = (formatFn) => {
    const selectionData = getSelectedText();
    if (!selectionData || !selectionData.text) return;
    
    const { selection, range } = selectionData;
    const span = document.createElement('span');
    
    // Apply the formatting function to the span
    formatFn(span);
    
    // Delete the current selection content and insert our formatted span
    range.deleteContents();
    range.insertNode(span);
    
    // Create a new range that selects our newly inserted span
    const newRange = document.createRange();
    newRange.selectNodeContents(span);
    
    // Update the editor content after DOM manipulation
    const editorElement = document.querySelector('[contenteditable]');
    if (editorElement) {
      // Preserve the selection during content update
      const tempSelection = window.getSelection();
      if (tempSelection) {
        tempSelection.removeAllRanges();
        tempSelection.addRange(newRange);
      }
      
      // Update the editor content state
      const newContent = editorElement.innerHTML;
      setEditorContent(newContent);
      onChange?.(newContent);
    }
    
    // Keep the selection visible but collapsed at the end of our span
    // This allows for continuous editing
    selection.removeAllRanges();
    const endRange = document.createRange();
    endRange.setStartAfter(span);
    endRange.collapse(true);
    selection.addRange(endRange);
  };

  // Text formatting handlers
  const handleBold = () => {
    const selectionData = getSelectedText();
    if (selectionData && selectionData.text) {
      applyFormatToSelection(span => {
        span.style.fontWeight = 'bold';
        span.textContent = selectionData.text;
      });
    } else {
      const newContent = `<strong>${editorContent}</strong>`;
      setEditorContent(newContent);
      onChange?.(newContent);
    }
  };

  const handleItalic = () => {
    const selectionData = getSelectedText();
    if (selectionData && selectionData.text) {
      applyFormatToSelection(span => {
        span.style.fontStyle = 'italic';
        span.textContent = selectionData.text;
      });
    } else {
      const newContent = `<em>${editorContent}</em>`;
      setEditorContent(newContent);
      onChange?.(newContent);
    }
  };

  const handleUnderline = () => {
    const selectionData = getSelectedText();
    if (selectionData && selectionData.text) {
      applyFormatToSelection(span => {
        span.style.textDecoration = 'underline';
        span.textContent = selectionData.text;
      });
    } else {
      const newContent = `<u>${editorContent}</u>`;
      setEditorContent(newContent);
      onChange?.(newContent);
    }
  };

  const handleAlignment = (alignment: string) => {
    const newContent = `<div style="text-align: ${alignment}">${editorContent}</div>`;
    setEditorContent(newContent);
    onChange?.(newContent);
  };
  
  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    const selectionData = getSelectedText();
    
    if (selectionData && selectionData.text) {
      applyFormatToSelection(span => {
        span.style.color = color;
        span.textContent = selectionData.text;
      });
    } else {
      const newContent = `<span style="color: ${color}">${editorContent}</span>`;
      setEditorContent(newContent);
      onChange?.(newContent);
    }
    
    setShowColorPicker(false);
  };
  
  const handleGradientChange = (gradient: string) => {
    setSelectedColor(gradient);
    const selectionData = getSelectedText();
    
    if (selectionData && selectionData.text) {
      applyFormatToSelection(span => {
        // Apply proper gradient styling with all necessary properties
        span.style.backgroundImage = gradient;
        span.style.webkitBackgroundClip = 'text';
        span.style.backgroundClip = 'text';  // Standard property
        span.style.webkitTextFillColor = 'transparent';
        span.style.color = 'transparent';    // Fallback for non-webkit
        span.style.display = 'inline-block'; // Ensures gradient applies properly
        span.textContent = selectionData.text;
      });
    } else {
      // If no selection, apply to entire content with all necessary properties
      const newContent = `<span style="background-image: ${gradient}; -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent; display: inline-block;">${editorContent}</span>`;
      setEditorContent(newContent);
      onChange?.(newContent);
    }
    
    setShowColorPicker(false);
  };
  
  // Handle text style selection
  const handleTextStyleChange = (style: string) => {
    setSelectedTextStyle(style);
    setShowTextStylePicker(false);
    
    // Apply the style to the selected text or entire content
    const selectionData = getSelectedText();
    if (selectionData && selectionData.text) {
      const textStyle = TEXT_STYLES.find(s => s.value === style);
      if (textStyle) {
        applyFormatToSelection(span => {
          span.className = textStyle.className;
          span.textContent = selectionData.text;
        });
      }
    } else {
      // Apply to entire content
      const textStyle = TEXT_STYLES.find(s => s.value === style);
      if (textStyle) {
        const newContent = `<div class="${textStyle.className}">${editorContent}</div>`;
        setEditorContent(newContent);
        onChange?.(newContent);
      }
    }
  };
  
  // Handle font size selection
  const handleFontSizeChange = (size: string) => {
    setSelectedFontSize(size);
    setShowFontSizePicker(false);
    
    // Apply the font size to the selected text or entire content
    const selectionData = getSelectedText();
    if (selectionData && selectionData.text) {
      applyFormatToSelection(span => {
        span.style.fontSize = size;
        span.textContent = selectionData.text;
      });
    } else {
      const newContent = `<span style="font-size: ${size}">${editorContent}</span>`;
      setEditorContent(newContent);
      onChange?.(newContent);
    }
  };
  
  // Get text style component by value
  const getTextStyleComponent = (value: string) => {
    const textStyle = TEXT_STYLES.find(s => s.value === value);
    if (textStyle) {
      const StyleComponent = textStyle.component;
      return <StyleComponent className="h-5 w-5" />;
    }
    return <Pilcrow className="h-5 w-5" />;
  };

  const handleContentChange = (e: React.FormEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.innerHTML;
    setEditorContent(newContent);
    onChange?.(newContent);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2 p-2 border-b border-gray-200 bg-gray-50 rounded-t-md">
        <div className="relative">
          <button 
            onClick={() => setShowTextStylePicker(!showTextStylePicker)}
            className="flex items-center py-1 px-2 hover:bg-gray-100 rounded border border-gray-200"
          >
            {getTextStyleComponent(selectedTextStyle)}
            <span className="text-sm text-gray-700 ml-1">
              {TEXT_STYLES.find(s => s.value === selectedTextStyle)?.name || 'Paragraph'}
            </span>
            <ChevronDown className="h-3 w-3 ml-1 text-gray-500" />
          </button>
          
          {showTextStylePicker && (
            <div className="absolute z-10 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200">
              <div className="p-2">
                {TEXT_STYLES.map((style) => {
                  const StyleComponent = style.component;
                  return (
                    <button
                      key={style.value}
                      onClick={() => handleTextStyleChange(style.value)}
                      className="w-full flex items-center px-3 py-2 text-sm hover:bg-gray-100 rounded"
                    >
                        <StyleComponent className="h-4 w-4 mr-2" />
                        <span>{style.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
          )}
        </div>
        
        <div className="h-6 border-r border-gray-300 mx-1"></div>
        
        <button 
          onClick={handleBold}
          className="p-2 hover:bg-gray-200 rounded"
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button 
          onClick={handleItalic}
          className="p-2 hover:bg-gray-200 rounded"
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button 
          onClick={handleUnderline}
          className="p-2 hover:bg-gray-200 rounded"
          title="Underline"
        >
          <Underline className="h-4 w-4" />
        </button>
        
        <div className="h-6 border-r border-gray-300 mx-1"></div>
        
        <button 
          onClick={() => handleAlignment('left')}
          className="p-2 hover:bg-gray-200 rounded"
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </button>
        <button 
          onClick={() => handleAlignment('center')}
          className="p-2 hover:bg-gray-200 rounded"
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </button>
        <button 
          onClick={() => handleAlignment('right')}
          className="p-2 hover:bg-gray-200 rounded"
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </button>
        
        <div className="h-6 border-r border-gray-300 mx-1"></div>
        
        <button className="p-2 hover:bg-gray-200 rounded" title="Link">
          <Link className="h-4 w-4" />
        </button>
        
        {/* Color Picker */}
        <div className="relative">
          <button 
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="flex items-center p-2 hover:bg-gray-200 rounded"
            title="Text Color"
          >
            <Palette className="h-4 w-4" />
          </button>
          
          {showColorPicker && (
            <div className="absolute z-10 mt-1 w-64 bg-white rounded-md shadow-lg border border-gray-200">
              <div className="p-2 border-b border-gray-200">
                <p className="text-xs font-medium text-gray-500">Brand Colors</p>
              </div>
              <div className="p-2 grid grid-cols-4 gap-2">
                {BRANDING_COLORS.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => handleColorChange(color.value)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center"
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
              <div className="p-2 border-t border-gray-200">
                <p className="text-xs font-medium text-gray-500 mb-2">Gradients</p>
                <div className="grid grid-cols-2 gap-2">
                  {BRANDING_COLORS.map((color) => (
                    <button
                      key={`gradient-${color.name}`}
                      onClick={() => handleGradientChange(color.gradient)}
                      className="w-full h-8 rounded border border-gray-300"
                      style={{ background: color.gradient }}
                      title={`${color.name} Gradient`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Direct Editor with Live Preview */}
      <div 
        className={`w-full p-3 border border-gray-300 rounded-b-md focus-within:ring-1 focus-within:ring-blue-400 focus-within:border-blue-400`}
        style={{ 
          minHeight: '200px',
          fontSize: selectedFontSize
        }}
      >
        <div
          contentEditable
          suppressContentEditableWarning
          dangerouslySetInnerHTML={{ __html: editorContent }}
          onInput={handleContentChange}
          className={`outline-none min-h-[1.5em] w-full ${
            TEXT_STYLES.find(s => s.value === selectedTextStyle)?.className || ''
          }`}
          data-placeholder={placeholder}
          spellCheck="false"
          dir="ltr" // Explicitly set left-to-right text direction
        />
      </div>
    </div>
  );
};

export default TextEditor;
