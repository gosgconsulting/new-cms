import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../src/components/ui/card';
import { Input } from '../../../../src/components/ui/input';
import { Label } from '../../../../src/components/ui/label';
import { Button } from '../../../../src/components/ui/button';
import { X, GripVertical, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { ImageEditor as ContentImageEditor } from '../../content-editors';

// Flexible dropdown item - can have different structures
interface DropdownItem {
  id: string;
  // Regular menu item
  link?: string;
  label?: string;
  // Image item
  src?: string;
  alt?: string;
  // Title/subtitle items (just label)
  [key: string]: any; // Allow additional properties
}

interface DropdownSection {
  id: string;
  title?: string; // Optional - not all sections have titles
  items: DropdownItem[];
}

interface Dropdown {
  sections: DropdownSection[];
}

interface MenuItem {
  id: string;
  label: string;
  link: string;
  icon?: string; // Optional icon field for social media links
  dropdown?: Dropdown | null;
}

interface MenuItemEditorProps {
  item: MenuItem;
  index: number;
  onChange: (index: number, item: MenuItem) => void;
  onRemove: (index: number) => void;
  onMoveUp?: (index: number) => void;
  onMoveDown?: (index: number) => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  showDropdown?: boolean; // Option to show/hide dropdown functionality
}

export const MenuItemEditor: React.FC<MenuItemEditorProps> = ({
  item,
  index,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp = false,
  canMoveDown = false,
  showDropdown = true // Default to true for header menu items
}) => {
  // Show dropdown by default if it exists
  const [isDropdownOpen, setIsDropdownOpen] = useState(!!item.dropdown);

  // Sync dropdown visibility when item changes
  useEffect(() => {
    if (item.dropdown && !isDropdownOpen) {
      setIsDropdownOpen(true);
    }
  }, [item.dropdown]);

  const handleFieldChange = (field: keyof MenuItem, value: string) => {
    onChange(index, { ...item, [field]: value });
  };

  const toggleDropdown = () => {
    if (!item.dropdown) {
      // Initialize dropdown if it doesn't exist
      onChange(index, {
        ...item,
        dropdown: {
          sections: []
        }
      });
    }
    setIsDropdownOpen(!isDropdownOpen);
  };

  const removeDropdown = () => {
    onChange(index, { ...item, dropdown: null });
    setIsDropdownOpen(false);
  };

  const addDropdownSection = () => {
    const newSection: DropdownSection = {
      id: `section_${Date.now()}`,
      items: []
      // No title by default - sections can exist without titles
    };
    const updatedDropdown = {
      ...item.dropdown!,
      sections: [...(item.dropdown?.sections || []), newSection]
    };
    onChange(index, { ...item, dropdown: updatedDropdown });
  };

  const updateDropdownSection = (sectionIndex: number, updatedSection: DropdownSection) => {
    const updatedSections = [...(item.dropdown?.sections || [])];
    updatedSections[sectionIndex] = updatedSection;
    const updatedDropdown = {
      ...item.dropdown!,
      sections: updatedSections
    };
    onChange(index, { ...item, dropdown: updatedDropdown });
  };

  const removeDropdownSection = (sectionIndex: number) => {
    const updatedSections = (item.dropdown?.sections || []).filter((_, i) => i !== sectionIndex);
    const updatedDropdown = {
      ...item.dropdown!,
      sections: updatedSections
    };
    onChange(index, { ...item, dropdown: updatedDropdown });
  };

  const addDropdownItem = (sectionIndex: number, itemType: 'link' | 'image' | 'text' = 'link') => {
    let newItem: DropdownItem;
    
    if (itemType === 'image') {
      newItem = {
        id: 'image',
        src: '',
        alt: ''
      };
    } else if (itemType === 'text') {
      newItem = {
        id: `text_${Date.now()}`,
        label: ''
      };
    } else {
      // Default: link item
      newItem = {
        id: `item_${Date.now()}`,
        label: 'New Item',
        link: '/'
      };
    }
    
    const section = item.dropdown?.sections[sectionIndex];
    if (section) {
      const updatedSection = {
        ...section,
        items: [...(section.items || []), newItem]
      };
      updateDropdownSection(sectionIndex, updatedSection);
    }
  };

  // Helper to determine item type
  const getItemType = (dropdownItem: DropdownItem): 'link' | 'image' | 'text' => {
    if (dropdownItem.src !== undefined || dropdownItem.alt !== undefined) {
      return 'image';
    }
    if (dropdownItem.link !== undefined) {
      return 'link';
    }
    return 'text';
  };

  const updateDropdownItem = (sectionIndex: number, itemIndex: number, updatedItem: DropdownItem) => {
    const section = item.dropdown?.sections[sectionIndex];
    if (section) {
      const updatedItems = [...(section.items || [])];
      updatedItems[itemIndex] = updatedItem;
      const updatedSection = {
        ...section,
        items: updatedItems
      };
      updateDropdownSection(sectionIndex, updatedSection);
    }
  };

  const removeDropdownItem = (sectionIndex: number, itemIndex: number) => {
    const section = item.dropdown?.sections[sectionIndex];
    if (section) {
      const updatedItems = (section.items || []).filter((_, i) => i !== itemIndex);
      const updatedSection = {
        ...section,
        items: updatedItems
      };
      updateDropdownSection(sectionIndex, updatedSection);
    }
  };


  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-gray-400" />
            Menu Item #{index + 1}
          </CardTitle>
          <div className="flex items-center gap-1">
            {onMoveUp && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMoveUp(index)}
                disabled={!canMoveUp}
                className="h-6 w-6 p-0"
              >
                ↑
              </Button>
            )}
            {onMoveDown && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMoveDown(index)}
                disabled={!canMoveDown}
                className="h-6 w-6 p-0"
              >
                ↓
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(index)}
              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label className="text-xs">Label</Label>
          <Input
            value={item.label}
            onChange={(e) => handleFieldChange('label', e.target.value)}
            placeholder="e.g., Home, About Us, Contact"
            className="text-sm"
          />
        </div>
        <div>
          <Label className="text-xs">Link</Label>
          <Input
            value={item.link}
            onChange={(e) => handleFieldChange('link', e.target.value)}
            placeholder="e.g., /, /about, /contact"
            className="text-sm"
          />
        </div>
        {item.icon !== undefined && (
          <div>
            <Label className="text-xs">Icon</Label>
            <Input
              value={item.icon || ''}
              onChange={(e) => onChange(index, { ...item, icon: e.target.value })}
              placeholder="e.g., Facebook, Instagram, Twitter"
              className="text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Icon name for social media links (e.g., Facebook, Instagram)
            </p>
          </div>
        )}

        {/* Dropdown Toggle - only show if showDropdown is true */}
        {showDropdown && (
        <div className="border-t pt-3 mt-3">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-xs font-semibold">Dropdown Menu</Label>
            <div className="flex items-center gap-2">
              {item.dropdown && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeDropdown}
                  className="h-7 text-xs text-red-500 hover:text-red-700"
                >
                  Remove Dropdown
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={toggleDropdown}
                className="h-7 text-xs"
              >
                {isDropdownOpen ? (
                  <>
                    <ChevronUp className="h-3 w-3 mr-1" />
                    Hide Dropdown
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3 mr-1" />
                    {item.dropdown ? 'Show Dropdown' : 'Add Dropdown'}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Dropdown Content */}
          {isDropdownOpen && item.dropdown && (
            <div className="mt-3 space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              {/* Dropdown Sections */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-xs font-semibold">Sections</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addDropdownSection}
                    className="h-7 text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Section
                  </Button>
                </div>

                <div className="space-y-3">
                  {item.dropdown.sections?.map((section, sectionIndex) => (
                    <Card key={section.id} className="bg-white">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xs">Section #{sectionIndex + 1}</CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDropdownSection(sectionIndex)}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {/* Section Title - only show if it exists in schema */}
                        {section.title !== undefined ? (
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <Label className="text-xs">Section Title</Label>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const { title, ...sectionWithoutTitle } = section;
                                  updateDropdownSection(sectionIndex, sectionWithoutTitle as DropdownSection);
                                }}
                                className="h-5 text-xs text-red-500 hover:text-red-700"
                              >
                                Remove Title
                              </Button>
                            </div>
                            <Input
                              value={section.title || ''}
                              onChange={(e) => updateDropdownSection(sectionIndex, { ...section, title: e.target.value })}
                              className="text-sm"
                            />
                          </div>
                        ) : (
                          <div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateDropdownSection(sectionIndex, { ...section, title: '' })}
                              className="h-7 text-xs w-full"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add Section Title
                            </Button>
                          </div>
                        )}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-xs">Items</Label>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addDropdownItem(sectionIndex, 'link')}
                              className="h-6 text-xs"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add Item
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {section.items?.map((dropdownItem, itemIndex) => {
                              const itemType = getItemType(dropdownItem);
                              return (
                                <Card key={dropdownItem.id} className="bg-gray-50 p-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium">
                                      {itemType === 'image' ? 'Image Item' : itemType === 'text' ? 'Text Item' : 'Link Item'} #{itemIndex + 1}
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeDropdownItem(sectionIndex, itemIndex)}
                                      className="h-5 w-5 p-0 text-red-500 hover:text-red-700"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                  
                                  {/* Render based on item type */}
                                  {itemType === 'image' ? (
                                    <div className="space-y-2">
                                      <ContentImageEditor
                                        imageUrl={dropdownItem.src || ''}
                                        imageTitle={dropdownItem.alt || ''}
                                        imageAlt={dropdownItem.alt || ''}
                                        onImageChange={(url) => updateDropdownItem(sectionIndex, itemIndex, { ...dropdownItem, src: url })}
                                        onAltChange={(alt) => updateDropdownItem(sectionIndex, itemIndex, { ...dropdownItem, alt })}
                                        onTitleChange={(title) => updateDropdownItem(sectionIndex, itemIndex, { ...dropdownItem, alt: title })}
                                      />
                                    </div>
                                  ) : itemType === 'text' ? (
                                    <div>
                                      <Label className="text-xs">Label</Label>
                                      <Input
                                        value={dropdownItem.label || ''}
                                        onChange={(e) => updateDropdownItem(sectionIndex, itemIndex, { ...dropdownItem, label: e.target.value })}
                                        className="text-xs h-7"
                                      />
                                    </div>
                                  ) : (
                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <Label className="text-xs">Label</Label>
                                        <Input
                                          value={dropdownItem.label || ''}
                                          onChange={(e) => updateDropdownItem(sectionIndex, itemIndex, { ...dropdownItem, label: e.target.value })}
                                          className="text-xs h-7"
                                        />
                                      </div>
                                      <div>
                                        <Label className="text-xs">Link</Label>
                                        <Input
                                          value={dropdownItem.link || ''}
                                          onChange={(e) => updateDropdownItem(sectionIndex, itemIndex, { ...dropdownItem, link: e.target.value })}
                                          className="text-xs h-7"
                                        />
                                      </div>
                                    </div>
                                  )}
                                </Card>
                              );
                            })}
                            {(!section.items || section.items.length === 0) && (
                              <div className="text-center py-4 text-gray-400 text-xs border-2 border-dashed border-gray-300 rounded">
                                No items in this section
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {(!item.dropdown.sections || item.dropdown.sections.length === 0) && (
                    <div className="text-center py-4 text-gray-400 text-xs border-2 border-dashed border-gray-300 rounded bg-white">
                      No sections added yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        )}
      </CardContent>
    </Card>
  );
};

interface MenuItemsListProps {
  items: MenuItem[];
  onChange: (items: MenuItem[]) => void;
  title?: string;
  addButtonText?: string;
  showDropdown?: boolean; // Option to show/hide dropdown functionality
}

export const MenuItemsList: React.FC<MenuItemsListProps> = ({
  items = [], // Add default empty array for safety
  onChange,
  title = "Menu Items",
  addButtonText = "Add Menu Item",
  showDropdown = true // Default to true for header menu items
}) => {
  const addItem = () => {
    // Check if any existing item has an icon field
    const hasIconField = items?.some(item => item.icon !== undefined);
    const newItem: MenuItem = {
      id: `item_${Date.now()}`,
      label: 'New Item',
      link: '/',
      ...(hasIconField && { icon: '' }) // Include icon field if any item has it
    };
    onChange([...(items || []), newItem]);
  };

  const updateItem = (index: number, updatedItem: MenuItem) => {
    const newItems = [...(items || [])];
    newItems[index] = updatedItem;
    onChange(newItems);
  };

  const removeItem = (index: number) => {
    const newItems = (items || []).filter((_, i) => i !== index);
    onChange(newItems);
  };

  const moveItem = (fromIndex: number, toIndex: number) => {
    const newItems = [...(items || [])];
    const [movedItem] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, movedItem);
    onChange(newItems);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">{title} ({items?.length || 0})</h4>
        <Button onClick={addItem} size="sm" variant="outline">
          {addButtonText}
        </Button>
      </div>
      
      <div className="space-y-3">
        {(items || []).map((item, index) => (
          <MenuItemEditor
            key={`${item.id}-${index}`}
            item={item}
            index={index}
            onChange={updateItem}
            onRemove={removeItem}
            onMoveUp={index > 0 ? (idx) => moveItem(idx, idx - 1) : undefined}
            onMoveDown={index < (items?.length || 0) - 1 ? (idx) => moveItem(idx, idx + 1) : undefined}
            canMoveUp={index > 0}
            canMoveDown={index < (items?.length || 0) - 1}
            showDropdown={showDropdown}
          />
        ))}
      </div>
      
      {(items?.length === 0 || !items) && (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
          <p className="text-sm">No {title.toLowerCase()} added yet</p>
          <Button onClick={addItem} size="sm" variant="outline" className="mt-2">
            {addButtonText}
          </Button>
        </div>
      )}
    </div>
  );
};
