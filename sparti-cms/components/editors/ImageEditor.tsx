import React, { useState, useEffect, useRef } from 'react';
import { SpartiElement } from '../../types';
// Demo image editor without external storage
import { 
  Image as ImageIcon, 
  Upload, 
  Link as LinkIcon, 
  ChevronLeft, 
  ChevronRight, 
  X,
  Check,
  ExternalLink,
  Grid
} from 'lucide-react';

interface ImageEditorProps {
  selectedElement: SpartiElement;
}

interface ImageData {
  src: string;
  alt?: string;
  title?: string;
}


export const ImageEditor: React.FC<ImageEditorProps> = ({ selectedElement }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageUrl, setImageUrl] = useState('');
  const [altText, setAltText] = useState('');
  const [isUrlMode, setIsUrlMode] = useState(false);
  const [isMediaLibrary, setIsMediaLibrary] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Detect if this is a single image or multi-image element
  const [images, setImages] = useState<ImageData[]>([]);
  const [isMultiImage, setIsMultiImage] = useState(false);

  useEffect(() => {
    if (selectedElement?.element) {
      analyzeImageElement();
    }
  }, [selectedElement]);

  const analyzeImageElement = () => {
    const element = selectedElement.element;
    
    // Check if it's a single image
    if (element.tagName === 'IMG') {
      const imgData: ImageData = {
        src: element.getAttribute('src') || '',
        alt: element.getAttribute('alt') || '',
        title: element.getAttribute('title') || ''
      };
      setImages([imgData]);
      setIsMultiImage(false);
      setImageUrl(imgData.src);
      setAltText(imgData.alt || '');
    } else {
      // Check for multiple images within the element
      const imgElements = element.querySelectorAll('img');
      if (imgElements.length > 1) {
        const imgArray: ImageData[] = Array.from(imgElements).map(img => ({
          src: img.getAttribute('src') || '',
          alt: img.getAttribute('alt') || '',
          title: img.getAttribute('title') || ''
        }));
        setImages(imgArray);
        setIsMultiImage(true);
        setCurrentImageIndex(0);
        if (imgArray.length > 0) {
          setImageUrl(imgArray[0].src);
          setAltText(imgArray[0].alt || '');
        }
      } else if (imgElements.length === 1) {
        // Single image within a container
        const img = imgElements[0];
        const imgData: ImageData = {
          src: img.getAttribute('src') || '',
          alt: img.getAttribute('alt') || '',
          title: img.getAttribute('title') || ''
        };
        setImages([imgData]);
        setIsMultiImage(false);
        setImageUrl(imgData.src);
        setAltText(imgData.alt || '');
      }
    }
  };

  const handleImageChange = (newSrc: string, newAlt?: string) => {
    const element = selectedElement.element;
    
    if (isMultiImage) {
      // Update specific image in multi-image scenario
      const imgElements = element.querySelectorAll('img');
      if (imgElements[currentImageIndex]) {
        imgElements[currentImageIndex].setAttribute('src', newSrc);
        if (newAlt !== undefined) {
          imgElements[currentImageIndex].setAttribute('alt', newAlt);
        }
      }
      
      // Update state
      const newImages = [...images];
      newImages[currentImageIndex] = { ...newImages[currentImageIndex], src: newSrc, alt: newAlt };
      setImages(newImages);
    } else {
      // Update single image
      if (element.tagName === 'IMG') {
        element.setAttribute('src', newSrc);
        if (newAlt !== undefined) {
          element.setAttribute('alt', newAlt);
        }
      } else {
        const img = element.querySelector('img');
        if (img) {
          img.setAttribute('src', newSrc);
          if (newAlt !== undefined) {
            img.setAttribute('alt', newAlt);
          }
        }
      }
      
      // Update state
      setImages([{ src: newSrc, alt: newAlt }]);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Basic file validation
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('File size must be less than 10MB');
      return;
    }

    setIsLoading(true);
    
    try {
      // Demo file upload simulation
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setImageUrl(imageUrl);
        handleImageChange(imageUrl, altText);
        
        // Store in localStorage for demo persistence
        const demoImages = JSON.parse(localStorage.getItem('sparti-demo-images') || '[]');
        demoImages.push({ url: imageUrl, name: file.name, alt: altText });
        localStorage.setItem('sparti-demo-images', JSON.stringify(demoImages));
      };
      reader.readAsDataURL(file);
      
      // Refresh media library
      await loadMediaLibrary();
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (imageUrl.trim()) {
      handleImageChange(imageUrl.trim(), altText);
      setIsUrlMode(false);
    }
  };

  // Demo media library functionality 
  const loadMediaLibrary = async () => {
    // Load demo images from localStorage
    const demoImages = JSON.parse(localStorage.getItem('sparti-demo-images') || '[]');
    console.log('Demo media library:', demoImages);
  };

  // Load media library on component mount
  useEffect(() => {
    loadMediaLibrary();
  }, []);


  const navigateImage = (direction: 'prev' | 'next') => {
    if (!isMultiImage) return;
    
    let newIndex = currentImageIndex;
    if (direction === 'prev') {
      newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : images.length - 1;
    } else {
      newIndex = currentImageIndex < images.length - 1 ? currentImageIndex + 1 : 0;
    }
    
    setCurrentImageIndex(newIndex);
    setImageUrl(images[newIndex].src);
    setAltText(images[newIndex].alt || '');
  };

  const currentImage = images[currentImageIndex];

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[300px] max-w-[400px]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <ImageIcon className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">Image Editor</h3>
          <p className="text-sm text-gray-500">
            {isMultiImage ? `Gallery (${images.length} images)` : 'Single Image'}
          </p>
        </div>
      </div>

      {/* Multi-image navigation */}
      {isMultiImage && images.length > 1 && (
        <div className="flex items-center justify-between mb-4 p-2 bg-gray-50 rounded-lg">
          <button
            onClick={() => navigateImage('prev')}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white transition-colors"
            disabled={isLoading}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="text-sm font-medium text-gray-700">
            {currentImageIndex + 1} / {images.length}
          </span>
          
          <button
            onClick={() => navigateImage('next')}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white transition-colors"
            disabled={isLoading}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Current image preview */}
      {currentImage && (
        <div className="mb-4">
          <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
            {currentImage.src ? (
              <img
                src={currentImage.src}
                alt={currentImage.alt}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="text-gray-400 text-center">
                <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">No image</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Image URL input mode */}
      {isUrlMode ? (
        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image URL
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alt Text
            </label>
            <input
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Descriptive text for accessibility"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleUrlSubmit}
              disabled={!imageUrl.trim() || isLoading}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <Check className="w-4 h-4" />
              Apply
            </button>
            <button
              onClick={() => setIsUrlMode(false)}
              className="px-3 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md text-sm"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : isMediaLibrary ? (
        /* Media Library Mode */
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">Media Library</h4>
            <button
              onClick={() => setIsMediaLibrary(false)}
              className="p-1 text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
            {/* Media items will be displayed here when implemented */}
          </div>
          
          <div className="text-center py-8 text-gray-500">
            <ImageIcon className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">Media library coming soon</p>
          </div>
        </div>
      ) : (
        /* Action buttons */
        <div className="space-y-2">
          <button
            onClick={() => setIsMediaLibrary(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
          >
            <Grid className="w-4 h-4" />
            Media Library
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <Upload className="w-4 h-4" />
            {isLoading ? 'Uploading...' : 'Upload Image'}
          </button>

          <button
            onClick={() => setIsUrlMode(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
          >
            <LinkIcon className="w-4 h-4" />
            Image URL
          </button>

          {/* Alt text input for quick editing */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alt Text
            </label>
            <input
              type="text"
              value={altText}
              onChange={(e) => {
                setAltText(e.target.value);
                handleImageChange(imageUrl, e.target.value);
              }}
              placeholder="Descriptive text for accessibility"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Current URL display */}
          {imageUrl && (
            <div className="mt-3 p-2 bg-gray-50 rounded-md">
              <p className="text-xs text-gray-600 mb-1">Current URL:</p>
              <div className="flex items-center gap-2">
                <p className="text-xs text-gray-800 truncate flex-1" title={imageUrl}>
                  {imageUrl}
                </p>
                <button
                  onClick={() => window.open(imageUrl, '_blank')}
                  className="p-1 text-gray-500 hover:text-gray-700"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
};