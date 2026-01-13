import React, { useState, useEffect } from 'react';
import { Settings, Palette, Move } from 'lucide-react';
import { SpartiElement } from '../../types';

interface ContainerEditorProps {
  selectedElement: SpartiElement;
}

export const ContainerEditor: React.FC<ContainerEditorProps> = ({ selectedElement }) => {
  const [backgroundColor, setBackgroundColor] = useState('transparent');
  const [padding, setPadding] = useState('');
  const [margin, setMargin] = useState('');
  const [borderRadius, setBorderRadius] = useState('');
  const [borderColor, setBorderColor] = useState('#cccccc');
  const [borderWidth, setBorderWidth] = useState('');
  const [display, setDisplay] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');

  useEffect(() => {
    const { data } = selectedElement;
    setBackgroundColor(data.styles.backgroundColor || 'transparent');
    setPadding(data.styles.padding || '');
    setMargin(data.styles.margin || '');
    setBorderRadius(data.styles.borderRadius || '');
    setBorderColor(data.styles.borderColor || '#cccccc');
    setBorderWidth(data.styles.borderWidth || '');
    setDisplay(data.styles.display || '');
    setWidth(data.styles.width || '');
    setHeight(data.styles.height || '');
  }, [selectedElement]);

  const handleStyleChange = (property: string, value: string, setter: (v: string) => void) => {
    setter(value);
    if (selectedElement.element) {
      selectedElement.element.style[property as any] = value;
      selectedElement.data.styles[property] = value;
    }
  };

  const displayOptions = [
    { value: '', label: 'Default' },
    { value: 'block', label: 'Block' },
    { value: 'inline', label: 'Inline' },
    { value: 'inline-block', label: 'Inline Block' },
    { value: 'flex', label: 'Flex' },
    { value: 'grid', label: 'Grid' },
    { value: 'none', label: 'Hidden' }
  ];

  return (
    <>
      {/* Layout */}
      <div className="sparti-edit-section">
        <div className="sparti-edit-label">
          <Settings size={16} />
          Layout
        </div>
        <div className="sparti-layout-controls">
          <div className="sparti-input-group">
            <label>Display</label>
            <select
              className="sparti-edit-select"
              value={display}
              onChange={(e) => handleStyleChange('display', e.target.value, setDisplay)}
            >
              {displayOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="sparti-dimension-controls">
            <div className="sparti-input-group">
              <label>Width</label>
              <input
                type="text"
                className="sparti-edit-input"
                value={width}
                onChange={(e) => handleStyleChange('width', e.target.value, setWidth)}
                placeholder="auto, 100px, 50%..."
              />
            </div>
            <div className="sparti-input-group">
              <label>Height</label>
              <input
                type="text"
                className="sparti-edit-input"
                value={height}
                onChange={(e) => handleStyleChange('height', e.target.value, setHeight)}
                placeholder="auto, 200px, 50vh..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Spacing */}
      <div className="sparti-edit-section">
        <div className="sparti-edit-label">
          <Move size={16} />
          Spacing
        </div>
        <div className="sparti-spacing-controls">
          <div className="sparti-input-group">
            <label>Padding</label>
            <input
              type="text"
              className="sparti-edit-input"
              value={padding}
              onChange={(e) => handleStyleChange('padding', e.target.value, setPadding)}
              placeholder="10px, 10px 20px, 10px 20px 10px 20px"
            />
          </div>
          
          <div className="sparti-input-group">
            <label>Margin</label>
            <input
              type="text"
              className="sparti-edit-input"
              value={margin}
              onChange={(e) => handleStyleChange('margin', e.target.value, setMargin)}
              placeholder="10px, 10px 20px, auto"
            />
          </div>
        </div>
      </div>

      {/* Background & Borders */}
      <div className="sparti-edit-section">
        <div className="sparti-edit-label">
          <Palette size={16} />
          Appearance
        </div>
        <div className="sparti-appearance-controls">
          <div className="sparti-color-input">
            <label>Background Color</label>
            <input
              type="color"
              value={backgroundColor === 'transparent' ? '#ffffff' : backgroundColor}
              onChange={(e) => handleStyleChange('backgroundColor', e.target.value, setBackgroundColor)}
            />
            <button
              className="sparti-btn sparti-btn-ghost sparti-btn-sm"
              onClick={() => handleStyleChange('backgroundColor', 'transparent', setBackgroundColor)}
            >
              Clear
            </button>
          </div>
          
          <div className="sparti-border-controls">
            <div className="sparti-input-group">
              <label>Border Width</label>
              <input
                type="text"
                className="sparti-edit-input"
                value={borderWidth}
                onChange={(e) => handleStyleChange('borderWidth', e.target.value, setBorderWidth)}
                placeholder="0, 1px, 2px..."
              />
            </div>
            
            <div className="sparti-color-input">
              <label>Border Color</label>
              <input
                type="color"
                value={borderColor}
                onChange={(e) => handleStyleChange('borderColor', e.target.value, setBorderColor)}
              />
            </div>
            
            <div className="sparti-input-group">
              <label>Border Radius</label>
              <input
                type="text"
                className="sparti-edit-input"
                value={borderRadius}
                onChange={(e) => handleStyleChange('borderRadius', e.target.value, setBorderRadius)}
                placeholder="0, 4px, 50%..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="sparti-edit-section">
        <div className="sparti-edit-label">Quick Presets</div>
        <div className="sparti-preset-buttons">
          <button
            className="sparti-btn sparti-btn-ghost sparti-btn-sm"
            onClick={() => {
              handleStyleChange('display', 'flex', setDisplay);
              handleStyleChange('justifyContent', 'center', () => {});
              handleStyleChange('alignItems', 'center', () => {});
            }}
          >
            Center Content
          </button>
          
          <button
            className="sparti-btn sparti-btn-ghost sparti-btn-sm"
            onClick={() => {
              handleStyleChange('padding', '20px', setPadding);
              handleStyleChange('borderRadius', '8px', setBorderRadius);
              handleStyleChange('backgroundColor', '#f5f5f5', setBackgroundColor);
            }}
          >
            Card Style
          </button>
          
          <button
            className="sparti-btn sparti-btn-ghost sparti-btn-sm"
            onClick={() => {
              handleStyleChange('padding', '0', setPadding);
              handleStyleChange('margin', '0', setMargin);
              handleStyleChange('backgroundColor', 'transparent', setBackgroundColor);
              handleStyleChange('borderWidth', '0', setBorderWidth);
            }}
          >
            Reset Styles
          </button>
        </div>
      </div>
    </>
  );
};