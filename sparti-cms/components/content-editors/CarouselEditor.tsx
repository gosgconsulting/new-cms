import React, { useState } from 'react';
import { Layers, Upload, X, Plus, ChevronDown } from 'lucide-react';
import { uploadFile } from '../../utils/uploadToBlob';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselPrevious, 
  CarouselNext, 
  CarouselIndicators 
} from '../../../src/components/ui/carousel';

interface CarouselImage {
  id: string;
  url: string;
  alt: string;
}

interface CarouselEditorProps {
  images?: CarouselImage[];
  carouselTitle?: string;
  autoplay?: boolean;
  navigation?: string;
  onImagesChange?: (images: CarouselImage[]) => void;
  onTitleChange?: (title: string) => void;
  onSettingsChange?: (settings: {
    autoplay: boolean;
    navigation: string;
  }) => void;
  className?: string;
}

export const CarouselEditor: React.FC<CarouselEditorProps> = ({
  images = [],
  carouselTitle = '',
  autoplay = false,
  navigation = 'arrows',
  onImagesChange,
  onTitleChange,
  onSettingsChange,
  className = ''
}) => {
  const [carouselImages, setCarouselImages] = useState<CarouselImage[]>(images);
  const [title, setTitle] = useState<string>(carouselTitle);
  const [isAutoplay, setIsAutoplay] = useState<boolean>(autoplay);
  const [navType, setNavType] = useState<string>(navigation);

  // Function to handle file selection
  const handleCarouselSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const uploadPromises = Array.from(files).map(async (file, index) => {
      try {
        const result = await uploadFile(file);
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
      const validImages = uploadedImages.filter(img => img !== null) as CarouselImage[];
      
      const newImages = [...carouselImages, ...validImages];
      setCarouselImages(newImages);
      onImagesChange?.(newImages);
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload some images. Please try again.');
    }
  };

  // Function to remove an image from the carousel
  const removeCarouselImage = (imageId: string) => {
    const updatedImages = carouselImages.filter(img => img.id !== imageId);
    setCarouselImages(updatedImages);
    onImagesChange?.(updatedImages);
  };

  // Function to reorder images
  const moveCarouselImage = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === carouselImages.length - 1)
    ) {
      return; // Can't move further
    }
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updatedImages = [...carouselImages];
    const temp = updatedImages[index];
    updatedImages[index] = updatedImages[newIndex];
    updatedImages[newIndex] = temp;
    
    setCarouselImages(updatedImages);
    onImagesChange?.(updatedImages);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    onTitleChange?.(newTitle);
  };

  const handleAutoplayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newAutoplay = e.target.value === 'true';
    setIsAutoplay(newAutoplay);
    onSettingsChange?.({
      autoplay: newAutoplay,
      navigation: navType
    });
  };

  const handleNavigationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newNav = e.target.value;
    setNavType(newNav);
    onSettingsChange?.({
      autoplay: isAutoplay,
      navigation: newNav
    });
  };

  const clearAllImages = () => {
    setCarouselImages([]);
    onImagesChange?.([]);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {carouselImages.length === 0 ? (
        // Empty state - show upload area
        <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-md bg-gray-50">
          <div className="text-center">
            <Layers className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 mb-2">Upload images for carousel</p>
            <label className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors cursor-pointer inline-flex items-center">
              <Upload className="h-4 w-4 mr-1" />
              Select Images
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleCarouselSelect}
              />
            </label>
          </div>
        </div>
      ) : (
        // Images selected - show carousel preview
        <div className="space-y-4">
          {/* Carousel preview with navigation */}
          <div className="relative bg-gray-100 rounded-lg p-4 border border-gray-200">
            <Carousel className="w-full max-w-lg mx-auto">
              <CarouselContent>
                {carouselImages.map((image, index) => (
                  <CarouselItem key={image.id}>
                    <div className="relative">
                      <img 
                        src={image.url} 
                        alt={image.alt} 
                        className="w-full h-64 object-cover rounded-md border border-gray-200"
                      />
                      <div className="absolute top-2 right-2 flex space-x-1">
                        <button
                          onClick={() => removeCarouselImage(image.id)}
                          className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="absolute bottom-2 right-2 flex space-x-1">
                        <button
                          onClick={() => moveCarouselImage(index, 'up')}
                          disabled={index === 0}
                          className={`bg-gray-800 text-white rounded-full p-1 hover:bg-gray-700 transition-colors ${index === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <ChevronDown className="h-3 w-3 transform rotate-180" />
                        </button>
                        <button
                          onClick={() => moveCarouselImage(index, 'down')}
                          disabled={index === carouselImages.length - 1}
                          className={`bg-gray-800 text-white rounded-full p-1 hover:bg-gray-700 transition-colors ${index === carouselImages.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <ChevronDown className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {carouselImages.length > 1 && (
                <>
                  <CarouselPrevious />
                  <CarouselNext />
                  <CarouselIndicators />
                </>
              )}
            </Carousel>
            
            {/* Add more images button below carousel */}
            <div className="flex justify-center mt-4">
              <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
                <Plus className="h-4 w-4" />
                Add More Images
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleCarouselSelect}
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
          Carousel Title
        </label>
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder="Enter carousel title"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Carousel Settings
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Autoplay</label>
            <select 
              value={isAutoplay.toString()}
              onChange={handleAutoplayChange}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Navigation</label>
            <select 
              value={navType}
              onChange={handleNavigationChange}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="arrows">Arrows</option>
              <option value="dots">Dots</option>
              <option value="both">Both</option>
              <option value="none">None</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarouselEditor;
