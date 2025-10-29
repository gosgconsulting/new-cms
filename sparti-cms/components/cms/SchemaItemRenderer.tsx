import React from 'react';
import { 
  TextEditor as ContentTextEditor, 
  ImageEditor as ContentImageEditor, 
  VideoEditor as ContentVideoEditor, 
  GalleryEditor as ContentGalleryEditor, 
  CarouselEditor as ContentCarouselEditor, 
  ButtonEditor as ContentButtonEditor,
  FAQEditor as ContentFAQEditor,
  OfficeHoursEditor as ContentOfficeHoursEditor
} from '../content-editors';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../../../src/components/ui/button';
import { SchemaItem } from '../../types/schema';
import { Badge } from '../../../src/components/ui/badge';

interface SchemaItemEditorProps {
  item: SchemaItem;
  onChange: (updatedItem: SchemaItem) => void;
  path?: (string | number)[];
}

export const SchemaItemEditor: React.FC<SchemaItemEditorProps> = ({ 
  item, 
  onChange, 
  path = [] 
}) => {
  const handleItemChange = (updatedItem: SchemaItem) => {
    onChange(updatedItem);
  };

  switch (item.type) {
    case 'heading':
    case 'text':
      return (
        <ContentTextEditor
          content={item.content || ''}
          onChange={(content) => handleItemChange({ ...item, content })}
          placeholder={item.type === 'heading' ? 'Enter heading text...' : 'Enter paragraph text...'}
          link={item.link || ''}
          onLinkChange={(link) => handleItemChange({ ...item, link })}
          className={item.type === 'heading' ? 'text-2xl font-bold' : ''}
        />
      );

    case 'image':
      return (
        <ContentImageEditor
          imageUrl={item.src || ''}
          imageTitle={item.alt || ''}
          imageAlt={item.alt || ''}
          onImageChange={(imageUrl) => {
            handleItemChange({ ...item, src: imageUrl });
          }}
          onTitleChange={(title) => {
            handleItemChange({ ...item, alt: title });
          }}
          onAltChange={(alt) => {
            handleItemChange({ ...item, alt });
          }}
          className="w-full"
        />
      );

    case 'video':
      return (
        <ContentVideoEditor
          videoUrl={item.src || ''}
          videoTitle={item.alt || ''}
          videoCaption={item.alt || ''}
          onUrlChange={(videoUrl) => handleItemChange({ ...item, src: videoUrl })}
          onTitleChange={(title) => handleItemChange({ ...item, alt: title })}
          onCaptionChange={(caption) => handleItemChange({ ...item, alt: caption })}
        />
      );

    case 'input':
      return (
        <div className="p-4 border rounded-md">
          <label className="block text-sm font-medium mb-2">Input Field: {item.key}</label>
          <input
            type="text"
            value={item.content || ''}
            onChange={(e) => handleItemChange({ ...item, content: e.target.value })}
            placeholder="Enter field label..."
            className="w-full p-2 border rounded"
          />
          <div className="mt-2 flex items-center">
            <input
              type="checkbox"
              id={`required-${item.key}`}
              checked={item.required || false}
              onChange={(e) => handleItemChange({ ...item, required: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor={`required-${item.key}`} className="text-sm">Required field</label>
          </div>
        </div>
      );

    case 'textarea':
      return (
        <div className="p-4 border rounded-md">
          <label className="block text-sm font-medium mb-2">Textarea Field: {item.key}</label>
          <textarea
            value={item.content || ''}
            onChange={(e) => handleItemChange({ ...item, content: e.target.value })}
            placeholder="Enter field label..."
            className="w-full p-2 border rounded"
            rows={3}
          />
          <div className="mt-2 flex items-center">
            <input
              type="checkbox"
              id={`required-${item.key}`}
              checked={item.required || false}
              onChange={(e) => handleItemChange({ ...item, required: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor={`required-${item.key}`} className="text-sm">Required field</label>
          </div>
        </div>
      );

    case 'gallery':
      return (
        <ContentGalleryEditor
          images={item.value || []}
          galleryTitle={item.alt || ''}
          onImagesChange={(images) => handleItemChange({ ...item, value: images })}
          onTitleChange={(title) => handleItemChange({ ...item, alt: title })}
        />
      );

    case 'carousel':
      // Debug the carousel item structure
      console.log('Carousel item:', item);
      
      // Check all possible places where images could be stored
      let carouselImages: any[] = [];
      
      // Check if images are in a direct 'images' property (as in your JSON)
      if (Array.isArray(item.images)) {
        console.log('Found images in item.images:', item.images);
        // Convert string URLs to the expected format
        carouselImages = item.images.map((img: any, index: number) => {
          if (typeof img === 'string') {
            // Make sure URL is absolute
            let url = img;
            if (!url.startsWith('http') && !url.startsWith('/')) {
              url = '/' + url;
            }
            return {
              id: `img-${index}`,
              url: url,
              alt: `Carousel image ${index + 1}`
            };
          }
          return img;
        });
      } 
      // Otherwise check other possible locations
      else if (Array.isArray(item.items)) {
        carouselImages = item.items;
      }
      else if (Array.isArray(item.value)) {
        carouselImages = item.value;
      }
      
      console.log('Processed carousel images:', carouselImages);
      
      // Get settings from props or use defaults
      const autoplayValue = item.props?.autoplay || false;
      const navigationValue = item.props?.navigation || "arrows";
      
      return (
        <ContentCarouselEditor
          autoplay={autoplayValue}
          navigation={navigationValue}
          onImagesChange={(images) => {
            // Update images in the same format they were found
            if (Array.isArray(item.images)) {
              // If original images were in item.images as strings, maintain that format
              const imageUrls = images.map(img => img.url);
              handleItemChange({ ...item, images: imageUrls });
            } else {
              // Otherwise use the items property
              handleItemChange({ ...item, items: images as any[] });
            }
          }}
          onTitleChange={(title) => {
            // Update title in the same property it was found
            if (item.title) {
              handleItemChange({ ...item, title });
            } else {
              handleItemChange({ ...item, alt: title });
            }
          }}
          onSettingsChange={(settings) => handleItemChange({ 
            ...item, 
            props: { 
              ...item.props,
              autoplay: settings.autoplay,
              navigation: settings.navigation
            } 
          })}
          images={item.value || []}
          carouselTitle={item.alt || ''}
        />
      );

    case 'button':
      return (
        <ContentButtonEditor
          buttonText={item.content || ''}
          buttonUrl={item.link || ''}
          buttonStyle="primary"
          openInNewTab={false}
          onTextChange={(text) => handleItemChange({ ...item, content: text })}
          onUrlChange={(url) => handleItemChange({ ...item, link: url })}
          onStyleChange={(style) => handleItemChange({ ...item })}
          onNewTabChange={(openInNewTab) => handleItemChange({ ...item })}
        />
      );

    case 'array': {
      const handleAddItem = () => {
        let newItem: SchemaItem;
        
        // Create different item types based on the array key
        switch (item.key) {
          case 'reviews':
            newItem = {
              key: `review_${Date.now()}`,
              type: 'review',
              props: {
                name: 'New Reviewer',
                title: 'Reviewer Title',
                rating: 5,
                content: 'This is a new review.',
                avatar: '',
              },
            };
            break;
            
          case 'faqs':
            newItem = {
              key: `faq_${Date.now()}`,
              type: 'faq',
              props: {
                question: 'New Question',
                answer: 'New Answer',
              },
            };
            break;
            
          case 'features':
            newItem = {
              key: `feature_${Date.now()}`,
              type: 'feature',
              props: {
                icon: 'star',
                title: 'New Feature',
                description: 'Feature description',
              },
            };
            break;
            
          default:
            // Generic fallback - create a basic item
            newItem = {
              key: `item_${Date.now()}`,
              type: 'text',
              content: 'New item',
            };
        }
        
        const updatedItems = [...(item.items || []), newItem];
        onChange({ ...item, items: updatedItems });
      };

      const handleRemoveItem = (indexToRemove: number) => {
        const updatedItems = (item.items || []).filter((_, index) => index !== indexToRemove);
        onChange({ ...item, items: updatedItems });
      };

      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Array</Badge>
              <span className="text-sm text-gray-600">
                items ({Array.isArray(item.items) ? item.items.length : 0} items)
              </span>
            </div>
          </div>
          
          {Array.isArray(item.items) && item.items.length > 0 ? (
            <div className="space-y-3">
              {item.items.map((arrayItem: SchemaItem, index: number) => (
                <div key={`${arrayItem.key}-${index}`} className="border rounded-lg p-4 relative group">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-3 right-3 h-6 w-6 text-red-500"
                    onClick={() => handleRemoveItem(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <div className="mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {arrayItem.type}
                    </Badge>
                    <span className="ml-2 text-sm text-gray-600">
                      {arrayItem.key}
                    </span>
                  </div>
                  {renderSchemaItemEditor(arrayItem, (updatedItem) => {
                    const updatedItems = [...(item.items || [])];
                    updatedItems[index] = updatedItem;
                    const updatedArrayItem = { ...item, items: updatedItems };
                    onChange(updatedArrayItem);
                  }, [...path, index])}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              <p>No items in this array</p>
            </div>
          )}
          {item.key === 'reviews' && (
            <Button onClick={handleAddItem} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Review
            </Button>
          )}
          {item.key === 'faqs' && (
            <Button onClick={handleAddItem} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add FAQ
            </Button>
          )}
        </div>
      );
    }

    case 'review':
      return (
        <div className="p-4 border rounded-md">
          <label className="block text-sm font-medium mb-2">Review: {item.key}</label>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Reviewer Name</label>
              <input
                type="text"
                value={item.props?.name || ''}
                onChange={(e) => handleItemChange({ ...item, props: { ...item.props, name: e.target.value } })}
                placeholder="Enter reviewer name..."
                className="w-full p-2 border rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Reviewer Title</label>
              <input
                type="text"
                value={item.props?.title || ''}
                onChange={(e) => handleItemChange({ ...item, props: { ...item.props, title: e.target.value } })}
                placeholder="Enter reviewer title..."
                className="w-full p-2 border rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Rating (1-5)</label>
              <select
                value={item.props?.rating || 5}
                onChange={(e) => handleItemChange({ ...item, props: { ...item.props, rating: parseInt(e.target.value) } })}
                className="w-full p-2 border rounded text-sm"
              >
                {[1, 2, 3, 4, 5].map(rating => (
                  <option key={rating} value={rating}>{rating} Star{rating !== 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Review Text</label>
              <textarea
                value={item.props?.content || ''}
                onChange={(e) => handleItemChange({ ...item, props: { ...item.props, content: e.target.value } })}
                placeholder="Enter review text..."
                className="w-full p-2 border rounded text-sm"
                rows={3}
              />
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor={`hasAvatar-${item.key}`} className="relative inline-block w-10 align-middle select-none cursor-pointer">
                <input
                  type="checkbox"
                  id={`hasAvatar-${item.key}`}
                  checked={item.props?.avatar !== undefined}
                  onChange={(e) => {
                    const hasAvatar = e.target.checked;
                    const newProps = { ...item.props };
                    if (hasAvatar) {
                      newProps.avatar = ''; // Initialize with empty string to show uploader
                    } else {
                      delete newProps.avatar;
                    }
                    handleItemChange({ ...item, props: newProps });
                  }}
                  className="sr-only"
                />
                <div className={`w-10 h-5 rounded-full shadow-inner transition-colors ${
                  item.props?.avatar !== undefined ? 'bg-purple-600' : 'bg-gray-200'
                }`}></div>
                <div className={`absolute top-0 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                  item.props?.avatar !== undefined ? 'translate-x-5' : 'translate-x-0'
                }`}></div>
              </label>
              <label htmlFor={`hasAvatar-${item.key}`} className="block text-xs text-gray-600">Has Avatar</label>
            </div>
            {item.props?.avatar !== undefined && (
              <div>
                <label className="block text-xs text-gray-600 mb-1">Avatar</label>
                <ContentImageEditor
                  imageUrl={item.props?.avatar || ''}
                  onImageChange={(imageUrl) => handleItemChange({ ...item, props: { ...item.props, avatar: imageUrl } })}
                />
              </div>
            )}
          </div>
        </div>
      );

    case 'feature':
      return (
        <div className="p-4 border rounded-md">
          <label className="block text-sm font-medium mb-2">Feature: {item.key}</label>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Icon</label>
              <input
                type="text"
                value={item.props?.icon || ''}
                onChange={(e) => handleItemChange({ ...item, props: { ...item.props, icon: e.target.value } })}
                placeholder="e.g., star, heart, award"
                className="w-full p-2 border rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Feature Title</label>
              <input
                type="text"
                value={item.props?.title || ''}
                onChange={(e) => handleItemChange({ ...item, props: { ...item.props, title: e.target.value } })}
                placeholder="Enter feature title..."
                className="w-full p-2 border rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Feature Description</label>
              <textarea
                value={item.props?.description || ''}
                onChange={(e) => handleItemChange({ ...item, props: { ...item.props, description: e.target.value } })}
                placeholder="Enter feature description..."
                className="w-full p-2 border rounded text-sm"
                rows={3}
              />
            </div>
          </div>
        </div>
      );
      
    case 'faq':
      // For FAQ items, we need to handle the direct structure
      console.log('FAQ Item to edit:', item);
      
      return (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-md border border-gray-200">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                <input
                  type="text"
                  value={item.props?.question || ''}
                  onChange={(e) => handleItemChange({ 
                    ...item, 
                    props: { 
                      ...item.props, 
                      question: e.target.value 
                    } 
                  })}
                  placeholder="Enter question"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
                <textarea
                  value={item.props?.answer || ''}
                  onChange={(e) => handleItemChange({ 
                    ...item, 
                    props: { 
                      ...item.props, 
                      answer: e.target.value 
                    } 
                  })}
                  placeholder="Enter answer"
                  rows={4}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
        </div>
      );
      
    case 'officeHours':
      // Handle office hours component
      return (
        <ContentOfficeHoursEditor
          items={item.items || [] as any[]}
          onChange={(officeHoursItems) => handleItemChange({ ...item, items: officeHoursItems as any[] })}
        />
      );

    default:
      return (
        <div className="p-4 bg-gray-100 rounded-md">
          <p className="text-gray-600">
            Editor not available for item type: {item.type}
          </p>
        </div>
      );
  }
};

// Keep the old function for backward compatibility
export const renderSchemaItemEditor = (item: SchemaItem, onChange: (updatedItem: SchemaItem) => void, path: (string | number)[] = []) => {
  return <SchemaItemEditor item={item} onChange={onChange} path={path} />;
};
