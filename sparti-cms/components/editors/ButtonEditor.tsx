import React, { useState, useEffect } from 'react';
import { Type, Link } from 'lucide-react';
import { SpartiElement } from '../../types';

interface ButtonEditorProps {
  selectedElement: SpartiElement;
}

export const ButtonEditor: React.FC<ButtonEditorProps> = ({ selectedElement }) => {
  const [text, setText] = useState('');
  const [href, setHref] = useState('');

  useEffect(() => {
    const { element, data } = selectedElement;
    
    // Extract current values
    setText(element.textContent || data.content || 'Click me');
    setHref(element.getAttribute('data-href') || data.href || '');
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
      selectedElement.element.setAttribute('data-href', newHref);
      selectedElement.data.href = newHref;
      
      // Add click handler for navigation
      selectedElement.element.onclick = (e) => {
        e.preventDefault();
        if (newHref) {
          window.location.href = newHref;
        }
      };
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
          placeholder="Enter button text"
        />
      </div>

      {/* Link URL */}
      <div className="sparti-edit-section">
        <div className="sparti-edit-label">
          <Link size={16} />
          Link URL (Optional)
        </div>
        <input
          type="url"
          className="sparti-edit-input"
          value={href}
          onChange={(e) => handleHrefChange(e.target.value)}
          placeholder="https://example.com"
        />
      </div>
    </>
  );
};