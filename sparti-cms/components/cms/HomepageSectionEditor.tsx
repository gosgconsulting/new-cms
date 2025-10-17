import React, { useState, useEffect } from 'react';
import { Button } from '../../../src/components/ui/button';
import { Card, CardContent } from '../../../src/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../../src/components/ui/accordion';
import { Input } from '../../../src/components/ui/input';
import { Label } from '../../../src/components/ui/label';
import { Switch } from '../../../src/components/ui/switch';
import { Textarea } from '../../../src/components/ui/textarea';
import { ArrowUp, ArrowDown, Eye, Trash, Plus, Palette, Image, Type } from 'lucide-react';
import { componentRegistry } from '../../registry';
import RichTextEditor from './RichTextEditor';
import { toast } from 'sonner';

interface HomepageSectionEditorProps {
  onSave?: () => void;
}

interface Section {
  id: string;
  type: string;
  title: string;
  visible: boolean;
  data: Record<string, any>;
}

const HomepageSectionEditor: React.FC<HomepageSectionEditorProps> = ({ onSave }) => {
  // Default sections for the homepage - using IDs that match the registry
  const [sections, setSections] = useState<Section[]>([
    {
      id: 'header-main',
      type: 'header-main',
      title: 'Header',
      visible: true,
      data: {
        logo: {
          src: '/assets/go-sg-logo-official.png',
          alt: 'GO SG Digital Marketing Agency'
        },
        ctaText: 'Contact Us',
        showCTA: true,
        isFixed: true
      }
    },
    {
      id: 'hero-main',
      type: 'hero-main',
      title: 'Hero Section',
      visible: true,
      data: {
        badgeText: 'Results in 3 months or less',
        showBadge: true,
        headingLine1: 'We Boost Your SEO',
        headingLine2: 'In 3 Months',
        description: '<p>We help businesses dominate search results through proven SEO strategies that increase organic traffic, boost rankings, and drive qualified leads to your website.</p>',
        ctaButtonText: 'Get a Quote',
        showClientLogos: true,
        backgroundType: 'gradient',
        gradientStart: '#f8f9fa',
        gradientEnd: '#e9ecef'
      }
    },
    {
      id: 'pain-point-section',
      type: 'pain-point-section',
      title: 'Pain Points Section',
      visible: true,
      data: {
        badgeText: 'You have a website but it\'s not generating clicks?',
        headingLine1: 'You Invest... But',
        headingLine2: 'Nothing Happens?',
        painPoints: [
          {
            title: 'Organic traffic stuck at 0',
            icon: 'x'
          },
          {
            title: 'No clicks, no leads, no sales',
            icon: 'mouse-pointer-click'
          },
          {
            title: 'Competitors ranking above you',
            icon: 'bar-chart-3'
          }
        ],
        backgroundType: 'gradient',
        backgroundColor: '#0f172a'
      }
    },
    {
      id: 'services-showcase-section',
      type: 'services-showcase-section',
      title: 'Services Showcase',
      visible: true,
      data: {
        sectionTitle: 'Our SEO Services',
        sectionSubtitle: 'Comprehensive SEO solutions',
        sectionDescription: '<p>We offer a comprehensive range of SEO services designed to improve your online visibility, drive more traffic, and increase conversions.</p>',
        services: [
          {
            title: 'Keyword Research',
            description: '<p>We identify the most valuable keywords for your business to target based on search volume, competition, and relevance to your offerings.</p>',
            icon: 'search'
          },
          {
            title: 'On-Page Optimization',
            description: '<p>We optimize your website\'s content, meta tags, and structure to make it more appealing to search engines and users.</p>',
            icon: 'file-text'
          }
        ],
        backgroundType: 'color',
        backgroundColor: '#ffffff'
      }
    },
    {
      id: 'testimonials-section',
      type: 'testimonials-section',
      title: 'Testimonials',
      visible: true,
      data: {
        sectionTitle: 'What Our Clients Say',
        sectionSubtitle: 'Success stories from businesses like yours',
        testimonials: [
          {
            name: 'John Smith',
            company: 'ABC Company',
            quote: 'GO SG helped us increase our organic traffic by 200% in just 3 months. Highly recommended!',
            image: '/placeholder.svg'
          },
          {
            name: 'Jane Doe',
            company: 'XYZ Inc',
            quote: 'Their SEO strategies have transformed our online presence. We\'re now ranking on the first page for our target keywords.',
            image: '/placeholder.svg'
          }
        ]
      }
    },
    {
      id: 'faq-section',
      type: 'faq-section',
      title: 'FAQ Section',
      visible: true,
      data: {
        title: 'Frequently Asked Questions',
        subtitle: 'Everything you need to know about our SEO services',
        items: [
          {
            question: 'How long does it take to see results?',
            answer: '<p>Most clients see significant improvements within 3 months, though some competitive keywords may take longer.</p>'
          },
          {
            question: 'What services are included?',
            answer: '<p>Our SEO packages include keyword research, on-page optimization, content creation, link building, and monthly reporting.</p>'
          }
        ]
      }
    },
    {
      id: 'blog-preview-section',
      type: 'blog-preview-section',
      title: 'Blog Section',
      visible: true,
      data: {
        title: 'Latest SEO Insights',
        subtitle: 'Stay ahead of the curve with our expert SEO tips, strategies, and industry insights.',
        ctaButtonText: 'Get SEO Consultation'
      }
    },
    {
      id: 'footer-main',
      type: 'footer-main',
      title: 'Footer',
      visible: true,
      data: {
        companyName: 'GO SG Consulting',
        copyrightText: '© 2025 GO SG Consulting. All rights reserved.',
        showSocialLinks: true,
        socialLinks: [
          { platform: 'facebook', url: 'https://facebook.com' },
          { platform: 'twitter', url: 'https://twitter.com' },
          { platform: 'linkedin', url: 'https://linkedin.com' }
        ],
        footerLinks: [
          { label: 'Privacy Policy', url: '/privacy-policy' },
          { label: 'Terms of Service', url: '/terms-of-service' }
        ]
      }
    }
  ]);

  const [activeSection, setActiveSection] = useState<string>('hero');

  // Get component schemas from registry
  const getComponentSchema = (type: string) => {
    // Try to get component directly by type
    let component = componentRegistry.get(type);
    
    if (!component) {
      // If not found, try to search by name or similar ID
      const components = componentRegistry.getAll();
      const matchingComponent = components.find(c => 
        c.id.includes(type) || 
        type.includes(c.id) || 
        c.name.toLowerCase().includes(type.toLowerCase())
      );
      
      if (matchingComponent) {
        console.log(`Found similar component for ${type}: ${matchingComponent.id}`);
        component = matchingComponent;
      } else {
        console.warn(`Component schema not found for type: ${type}`);
      }
    }
    
    return component;
  };
  
  // Get all available components that can be added to the page
  const getAvailableComponents = () => {
    return componentRegistry.getAll().filter(comp => 
      comp.category === 'content' || comp.category === 'layout'
    );
  };
  
  // Load components from registry on mount
  useEffect(() => {
    // Get all available components from registry
    const registryComponents = componentRegistry.getAll();
    
    // Check if we need to update sections based on registry
    const shouldUpdateSections = sections.some(section => {
      const registryComponent = componentRegistry.get(section.type);
      return !registryComponent; // If component not found in registry, we should update
    });
    
    if (shouldUpdateSections) {
      console.log('Updating sections from component registry');
      
      // Map existing section types to registry component IDs
      const updatedSections = sections.map(section => {
        // Try to find matching component in registry
        let registryComponent = componentRegistry.get(section.type);
        
        // If not found directly, try to find by name or similar ID
        if (!registryComponent) {
          // Try to find by similar name
          const similarComponents = componentRegistry.search(section.title);
          if (similarComponents.length > 0) {
            registryComponent = similarComponents[0];
            console.log(`Found similar component for ${section.title}: ${registryComponent.id}`);
          }
        }
        
        // If found a matching component, update the section type
        if (registryComponent) {
          return {
            ...section,
            type: registryComponent.id
          };
        }
        
        return section;
      });
      
      setSections(updatedSections);
    }
  }, []);

  // Handle section reordering
  const moveSection = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === sections.length - 1)
    ) {
      return;
    }

    const newSections = [...sections];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const sectionToMove = newSections[index];
    newSections.splice(index, 1);
    newSections.splice(newIndex, 0, sectionToMove);
    setSections(newSections);
  };

  // Handle section visibility toggle
  const toggleSectionVisibility = (index: number) => {
    const newSections = [...sections];
    newSections[index].visible = !newSections[index].visible;
    setSections(newSections);
  };

  // Handle section deletion
  const deleteSection = (index: number) => {
    const newSections = [...sections];
    newSections.splice(index, 1);
    setSections(newSections);
  };
  
  // Add a new section from the registry
  const addSectionFromRegistry = (componentId: string) => {
    const component = componentRegistry.get(componentId);
    
    if (!component) {
      console.error(`Component with ID ${componentId} not found in registry`);
      toast.error(`Component not found in registry`);
      return;
    }
    
    // Create default data object from component properties
    const defaultData = Object.entries(component.properties).reduce((acc, [key, prop]) => {
      acc[key] = prop.default;
      return acc;
    }, {} as Record<string, any>);
    
    // Create new section
    const newSection: Section = {
      id: component.id,
      type: component.id,
      title: component.name,
      visible: true,
      data: defaultData
    };
    
    // Add to sections
    setSections([...sections, newSection]);
    
    // Set as active section
    setActiveSection(component.id);
    
    toast.success(`Added ${component.name} section`);
  };

  // Handle section data update
  const updateSectionData = (sectionId: string, field: string, value: any) => {
    setSections(prevSections => 
      prevSections.map(section => 
        section.id === sectionId 
          ? { ...section, data: { ...section.data, [field]: value } } 
          : section
      )
    );
  };

  // Handle nested data update
  const updateNestedData = (sectionId: string, arrayName: string, index: number, field: string, value: any) => {
    setSections(prevSections => 
      prevSections.map(section => {
        if (section.id === sectionId) {
          const updatedArray = [...section.data[arrayName]];
          updatedArray[index] = { ...updatedArray[index], [field]: value };
          return { ...section, data: { ...section.data, [arrayName]: updatedArray } };
        }
        return section;
      })
    );
  };

  // Add a new item to an array in section data
  const addArrayItem = (sectionId: string, arrayName: string, defaultItem: any) => {
    setSections(prevSections => 
      prevSections.map(section => {
        if (section.id === sectionId) {
          const updatedArray = [...(section.data[arrayName] || []), defaultItem];
          return { ...section, data: { ...section.data, [arrayName]: updatedArray } };
        }
        return section;
      })
    );
  };

  // Remove an item from an array in section data
  const removeArrayItem = (sectionId: string, arrayName: string, index: number) => {
    setSections(prevSections => 
      prevSections.map(section => {
        if (section.id === sectionId) {
          const updatedArray = [...section.data[arrayName]];
          updatedArray.splice(index, 1);
          return { ...section, data: { ...section.data, [arrayName]: updatedArray } };
        }
        return section;
      })
    );
  };

  // Handle save
  const handleSave = () => {
    // In a real implementation, save to database
    console.log('Saving homepage sections:', sections);
    toast.success('Homepage sections saved successfully');
    if (onSave) onSave();
  };

  // Get the active section
  const activeSectionData = sections.find(section => section.id === activeSection);
  const activeSectionSchema = activeSectionData ? getComponentSchema(activeSectionData.type) : null;
  
  // Log warning if schema not found
  useEffect(() => {
    if (activeSectionData && !activeSectionSchema) {
      console.warn(`Component schema not found for section type: ${activeSectionData.type}`);
    }
  }, [activeSectionData, activeSectionSchema]);

  // Render editor for different property types
  const renderPropertyEditor = (property: any, propertyName: string, sectionId: string, path: string[] = []) => {
    const currentValue = path.length === 0 
      ? activeSectionData?.data[propertyName] 
      : path.reduce((obj, key, i) => {
          if (i === path.length - 1) {
            return obj[key][propertyName];
          }
          return obj[key];
        }, activeSectionData?.data);

    switch (property.type) {
      case 'string':
        if (propertyName.toLowerCase().includes('description') && property.default?.startsWith('<')) {
          // Rich text editor for HTML content
          return (
            <div className="space-y-2">
              <Label>{property.description}</Label>
              <RichTextEditor
                content={currentValue || ''}
                onChange={(value) => {
                  if (path.length === 0) {
                    updateSectionData(sectionId, propertyName, value);
                  } else {
                    // Handle nested updates
                    const arrayName = path[0];
                    const index = parseInt(path[1]);
                    updateNestedData(sectionId, arrayName, index, propertyName, value);
                  }
                }}
              />
            </div>
          );
        }
        
        // Design properties are disabled - skip color, gradient, background type, and direction fields
        if (propertyName.toLowerCase().includes('color') || 
            propertyName.toLowerCase().includes('gradient') ||
            propertyName.toLowerCase().includes('backgroundtype') ||
            (propertyName.toLowerCase().includes('direction') && 
             (property.description?.toLowerCase().includes('gradient') || 
              property.description?.toLowerCase().includes('background')))) {
          return null;
        }
        
        if (propertyName.toLowerCase().includes('image') || propertyName.toLowerCase().includes('src')) {
          // Image URL input
          return (
            <div className="space-y-2">
              <Label>{property.description}</Label>
              <div className="flex gap-2">
                <Input
                  value={currentValue || ''}
                  onChange={(e) => {
                    if (path.length === 0) {
                      updateSectionData(sectionId, propertyName, e.target.value);
                    } else {
                      const arrayName = path[0];
                      const index = parseInt(path[1]);
                      updateNestedData(sectionId, arrayName, index, propertyName, e.target.value);
                    }
                  }}
                  placeholder="Image URL"
                />
                <Button variant="outline" size="icon">
                  <Image className="h-4 w-4" />
                </Button>
              </div>
              {currentValue && (
                <div className="mt-2 border rounded p-2">
                  <img 
                    src={currentValue} 
                    alt="Preview" 
                    className="max-h-24 mx-auto"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          );
        }
        
        // Default string input
        return (
          <div className="space-y-2">
            <Label>{property.description}</Label>
            <Input
              value={currentValue || ''}
              onChange={(e) => {
                if (path.length === 0) {
                  updateSectionData(sectionId, propertyName, e.target.value);
                } else {
                  const arrayName = path[0];
                  const index = parseInt(path[1]);
                  updateNestedData(sectionId, arrayName, index, propertyName, e.target.value);
                }
              }}
              placeholder={property.default || ''}
            />
          </div>
        );
        
      case 'boolean':
        return (
          <div className="flex items-center justify-between">
            <Label>{property.description}</Label>
            <Switch
              checked={currentValue || false}
              onCheckedChange={(checked) => {
                if (path.length === 0) {
                  updateSectionData(sectionId, propertyName, checked);
                } else {
                  const arrayName = path[0];
                  const index = parseInt(path[1]);
                  updateNestedData(sectionId, arrayName, index, propertyName, checked);
                }
              }}
            />
          </div>
        );
        
      case 'number':
        return (
          <div className="space-y-2">
            <Label>{property.description}</Label>
            <Input
              type="number"
              value={currentValue || 0}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                if (path.length === 0) {
                  updateSectionData(sectionId, propertyName, value);
                } else {
                  const arrayName = path[0];
                  const index = parseInt(path[1]);
                  updateNestedData(sectionId, arrayName, index, propertyName, value);
                }
              }}
            />
          </div>
        );
        
      case 'array':
        if (!activeSectionData) return null;
        
        const arrayItems = activeSectionData.data[propertyName] || [];
        let defaultItem = {};
        
        // Try to determine the structure of array items
        if (property.default && property.default.length > 0) {
          defaultItem = { ...property.default[0] };
        } else if (arrayItems.length > 0) {
          defaultItem = { ...arrayItems[0] };
          // Clear values but keep structure
          Object.keys(defaultItem).forEach(key => {
            if (typeof defaultItem[key] === 'string') defaultItem[key] = '';
            else if (typeof defaultItem[key] === 'number') defaultItem[key] = 0;
            else if (typeof defaultItem[key] === 'boolean') defaultItem[key] = false;
          });
        }
        
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>{property.description}</Label>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => addArrayItem(sectionId, propertyName, defaultItem)}
              >
                <Plus className="h-4 w-4 mr-1" /> Add Item
              </Button>
            </div>
            
            <Accordion type="multiple" className="w-full">
              {arrayItems.map((item: any, index: number) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="hover:bg-secondary/20 px-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {item.title || item.name || item.label || `Item ${index + 1}`}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 bg-secondary/10 rounded-lg mt-2">
                    <div className="space-y-4">
                      {Object.entries(item).map(([key, value]) => {
                        // Create a mock property for the item field
                        const itemProperty = {
                          type: typeof value,
                          description: key.charAt(0).toUpperCase() + key.slice(1),
                          default: value
                        };
                        
                        return (
                          <div key={key} className="ml-2">
                            {renderPropertyEditor(
                              itemProperty, 
                              key, 
                              sectionId, 
                              [propertyName, index.toString()]
                            )}
                          </div>
                        );
                      })}
                      
                      <div className="flex justify-end">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeArrayItem(sectionId, propertyName, index)}
                        >
                          <Trash className="h-4 w-4 mr-1" /> Remove
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            
            {arrayItems.length === 0 && (
              <div className="text-center p-4 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">No items added yet</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => addArrayItem(sectionId, propertyName, defaultItem)}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add First Item
                </Button>
              </div>
            )}
          </div>
        );
        
      default:
        return (
          <div className="text-muted-foreground">
            Unsupported property type: {property.type}
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Sections List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Sections</h3>
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-secondary/20 p-3 border-b flex justify-between items-center">
              <p className="text-sm font-medium">Arrange and Configure Sections</p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const availableComponents = getAvailableComponents();
                  // For simplicity, we'll just add the first available component
                  // In a real implementation, you'd show a dropdown or modal to select
                  if (availableComponents.length > 0) {
                    const randomIndex = Math.floor(Math.random() * availableComponents.length);
                    const componentToAdd = availableComponents[randomIndex];
                    addSectionFromRegistry(componentToAdd.id);
                  } else {
                    toast.error("No components available to add");
                  }
                }}
              >
                <Plus className="h-4 w-4 mr-1" /> Add Section
              </Button>
            </div>
            <div className="divide-y">
              {sections.map((section, index) => (
                <div 
                  key={section.id}
                  className={`p-3 flex items-center justify-between hover:bg-secondary/10 cursor-pointer ${
                    activeSection === section.id ? 'bg-secondary/20' : ''
                  }`}
                  onClick={() => setActiveSection(section.id)}
                >
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${section.visible ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span>{section.title}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); moveSection(index, 'up'); }}>
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); moveSection(index, 'down'); }}>
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section Editor */}
        <div className="md:col-span-2">
          {activeSectionData ? (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium">{activeSectionData.title}</h3>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => toggleSectionVisibility(
                        sections.findIndex(s => s.id === activeSectionData.id)
                      )}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      {activeSectionData.visible ? 'Hide' : 'Show'}
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => {
                        const index = sections.findIndex(s => s.id === activeSectionData.id);
                        deleteSection(index);
                        if (sections.length > 1) {
                          setActiveSection(sections[Math.max(0, index - 1)].id);
                        }
                      }}
                    >
                      <Trash className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>

                {/* All Properties */}
                <div className="space-y-6">
                  {activeSectionSchema ? (
                    Object.entries(activeSectionSchema.properties).map(([key, prop]) => (
                      <div key={key}>
                        {renderPropertyEditor(prop, key, activeSectionData.id)}
                      </div>
                    ))
                  ) : (
                    <div className="p-6 border-2 border-dashed rounded-lg text-center">
                      <p className="text-muted-foreground">
                        Component schema not found for this section. Using fallback editor.
                      </p>
                      {/* Fallback editor for data properties */}
                      {activeSectionData && Object.entries(activeSectionData.data).map(([key, value]) => {
                        // Create a mock property based on value type
                        const mockProp = {
                          type: typeof value === 'object' ? 'object' : typeof value,
                          description: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
                          editable: true,
                          default: value
                        };
                        
                        return (
                          <div key={key} className="mt-4">
                            {renderPropertyEditor(mockProp, key, activeSectionData.id)}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <p className="text-muted-foreground">Select a section to edit</p>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave}>
          Save Homepage Sections
        </Button>
      </div>
    </div>
  );
};

export default HomepageSectionEditor;
