import React, { useState, useEffect } from 'react';
import { Palette, Image, Video, Upload } from 'lucide-react';
import { SpartiElement } from '../../types';

interface ContainerEditorProps {
  selectedElement: SpartiElement;
}

export const ContainerEditor: React.FC<ContainerEditorProps> = ({ selectedElement }) => {
  const [backgroundType, setBackgroundType] = useState<'color' | 'image' | 'video'>('color');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [backgroundImage, setBackgroundImage] = useState('');
  const [backgroundVideo, setBackgroundVideo] = useState('');

  useEffect(() => {
    const { data } = selectedElement;
    
    // Extract current values from data with type casting
    setBackgroundType((data as any).backgroundType || 'color');
    setBackgroundColor((data as any).backgroundColor || '#ffffff');
    setBackgroundImage((data as any).backgroundImage || '');
    setBackgroundVideo((data as any).backgroundVideo || '');
  }, [selectedElement]);

  const applyBackground = () => {
    if (!selectedElement.element) return;

    const element = selectedElement.element as HTMLElement;
    
    // Clear existing background styles
    element.style.backgroundColor = '';
    element.style.backgroundImage = '';
    // Remove any existing background video
    const existingVideo = element.querySelector('.sparti-bg-video');
    if (existingVideo) {
      existingVideo.remove();
    }
    
    // Apply new background based on type
    switch (backgroundType) {
      case 'color':
        element.style.backgroundColor = backgroundColor;
        break;
      case 'image':
        if (backgroundImage) {
          element.style.backgroundImage = `url(${backgroundImage})`;
          element.style.backgroundSize = 'cover';
          element.style.backgroundPosition = 'center';
          element.style.backgroundRepeat = 'no-repeat';
        }
        break;
      case 'video':
        if (backgroundVideo) {
          // For video backgrounds, we need to create a video element
          const existingVideo = element.querySelector('.sparti-bg-video');
          if (existingVideo) {
            existingVideo.remove();
          }
          
          const video = document.createElement('video');
          video.className = 'sparti-bg-video';
          video.src = backgroundVideo;
          video.autoplay = true;
          video.muted = true;
          video.loop = true;
          video.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            z-index: -1;
          `;
          
          element.style.position = 'relative';
          element.insertBefore(video, element.firstChild);
        }
        break;
    }
    
    // Update data with type casting
    (selectedElement.data as any).backgroundType = backgroundType;
    (selectedElement.data as any).backgroundColor = backgroundColor;
    (selectedElement.data as any).backgroundImage = backgroundImage;
    (selectedElement.data as any).backgroundVideo = backgroundVideo;
  };

  const handleBackgroundTypeChange = (type: 'color' | 'image' | 'video') => {
    setBackgroundType(type);
    // Apply immediately when type changes
    setTimeout(applyBackground, 0);
  };

  const handleColorChange = (color: string) => {
    setBackgroundColor(color);
    applyBackground();
  };

  const handleImageUrlChange = (url: string) => {
    setBackgroundImage(url);
    applyBackground();
  };

  const handleVideoUrlChange = (url: string) => {
    setBackgroundVideo(url);
    applyBackground();
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // For now, create a local URL - in production you'd upload to Supabase Storage
    const imageUrl = URL.createObjectURL(file);
    setBackgroundImage(imageUrl);
    applyBackground();
  };

  useEffect(() => {
    applyBackground();
  }, [backgroundType, backgroundColor, backgroundImage, backgroundVideo]);

  return (
    <>
      {/* Background Type Tabs */}
      <div className="sparti-edit-section">
        <div className="sparti-edit-label">Background</div>
        <div className="sparti-tabs">
          <button
            className={`sparti-tab ${backgroundType === 'color' ? 'sparti-tab-active' : ''}`}
            onClick={() => handleBackgroundTypeChange('color')}
          >
            <Palette size={16} />
            Color
          </button>
          <button
            className={`sparti-tab ${backgroundType === 'image' ? 'sparti-tab-active' : ''}`}
            onClick={() => handleBackgroundTypeChange('image')}
          >
            <Image size={16} />
            Image
          </button>
          <button
            className={`sparti-tab ${backgroundType === 'video' ? 'sparti-tab-active' : ''}`}
            onClick={() => handleBackgroundTypeChange('video')}
          >
            <Video size={16} />
            Video
          </button>
        </div>
      </div>

      {/* Background Options based on selected tab */}
      {backgroundType === 'color' && (
        <div className="sparti-edit-section">
          <div className="sparti-edit-label">Background Color</div>
          <input
            type="color"
            className="sparti-color-input-large"
            value={backgroundColor}
            onChange={(e) => handleColorChange(e.target.value)}
          />
        </div>
      )}

      {backgroundType === 'image' && (
        <div className="sparti-edit-section">
          <div className="sparti-edit-label">Background Image</div>
          
          {/* URL Input */}
          <div className="sparti-url-input">
            <input
              type="url"
              className="sparti-edit-input"
              value={backgroundImage}
              onChange={(e) => handleImageUrlChange(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>
          
          {/* Upload Option */}
          <div className="sparti-upload-section">
            <label className="sparti-upload-button">
              <Upload size={16} />
              Upload Image
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="sparti-upload-input"
              />
            </label>
          </div>
        </div>
      )}

      {backgroundType === 'video' && (
        <div className="sparti-edit-section">
          <div className="sparti-edit-label">Background Video URL</div>
          <input
            type="url"
            className="sparti-edit-input"
            value={backgroundVideo}
            onChange={(e) => handleVideoUrlChange(e.target.value)}
            placeholder="https://example.com/video.mp4"
          />
        </div>
      )}
    </>
  );
};