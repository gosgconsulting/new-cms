import React, { useState } from 'react';
import { Card, CardContent } from '../../../src/components/ui/card';
import { Button } from '../../../src/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../../src/components/ui/accordion';
import { Image, FileText, Users, MessageSquare, HelpCircle, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { getArrayItemPreview } from '../../utils/componentHelpers';
import { SchemaItemEditor } from './SchemaItemRenderer';
import { SchemaItem } from '../../types/schema';

interface ArrayItemCardsProps {
  items: any[];
  itemType: string;
  onItemsChange: (items: any[]) => void;
  onItemChange: (index: number, updatedItem: any) => void;
  onAddItem?: () => void;
  onRemoveItem?: (index: number) => void;
  className?: string;
}

interface ItemCardProps {
  item: any;
  index: number;
  itemType: string;
  onItemChange: (updatedItem: any) => void;
  onRemoveItem: () => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

const getItemTypeIcon = (itemType: string) => {
  switch (itemType) {
    case 'carousel':
    case 'gallery':
      return Image;
    case 'testimonials':
      return MessageSquare;
    case 'teamMembers':
      return Users;
    case 'faqs':
      return HelpCircle;
    default:
      return FileText;
  }
};

const ItemCard: React.FC<ItemCardProps> = ({
  item,
  index,
  itemType,
  onItemChange,
  onRemoveItem,
  isExpanded,
  onToggleExpanded
}) => {
  const preview = getArrayItemPreview(item, index, itemType);
  const IconComponent = getItemTypeIcon(itemType);

  // Convert item to SchemaItem format for editing
  const convertToSchemaItem = (item: any): SchemaItem => {
    switch (itemType) {
      case 'carousel':
      case 'gallery':
        return {
          key: `item-${index}`,
          type: 'image',
          src: item.src || item.url,
          alt: item.alt,
          content: item.caption || item.description
        };
      
      case 'testimonials':
        return {
          key: `testimonial-${index}`,
          type: 'array',
          items: [
            { key: 'name', type: 'text', content: item.name || '' },
            { key: 'text', type: 'textarea', content: item.text || '' },
            { key: 'role', type: 'text', content: item.role || '' },
            { key: 'company', type: 'text', content: item.company || '' },
            { key: 'image', type: 'image', src: item.image || item.avatar || '' }
          ]
        };
      
      case 'teamMembers':
        return {
          key: `member-${index}`,
          type: 'array',
          items: [
            { key: 'name', type: 'text', content: item.name || '' },
            { key: 'role', type: 'text', content: item.role || item.position || '' },
            { key: 'bio', type: 'textarea', content: item.bio || item.description || '' },
            { key: 'image', type: 'image', src: item.image || item.photo || '' }
          ]
        };
      
      case 'faqs':
        return {
          key: `faq-${index}`,
          type: 'array',
          items: [
            { key: 'question', type: 'text', content: item.question || '' },
            { key: 'answer', type: 'textarea', content: item.answer || '' }
          ]
        };
      
      default:
        // Generic object handling
        const items: SchemaItem[] = Object.entries(item).map(([key, value]) => ({
          key,
          type: typeof value === 'string' && value.length > 100 ? 'textarea' : 'text',
          content: String(value || '')
        }));
        
        return {
          key: `item-${index}`,
          type: 'array',
          items
        };
    }
  };

  const handleSchemaItemChange = (updatedSchemaItem: SchemaItem) => {
    // Convert back to original format
    let updatedItem: any = {};
    
    switch (itemType) {
      case 'carousel':
      case 'gallery':
        updatedItem = {
          ...item,
          src: updatedSchemaItem.src || item.src || item.url,
          url: updatedSchemaItem.src || item.src || item.url,
          alt: updatedSchemaItem.alt || item.alt,
          caption: updatedSchemaItem.content || item.caption,
          description: updatedSchemaItem.content || item.description
        };
        break;
      
      case 'testimonials':
        if (updatedSchemaItem.items) {
          const itemsMap = (updatedSchemaItem.items as SchemaItem[]).reduce((acc, schemaItem) => {
            acc[schemaItem.key] = schemaItem.content;
            return acc;
          }, {} as Record<string, any>);
          
          updatedItem = {
            ...item,
            name: itemsMap.name || item.name,
            text: itemsMap.text || item.text,
            role: itemsMap.role || item.role,
            company: itemsMap.company || item.company,
            image: itemsMap.image || item.image,
            avatar: itemsMap.image || item.avatar
          };
        }
        break;
      
      case 'teamMembers':
        if (updatedSchemaItem.items) {
          const itemsMap = (updatedSchemaItem.items as SchemaItem[]).reduce((acc, schemaItem) => {
            acc[schemaItem.key] = schemaItem.content || (schemaItem as any).src;
            return acc;
          }, {} as Record<string, any>);
          
          updatedItem = {
            ...item,
            name: itemsMap.name || item.name,
            role: itemsMap.role || item.role,
            position: itemsMap.role || item.position,
            bio: itemsMap.bio || item.bio,
            description: itemsMap.bio || item.description,
            image: itemsMap.image || item.image,
            photo: itemsMap.image || item.photo
          };
        }
        break;
      
      case 'faqs':
        if (updatedSchemaItem.items) {
          const itemsMap = (updatedSchemaItem.items as SchemaItem[]).reduce((acc, schemaItem) => {
            acc[schemaItem.key] = schemaItem.content;
            return acc;
          }, {} as Record<string, any>);
          
          updatedItem = {
            ...item,
            question: itemsMap.question || item.question,
            answer: itemsMap.answer || item.answer
          };
        }
        break;
      
      default:
        // Generic object handling
        if (updatedSchemaItem.items) {
          updatedItem = updatedSchemaItem.items.reduce((acc, schemaItem) => {
            acc[schemaItem.key] = schemaItem.content;
            return acc;
          }, {} as any);
        }
        break;
    }
    
    onItemChange(updatedItem);
  };

  return (
    <Card className="mb-3 overflow-hidden">
      <div 
        className="p-3 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={onToggleExpanded}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <IconComponent className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            
            {preview.thumbnail && (
              <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0">
                <img 
                  src={preview.thumbnail} 
                  alt={preview.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{preview.title}</p>
              {preview.subtitle && (
                <p className="text-xs text-muted-foreground truncate">{preview.subtitle}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveItem();
              }}
              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
            
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </div>
      
      {isExpanded && (
        <div className="border-t bg-muted/20 p-4">
          <SchemaItemEditor
            item={convertToSchemaItem(item)}
            onChange={handleSchemaItemChange}
            path={[index]}
          />
        </div>
      )}
    </Card>
  );
};

export const ArrayItemCards: React.FC<ArrayItemCardsProps> = ({
  items,
  itemType,
  onItemsChange,
  onItemChange,
  onAddItem,
  onRemoveItem,
  className = ''
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const toggleItemExpanded = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  const handleItemChange = (index: number, updatedItem: any) => {
    const newItems = [...items];
    newItems[index] = updatedItem;
    onItemsChange(newItems);
    onItemChange(index, updatedItem);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onItemsChange(newItems);
    
    // Update expanded items indices
    const newExpanded = new Set<number>();
    expandedItems.forEach(expandedIndex => {
      if (expandedIndex < index) {
        newExpanded.add(expandedIndex);
      } else if (expandedIndex > index) {
        newExpanded.add(expandedIndex - 1);
      }
    });
    setExpandedItems(newExpanded);
    
    if (onRemoveItem) {
      onRemoveItem(index);
    }
  };

  if (items.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-muted-foreground mb-4">
          <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No items added yet</p>
        </div>
        {onAddItem && (
          <Button onClick={onAddItem} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item, index) => (
        <ItemCard
          key={`${itemType}-${index}`}
          item={item}
          index={index}
          itemType={itemType}
          onItemChange={(updatedItem) => handleItemChange(index, updatedItem)}
          onRemoveItem={() => handleRemoveItem(index)}
          isExpanded={expandedItems.has(index)}
          onToggleExpanded={() => toggleItemExpanded(index)}
        />
      ))}
      
      {onAddItem && (
        <div className="pt-2">
          <Button onClick={onAddItem} variant="outline" size="sm" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      )}
    </div>
  );
};

export default ArrayItemCards;