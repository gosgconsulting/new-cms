import React, { useState } from 'react';
import { Grid, Upload, X, Plus } from 'lucide-react';
import api from '../../utils/api';

interface GalleryImage {
  id: string;
  url: string;
  alt: string;
}

interface GalleryEditorProps {
  images?: GalleryImage[];
  galleryTitle?: string;
  layoutStyle?: string;
  onImagesChange?: (images: GalleryImage[]) => void;
  onTitleChange?: (title: string) => void;
  onLayoutChange?: (layout: string) => void;
  className?: string;
}

export const GalleryEditor: React.FC<GalleryEditorProps> = ({
  images = [],
  galleryTitle = '',
  layoutStyle = 'grid',
  onImagesChange,
  onTitleChange,
  onLayoutChange,
  className = ''
}) => {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>(images);
  const [title, setTitle] = useState<string>(galleryTitle);
  const [layout, setLayout] = useState<string>(layoutStyle);

  // Function to handle gallery file selection
  const handleGallerySelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    // Create FormData for upload
    const formData = new FormData();
    
    // Upload files one by one
    const uploadPromises = Array.from(files).map(async (file, index) => {
      const fileFormData = new FormData();
      fileFormData.append('file', file);
      
      try {
        const response = await api.post('/api/upload', fileFormData, {
          headers: {} // Let the browser set Content-Type for FormData
        });
        
        if (!response.ok) {
          throw new Error('Upload failed');
        }
        
        const result = await response.json();
        return {
          id: `new-img-${Date.now()}-${index}`,
          url: result.url,
          alt: file.name
        };
      } catch (error) {
        console.error('Error uploading file:', error);
        return null;
      }
    });
    
    try {
      const uploadedImages = await Promise.all(uploadPromises);
      const validImages = uploadedImages.filter(img => img !== null) as GalleryImage[];
      
      const newImages = [...galleryImages, ...validImages];
      setGalleryImages(newImages);
      onImagesChange?.(newImages);
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload some images. Please try again.');
    }
  };

  // Function to remove an image from the gallery
  const removeGalleryImage = (imageId: string) => {
    const updatedImages = galleryImages.filter(img => img.id !== imageId);
    setGalleryImages(updatedImages);
    onImagesChange?.(updatedImages);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    onTitleChange?.(newTitle);
  };

  const handleLayoutChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLayout = e.target.value;
    setLayout(newLayout);
    onLayoutChange?.(newLayout);
  };

  const clearAllImages = () => {
    setGalleryImages([]);
    onImagesChange?.([]);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {galleryImages.length === 0 ? (
        // Empty state - show upload area
        <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-md bg-gray-50">
          <div className="text-center">
            <Grid className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 mb-2">Upload multiple images for gallery</p>
            <label className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors cursor-pointer inline-flex items-center">
              <Upload className="h-4 w-4 mr-1" />
              Select Images
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleGallerySelect}
              />
            </label>
          </div>
        </div>
      ) : (
        // Images selected - show grid of images with upload button
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {galleryImages.map(image => (
              <div key={image.id} className="relative group">
                <img 
                  src={image.url} 
                  alt={image.alt} 
                  className="w-full h-32 object-cover rounded-md border border-gray-200"
                />
                <button
                  onClick={() => removeGalleryImage(image.id)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            
            {/* Add more images button */}
            <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-md bg-gray-50">
              <label className="cursor-pointer text-center p-2">
                <Plus className="h-8 w-8 text-gray-400 mx-auto mb-1" />
                <span className="text-sm text-gray-500">Add More</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleGallerySelect}
                />
              </label>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={clearAllImages}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Clear All
            </button>
          </div>
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Gallery Title
        </label>
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder="Enter gallery title"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Layout Style
        </label>
        <select 
          value={layout}
          onChange={handleLayoutChange}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="grid">Grid</option>
          <option value="masonry">Masonry</option>
          <option value="slider">Slider</option>
        </select>
      </div>
    </div>
  );
};

export default GalleryEditor;
