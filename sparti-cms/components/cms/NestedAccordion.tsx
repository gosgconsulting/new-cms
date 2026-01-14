import React, { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../../src/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '../../../src/components/ui/card';
import { Button } from '../../../src/components/ui/button';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { ComponentSchema, SchemaItem } from '../../types/schema';
import { hasArrayItems, getArrayItemsFromComponent, getComponentTypeDisplayName } from '../../utils/componentHelpers';
import { ArrayItemCards } from './ArrayItemCards';
import { SchemaItemEditor } from './SchemaItemRenderer';

interface NestedAccordionProps {
  component: ComponentSchema;
  componentIndex: number;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onComponentChange: (updatedComponent: ComponentSchema) => void;
  className?: string;
}

export const NestedAccordion: React.FC<NestedAccordionProps> = ({
  component,
  componentIndex,
  isExpanded,
  onToggleExpanded,
  onComponentChange,
  className = ''
}) => {
  const componentDisplayName = getComponentTypeDisplayName(component.type);
  const hasArrays = hasArrayItems(component);
  const arrayItems = hasArrays ? getArrayItemsFromComponent(component) : [];

  // Determine the array type and property name
  const getArrayTypeAndProperty = (): { type: string; property: string } => {
    if (!component.items || component.items.length === 0) {
      return { type: 'generic', property: 'items' };
    }

    const firstItem = component.items[0];
    
    if (firstItem.type === 'carousel' && firstItem.images) {
      return { type: 'carousel', property: 'images' };
    }
    
    if (firstItem.type === 'gallery' && firstItem.value) {
      return { type: 'gallery', property: 'value' };
    }

    // Check for other array properties in all items
    const arrayProperties = [
      { prop: 'testimonials', type: 'testimonials' },
      { prop: 'teamMembers', type: 'teamMembers' },
      { prop: 'faqs', type: 'faqs' },
      { prop: 'slides', type: 'carousel' },
      { prop: 'clientLogos', type: 'clientLogos' },
      { prop: 'ctaButtons', type: 'ctaButtons' },
      { prop: 'items', type: 'generic' }
    ];

    // Check all items, not just the first one
    for (const item of component.items) {
      for (const { prop, type } of arrayProperties) {
        const value = (item as any)?.[prop];
        if (Array.isArray(value) && value.length > 0) {
          return { type, property: prop };
        }
      }
    }

    return { type: 'generic', property: 'items' };
  };

  const { type: arrayType, property: arrayProperty } = getArrayTypeAndProperty();

  const handleArrayItemsChange = (newItems: any[]) => {
    if (!component.items || component.items.length === 0) {
      return;
    }

    const updatedComponent = { ...component };
    const updatedFirstItem = { ...updatedComponent.items[0] };
    
    // Update the appropriate property
    (updatedFirstItem as any)[arrayProperty] = newItems;
    updatedComponent.items[0] = updatedFirstItem;
    
    onComponentChange(updatedComponent);
  };

  const handleArrayItemChange = (index: number, updatedItem: any) => {
    // This is handled by handleArrayItemsChange
  };

  const handleAddArrayItem = () => {
    const newItem = createNewArrayItem(arrayType);
    const currentItems = arrayItems || [];
    handleArrayItemsChange([...currentItems, newItem]);
  };

  const createNewArrayItem = (type: string): any => {
    switch (type) {
      case 'carousel':
      case 'gallery':
        return {
          id: `img-${Date.now()}`,
          src: '',
          alt: '',
          caption: ''
        };
      
      case 'testimonials':
        return {
          name: '',
          text: '',
          role: '',
          company: '',
          image: ''
        };
      
      case 'teamMembers':
        return {
          name: '',
          role: '',
          bio: '',
          image: ''
        };
      
      case 'faqs':
        return {
          question: '',
          answer: ''
        };
      
      default:
        return {
          title: '',
          description: ''
        };
    }
  };


  const renderArrayCards = () => {
    return (
      <div className="space-y-4">
        {/* Show any non-array fields first */}
        {component.items && component.items.length > 0 && (
          <div className="space-y-3">
            {component.items.map((item, index) => {
              // Skip the item that contains the array
              const isArrayContainer = arrayType === 'carousel' && item.type === 'carousel' ||
                                    arrayType === 'gallery' && item.type === 'gallery' ||
                                    (item as any)[arrayProperty] && Array.isArray((item as any)[arrayProperty]);
              
              if (isArrayContainer) {
                return null;
              }

              return (
                <SchemaItemEditor
                  key={`${item.key}-${index}`}
                  item={item}
                  onChange={(updatedItem) => {
                    const updatedComponent = { ...component };
                    const updatedItems = [...updatedComponent.items];
                    updatedItems[index] = updatedItem;
                    updatedComponent.items = updatedItems;
                    onComponentChange(updatedComponent);
                  }}
                  path={[componentIndex, index]}
                />
              );
            })}
          </div>
        )}

        {/* Show array items as cards */}
        <div className="border-t pt-4">
          <div className="mb-3">
            <h4 className="text-sm font-medium text-muted-foreground">
              {arrayType === 'carousel' ? 'Slides' : 
               arrayType === 'gallery' ? 'Images' :
               arrayType === 'testimonials' ? 'Testimonials' :
               arrayType === 'teamMembers' ? 'Team Members' :
               arrayType === 'faqs' ? 'FAQ Items' :
               arrayType === 'clientLogos' ? 'Client Logos' :
               arrayType === 'ctaButtons' ? 'CTA Buttons' : 'Items'}
            </h4>
          </div>
          
          <ArrayItemCards
            items={arrayItems}
            itemType={arrayType}
            onItemsChange={handleArrayItemsChange}
            onItemChange={handleArrayItemChange}
            onAddItem={handleAddArrayItem}
          />
        </div>
      </div>
    );
  };

  return (
    <Card className={`mb-3 ${className}`}>
      <CardHeader 
        className="cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={onToggleExpanded}
      >
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            <span>{componentDisplayName}</span>
            {hasArrays && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                {arrayItems.length} {arrayItems.length === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          {renderArrayCards()}
        </CardContent>
      )}
    </Card>
  );
};

export default NestedAccordion;