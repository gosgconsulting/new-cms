// Specialized editors for each item type in the new schema structure

import React from 'react';
import { Input } from '../../../src/components/ui/input';
import { Label } from '../../../src/components/ui/label';
import { Textarea } from '../../../src/components/ui/textarea';
import { Button } from '../../../src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../src/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../src/components/ui/select';
import { Badge } from '../../../src/components/ui/badge';
import { X, Plus, Image as ImageIcon, Link as LinkIcon, Type, MousePointer, Video, Grid, Layers, Mail } from 'lucide-react';
import { SchemaItem, SchemaItemType } from '../../types/schema';
// Import the new content editor components
import {
  TextEditor as ContentTextEditor,
  ImageEditor as ContentImageEditor,
  VideoEditor as ContentVideoEditor,
  GalleryEditor as ContentGalleryEditor,
  CarouselEditor as ContentCarouselEditor,
  ButtonEditor as ContentButtonEditor
} from '../content-editors';
import ContactFormEditor from './ContactFormEditor';

interface ItemEditorProps {
  item: SchemaItem;
  onChange: (item: SchemaItem) => void;
  onRemove: () => void;
}


// Heading item editor
export const HeadingEditor: React.FC<ItemEditorProps> = ({ item, onChange, onRemove }) => {
  const updateValue = (value: string) => {
    onChange({
      ...item,
      content: value
    });
  };

  const updateLevel = (level: string) => {
    onChange({
      ...item,
      level: parseInt(level) as 1 | 2 | 3 | 4 | 5 | 6
    });
  };

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Type className="h-4 w-4" />
            Heading
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onRemove}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label className="text-xs">Heading Level</Label>
          <Select value={item.level?.toString() || '1'} onValueChange={updateLevel}>
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">H1</SelectItem>
              <SelectItem value="2">H2</SelectItem>
              <SelectItem value="3">H3</SelectItem>
              <SelectItem value="4">H4</SelectItem>
              <SelectItem value="5">H5</SelectItem>
              <SelectItem value="6">H6</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Heading Text</Label>
          <Input
            value={item.content || ''}
            onChange={(e) => updateValue(e.target.value)}
            placeholder="Enter heading text..."
            className="text-sm"
          />
        </div>
      </CardContent>
    </Card>
  );
};

// Text item editor
export const TextEditor: React.FC<ItemEditorProps> = ({ item, onChange, onRemove }) => {
  const updateValue = (value: string) => {
    onChange({
      ...item,
      content: value
    });
  };

  return (
    <Card className="border-l-4 border-l-green-500">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Type className="h-4 w-4" />
            Text
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onRemove}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div>
          <Label className="text-xs">Text Content</Label>
          <Textarea
            value={item.content || ''}
            onChange={(e) => updateValue(e.target.value)}
            placeholder="Enter text content..."
            className="text-sm"
          />
        </div>
      </CardContent>
    </Card>
  );
};

// Image item editor
export const ImageEditor: React.FC<ItemEditorProps> = ({ item, onChange, onRemove }) => {
  const updateValue = (value: string) => {
    onChange({
      ...item,
      src: value
    });
  };

  const updateAlt = (alt: string) => {
    onChange({
      ...item,
      alt
    });
  };

  return (
    <Card className="border-l-4 border-l-purple-500">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Image
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onRemove}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label className="text-xs">Image URL</Label>
          <Input
            value={item.src || ''}
            onChange={(e) => updateValue(e.target.value)}
            placeholder="/path/to/image.jpg"
            className="text-sm"
          />
        </div>
        {item.src && (
          <div className="border rounded p-2">
            <img 
              src={item.src} 
              alt="Preview" 
              className="max-w-full h-32 object-cover rounded"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}
        <div>
          <Label className="text-xs">Alt Text</Label>
          <Input
            value={item.alt || ''}
            onChange={(e) => updateAlt(e.target.value)}
            placeholder="Describe the image..."
            className="text-sm"
          />
        </div>
      </CardContent>
    </Card>
  );
};

// Link item editor
export const LinkEditor: React.FC<ItemEditorProps> = ({ item, onChange, onRemove }) => {
  const updateValue = (value: string) => {
    onChange({
      ...item,
      link: value
    });
  };

  const updateLabel = (label: string) => {
    onChange({
      ...item,
      label
    });
  };

  return (
    <Card className="border-l-4 border-l-orange-500">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <LinkIcon className="h-4 w-4" />
            Link
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onRemove}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label className="text-xs">Link URL</Label>
          <Input
            value={item.link || ''}
            onChange={(e) => updateValue(e.target.value)}
            placeholder="/path/to/page"
            className="text-sm"
          />
        </div>
        <div>
          <Label className="text-xs">Link Label</Label>
          <Input
            value={item.label || ''}
            onChange={(e) => updateLabel(e.target.value)}
            placeholder="Click here"
            className="text-sm"
          />
        </div>
      </CardContent>
    </Card>
  );
};

// Button item editor
export const ButtonEditor: React.FC<ItemEditorProps> = ({ item, onChange, onRemove }) => {
  const updateValue = (value: string) => {
    onChange({
      ...item,
      content: value
    });
  };

  const updateLink = (link: string) => {
    onChange({
      ...item,
      link
    });
  };

  return (
    <Card className="border-l-4 border-l-red-500">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <MousePointer className="h-4 w-4" />
            Button
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onRemove}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label className="text-xs">Button Text</Label>
          <Input
            value={item.content || ''}
            onChange={(e) => updateValue(e.target.value)}
            placeholder="Button text..."
            className="text-sm"
          />
        </div>
        <div>
          <Label className="text-xs">Link URL</Label>
          <Input
            value={item.link || ''}
            onChange={(e) => updateLink(e.target.value)}
            placeholder="/action-url"
            className="text-sm"
          />
        </div>
      </CardContent>
    </Card>
  );
};

// Array item editor
export const ArrayEditor: React.FC<ItemEditorProps> = ({ item, onChange, onRemove }) => {
  const updateItems = (items: SchemaItem[]) => {
    onChange({
      ...item,
      items
    });
  };

  const addItem = () => {
    const newItems = [...(item.items || []), { key: `item${Date.now()}`, type: 'text' as const, content: '' }];
    updateItems(newItems);
  };

  const removeItem = (index: number) => {
    const newItems = item.items?.filter((_, i) => i !== index) || [];
    updateItems(newItems);
  };

  const updateItem = (index: number, updatedItem: SchemaItem) => {
    const newItems = [...(item.items || [])];
    newItems[index] = updatedItem;
    updateItems(newItems);
  };

  return (
    <Card className="border-l-4 border-l-yellow-500">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Badge className="h-4 w-4" />
            Array ({item.items?.length || 0} items)
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onRemove}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Items</Label>
            <Button size="sm" onClick={addItem}>
              <Plus className="h-3 w-3 mr-1" />
              Add Item
            </Button>
          </div>
          {item.items?.map((arrayItem: SchemaItem, index: number) => (
            <div key={index} className="border rounded p-2 flex items-center gap-2">
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-1">
                  {arrayItem.type} - {arrayItem.key}
                </div>
                <Input
                  value={arrayItem.content || ''}
                  onChange={(e) => updateItem(index, { ...arrayItem, content: e.target.value })}
                  placeholder="Item content"
                  className="text-sm"
                />
              </div>
              <Button size="sm" variant="ghost" onClick={() => removeItem(index)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// WRAPPER COMPONENTS FOR NEW CONTENT EDITORS
// These adapt the new content editor components to work with the ItemEditorProps interface

// Video item editor using the new ContentVideoEditor
export const VideoItemEditor: React.FC<ItemEditorProps> = ({ item, onChange, onRemove }) => {
  const videoItem = item as any; // Type assertion for video item

  const updateValue = (value: string) => {
    onChange({
      ...item,
      value
    });
  };

  const updateTitle = (title: string) => {
    onChange({
      ...item,
      alt: title
    });
  };

  const updateCaption = (caption: string) => {
    onChange({
      ...item,
      alt: caption
    });
  };

  return (
    <Card className="border-l-4 border-l-cyan-500">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Video className="h-4 w-4" />
            Video
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onRemove}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ContentVideoEditor
          videoUrl={item.value || ''}
          onUrlChange={updateValue}
          videoTitle={videoItem.title || ''}
          onTitleChange={updateTitle}
          videoCaption={videoItem.caption || ''}
          onCaptionChange={updateCaption}
        />
      </CardContent>
    </Card>
  );
};

// Gallery item editor using the new ContentGalleryEditor
export const GalleryItemEditor: React.FC<ItemEditorProps> = ({ item, onChange, onRemove }) => {
  const galleryItem = item as any; // Type assertion for gallery item

  const updateImages = (images: any[]) => {
    onChange({
      ...item,
      value: images
    });
  };

  const updateTitle = (title: string) => {
    onChange({
      ...item,
      alt: title
    });
  };

  return (
    <Card className="border-l-4 border-l-indigo-500">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Grid className="h-4 w-4" />
            Gallery
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onRemove}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ContentGalleryEditor
          images={galleryItem.value || []}
          onImagesChange={updateImages}
          galleryTitle={galleryItem.title || ''}
          onTitleChange={updateTitle}
        />
      </CardContent>
    </Card>
  );
};

// Carousel item editor using the new ContentCarouselEditor
export const CarouselItemEditor: React.FC<ItemEditorProps> = ({ item, onChange, onRemove }) => {
  const carouselItem = item as any; // Type assertion for carousel item

  const updateImages = (images: any[]) => {
    onChange({
      ...item,
      value: images
    });
  };

  const updateTitle = (title: string) => {
    onChange({
      ...item,
      alt: title
    });
  };

  const updateAutoplay = (autoplay: boolean) => {
    onChange({
      ...item
    });
  };

  const updateShowNavigation = (showNavigation: boolean) => {
    onChange({
      ...item
    });
  };

  return (
    <Card className="border-l-4 border-l-pink-500">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Carousel
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onRemove}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ContentCarouselEditor
          images={carouselItem.value || []}
          onImagesChange={updateImages}
          carouselTitle={carouselItem.title || ''}
          onTitleChange={updateTitle}
          autoplay={carouselItem.autoplay || false}
          navigation={carouselItem.navigation || 'arrows'}
          onSettingsChange={(settings) => {
            updateAutoplay(settings.autoplay);
            onChange({
              ...item
            });
          }}
        />
      </CardContent>
    </Card>
  );
};

// Enhanced Button item editor using the new ContentButtonEditor
export const EnhancedButtonItemEditor: React.FC<ItemEditorProps> = ({ item, onChange, onRemove }) => {
  const buttonItem = item as any; // Type assertion for button item

  const updateText = (text: string) => {
    onChange({
      ...item,
      value: text
    });
  };

  const updateUrl = (url: string) => {
    onChange({
      ...item,
      link: url
    });
  };

  const updateStyle = (style: string) => {
    onChange({
      ...item,
      content: style
    });
  };

  const updateOpenInNewTab = (openInNewTab: boolean) => {
    onChange({
      ...item,
      link: openInNewTab ? '_blank' : '_self'
    });
  };

  return (
    <Card className="border-l-4 border-l-red-500">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <MousePointer className="h-4 w-4" />
            Enhanced Button
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onRemove}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ContentButtonEditor
          buttonText={item.value || ''}
          buttonUrl={buttonItem.action || ''}
          onTextChange={updateText}
          onUrlChange={updateUrl}
          buttonStyle={buttonItem.style || 'primary'}
          onStyleChange={updateStyle}
          openInNewTab={buttonItem.target === '_blank'}
          onNewTabChange={updateOpenInNewTab}
        />
      </CardContent>
    </Card>
  );
};

// Main item editor that routes to the appropriate editor
export const ItemEditor: React.FC<ItemEditorProps> = ({ item, onChange, onRemove }) => {
  switch (item.type) {
    case 'heading':
      return <HeadingEditor item={item} onChange={onChange} onRemove={onRemove} />;
    case 'text':
      return <TextEditor item={item} onChange={onChange} onRemove={onRemove} />;
    case 'image':
      return <ImageEditor item={item} onChange={onChange} onRemove={onRemove} />;
    case 'video':
      return <VideoItemEditor item={item} onChange={onChange} onRemove={onRemove} />;
    case 'gallery':
      return <GalleryItemEditor item={item} onChange={onChange} onRemove={onRemove} />;
    case 'carousel':
      return <CarouselItemEditor item={item} onChange={onChange} onRemove={onRemove} />;
    case 'link':
      return <LinkEditor item={item} onChange={onChange} onRemove={onRemove} />;
    case 'button':
      return <EnhancedButtonItemEditor item={item} onChange={onChange} onRemove={onRemove} />;
    case 'array':
      return <ArrayEditor item={item} onChange={onChange} onRemove={onRemove} />;
    // V3 Schema item types
    case 'input':
      return <InputEditor item={item} onChange={onChange} onRemove={onRemove} />;
    case 'textarea':
      return <TextareaEditor item={item} onChange={onChange} onRemove={onRemove} />;
    case 'review':
      return <ReviewEditor item={item} onChange={onChange} onRemove={onRemove} />;
    case 'feature':
      return <FeatureEditor item={item} onChange={onChange} onRemove={onRemove} />;
    case 'ContactForm' as any:
      return <ContactFormEditor item={item} onChange={onChange} onRemove={onRemove} />;
    default:
      return (
        <Card className="border-l-4 border-l-gray-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Unknown Item Type: {item.type}</CardTitle>
              <Button variant="ghost" size="sm" onClick={onRemove}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This item type is not supported yet.
            </p>
          </CardContent>
        </Card>
      );
  }
};

// NEW V3 SCHEMA ITEM EDITORS


// Input field editor for form inputs
export const InputEditor: React.FC<ItemEditorProps> = ({ item, onChange, onRemove }) => {
  const updateItem = (field: keyof SchemaItem, value: any) => {
    onChange({ ...item, [field]: value });
  };

  return (
    <Card className="bg-muted/40">
      <CardHeader className="p-3 flex flex-row items-center justify-between">
        <CardTitle className="text-sm flex items-center gap-2">
          <Type className="h-4 w-4" />
          Input Field: <span className="font-normal text-muted-foreground">{item.key}</span>
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onRemove} className="text-red-500 hover:text-red-700">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-3 border-t space-y-3">
        <div className="space-y-2">
          <Label>Field Key</Label>
          <Input
            value={item.key}
            onChange={(e) => updateItem('key', e.target.value)}
            placeholder="e.g., name, email"
          />
        </div>
        <div>
          <Label className="text-xs">Field Label</Label>
          <Input
            value={item.content || ''}
            onChange={(e) => updateItem('content', e.target.value)}
            placeholder="Enter field label..."
            className="text-sm"
          />
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="required"
            checked={item.required || false}
            onChange={(e) => updateItem('required', e.target.checked)}
            className="rounded"
          />
          <Label htmlFor="required" className="text-sm">Required field</Label>
        </div>
      </CardContent>
    </Card>
  );
};

// Textarea field editor for form textareas
export const TextareaEditor: React.FC<ItemEditorProps> = ({ item, onChange, onRemove }) => {
  const updateItem = (field: keyof SchemaItem, value: any) => {
    onChange({ ...item, [field]: value });
  };

  return (
    <Card className="bg-muted/40">
      <CardHeader className="p-3 flex flex-row items-center justify-between">
        <CardTitle className="text-sm flex items-center gap-2">
          <Type className="h-4 w-4" />
          Textarea Field: <span className="font-normal text-muted-foreground">{item.key}</span>
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onRemove} className="text-red-500 hover:text-red-700">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-3 border-t space-y-3">
        <div className="space-y-2">
          <Label>Field Key</Label>
          <Input
            value={item.key}
            onChange={(e) => updateItem('key', e.target.value)}
            placeholder="e.g., message, description"
          />
        </div>
        <div>
          <Label className="text-xs">Field Label</Label>
          <Input
            value={item.content || ''}
            onChange={(e) => updateItem('content', e.target.value)}
            placeholder="Enter field label..."
            className="text-sm"
          />
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="required"
            checked={item.required || false}
            onChange={(e) => updateItem('required', e.target.checked)}
            className="rounded"
          />
          <Label htmlFor="required" className="text-sm">Required field</Label>
        </div>
      </CardContent>
    </Card>
  );
};

// Review item editor
export const ReviewEditor: React.FC<ItemEditorProps> = ({ item, onChange, onRemove }) => {
  const updateItem = (field: keyof SchemaItem, value: any) => {
    onChange({ ...item, [field]: value });
  };

  const updateProps = (propKey: string, value: any) => {
    const newProps = { ...(item.props || {}), [propKey]: value };
    updateItem('props', newProps);
  };

  return (
    <Card className="bg-muted/40">
      <CardHeader className="p-3 flex flex-row items-center justify-between">
        <CardTitle className="text-sm flex items-center gap-2">
          <MousePointer className="h-4 w-4" />
          Review Item: <span className="font-normal text-muted-foreground">{item.key}</span>
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onRemove} className="text-red-500 hover:text-red-700">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-3 border-t space-y-3">
        <div className="space-y-2">
          <Label>Review Key</Label>
          <Input
            value={item.key}
            onChange={(e) => updateItem('key', e.target.value)}
            placeholder="e.g., review_1, customer_review"
          />
        </div>
        <div className="space-y-2">
          <Label>Reviewer Name</Label>
          <Input
            value={item.props?.name || ''}
            onChange={(e) => updateProps('name', e.target.value)}
            placeholder="e.g., John Doe"
          />
        </div>
        <div className="space-y-2">
          <Label>Rating (1-5)</Label>
          <Select
            value={item.props?.rating?.toString() || '5'}
            onValueChange={(val) => updateProps('rating', parseInt(val))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5].map(rating => (
                <SelectItem key={rating} value={rating.toString()}>
                  {rating} Star{rating !== 1 ? 's' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Review Text</Label>
          <Textarea
            value={item.props?.content || ''}
            onChange={(e) => updateProps('content', e.target.value)}
            placeholder="Enter review text..."
            className="text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label>Avatar URL</Label>
          <Input
            value={item.props?.avatar || ''}
            onChange={(e) => updateProps('avatar', e.target.value)}
            placeholder="e.g., /images/avatar.jpg"
          />
        </div>
      </CardContent>
    </Card>
  );
};

// Feature item editor
export const FeatureEditor: React.FC<ItemEditorProps> = ({ item, onChange, onRemove }) => {
  const updateItem = (field: keyof SchemaItem, value: any) => {
    onChange({ ...item, [field]: value });
  };

  const updateProps = (propKey: string, value: any) => {
    const newProps = { ...(item.props || {}), [propKey]: value };
    updateItem('props', newProps);
  };

  return (
    <Card className="bg-muted/40">
      <CardHeader className="p-3 flex flex-row items-center justify-between">
        <CardTitle className="text-sm flex items-center gap-2">
          <MousePointer className="h-4 w-4" />
          Feature Item: <span className="font-normal text-muted-foreground">{item.key}</span>
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onRemove} className="text-red-500 hover:text-red-700">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-3 border-t space-y-3">
        <div className="space-y-2">
          <Label>Feature Key</Label>
          <Input
            value={item.key}
            onChange={(e) => updateItem('key', e.target.value)}
            placeholder="e.g., feature_1, craftsmanship"
          />
        </div>
        <div className="space-y-2">
          <Label>Icon</Label>
          <Input
            value={item.props?.icon || ''}
            onChange={(e) => updateProps('icon', e.target.value)}
            placeholder="e.g., star, heart, award"
          />
        </div>
        <div>
          <Label className="text-xs">Feature Title</Label>
          <Input
            value={item.props?.title || ''}
            onChange={(e) => updateProps('title', e.target.value)}
            placeholder="Enter feature title..."
            className="text-sm"
          />
        </div>
        <div>
          <Label className="text-xs">Feature Description</Label>
          <Textarea
            value={item.props?.description || ''}
            onChange={(e) => updateProps('description', e.target.value)}
            placeholder="Enter feature description..."
            className="text-sm"
          />
        </div>
      </CardContent>
    </Card>
  );
};
