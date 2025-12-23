// Specialized editors for each item type in the new schema structure

import React from 'react';
import { Input } from '../../../src/components/ui/input';
import { Label } from '../../../src/components/ui/label';
import { Textarea } from '../../../src/components/ui/textarea';
import { Button } from '../../../src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../src/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../src/components/ui/select';
import { Badge } from '../../../src/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../src/components/ui/tabs';
import { X, Plus, Image as ImageIcon, Link as LinkIcon, Type, MousePointer, Video, Grid, Layers, Mail, FolderOpen } from 'lucide-react';
import { SchemaItem, SchemaItemType } from '../../types/schema';
// Import the new content editor components
import {
  VideoEditor as ContentVideoEditor,
  GalleryEditor as ContentGalleryEditor,
  CarouselEditor as ContentCarouselEditor
} from '../content-editors';
import ContactFormEditor from './ContactFormEditor';
import FAQItemEditor from './FAQItemEditor';
import OfficeHoursItemEditor from './OfficeHoursItemEditor';
import FAQArrayEditor from './FAQArrayEditor';

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
    <Card className="border-0 shadow-none">
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
    <Card className="border-0 shadow-none">
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
  const update = (field: keyof SchemaItem, value: string) => onChange({ ...item, [field]: value });
  const url = item.src || '';
  const alt = item.alt || '';
  const title = item.content || '';

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    if (!res.ok) return;
    const result = await res.json();
    if (result?.url) update('src', result.url);
  };

  let fileInputRef: HTMLInputElement | null = null;

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Image
          </CardTitle>
          {/* Removed top-right delete; delete lives on image hover */}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4 items-start">
          {/* Left: image preview with hover delete + click-to-edit */}
          <div className="group relative w-48 h-28 bg-slate-100 rounded overflow-hidden flex items-center justify-center">
            {url ? (
              <img
                src={url}
                alt={alt || 'Preview'}
                className="h-full w-auto object-cover cursor-pointer"
                onClick={() => fileInputRef?.click()}
              />
            ) : (
              <div
                className="text-xs text-gray-500 cursor-pointer"
                onClick={() => fileInputRef?.click()}
              >
                Click to add image
              </div>
            )}
            <button
              type="button"
              title="Remove image"
              onClick={onRemove}
              className="absolute top-2 left-2 p-1 rounded bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
            <input
              type="file"
              accept="image/*"
              ref={(el) => (fileInputRef = el)}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadFile(file);
              }}
            />
          </div>

          {/* Right: fields */}
          <div className="flex-1 space-y-3">
            <div className="space-y-2">
              <Label className="text-xs">Image URL</Label>
              <Input
                value={url}
                onChange={(e) => update('src', e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="text-sm"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Alt Text</Label>
                <Input
                  value={alt}
                  onChange={(e) => update('alt', e.target.value)}
                  placeholder="Describe the image"
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Title</Label>
                <Input
                  value={title}
                  onChange={(e) => update('content', e.target.value)}
                  placeholder="Optional title"
                  className="text-sm"
                />
              </div>
            </div>
          </div>
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
    <Card className="border-0 shadow-none">
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
      content: value,
      buttonText: value
    });
  };

  const updateLink = (link: string) => {
    onChange({
      ...item,
      link
    });
  };

  return (
    <Card className="border-0 shadow-none">
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
            value={item.content ?? (item as any).buttonText ?? ''}
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

  const addItem = (type: SchemaItemType = 'text') => {
    const newItem: SchemaItem = {
      key: `item${Date.now()}`,
      type: type,
      content: ''
    };
    const newItems = [...(item.items || []), newItem];
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
    <Card className="border-0 shadow-none">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => addItem('text')}>
              <Plus className="h-3 w-3 mr-1" />
              Add Item
            </Button>
          </div>
          <Button variant="ghost" size="sm" onClick={onRemove}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {(item.items && item.items.length > 0) ? (
          <Tabs defaultValue={item.items[0]?.key} className="w-full">
            <TabsList className="w-full mb-3 overflow-x-auto">
              {item.items.map((arrayItem) => (
                <TabsTrigger key={arrayItem.key} value={arrayItem.key}>
                  {arrayItem.type} • {arrayItem.key}
                </TabsTrigger>
              ))}
            </TabsList>
            {item.items.map((arrayItem, index) => (
              <TabsContent key={arrayItem.key} value={arrayItem.key} className="space-y-3">
                <ItemEditor
                  item={arrayItem}
                  onChange={(updatedSubItem) => updateItem(index, updatedSubItem)}
                  onRemove={() => removeItem(index)}
                />
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No items added yet</p>
            <Button size="sm" variant="outline" className="mt-2" onClick={() => addItem('text')}>
              <Plus className="h-3 w-3 mr-1" />
              Add First Item
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Tabs editor
export const TabsEditor: React.FC<ItemEditorProps> = ({ item, onChange, onRemove }) => {
  const tabs = item.tabs || [];
  
  const addTab = () => {
    const newTab = {
      id: `tab-${Date.now()}`,
      label: `Tab ${tabs.length + 1}`,
      content: []
    };
    onChange({
      ...item,
      tabs: [...tabs, newTab]
    });
  };
  
  const updateTab = (index: number, updatedTab: any) => {
    const updatedTabs = [...tabs];
    updatedTabs[index] = updatedTab;
    onChange({
      ...item,
      tabs: updatedTabs
    });
  };
  
  const removeTab = (index: number) => {
    const updatedTabs = tabs.filter((_, i) => i !== index);
    onChange({
      ...item,
      tabs: updatedTabs
    });
  };
  
  const addContentToTab = (tabIndex: number, contentType: SchemaItemType) => {
    const newContent: SchemaItem = {
      key: `${contentType}_${Date.now()}`,
      type: contentType,
      content: contentType === 'heading' ? 'New Heading' : contentType === 'text' ? 'New text content' : ''
    };
    
    const updatedTabs = [...tabs];
    updatedTabs[tabIndex] = {
      ...updatedTabs[tabIndex],
      content: [...(updatedTabs[tabIndex].content || []), newContent]
    };
    
    onChange({
      ...item,
      tabs: updatedTabs
    });
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            Tabs
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onRemove}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {tabs.length > 0 ? (
          <Tabs defaultValue={tabs[0]?.id} className="w-full">
            <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
              {tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {tabs.map((tab, tabIndex) => (
              <TabsContent key={tab.id} value={tab.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <Input
                    value={tab.label}
                    onChange={(e) => updateTab(tabIndex, { ...tab, label: e.target.value })}
                    className="max-w-xs"
                    placeholder="Tab label"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeTab(tabIndex)}
                    className="text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {tab.content?.map((contentItem, contentIndex) => (
                    <div key={contentItem.key} className="border rounded p-3 bg-slate-50">
                      <ItemEditor
                        item={contentItem}
                        onChange={(updatedItem) => {
                          const updatedContent = [...(tab.content || [])];
                          updatedContent[contentIndex] = updatedItem;
                          updateTab(tabIndex, { ...tab, content: updatedContent });
                        }}
                        onRemove={() => {
                          const updatedContent = tab.content?.filter((_, i) => i !== contentIndex) || [];
                          updateTab(tabIndex, { ...tab, content: updatedContent });
                        }}
                      />
                    </div>
                  ))}
                  
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => addContentToTab(tabIndex, 'heading')}>
                      <Plus className="h-3 w-3 mr-1" />
                      Add Heading
                    </Button>
                    <Button size="sm" onClick={() => addContentToTab(tabIndex, 'text')}>
                      <Plus className="h-3 w-3 mr-1" />
                      Add Text
                    </Button>
                    <Button size="sm" onClick={() => addContentToTab(tabIndex, 'image')}>
                      <Plus className="h-3 w-3 mr-1" />
                      Add Image
                    </Button>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <p>No tabs created yet</p>
          </div>
        )}
        
        <Button onClick={addTab} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add New Tab
        </Button>
      </CardContent>
    </Card>
  );
};

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
    <Card className="border-0 shadow-none">
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
    <Card className="border-0 shadow-none">
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
    <Card className="border-0 shadow-none">
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
      return <ButtonEditor item={item} onChange={onChange} onRemove={onRemove} />;
    case 'tabs':
      return <TabsEditor item={item} onChange={onChange} onRemove={onRemove} />;
    case 'array':
      // Check if this is a FAQ array
      if (item.key === 'faqs' && item.items?.some(i => i.type === 'faq')) {
        return <FAQArrayEditor item={item} onChange={onChange} onRemove={onRemove} />;
      }
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
    case 'faq':
      return <FAQItemEditor item={item} onChange={onChange} onRemove={onRemove} />;
    case 'officeHours':
      return <OfficeHoursItemEditor item={item} onChange={onChange} onRemove={onRemove} />;
    default:
      return (
        <Card className="border">
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
    <Card className="border-0 shadow-none">
      <CardHeader className="p-3 flex flex-row items-center justify-between">
        <CardTitle className="text-sm flex items-center gap-2">
          <Type className="h-4 w-4" />
          Input Field: <span className="font-normal text-muted-foreground">{item.key}</span>
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onRemove} className="text-red-500 hover:text-red-700">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-3 space-y-3">
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
    <Card className="border-0 shadow-none">
      <CardHeader className="p-3 flex flex-row items-center justify-between">
        <CardTitle className="text-sm flex items-center gap-2">
          <Type className="h-4 w-4" />
          Textarea Field: <span className="font-normal text-muted-foreground">{item.key}</span>
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onRemove} className="text-red-500 hover:text-red-700">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-3 space-y-3">
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
    <Card className="border-0 shadow-none">
      <CardHeader className="p-3 flex flex-row items-center justify-between">
        <CardTitle className="text-sm flex items-center gap-2">
          <MousePointer className="h-4 w-4" />
          Review Item: <span className="font-normal text-muted-foreground">{item.key}</span>
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onRemove} className="text-red-500 hover:text-red-700">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-3 space-y-3">
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
    <Card className="border-0 shadow-none">
      <CardHeader className="p-3 flex flex-row items-center justify-between">
        <CardTitle className="text-sm flex items-center gap-2">
          <MousePointer className="h-4 w-4" />
          Feature Item: <span className="font-normal text-muted-foreground">{item.key}</span>
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onRemove} className="text-red-500 hover:text-red-700">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-3 space-y-3">
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