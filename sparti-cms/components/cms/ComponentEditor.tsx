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
    case 'text':
      return (
        <ContentTextEditor
          content={item.content || ''}
          onChange={(content) => handleItemChange({ ...item, content })}
          placeholder={item.type === 'heading' ? 'Enter heading text...' : 'Enter paragraph text...'}
          className={className}
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
          className={className}
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
          className={className}
        />
      );

    case 'gallery':
      return (
        <ContentGalleryEditor
          images={item.value || []}
          galleryTitle={item.alt || ''}
          onImagesChange={(images) => handleItemChange({ ...item, value: images })}
          onTitleChange={(title) => handleItemChange({ ...item, alt: title })}
          className={className}
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
          className={className}
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
                    // For array items, we need to update the parent array item
                    const updatedArrayItem = { ...item, items: updatedItems };
                    console.log('[ComponentEditor] Array item updated:', updatedArrayItem);
                    // This should call the parent's onChange, not handleItemChange
                    // We need to find the parent item index and update it
                    // For now, let's just log and see what happens
                    console.log('[ComponentEditor] Array update - this needs to be handled by parent');
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
    const updatedSchema = { ...schema, items: updatedItems };
    onChange?.(updatedSchema);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="outline">{schema.type}</Badge>
            {schema.name && <span className="text-sm text-gray-600">({schema.name})</span>}
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
                {renderSchemaItemEditor(item, (updatedItem) => {
                  console.log('[ComponentEditor] renderSchemaItemEditor callback called with:', updatedItem);
                  handleItemChange(index, updatedItem);
                })}
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
