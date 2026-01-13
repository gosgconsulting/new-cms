import React, { useState, useEffect } from 'react';
import { Video, Upload, Play, Pause, Volume2 } from 'lucide-react';
import { SpartiElement } from '../../types';

interface VideoEditorProps {
  selectedElement: SpartiElement;
}

export const VideoEditor: React.FC<VideoEditorProps> = ({ selectedElement }) => {
  const [src, setSrc] = useState('');
  const [poster, setPoster] = useState('');
  const [controls, setControls] = useState(true);
  const [autoplay, setAutoplay] = useState(false);
  const [muted, setMuted] = useState(false);
  const [loop, setLoop] = useState(false);

  useEffect(() => {
    const { element, data } = selectedElement;
    setSrc(data.src || '');
    setPoster(element.getAttribute('poster') || '');
    setControls(element.hasAttribute('controls'));
    setAutoplay(element.hasAttribute('autoplay'));
    setMuted(element.hasAttribute('muted'));
    setLoop(element.hasAttribute('loop'));
  }, [selectedElement]);

  const handleSrcChange = (newSrc: string) => {
    setSrc(newSrc);
    if (selectedElement.element) {
      selectedElement.element.setAttribute('src', newSrc);
      selectedElement.data.src = newSrc;
    }
  };

  const handlePosterChange = (newPoster: string) => {
    setPoster(newPoster);
    if (selectedElement.element) {
      if (newPoster) {
        selectedElement.element.setAttribute('poster', newPoster);
      } else {
        selectedElement.element.removeAttribute('poster');
      }
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

  return (
    <>
      {/* Video Source */}
      <div className="sparti-edit-section">
        <div className="sparti-edit-label">
          <Video size={16} />
          Video Source
        </div>
        <div className="sparti-url-input">
          <input
            type="url"
            className="sparti-edit-input"
            value={src}
            onChange={(e) => handleSrcChange(e.target.value)}
            placeholder="https://example.com/video.mp4"
          />
          <button className="sparti-btn sparti-btn-ghost sparti-btn-sm">
            <Upload size={14} />
          </button>
        </div>
      </div>

      {/* Poster Image */}
      <div className="sparti-edit-section">
        <div className="sparti-edit-label">Poster Image</div>
        <div className="sparti-url-input">
          <input
            type="url"
            className="sparti-edit-input"
            value={poster}
            onChange={(e) => handlePosterChange(e.target.value)}
            placeholder="https://example.com/poster.jpg"
          />
          <button className="sparti-btn sparti-btn-ghost sparti-btn-sm">
            <Upload size={14} />
          </button>
        </div>
      </div>

      {/* Video Controls */}
      <div className="sparti-edit-section">
        <div className="sparti-edit-label">Video Controls</div>
        <div className="sparti-checkbox-group">
          <label className="sparti-checkbox">
            <input
              type="checkbox"
              checked={controls}
              onChange={(e) => handleBooleanAttribute('controls', e.target.checked, setControls)}
            />
            <Play size={14} />
            Show Controls
          </label>
          
          <label className="sparti-checkbox">
            <input
              type="checkbox"
              checked={autoplay}
              onChange={(e) => handleBooleanAttribute('autoplay', e.target.checked, setAutoplay)}
            />
            <Play size={14} />
            Autoplay
          </label>
          
          <label className="sparti-checkbox">
            <input
              type="checkbox"
              checked={muted}
              onChange={(e) => handleBooleanAttribute('muted', e.target.checked, setMuted)}
            />
            <Volume2 size={14} />
            Muted
          </label>
          
          <label className="sparti-checkbox">
            <input
              type="checkbox"
              checked={loop}
              onChange={(e) => handleBooleanAttribute('loop', e.target.checked, setLoop)}
            />
            Loop
          </label>
        </div>
      </div>

      {/* Preview */}
      {src && (
        <div className="sparti-edit-section">
          <div className="sparti-edit-label">Preview</div>
          <div className="sparti-video-preview">
            <video 
              src={src}
              poster={poster}
              controls={controls}
              muted={muted}
              style={{ width: '100%', maxHeight: '120px' }}
            />
          </div>
        </div>
      )}
    </>
  );
};