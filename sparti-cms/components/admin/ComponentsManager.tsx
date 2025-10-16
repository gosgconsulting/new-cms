import React, { useState, useMemo } from 'react';
import { Search, Layers, Eye, FileJson } from 'lucide-react';
import { componentRegistry } from '../../registry';
import { ComponentDefinition } from '../../registry/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

const ComponentsManager: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewComponent, setPreviewComponent] = useState<ComponentDefinition | null>(null);
  const [schemaComponent, setSchemaComponent] = useState<ComponentDefinition | null>(null);

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

  return (
    <div className="flex h-full bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Layers className="h-6 w-6 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-900">Components</h2>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search components..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                    ? 'bg-purple-50 text-purple-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Layers className="h-4 w-4" />
                  <span className="text-sm">{category.label}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  selectedCategory === category.id
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {category.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {selectedCategory === 'all' 
                ? 'All Components' 
                : categories.find(c => c.id === selectedCategory)?.label || 'Components'}
            </h1>
            <p className="text-sm text-gray-500">
              {filteredComponents.length} component{filteredComponents.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {/* Components List */}
          <div className="space-y-4">
            {filteredComponents.map((component) => (
              <div
                key={component.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex items-center p-6">
                  {/* Component Icon/Preview */}
                  <div className="w-24 h-24 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200 flex-shrink-0">
                    <div className="text-center">
                      <div className="text-3xl text-gray-300 mb-1">
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
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {component.name}
                        </h3>
                        
                        <div className="flex items-center gap-3 mb-3">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            {component.category || 'other'}
                          </span>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                            {component.type}
                          </span>
                          <span className="text-xs text-gray-500">
                            v{component.version}
                          </span>
                        </div>

                        {component.description && (
                          <p className="text-sm text-gray-600 mb-4">
                            {component.description}
                          </p>
                        )}

                        {component.tags && component.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {component.tags.map((tag, idx) => (
                              <span key={idx} className="text-xs px-2 py-1 bg-gray-50 text-gray-600 rounded">
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
                          className="flex items-center gap-2"
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
              </div>
            ))}
          </div>

          {filteredComponents.length === 0 && (
            <div className="text-center py-12">
              <Layers className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No components found</h3>
              <p className="text-gray-500">
                {searchQuery 
                  ? 'Try adjusting your search query' 
                  : 'No components available in this category'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal - Full Screen */}
      <Dialog open={previewComponent !== null} onOpenChange={() => setPreviewComponent(null)}>
        <DialogContent className="max-w-full max-h-full w-screen h-screen p-0 gap-0 bg-white">
          {/* Close Button - Top Right */}
          <button
            onClick={() => setPreviewComponent(null)}
            className="absolute top-6 right-6 z-50 w-10 h-10 rounded-lg bg-white shadow-md hover:shadow-lg flex items-center justify-center transition-all duration-200 hover:bg-gray-50"
            aria-label="Close preview"
          >
            <svg
              className="w-5 h-5 text-gray-700"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>

          {/* Full Screen Preview Container */}
          <div className="w-full h-full flex items-center justify-center p-8">
            {/* Large Preview Card */}
            <div className="relative w-full max-w-4xl h-[600px] rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-100 to-gray-200">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-500"></div>
              </div>

              {/* Component Preview Content */}
              <div className="relative w-full h-full flex flex-col items-center justify-center p-12">
                {/* Visual Component Preview */}
                <div className="mb-8 w-full max-w-3xl">
                  {previewComponent?.id === 'header-main' && (
                    // Header Preview
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-32 h-10 bg-gradient-to-r from-blue-900 via-red-500 to-blue-900 rounded flex items-center justify-center">
                            <span className="text-white font-bold text-xl">GOSG</span>
                          </div>
                        </div>
                        <div className="px-6 py-2 bg-red-500 text-white rounded-full font-medium">
                          Contact Us
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {previewComponent?.id === 'footer-main' && (
                    // Footer Preview
                    <div className="bg-slate-900 rounded-xl shadow-lg p-6 text-white">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent">
                            Get Your SEO Strategy
                          </h3>
                          <p className="text-gray-400 text-sm mt-2">Ready to dominate search results?</p>
                        </div>
                        <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-teal-500 rounded-full font-medium">
                          Start Your Journey
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {previewComponent?.id === 'hero-main' && (
                    // Hero Preview
                    <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-teal-50 rounded-xl shadow-lg p-8 text-center">
                      <div className="inline-block px-4 py-2 bg-white rounded-full text-sm mb-4 shadow">
                        ⏱️ Results in 3 months or less
                      </div>
                      <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        We Boost Your SEO{" "}
                        <span className="bg-gradient-to-r from-purple-600 to-teal-600 bg-clip-text text-transparent">
                          In 3 Months
                        </span>
                      </h1>
                      <p className="text-gray-600 mb-6">We help businesses dominate search results</p>
                      <button className="px-6 py-3 bg-red-500 text-white rounded-full font-medium shadow-lg">
                        Get a Quote →
                      </button>
                    </div>
                  )}
                  
                  {previewComponent?.id === 'client-logos-carousel' && (
                    // Client Logos Preview
                    <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                      <div className="flex items-center justify-center gap-8 opacity-60">
                        <div className="w-20 h-8 bg-gray-200 rounded"></div>
                        <div className="w-20 h-8 bg-gray-200 rounded"></div>
                        <div className="w-20 h-8 bg-gray-200 rounded"></div>
                        <div className="w-20 h-8 bg-gray-200 rounded"></div>
                      </div>
                      <p className="text-sm text-gray-500 mt-4">Animated client logos carousel</p>
                    </div>
                  )}
                  
                  {previewComponent?.id === 'pain-point-section' && (
                    // Pain Points Preview
                    <div className="bg-white rounded-xl shadow-lg p-8">
                      <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">Common SEO Challenges</h2>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg text-center">
                          <div className="text-3xl mb-2">⚠️</div>
                          <p className="text-sm font-medium">Low Traffic</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg text-center">
                          <div className="text-3xl mb-2">📉</div>
                          <p className="text-sm font-medium">Poor Rankings</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg text-center">
                          <div className="text-3xl mb-2">🎯</div>
                          <p className="text-sm font-medium">No Strategy</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {previewComponent?.id === 'seo-results-section' && (
                    // SEO Results Preview
                    <div className="bg-white rounded-xl shadow-lg p-8">
                      <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">Proven Results</h2>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 border border-gray-200 rounded-lg">
                          <div className="w-full h-32 bg-gradient-to-br from-green-100 to-green-200 rounded mb-3"></div>
                          <p className="font-bold text-green-600 text-lg">+250% Traffic</p>
                          <p className="text-sm text-gray-600">E-commerce Store</p>
                        </div>
                        <div className="p-4 border border-gray-200 rounded-lg">
                          <div className="w-full h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded mb-3"></div>
                          <p className="font-bold text-blue-600 text-lg">+180% Leads</p>
                          <p className="text-sm text-gray-600">Local Business</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {previewComponent?.id === 'services-showcase-section' && (
                    // Services Preview
                    <div className="bg-white rounded-xl shadow-lg p-8">
                      <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">Our SEO Services</h2>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 bg-purple-50 rounded-lg text-center">
                          <div className="text-3xl mb-2">🔍</div>
                          <p className="font-medium text-sm">Keyword Research</p>
                        </div>
                        <div className="p-4 bg-teal-50 rounded-lg text-center">
                          <div className="text-3xl mb-2">🔗</div>
                          <p className="font-medium text-sm">Link Building</p>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-lg text-center">
                          <div className="text-3xl mb-2">📝</div>
                          <p className="font-medium text-sm">Content Strategy</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {previewComponent?.id === 'testimonials-section' && (
                    // Testimonials Preview
                    <div className="bg-white rounded-xl shadow-lg p-8">
                      <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">What Our Clients Say</h2>
                      <div className="flex gap-4">
                        <div className="flex-1 p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                            <div>
                              <p className="font-medium text-sm">John Doe</p>
                              <p className="text-xs text-gray-500">⭐⭐⭐⭐⭐</p>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600">Excellent SEO service!</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {previewComponent?.id === 'faq-section' && (
                    // FAQ Preview
                    <div className="bg-white rounded-xl shadow-lg p-8">
                      <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">Frequently Asked Questions</h2>
                      <div className="space-y-3">
                        <div className="p-4 border border-gray-200 rounded-lg">
                          <p className="font-medium text-sm">❓ How do backlinks help my SEO?</p>
                        </div>
                        <div className="p-4 border border-gray-200 rounded-lg">
                          <p className="font-medium text-sm">❓ Why are blog posts important?</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {previewComponent?.id === 'blog-preview-section' && (
                    // Blog Preview
                    <div className="bg-white rounded-xl shadow-lg p-8">
                      <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">Latest from Our Blog</h2>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="w-full h-24 bg-gray-200"></div>
                          <div className="p-3">
                            <p className="text-xs font-medium">SEO Tips 2024</p>
                          </div>
                        </div>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="w-full h-24 bg-gray-200"></div>
                          <div className="p-3">
                            <p className="text-xs font-medium">Keyword Guide</p>
                          </div>
                        </div>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="w-full h-24 bg-gray-200"></div>
                          <div className="p-3">
                            <p className="text-xs font-medium">Link Strategy</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {previewComponent?.id === 'whatsapp-button' && (
                    // WhatsApp Button Preview
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg p-12 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 text-white rounded-full shadow-lg mb-4">
                        <span className="text-3xl">💬</span>
                      </div>
                      <p className="text-sm font-medium text-gray-700">Floating WhatsApp button</p>
                    </div>
                  )}
                  
                  {previewComponent?.id === 'contact-modal' && (
                    // Contact Modal Preview
                    <div className="bg-white rounded-xl shadow-lg p-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">Get in Touch</h2>
                      <div className="space-y-3">
                        <div className="p-3 bg-gray-50 rounded">
                          <p className="text-xs text-gray-500">Name</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded">
                          <p className="text-xs text-gray-500">Email</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded h-20">
                          <p className="text-xs text-gray-500">Message</p>
                        </div>
                        <button className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium">
                          Send Message
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Component Name */}
                <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 text-center">
                  {previewComponent?.name}
                </h2>

                {/* Component Description */}
                {previewComponent?.description && (
                  <p className="text-lg text-gray-600 mb-8 text-center max-w-2xl">
                    {previewComponent.description}
                  </p>
                )}

                {/* Explore Button */}
                <button
                  onClick={() => setSchemaComponent(previewComponent)}
                  className="px-8 py-4 bg-white text-gray-800 rounded-full font-medium text-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1"
                >
                  Explore Component
                </button>

                {/* Component Metadata */}
                <div className="mt-8 flex items-center gap-6 text-sm text-gray-600">
                  <div className="px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full">
                    Type: <span className="font-semibold">{previewComponent?.type}</span>
                  </div>
                  <div className="px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full">
                    Category: <span className="font-semibold">{previewComponent?.category}</span>
                  </div>
                  <div className="px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full">
                    Version: <span className="font-semibold">{previewComponent?.version}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Schema Modal */}
      <Dialog open={schemaComponent !== null} onOpenChange={() => setSchemaComponent(null)}>
        <DialogContent className="max-w-5xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
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
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-mono bg-gray-100 text-gray-700">
                          {prop.type}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                          prop.editable ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-600'
                        }`}>
                          {prop.editable ? 'Yes' : 'No'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                          prop.required ? 'bg-purple-50 text-purple-700' : 'bg-gray-50 text-gray-600'
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
                      <TableCell className="text-sm text-gray-600">
                        {prop.description || '-'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            
            {/* Component Metadata */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Component Metadata</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">ID:</span>
                  <span className="ml-2 font-mono text-gray-900">{schemaComponent?.id}</span>
                </div>
                <div>
                  <span className="text-gray-500">Version:</span>
                  <span className="ml-2 font-mono text-gray-900">{schemaComponent?.version}</span>
                </div>
                <div>
                  <span className="text-gray-500">Category:</span>
                  <span className="ml-2 text-gray-900">{schemaComponent?.category}</span>
                </div>
                <div>
                  <span className="text-gray-500">Editor:</span>
                  <span className="ml-2 text-gray-900">{schemaComponent?.editor}</span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ComponentsManager;
