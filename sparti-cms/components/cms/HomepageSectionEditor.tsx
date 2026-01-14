import React, { useState, useEffect } from 'react';
import { Button } from '../../../src/components/ui/button';
import { Card, CardContent } from '../../../src/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../../src/components/ui/accordion';
import { Input } from '../../../src/components/ui/input';
import { Label } from '../../../src/components/ui/label';
import { Switch } from '../../../src/components/ui/switch';
import { Textarea } from '../../../src/components/ui/textarea';
import { ArrowUp, ArrowDown, Plus, Palette, Image, Type, Trash } from 'lucide-react';
import { componentRegistry } from '../../registry';
import RichTextEditor from './RichTextEditor';
import SectionTabEditor from './SectionTabEditor';
import { toast } from 'sonner';
import { Section } from './types';
import { isDevelopmentTenant } from '../admin/DevelopmentTenantData';
import { developmentSections } from '../admin/DevelopmentTenantSections';
import { useAuth } from '../auth/AuthProvider';

interface HomepageSectionEditorProps {
  onSave?: () => void;
}

const HomepageSectionEditor: React.FC<HomepageSectionEditorProps> = ({ onSave }) => {
  const { currentTenantId } = useAuth();
  const devTenantCtx = { id: currentTenantId || '' };
  
  // Use Development tenant sections if applicable, otherwise use default sections
  const initialSections = isDevelopmentTenant(devTenantCtx) 
    ? developmentSections 
    : [
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
        rotatingAnimationText1: "low traffic",
        rotatingAnimationText2: "stagnant",
        rotatingAnimationText3: "no traffic",
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
      id: 'seo-results-section',
      type: 'seo-results-section',
      title: 'SEO Results Section',
      visible: true,
      data: {
        title: 'Real',
        highlightedText: 'SEO Results',
        subtitle: 'See how we\'ve helped businesses like yours achieve remarkable growth through strategic SEO implementation.',
        results: [
          {
            img: "/src/assets/results/result-1.png",
            label: "+245% Organic Traffic in 6 months"
          },
          {
            img: "/src/assets/results/result-2.png",
            label: "+180% Organic Traffic in 4 months"
          },
          {
            img: "/src/assets/results/result-3.png",
            label: "+320% Organic Traffic in 5 months"
          },
          {
            img: "/src/assets/results/result-4.png",
            label: "+195% Organic Traffic in 3 months"
          },
          {
            img: "/src/assets/results/result-5.png",
            label: "+275% Organic Traffic in 6 months"
          },
          {
            img: "/src/assets/results/result-6.png",
            label: "+160% Organic Traffic in 4 months"
          }
        ],
        ctaButtonText: "Become Our Next Case Study",
        backgroundColor: "bg-gradient-to-b from-background via-secondary/30 to-background"
      }
    },
    {
      id: 'services-showcase-section',
      type: 'services-showcase-section',
      title: 'Services Showcase',
      visible: true,
      data: {
        services: [
          {
            id: "keywords-research",
            title: "Rank on keywords with",
            highlight: "search volume",
            description: "Discover high-volume keywords with precise search data and user intent analysis. Find the perfect keywords to target for maximum organic traffic growth.",
            buttonText: "Learn More",
            images: [
              "/src/assets/seo/keyword-research-1.png",
              "/src/assets/seo/keyword-research-2.png"
            ]
          },
          {
            id: "content-strategy",
            title: "Find topics based on",
            highlight: "real google search results",
            description: "Discover content opportunities by analyzing actual Google search results and user behavior. Get real insights from search data to create content that ranks and converts.",
            buttonText: "View Analytics",
            images: [
              "/src/assets/seo/content-strategy-1.png",
              "/src/assets/seo/content-strategy-2.png"
            ]
          },
          {
            id: "link-building",
            title: "Build authority with",
            highlight: "high-quality backlinks",
            description: "Strengthen your website's authority through strategic link building campaigns. Acquire high-quality backlinks from reputable sources to boost your domain authority and rankings.",
            buttonText: "Try Link Builder",
            images: [
              "/src/assets/seo/link-building-1.png",
              "/src/assets/seo/link-building-2.png"
            ]
          }
        ],
        backgroundColor: "#ffffff"
      }
    },
    {
      id: 'what-is-seo-section',
      type: 'what-is-seo-section',
      title: 'What is SEO Section',
      visible: true,
      data: {
        title: "What is",
        highlightedText: "SEO",
        subtitle: "Search Engine Optimization (SEO) is the practice of optimizing your website to rank higher in search results. Here's how we make it work for your business:",
        services: [
          {
            icon: "Search",
            title: "Keyword Research",
            description: "In-depth analysis to identify high-value keywords that drive qualified traffic to your business."
          },
          {
            icon: "FileText",
            title: "On-Page Optimization",
            description: "Optimize your website content, meta tags, and structure for maximum search engine visibility."
          },
          {
            icon: "Code",
            title: "Technical SEO",
            description: "Fix technical issues, improve site speed, and ensure your website is crawlable by search engines."
          },
          {
            icon: "BarChart3",
            title: "SEO Analytics",
            description: "Track and measure your SEO performance with detailed reporting and actionable insights."
          },
          {
            icon: "Link2",
            title: "Link Building",
            description: "Build high-quality backlinks from authoritative websites to boost your domain authority."
          },
          {
            icon: "Users",
            title: "Local SEO",
            description: "Optimize your business for local search results and Google My Business visibility."
          },
          {
            icon: "TrendingUp",
            title: "Content Strategy",
            description: "Create SEO-optimized content that engages your audience and ranks on search engines."
          },
          {
            icon: "Target",
            title: "Competitor Analysis",
            description: "Analyze your competitors' strategies to identify opportunities and stay ahead."
          }
        ],
        ctaText: "Ready to see how SEO can transform your business?",
        ctaButtonText: "Start Your SEO Partnership",
        backgroundColor: "#ffffff"
      }
    },
    {
      id: 'testimonials-section',
      type: 'testimonials-section',
      title: 'Testimonials',
      visible: true,
      data: {
        sectionTitle: 'What our clients say',
        sectionSubtitle: 'See what our customers have to say about our SEO services and results.',
        testimonials: [
          {
            text: "GoSG's SEO strategies boosted our organic traffic by 400% in just 3 months. Our website now ranks #1 for our main keywords.",
            image: "https://randomuser.me/api/portraits/women/1.jpg",
            name: "Sarah Chen",
            role: "Marketing Director"
          },
          {
            text: "Their technical SEO audit revealed critical issues we didn't know existed. After fixes, our search rankings improved dramatically.",
            image: "https://randomuser.me/api/portraits/men/2.jpg",
            name: "Marcus Tan",
            role: "Business Owner"
          },
          {
            text: "GoSG's local SEO expertise helped us dominate Singapore search results. We're now the top choice in our area.",
            image: "https://randomuser.me/api/portraits/women/3.jpg",
            name: "Priya Sharma",
            role: "E-commerce Manager"
          }
        ],
        backgroundColor: "#f9fafb"
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
        backgroundColor: "bg-gradient-to-br from-gray-50 to-blue-50/30"
      }
    },
    {
      id: 'footer-main',
      type: 'footer-main',
      title: 'Footer',
      visible: true,
      data: {
        ctaHeading: 'Get Your SEO Strategy',
        ctaDescription: 'Ready to dominate search results? Let\'s discuss how we can help your business grow.',
        ctaButtonText: 'Start Your Journey',
        contactLinks: [
          {
            text: 'WhatsApp',
            url: 'https://wa.me/1234567890'
          },
          {
            text: 'Book a Meeting',
            url: 'https://calendly.com'
          }
        ],
        legalLinks: [
          {
            text: 'Privacy Policy',
            url: '/privacy-policy'
          },
          {
            text: 'Terms of Service',
            url: '/terms-of-service'
          },
          {
            text: 'Blog',
            url: '/blog'
          }
        ],
        copyrightText: 'GO SG CONSULTING. All rights reserved.',
        backgroundColor: '#0f172a'
      }
    }
  ];
  
  const [sections, setSections] = useState<Section[]>(initialSections);
  
  // Set default active section
  const [activeSection, setActiveSection] = useState<string>(
    isDevelopmentTenant(devTenantCtx) ? 'hero-section' : 'hero-main'
  );

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
        
        // Special case for image arrays (like in service showcase section)
        if (propertyName === 'images') {
          return (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Image Carousel</Label>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    const currentImages = path.length === 0 
                      ? [...(activeSectionData.data[propertyName] || [])]
                      : [...path.reduce((obj, key) => obj[key], activeSectionData.data)[propertyName] || []];
                    
                    currentImages.push('/placeholder.svg');
                    
                    if (path.length === 0) {
                      updateSectionData(sectionId, propertyName, currentImages);
                    } else {
                      const arrayName = path[0];
                      const index = parseInt(path[1]);
                      updateNestedData(sectionId, arrayName, index, propertyName, currentImages);
                    }
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Image
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {path.length === 0 
                  ? (activeSectionData.data[propertyName] || []).map((img: string, idx: number) => (
                    <div key={idx} className="relative">
                      <div className="aspect-video bg-muted rounded-lg overflow-hidden border border-border">
                        <img 
                          src={img} 
                          alt={`Image ${idx + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                      </div>
                      <div className="absolute top-2 right-2 flex gap-2">
                        <Button 
                          variant="destructive" 
                          size="icon" 
                          className="h-6 w-6 rounded-full"
                          onClick={() => {
                            const currentImages = [...(activeSectionData.data[propertyName] || [])];
                            currentImages.splice(idx, 1);
                            updateSectionData(sectionId, propertyName, currentImages);
                          }}
                        >
                          <Trash className="h-3 w-3" />
                        </Button>
                      </div>
                      <Input
                        value={img}
                        onChange={(e) => {
                          const currentImages = [...(activeSectionData.data[propertyName] || [])];
                          currentImages[idx] = e.target.value;
                          updateSectionData(sectionId, propertyName, currentImages);
                        }}
                        className="mt-2"
                        placeholder="Image URL"
                      />
                    </div>
                  ))
                  : (path.reduce((obj, key) => obj[key], activeSectionData.data)[propertyName] || []).map((img: string, idx: number) => (
                    <div key={idx} className="relative">
                      <div className="aspect-video bg-muted rounded-lg overflow-hidden border border-border">
                        <img 
                          src={img} 
                          alt={`Image ${idx + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                      </div>
                      <div className="absolute top-2 right-2 flex gap-2">
                        <Button 
                          variant="destructive" 
                          size="icon" 
                          className="h-6 w-6 rounded-full"
                          onClick={() => {
                            const arrayName = path[0];
                            const index = parseInt(path[1]);
                            const currentObj = {...path.reduce((obj, key) => obj[key], activeSectionData.data)};
                            const currentImages = [...(currentObj[propertyName] || [])];
                            currentImages.splice(idx, 1);
                            updateNestedData(sectionId, arrayName, index, propertyName, currentImages);
                          }}
                        >
                          <Trash className="h-3 w-3" />
                        </Button>
                      </div>
                      <Input
                        value={img}
                        onChange={(e) => {
                          const arrayName = path[0];
                          const index = parseInt(path[1]);
                          const currentObj = {...path.reduce((obj, key) => obj[key], activeSectionData.data)};
                          const currentImages = [...(currentObj[propertyName] || [])];
                          currentImages[idx] = e.target.value;
                          updateNestedData(sectionId, arrayName, index, propertyName, currentImages);
                        }}
                        className="mt-2"
                        placeholder="Image URL"
                      />
                    </div>
                  ))
                }
              </div>
            </div>
          );
        }
        
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
                <div className="mb-6">
                  <h3 className="text-lg font-medium">{activeSectionData.title}</h3>
                </div>

                {/* Tabbed Section Editor */}
                <div>
                  {/* Import SectionTabEditor at the top of the file */}
                  <SectionTabEditor 
                    section={activeSectionData}
                    onUpdate={(field, value) => updateSectionData(activeSectionData.id, field, value)}
                    onUpdateNestedData={(arrayName, index, field, value) => 
                      updateNestedData(activeSectionData.id, arrayName, index, field, value)
                    }
                  />
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