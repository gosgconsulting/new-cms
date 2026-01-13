import React, { useState, useEffect } from 'react';
import { Settings, Type, Palette } from 'lucide-react';
import { SpartiElement } from '../../types';

interface InputEditorProps {
  selectedElement: SpartiElement;
}

export const InputEditor: React.FC<InputEditorProps> = ({ selectedElement }) => {
  const [type, setType] = useState('text');
  const [value, setValue] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  const [required, setRequired] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [textColor, setTextColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [borderColor, setBorderColor] = useState('#cccccc');

  useEffect(() => {
    const { element, data } = selectedElement;
    const input = element as HTMLInputElement | HTMLTextAreaElement;
    
    setType(data.type || 'text');
    setValue(data.value || '');
    setPlaceholder(data.placeholder || '');
    setRequired(element.hasAttribute('required'));
    setDisabled(element.hasAttribute('disabled'));
    setTextColor(data.styles.color || '#000000');
    setBackgroundColor(data.styles.backgroundColor || '#ffffff');
    setBorderColor(data.styles.borderColor || '#cccccc');
  }, [selectedElement]);

  const handleTypeChange = (newType: string) => {
    setType(newType);
    if (selectedElement.element && selectedElement.data.tagName === 'input') {
      selectedElement.element.setAttribute('type', newType);
      selectedElement.data.type = newType;
    }
  };

  const handleValueChange = (newValue: string) => {
    setValue(newValue);
    if (selectedElement.element) {
      (selectedElement.element as HTMLInputElement).value = newValue;
      selectedElement.data.value = newValue;
    }
  };

  const handlePlaceholderChange = (newPlaceholder: string) => {
    setPlaceholder(newPlaceholder);
    if (selectedElement.element) {
      if (newPlaceholder) {
        selectedElement.element.setAttribute('placeholder', newPlaceholder);
      } else {
        selectedElement.element.removeAttribute('placeholder');
      }
      selectedElement.data.placeholder = newPlaceholder;
    }
  };

  const handleBooleanAttribute = (attr: string, value: boolean, setter: (v: boolean) => void) => {
    setter(value);
    if (selectedElement.element) {
      if (value) {
        selectedElement.element.setAttribute(attr, '');
      } else {
        selectedElement.element.removeAttribute(attr);
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

  const inputTypes = [
    'text', 'email', 'password', 'number', 'tel', 'url', 
    'date', 'datetime-local', 'time', 'color', 'file', 
    'checkbox', 'radio', 'hidden'
  ];

  return (
    <>
      {/* Input Type */}
      {selectedElement.data.tagName === 'input' && (
        <div className="sparti-edit-section">
          <div className="sparti-edit-label">
            <Settings size={16} />
            Input Type
          </div>
          <select
            className="sparti-edit-select"
            value={type}
            onChange={(e) => handleTypeChange(e.target.value)}
          >
            {inputTypes.map(inputType => (
              <option key={inputType} value={inputType}>
                {inputType.charAt(0).toUpperCase() + inputType.slice(1)}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Value */}
      <div className="sparti-edit-section">
        <div className="sparti-edit-label">Value</div>
        <input
          type="text"
          className="sparti-edit-input"
          value={value}
          onChange={(e) => handleValueChange(e.target.value)}
          placeholder="Input value..."
        />
      </div>

      {/* Placeholder */}
      <div className="sparti-edit-section">
        <div className="sparti-edit-label">
          <Type size={16} />
          Placeholder
        </div>
        <input
          type="text"
          className="sparti-edit-input"
          value={placeholder}
          onChange={(e) => handlePlaceholderChange(e.target.value)}
          placeholder="Placeholder text..."
        />
      </div>

      {/* Attributes */}
      <div className="sparti-edit-section">
        <div className="sparti-edit-label">Attributes</div>
        <div className="sparti-checkbox-group">
          <label className="sparti-checkbox">
            <input
              type="checkbox"
              checked={required}
              onChange={(e) => handleBooleanAttribute('required', e.target.checked, setRequired)}
            />
            Required
          </label>
          
          <label className="sparti-checkbox">
            <input
              type="checkbox"
              checked={disabled}
              onChange={(e) => handleBooleanAttribute('disabled', e.target.checked, setDisabled)}
            />
            Disabled
          </label>
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
    </>
  );
};