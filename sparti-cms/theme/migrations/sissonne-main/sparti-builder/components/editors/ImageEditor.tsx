import React, { useState, useEffect } from 'react';
import { Image, Upload, Maximize, Minimize } from 'lucide-react';
import { SpartiElement } from '../../types';

interface ImageEditorProps {
  selectedElement: SpartiElement;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({ selectedElement }) => {
  const [src, setSrc] = useState('');
  const [alt, setAlt] = useState('');
  const [title, setTitle] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');

  useEffect(() => {
    const { data } = selectedElement;
    setSrc(data.src || '');
    setAlt(data.alt || '');
    setTitle(data.title || '');
    setWidth(data.styles.width || '');
    setHeight(data.styles.height || '');
  }, [selectedElement]);

  const handleSrcChange = (newSrc: string) => {
    setSrc(newSrc);
    if (selectedElement.element) {
      selectedElement.element.setAttribute('src', newSrc);
      selectedElement.data.src = newSrc;
    }
  };

  const handleAltChange = (newAlt: string) => {
    setAlt(newAlt);
    if (selectedElement.element) {
      selectedElement.element.setAttribute('alt', newAlt);
      selectedElement.data.alt = newAlt;
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

  const handleDimensionChange = (dimension: 'width' | 'height', value: string) => {
    if (selectedElement.element) {
      selectedElement.element.style[dimension] = value;
      selectedElement.data.styles[dimension] = value;
      
      if (dimension === 'width') {
        setWidth(value);
      } else {
        setHeight(value);
      }
    }
  };

  const resetDimensions = () => {
    if (selectedElement.element) {
      selectedElement.element.style.width = '';
      selectedElement.element.style.height = '';
      selectedElement.data.styles.width = '';
      selectedElement.data.styles.height = '';
      setWidth('');
      setHeight('');
    }
  };

  return (
    <>
      {/* Image Source */}
      <div className="sparti-edit-section">
        <div className="sparti-edit-label">
          <Image size={16} />
          Image Source
        </div>
        <div className="sparti-url-input">
          <input
            type="url"
            className="sparti-edit-input"
            value={src}
            onChange={(e) => handleSrcChange(e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
          <button className="sparti-btn sparti-btn-ghost sparti-btn-sm">
            <Upload size={14} />
          </button>
        </div>
      </div>

      {/* Alt Text */}
      <div className="sparti-edit-section">
        <div className="sparti-edit-label">Alt Text</div>
        <input
          type="text"
          className="sparti-edit-input"
          value={alt}
          onChange={(e) => handleAltChange(e.target.value)}
          placeholder="Describe the image..."
        />
      </div>

      {/* Title */}
      <div className="sparti-edit-section">
        <div className="sparti-edit-label">Title (Tooltip)</div>
        <input
          type="text"
          className="sparti-edit-input"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Image tooltip..."
        />
      </div>

      {/* Dimensions */}
      <div className="sparti-edit-section">
        <div className="sparti-edit-label">
          <Maximize size={16} />
          Dimensions
        </div>
        <div className="sparti-dimension-controls">
          <div className="sparti-dimension-input">
            <label>Width</label>
            <input
              type="text"
              className="sparti-edit-input"
              value={width}
              onChange={(e) => handleDimensionChange('width', e.target.value)}
              placeholder="auto"
            />
          </div>
          <div className="sparti-dimension-input">
            <label>Height</label>
            <input
              type="text"
              className="sparti-edit-input"
              value={height}
              onChange={(e) => handleDimensionChange('height', e.target.value)}
              placeholder="auto"
            />
          </div>
        </div>
        <button 
          className="sparti-btn sparti-btn-ghost sparti-btn-sm w-full"
          onClick={resetDimensions}
        >
          <Minimize size={14} />
          Reset Dimensions
        </button>
      </div>

      {/* Preview */}
      {src && (
        <div className="sparti-edit-section">
          <div className="sparti-edit-label">Preview</div>
          <div className="sparti-image-preview">
            <img 
              src={src} 
              alt={alt}
              style={{ maxWidth: '100%', maxHeight: '120px', objectFit: 'contain' }}
            />
          </div>
        </div>
      )}
    </>
  );
};