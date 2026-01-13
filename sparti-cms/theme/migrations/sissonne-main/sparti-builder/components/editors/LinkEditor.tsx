import React, { useState, useEffect } from 'react';
import { Link, ExternalLink, Palette } from 'lucide-react';
import { SpartiElement } from '../../types';

interface LinkEditorProps {
  selectedElement: SpartiElement;
}

export const LinkEditor: React.FC<LinkEditorProps> = ({ selectedElement }) => {
  const [text, setText] = useState('');
  const [href, setHref] = useState('');
  const [target, setTarget] = useState('');
  const [title, setTitle] = useState('');
  const [textColor, setTextColor] = useState('#0066cc');
  const [textDecoration, setTextDecoration] = useState('underline');

  useEffect(() => {
    const { element, data } = selectedElement;
    setText(data.content || '');
    setHref(data.href || '');
    setTarget(element.getAttribute('target') || '');
    setTitle(data.title || '');
    setTextColor(data.styles.color || '#0066cc');
    setTextDecoration(data.styles.textDecoration || 'underline');
  }, [selectedElement]);

  const handleTextChange = (newText: string) => {
    setText(newText);
    if (selectedElement.element) {
      selectedElement.element.textContent = newText;
      selectedElement.data.content = newText;
    }
  };

  const handleHrefChange = (newHref: string) => {
    setHref(newHref);
    if (selectedElement.element) {
      selectedElement.element.setAttribute('href', newHref);
      selectedElement.data.href = newHref;
    }
  };

  const handleTargetChange = (newTarget: string) => {
    setTarget(newTarget);
    if (selectedElement.element) {
      if (newTarget) {
        selectedElement.element.setAttribute('target', newTarget);
      } else {
        selectedElement.element.removeAttribute('target');
      }
    }
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (selectedElement.element) {
      if (newTitle) {
        selectedElement.element.setAttribute('title', newTitle);
      } else {
        selectedElement.element.removeAttribute('title');
      }
      selectedElement.data.title = newTitle;
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
      {/* Link Text */}
      <div className="sparti-edit-section">
        <div className="sparti-edit-label">
          <Link size={16} />
          Link Text
        </div>
        <input
          type="text"
          className="sparti-edit-input"
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Link text..."
        />
      </div>

      {/* URL */}
      <div className="sparti-edit-section">
        <div className="sparti-edit-label">URL</div>
        <input
          type="url"
          className="sparti-edit-input"
          value={href}
          onChange={(e) => handleHrefChange(e.target.value)}
          placeholder="https://example.com"
        />
      </div>

      {/* Target */}
      <div className="sparti-edit-section">
        <div className="sparti-edit-label">
          <ExternalLink size={16} />
          Target
        </div>
        <select
          className="sparti-edit-select"
          value={target}
          onChange={(e) => handleTargetChange(e.target.value)}
        >
          <option value="">Same Window</option>
          <option value="_blank">New Window</option>
          <option value="_parent">Parent Frame</option>
          <option value="_top">Top Frame</option>
        </select>
      </div>

      {/* Title */}
      <div className="sparti-edit-section">
        <div className="sparti-edit-label">Title (Tooltip)</div>
        <input
          type="text"
          className="sparti-edit-input"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Link description..."
        />
      </div>

      {/* Styling */}
      <div className="sparti-edit-section">
        <div className="sparti-edit-label">
          <Palette size={16} />
          Link Styling
        </div>
        <div className="sparti-link-styling">
          <div className="sparti-color-input">
            <label>Text Color</label>
            <input
              type="color"
              value={textColor}
              onChange={(e) => handleStyleChange('color', e.target.value, setTextColor)}
            />
          </div>
          <div className="sparti-select-input">
            <label>Text Decoration</label>
            <select
              className="sparti-edit-select"
              value={textDecoration}
              onChange={(e) => handleStyleChange('textDecoration', e.target.value, setTextDecoration)}
            >
              <option value="none">None</option>
              <option value="underline">Underline</option>
              <option value="overline">Overline</option>
              <option value="line-through">Strike Through</option>
            </select>
          </div>
        </div>
      </div>

      {/* Link Preview */}
      {href && (
        <div className="sparti-edit-section">
          <div className="sparti-edit-label">Preview</div>
          <div className="sparti-link-preview">
            <a 
              href={href} 
              target={target}
              title={title}
              style={{ 
                color: textColor, 
                textDecoration: textDecoration,
                pointerEvents: 'none'
              }}
            >
              {text || 'Link Preview'}
            </a>
          </div>
        </div>
      )}
    </>
  );
};