import React, { useState, useMemo } from 'react';
import { Search, Layers, Eye, FileJson, X, ArrowRight } from 'lucide-react';
import { componentRegistry } from '../../registry';
import { ComponentDefinition } from '../../registry/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

// Import actual homepage components for preview
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import PainPointSection from '@/components/PainPointSection';
import SEOResultsSection from '@/components/SEOResultsSection';
import SEOServicesShowcase from '@/components/SEOServicesShowcase';
import WhatIsSEOServicesSection from '@/components/WhatIsSEOServicesSection';
import NewTestimonials from '@/components/NewTestimonials';
import FAQAccordion from '@/components/FAQAccordion';
import BlogSection from '@/components/BlogSection';
import WhatsAppButton from '@/components/WhatsAppButton';
import ContactModal from '@/components/ContactModal';

const ComponentsManager: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewComponent, setPreviewComponent] = useState<ComponentDefinition | null>(null);
  const [schemaComponent, setSchemaComponent] = useState<ComponentDefinition | null>(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  const allComponents = componentRegistry.getAll();

  // Get unique categories with counts
  const categories = useMemo(() => {
    const categoryMap = new Map<string, number>();
    
    allComponents.forEach(comp => {
      const category = comp.category || 'other';
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    });

    return [
      { id: 'all', label: 'All Components', count: allComponents.length },
      ...Array.from(categoryMap.entries()).map(([id, count]) => ({
        id,
        label: id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        count
      }))
    ];
  }, [allComponents]);

  // Filter components
  const filteredComponents = useMemo(() => {
    let filtered = allComponents;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(comp => comp.category === selectedCategory);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(comp => 
        comp.name.toLowerCase().includes(query) ||
        comp.description.toLowerCase().includes(query) ||
        comp.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [allComponents, selectedCategory, searchQuery]);

  // Component preview renderer
  const renderComponentPreview = (componentId: string) => {
    switch (componentId) {
      case 'header-main':
        return (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <Header onContactClick={() => setContactModalOpen(true)} />
          </div>
        );
      case 'footer-main':
        return (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <Footer onContactClick={() => setContactModalOpen(true)} />
          </div>
        );
      case 'hero-main':
        return (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <HeroSection onContactClick={() => setContactModalOpen(true)} />
          </div>
        );
      case 'pain-point-section':
        return (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <PainPointSection />
          </div>
        );
      case 'seo-results-section':
        return (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <SEOResultsSection />
          </div>
        );
      case 'services-showcase-section':
        return (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <SEOServicesShowcase onContactClick={() => setContactModalOpen(true)} />
          </div>
        );
      case 'what-is-seo-section':
        return (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <WhatIsSEOServicesSection onContactClick={() => setContactModalOpen(true)} />
          </div>
        );
      case 'testimonials-section':
        return (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <NewTestimonials />
          </div>
        );
      case 'faq-section':
        return (
          <div className="bg-white rounded-xl shadow-md overflow-hidden p-8">
            <FAQAccordion 
              title="Frequently Asked Questions"
              subtitle="Everything you need to know about our SEO services"
              items={[
                {
                  question: "How do backlinks help my website's SEO?",
                  answer: "Backlinks are crucial for building your website's authority and trust. When reputable websites link to yours, search engines view it as a vote of confidence. This increases your Domain Rating (DR) and Domain Authority (DA), which are key metrics that Google uses to determine your site's credibility. Higher authority means better rankings, more visibility, and increased organic traffic to your website."
                },
                {
                  question: "Why are blog posts important for SEO?",
                  answer: "Blog posts are essential for SEO because they provide fresh, relevant content that search engines love. Regular blogging helps you target long-tail keywords, answer customer questions, and establish your expertise in your industry. Each blog post is a new opportunity to rank for different search terms, attract backlinks, and engage your audience. Quality blog content also increases time-on-site and reduces bounce rates, which are positive ranking signals for search engines."
                },
                {
                  question: "How much do your SEO services cost?",
                  answer: "Our SEO services start from just 600 SGD per month, making professional SEO accessible for businesses of all sizes. This includes comprehensive keyword research, on-page optimization, quality backlink building, regular blog content creation, and detailed monthly reporting. We offer flexible packages tailored to your specific needs and goals, ensuring you get the best ROI for your investment."
                }
              ]}
            />
          </div>
        );
      case 'blog-preview-section':
        return (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <BlogSection onContactClick={() => setContactModalOpen(true)} />
          </div>
        );
      case 'whatsapp-button':
        return (
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-md p-16 text-center">
            <div className="relative inline-block">
              <WhatsAppButton />
            </div>
            <p className="text-sm font-medium text-gray-700 mt-8">Floating WhatsApp button (bottom-right on live site)</p>
          </div>
        );
      case 'contact-modal':
        return (
          <div className="bg-white rounded-xl shadow-md overflow-hidden p-8">
            <div className="max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Contact Form Modal</h2>
              <p className="text-gray-600 text-center mb-4">This modal appears when users click "Contact Us" buttons</p>
              <button 
                onClick={() => setContactModalOpen(true)}
                className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-full font-medium transition-colors"
              >
                Preview Contact Modal
              </button>
            </div>
          </div>
        );
      case 'client-logos-carousel':
        return (
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Client Logos Carousel</h3>
              <p className="text-gray-600">Animated carousel showcasing client logos and testimonials</p>
            </div>
            
            {/* Preview of client logos */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-center gap-8 overflow-hidden">
                <div className="flex items-center gap-6 opacity-60">
                  <div className="w-16 h-8 bg-gray-300 rounded flex items-center justify-center">
                    <span className="text-xs text-gray-600">Logo</span>
                  </div>
                  <div className="w-20 h-8 bg-gray-300 rounded flex items-center justify-center">
                    <span className="text-xs text-gray-600">Logo</span>
                  </div>
                  <div className="w-14 h-8 bg-gray-300 rounded flex items-center justify-center">
                    <span className="text-xs text-gray-600">Logo</span>
                  </div>
                  <div className="w-18 h-8 bg-gray-300 rounded flex items-center justify-center">
                    <span className="text-xs text-gray-600">Logo</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Animation Speed:</span>
                <span className="text-gray-900 font-medium">30s loop</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Interaction:</span>
                <span className="text-gray-900 font-medium">Pause on hover, draggable</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total Logos:</span>
                <span className="text-gray-900 font-medium">8 client logos</span>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-64 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500">No preview available for this component</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-full bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-white/80 backdrop-blur-md shadow-md border-r border-border flex-shrink-0">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Layers className="h-6 w-6 text-brandPurple" />
            <h2 className="text-xl font-bold text-foreground">Components</h2>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search components..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brandPurple focus:border-transparent"
            />
          </div>

          {/* Categories */}
          <div className="space-y-1">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-secondary text-foreground font-medium shadow-sm'
                    : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Layers className={`h-4 w-4 ${selectedCategory === category.id ? 'text-brandPurple' : ''}`} />
                  <span className="text-sm">{category.label}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  selectedCategory === category.id
                    ? 'bg-brandPurple/10 text-brandPurple'
                    : 'bg-secondary text-muted-foreground'
                }`}>
                  {category.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gradient-to-br from-background via-secondary/10 to-background relative">
        {/* Diagonal gradient accents */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-brandPurple/5 to-transparent blur-3xl rotate-45 -z-10"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-gradient-to-tl from-brandTeal/5 to-transparent blur-3xl -rotate-45 -z-10"></div>
        
        <div className="p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {selectedCategory === 'all' 
                ? 'All Components' 
                : categories.find(c => c.id === selectedCategory)?.label || 'Components'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {filteredComponents.length} component{filteredComponents.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {/* Components List */}
          <div className="space-y-4">
            {filteredComponents.map((component) => (
              <motion.div
                key={component.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg border border-border overflow-hidden hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center p-6">
                  {/* Component Icon/Preview */}
                  <div className="w-24 h-24 bg-secondary/20 rounded-lg flex items-center justify-center border border-border flex-shrink-0">
                    <div className="text-center">
                      <div className="text-3xl text-muted-foreground mb-1">
                        {component.type === 'text' ? 'T' : 
                         component.type === 'button' ? 'B' : 
                         component.type === 'image' ? 'I' : 
                         component.type === 'container' ? 'C' : 'T'}
                      </div>
                    </div>
                  </div>

                  {/* Component Info */}
                  <div className="flex-1 ml-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-foreground mb-2">
                          {component.name}
                        </h3>
                        
                        <div className="flex items-center gap-3 mb-3">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary/50 text-foreground">
                            {component.category || 'other'}
                          </span>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-brandTeal/10 text-brandTeal">
                            {component.type}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            v{component.version}
                          </span>
                        </div>

                        {component.description && (
                          <p className="text-sm text-muted-foreground mb-4">
                            {component.description}
                          </p>
                        )}

                        {component.tags && component.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {component.tags.map((tag, idx) => (
                              <span key={idx} className="text-xs px-2 py-1 bg-secondary/30 text-muted-foreground rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 ml-6">
                        <Button
                          onClick={() => setPreviewComponent(component)}
                          variant="outline"
                          className="flex items-center gap-2 border-brandPurple/30 text-brandPurple hover:bg-brandPurple/10"
                        >
                          <Eye className="h-4 w-4" />
                          Preview
                        </Button>
                        <Button
                          onClick={() => setSchemaComponent(component)}
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <FileJson className="h-4 w-4" />
                          Schema
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredComponents.length === 0 && (
            <div className="text-center py-12">
              <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No components found</h3>
              <p className="text-muted-foreground">
                {searchQuery 
                  ? 'Try adjusting your search query' 
                  : 'No components available in this category'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Component Preview Modal - Full Screen */}
      <Dialog open={previewComponent !== null} onOpenChange={() => setPreviewComponent(null)}>
        <DialogContent className="max-w-full max-h-full w-screen h-screen p-0 overflow-hidden border-border bg-white/95 backdrop-blur-md">
          <AnimatePresence>
            {previewComponent && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="relative h-full flex flex-col"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-brandPurple to-brandTeal p-6 text-white">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-white flex items-center">
                      <span className="mr-2">Component Preview:</span> {previewComponent.name}
                    </DialogTitle>
                    <DialogDescription className="text-white/80 mt-2">
                      {previewComponent.description}
                    </DialogDescription>
                  </DialogHeader>
                </div>
                
                {/* Preview Area - Flex-grow to take available space */}
                <div className="flex-grow p-6 overflow-auto">
                  <div className="bg-white rounded-lg border border-border shadow-sm overflow-hidden h-full">
                    {renderComponentPreview(previewComponent.id)}
                  </div>
                </div>
                
                {/* Footer */}
                <div className="border-t border-border p-6 bg-secondary/20 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="px-3 py-1.5 rounded-full bg-white shadow-sm text-sm">
                      <span className="text-muted-foreground">Type:</span> <span className="font-medium text-foreground">{previewComponent.type}</span>
                    </div>
                    <div className="px-3 py-1.5 rounded-full bg-white shadow-sm text-sm">
                      <span className="text-muted-foreground">Category:</span> <span className="font-medium text-foreground">{previewComponent.category || 'Other'}</span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => {
                      setPreviewComponent(null);
                      setSchemaComponent(previewComponent);
                    }}
                    variant="default"
                    className="bg-brandPurple hover:bg-brandPurple/90 flex items-center gap-2"
                  >
                    View Schema
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      {/* Schema Modal */}
      <Dialog open={schemaComponent !== null} onOpenChange={() => setSchemaComponent(null)}>
        <DialogContent className="max-w-5xl max-h-[80vh] overflow-auto border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-foreground">
              {schemaComponent?.name} Schema
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Property</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Editable</TableHead>
                  <TableHead>Required</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schemaComponent && Object.entries(schemaComponent.properties).map(([key, prop]) => {
                  // Check if property is "created" - for now, we'll mark required and editable ones as created
                  const isCreated = prop.required || prop.editable;
                  
                  return (
                    <TableRow key={key}>
                      <TableCell className="font-medium">{key}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-mono bg-secondary/30 text-foreground">
                          {prop.type}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                          prop.editable ? 'bg-brandTeal/10 text-brandTeal' : 'bg-secondary/30 text-muted-foreground'
                        }`}>
                          {prop.editable ? 'Yes' : 'No'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                          prop.required ? 'bg-brandPurple/10 text-brandPurple' : 'bg-secondary/30 text-muted-foreground'
                        }`}>
                          {prop.required ? 'Yes' : 'No'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          isCreated 
                            ? 'bg-green-50 text-green-700 border border-green-200' 
                            : 'bg-orange-50 text-orange-700 border border-orange-200'
                        }`}>
                          {isCreated ? 'Created' : 'Not Created'}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {prop.description || '-'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            
            {/* Component Metadata */}
            <div className="mt-6 p-4 bg-secondary/20 rounded-lg">
              <h4 className="font-semibold text-foreground mb-3">Component Metadata</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">ID:</span>
                  <span className="ml-2 font-mono text-foreground">{schemaComponent?.id}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Version:</span>
                  <span className="ml-2 font-mono text-foreground">{schemaComponent?.version}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Category:</span>
                  <span className="ml-2 text-foreground">{schemaComponent?.category}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Editor:</span>
                  <span className="ml-2 text-foreground">{schemaComponent?.editor}</span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Contact Modal (for previews) */}
      <ContactModal open={contactModalOpen} onOpenChange={setContactModalOpen} />
    </div>
  );
};

export default ComponentsManager;
