import React from 'react';
import { 
  TextEditor as ContentTextEditor, 
  ImageEditor as ContentImageEditor, 
  VideoEditor as ContentVideoEditor, 
  GalleryEditor as ContentGalleryEditor, 
  CarouselEditor as ContentCarouselEditor, 
  ButtonEditor as ContentButtonEditor 
} from '../content-editors';
import { ComponentSchema, SchemaItem } from '../../types/schema';
import { Card, CardContent, CardHeader, CardTitle } from '../../../src/components/ui/card';
import { Badge } from '../../../src/components/ui/badge';

interface ComponentEditorProps {
  schema: ComponentSchema;
  onChange?: (data: ComponentSchema) => void;
  className?: string;
}

// Helper function to render individual schema items
const renderSchemaItemEditor = (item: SchemaItem, onChange: (updatedItem: SchemaItem) => void, path: (string | number)[] = []) => {
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
          className="w-full max-w-md"
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
          className="w-full max-w-md"
        />
      );

    case 'carousel':
      return (
        <ContentCarouselEditor
          images={item.value || []}
          carouselTitle={item.alt || ''}
          autoplay={false}
          navigation="arrows"
          onImagesChange={(images) => handleItemChange({ ...item, value: images })}
          onTitleChange={(title) => handleItemChange({ ...item, alt: title })}
          onSettingsChange={(settings) => handleItemChange({ ...item, ...settings })}
          className="w-full max-w-md"
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
          className="w-full max-w-md"
        />
      );

    case 'array':
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
                <div key={`${arrayItem.key}-${index}`} className="border rounded-lg p-4">
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
        </div>
      );

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
            <div>
              <label className="block text-xs text-gray-600 mb-1">Avatar URL</label>
              <input
                type="text"
                value={item.props?.avatar || ''}
                onChange={(e) => handleItemChange({ ...item, props: { ...item.props, avatar: e.target.value } })}
                placeholder="e.g., /images/avatar.jpg"
                className="w-full p-2 border rounded text-sm"
              />
            </div>
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

export const ComponentEditor: React.FC<ComponentEditorProps> = ({
  schema,
  onChange,
  className = ''
}) => {
  
  // Ensure schema has items property
  const safeSchema = {
    ...schema,
    items: schema.items || []
  };
  
  const handleItemChange = (path: (string | number)[], updatedItem: SchemaItem) => {
    const updatedItems = [...safeSchema.items];

    let currentLevel: any = { items: updatedItems };

    for (let i = 0; i < path.length - 1; i++) {
      const keyOrIndex = path[i];
      if (typeof keyOrIndex === 'string') {
        currentLevel = currentLevel.items.find((item: SchemaItem) => item.key === keyOrIndex);
      } else {
        currentLevel = currentLevel.items[keyOrIndex];
      }
      if (!currentLevel) {
        console.error('[ComponentEditor] Invalid path, could not find item at:', path.slice(0, i + 1));
        return;
      }
    }

    const lastKeyOrIndex = path[path.length - 1];
    if (typeof lastKeyOrIndex === 'string') {
      const itemIndex = currentLevel.items.findIndex((item: SchemaItem) => item.key === lastKeyOrIndex);
      if (itemIndex !== -1) {
        currentLevel.items[itemIndex] = updatedItem;
      }
    } else {
      currentLevel.items[lastKeyOrIndex] = updatedItem;
    }

    const updatedSchema = { ...safeSchema, items: updatedItems };
    onChange?.(updatedSchema);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="outline">{safeSchema.type}</Badge>
            {safeSchema.name && <span className="text-sm text-gray-600">({safeSchema.name})</span>}
            Component Editor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {safeSchema.items && safeSchema.items.length > 0 ? safeSchema.items.map((item, index) => (
              <div key={`${item.key}-${index}`} className="border rounded-lg p-4">
                <div className="mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {item.type}
                  </Badge>
                  <span className="ml-2 text-sm text-gray-600">
                    {item.key}
                  </span>
                </div>
                {renderSchemaItemEditor(item, (updatedItem) => handleItemChange([index], updatedItem), [index])}
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                <p>No items in this component</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComponentEditor;
