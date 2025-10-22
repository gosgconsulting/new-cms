import React, { useState } from 'react';
import { SpartiCMSWrapper } from '../../sparti-cms';
import { useAuth } from '../../sparti-cms/components/auth/AuthProvider';
import { Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  ChevronDown
} from 'lucide-react';

// Component placeholder types
type PlaceholderType = 'heading' | 'paragraph' | 'image' | 'video' | 'gallery' | 'carousel' | 'section' | 'icon-text' | 'icon-heading' | 'badge' | 'button' | 'hero' | 'icon';
type CategoryType = 'Sections' | 'Components' | 'Fields' | 'All';
type SubCategoryType = 'Text' | 'Media' | 'Layout' | 'UI' | 'Hero' | 'Feature' | 'CTA' | 'None';

interface Placeholder {
  id: string;
  name: string;
  type: PlaceholderType;
  description: string;
  createdAt: string;
  updatedAt: string;
  category: CategoryType;
  subcategory: SubCategoryType;
  defaultContent?: string;
  fields?: string[];
  components?: string[];
}

// Hardcoded placeholders
const PLACEHOLDERS: Placeholder[] = [
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
  const [activeCategory, setActiveCategory] = useState<CategoryType>('Sections');
  const [activeSubcategory, setActiveSubcategory] = useState<SubCategoryType | 'All'>('All');
  const [selectedPlaceholder, setSelectedPlaceholder] = useState<Placeholder | null>(null);
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

  const getCategoryIcon = (subcategory: SubCategoryType) => {
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
  
  // Filter placeholders based on active category and subcategory
  const filteredPlaceholders = activeCategory === 'All' 
    ? PLACEHOLDERS 
    : activeSubcategory === 'All'
      ? PLACEHOLDERS.filter(p => p.category === activeCategory)
      : PLACEHOLDERS.filter(p => p.category === activeCategory && p.subcategory === activeSubcategory);

  // Main categories
  const categories: CategoryType[] = ['Sections', 'Components', 'Fields'];
  
  // Subcategories for the active main category
  const subcategories = getSubcategories(activeCategory);

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
        // Create a rich text editor that can handle all text types
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-2 border-b border-gray-200 bg-gray-50 rounded-t-md">
              <div className="relative">
                <button className="flex items-center py-1 px-2 hover:bg-gray-100 rounded border border-gray-200">
                  <Type className="h-4 w-4 mr-1 text-gray-500" />
                  <span className="text-sm text-gray-700">Paragraph</span>
                  <ChevronDown className="h-3 w-3 ml-1 text-gray-500" />
                </button>
              </div>
              
              <div className="h-6 border-r border-gray-300 mx-1"></div>
              
              <button className="p-2 hover:bg-gray-200 rounded">
                <Bold className="h-4 w-4" />
              </button>
              <button className="p-2 hover:bg-gray-200 rounded">
                <Italic className="h-4 w-4" />
              </button>
              <button className="p-2 hover:bg-gray-200 rounded">
                <Underline className="h-4 w-4" />
              </button>
              
              <div className="h-6 border-r border-gray-300 mx-1"></div>
              
              <button className="p-2 hover:bg-gray-200 rounded">
                <AlignLeft className="h-4 w-4" />
              </button>
              <button className="p-2 hover:bg-gray-200 rounded">
                <AlignCenter className="h-4 w-4" />
              </button>
              <button className="p-2 hover:bg-gray-200 rounded">
                <AlignRight className="h-4 w-4" />
              </button>
              
              <div className="h-6 border-r border-gray-300 mx-1"></div>
              
              <button className="p-2 hover:bg-gray-200 rounded">
                <Link className="h-4 w-4" />
              </button>
              
              <button className="p-2 hover:bg-gray-200 rounded">
                <Palette className="h-4 w-4" />
              </button>
            </div>
            
            <div className="w-full p-3 border border-gray-300 rounded-b-md focus-within:ring-1 focus-within:ring-blue-400 focus-within:border-blue-400" style={{ minHeight: '200px' }}>
              <div
                contentEditable
                suppressContentEditableWarning
                className="outline-none min-h-[1.5em] w-full"
                data-placeholder="Enter text..."
              >
                This is a rich text editor field. You can format text as headings, paragraphs, or quotes using the toolbar.
              </div>
            </div>
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
            <div className="flex items-center gap-2 p-2 border-b border-gray-200 bg-gray-50 rounded-t-md">
              <div className="relative">
                <button className="flex items-center py-1 px-2 hover:bg-gray-100 rounded border border-gray-200">
                  <Type className="h-4 w-4 mr-1 text-gray-500" />
                  <span className="text-sm text-gray-700">Paragraph</span>
                  <ChevronDown className="h-3 w-3 ml-1 text-gray-500" />
                </button>
              </div>
              
              <div className="h-6 border-r border-gray-300 mx-1"></div>
              
              <button className="p-2 hover:bg-gray-200 rounded">
                <Bold className="h-4 w-4" />
              </button>
              <button className="p-2 hover:bg-gray-200 rounded">
                <Italic className="h-4 w-4" />
              </button>
              <button className="p-2 hover:bg-gray-200 rounded">
                <Underline className="h-4 w-4" />
              </button>
              
              <div className="h-6 border-r border-gray-300 mx-1"></div>
              
              <button className="p-2 hover:bg-gray-200 rounded">
                <AlignLeft className="h-4 w-4" />
              </button>
              <button className="p-2 hover:bg-gray-200 rounded">
                <AlignCenter className="h-4 w-4" />
              </button>
              <button className="p-2 hover:bg-gray-200 rounded">
                <AlignRight className="h-4 w-4" />
              </button>
              
              <div className="h-6 border-r border-gray-300 mx-1"></div>
              
              <button className="p-2 hover:bg-gray-200 rounded">
                <Link className="h-4 w-4" />
              </button>
              
              {/* Color Picker */}
              <div className="relative">
                <button 
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="flex items-center p-2 hover:bg-gray-200 rounded"
                >
                  <Palette className="h-4 w-4" />
                </button>
                
                {showColorPicker && (
                  <div className="absolute z-10 mt-1 w-64 bg-white rounded-md shadow-lg border border-gray-200">
                    <div className="p-2 border-b border-gray-200">
                      <p className="text-xs font-medium text-gray-500">Brand Colors</p>
                    </div>
                    <div className="p-2 grid grid-cols-4 gap-2">
                      {BRANDING_COLORS.map((color) => (
                        <button
                          key={color.name}
                          onClick={() => handleColorChange(color.value)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center"
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Direct Editor with Live Preview */}
            <div 
              className={`w-full p-3 border border-gray-300 rounded-b-md focus-within:ring-1 focus-within:ring-blue-400 focus-within:border-blue-400`}
              style={{ 
                minHeight: '200px',
                fontSize: selectedFontSize
              }}
            >
              <div
                contentEditable
                suppressContentEditableWarning
                dangerouslySetInnerHTML={{ __html: editorContent || (selectedPlaceholder.defaultContent || '') }}
                onInput={(e) => {
                  // Get the current content directly from the element
                  const content = e.currentTarget.innerHTML;
                  setEditorContent(content);
                }}
                className={`outline-none min-h-[1.5em] w-full ${
                  TEXT_STYLES.find(s => s.value === selectedTextStyle)?.className || ''
                }`}
                data-placeholder={selectedPlaceholder.type === 'heading' ? "Enter heading text..." : "Enter paragraph text..."}
                spellCheck="false"
                dir="ltr" // Explicitly set left-to-right text direction
              />
            </div>
          </div>
        );
      
      case 'image': {
        // Function to handle file selection
        const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
          const files = event.target.files;
          if (!files || files.length === 0) return;
          
          const file = files[0]; // Take only the first file
          const url = URL.createObjectURL(file);
          setSelectedSingleImage(url);
          
          // Auto-fill the image title with the file name (without extension)
          const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
          setImageTitle(fileName);
        };
        
        return (
          <div className="space-y-6">
            {!selectedSingleImage ? (
              // No image selected - show upload area
              <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-md bg-gray-50">
                <div className="text-center">
                  <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 mb-2">Drag and drop an image here, or click to select</p>
                  <label className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors cursor-pointer inline-flex items-center">
                    <Upload className="h-4 w-4 mr-1" />
                    Upload Image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageSelect}
                    />
                  </label>
                </div>
              </div>
            ) : (
              // Image selected - show preview
              <div className="space-y-4">
                <div className="relative">
                  <img 
                    src={selectedSingleImage} 
                    alt={imageAlt || imageTitle} 
                    className="w-full h-auto max-h-64 object-contain rounded-md border border-gray-200"
                  />
                  <button
                    onClick={() => setSelectedSingleImage(null)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="flex justify-end">
                  <label className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors cursor-pointer inline-flex items-center text-sm">
                    <Upload className="h-3 w-3 mr-1" />
                    Change Image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageSelect}
                    />
                  </label>
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image Title
              </label>
              <input
                type="text"
                value={imageTitle}
                onChange={(e) => setImageTitle(e.target.value)}
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
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Descriptive text for accessibility"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image Settings
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Display Size</label>
                  <select className="w-full p-2 border border-gray-300 rounded-md text-sm">
                    <option value="full">Full Width</option>
                    <option value="medium">Medium</option>
                    <option value="small">Small</option>
                    <option value="thumbnail">Thumbnail</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Alignment</label>
                  <select className="w-full p-2 border border-gray-300 rounded-md text-sm">
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );
      }
        
      case 'video':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Video URL (YouTube or Vimeo)
              </label>
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Video Title
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter video title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Video Caption
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter a caption for this video"
              />
            </div>
          </div>
        );
      
      case 'gallery': {
        // Function to remove an image from the gallery
        const removeGalleryImage = (imageId: string) => {
          const updatedImages = galleryImages.filter(img => img.id !== imageId);
          setGalleryImages(updatedImages);
          setSelectedImages(updatedImages);
        };
        
        // Function to handle gallery image selection
        const handleGalleryImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
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
        
        return (
          <div className="space-y-6">
            {galleryImages.length === 0 ? (
              // Empty state - show upload area
              <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-md bg-gray-50">
                <div className="text-center">
                  <Grid className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 mb-2">Upload multiple images for gallery</p>
                  <label className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors cursor-pointer inline-flex items-center">
                    <Upload className="h-4 w-4 mr-1" />
                    Select Images
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleGalleryImageSelect}
                    />
                  </label>
                </div>
              </div>
            ) : (
              // Images selected - show grid of images with upload button
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {galleryImages.map(image => (
                    <div key={image.id} className="relative group">
                      <img 
                        src={image.url} 
                        alt={image.alt} 
                        className="w-full h-32 object-cover rounded-md border border-gray-200"
                      />
                      <button
                        onClick={() => removeGalleryImage(image.id)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  
                  {/* Add more images button */}
                  <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-md bg-gray-50">
                    <label className="cursor-pointer text-center p-2">
                      <Plus className="h-8 w-8 text-gray-400 mx-auto mb-1" />
                      <span className="text-sm text-gray-500">Add More</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleGalleryImageSelect}
                      />
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setGalleryImages([]);
                      setSelectedImages([]);
                    }}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gallery Title
              </label>
              <input
                type="text"
                value={galleryTitle}
                onChange={(e) => setGalleryTitle(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter gallery title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Layout Style
              </label>
              <select className="w-full p-2 border border-gray-300 rounded-md">
                <option value="grid">Grid</option>
                <option value="masonry">Masonry</option>
                <option value="slider">Slider</option>
              </select>
            </div>
          </div>
        );
      }
        
      case 'carousel': {
        // Function to handle file selection
        const handleCarouselSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
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
          
          // Add the new images to the carousel images
          setCarouselImages([...carouselImages, ...newImages]);
          setSelectedImages([...carouselImages, ...newImages]);
        };
        
        // Function to remove an image from the carousel
        const removeCarouselImage = (imageId: string) => {
          const updatedImages = carouselImages.filter(img => img.id !== imageId);
          setCarouselImages(updatedImages);
          setSelectedImages(updatedImages);
        };
        
        // Function to reorder images
        const moveCarouselImage = (index: number, direction: 'up' | 'down') => {
          if (
            (direction === 'up' && index === 0) || 
            (direction === 'down' && index === carouselImages.length - 1)
          ) {
            return; // Can't move further
          }
          
          const newIndex = direction === 'up' ? index - 1 : index + 1;
          const updatedImages = [...carouselImages];
          const temp = updatedImages[index];
          updatedImages[index] = updatedImages[newIndex];
          updatedImages[newIndex] = temp;
          
          setCarouselImages(updatedImages);
          setSelectedImages(updatedImages);
        };
        
        return (
          <div className="space-y-6">
            {carouselImages.length === 0 ? (
              // Empty state - show upload area
              <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-md bg-gray-50">
                <div className="text-center">
                  <Layers className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 mb-2">Upload images for carousel</p>
                  <label className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors cursor-pointer inline-flex items-center">
                    <Upload className="h-4 w-4 mr-1" />
                    Select Images
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleCarouselSelect}
                    />
                  </label>
                </div>
              </div>
            ) : (
              // Images selected - show carousel preview
              <div className="space-y-4">
                {/* Carousel preview */}
                <div className="relative bg-gray-100 rounded-lg p-4 border border-gray-200">
                  <div className="flex overflow-x-auto space-x-2 pb-4">
                    {carouselImages.map((image, index) => (
                      <div key={image.id} className="relative flex-shrink-0 w-48">
                        <img 
                          src={image.url} 
                          alt={image.alt} 
                          className="w-full h-32 object-cover rounded-md border border-gray-200"
                        />
                        <div className="absolute top-2 right-2 flex space-x-1">
                          <button
                            onClick={() => removeCarouselImage(image.id)}
                            className="bg-red-500 text-white rounded-full p-1"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="absolute bottom-2 right-2 flex space-x-1">
                          <button
                            onClick={() => moveCarouselImage(index, 'up')}
                            disabled={index === 0}
                            className={`bg-gray-800 text-white rounded-full p-1 ${index === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <ChevronDown className="h-3 w-3 transform rotate-180" />
                          </button>
                          <button
                            onClick={() => moveCarouselImage(index, 'down')}
                            disabled={index === carouselImages.length - 1}
                            className={`bg-gray-800 text-white rounded-full p-1 ${index === carouselImages.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <ChevronDown className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="absolute bottom-2 left-2 bg-gray-800 text-white text-xs px-2 py-1 rounded-full">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                    
                    {/* Add more images button */}
                    <div className="flex-shrink-0 flex items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-md bg-white">
                      <label className="cursor-pointer text-center p-2">
                        <Plus className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                        <span className="text-xs text-gray-500">Add More</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={handleCarouselSelect}
                        />
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setCarouselImages([]);
                      setSelectedImages([]);
                    }}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Carousel Title
              </label>
              <input
                type="text"
                value={carouselTitle}
                onChange={(e) => setCarouselTitle(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter carousel title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Carousel Settings
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Autoplay</label>
                  <select className="w-full p-2 border border-gray-300 rounded-md text-sm">
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Navigation</label>
                  <select className="w-full p-2 border border-gray-300 rounded-md text-sm">
                    <option value="arrows">Arrows</option>
                    <option value="dots">Dots</option>
                    <option value="both">Both</option>
                    <option value="none">None</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );
      }
      
      case 'button':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Button Text</label>
              <input
                type="text"
                defaultValue={placeholder.defaultContent || "Click Me"}
                placeholder="Button text"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Button URL</label>
              <input
                type="text"
                defaultValue="/contact"
                placeholder="https://example.com"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Button Style</label>
              <div className="flex gap-2">
                <button className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">Primary</button>
                <button className="flex-1 px-4 py-2 bg-white text-purple-600 border border-purple-600 rounded-md hover:bg-purple-50">Secondary</button>
                <button className="flex-1 px-4 py-2 bg-transparent text-purple-600 hover:bg-purple-50 rounded-md">Ghost</button>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">Open in new tab</label>
                <div className="relative inline-block w-10 align-middle select-none">
                  <input type="checkbox" className="sr-only" />
                  <div className="w-10 h-5 bg-gray-200 rounded-full shadow-inner"></div>
                  <div className="absolute w-5 h-5 bg-white rounded-full shadow-md transform transition-transform left-0"></div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
              <p className="text-sm text-gray-500 mb-2">Preview:</p>
              <div className="flex justify-center">
                <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                  {placeholder.defaultContent || "Click Me"}
                </button>
              </div>
            </div>
          </div>
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
                      setActiveSubcategory('All');
                    }}
                    className={`w-full flex items-center px-3 py-2 text-left rounded-md transition-colors ${
                      activeCategory === category
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {category === 'Fields' && <Type className="h-4 w-4 mr-2" />}
                    {category === 'Components' && <Layout className="h-4 w-4 mr-2" />}
                    {category === 'Sections' && <Layers className="h-4 w-4 mr-2" />}
                    {category}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        
        {/* Subcategories */}
        {subcategories.length > 1 && (
          <div className="p-3">
            <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">
              {activeCategory === 'Fields' ? 'Field Types' : 
               activeCategory === 'Components' ? 'Component Types' : 'Section Types'}
            </h3>
            <nav>
              <ul className="space-y-1">
                {subcategories.map((subcategory) => (
                  <li key={subcategory}>
                    <button
                      onClick={() => setActiveSubcategory(subcategory)}
                      className={`w-full flex items-center px-3 py-2 text-sm text-left rounded-md transition-colors ${
                        activeSubcategory === subcategory
                          ? 'bg-gray-100 text-gray-900'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {subcategory}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        )}
        
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
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {activeCategory}
                {activeSubcategory !== 'All' && ` / ${activeSubcategory}`}
              </h1>
              <p className="text-gray-500 mt-1">
                {activeCategory === 'Fields' && 'Basic building blocks for content creation'}
                {activeCategory === 'Components' && 'Reusable UI elements combining multiple fields'}
                {activeCategory === 'Sections' && 'Pre-designed sections for page layouts'}
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
                placeholder="Search..." 
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm"
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
          
          {/* Placeholder Grid */}
          {activeCategory === 'Fields' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPlaceholders.map((placeholder) => (
                <div 
                  key={placeholder.id} 
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="p-1.5 bg-blue-50 rounded-md mr-3">
                          {getPlaceholderIcon(placeholder.type)}
                        </div>
                        <h3 className="font-medium text-gray-900">{placeholder.name}</h3>
                      </div>
                      <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
                        {placeholder.subcategory}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{placeholder.description}</p>
                  </div>
                  <div className="px-4 py-2 bg-gray-50 flex justify-end">
                    <button
                      onClick={() => handleViewPlaceholder(placeholder)}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Components Grid */}
          {activeCategory === 'Components' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPlaceholders.map((placeholder) => (
                <div 
                  key={placeholder.id} 
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="p-1.5 bg-purple-50 rounded-md mr-3">
                          {getPlaceholderIcon(placeholder.type)}
                        </div>
                        <h3 className="font-medium text-gray-900">{placeholder.name}</h3>
                      </div>
                      <span className="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded-full">
                        {placeholder.subcategory}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{placeholder.description}</p>
                    {placeholder.fields && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-1">Uses fields:</p>
                        <div className="flex flex-wrap gap-1">
                          {placeholder.fields.map(fieldId => (
                            <span key={fieldId} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full">
                              {fieldId.replace('field-', '')}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="px-4 py-2 bg-gray-50 flex justify-end">
                    <button
                      onClick={() => handleViewPlaceholder(placeholder)}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Sections Grid */}
          {activeCategory === 'Sections' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPlaceholders.map((placeholder) => (
                <div 
                  key={placeholder.id} 
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="p-1.5 bg-green-50 rounded-md mr-3">
                          {getPlaceholderIcon(placeholder.type)}
                        </div>
                        <h3 className="font-medium text-gray-900">{placeholder.name}</h3>
                      </div>
                      <span className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded-full">
                        {placeholder.subcategory}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{placeholder.description}</p>
                    {placeholder.components && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-1">Contains:</p>
                        <div className="flex flex-wrap gap-1">
                          {placeholder.components.map(componentId => (
                            <span key={componentId} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full">
                              {componentId.replace('component-', '').replace('field-', '')}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="px-4 py-2 bg-gray-50 flex justify-end">
                    <button
                      onClick={() => handleViewPlaceholder(placeholder)}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {filteredPlaceholders.length === 0 && (
            <div className="p-8 text-center bg-white rounded-lg shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Layout className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No items found</h3>
              <p className="text-gray-500 mb-4">There are no {activeCategory.toLowerCase()} in this category yet.</p>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Create New {activeCategory === 'Fields' ? 'Field' : activeCategory === 'Components' ? 'Component' : 'Section'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Placeholder Editor Modal */}
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
    <SpartiCMSWrapper>
      <ComponentsViewerContent />
    </SpartiCMSWrapper>
  );
};

export default ComponentsViewer;