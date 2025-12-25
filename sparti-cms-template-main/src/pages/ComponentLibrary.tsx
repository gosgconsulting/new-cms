import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Grid, 
  Type, 
  MousePointer, 
  Image, 
  Navigation, 
  Layers,
  Eye,
  Search,
  X,
  FileText
} from 'lucide-react';
// Demo component library (no Supabase required)

import { AnimatedTestimonialsDemo } from '../components/ui/animated-testimonials-demo';
import { CarouselDemo } from '../components/ui/carousel-demo';
import { ImageSwiperDemo } from '../components/ui/image-swiper-demo';

import { SpartiBuilder } from '../../sparti-builder/components/SpartiBuilder';
import '../../sparti-builder/styles/modal-sparti-fix.css';

interface Component {
  id: string;
  name: string;
  type: string;
  content: any;
  styles: any;
  is_active: boolean | null;
  is_global: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

const ComponentLibrary: React.FC = () => {
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [previewModal, setPreviewModal] = useState<{ open: boolean; component: Component | null }>({
    open: false,
    component: null
  });

  // Icon mapping for component types
  const getIconForType = (type: string) => {
    const iconMap: Record<string, any> = {
      navigation: Navigation,
      hero: Layout,
      content: Type,
      testimonials: MousePointer,
      buttons: MousePointer,
      media: Image,
      image: Image,
      layout: Layers,
      forms: FileText,
    };
    return iconMap[type] || Grid; // Default to Grid icon
  };

  // Display name mapping for component types
  const getDisplayNameForType = (type: string) => {
    const nameMap: Record<string, string> = {
      navigation: 'Navigation',
      hero: 'Hero Sections',
      content: 'Content',
      testimonials: 'Testimonials',
      buttons: 'Buttons',
      media: 'Media',
      image: 'Images',
      layout: 'Layout',
      forms: 'Forms',
    };
    return nameMap[type] || type.charAt(0).toUpperCase() + type.slice(1); // Default to capitalized type
  };

  // Dynamic categories based on actual component types in database
  const [categories, setCategories] = useState([
    { id: 'all', name: 'All Components', icon: Grid, count: 0 }
  ]);

  // Fetch components for demo (hardcoded components)
  useEffect(() => {
    const fetchComponents = async () => {
      try {
        setLoading(true);
        console.log('Loading demo components...');
        
        // Demo components (hardcoded for demo)
        const demoComponents = [
          {
            id: 'demo-1',
            name: 'Hero Carousel',
            type: 'hero',
            content: {},
            styles: {},
            is_active: true,
            is_global: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 'demo-2', 
            name: 'Animated Testimonials',
            type: 'testimonials',
            content: {},
            styles: {},
            is_active: true,
            is_global: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 'demo-3',
            name: 'Image Swiper',
            type: 'image',
            content: {},
            styles: {},
            is_active: true,
            is_global: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 'demo-4',
            name: 'Navigation Header',
            type: 'navigation',
            content: {},
            styles: {},
            is_active: true,
            is_global: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 'demo-5',
            name: 'Footer',
            type: 'navigation',
            content: {},
            styles: {},
            is_active: true,
            is_global: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 'demo-6',
            name: 'Feature Cards',
            type: 'content',
            content: {},
            styles: {},
            is_active: true,
            is_global: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 'demo-7',
            name: 'Button Collection',
            type: 'buttons',
            content: {},
            styles: {},
            is_active: true,
            is_global: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        ];
        
        setComponents(demoComponents);
        
        // Build dynamic categories from demo data
        buildDynamicCategories(demoComponents);
      } catch (error) {
        console.error('Error in fetchComponents:', error);
        setComponents([]);
        setCategories([{ id: 'all', name: 'All Components', icon: Grid, count: 0 }]);
      } finally {
        setLoading(false);
      }
    };

    fetchComponents();
  }, []);

  // Build dynamic categories based on component types
  const buildDynamicCategories = (componentList: Component[]) => {
    // Get unique component types
    const uniqueTypes = [...new Set(componentList.map(comp => comp.type))];
    
    // Build dynamic categories
    const dynamicCategories = [
      { id: 'all', name: 'All Components', icon: Grid, count: componentList.length }
    ];
    
    // Add categories for each unique type
    uniqueTypes.forEach(type => {
      const count = componentList.filter(comp => comp.type === type).length;
      dynamicCategories.push({
        id: type,
        name: getDisplayNameForType(type),
        icon: getIconForType(type),
        count
      });
    });
    
    setCategories(dynamicCategories);
  };


  // Filter components based on category and search only
  const filteredComponents = components.filter(component => {
    const matchesCategory = selectedCategory === 'all' || component.type === selectedCategory;
    const matchesSearch = component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         component.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Development Notice */}
      <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-yellow-800">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Component Playground - Isolated Testing Environment</span>
            </div>
            <span className="text-xs text-yellow-600">Pure component testing without tenant context</span>
        </div>
      </div>

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Layers className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Components</h1>
            </div>

            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search components..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Categories */}
            <nav className="space-y-1">
              {categories.map((category) => {
                const Icon = category.icon;
                const isActive = selectedCategory === category.id;
                
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {category.count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                 {selectedCategory === 'all' ? 'All Components' : 
                  categories.find(c => c.id === selectedCategory)?.name}
              </h2>
              <p className="text-gray-600 mt-1">
                {filteredComponents.length} component{filteredComponents.length !== 1 ? 's' : ''} found
              </p>
            </div>
          </div>

          {/* Component Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
                  <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : filteredComponents.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Layers className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No components found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm ? 'Try adjusting your search terms' : 'Components will appear here as they are created'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredComponents.map((component) => (
                <div key={component.id} className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
                  {/* Component Preview */}
                  <div className="h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-t-lg p-4 flex items-center justify-center border-b border-gray-200">
                    <div className="text-center">
                      <Type className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <span className="text-xs text-gray-500">Preview</span>
                    </div>
                  </div>

                  {/* Component Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900 truncate">{component.name}</h3>
                      <div className="flex items-center gap-1 ml-2">
                        {component.is_global && (
                          <div className="w-2 h-2 bg-green-400 rounded-full" title="Global component" />
                        )}
                        {component.is_active === false && (
                          <div className="w-2 h-2 bg-red-400 rounded-full" title="Inactive" />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                        {component.type}
                      </span>
                      <span className="text-xs text-gray-500">
                        {component.created_at ? new Date(component.created_at).toLocaleDateString() : 'Unknown'}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center">
                      <button 
                        onClick={() => setPreviewModal({ open: true, component })}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Preview
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal - Full Screen */}
      {previewModal.open && previewModal.component && (
        <div className="fixed inset-0 bg-white z-[9999] flex flex-col sparti-modal">
          {/* Close Button Only */}
          <div className="absolute top-4 right-4 z-[10000]">
            <button
              onClick={() => setPreviewModal({ open: false, component: null })}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors z-[10001] relative bg-white shadow-sm border border-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Modal Content with Sparti Builder */}
          <div className="flex-1 overflow-hidden relative">
            <SpartiBuilder 
              config={{ 
                enabled: true, 
                toolbar: true, 
                autoDetect: true 
              }}
            >
              <div className="h-full w-full overflow-auto bg-white relative z-[1] sparti-modal-content" data-sparti-container="true">
                {previewModal.component.type === 'image' && previewModal.component.name === 'Image Swiper' && (
                  <div className="min-h-full" data-sparti-element="image-swiper">
                    <ImageSwiperDemo />
                  </div>
                )}
                {previewModal.component.type === 'testimonials' && (
                  <div className="min-h-full bg-white" data-sparti-element="testimonials-section">
                    <AnimatedTestimonialsDemo />
                  </div>
                )}
                {previewModal.component.type === 'hero' && (previewModal.component.name === 'Hero Carousel' || previewModal.component.name === 'Hero Slider') && (
                  <div className="min-h-full" data-sparti-element="hero-carousel">
                    <CarouselDemo />
                  </div>
                )}
                {previewModal.component.type === 'hero' && previewModal.component.name !== 'Hero Carousel' && previewModal.component.name !== 'Hero Slider' && (
                  <section className="min-h-full bg-gradient-to-br from-blue-50 to-indigo-100 py-20" data-sparti-element="hero-section">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center" data-sparti-element="hero-container">
                      <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6" data-sparti-element="hero-title">
                        Visual Editing for <span className="text-blue-600" data-sparti-element="hero-highlight">Vite Projects</span>
                      </h1>
                      <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto" data-sparti-element="hero-description">
                        Transform your Vite applications with our powerful visual editor. Build, edit, and deploy stunning websites without leaving your browser. Perfect for developers and designers alike.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center" data-sparti-element="hero-buttons">
                        <button className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors" data-sparti-element="hero-primary-button">
                          Access CMS Dashboard
                        </button>
                        <button className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors" data-sparti-element="hero-secondary-button">
                          View Template Demo
                        </button>
                      </div>
                    </div>
                  </section>
                )}
                {previewModal.component.type === 'navigation' && previewModal.component.name === 'Navigation Header' && (
                  <div className="min-h-full bg-gray-50">
                    <header className="bg-white shadow-sm border-b">
                      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-4">
                          <div className="flex items-center">
                            <div className="flex items-center space-x-2">
                              <Layers className="h-8 w-8 text-blue-600" />
                              <span className="text-2xl font-bold text-gray-900">Sparti CMS</span>
                            </div>
                          </div>
                          <nav className="hidden md:flex space-x-8">
                            <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
                            <a href="#testimonials" className="text-gray-600 hover:text-gray-900">Testimonials</a>
                            <a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
                            <a href="#docs" className="text-gray-600 hover:text-gray-900">Docs</a>
                          </nav>
                          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                            Access CMS
                          </button>
                        </div>
                      </div>
                    </header>
                    <div className="p-20">
                      <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Navigation Header Component</h2>
                        <p className="text-gray-600">This is a preview of the navigation header. Click on any element above to edit it.</p>
                      </div>
                    </div>
                  </div>
                )}
                {previewModal.component.type === 'navigation' && previewModal.component.name === 'Footer' && (
                  <div className="min-h-full flex flex-col">
                    <div className="flex-1 bg-gray-50 p-20">
                      <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Footer Component Preview</h2>
                        <p className="text-gray-600">The footer component is shown below. Click on any element to edit it.</p>
                      </div>
                    </div>
                    <footer className="bg-gray-900 text-white py-12">
                      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid md:grid-cols-4 gap-8">
                          <div>
                            <div className="flex items-center space-x-2 mb-4">
                              <Layers className="h-8 w-8 text-blue-400" />
                              <span className="text-2xl font-bold">Sparti CMS</span>
                            </div>
                            <p className="text-gray-400">
                              The visual editor that makes Vite development faster and more intuitive.
                            </p>
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold mb-4">Product</h4>
                            <ul className="space-y-2 text-gray-400">
                              <li><a href="#" className="hover:text-white">Features</a></li>
                              <li><a href="#" className="hover:text-white">Pricing</a></li>
                              <li><a href="#" className="hover:text-white">Documentation</a></li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold mb-4">Company</h4>
                            <ul className="space-y-2 text-gray-400">
                              <li><a href="#" className="hover:text-white">About</a></li>
                              <li><a href="#" className="hover:text-white">Blog</a></li>
                              <li><a href="#" className="hover:text-white">Contact</a></li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold mb-4">Support</h4>
                            <ul className="space-y-2 text-gray-400">
                              <li><a href="#" className="hover:text-white">Help Center</a></li>
                              <li><a href="#" className="hover:text-white">Community</a></li>
                              <li><a href="#" className="hover:text-white">Contact Support</a></li>
                            </ul>
                          </div>
                        </div>
                        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                          <p>&copy; 2024 Sparti CMS. All rights reserved.</p>
                        </div>
                      </div>
                    </footer>
                  </div>
                )}
                {previewModal.component.type === 'content' && (
                  <section className="min-h-full py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                      <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Feature Component Preview</h2>
                        <p className="text-xl text-gray-600">Click on any element below to edit it with Sparti Builder</p>
                      </div>
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="text-center p-6 bg-gray-50 rounded-lg">
                          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Type className="h-8 w-8 text-blue-600" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">Lightning Fast</h3>
                          <p className="text-gray-600">
                            Built on Vite's blazing-fast development server for instant feedback and hot reloading
                          </p>
                        </div>
                        <div className="text-center p-6 bg-gray-50 rounded-lg">
                          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Layers className="h-8 w-8 text-green-600" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">Visual Editing</h3>
                          <p className="text-gray-600">
                            Drag, drop, and edit elements directly on your page with our intuitive visual interface
                          </p>
                        </div>
                        <div className="text-center p-6 bg-gray-50 rounded-lg">
                          <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Grid className="h-8 w-8 text-purple-600" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">Code Integration</h3>
                          <p className="text-gray-600">
                            Seamlessly integrates with your existing React components and workflows
                          </p>
                        </div>
                        <div className="text-center p-6 bg-gray-50 rounded-lg">
                          <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MousePointer className="h-8 w-8 text-orange-600" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">Team Collaboration</h3>
                          <p className="text-gray-600">
                            Work together with your team in real-time, share projects, and manage permissions
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>
                )}
                {previewModal.component.type === 'buttons' && (
                  <div className="min-h-full p-20 bg-gray-50 flex flex-col items-center justify-center">
                    <div className="text-center mb-12">
                      <h2 className="text-3xl font-bold text-gray-900 mb-4">Button Components Preview</h2>
                      <p className="text-gray-600">Click on any button below to edit it with Sparti Builder</p>
                    </div>
                    <div className="space-y-6 flex flex-col items-center">
                      <button className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors">
                        Primary Button
                      </button>
                      <button className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors">
                        Secondary Button
                      </button>
                      <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-colors">
                        Gradient Button
                      </button>
                    </div>
                  </div>
                )}
                {!categories.some(cat => cat.id === previewModal.component?.type) && (
                  <div className="min-h-full p-20 bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                      <Type className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-medium text-gray-900 mb-2">
                        {previewModal.component.name}
                      </h3>
                      <p className="text-gray-600">
                        Component preview for {previewModal.component.type} type
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </SpartiBuilder>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComponentLibrary;