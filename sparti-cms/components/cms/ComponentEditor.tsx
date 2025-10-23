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
const renderSchemaItemEditor = (item: SchemaItem, onChange: (updatedItem: SchemaItem) => void, className: string = '') => {
  const handleItemChange = (updatedItem: SchemaItem) => {
    onChange(updatedItem);
  };

  switch (item.type) {
    case 'heading':
    case 'paragraph':
    case 'text':
      return (
        <ContentTextEditor
          content={item.content?.en || ''}
          onChange={(content) => handleItemChange({ ...item, content: { en: content, fr: item.content?.fr || '' } })}
          placeholder={item.type === 'heading' ? 'Enter heading text...' : 'Enter paragraph text...'}
          className={className}
        />
      );

    case 'image':
      return (
        <ContentImageEditor
          imageUrl={item.src || ''}
          imageTitle={item.title || ''}
          imageAlt={item.alt?.en || ''}
          onImageChange={(imageUrl) => handleItemChange({ ...item, src: imageUrl })}
          onTitleChange={(title) => handleItemChange({ ...item, title })}
          onAltChange={(alt) => handleItemChange({ ...item, alt: { en: alt, fr: item.alt?.fr || '' } })}
          className={className}
        />
      );

    case 'video':
      return (
        <ContentVideoEditor
          videoUrl={item.src || ''}
          videoTitle={item.title || ''}
          videoCaption={item.caption || ''}
          onUrlChange={(videoUrl) => handleItemChange({ ...item, src: videoUrl })}
          onTitleChange={(title) => handleItemChange({ ...item, title })}
          onCaptionChange={(caption) => handleItemChange({ ...item, caption })}
          className={className}
        />
      );

    case 'gallery':
      return (
        <ContentGalleryEditor
          images={item.value || []}
          galleryTitle={item.title || ''}
          onImagesChange={(images) => handleItemChange({ ...item, value: images })}
          onTitleChange={(title) => handleItemChange({ ...item, title })}
          className={className}
        />
      );

    case 'carousel':
      return (
        <ContentCarouselEditor
          images={item.value || []}
          carouselTitle={item.title || ''}
          autoplay={item.autoplay || false}
          navigation={item.navigation || 'arrows'}
          onImagesChange={(images) => handleItemChange({ ...item, value: images })}
          onTitleChange={(title) => handleItemChange({ ...item, title })}
          onSettingsChange={(settings) => handleItemChange({ ...item, ...settings })}
          className={className}
        />
      );

    case 'button':
      return (
        <ContentButtonEditor
          buttonText={item.content?.en || ''}
          buttonUrl={item.action || ''}
          buttonStyle={item.style || 'primary'}
          openInNewTab={item.target === '_blank'}
          onTextChange={(text) => handleItemChange({ ...item, content: { en: text, fr: item.content?.fr || '' } })}
          onUrlChange={(url) => handleItemChange({ ...item, action: url })}
          onStyleChange={(style) => handleItemChange({ ...item, style })}
          onNewTabChange={(openInNewTab) => handleItemChange({ ...item, target: openInNewTab ? '_blank' : '_self' })}
          className={className}
        />
      );

    case 'array':
      return (
        <div className={`space-y-4 ${className}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Array</Badge>
              <span className="text-sm text-gray-600">
                {item.itemType || 'items'} ({Array.isArray(item.items) ? item.items.length : 0} items)
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
                    const updatedItems = [...item.items];
                    updatedItems[index] = updatedItem;
                    onChange({ ...item, items: updatedItems });
                  })}
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

    default:
      return (
        <div className={`p-4 bg-gray-100 rounded-md ${className}`}>
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
  const handleItemChange = (index: number, updatedItem: SchemaItem) => {
    const updatedItems = [...schema.items];
    updatedItems[index] = updatedItem;
    onChange?.({ ...schema, items: updatedItems });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="outline">{schema.type}</Badge>
            Component Editor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {schema.items.map((item, index) => (
              <div key={`${item.key}-${index}`} className="border rounded-lg p-4">
                <div className="mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {item.type}
                  </Badge>
                  <span className="ml-2 text-sm text-gray-600">
                    {item.key}
                  </span>
                </div>
                {renderSchemaItemEditor(item, (updatedItem) => handleItemChange(index, updatedItem))}
              </div>
            ))}
            {schema.items.length === 0 && (
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
