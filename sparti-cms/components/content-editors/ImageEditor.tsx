import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Upload, X } from 'lucide-react';
import api from '../../utils/api';

interface ImageEditorProps {
  imageUrl?: string;
  imageTitle?: string;
  imageAlt?: string;
  onImageChange?: (imageUrl: string) => void;
  onTitleChange?: (title: string) => void;
  onAltChange?: (alt: string) => void;
  onSettingsChange?: (settings: {
    displaySize: string;
    alignment: string;
  }) => void;
  className?: string;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({
  imageUrl = '',
  imageTitle = '',
  imageAlt = '',
  onImageChange,
  onTitleChange,
  onAltChange,
  onSettingsChange,
  className = ''
}) => {
  const [displaySize, setDisplaySize] = useState<string>('full');
  const [alignment, setAlignment] = useState<string>('left');
  
  // Use local state for preview, but sync with props
  const [selectedImage, setSelectedImage] = useState<string>(imageUrl || '');
  const [title, setTitle] = useState<string>(imageTitle || '');
  const [alt, setAlt] = useState<string>(imageAlt || '');

  // Sync with props when they change, but don't override if we have a newer local value
  useEffect(() => {
    if (imageUrl && imageUrl !== selectedImage) {
      setSelectedImage(imageUrl);
    }
  }, [imageUrl]);

  useEffect(() => {
    if (imageTitle && imageTitle !== title) {
      setTitle(imageTitle);
    }
  }, [imageTitle]);

  useEffect(() => {
    if (imageAlt && imageAlt !== alt) {
      setAlt(imageAlt);
    }
  }, [imageAlt]);

  // Function to handle file selection
  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0]; // Take only the first file
    
    // Create FormData for upload
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      // For file uploads, we need to bypass the api utility and use fetch directly
      // because the api utility automatically sets Content-Type: application/json
      const token = localStorage.getItem('sparti-demo-session');
      const authToken = token ? JSON.parse(token).token : null;
      
      const response = await fetch(`${api.getBaseUrl()}/api/upload`, {
        method: 'POST',
        headers: {
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
          // Don't set Content-Type - let the browser set it with boundary for FormData
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const result = await response.json();
      let newImageUrl = result.url;
      
      // Ensure the URL is a full URL with domain
      if (newImageUrl && !newImageUrl.startsWith('http')) {
        // If it's a relative path, make it absolute with the current domain
        const baseUrl = window.location.origin;
        newImageUrl = `${baseUrl}${newImageUrl.startsWith('/') ? '' : '/'}${newImageUrl}`;
      }
      
      // Auto-fill the image title with the file name (without extension)
      const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
      
      // Update local state for immediate preview
      setSelectedImage(newImageUrl);
      setTitle(fileName);
      
      onImageChange?.(newImageUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage('');
    onImageChange?.('');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    onTitleChange?.(newTitle);
  };

  const handleAltChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAlt = e.target.value;
    setAlt(newAlt);
    onAltChange?.(newAlt);
  };

  const handleDisplaySizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = e.target.value;
    setDisplaySize(newSize);
    onSettingsChange?.({
      displaySize: newSize,
      alignment
    });
  };

  const handleAlignmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newAlignment = e.target.value;
    setAlignment(newAlignment);
    onSettingsChange?.({
      displaySize,
      alignment: newAlignment
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {!selectedImage ? (
        // No image selected - show upload area
        <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-md bg-gray-50">
          <div className="text-center">
            <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 mb-2">Drag and drop an image here, or click to select</p>
            <label className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors cursor-pointer inline-flex items-center">
              <Upload className="h-4 w-4 mr-1" />
              Upload Image
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
              />
            </label>
          </div>
        </div>
      ) : (
        // Image selected - show preview
        <div className="space-y-4">
          <div className="relative">
            <img 
              src={selectedImage} 
              alt={alt || title} 
              className="w-full h-auto max-h-64 object-contain rounded-md border border-gray-200"
            />
            <button
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex justify-end">
            <label className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors cursor-pointer inline-flex items-center text-sm">
              <Upload className="h-3 w-3 mr-1" />
              Change Image
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
              />
            </label>
          </div>
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Image Title
        </label>
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder="Enter image title (will be used as slug)"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Alt Text
        </label>
        <input
          type="text"
          value={alt}
          onChange={handleAltChange}
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder="Descriptive text for accessibility"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Image Settings
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Display Size</label>
            <select 
              value={displaySize}
              onChange={handleDisplaySizeChange}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="full">Full Width</option>
              <option value="medium">Medium</option>
              <option value="small">Small</option>
              <option value="thumbnail">Thumbnail</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Alignment</label>
            <select 
              value={alignment}
              onChange={handleAlignmentChange}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
