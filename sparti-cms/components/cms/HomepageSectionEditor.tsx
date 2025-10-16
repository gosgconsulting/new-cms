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
  // Default sections for the homepage
  const [sections, setSections] = useState<Section[]>([
    {
      id: 'header',
      type: 'header-main',
      title: 'Header',
      visible: true,
      data: {
        logoUrl: '/assets/go-sg-logo-official.png',
        showContactButton: true,
        contactButtonText: 'Contact Us',
        navigationItems: [
          { label: 'Home', url: '/' },
          { label: 'Services', url: '/services' },
          { label: 'About', url: '/about' },
          { label: 'Blog', url: '/blog' }
        ]
      }
    },
    {
      id: 'hero',
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
      id: 'pain-points',
      type: 'pain-point-section',
      title: 'Pain Points Section',
      visible: true,
      data: {
        sectionTitle: 'Common SEO Challenges',
        sectionSubtitle: 'Problems we solve for businesses',
        sectionDescription: '<p>Many businesses struggle with these common SEO challenges. Our solutions are designed to address these pain points effectively.</p>',
        painPoints: [
          {
            title: 'Low Website Traffic',
            description: '<p>Your website isn\'t getting enough visitors, leading to missed opportunities and lower conversion rates.</p>',
            icon: 'trending-down'
          },
          {
            title: 'Poor Search Rankings',
            description: '<p>Your website doesn\'t appear on the first page of search results for important keywords in your industry.</p>',
            icon: 'search'
          }
        ],
        backgroundColor: '#f8f9fa'
      }
    },
    {
      id: 'services',
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
      id: 'testimonials',
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
      id: 'faq',
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
      id: 'blog',
      type: 'blog-preview-section',
      title: 'Blog Section',
      visible: true,
      data: {
        sectionTitle: 'Latest from Our Blog',
        sectionSubtitle: 'SEO tips and insights',
        showPostCount: 3
      }
    },
    {
      id: 'footer',
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
    return componentRegistry.get(type);
  };

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
        
        if (propertyName.toLowerCase().includes('color') || propertyName.toLowerCase().includes('gradient')) {
          // Color picker
          return (
            <div className="space-y-2">
              <Label>{property.description}</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={currentValue || '#ffffff'}
                  onChange={(e) => {
                    if (path.length === 0) {
                      updateSectionData(sectionId, propertyName, e.target.value);
                    } else {
                      const arrayName = path[0];
                      const index = parseInt(path[1]);
                      updateNestedData(sectionId, arrayName, index, propertyName, e.target.value);
                    }
                  }}
                  className="w-10 h-10 rounded border"
                />
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
            </div>
          );
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
            <div className="bg-secondary/20 p-3 border-b">
              <p className="text-sm font-medium">Arrange and Configure Sections</p>
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
                    <Button variant="ghost" size="icon" onClick={() => moveSection(index, 'up')}>
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => moveSection(index, 'down')}>
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
                  {activeSectionSchema && Object.entries(activeSectionSchema.properties).map(([key, prop]) => (
                    <div key={key}>
                      {renderPropertyEditor(prop, key, activeSectionData.id)}
                    </div>
                  ))}
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
