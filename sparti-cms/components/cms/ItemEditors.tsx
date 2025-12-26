// Specialized editors for each item type in the new schema structure

import React, { useMemo, useRef, useEffect, useCallback } from 'react';
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
import QuillEditor from './QuillEditor';
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
import ImageThumbnail from './ImageThumbnail';

interface ItemEditorProps {
  item: SchemaItem;
  onChange: (item: SchemaItem) => void;
  onRemove: () => void;
  allowRemove?: boolean;
}


// Heading item editor
export const HeadingEditor: React.FC<ItemEditorProps> = ({ item, onChange, onRemove, allowRemove = true }) => {
  const contentInputRef = useRef<HTMLInputElement>(null);
  const localContentRef = useRef(item.content || '');
  const isContentFocusedRef = useRef(false);

  // Initialize refs from item prop - but only if input is not focused
  useEffect(() => {
    if (!isContentFocusedRef.current) {
      const newContent = item.content || '';
      if (newContent !== localContentRef.current) {
        localContentRef.current = newContent;
        if (contentInputRef.current) {
          const wasFocused = document.activeElement === contentInputRef.current;
          if (!wasFocused) {
            contentInputRef.current.value = newContent;
          }
        }
      }
    }
  }, [item.content]);

  const updateValue = (value: string) => {
    localContentRef.current = value;
  };

  const updateLevel = (level: string) => {
    onChange({
      ...item,
      level: parseInt(level) as 1 | 2 | 3 | 4 | 5 | 6
    });
  };

  const initialContent = item.content || '';

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Type className="h-4 w-4" />
            Heading
          </CardTitle>
          {allowRemove && (
            <Button variant="ghost" size="sm" onClick={onRemove}>
              <X className="h-4 w-4" />
            </Button>
          )}
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
            ref={contentInputRef}
            key={`heading-text-${item.key}`}
            defaultValue={initialContent}
            onChange={(e) => updateValue(e.target.value)}
            onFocus={() => { isContentFocusedRef.current = true; }}
            onBlur={(e) => {
              isContentFocusedRef.current = false;
              const currentValue = e.target.value;
              localContentRef.current = currentValue;
              onChange({
                ...item,
                content: currentValue
              });
            }}
            placeholder="Enter heading text..."
            className="text-sm"
          />
        </div>
      </CardContent>
    </Card>
  );
};

// Text item editor
export const TextEditor: React.FC<ItemEditorProps> = ({ item, onChange, onRemove, allowRemove = true }) => {
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
          {allowRemove && (
            <Button variant="ghost" size="sm" onClick={onRemove}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <QuillEditor
          content={item.content || ''}
          onChange={updateValue}
          placeholder="Enter text..."
        />
      </CardContent>
    </Card>
  );
};

// Image item editor
export const ImageEditor: React.FC<ItemEditorProps> = ({ item, onChange, onRemove, allowRemove = true }) => {
  const srcInputRef = useRef<HTMLInputElement>(null);
  const altInputRef = useRef<HTMLInputElement>(null);
  const localSrcRef = useRef(item.src || '');
  const localAltRef = useRef(item.alt || '');
  const isSrcFocusedRef = useRef(false);
  const isAltFocusedRef = useRef(false);

  // Initialize refs from item prop - but only if input is not focused
  useEffect(() => {
    if (!isSrcFocusedRef.current) {
      const newSrc = item.src || '';
      if (newSrc !== localSrcRef.current) {
        localSrcRef.current = newSrc;
        if (srcInputRef.current) {
          const wasFocused = document.activeElement === srcInputRef.current;
          if (!wasFocused) {
            srcInputRef.current.value = newSrc;
          }
        }
      }
    }
    if (!isAltFocusedRef.current) {
      const newAlt = item.alt || '';
      if (newAlt !== localAltRef.current) {
        localAltRef.current = newAlt;
        if (altInputRef.current) {
          const wasFocused = document.activeElement === altInputRef.current;
          if (!wasFocused) {
            altInputRef.current.value = newAlt;
          }
        }
      }
    }
  }, [item.src, item.alt]);

  const updateSrc = (value: string) => {
    localSrcRef.current = value;
  };

  const updateAlt = (value: string) => {
    localAltRef.current = value;
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    if (!res.ok) return;
    const result = await res.json();
    if (result?.url) {
      onChange({ ...item, src: result.url });
    }
  };

  const url = item.src || '';
  const alt = item.alt || '';
  const initialSrc = item.src || '';
  const initialAlt = item.alt || '';

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Image
          </CardTitle>
          {/* delete over image only */}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ImageThumbnail url={url} onFileSelected={uploadFile} onRemove={onRemove} showRemove={allowRemove} />

        <div className="space-y-2">
          <Label className="text-xs">Image URL</Label>
          <Input
            ref={srcInputRef}
            key={`image-src-${item.key}`}
            defaultValue={initialSrc}
            onChange={(e) => updateSrc(e.target.value)}
            onFocus={() => { isSrcFocusedRef.current = true; }}
            onBlur={(e) => {
              isSrcFocusedRef.current = false;
              const currentValue = e.target.value;
              localSrcRef.current = currentValue;
              onChange({
                ...item,
                src: currentValue
              });
            }}
            placeholder="https://example.com/image.jpg"
            className="text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Alt Text</Label>
          <Input
            ref={altInputRef}
            key={`image-alt-${item.key}`}
            defaultValue={initialAlt}
            onChange={(e) => updateAlt(e.target.value)}
            onFocus={() => { isAltFocusedRef.current = true; }}
            onBlur={(e) => {
              isAltFocusedRef.current = false;
              const currentValue = e.target.value;
              localAltRef.current = currentValue;
              onChange({
                ...item,
                alt: currentValue
              });
            }}
            placeholder="Describe the image"
            className="text-sm"
          />
        </div>
      </CardContent>
    </Card>
  );
};

// Link item editor
export const LinkEditor: React.FC<ItemEditorProps> = ({ item, onChange, onRemove, allowRemove = true }) => {
  const linkInputRef = useRef<HTMLInputElement>(null);
  const labelInputRef = useRef<HTMLInputElement>(null);
  const localLinkRef = useRef(item.link || '');
  const localLabelRef = useRef(item.label || '');
  const isLinkFocusedRef = useRef(false);
  const isLabelFocusedRef = useRef(false);

  // Initialize refs from item prop - but only if input is not focused
  useEffect(() => {
    if (!isLinkFocusedRef.current) {
      const newLink = item.link || '';
      if (newLink !== localLinkRef.current) {
        localLinkRef.current = newLink;
        if (linkInputRef.current) {
          const wasFocused = document.activeElement === linkInputRef.current;
          if (!wasFocused) {
            linkInputRef.current.value = newLink;
          }
        }
      }
    }
    if (!isLabelFocusedRef.current) {
      const newLabel = item.label || '';
      if (newLabel !== localLabelRef.current) {
        localLabelRef.current = newLabel;
        if (labelInputRef.current) {
          const wasFocused = document.activeElement === labelInputRef.current;
          if (!wasFocused) {
            labelInputRef.current.value = newLabel;
          }
        }
      }
    }
  }, [item.link, item.label]);

  const updateLink = (value: string) => {
    localLinkRef.current = value;
  };

  const updateLabel = (value: string) => {
    localLabelRef.current = value;
  };

  const initialLink = item.link || '';
  const initialLabel = item.label || '';

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <LinkIcon className="h-4 w-4" />
            Link
          </CardTitle>
          {allowRemove && (
            <Button variant="ghost" size="sm" onClick={onRemove}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label className="text-xs">Link URL</Label>
          <Input
            ref={linkInputRef}
            key={`link-url-${item.key}`}
            defaultValue={initialLink}
            onChange={(e) => updateLink(e.target.value)}
            onFocus={() => { isLinkFocusedRef.current = true; }}
            onBlur={(e) => {
              isLinkFocusedRef.current = false;
              const currentValue = e.target.value;
              localLinkRef.current = currentValue;
              onChange({
                ...item,
                link: currentValue
              });
            }}
            placeholder="/path/to/page"
            className="text-sm"
          />
        </div>
        <div>
          <Label className="text-xs">Link Label</Label>
          <Input
            ref={labelInputRef}
            key={`link-label-${item.key}`}
            defaultValue={initialLabel}
            onChange={(e) => updateLabel(e.target.value)}
            onFocus={() => { isLabelFocusedRef.current = true; }}
            onBlur={(e) => {
              isLabelFocusedRef.current = false;
              const currentValue = e.target.value;
              localLabelRef.current = currentValue;
              onChange({
                ...item,
                label: currentValue
              });
            }}
            placeholder="Click here"
            className="text-sm"
          />
        </div>
      </CardContent>
    </Card>
  );
};

// Button item editor
export const ButtonEditor: React.FC<ItemEditorProps> = ({ item, onChange, onRemove, allowRemove = true }) => {
  // Use refs to store input elements and values to prevent losing focus
  const contentInputRef = useRef<HTMLInputElement>(null);
  const linkInputRef = useRef<HTMLInputElement>(null);
  const localContentRef = useRef(item.content ?? (item as any).buttonText ?? '');
  const localLinkRef = useRef(item.link || '');
  const onChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isContentFocusedRef = useRef(false);
  const isLinkFocusedRef = useRef(false);
  const isMountedRef = useRef(true);
  
  // Initialize refs from item prop - but only if input is not focused
  // This prevents overwriting user input while they're typing
  useEffect(() => {
    // Only update if the input is not currently focused
    if (!isContentFocusedRef.current) {
      const newContent = item.content ?? (item as any).buttonText ?? '';
      if (newContent !== localContentRef.current) {
        localContentRef.current = newContent;
        // Only update DOM if input exists and is not focused
        if (contentInputRef.current) {
          const wasFocused = document.activeElement === contentInputRef.current;
          if (!wasFocused) {
            contentInputRef.current.value = newContent;
          }
        }
      }
    }
    if (!isLinkFocusedRef.current) {
      const newLink = item.link || '';
      if (newLink !== localLinkRef.current) {
        localLinkRef.current = newLink;
        // Only update DOM if input exists and is not focused
        if (linkInputRef.current) {
          const wasFocused = document.activeElement === linkInputRef.current;
          if (!wasFocused) {
            linkInputRef.current.value = newLink;
          }
        }
      }
    }
  }, [item.content, (item as any).buttonText, item.link]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (onChangeTimeoutRef.current) {
        clearTimeout(onChangeTimeoutRef.current);
      }
    };
  }, []);

  // Only call onChange on blur, not during typing
  // This prevents re-renders that could cause the input to lose focus
  const updateValue = (value: string) => {
    localContentRef.current = value;
    // Just update the ref - don't call onChange while typing
    // onChange will be called on blur
  };

  const updateLink = (link: string) => {
    localLinkRef.current = link;
    // Just update the ref - don't call onChange while typing
    // onChange will be called on blur
  };

  // Use defaultValue for uncontrolled inputs to prevent React from resetting them
  // Only use initial value, then let the ref control it
  const initialContent = item.content ?? (item as any).buttonText ?? '';
  const initialLink = item.link || '';

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <MousePointer className="h-4 w-4" />
            Button
          </CardTitle>
          {allowRemove && (
            <Button variant="ghost" size="sm" onClick={onRemove}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label className="text-xs">Button Text</Label>
          <Input
            ref={contentInputRef}
            key={`button-text-${item.key}`}
            defaultValue={initialContent}
            onChange={(e) => updateValue(e.target.value)}
            onFocus={() => { isContentFocusedRef.current = true; }}
            onBlur={(e) => { 
              isContentFocusedRef.current = false;
              // Get the current value from the input element
              const currentValue = e.target.value;
              localContentRef.current = currentValue;
              // Sync on blur to ensure latest value is saved
              if (onChangeTimeoutRef.current) {
                clearTimeout(onChangeTimeoutRef.current);
                onChangeTimeoutRef.current = null;
              }
              // Call onChange immediately on blur
              onChange({
                ...item,
                content: currentValue,
                buttonText: currentValue
              });
            }}
            placeholder="Button text..."
            className="text-sm"
          />
        </div>
        <div>
          <Label className="text-xs">Link URL</Label>
          <Input
            ref={linkInputRef}
            key={`button-link-${item.key}`}
            defaultValue={initialLink}
            onChange={(e) => updateLink(e.target.value)}
            onFocus={() => { isLinkFocusedRef.current = true; }}
            onBlur={(e) => { 
              isLinkFocusedRef.current = false;
              // Get the current value from the input element
              const currentValue = e.target.value;
              localLinkRef.current = currentValue;
              // Sync on blur to ensure latest value is saved
              if (onChangeTimeoutRef.current) {
                clearTimeout(onChangeTimeoutRef.current);
                onChangeTimeoutRef.current = null;
              }
              // Call onChange immediately on blur
              onChange({
                ...item,
                link: currentValue
              });
            }}
            placeholder="/action-url"
            className="text-sm"
          />
        </div>
      </CardContent>
    </Card>
  );
};

// Array item editor
export const ArrayEditor: React.FC<ItemEditorProps> = ({ item, onChange, onRemove, allowRemove = true }) => {
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
          {allowRemove && (
            <Button variant="ghost" size="sm" onClick={onRemove}>
              <X className="h-4 w-4" />
            </Button>
          )}
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
                  allowRemove={true}
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
export const TabsEditor: React.FC<ItemEditorProps> = ({ item, onChange, onRemove, allowRemove = true }) => {
  const tabs = item.tabs || [];
  const labelInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());
  const localLabelRefs = useRef<Map<string, string>>(new Map());
  const focusedLabelRefs = useRef<Map<string, boolean>>(new Map());
  
  // Initialize refs from tabs
  useEffect(() => {
    tabs.forEach(tab => {
      if (!focusedLabelRefs.current.get(tab.id)) {
        const currentLabel = tab.label || '';
        const storedLabel = localLabelRefs.current.get(tab.id) || '';
        if (currentLabel !== storedLabel) {
          localLabelRefs.current.set(tab.id, currentLabel);
          const inputRef = labelInputRefs.current.get(tab.id);
          if (inputRef) {
            const wasFocused = document.activeElement === inputRef;
            if (!wasFocused) {
              inputRef.value = currentLabel;
            }
          }
        }
      }
    });
  }, [tabs]);
  
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
    const tabToRemove = tabs[index];
    if (tabToRemove) {
      labelInputRefs.current.delete(tabToRemove.id);
      localLabelRefs.current.delete(tabToRemove.id);
      focusedLabelRefs.current.delete(tabToRemove.id);
    }
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
          {allowRemove && (
            <Button variant="ghost" size="sm" onClick={onRemove}>
              <X className="h-4 w-4" />
            </Button>
          )}
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
                    ref={(el) => {
                      if (el) {
                        labelInputRefs.current.set(tab.id, el);
                      } else {
                        labelInputRefs.current.delete(tab.id);
                      }
                    }}
                    key={`tab-label-${tab.id}`}
                    defaultValue={tab.label || ''}
                    onChange={(e) => {
                      localLabelRefs.current.set(tab.id, e.target.value);
                    }}
                    onFocus={() => {
                      focusedLabelRefs.current.set(tab.id, true);
                    }}
                    onBlur={(e) => {
                      focusedLabelRefs.current.set(tab.id, false);
                      const currentValue = e.target.value;
                      localLabelRefs.current.set(tab.id, currentValue);
                      updateTab(tabIndex, { ...tab, label: currentValue });
                    }}
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
export const VideoItemEditor: React.FC<ItemEditorProps> = ({ item, onChange, onRemove, allowRemove = true }) => {
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
          {allowRemove && (
            <Button variant="ghost" size="sm" onClick={onRemove}>
              <X className="h-4 w-4" />
            </Button>
          )}
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
export const GalleryItemEditor: React.FC<ItemEditorProps> = ({ item, onChange, onRemove, allowRemove = true }) => {
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
          {allowRemove && (
            <Button variant="ghost" size="sm" onClick={onRemove}>
              <X className="h-4 w-4" />
            </Button>
          )}
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
export const CarouselItemEditor: React.FC<ItemEditorProps> = ({ item, onChange, onRemove, allowRemove = true }) => {
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
          {allowRemove && (
            <Button variant="ghost" size="sm" onClick={onRemove}>
              <X className="h-4 w-4" />
            </Button>
          )}
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
// Memoize to prevent unnecessary re-renders when item reference changes but content is the same
const ItemEditorComponent: React.FC<ItemEditorProps> = ({ item, onChange, onRemove, allowRemove = true }) => {
  switch (item.type) {
    case 'heading':
      return <HeadingEditor item={item} onChange={onChange} onRemove={onRemove} allowRemove={allowRemove} />;
    case 'text':
      return <TextEditor item={item} onChange={onChange} onRemove={onRemove} allowRemove={allowRemove} />;
    case 'image':
      return <ImageEditor item={item} onChange={onChange} onRemove={onRemove} allowRemove={allowRemove} />;
    case 'video':
      return <VideoItemEditor item={item} onChange={onChange} onRemove={onRemove} allowRemove={allowRemove} />;
    case 'gallery':
      return <GalleryItemEditor item={item} onChange={onChange} onRemove={onRemove} allowRemove={allowRemove} />;
    case 'carousel':
      return <CarouselItemEditor item={item} onChange={onChange} onRemove={onRemove} allowRemove={allowRemove} />;
    case 'link':
      return <LinkEditor item={item} onChange={onChange} onRemove={onRemove} allowRemove={allowRemove} />;
    case 'button':
      return <ButtonEditor item={item} onChange={onChange} onRemove={onRemove} allowRemove={allowRemove} />;
    case 'tabs':
      return <TabsEditor item={item} onChange={onChange} onRemove={onRemove} allowRemove={allowRemove} />;
    case 'array':
      // Check if this is a FAQ array
      if (item.key === 'faqs' && item.items?.some(i => i.type === 'faq')) {
        return <FAQArrayEditor item={item} onChange={onChange} onRemove={onRemove} />;
      }
      return <ArrayEditor item={item} onChange={onChange} onRemove={onRemove} allowRemove={allowRemove} />;
    // V3 Schema item types
    case 'input':
      return <InputEditor item={item} onChange={onChange} onRemove={onRemove} allowRemove={allowRemove} />;
    case 'textarea':
      return <TextareaEditor item={item} onChange={onChange} onRemove={onRemove} allowRemove={allowRemove} />;
    case 'review':
      return <ReviewEditor item={item} onChange={onChange} onRemove={onRemove} allowRemove={allowRemove} />;
    case 'feature':
      return <FeatureEditor item={item} onChange={onChange} onRemove={onRemove} allowRemove={allowRemove} />;
    case 'ContactForm' as any:
      return <ContactFormEditor item={item} onChange={onChange} onRemove={onRemove} />;
    case 'faq':
      return <FAQItemEditor item={item} onChange={onChange} onRemove={onRemove} />;
    case 'officeHours':
      return <OfficeHoursItemEditor item={item} onChange={onChange} onRemove={onRemove} />;
    default:
      return (
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Unknown Item Type: {item.type}</CardTitle>
              {allowRemove && (
                <Button variant="ghost" size="sm" onClick={onRemove}>
                  <X className="h-4 w-4" />
                </Button>
              )}
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

export const ItemEditor = React.memo(ItemEditorComponent, (prevProps, nextProps) => {
  // Custom comparison: only re-render if item structure changed (key/type), NOT content
  // This prevents re-renders when typing, allowing ButtonEditor's local state to work
  // Content changes are handled by local state in the editor components themselves
  // We only care about structural changes (key, type, nested items structure)
  const prevItemKeys = (prevProps.item.items || []).map(i => i.key).join(',');
  const nextItemKeys = (nextProps.item.items || []).map(i => i.key).join(',');
  
  return (
    prevProps.item.key === nextProps.item.key &&
    prevProps.item.type === nextProps.item.type &&
    prevProps.allowRemove === nextProps.allowRemove &&
    prevItemKeys === nextItemKeys
    // Intentionally NOT comparing content - that's handled by local state in editors
  );
});

// NEW V3 SCHEMA ITEM EDITORS


// Input field editor for form inputs
export const InputEditor: React.FC<ItemEditorProps> = ({ item, onChange, onRemove, allowRemove = true }) => {
  const keyInputRef = useRef<HTMLInputElement>(null);
  const contentInputRef = useRef<HTMLInputElement>(null);
  const localKeyRef = useRef(item.key);
  const localContentRef = useRef(item.content || '');
  const isKeyFocusedRef = useRef(false);
  const isContentFocusedRef = useRef(false);

  // Initialize refs from item prop - but only if input is not focused
  useEffect(() => {
    if (!isKeyFocusedRef.current) {
      if (item.key !== localKeyRef.current) {
        localKeyRef.current = item.key;
        if (keyInputRef.current) {
          const wasFocused = document.activeElement === keyInputRef.current;
          if (!wasFocused) {
            keyInputRef.current.value = item.key;
          }
        }
      }
    }
    if (!isContentFocusedRef.current) {
      const newContent = item.content || '';
      if (newContent !== localContentRef.current) {
        localContentRef.current = newContent;
        if (contentInputRef.current) {
          const wasFocused = document.activeElement === contentInputRef.current;
          if (!wasFocused) {
            contentInputRef.current.value = newContent;
          }
        }
      }
    }
  }, [item.key, item.content]);

  const updateKey = (value: string) => {
    localKeyRef.current = value;
  };

  const updateContent = (value: string) => {
    localContentRef.current = value;
  };

  const initialKey = item.key;
  const initialContent = item.content || '';

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="p-3 flex flex-row items-center justify-between">
        <CardTitle className="text-sm flex items-center gap-2">
          <Type className="h-4 w-4" />
          Input Field: <span className="font-normal text-muted-foreground">{item.key}</span>
        </CardTitle>
        {allowRemove && (
          <Button variant="ghost" size="sm" onClick={onRemove} className="text-red-500 hover:text-red-700">
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-3 space-y-3">
        <div className="space-y-2">
          <Label>Field Key</Label>
          <Input
            ref={keyInputRef}
            key={`input-key-${item.key}`}
            defaultValue={initialKey}
            onChange={(e) => updateKey(e.target.value)}
            onFocus={() => { isKeyFocusedRef.current = true; }}
            onBlur={(e) => {
              isKeyFocusedRef.current = false;
              const currentValue = e.target.value;
              localKeyRef.current = currentValue;
              onChange({ ...item, key: currentValue });
            }}
            placeholder="e.g., name, email"
          />
        </div>
        <div>
          <Label className="text-xs">Field Label</Label>
          <Input
            ref={contentInputRef}
            key={`input-content-${item.key}`}
            defaultValue={initialContent}
            onChange={(e) => updateContent(e.target.value)}
            onFocus={() => { isContentFocusedRef.current = true; }}
            onBlur={(e) => {
              isContentFocusedRef.current = false;
              const currentValue = e.target.value;
              localContentRef.current = currentValue;
              onChange({ ...item, content: currentValue });
            }}
            placeholder="Enter field label..."
            className="text-sm"
          />
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="required"
            checked={item.required || false}
            onChange={(e) => onChange({ ...item, required: e.target.checked })}
            className="rounded"
          />
          <Label htmlFor="required" className="text-sm">Required field</Label>
        </div>
      </CardContent>
    </Card>
  );
};

// Textarea field editor for form textareas
export const TextareaEditor: React.FC<ItemEditorProps> = ({ item, onChange, onRemove, allowRemove = true }) => {
  const keyInputRef = useRef<HTMLInputElement>(null);
  const contentInputRef = useRef<HTMLInputElement>(null);
  const localKeyRef = useRef(item.key);
  const localContentRef = useRef(item.content || '');
  const isKeyFocusedRef = useRef(false);
  const isContentFocusedRef = useRef(false);

  // Initialize refs from item prop - but only if input is not focused
  useEffect(() => {
    if (!isKeyFocusedRef.current) {
      if (item.key !== localKeyRef.current) {
        localKeyRef.current = item.key;
        if (keyInputRef.current) {
          const wasFocused = document.activeElement === keyInputRef.current;
          if (!wasFocused) {
            keyInputRef.current.value = item.key;
          }
        }
      }
    }
    if (!isContentFocusedRef.current) {
      const newContent = item.content || '';
      if (newContent !== localContentRef.current) {
        localContentRef.current = newContent;
        if (contentInputRef.current) {
          const wasFocused = document.activeElement === contentInputRef.current;
          if (!wasFocused) {
            contentInputRef.current.value = newContent;
          }
        }
      }
    }
  }, [item.key, item.content]);

  const updateKey = (value: string) => {
    localKeyRef.current = value;
  };

  const updateContent = (value: string) => {
    localContentRef.current = value;
  };

  const initialKey = item.key;
  const initialContent = item.content || '';

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="p-3 flex flex-row items-center justify-between">
        <CardTitle className="text-sm flex items-center gap-2">
          <Type className="h-4 w-4" />
          Textarea Field: <span className="font-normal text-muted-foreground">{item.key}</span>
        </CardTitle>
        {allowRemove && (
          <Button variant="ghost" size="sm" onClick={onRemove} className="text-red-500 hover:text-red-700">
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-3 space-y-3">
        <div className="space-y-2">
          <Label>Field Key</Label>
          <Input
            ref={keyInputRef}
            key={`textarea-key-${item.key}`}
            defaultValue={initialKey}
            onChange={(e) => updateKey(e.target.value)}
            onFocus={() => { isKeyFocusedRef.current = true; }}
            onBlur={(e) => {
              isKeyFocusedRef.current = false;
              const currentValue = e.target.value;
              localKeyRef.current = currentValue;
              onChange({ ...item, key: currentValue });
            }}
            placeholder="e.g., message, description"
          />
        </div>
        <div>
          <Label className="text-xs">Field Label</Label>
          <Input
            ref={contentInputRef}
            key={`textarea-content-${item.key}`}
            defaultValue={initialContent}
            onChange={(e) => updateContent(e.target.value)}
            onFocus={() => { isContentFocusedRef.current = true; }}
            onBlur={(e) => {
              isContentFocusedRef.current = false;
              const currentValue = e.target.value;
              localContentRef.current = currentValue;
              onChange({ ...item, content: currentValue });
            }}
            placeholder="Enter field label..."
            className="text-sm"
          />
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="required"
            checked={item.required || false}
            onChange={(e) => onChange({ ...item, required: e.target.checked })}
            className="rounded"
          />
          <Label htmlFor="required" className="text-sm">Required field</Label>
        </div>
      </CardContent>
    </Card>
  );
};

// Review item editor
export const ReviewEditor: React.FC<ItemEditorProps> = ({ item, onChange, onRemove, allowRemove = true }) => {
  const keyInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const localKeyRef = useRef(item.key);
  const localNameRef = useRef(item.props?.name || '');
  const localAvatarRef = useRef(item.props?.avatar || '');
  const isKeyFocusedRef = useRef(false);
  const isNameFocusedRef = useRef(false);
  const isAvatarFocusedRef = useRef(false);

  // Initialize refs from item prop - but only if input is not focused
  useEffect(() => {
    if (!isKeyFocusedRef.current) {
      if (item.key !== localKeyRef.current) {
        localKeyRef.current = item.key;
        if (keyInputRef.current) {
          const wasFocused = document.activeElement === keyInputRef.current;
          if (!wasFocused) {
            keyInputRef.current.value = item.key;
          }
        }
      }
    }
    if (!isNameFocusedRef.current) {
      const newName = item.props?.name || '';
      if (newName !== localNameRef.current) {
        localNameRef.current = newName;
        if (nameInputRef.current) {
          const wasFocused = document.activeElement === nameInputRef.current;
          if (!wasFocused) {
            nameInputRef.current.value = newName;
          }
        }
      }
    }
    if (!isAvatarFocusedRef.current) {
      const newAvatar = item.props?.avatar || '';
      if (newAvatar !== localAvatarRef.current) {
        localAvatarRef.current = newAvatar;
        if (avatarInputRef.current) {
          const wasFocused = document.activeElement === avatarInputRef.current;
          if (!wasFocused) {
            avatarInputRef.current.value = newAvatar;
          }
        }
      }
    }
  }, [item.key, item.props?.name, item.props?.avatar]);

  const updateKey = (value: string) => {
    localKeyRef.current = value;
  };

  const updateName = (value: string) => {
    localNameRef.current = value;
  };

  const updateAvatar = (value: string) => {
    localAvatarRef.current = value;
  };

  const updateProps = (propKey: string, value: any) => {
    const newProps = { ...(item.props || {}), [propKey]: value };
    onChange({ ...item, props: newProps });
  };

  const initialKey = item.key;
  const initialName = item.props?.name || '';
  const initialAvatar = item.props?.avatar || '';

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="p-3 flex flex-row items-center justify-between">
        <CardTitle className="text-sm flex items-center gap-2">
          <MousePointer className="h-4 w-4" />
          Review Item: <span className="font-normal text-muted-foreground">{item.key}</span>
        </CardTitle>
        {allowRemove && (
          <Button variant="ghost" size="sm" onClick={onRemove} className="text-red-500 hover:text-red-700">
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-3 space-y-3">
        <div className="space-y-2">
          <Label>Review Key</Label>
          <Input
            ref={keyInputRef}
            key={`review-key-${item.key}`}
            defaultValue={initialKey}
            onChange={(e) => updateKey(e.target.value)}
            onFocus={() => { isKeyFocusedRef.current = true; }}
            onBlur={(e) => {
              isKeyFocusedRef.current = false;
              const currentValue = e.target.value;
              localKeyRef.current = currentValue;
              onChange({ ...item, key: currentValue });
            }}
            placeholder="e.g., review_1, customer_review"
          />
        </div>
        <div className="space-y-2">
          <Label>Reviewer Name</Label>
          <Input
            ref={nameInputRef}
            key={`review-name-${item.key}`}
            defaultValue={initialName}
            onChange={(e) => updateName(e.target.value)}
            onFocus={() => { isNameFocusedRef.current = true; }}
            onBlur={(e) => {
              isNameFocusedRef.current = false;
              const currentValue = e.target.value;
              localNameRef.current = currentValue;
              updateProps('name', currentValue);
            }}
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
          <QuillEditor
            content={item.props?.content || ''}
            onChange={(value) => updateProps('content', value)}
            placeholder="Enter review text..."
          />
        </div>
        <div className="space-y-2">
          <Label>Avatar URL</Label>
          <Input
            ref={avatarInputRef}
            key={`review-avatar-${item.key}`}
            defaultValue={initialAvatar}
            onChange={(e) => updateAvatar(e.target.value)}
            onFocus={() => { isAvatarFocusedRef.current = true; }}
            onBlur={(e) => {
              isAvatarFocusedRef.current = false;
              const currentValue = e.target.value;
              localAvatarRef.current = currentValue;
              updateProps('avatar', currentValue);
            }}
            placeholder="e.g., /images/avatar.jpg"
          />
        </div>
      </CardContent>
    </Card>
  );
};

// Feature item editor
export const FeatureEditor: React.FC<ItemEditorProps> = ({ item, onChange, onRemove, allowRemove = true }) => {
  const keyInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const localKeyRef = useRef(item.key);
  const localIconRef = useRef(item.props?.icon || '');
  const localTitleRef = useRef(item.props?.title || '');
  const isKeyFocusedRef = useRef(false);
  const isIconFocusedRef = useRef(false);
  const isTitleFocusedRef = useRef(false);

  // Initialize refs from item prop - but only if input is not focused
  useEffect(() => {
    if (!isKeyFocusedRef.current) {
      if (item.key !== localKeyRef.current) {
        localKeyRef.current = item.key;
        if (keyInputRef.current) {
          const wasFocused = document.activeElement === keyInputRef.current;
          if (!wasFocused) {
            keyInputRef.current.value = item.key;
          }
        }
      }
    }
    if (!isIconFocusedRef.current) {
      const newIcon = item.props?.icon || '';
      if (newIcon !== localIconRef.current) {
        localIconRef.current = newIcon;
        if (iconInputRef.current) {
          const wasFocused = document.activeElement === iconInputRef.current;
          if (!wasFocused) {
            iconInputRef.current.value = newIcon;
          }
        }
      }
    }
    if (!isTitleFocusedRef.current) {
      const newTitle = item.props?.title || '';
      if (newTitle !== localTitleRef.current) {
        localTitleRef.current = newTitle;
        if (titleInputRef.current) {
          const wasFocused = document.activeElement === titleInputRef.current;
          if (!wasFocused) {
            titleInputRef.current.value = newTitle;
          }
        }
      }
    }
  }, [item.key, item.props?.icon, item.props?.title]);

  const updateKey = (value: string) => {
    localKeyRef.current = value;
  };

  const updateIcon = (value: string) => {
    localIconRef.current = value;
  };

  const updateTitle = (value: string) => {
    localTitleRef.current = value;
  };

  const updateProps = (propKey: string, value: any) => {
    const newProps = { ...(item.props || {}), [propKey]: value };
    onChange({ ...item, props: newProps });
  };

  const initialKey = item.key;
  const initialIcon = item.props?.icon || '';
  const initialTitle = item.props?.title || '';

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="p-3 flex flex-row items-center justify-between">
        <CardTitle className="text-sm flex items-center gap-2">
          <MousePointer className="h-4 w-4" />
          Feature Item: <span className="font-normal text-muted-foreground">{item.key}</span>
        </CardTitle>
        {allowRemove && (
          <Button variant="ghost" size="sm" onClick={onRemove} className="text-red-500 hover:text-red-700">
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-3 space-y-3">
        <div className="space-y-2">
          <Label>Feature Key</Label>
          <Input
            ref={keyInputRef}
            key={`feature-key-${item.key}`}
            defaultValue={initialKey}
            onChange={(e) => updateKey(e.target.value)}
            onFocus={() => { isKeyFocusedRef.current = true; }}
            onBlur={(e) => {
              isKeyFocusedRef.current = false;
              const currentValue = e.target.value;
              localKeyRef.current = currentValue;
              onChange({ ...item, key: currentValue });
            }}
            placeholder="e.g., feature_1, craftsmanship"
          />
        </div>
        <div className="space-y-2">
          <Label>Icon</Label>
          <Input
            ref={iconInputRef}
            key={`feature-icon-${item.key}`}
            defaultValue={initialIcon}
            onChange={(e) => updateIcon(e.target.value)}
            onFocus={() => { isIconFocusedRef.current = true; }}
            onBlur={(e) => {
              isIconFocusedRef.current = false;
              const currentValue = e.target.value;
              localIconRef.current = currentValue;
              updateProps('icon', currentValue);
            }}
            placeholder="e.g., star, heart, award"
          />
        </div>
        <div>
          <Label className="text-xs">Feature Title</Label>
          <Input
            ref={titleInputRef}
            key={`feature-title-${item.key}`}
            defaultValue={initialTitle}
            onChange={(e) => updateTitle(e.target.value)}
            onFocus={() => { isTitleFocusedRef.current = true; }}
            onBlur={(e) => {
              isTitleFocusedRef.current = false;
              const currentValue = e.target.value;
              localTitleRef.current = currentValue;
              updateProps('title', currentValue);
            }}
            placeholder="Enter feature title..."
            className="text-sm"
          />
        </div>
        <div>
          <Label className="text-xs">Feature Description</Label>
          <QuillEditor
            content={item.props?.description || ''}
            onChange={(value) => updateProps('description', value)}
            placeholder="Enter feature description..."
          />
        </div>
      </CardContent>
    </Card>
  );
};