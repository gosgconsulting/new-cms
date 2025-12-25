import React, { useState, useEffect, useMemo } from 'react';
import { SpartiCMSWrapper } from '../../sparti-cms';
import { useAuth } from '../../sparti-cms/components/auth/AuthProvider';
import { Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ErrorBoundary from '../components/ErrorBoundary';
import { componentRegistry, ComponentDefinition } from '../../sparti-cms/registry';
import VisualEditorRenderer from '../components/visual-builder/VisualEditorRenderer';
import { ComponentSchema } from '../../sparti-cms/types/schema';
import { 
  TextEditor, 
  ImageEditor, 
  VideoEditor, 
  GalleryEditor, 
  CarouselEditor, 
  ButtonEditor 
} from '../../sparti-cms/components/content-editors';
import TiptapEditor from '../../sparti-cms/components/cms/TiptapEditor';
import { 
  Type, 
  Image as ImageIcon, 
  Grid, 
  Layout, 
  Video, 
  Eye, 
  Layers,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Link,
  Upload,
  X,
  Plus,
  Palette,
  Clock,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Check,
  AlertCircle,
  Info,
  Award,
  Star,
  Heart,
  Bell,
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
  Quote,
  TextQuote,
  Type as TextSize,
  ChevronDown,
  Navigation,
  FileText,
  Box,
  Code,
  Copy,
  CheckCircle,
  Monitor
} from 'lucide-react';
import api from '../../sparti-cms/utils/api';
import { resolveThemeRegistry } from '../components/visual-builder/resolveRegistry';

// Component category types - using registry categories
type CategoryType = 'All' | 'content' | 'media' | 'navigation' | 'form' | 'layout' | 'interactive';

// Legacy placeholder types
type PlaceholderType = 'heading' | 'paragraph' | 'icon-heading' | 'icon-text' | 'badge' | 'image' | 'gallery' | 'video' | 'carousel' | 'section' | 'icon' | 'input' | 'textarea' | 'boolean' | 'number' | 'button';
type SubCategoryType = 'Text' | 'Media' | 'Layout' | 'UI' | 'Hero' | 'Feature' | 'CTA';
type Placeholder = {
  id: string;
  name: string;
  type: PlaceholderType;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  category?: string;
  subcategory?: string;
  defaultContent?: string;
  fields?: string[];
  components?: string[];
};

// Legacy placeholder data (keeping for backward compatibility with editor)
  const PLACEHOLDERS: any[] = [
  // FIELDS - Text Category
  {
    id: 'field-rich-text',
    name: 'Rich Text Editor',
    type: 'paragraph',
    description: 'Rich text editor for all content including headings, paragraphs, and quotes',
    createdAt: '2023-10-15',
    updatedAt: '2023-10-15',
    category: 'Fields',
    subcategory: 'Text',
    defaultContent: 'This is a rich text editor field where you can add formatted content with various styling options including headings, paragraphs, and quotes.'
  },
  
         // FIELDS - Icon Field
         {
           id: 'field-icon',
           name: 'Icon Field',
           type: 'icon',
           description: 'Icon selection or upload field',
           createdAt: '2023-10-15',
           updatedAt: '2023-10-15',
           category: 'Fields',
           subcategory: 'Media'
         },
         // FIELDS - Media Category
         {
           id: 'field-image',
           name: 'Image Field',
           type: 'image',
           description: 'Single image upload field',
           createdAt: '2023-10-15',
           updatedAt: '2023-10-15',
           category: 'Fields',
           subcategory: 'Media'
         },
  {
    id: 'field-gallery',
    name: 'Gallery Field',
    type: 'gallery',
    description: 'Multiple image upload field',
    createdAt: '2023-10-15',
    updatedAt: '2023-10-15',
    category: 'Fields',
    subcategory: 'Media'
  },
  {
    id: 'field-video',
    name: 'Video Field',
    type: 'video',
    description: 'Video embed field (YouTube/Vimeo)',
    createdAt: '2023-10-15',
    updatedAt: '2023-10-15',
    category: 'Fields',
    subcategory: 'Media',
    defaultContent: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  },
  
  // COMPONENTS - UI Elements
  {
    id: 'component-icon-text',
    name: 'Icon + Text',
    type: 'icon-text',
    description: 'Component combining icon and text',
    createdAt: '2023-10-15',
    updatedAt: '2023-10-15',
    category: 'Components',
    subcategory: 'UI',
    defaultContent: '+65 8024 6850',
    fields: ['field-rich-text', 'icon-selector']
  },
  {
    id: 'component-icon-heading',
    name: 'Icon + Heading',
    type: 'icon-heading',
    description: 'Component combining icon and heading',
    createdAt: '2023-10-15',
    updatedAt: '2023-10-15',
    category: 'Components',
    subcategory: 'UI',
    defaultContent: 'Get Results in 3 Months',
    fields: ['field-rich-text', 'icon-selector']
  },
  {
    id: 'component-badge-icon',
    name: 'Badge with Icon',
    type: 'badge',
    description: 'Badge component with icon and text',
    createdAt: '2023-10-15',
    updatedAt: '2023-10-15',
    category: 'Components',
    subcategory: 'UI',
    defaultContent: 'Get Results in 3 Months',
    fields: ['field-rich-text', 'icon-selector']
  },
  {
    id: 'component-badge-text',
    name: 'Badge with Text',
    type: 'badge',
    description: 'Badge component with text only',
    createdAt: '2023-10-15',
    updatedAt: '2023-10-15',
    category: 'Components',
    subcategory: 'UI',
    defaultContent: 'You have a website but it\'s not generating clicks?',
    fields: ['field-rich-text']
  },
  {
    id: 'component-button',
    name: 'Button',
    type: 'button',
    description: 'Interactive button component',
    createdAt: '2023-10-15',
    updatedAt: '2023-10-15',
    category: 'Components',
    subcategory: 'UI',
    defaultContent: 'Click Me',
    fields: ['field-rich-text', 'url-field']
  },
  {
    id: 'component-carousel',
    name: 'Image Carousel',
    type: 'carousel',
    description: 'Sliding carousel component for multiple images',
    createdAt: '2023-10-15',
    updatedAt: '2023-10-15',
    category: 'Components',
    subcategory: 'UI',
    fields: ['field-gallery']
  },
  
  // SECTIONS
  {
    id: 'section-hero',
    name: 'Hero Section',
    type: 'hero',
    description: 'Main hero section with heading, text and background',
    createdAt: '2023-10-15',
    updatedAt: '2023-10-15',
    category: 'Sections',
    subcategory: 'Hero',
    components: ['field-rich-text', 'field-image', 'component-button']
  },
  {
    id: 'section-feature',
    name: 'Feature Section',
    type: 'section',
    description: 'Feature highlight section with image and text',
    createdAt: '2023-10-15',
    updatedAt: '2023-10-15',
    category: 'Sections',
    subcategory: 'Feature',
    components: ['field-rich-text', 'field-image', 'component-icon-text']
  },
  {
    id: 'section-cta',
    name: 'Call to Action',
    type: 'section',
    description: 'Call to action section with heading and button',
    createdAt: '2023-10-15',
    updatedAt: '2023-10-15',
    category: 'Sections',
    subcategory: 'CTA',
    components: ['field-rich-text', 'component-button']
  },
  
  // NEW V3 SCHEMA COMPONENTS
  
  // Hero Section Components
  {
    id: 'section-hero-minimal',
    name: 'Minimal Hero Section',
    type: 'hero',
    description: 'Minimal hero section with background image, title, button, and scroll arrow',
    createdAt: '2023-12-01',
    updatedAt: '2023-12-01',
    category: 'Sections',
    subcategory: 'Hero',
    components: ['field-image', 'field-rich-text', 'component-button', 'field-boolean']
  },
  
  // Showcase Components
  {
    id: 'section-lifestyle-showcase',
    name: 'Lifestyle Showcase',
    type: 'showcase',
    description: 'Lifestyle showcase with title, subtitle, and image grid with links',
    createdAt: '2023-12-01',
    updatedAt: '2023-12-01',
    category: 'Sections',
    subcategory: 'Feature',
    components: ['field-rich-text', 'field-gallery', 'component-link']
  },
  
  // Product Grid Components
  {
    id: 'section-product-grid',
    name: 'Product Grid',
    type: 'product-grid',
    description: 'Product grid with title, subtitle, and dynamic product loading',
    createdAt: '2023-12-01',
    updatedAt: '2023-12-01',
    category: 'Sections',
    subcategory: 'Feature',
    components: ['field-rich-text', 'field-number', 'field-boolean']
  },
  
  // Reviews Components
  {
    id: 'section-reviews',
    name: 'Reviews Section',
    type: 'reviews',
    description: 'Reviews section with array of review items (name, rating, text, avatar)',
    createdAt: '2023-12-01',
    updatedAt: '2023-12-01',
    category: 'Sections',
    subcategory: 'Feature',
    components: ['component-review-item']
  },
  {
    id: 'component-review-item',
    name: 'Review Item',
    type: 'review',
    description: 'Individual review component with name, rating, text, and avatar',
    createdAt: '2023-12-01',
    updatedAt: '2023-12-01',
    category: 'Components',
    subcategory: 'UI',
    fields: ['field-rich-text', 'field-image', 'field-number']
  },
  
  // Newsletter Components
  {
    id: 'section-newsletter',
    name: 'Newsletter Section',
    type: 'newsletter',
    description: 'Newsletter signup with title, subtitle, email input, and button',
    createdAt: '2023-12-01',
    updatedAt: '2023-12-01',
    category: 'Sections',
    subcategory: 'CTA',
    components: ['field-rich-text', 'field-input', 'component-button']
  },
  
  // Form Components
  {
    id: 'section-contact-form',
    name: 'Contact Form',
    type: 'contact-form',
    description: 'Contact form with title and field array',
    createdAt: '2023-12-01',
    updatedAt: '2023-12-01',
    category: 'Sections',
    subcategory: 'Feature',
    components: ['field-rich-text', 'component-form-field']
  },
  {
    id: 'component-form-field',
    name: 'Form Field',
    type: 'form-field',
    description: 'Individual form field (input/textarea) with label and required flag',
    createdAt: '2023-12-01',
    updatedAt: '2023-12-01',
    category: 'Components',
    subcategory: 'UI',
    fields: ['field-rich-text', 'field-boolean']
  },
  
  // Feature Components
  {
    id: 'component-feature-item',
    name: 'Feature Item',
    type: 'feature',
    description: 'Feature item with icon, title, and description',
    createdAt: '2023-12-01',
    updatedAt: '2023-12-01',
    category: 'Components',
    subcategory: 'UI',
    fields: ['field-icon', 'field-rich-text']
  },
  
  // Additional Field Types for V3 Schema
  {
    id: 'field-input',
    name: 'Input Field',
    type: 'input',
    description: 'Text input field with label and required flag',
    createdAt: '2023-12-01',
    updatedAt: '2023-12-01',
    category: 'Fields',
    subcategory: 'Text'
  },
  {
    id: 'field-textarea',
    name: 'Textarea Field',
    type: 'textarea',
    description: 'Multi-line text input field with label and required flag',
    createdAt: '2023-12-01',
    updatedAt: '2023-12-01',
    category: 'Fields',
    subcategory: 'Text'
  },
  {
    id: 'field-boolean',
    name: 'Boolean Field',
    type: 'boolean',
    description: 'Boolean/checkbox field for true/false values',
    createdAt: '2023-12-01',
    updatedAt: '2023-12-01',
    category: 'Fields',
    subcategory: 'UI'
  },
  {
    id: 'field-number',
    name: 'Number Field',
    type: 'number',
    description: 'Numeric input field',
    createdAt: '2023-12-01',
    updatedAt: '2023-12-01',
    category: 'Fields',
    subcategory: 'UI'
  }
];

// Mock image data for galleries and carousels
const MOCK_IMAGES = [
  { id: 'img1', url: 'https://via.placeholder.com/800x600/3498db/ffffff?text=Image+1', alt: 'Image 1' },
  { id: 'img2', url: 'https://via.placeholder.com/800x600/e74c3c/ffffff?text=Image+2', alt: 'Image 2' },
  { id: 'img3', url: 'https://via.placeholder.com/800x600/2ecc71/ffffff?text=Image+3', alt: 'Image 3' },
  { id: 'img4', url: 'https://via.placeholder.com/800x600/f39c12/ffffff?text=Image+4', alt: 'Image 4' },
  { id: 'img5', url: 'https://via.placeholder.com/800x600/9b59b6/ffffff?text=Image+5', alt: 'Image 5' },
  { id: 'img6', url: 'https://via.placeholder.com/800x600/1abc9c/ffffff?text=Image+6', alt: 'Image 6' },
];

// Branding colors and typography options
const BRANDING_COLORS = [
  { name: 'Primary', value: '#6200ee', gradient: 'linear-gradient(45deg, #6200ee, #9500ff)' },
  { name: 'Secondary', value: '#03dac6', gradient: 'linear-gradient(45deg, #03dac6, #00fff0)' },
  { name: 'Accent', value: '#ff4081', gradient: 'linear-gradient(45deg, #ff4081, #ff79b0)' },
  { name: 'Dark', value: '#121212', gradient: 'linear-gradient(45deg, #121212, #323232)' },
  { name: 'Light', value: '#f5f5f5', gradient: 'linear-gradient(45deg, #f5f5f5, #ffffff)' },
  { name: 'Warning', value: '#fb8c00', gradient: 'linear-gradient(45deg, #fb8c00, #ffbd45)' },
  { name: 'Error', value: '#b00020', gradient: 'linear-gradient(45deg, #b00020, #e53935)' },
  { name: 'Success', value: '#4caf50', gradient: 'linear-gradient(45deg, #4caf50, #80e27e)' },
];

// Available icons for selection
const AVAILABLE_ICONS = [
  { name: 'Clock', component: Clock },
  { name: 'Phone', component: Phone },
  { name: 'Mail', component: Mail },
  { name: 'MapPin', component: MapPin },
  { name: 'Calendar', component: Calendar },
  { name: 'Check', component: Check },
  { name: 'AlertCircle', component: AlertCircle },
  { name: 'Info', component: Info },
  { name: 'Award', component: Award },
  { name: 'Star', component: Star },
  { name: 'Heart', component: Heart }
];

// Text style options
const TEXT_STYLES = [
  { name: 'Paragraph', value: 'paragraph', component: Pilcrow, className: 'text-base' },
  { name: 'Heading 1', value: 'h1', component: Heading1, className: 'text-4xl font-bold' },
  { name: 'Heading 2', value: 'h2', component: Heading2, className: 'text-3xl font-bold' },
  { name: 'Heading 3', value: 'h3', component: Heading3, className: 'text-2xl font-bold' },
  { name: 'Heading 4', value: 'h4', component: Heading3, className: 'text-xl font-bold' },
  { name: 'Heading 5', value: 'h5', component: Heading3, className: 'text-lg font-bold' },
  { name: 'Heading 6', value: 'h6', component: Heading3, className: 'text-base font-bold' },
  { name: 'Quote', value: 'quote', component: TextQuote, className: 'italic border-l-4 border-gray-400 pl-4' }
];

// Font size options
const FONT_SIZES = [
  { name: 'Small', value: '12px' },
  { name: 'Normal', value: '16px' },
  { name: 'Medium', value: '20px' },
  { name: 'Large', value: '24px' },
  { name: 'X-Large', value: '32px' },
  { name: 'XX-Large', value: '48px' }
];

const ComponentsViewerContent = () => {
  // Get all components from registry
  const allComponents = useMemo(() => {
    return componentRegistry.getAll();
  }, []);

  // Get unique categories from components
  const categories = useMemo(() => {
    const cats = new Set<CategoryType>(['All']);
    allComponents.forEach(comp => {
      if (comp.category) {
        cats.add(comp.category as CategoryType);
      }
    });
    return Array.from(cats);
  }, [allComponents]);

  const [activeCategory, setActiveCategory] = useState<CategoryType>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedComponent, setSelectedComponent] = useState<ComponentDefinition | null>(null);
  const [jsonViewComponent, setJsonViewComponent] = useState<ComponentDefinition | null>(null);
  const [jsonCopied, setJsonCopied] = useState<boolean>(false);
  const [previewComponent, setPreviewComponent] = useState<ComponentDefinition | null>(null);

  // Database-driven preview state
  const { user, loading: authLoading, currentTenantId } = useAuth();
  const [dbPages, setDbPages] = useState<Array<{ id: string; page_name: string; slug: string; theme_id?: string }>>([]);
  const [loadingPages, setLoadingPages] = useState<boolean>(false);
  const [selectedDbPageId, setSelectedDbPageId] = useState<string>('');
  const [dbPageLayout, setDbPageLayout] = useState<{ components: ComponentSchema[] } | null>(null);
  const [dbPageThemeId, setDbPageThemeId] = useState<string | undefined>(undefined);
  const [loadingLayout, setLoadingLayout] = useState<boolean>(false);

  // Load tenant pages list for DB preview
  useEffect(() => {
    if (!currentTenantId) return;
    let cancelled = false;
    const loadPages = async () => {
      setLoadingPages(true);
      try {
        const res = await api.get(`/api/pages?tenantId=${currentTenantId}`);
        if (!res.ok) {
          console.warn('[ComponentsViewer] Failed to fetch pages list');
          return;
        }
        const data = await res.json();
        if (cancelled) return;
        const pagesArr = Array.isArray(data.pages) ? data.pages : (Array.isArray(data) ? data : []);
        setDbPages(
          pagesArr.map((p: any) => ({
            id: String(p.id),
            page_name: p.page_name || 'Untitled',
            slug: p.slug,
            theme_id: p.theme_id || undefined,
          }))
        );
      } catch (e) {
        console.warn('[ComponentsViewer] Error loading pages:', e);
      } finally {
        if (!cancelled) setLoadingPages(false);
      }
    };
    loadPages();
    return () => { cancelled = true; };
  }, [currentTenantId]);

  // Load selected page layout JSON
  useEffect(() => {
    if (!selectedDbPageId || !currentTenantId) return;
    let cancelled = false;
    const loadLayout = async () => {
      setLoadingLayout(true);
      try {
        const res = await api.get(`/api/pages/${selectedDbPageId}?tenantId=${currentTenantId}`);
        const data = await res.json();
        if (cancelled) return;
        if (data?.success && data?.page) {
          // Prefer normalized layout json from API
          let layout = data.page.layout || null;
          // Optional normalization similar to PageEditor (keep preview faithful to DB)
          try {
            const mod = await import('../../sparti-cms/utils/convertTestimonialsToItems.js');
            if (layout?.components) {
              layout = mod.convertLayoutTestimonialsToItems(layout);
            }
          } catch {
            // ignore if conversion helper not available
          }
          setDbPageLayout(layout);
          setDbPageThemeId(data.page.theme_id || undefined);
        } else {
          setDbPageLayout(null);
        }
      } catch (e) {
        console.warn('[ComponentsViewer] Error loading page layout:', e);
        setDbPageLayout(null);
      } finally {
        if (!cancelled) setLoadingLayout(false);
      }
    };
    loadLayout();
    return () => { cancelled = true; };
  }, [selectedDbPageId, currentTenantId]);

  // Filter components based on active category and search
  const filteredComponents = useMemo(() => {
    try {
      let filtered = allComponents;
      
      // Filter by category
      if (activeCategory !== 'All') {
        filtered = filtered.filter(comp => comp.category === activeCategory);
      }
      
      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(comp => 
          comp.name.toLowerCase().includes(query) ||
          (comp.description && comp.description.toLowerCase().includes(query)) ||
          (comp.tags && comp.tags.some(tag => tag.toLowerCase().includes(query)))
        );
      }
      
      return filtered;
    } catch (error) {
      console.error('[testing] Error filtering components:', error);
      return allComponents; // Return all components on error
    }
  }, [allComponents, activeCategory, searchQuery]);

  // Get component icon based on type
  const getComponentIcon = (component: ComponentDefinition) => {
    switch (component.type) {
      case 'text':
        return <Type className="h-5 w-5 text-purple-600" />;
      case 'image':
        return <ImageIcon className="h-5 w-5 text-blue-600" />;
      case 'video':
        return <Video className="h-5 w-5 text-red-600" />;
      case 'button':
        return <Link className="h-5 w-5 text-green-600" />;
      case 'container':
        return <Layout className="h-5 w-5 text-gray-600" />;
      default:
        return <Box className="h-5 w-5 text-gray-600" />;
    }
  };

  // Map component IDs to their registry component type names
  const mapComponentIdToType = (id: string, name: string): string => {
    // Common mappings based on component IDs and names
    const idMappings: Record<string, string> = {
      'hero-main': 'HeroSection',
      'hero-section': 'HeroSection',
      'seo-results-section': 'ResultsSection',
      'services-showcase-section': 'ServicesShowcase',
      'services-section': 'ServicesSection',
      'features-section': 'FeaturesSection',
      'ingredients-section': 'IngredientsSection',
      'team-section': 'TeamSection',
      'about-section': 'AboutSection',
      'testimonials-section': 'TestimonialsSection',
      'faq-section': 'FAQSection',
      'gallery-section': 'GallerySection',
      'contact-form': 'ContactForm',
      'contact-info': 'ContactInfo',
      'cta-section': 'CTASection',
      'content-section': 'ContentSection',
    };

    // Check ID mappings first
    if (idMappings[id]) {
      return idMappings[id];
    }

    // Try to infer from ID pattern
    const idLower = id.toLowerCase();
    if (idLower.includes('hero')) return 'HeroSection';
    if (idLower.includes('services')) return 'ServicesSection';
    if (idLower.includes('features')) return 'FeaturesSection';
    if (idLower.includes('ingredients')) return 'IngredientsSection';
    if (idLower.includes('team')) return 'TeamSection';
    if (idLower.includes('about')) return 'AboutSection';
    if (idLower.includes('testimonial')) return 'TestimonialsSection';
    if (idLower.includes('faq')) return 'FAQSection';
    if (idLower.includes('gallery')) return 'GallerySection';
    if (idLower.includes('results') || idLower.includes('seo-results')) return 'ResultsSection';
    if (idLower.includes('contact')) return 'ContactInfo';
    if (idLower.includes('cta') || idLower.includes('call-to-action')) return 'CTASection';

    // Fallback: convert name to PascalCase
    return name
      .split(/[\s-]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  };

  // Convert ComponentDefinition to ComponentSchema for preview
  const convertToComponentSchema = (component: ComponentDefinition): ComponentSchema => {
    // Map component type - for container types, map to actual component name
    let componentType: string = component.type as unknown as string;
    if (componentType === 'container') {
      componentType = mapComponentIdToType(component.id, component.name);
    }

    // Create items array from properties with default values
    const items: any[] = [];
    const props: Record<string, any> = {};

    if (component.properties) {
      Object.entries(component.properties).forEach(([key, prop]: [string, any]) => {
        const defaultValue = prop.default !== undefined ? prop.default : (prop.example || null);

        // Handle arrays - convert to items structure
        if (prop.type === 'array' && Array.isArray(defaultValue) && defaultValue.length > 0) {
          // Convert array items to schema items
          const arrayItems = defaultValue.map((item: any, index: number) => {
            if (typeof item === 'string') {
              return {
                key: `${key}-${index}`,
                type: 'text',
                content: item
              };
            } else if (typeof item === 'object' && item !== null) {
              // Convert object to schema items
              const itemSchemaItems: any[] = [];
              Object.entries(item).forEach(([itemKey, itemValue]) => {
                if (typeof itemValue === 'string') {
                  itemSchemaItems.push({
                    key: itemKey,
                    type: itemKey.toLowerCase().includes('image') || itemKey.toLowerCase().includes('img') || itemKey.toLowerCase().includes('src') ? 'image' : 'text',
                    content: itemValue,
                    ...(itemKey.toLowerCase().includes('image') || itemKey.toLowerCase().includes('img') || itemKey.toLowerCase().includes('src') ? { src: itemValue } : {})
                  });
                }
              });
              return {
                key: `${key}-${index}`,
                type: 'array',
                items: itemSchemaItems.length > 0 ? itemSchemaItems : [{ key: 'content', type: 'text', content: JSON.stringify(item) }]
              };
            }
            return {
              key: `${key}-${index}`,
              type: 'text',
              content: String(item)
            };
          });

          items.push({
            key,
            type: 'array',
            items: arrayItems
          });
        }
        // Handle strings/text
        else if (prop.type === 'string' || prop.type === 'text') {
          if (defaultValue) {
            items.push({
              key,
              type: 'text',
              content: defaultValue,
              label: prop.description || key
            });
            // Also add to props for components that use props
            props[key] = defaultValue;
          }
        }
        // Handle images/URLs
        else if (prop.type === 'image' || prop.type === 'url') {
          if (defaultValue) {
            items.push({
              key,
              type: 'image',
              src: defaultValue,
              alt: key
            });
            props[key] = defaultValue;
          } else {
            items.push({
              key,
              type: 'image',
              src: 'https://via.placeholder.com/400x300',
              alt: key
            });
          }
        }
        // Handle booleans
        else if (prop.type === 'boolean') {
          props[key] = defaultValue !== undefined ? defaultValue : false;
        }
        // Handle other types - add to props
        else if (defaultValue !== null && defaultValue !== undefined) {
          props[key] = defaultValue;
        }
      });
    }

    // If no items were created, add a default text item
    if (items.length === 0) {
      items.push({
        key: 'content',
        type: 'text',
        content: component.description || `Preview of ${component.name}`,
        label: 'Content'
      });
    }

    // Create component schema
    const schema: ComponentSchema = {
      key: component.id || `preview-${component.name}`,
      name: component.name,
      type: componentType,
      items
    };

    // Add props if any were created
    if (Object.keys(props).length > 0) {
      (schema as any).props = props;
    }

    return schema;
  };

  // Handle preview
  const handlePreview = (component: ComponentDefinition) => {
    setPreviewComponent(component);
  };

  // Handle JSON view
  const handleViewJSON = (component: ComponentDefinition) => {
    setJsonViewComponent(component);
    setJsonCopied(false);
  };

  // Handle JSON copy
  const handleCopyJSON = async () => {
    if (!jsonViewComponent) return;
    
    try {
      const jsonString = JSON.stringify(jsonViewComponent, null, 2);
      await navigator.clipboard.writeText(jsonString);
      setJsonCopied(true);
      setTimeout(() => setJsonCopied(false), 2000);
    } catch (error) {
      console.error('[testing] Failed to copy JSON:', error);
    }
  };

  // Get formatted JSON string
  const getFormattedJSON = (component: ComponentDefinition | null): string => {
    if (!component) return '';
    return JSON.stringify(component, null, 2);
  };
  
  // Legacy state for backward compatibility
  const [activeSubcategory, setActiveSubcategory] = useState<string>('All');
  const [selectedPlaceholder, setSelectedPlaceholder] = useState<any | null>(null);
  const [editorContent, setEditorContent] = useState<string>('');
  const [selectedImages, setSelectedImages] = useState<typeof MOCK_IMAGES>([]);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const [showIconPicker, setShowIconPicker] = useState<boolean>(false);
  const [showTextStylePicker, setShowTextStylePicker] = useState<boolean>(false);
  const [showFontSizePicker, setShowFontSizePicker] = useState<boolean>(false);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedIcon, setSelectedIcon] = useState<string>('Clock');
  const [selectedTextStyle, setSelectedTextStyle] = useState<string>('paragraph');
  const [selectedFontSize, setSelectedFontSize] = useState<string>('16px');
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);
  const [customIconUrl, setCustomIconUrl] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  
  // Image field states
  const [selectedSingleImage, setSelectedSingleImage] = useState<string | null>(null);
  const [imageTitle, setImageTitle] = useState<string>('');
  const [imageAlt, setImageAlt] = useState<string>('');
  
  // Gallery field states
  const [galleryImages, setGalleryImages] = useState<typeof MOCK_IMAGES>([]);
  const [galleryTitle, setGalleryTitle] = useState<string>('');
  
  // Function to handle gallery file selection
  const handleGallerySelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    // Create new image objects from the selected files
    const newImages = Array.from(files).map((file, index) => {
      const url = URL.createObjectURL(file);
      return {
        id: `new-img-${Date.now()}-${index}`,
        url: url,
        alt: file.name
      };
    });
    
    // Add the new images to the gallery images
    setGalleryImages([...galleryImages, ...newImages]);
    setSelectedImages([...galleryImages, ...newImages]);
  };
  
  // Carousel field states
  const [carouselImages, setCarouselImages] = useState<typeof MOCK_IMAGES>([]);
  const [carouselTitle, setCarouselTitle] = useState<string>('');
  
  const getPlaceholderIcon = (type: PlaceholderType) => {
    switch (type) {
      case 'heading':
        return <Type className="h-5 w-5 text-purple-600" />;
      case 'paragraph':
        return <Type className="h-5 w-5 text-purple-600" />;
      case 'icon-heading':
        return <Clock className="h-5 w-5 text-purple-600" />;
      case 'icon-text':
        return <Phone className="h-5 w-5 text-purple-600" />;
      case 'badge':
        return <Award className="h-5 w-5 text-pink-600" />;
      case 'image':
        return <ImageIcon className="h-5 w-5 text-blue-600" />;
      case 'gallery':
        return <Grid className="h-5 w-5 text-green-600" />;
      case 'video':
        return <Video className="h-5 w-5 text-red-600" />;
      case 'carousel':
        return <Layers className="h-5 w-5 text-amber-600" />;
      case 'section':
        return <Layout className="h-5 w-5 text-gray-600" />;
      default:
        return <Type className="h-5 w-5 text-gray-600" />;
    }
  };

  const getSubcategoryIcon = (subcategory: SubCategoryType) => {
    switch (subcategory) {
      case 'Text':
        return <Type className="h-5 w-5" />;
      case 'Media':
        return <ImageIcon className="h-5 w-5" />;
      case 'Layout':
        return <Grid className="h-5 w-5" />;
      case 'UI':
        return <Layout className="h-5 w-5" />;
      case 'Hero':
        return <Layers className="h-5 w-5" />;
      case 'Feature':
        return <Award className="h-5 w-5" />;
      case 'CTA':
        return <Bell className="h-5 w-5" />;
      default:
        return <Layout className="h-5 w-5" />;
    }
  };

  const handleViewPlaceholder = (placeholder: Placeholder) => {
    setSelectedPlaceholder(placeholder);
    setActiveTabIndex(0); // Reset to first tab when opening editor
    
    // Initialize editor content based on placeholder type
    if (placeholder.type === 'heading' || placeholder.type === 'paragraph') {
      setEditorContent(placeholder.defaultContent || '');
      
      // Set appropriate text style based on placeholder type
      if (placeholder.id === 'field-heading-h1') {
        setSelectedTextStyle('h1');
      } else if (placeholder.id === 'field-heading-h2') {
        setSelectedTextStyle('h2');
      } else if (placeholder.id === 'field-heading-h3') {
        setSelectedTextStyle('h3');
      } else if (placeholder.id === 'field-quote') {
        setSelectedTextStyle('quote');
      } else {
        setSelectedTextStyle('paragraph');
      }
      
      // Reset font size to default
      setSelectedFontSize('16px');
    } else if (placeholder.type === 'video') {
      setVideoUrl(placeholder.defaultContent || '');
    } else if (placeholder.type === 'gallery' || placeholder.type === 'carousel') {
      setSelectedImages(MOCK_IMAGES.slice(0, 3)); // Default with 3 images
    }
  };

  // Get subcategories based on active main category
  const getSubcategories = (category: CategoryType): (SubCategoryType | 'All')[] => {
    if (category === 'All') return ['All'];
    
    const subcategories = PLACEHOLDERS
      .filter(p => p.category === category)
      .map(p => p.subcategory)
      .filter((value, index, self) => self.indexOf(value) === index);
    
    return ['All', ...subcategories];
  };
  
  // Get category icon
  const getCategoryIcon = (category: CategoryType) => {
    switch (category) {
      case 'All':
        return <Box className="h-5 w-5" />;
      case 'content':
        return <Type className="h-5 w-5" />;
      case 'media':
        return <ImageIcon className="h-5 w-5" />;
      case 'navigation':
        return <Navigation className="h-5 w-5" />;
      case 'form':
        return <FileText className="h-5 w-5" />;
      case 'layout':
        return <Layout className="h-5 w-5" />;
      case 'interactive':
        return <Code className="h-5 w-5" />;
      default:
        return <Box className="h-5 w-5" />;
    }
  };

  // Text selection and formatting handlers
  const getSelectedText = () => {
    if (window.getSelection) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        return {
          selection,
          range: selection.getRangeAt(0),
          text: selection.toString()
        };
      }
    }
    return null;
  };
  
  const applyFormatToSelection = (formatFn) => {
    const selectionData = getSelectedText();
    if (!selectionData || !selectionData.text) return;
    
    const { selection, range } = selectionData;
    const span = document.createElement('span');
    
    // Apply the formatting function to the span
    formatFn(span);
    
    // Delete the current selection content and insert our formatted span
    range.deleteContents();
    range.insertNode(span);
    
    // Create a new range that selects our newly inserted span
    const newRange = document.createRange();
    newRange.selectNodeContents(span);
    
    // Update the editor content after DOM manipulation
    const editorElement = document.querySelector('[contenteditable]');
    if (editorElement) {
      // Preserve the selection during content update
      const tempSelection = window.getSelection();
      if (tempSelection) {
        tempSelection.removeAllRanges();
        tempSelection.addRange(newRange);
      }
      
      // Update the editor content state
      setEditorContent(editorElement.innerHTML);
    }
    
    // Keep the selection visible but collapsed at the end of our span
    // This allows for continuous editing
    selection.removeAllRanges();
    const endRange = document.createRange();
    endRange.setStartAfter(span);
    endRange.collapse(true);
    selection.addRange(endRange);
  };

  // Text formatting handlers
  const handleBold = () => {
    const selectionData = getSelectedText();
    if (selectionData && selectionData.text) {
      applyFormatToSelection(span => {
        span.style.fontWeight = 'bold';
        span.textContent = selectionData.text;
      });
    } else {
      setEditorContent(`<strong>${editorContent}</strong>`);
    }
  };

  const handleItalic = () => {
    const selectionData = getSelectedText();
    if (selectionData && selectionData.text) {
      applyFormatToSelection(span => {
        span.style.fontStyle = 'italic';
        span.textContent = selectionData.text;
      });
    } else {
      setEditorContent(`<em>${editorContent}</em>`);
    }
  };

  const handleUnderline = () => {
    const selectionData = getSelectedText();
    if (selectionData && selectionData.text) {
      applyFormatToSelection(span => {
        span.style.textDecoration = 'underline';
        span.textContent = selectionData.text;
      });
    } else {
      setEditorContent(`<u>${editorContent}</u>`);
    }
  };

  const handleAlignment = (alignment: string) => {
    setEditorContent(`<div style="text-align: ${alignment}">${editorContent}</div>`);
  };
  
  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    const selectionData = getSelectedText();
    
    if (selectionData && selectionData.text) {
      applyFormatToSelection(span => {
        span.style.color = color;
        span.textContent = selectionData.text;
      });
    } else {
      setEditorContent(`<span style="color: ${color}">${editorContent}</span>`);
    }
    
    setShowColorPicker(false);
  };
  
  const handleGradientChange = (gradient: string) => {
    setSelectedColor(gradient);
    const selectionData = getSelectedText();
    
    if (selectionData && selectionData.text) {
      applyFormatToSelection(span => {
        // Apply proper gradient styling with all necessary properties
        span.style.backgroundImage = gradient;
        span.style.webkitBackgroundClip = 'text';
        span.style.backgroundClip = 'text';  // Standard property
        span.style.webkitTextFillColor = 'transparent';
        span.style.color = 'transparent';    // Fallback for non-webkit
        span.style.display = 'inline-block'; // Ensures gradient applies properly
        span.textContent = selectionData.text;
      });
    } else {
      // If no selection, apply to entire content with all necessary properties
      setEditorContent(
        `<span style="background-image: ${gradient}; -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent; display: inline-block;">${editorContent}</span>`
      );
    }
    
    setShowColorPicker(false);
  };
  
  // Font change handler removed as requested

  // Image handlers
  const handleImageSelect = (imageUrl: string) => {
    // In a real implementation, this would open a file picker or media library
    console.log(`Selected image: ${imageUrl}`);
  };

  // Gallery handlers
  const toggleImageSelection = (image: typeof MOCK_IMAGES[0]) => {
    if (selectedImages.some(img => img.id === image.id)) {
      setSelectedImages(selectedImages.filter(img => img.id !== image.id));
    } else {
      setSelectedImages([...selectedImages, image]);
    }
  };

  // Handle icon selection
  const handleIconSelect = (iconName: string) => {
    setSelectedIcon(iconName);
    setShowIconPicker(false);
  };

  // Get icon component by name
  const getIconByName = (name: string) => {
    const icon = AVAILABLE_ICONS.find(i => i.name === name);
    if (icon) {
      const IconComponent = icon.component;
      return <IconComponent className="h-5 w-5" />;
    }
    return <Clock className="h-5 w-5" />;
  };
  
  // Handle text style selection
  const handleTextStyleChange = (style: string) => {
    setSelectedTextStyle(style);
    setShowTextStylePicker(false);
    
    // Apply the style to the selected text or entire content
    const selectionData = getSelectedText();
    if (selectionData && selectionData.text) {
      const textStyle = TEXT_STYLES.find(s => s.value === style);
      if (textStyle) {
        applyFormatToSelection(span => {
          span.className = textStyle.className;
          span.textContent = selectionData.text;
        });
      }
    } else {
      // Apply to entire content
      const textStyle = TEXT_STYLES.find(s => s.value === style);
      if (textStyle) {
        setEditorContent(`<div class="${textStyle.className}">${editorContent}</div>`);
      }
    }
  };
  
  // Handle font size selection
  const handleFontSizeChange = (size: string) => {
    setSelectedFontSize(size);
    setShowFontSizePicker(false);
    
    // Apply the font size to the selected text or entire content
    const selectionData = getSelectedText();
    if (selectionData && selectionData.text) {
      applyFormatToSelection(span => {
        span.style.fontSize = size;
        span.textContent = selectionData.text;
      });
    } else {
      // Apply to entire content
      setEditorContent(`<span style="font-size: ${size}">${editorContent}</span>`);
    }
  };
  
  // Get text style component by value
  const getTextStyleComponent = (value: string) => {
    const textStyle = TEXT_STYLES.find(s => s.value === value);
    if (textStyle) {
      const StyleComponent = textStyle.component;
      return <StyleComponent className="h-5 w-5" />;
    }
    return <Pilcrow className="h-5 w-5" />;
  };
  
  // Find a placeholder by ID
  const findPlaceholderById = (id: string): Placeholder | undefined => {
    return PLACEHOLDERS.find(p => p.id === id);
  };
  
  // Render editor for a specific component or field by ID
  const renderComponentEditor = (id: string) => {
    // For debugging
    console.log(`Rendering editor for component: ${id}`);
    
    // Find the corresponding placeholder for this component/field
    const placeholder = findPlaceholderById(id);
    
    if (!placeholder) {
      console.log(`No placeholder found for ${id}, creating temporary one`);
      
      // Handle icon field
      if (id.includes('field-icon') || id.includes('icon-selector')) {
        
        // Function to handle icon file upload
        const handleIconUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
          const files = event.target.files;
          if (!files || files.length === 0) return;
          
          const file = files[0];
          // Check if file is an image and not too large
          if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
          }
          
          if (file.size > 1024 * 1024) { // 1MB limit
            alert('File size should be less than 1MB');
            return;
          }
          
          const url = URL.createObjectURL(file);
          setCustomIconUrl(url);
          setSelectedIcon('custom');
          setIsUploadModalOpen(false);
        };
        
        return (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 mb-4">
              {AVAILABLE_ICONS.map((icon) => {
                const IconComponent = icon.component;
                return (
                  <button
                    key={icon.name}
                    onClick={() => {
                      setSelectedIcon(icon.name);
                      setCustomIconUrl(null); // Clear custom icon when selecting a built-in one
                    }}
                    className={`w-10 h-10 rounded flex items-center justify-center ${
                      selectedIcon === icon.name 
                        ? 'bg-purple-100 text-purple-600 ring-1 ring-purple-500' 
                        : 'hover:bg-gray-100 border border-gray-200'
                    }`}
                    title={icon.name}
                  >
                    <IconComponent className="h-5 w-5" />
                  </button>
                );
              })}
              
              {/* Custom icon button (if uploaded) */}
              {customIconUrl && (
                <button
                  onClick={() => setSelectedIcon('custom')}
                  className={`w-10 h-10 rounded flex items-center justify-center ${
                    selectedIcon === 'custom' 
                      ? 'bg-purple-100 ring-1 ring-purple-500' 
                      : 'hover:bg-gray-100 border border-gray-200'
                  }`}
                  title="Custom Icon"
                >
                  <img src={customIconUrl} alt="Custom" className="h-5 w-5 object-contain" />
                </button>
              )}
              
              {/* Upload button */}
              <label 
                className="w-10 h-10 rounded flex items-center justify-center border border-dashed border-gray-300 text-gray-400 hover:text-gray-600 hover:border-gray-400 cursor-pointer"
                title="Upload custom icon"
                onClick={() => setIsUploadModalOpen(true)}
              >
                <Plus className="h-4 w-4" />
              </label>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md border border-gray-200">
              <div className="p-2 bg-white rounded-md border border-gray-200">
                {selectedIcon === 'custom' && customIconUrl ? (
                  <img src={customIconUrl} alt="Custom" className="h-5 w-5 object-contain" />
                ) : (
                  getIconByName(selectedIcon)
                )}
              </div>
              <div>
                <p className="text-sm font-medium">{selectedIcon === 'custom' ? 'Custom Icon' : selectedIcon}</p>
                <p className="text-xs text-gray-500">Selected icon</p>
              </div>
            </div>
            
            {/* Upload Modal */}
            {isUploadModalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Upload Custom Icon</h3>
                    <button 
                      onClick={() => setIsUploadModalOpen(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-md bg-gray-50">
                      <div className="text-center">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600 mb-2">Upload an SVG, PNG, or JPG icon</p>
                        <label className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors cursor-pointer inline-flex items-center">
                          <Upload className="h-4 w-4 mr-1" />
                          Select File
                          <input
                            type="file"
                            accept="image/svg+xml,image/png,image/jpeg"
                            className="hidden"
                            onChange={handleIconUpload}
                          />
                        </label>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      <p>• Recommended size: 24x24 pixels</p>
                      <p>• Maximum file size: 1MB</p>
                      <p>• Supported formats: SVG, PNG, JPG</p>
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        onClick={() => setIsUploadModalOpen(false)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      }
      
      // Handle URL field
      if (id.includes('url-field')) {
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Link className="h-4 w-4 text-gray-500" />
              <label className="text-sm font-medium text-gray-700">URL</label>
            </div>
            <div className="flex">
              <input
                type="text"
                className="flex-1 p-2 border border-gray-300 rounded-md"
                placeholder="https://example.com"
              />
              <button className="ml-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-md border border-gray-300 hover:bg-gray-200">
                Test
              </button>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <input type="checkbox" id="open-new-tab" className="rounded text-purple-600" />
              <label htmlFor="open-new-tab" className="text-sm text-gray-600">Open in new tab</label>
            </div>
          </div>
        );
      }
      
      // Rich text editor for text fields
      if (id.includes('rich-text')) {
        // Use the simplified TiptapEditor without toolbar
        return (
          <div className="space-y-4">
            <TiptapEditor
              content="<p>This is a simplified rich text editor field. You can format text naturally without a toolbar.</p>"
              onChange={(content) => {
                console.log('Rich text content changed:', content);
              }}
              placeholder="Enter your text here..."
            />
          </div>
        );
      } else if (id.includes('image')) {
        // Create a temporary image editor
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-md bg-gray-50">
              <div className="text-center">
                <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 mb-2">Drag and drop an image here, or click to select</p>
                <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                  <Upload className="h-4 w-4 inline mr-1" />
                  Upload Image
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image Title
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter image title (will be used as slug)"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alt Text
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Descriptive text for accessibility"
              />
            </div>
          </div>
        );
      } else if (id.includes('button')) {
        // Create a temporary button editor
        return (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Button Text
                </label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Enter button text"
                  defaultValue="Click Me"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL
                </label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="https://example.com"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Button Style
                </label>
                <select className="w-full p-2 border border-gray-300 rounded-md">
                  <option>Primary</option>
                  <option>Secondary</option>
                  <option>Outline</option>
                  <option>Ghost</option>
                </select>
              </div>
              
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Preview:</h4>
                <div className="p-4 bg-white rounded border border-gray-200 flex justify-center">
                  <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                    Click Me
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      }
      
      // Default editor for unknown types
      return (
        <div className="p-4 bg-white rounded-md border border-gray-200">
          <div className="flex items-center mb-4">
            <Layout className="h-5 w-5 text-gray-500 mr-2" />
            <h3 className="text-lg font-medium">Field Editor</h3>
          </div>
          <div className="p-4 border border-gray-200 rounded-md min-h-[150px]">
            <div className="flex flex-col space-y-4">
              <input 
                type="text" 
                className="w-full p-2 border border-gray-300 rounded-md" 
                placeholder="Enter content..."
              />
              <textarea 
                className="w-full p-2 border border-gray-300 rounded-md min-h-[100px]" 
                placeholder="Additional details..."
              />
            </div>
          </div>
        </div>
      );
    }
    
    // If we found the placeholder, use its type to determine the editor
    console.log(`Found placeholder for ${id}:`, placeholder);
    
    // Based on the placeholder type, return the appropriate editor
    switch (placeholder.type) {
      case 'heading':
      case 'paragraph':
        return (
          <div className="space-y-4">
            <TiptapEditor
              content={selectedPlaceholder.defaultContent || '<p>Enter your text here...</p>'}
              onChange={(content) => setEditorContent(content)}
              placeholder={selectedPlaceholder.type === 'heading' ? 'Enter heading text...' : 'Enter paragraph text...'}
            />
          </div>
        );
      
      case 'image':
        return (
          <ImageEditor
            imageUrl={selectedSingleImage || ''}
            imageTitle={imageTitle}
            imageAlt={imageAlt}
            onImageChange={(imageUrl) => setSelectedSingleImage(imageUrl)}
            onTitleChange={(title) => setImageTitle(title)}
            onAltChange={(alt) => setImageAlt(alt)}
          />
        );
        
      case 'video':
        return (
          <VideoEditor
            videoUrl={videoUrl}
            onUrlChange={(url) => setVideoUrl(url)}
          />
        );
      
      case 'gallery':
        return (
          <GalleryEditor
            images={galleryImages}
            galleryTitle={galleryTitle}
            onImagesChange={(images) => {
              setGalleryImages(images);
              setSelectedImages(images);
            }}
            onTitleChange={(title) => setGalleryTitle(title)}
          />
        );
        
      case 'carousel':
        return (
          <CarouselEditor
            images={carouselImages}
            carouselTitle={carouselTitle}
            onImagesChange={(images) => {
              setCarouselImages(images);
              setSelectedImages(images);
            }}
            onTitleChange={(title) => setCarouselTitle(title)}
          />
        );
      
      case 'button':
        return (
          <ButtonEditor
            buttonText={placeholder.defaultContent || "Click Me"}
            buttonUrl="/contact"
            onTextChange={(text) => console.log('Button text changed:', text)}
            onUrlChange={(url) => console.log('Button URL changed:', url)}
          />
        );
      
      default:
        return (
          <div className="p-4 bg-gray-100 rounded-md">
            <p className="text-gray-600">Editor not available for this placeholder type.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 h-full overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Library</h2>
        </div>

        {/* Database Preview selector */}
        <div className="p-3 border-b border-gray-100">
          <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">Database Preview</h3>
          <div className="space-y-2">
            <label className="text-xs text-gray-500">Tenant pages</label>
            <select
              className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
              value={selectedDbPageId}
              onChange={(e) => setSelectedDbPageId(e.target.value)}
              disabled={loadingPages || !dbPages.length}
            >
              <option value="">{loadingPages ? 'Loading pages...' : 'Select a page'}</option>
              {dbPages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.page_name} ({p.slug})
                </option>
              ))}
            </select>
            {selectedDbPageId && (
              <p className="text-[11px] text-gray-500">
                Theme: {dbPageThemeId || 'default'}
              </p>
            )}
          </div>
        </div>

        {/* Main Categories */}
        <div className="p-3 border-b border-gray-100">
          <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">Categories</h3>
          <nav>
            <ul className="space-y-1">
              {categories.map((category) => (
                <li key={category}>
                  <button
                    onClick={() => {
                      setActiveCategory(category);
                      setSearchQuery(''); // Clear search when changing category
                    }}
                    className={`w-full flex items-center px-3 py-2 text-left rounded-md transition-colors ${
                      activeCategory === category
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {getCategoryIcon(category)}
                    <span className="ml-2 capitalize">{category === 'All' ? 'All Components' : category}</span>
                    {activeCategory === category && (
                      <span className="ml-auto text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">
                        {category === 'All' 
                          ? allComponents.length 
                          : allComponents.filter(c => c.category === category).length}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Documentation Link */}
        <div className="p-3 mt-auto border-t border-gray-200">
          <a 
            href="#" 
            className="flex items-center px-3 py-2 text-sm text-blue-600 hover:text-blue-800"
          >
            <Info className="h-4 w-4 mr-2" />
            Documentation
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="p-6">
          {/* Database-driven visual preview (no hard-coded copy) */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Database Preview</h2>
                <p className="text-sm text-gray-500">
                  Renders live content from the database using the active theme's components.
                </p>
              </div>
              {loadingLayout && (
                <div className="text-sm text-gray-500">Loading layout...</div>
              )}
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              {selectedDbPageId ? (
                dbPageLayout?.components && dbPageLayout.components.length > 0 ? (
                  <ErrorBoundary
                    fallback={
                      <div className="p-4 text-center text-gray-500">
                        <p className="text-sm">Unable to render database preview.</p>
                      </div>
                    }
                  >
                    <VisualEditorRenderer
                      components={dbPageLayout.components}
                      registry={resolveThemeRegistry(dbPageThemeId)}
                      compact={false}
                    />
                  </ErrorBoundary>
                ) : (
                  <div className="text-sm text-gray-500">
                    {loadingLayout ? 'Loading content...' : 'This page has no components yet.'}
                  </div>
                )
              ) : (
                <div className="text-sm text-gray-500">
                  Select a page from the sidebar to preview its live content.
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {activeCategory === 'All' ? 'All Components' : activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}
              </h1>
              <p className="text-gray-500 mt-1">
                {filteredComponents.length} {filteredComponents.length === 1 ? 'component' : 'components'} available
                {activeCategory !== 'All' && ` in ${activeCategory} category`}
              </p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 flex items-center gap-2 hover:bg-gray-50">
                <Plus className="h-4 w-4" />
                <span>Create New</span>
              </button>
            </div>
          </div>

          {/* Filter and Sort */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Search components..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm w-64"
              />
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">Sort by:</span>
              <select className="px-2 py-1 border border-gray-300 rounded-md">
                <option>Name</option>
                <option>Recently Updated</option>
                <option>Type</option>
              </select>
            </div>
          </div>

          {/* Components Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredComponents.map((component) => {
              const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
                content: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
                media: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
                navigation: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
                form: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
                layout: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
                interactive: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
              };
              const colors = categoryColors[component.category || 'content'] || categoryColors.content;

              return (
                <div 
                  key={component.id} 
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className={`p-1.5 ${colors.bg} rounded-md mr-3`}>
                          {getComponentIcon(component)}
                        </div>
                        <h3 className="font-medium text-gray-900">{component.name}</h3>
                      </div>
                      <span className={`text-xs px-2 py-1 ${colors.bg} ${colors.text} rounded-full capitalize`}>
                        {component.category || 'content'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {component.description || 'No description available'}
                    </p>
                    {component.tags && component.tags.length > 0 && (
                      <div className="mt-2">
                        <div className="flex flex-wrap gap-1">
                          {component.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full">
                              {tag}
                            </span>
                          ))}
                          {component.tags.length > 3 && (
                            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full">
                              +{component.tags.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    {component.properties && Object.keys(component.properties).length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">
                          {Object.keys(component.properties).length} {Object.keys(component.properties).length === 1 ? 'property' : 'properties'}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="px-4 py-2 bg-gray-50 flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      v{component.version}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewJSON(component)}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                        title="View JSON structure"
                      >
                        <Code className="h-4 w-4 mr-1" />
                        <span>JSON</span>
                      </button>
                      <button
                        onClick={() => handlePreview(component)}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
                        title="Preview component"
                      >
                        <Monitor className="h-4 w-4 mr-1" />
                        <span>Preview</span>
                      </button>
                      <button
                        onClick={() => setSelectedComponent(component)}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        <span>View</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredComponents.length === 0 && (
            <div className="p-8 text-center bg-white rounded-lg shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Layout className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No components found</h3>
              <p className="text-gray-500 mb-4">
                {searchQuery 
                  ? `No components match "${searchQuery}"`
                  : activeCategory !== 'All' 
                    ? `No components found in ${activeCategory} category`
                    : 'No components available'}
              </p>
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors mr-2"
                >
                  Clear Search
                </button>
              )}
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Create New Component
              </button>
            </div>
          )}
        </div>
      </div>

      {/* JSON View Modal */}
      {jsonViewComponent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div className="flex items-center">
                <Code className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="text-xl font-semibold text-gray-900">
                  {jsonViewComponent.name} - JSON Structure
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyJSON}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  title="Copy JSON to clipboard"
                >
                  {jsonCopied ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copy JSON</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setJsonViewComponent(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-6 bg-gray-50">
              <pre className="bg-white p-4 rounded-lg border border-gray-200 overflow-auto text-sm font-mono text-gray-800 whitespace-pre-wrap break-words">
                {getFormattedJSON(jsonViewComponent)}
              </pre>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setJsonViewComponent(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Component Preview Modal */}
      {previewComponent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-6xl mx-4 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div className="flex items-center">
                {getComponentIcon(previewComponent)}
                <h3 className="text-xl font-semibold text-gray-900 ml-2">
                  {previewComponent.name} - Preview
                </h3>
                <span className="ml-2 text-sm font-normal text-gray-500">
                  (v{previewComponent.version})
                </span>
              </div>
              <button
                onClick={() => setPreviewComponent(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6 bg-gray-50">
              <div className="bg-white rounded-lg border border-gray-200 p-6 min-h-[400px]">
                <ErrorBoundary
                  fallback={
                    <div className="p-4 text-center text-gray-500">
                      <p className="text-sm">Unable to render component preview.</p>
                      <p className="text-xs mt-2 text-gray-400">
                        Component type: {previewComponent.type}
                      </p>
                    </div>
                  }
                >
                  <VisualEditorRenderer 
                    components={[convertToComponentSchema(previewComponent)]} 
                    compact={false}
                  />
                </ErrorBoundary>
              </div>
            </div>

            <div className="flex justify-between items-center p-6 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                <span className="font-medium">Category:</span> {previewComponent.category || 'N/A'}
                {previewComponent.description && (
                  <>
                    <span className="mx-2">•</span>
                    <span>{previewComponent.description}</span>
                  </>
                )}
              </div>
              <button
                onClick={() => setPreviewComponent(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Component Detail Modal */}
      {selectedComponent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                {getComponentIcon(selectedComponent)}
                <span className="ml-2">{selectedComponent.name}</span>
                <span className="ml-2 text-sm font-normal text-gray-500">
                  (v{selectedComponent.version})
                </span>
              </h3>
              <button
                onClick={() => setSelectedComponent(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto mb-6">
              <div className="space-y-4">
                {selectedComponent.description && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                    <p className="text-sm text-gray-600">{selectedComponent.description}</p>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Component Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Type:</span>
                      <span className="ml-2 font-medium">{selectedComponent.type}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Category:</span>
                      <span className="ml-2 font-medium capitalize">{selectedComponent.category}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Editor:</span>
                      <span className="ml-2 font-medium">{selectedComponent.editor}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Scope:</span>
                      <span className="ml-2 font-medium">{selectedComponent.tenant_scope || 'global'}</span>
                    </div>
                  </div>
                </div>

                {selectedComponent.tags && selectedComponent.tags.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedComponent.tags.map(tag => (
                        <span key={tag} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedComponent.properties && Object.keys(selectedComponent.properties).length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Properties</h4>
                    <div className="bg-gray-50 rounded-md p-4">
                      <div className="space-y-2">
                        {Object.entries(selectedComponent.properties).map(([key, prop]) => (
                          <div key={key} className="border-b border-gray-200 pb-2 last:border-0">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm text-gray-900">{key}</span>
                              <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                                {prop.type}
                              </span>
                            </div>
                            {prop.description && (
                              <p className="text-xs text-gray-600 mt-1">{prop.description}</p>
                            )}
                            <div className="flex gap-2 mt-1">
                              {prop.required && (
                                <span className="text-xs text-red-600">Required</span>
                              )}
                              {prop.editable && (
                                <span className="text-xs text-green-600">Editable</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-gray-200">
              <button
                onClick={() => setSelectedComponent(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Use Component
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Legacy Placeholder Editor Modal */}
      {selectedPlaceholder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                {selectedPlaceholder.category === 'Fields' && (
                  <>
                    <Type className="h-5 w-5 mr-2 text-blue-600" />
                    {selectedPlaceholder.name} Field Editor
                  </>
                )}
                {selectedPlaceholder.category === 'Components' && (
                  <>
                    <Layout className="h-5 w-5 mr-2 text-purple-600" />
                    {selectedPlaceholder.name} Component Editor
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      (All fields on one page)
                    </span>
                  </>
                )}
                {selectedPlaceholder.category === 'Sections' && (
                  <>
                    <Layers className="h-5 w-5 mr-2 text-green-600" />
                    {selectedPlaceholder.name} Section Editor
                  </>
                )}
              </h3>
              <button
                onClick={() => setSelectedPlaceholder(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Component Tabs for Sections */}
            {selectedPlaceholder.category === 'Sections' && selectedPlaceholder.components && (
              <div className="border-b border-gray-200 mb-4">
                <div className="flex overflow-x-auto">
                  {selectedPlaceholder.components.map((componentId, index) => {
                    const componentName = componentId.replace('component-', '').replace('field-', '');
                    const isField = componentId.startsWith('field-');
                    let icon;

                    if (componentId.includes('heading')) {
                      icon = <Heading1 className="h-4 w-4 mr-1" />;
                    } else if (componentId.includes('paragraph')) {
                      icon = <Type className="h-4 w-4 mr-1" />;
                    } else if (componentId.includes('image')) {
                      icon = <ImageIcon className="h-4 w-4 mr-1" />;
                    } else if (componentId.includes('button')) {
                      icon = <Link className="h-4 w-4 mr-1" />;
                    } else {
                      icon = isField ? <Type className="h-4 w-4 mr-1" /> : <Layout className="h-4 w-4 mr-1" />;
                    }

                    return (
                      <button
                        key={componentId}
                        onClick={() => setActiveTabIndex(index)}
                        className={`flex items-center px-4 py-2 border-b-2 whitespace-nowrap ${
                          index === activeTabIndex
                            ? 'border-green-500 text-green-600 font-medium'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {icon}
                        <span className="capitalize">{componentName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Component Fields Header - No tabs */}
            {selectedPlaceholder.category === 'Components' && selectedPlaceholder.fields && (
              <div className="border-b border-gray-200 mb-4">
                <div className="px-1 py-2">
                  <p className="text-sm text-gray-500">
                    This component uses {selectedPlaceholder.fields.length} {selectedPlaceholder.fields.length === 1 ? 'field' : 'fields'}
                  </p>
                </div>
              </div>
            )}

            {/* Editor content with overflow */}
            <div className="flex-1 overflow-y-auto mb-6">
              {selectedPlaceholder.category === 'Sections' && selectedPlaceholder.components ? (
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="text-sm text-gray-500 mb-2">
                    Editing: <span className="font-medium">{
                      selectedPlaceholder.components[activeTabIndex]
                        .replace('field-', '')
                        .replace('component-', '')
                        .replace(/-/g, ' ')
                        .replace(/\b\w/g, l => l.toUpperCase())
                    }</span>
                  </div>
                  {renderComponentEditor(selectedPlaceholder.components[activeTabIndex])}
                </div>
              ) : selectedPlaceholder.category === 'Components' && selectedPlaceholder.fields ? (
                <div className="space-y-8">
                  {selectedPlaceholder.fields.map((fieldId, index) => {
                    const fieldName = fieldId.replace('field-', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    let icon;

                    if (fieldId.includes('rich-text')) {
                      icon = <Type className="h-5 w-5 text-blue-600" />;
                    } else if (fieldId.includes('image')) {
                      icon = <ImageIcon className="h-5 w-5 text-blue-600" />;
                    } else if (fieldId.includes('icon')) {
                      icon = <Award className="h-5 w-5 text-blue-600" />;
                    } else if (fieldId.includes('url')) {
                      icon = <Link className="h-5 w-5 text-blue-600" />;
                    } else {
                      icon = <Type className="h-5 w-5 text-blue-600" />;
                    }

                    return (
                      <div key={fieldId} className="bg-gray-50 p-4 rounded-md border border-gray-200">
                        <div className="flex items-center mb-3 pb-2 border-b border-gray-200">
                          {icon}
                          <h3 className="ml-2 font-medium text-gray-900">{fieldName}</h3>
                        </div>
                        {renderComponentEditor(fieldId)}
                      </div>
                    );
                  })}
                </div>
              ) : (
                // Render the default editor for this placeholder type
                <div className="bg-gray-50 p-4 rounded-md">
                  {renderComponentEditor(selectedPlaceholder.id)}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-gray-200">
              <button
                onClick={() => setSelectedPlaceholder(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Wrapper component that includes the CMS sidebar
const ComponentsViewer = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Check if user is authenticated and is super admin
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brandPurple"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">Authentication Required</h2>
          <p className="text-muted-foreground mb-4">
            You need to be logged in to access the components viewer.
          </p>
          <button
            onClick={() => navigate('/auth')}
            className="px-4 py-2 bg-brandPurple text-white rounded-lg hover:bg-brandPurple/90 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (!user.is_super_admin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">
            You need super admin privileges to access the components viewer.
          </p>
          <button
            onClick={() => navigate('/admin')}
            className="px-4 py-2 bg-brandPurple text-white rounded-lg hover:bg-brandPurple/90 transition-colors"
          >
            Go to Admin
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">Error Loading Components Viewer</h2>
            <p className="text-muted-foreground mb-4">
              An error occurred while loading the components viewer. Please refresh the page or contact support.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-brandPurple text-white rounded-lg hover:bg-brandPurple/90 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      }
    >
      <SpartiCMSWrapper>
        <ComponentsViewerContent />
      </SpartiCMSWrapper>
    </ErrorBoundary>
  );
};

export default ComponentsViewer;