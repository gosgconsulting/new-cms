import React, { useState } from 'react';
import { SpartiCMSWrapper } from '../../sparti-cms';
import { 
  Type, 
  Image as ImageIcon, 
  Grid, 
  Layout, 
  Video, 
  Eye, 
  Layers,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Link,
  Upload,
  X,
  Plus
} from 'lucide-react';

// Component placeholder types
type PlaceholderType = 'heading' | 'paragraph' | 'image' | 'video' | 'gallery' | 'carousel' | 'section';
type CategoryType = 'Heading' | 'Paragraph' | 'Image' | 'Video' | 'Gallery' | 'Carousel' | 'All';

interface Placeholder {
  id: string;
  name: string;
  type: PlaceholderType;
  description: string;
  createdAt: string;
  updatedAt: string;
  category: CategoryType;
  defaultContent?: string;
}

// Hardcoded placeholders
const PLACEHOLDERS: Placeholder[] = [
  {
    id: 'text-heading-h1',
    name: 'Heading H1',
    type: 'heading',
    description: 'Main heading placeholder (H1) for page sections',
    createdAt: '2023-10-15',
    updatedAt: '2023-10-15',
    category: 'Heading',
    defaultContent: 'Main Heading'
  },
  {
    id: 'text-heading-h2',
    name: 'Heading H2',
    type: 'heading',
    description: 'Secondary heading placeholder (H2) for page sections',
    createdAt: '2023-10-15',
    updatedAt: '2023-10-15',
    category: 'Heading',
    defaultContent: 'Secondary Heading'
  },
  {
    id: 'text-heading-h3',
    name: 'Heading H3',
    type: 'heading',
    description: 'Tertiary heading placeholder (H3) for page sections',
    createdAt: '2023-10-15',
    updatedAt: '2023-10-15',
    category: 'Heading',
    defaultContent: 'Tertiary Heading'
  },
  {
    id: 'text-paragraph-standard',
    name: 'Standard Paragraph',
    type: 'paragraph',
    description: 'Standard paragraph text placeholder',
    createdAt: '2023-10-15',
    updatedAt: '2023-10-15',
    category: 'Paragraph',
    defaultContent: 'This is a standard paragraph placeholder. You can edit this text to add your content.'
  },
  {
    id: 'text-paragraph-lead',
    name: 'Lead Paragraph',
    type: 'paragraph',
    description: 'Lead paragraph with larger text for introductions',
    createdAt: '2023-10-15',
    updatedAt: '2023-10-15',
    category: 'Paragraph',
    defaultContent: 'This is a lead paragraph with larger text, typically used for introductions or important information.'
  },
  {
    id: 'text-paragraph-quote',
    name: 'Quote Block',
    type: 'paragraph',
    description: 'Blockquote for testimonials or highlighted text',
    createdAt: '2023-10-15',
    updatedAt: '2023-10-15',
    category: 'Paragraph',
    defaultContent: 'This is a blockquote for testimonials or highlighted text that you want to stand out from the rest of your content.'
  },
  {
    id: 'image-hero',
    name: 'Hero Image',
    type: 'image',
    description: 'Main hero image placeholder',
    createdAt: '2023-10-15',
    updatedAt: '2023-10-15',
    category: 'Image'
  },
  {
    id: 'image-inline',
    name: 'Inline Image',
    type: 'image',
    description: 'Standard inline image placeholder',
    createdAt: '2023-10-15',
    updatedAt: '2023-10-15',
    category: 'Image'
  },
  {
    id: 'image-background',
    name: 'Background Image',
    type: 'image',
    description: 'Full-width background image placeholder',
    createdAt: '2023-10-15',
    updatedAt: '2023-10-15',
    category: 'Image'
  },
  {
    id: 'gallery-standard',
    name: 'Standard Gallery',
    type: 'gallery',
    description: 'Multiple image gallery placeholder (grid layout)',
    createdAt: '2023-10-15',
    updatedAt: '2023-10-15',
    category: 'Gallery'
  },
  {
    id: 'gallery-masonry',
    name: 'Masonry Gallery',
    type: 'gallery',
    description: 'Masonry-style image gallery placeholder',
    createdAt: '2023-10-15',
    updatedAt: '2023-10-15',
    category: 'Gallery'
  },
  {
    id: 'video-youtube',
    name: 'YouTube Video',
    type: 'video',
    description: 'Video embed placeholder for YouTube',
    createdAt: '2023-10-15',
    updatedAt: '2023-10-15',
    category: 'Video',
    defaultContent: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  },
  {
    id: 'video-vimeo',
    name: 'Vimeo Video',
    type: 'video',
    description: 'Video embed placeholder for Vimeo',
    createdAt: '2023-10-15',
    updatedAt: '2023-10-15',
    category: 'Video',
    defaultContent: 'https://vimeo.com/123456789'
  },
  {
    id: 'carousel-images',
    name: 'Image Carousel',
    type: 'carousel',
    description: 'Sliding carousel for multiple images',
    createdAt: '2023-10-15',
    updatedAt: '2023-10-15',
    category: 'Carousel'
  },
  {
    id: 'carousel-cards',
    name: 'Card Carousel',
    type: 'carousel',
    description: 'Sliding carousel for content cards',
    createdAt: '2023-10-15',
    updatedAt: '2023-10-15',
    category: 'Carousel'
  }
];

// Mock image data for galleries and carousels
const MOCK_IMAGES = [
  { id: 'img1', url: 'https://via.placeholder.com/800x600/3498db/ffffff?text=Image+1', alt: 'Image 1' },
  { id: 'img2', url: 'https://via.placeholder.com/800x600/e74c3c/ffffff?text=Image+2', alt: 'Image 2' },
  { id: 'img3', url: 'https://via.placeholder.com/800x600/2ecc71/ffffff?text=Image+3', alt: 'Image 3' },
  { id: 'img4', url: 'https://via.placeholder.com/800x600/f39c12/ffffff?text=Image+4', alt: 'Image 4' },
  { id: 'img5', url: 'https://via.placeholder.com/800x600/9b59b6/ffffff?text=Image+5', alt: 'Image 5' },
  { id: 'img6', url: 'https://via.placeholder.com/800x600/1abc9c/ffffff?text=Image+6', alt: 'Image 6' },
];

const ComponentsViewerContent = () => {
  const [activeCategory, setActiveCategory] = useState<CategoryType>('All');
  const [selectedPlaceholder, setSelectedPlaceholder] = useState<Placeholder | null>(null);
  const [editorContent, setEditorContent] = useState<string>('');
  const [selectedImages, setSelectedImages] = useState<typeof MOCK_IMAGES>([]);
  const [videoUrl, setVideoUrl] = useState<string>('');
  
  const getPlaceholderIcon = (type: PlaceholderType) => {
    switch (type) {
      case 'heading':
      case 'paragraph':
        return <Type className="h-5 w-5 text-purple-600" />;
      case 'image':
        return <ImageIcon className="h-5 w-5 text-blue-600" />;
      case 'gallery':
        return <Grid className="h-5 w-5 text-green-600" />;
      case 'video':
        return <Video className="h-5 w-5 text-red-600" />;
      case 'carousel':
        return <Layers className="h-5 w-5 text-amber-600" />;
      case 'section':
        return <Layout className="h-5 w-5 text-gray-600" />;
      default:
        return <Type className="h-5 w-5 text-gray-600" />;
    }
  };

  const getCategoryIcon = (category: CategoryType) => {
    switch (category) {
      case 'Heading':
      case 'Paragraph':
        return <Type className="h-5 w-5" />;
      case 'Image':
        return <ImageIcon className="h-5 w-5" />;
      case 'Gallery':
        return <Grid className="h-5 w-5" />;
      case 'Video':
        return <Video className="h-5 w-5" />;
      case 'Carousel':
        return <Layers className="h-5 w-5" />;
      default:
        return <Layout className="h-5 w-5" />;
    }
  };

  const handleViewPlaceholder = (placeholder: Placeholder) => {
    setSelectedPlaceholder(placeholder);
    
    // Initialize editor content based on placeholder type
    if (placeholder.type === 'heading' || placeholder.type === 'paragraph') {
      setEditorContent(placeholder.defaultContent || '');
    } else if (placeholder.type === 'video') {
      setVideoUrl(placeholder.defaultContent || '');
    } else if (placeholder.type === 'gallery' || placeholder.type === 'carousel') {
      setSelectedImages(MOCK_IMAGES.slice(0, 3)); // Default with 3 images
    }
  };

  const filteredPlaceholders = activeCategory === 'All' 
    ? PLACEHOLDERS 
    : PLACEHOLDERS.filter(p => p.category === activeCategory);

  const categories: CategoryType[] = ['All', 'Heading', 'Paragraph', 'Image', 'Video', 'Gallery', 'Carousel'];

  // Text formatting handlers
  const handleBold = () => {
    setEditorContent(`<strong>${editorContent}</strong>`);
  };

  const handleItalic = () => {
    setEditorContent(`<em>${editorContent}</em>`);
  };

  const handleUnderline = () => {
    setEditorContent(`<u>${editorContent}</u>`);
  };

  const handleAlignment = (alignment: string) => {
    setEditorContent(`<div style="text-align: ${alignment}">${editorContent}</div>`);
  };

  // Image handlers
  const handleImageSelect = (imageUrl: string) => {
    // In a real implementation, this would open a file picker or media library
    console.log(`Selected image: ${imageUrl}`);
  };

  // Gallery handlers
  const toggleImageSelection = (image: typeof MOCK_IMAGES[0]) => {
    if (selectedImages.some(img => img.id === image.id)) {
      setSelectedImages(selectedImages.filter(img => img.id !== image.id));
    } else {
      setSelectedImages([...selectedImages, image]);
    }
  };

  // Render appropriate editor based on placeholder type
  const renderEditor = () => {
    if (!selectedPlaceholder) return null;

    switch (selectedPlaceholder.type) {
      case 'heading':
      case 'paragraph':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 p-2 bg-gray-100 rounded-md">
              <button onClick={handleBold} className="p-2 hover:bg-gray-200 rounded">
                <Bold className="h-4 w-4" />
              </button>
              <button onClick={handleItalic} className="p-2 hover:bg-gray-200 rounded">
                <Italic className="h-4 w-4" />
              </button>
              <button onClick={handleUnderline} className="p-2 hover:bg-gray-200 rounded">
                <Underline className="h-4 w-4" />
              </button>
              <div className="h-6 border-r border-gray-300 mx-1"></div>
              <button onClick={() => handleAlignment('left')} className="p-2 hover:bg-gray-200 rounded">
                <AlignLeft className="h-4 w-4" />
              </button>
              <button onClick={() => handleAlignment('center')} className="p-2 hover:bg-gray-200 rounded">
                <AlignCenter className="h-4 w-4" />
              </button>
              <button onClick={() => handleAlignment('right')} className="p-2 hover:bg-gray-200 rounded">
                <AlignRight className="h-4 w-4" />
              </button>
              <div className="h-6 border-r border-gray-300 mx-1"></div>
              <button className="p-2 hover:bg-gray-200 rounded">
                <List className="h-4 w-4" />
              </button>
              <button className="p-2 hover:bg-gray-200 rounded">
                <ListOrdered className="h-4 w-4" />
              </button>
              <button className="p-2 hover:bg-gray-200 rounded">
                <Link className="h-4 w-4" />
              </button>
            </div>
            
            {selectedPlaceholder.type === 'heading' ? (
              <input
                type="text"
                value={editorContent}
                onChange={(e) => setEditorContent(e.target.value)}
                className={`w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  selectedPlaceholder.id === 'text-heading-h1' ? 'text-3xl font-bold' :
                  selectedPlaceholder.id === 'text-heading-h2' ? 'text-2xl font-bold' :
                  'text-xl font-bold'
                }`}
                placeholder="Enter heading text..."
              />
            ) : (
              <textarea
                value={editorContent}
                onChange={(e) => setEditorContent(e.target.value)}
                className={`w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  selectedPlaceholder.id === 'text-paragraph-lead' ? 'text-lg' :
                  selectedPlaceholder.id === 'text-paragraph-quote' ? 'italic border-l-4 border-gray-400 pl-4' :
                  ''
                }`}
                rows={5}
                placeholder="Enter paragraph text..."
              />
            )}
            
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">Preview:</p>
              <div 
                className={`mt-2 ${
                  selectedPlaceholder.id === 'text-heading-h1' ? 'text-3xl font-bold' :
                  selectedPlaceholder.id === 'text-heading-h2' ? 'text-2xl font-bold' :
                  selectedPlaceholder.id === 'text-heading-h3' ? 'text-xl font-bold' :
                  selectedPlaceholder.id === 'text-paragraph-lead' ? 'text-lg' :
                  selectedPlaceholder.id === 'text-paragraph-quote' ? 'italic border-l-4 border-gray-400 pl-4' :
                  ''
                }`}
                dangerouslySetInnerHTML={{ __html: editorContent }}
              />
            </div>
          </div>
        );
      
      case 'image':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-md bg-gray-50">
              <div className="text-center">
                <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 mb-2">Drag and drop an image here, or click to select</p>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  <Upload className="h-4 w-4 inline mr-1" />
                  Upload Image
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alt Text
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Descriptive text for accessibility"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <div className="border rounded-md p-2 cursor-pointer hover:bg-gray-50">
                <img src="https://via.placeholder.com/150" alt="Sample 1" className="w-full h-24 object-cover" />
              </div>
              <div className="border rounded-md p-2 cursor-pointer hover:bg-gray-50">
                <img src="https://via.placeholder.com/150" alt="Sample 2" className="w-full h-24 object-cover" />
              </div>
              <div className="border rounded-md p-2 cursor-pointer hover:bg-gray-50">
                <img src="https://via.placeholder.com/150" alt="Sample 3" className="w-full h-24 object-cover" />
              </div>
            </div>
          </div>
        );
      
      case 'video':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Video URL (YouTube or Vimeo)
              </label>
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>
            
            <div className="aspect-w-16 aspect-h-9 bg-black">
              {videoUrl && (
                <div className="w-full h-64 bg-gray-100 flex items-center justify-center">
                  <Video className="h-12 w-12 text-gray-400" />
                  <p className="ml-2 text-gray-600">Video Preview (URL: {videoUrl})</p>
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Video Caption (Optional)
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter a caption for this video"
              />
            </div>
          </div>
        );
      
      case 'gallery':
      case 'carousel':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Select Images</h3>
              <span className="text-sm text-gray-500">{selectedImages.length} selected</span>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {MOCK_IMAGES.map(image => (
                <div 
                  key={image.id} 
                  onClick={() => toggleImageSelection(image)}
                  className={`relative border rounded-md overflow-hidden cursor-pointer ${
                    selectedImages.some(img => img.id === image.id) 
                      ? 'ring-2 ring-purple-500' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <img src={image.url} alt={image.alt} className="w-full h-24 object-cover" />
                  {selectedImages.some(img => img.id === image.id) && (
                    <div className="absolute top-1 right-1 bg-purple-500 rounded-full p-1">
                      <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4">
              <button className="flex items-center text-blue-600 hover:text-blue-800">
                <Plus className="h-4 w-4 mr-1" />
                Add More Images
              </button>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm font-medium mb-2">Preview:</p>
              <div className={`grid ${selectedPlaceholder.type === 'gallery' ? 'grid-cols-3' : 'grid-cols-1'} gap-2`}>
                {selectedImages.map(image => (
                  <img key={image.id} src={image.url} alt={image.alt} className="w-full h-24 object-cover rounded" />
                ))}
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="p-4 bg-gray-100 rounded-md">
            <p className="text-gray-600">Editor not available for this placeholder type.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 h-full overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Categories</h2>
        </div>
        <nav className="p-2">
          <ul className="space-y-1">
            {categories.map((category) => (
              <li key={category}>
                <button
                  onClick={() => setActiveCategory(category)}
                  className={`w-full flex items-center px-3 py-2 text-left rounded-md transition-colors ${
                    activeCategory === category
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {category !== 'All' && <span className="mr-3">{getCategoryIcon(category)}</span>}
                  {category}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            {activeCategory === 'All' ? 'All Placeholders' : `${activeCategory} Placeholders`}
          </h1>
          
          {/* Placeholder List */}
          <div className="bg-white rounded-lg shadow">
            <div className="divide-y divide-gray-200">
              {filteredPlaceholders.map((placeholder) => (
                <div key={placeholder.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {getPlaceholderIcon(placeholder.type)}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{placeholder.name}</h3>
                        <div className="text-sm text-gray-500">Type: {placeholder.type}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs text-gray-500 mr-4">Updated: {placeholder.updatedAt}</span>
                      <button
                        onClick={() => handleViewPlaceholder(placeholder)}
                        className="flex items-center space-x-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View</span>
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">{placeholder.description}</p>
                </div>
              ))}

              {filteredPlaceholders.length === 0 && (
                <div className="p-8 text-center">
                  <p className="text-gray-500">No placeholders found in this category.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Placeholder Editor Modal */}
      {selectedPlaceholder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                {selectedPlaceholder.name}
              </h3>
              <button
                onClick={() => setSelectedPlaceholder(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Type</span>
                  <p className="text-sm text-gray-900">{selectedPlaceholder.type}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Category</span>
                  <p className="text-sm text-gray-900">{selectedPlaceholder.category}</p>
                </div>
              </div>
              
              <div className="mb-4">
                <span className="text-sm font-medium text-gray-500">Description</span>
                <p className="text-sm text-gray-900">{selectedPlaceholder.description}</p>
              </div>
            </div>
            
            <div className="mt-4 border-t border-gray-200 pt-4">
              <h4 className="text-lg font-medium mb-3">Content Editor</h4>
              {renderEditor()}
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedPlaceholder(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Wrapper component that includes the CMS sidebar
const ComponentsViewer = () => {
  return (
    <SpartiCMSWrapper>
      <ComponentsViewerContent />
    </SpartiCMSWrapper>
  );
};

export default ComponentsViewer;