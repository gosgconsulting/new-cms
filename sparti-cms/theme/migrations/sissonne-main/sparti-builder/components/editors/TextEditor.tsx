import React, { useState, useEffect } from 'react';
import { Type, Palette, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { SpartiElement } from '../../types';

interface TextEditorProps {
  selectedElement: SpartiElement;
}

export const TextEditor: React.FC<TextEditorProps> = ({ selectedElement }) => {
  const [content, setContent] = useState('');
  const [textColor, setTextColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('transparent');
  const [fontSize, setFontSize] = useState('');
  const [fontWeight, setFontWeight] = useState('');
  const [textAlign, setTextAlign] = useState('left');
  const [fontFamily, setFontFamily] = useState('');

  useEffect(() => {
    const { data } = selectedElement;
    setContent(data.content || '');
    setTextColor(data.styles.color || '#000000');
    setBackgroundColor(data.styles.backgroundColor || 'transparent');
    setFontSize(data.styles.fontSize || '');
    setFontWeight(data.styles.fontWeight || '');
    setTextAlign(data.styles.textAlign || 'left');
    setFontFamily(data.styles.fontFamily || '');
  }, [selectedElement]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    if (selectedElement.element) {
      selectedElement.element.textContent = newContent;
      selectedElement.data.content = newContent;
    }
  };

  const handleStyleChange = (property: string, value: string, setter: (v: string) => void) => {
    setter(value);
    if (selectedElement.element) {
      selectedElement.element.style[property as any] = value;
      selectedElement.data.styles[property] = value;
    }
  };

  const fontFamilies = [
    'inherit',
    'Arial, sans-serif',
    'Helvetica, sans-serif', 
    'Georgia, serif',
    'Times New Roman, serif',
    'Courier New, monospace',
    'Verdana, sans-serif',
    'Trebuchet MS, sans-serif',
    'Impact, sans-serif'
  ];

  const fontWeights = [
    { value: '', label: 'Default' },
    { value: '100', label: 'Thin' },
    { value: '300', label: 'Light' },
    { value: '400', label: 'Normal' },
    { value: '500', label: 'Medium' },
    { value: '600', label: 'Semi Bold' },
    { value: '700', label: 'Bold' },
    { value: '900', label: 'Black' }
  ];

  return (
    <>
      {/* Text Content */}
      <div className="sparti-edit-section">
        <div className="sparti-edit-label">
          <Type size={16} />
          Text Content
        </div>
        <textarea
          className="sparti-edit-textarea"
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Enter text content..."
          rows={3}
        />
      </div>

      {/* Typography */}
      <div className="sparti-edit-section">
        <div className="sparti-edit-label">Typography</div>
        
        <div className="sparti-typography-controls">
          <div className="sparti-input-group">
            <label>Font Family</label>
            <select
              className="sparti-edit-select"
              value={fontFamily}
              onChange={(e) => handleStyleChange('fontFamily', e.target.value, setFontFamily)}
            >
              {fontFamilies.map(font => (
                <option key={font} value={font}>
                  {font === 'inherit' ? 'Inherit' : font.split(',')[0]}
                </option>
              ))}
            </select>
          </div>
          
          <div className="sparti-input-group">
            <label>Font Size</label>
            <input
              type="text"
              className="sparti-edit-input"
              value={fontSize}
              onChange={(e) => handleStyleChange('fontSize', e.target.value, setFontSize)}
              placeholder="16px, 1.2em, 1rem..."
            />
          </div>
          
          <div className="sparti-input-group">
            <label>Font Weight</label>
            <select
              className="sparti-edit-select"
              value={fontWeight}
              onChange={(e) => handleStyleChange('fontWeight', e.target.value, setFontWeight)}
            >
              {fontWeights.map(weight => (
                <option key={weight.value} value={weight.value}>
                  {weight.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Text Alignment */}
      <div className="sparti-edit-section">
        <div className="sparti-edit-label">Text Alignment</div>
        <div className="sparti-alignment-controls">
          <button
            className={`sparti-btn sparti-btn-ghost ${textAlign === 'left' ? 'active' : ''}`}
            onClick={() => handleStyleChange('textAlign', 'left', setTextAlign)}
          >
            <AlignLeft size={16} />
          </button>
          <button
            className={`sparti-btn sparti-btn-ghost ${textAlign === 'center' ? 'active' : ''}`}
            onClick={() => handleStyleChange('textAlign', 'center', setTextAlign)}
          >
            <AlignCenter size={16} />
          </button>
          <button
            className={`sparti-btn sparti-btn-ghost ${textAlign === 'right' ? 'active' : ''}`}
            onClick={() => handleStyleChange('textAlign', 'right', setTextAlign)}
          >
            <AlignRight size={16} />
          </button>
        </div>
      </div>

      {/* Colors */}
      <div className="sparti-edit-section">
        <div className="sparti-edit-label">
          <Palette size={16} />
          Colors
        </div>
        <div className="sparti-color-controls">
          <div className="sparti-color-input">
            <label>Text Color</label>
            <input
              type="color"
              value={textColor}
              onChange={(e) => handleStyleChange('color', e.target.value, setTextColor)}
            />
          </div>
          <div className="sparti-color-input">
            <label>Background</label>
            <input
              type="color"
              value={backgroundColor === 'transparent' ? '#ffffff' : backgroundColor}
              onChange={(e) => handleStyleChange('backgroundColor', e.target.value, setBackgroundColor)}
            />
          </div>
        </div>
        <button
          className="sparti-btn sparti-btn-ghost sparti-btn-sm w-full"
          onClick={() => handleStyleChange('backgroundColor', 'transparent', setBackgroundColor)}
        >
          Remove Background
        </button>
      </div>
    </>
  );
};