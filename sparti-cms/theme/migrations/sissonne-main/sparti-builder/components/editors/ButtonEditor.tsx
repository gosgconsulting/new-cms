import React, { useState, useEffect } from 'react';
import { MousePointer, Palette, Type } from 'lucide-react';
import { SpartiElement } from '../../types';

interface ButtonEditorProps {
  selectedElement: SpartiElement;
}

export const ButtonEditor: React.FC<ButtonEditorProps> = ({ selectedElement }) => {
  const [text, setText] = useState('');
  const [type, setType] = useState('button');
  const [disabled, setDisabled] = useState(false);
  const [textColor, setTextColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [borderColor, setBorderColor] = useState('#cccccc');
  const [borderRadius, setBorderRadius] = useState('');

  useEffect(() => {
    const { element, data } = selectedElement;
    setText(data.content || '');
    setType(data.type || 'button');
    setDisabled(element.hasAttribute('disabled'));
    setTextColor(data.styles.color || '#000000');
    setBackgroundColor(data.styles.backgroundColor || '#ffffff');
    setBorderColor(data.styles.borderColor || '#cccccc');
    setBorderRadius(data.styles.borderRadius || '');
  }, [selectedElement]);

  const handleTextChange = (newText: string) => {
    setText(newText);
    if (selectedElement.element) {
      selectedElement.element.textContent = newText;
      selectedElement.data.content = newText;
    }
  };

  const handleTypeChange = (newType: string) => {
    setType(newType);
    if (selectedElement.element) {
      selectedElement.element.setAttribute('type', newType);
      selectedElement.data.type = newType;
    }
  };

  const handleDisabledChange = (isDisabled: boolean) => {
    setDisabled(isDisabled);
    if (selectedElement.element) {
      if (isDisabled) {
        selectedElement.element.setAttribute('disabled', '');
      } else {
        selectedElement.element.removeAttribute('disabled');
      }
    }
  };

  const handleStyleChange = (property: string, value: string, setter: (v: string) => void) => {
    setter(value);
    if (selectedElement.element) {
      selectedElement.element.style[property as any] = value;
      selectedElement.data.styles[property] = value;
    }
  };

  return (
    <>
      {/* Button Text */}
      <div className="sparti-edit-section">
        <div className="sparti-edit-label">
          <Type size={16} />
          Button Text
        </div>
        <input
          type="text"
          className="sparti-edit-input"
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Button text..."
        />
      </div>

      {/* Button Type */}
      <div className="sparti-edit-section">
        <div className="sparti-edit-label">Button Type</div>
        <select
          className="sparti-edit-select"
          value={type}
          onChange={(e) => handleTypeChange(e.target.value)}
        >
          <option value="button">Button</option>
          <option value="submit">Submit</option>
          <option value="reset">Reset</option>
        </select>
      </div>

      {/* Button State */}
      <div className="sparti-edit-section">
        <label className="sparti-checkbox">
          <input
            type="checkbox"
            checked={disabled}
            onChange={(e) => handleDisabledChange(e.target.checked)}
          />
          Disabled
        </label>
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
              value={backgroundColor}
              onChange={(e) => handleStyleChange('backgroundColor', e.target.value, setBackgroundColor)}
            />
          </div>
          <div className="sparti-color-input">
            <label>Border</label>
            <input
              type="color"
              value={borderColor}
              onChange={(e) => handleStyleChange('borderColor', e.target.value, setBorderColor)}
            />
          </div>
        </div>
      </div>

      {/* Border Radius */}
      <div className="sparti-edit-section">
        <div className="sparti-edit-label">Border Radius</div>
        <input
          type="text"
          className="sparti-edit-input"
          value={borderRadius}
          onChange={(e) => handleStyleChange('borderRadius', e.target.value, setBorderRadius)}
          placeholder="0px, 4px, 50%..."
        />
      </div>
    </>
  );
};