// This file contains dummy data for the Development tenant
// to showcase UI/UX elements for testing purposes

export interface DummyPage {
  id: string;
  title: string;
  slug: string;
  status: 'published' | 'draft';
  createdAt: string;
  updatedAt: string;
  sections?: string[];
  template?: string;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string;
  };
}

export interface DummyPost {
  id: string;
  title: string;
  slug: string;
  status: 'published' | 'draft';
  createdAt: string;
  updatedAt: string;
  excerpt: string;
  content: string;
  author: string;
  categories: string[];
  tags: string[];
  featuredImage?: string;
}

export interface DummyMedia {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
  createdAt: string;
  alt?: string;
}

export interface DummyUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: 'active' | 'pending' | 'inactive';
  createdAt: string;
}

export interface DummyForm {
  id: string;
  name: string;
  fields: Array<{
    id: string;
    name: string;
    type: string;
    required: boolean;
    options?: string[];
  }>;
  submissions: number;
  createdAt: string;
}

export interface DummyComponent {
  id: string;
  name: string;
  type: string;
  content: any;
  createdAt: string;
}

// Generate dummy pages for Development tenant
export const getDummyPages = (): DummyPage[] => [
  {
    id: 'page-1',
    title: 'Home Page',
    slug: 'home',
    status: 'published',
    createdAt: '2023-10-15',
    updatedAt: '2023-10-20',
    sections: ['hero', 'features', 'testimonials', 'cta'],
    template: 'home',
    seo: {
      title: 'Welcome to Our Website',
      description: 'This is a demo home page for development purposes',
      keywords: 'demo, development, testing'
    }
  },
  {
    id: 'page-2',
    title: 'About Us',
    slug: 'about',
    status: 'published',
    createdAt: '2023-10-16',
    updatedAt: '2023-10-21',
    sections: ['header', 'team', 'mission', 'values'],
    template: 'about',
    seo: {
      title: 'About Our Company',
      description: 'Learn more about our company and team',
      keywords: 'about, team, company'
    }
  },
  {
    id: 'page-3',
    title: 'Services',
    slug: 'services',
    status: 'published',
    createdAt: '2023-10-17',
    updatedAt: '2023-10-22',
    sections: ['header', 'service-list', 'pricing', 'cta'],
    template: 'services'
  },
  {
    id: 'page-4',
    title: 'Contact',
    slug: 'contact',
    status: 'published',
    createdAt: '2023-10-18',
    updatedAt: '2023-10-23',
    sections: ['header', 'contact-form', 'map', 'info'],
    template: 'contact'
  },
  {
    id: 'page-5',
    title: 'New Product Launch',
    slug: 'new-product',
    status: 'draft',
    createdAt: '2023-10-19',
    updatedAt: '2023-10-24',
    sections: ['header', 'product-details', 'features', 'pricing', 'cta'],
    template: 'landing'
  }
];

// Generate dummy blog posts for Development tenant
export const getDummyPosts = (): DummyPost[] => [
  {
    id: 'post-1',
    title: 'Getting Started with Our Platform',
    slug: 'getting-started',
    status: 'published',
    createdAt: '2023-10-10',
    updatedAt: '2023-10-12',
    excerpt: 'A beginner\'s guide to using our platform effectively',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc quis nisl.',
    author: 'John Doe',
    categories: ['Tutorials', 'Getting Started'],
    tags: ['beginner', 'tutorial', 'guide'],
    featuredImage: '/assets/images/getting-started.jpg'
  },
  {
    id: 'post-2',
    title: 'Advanced Tips and Tricks',
    slug: 'advanced-tips',
    status: 'published',
    createdAt: '2023-10-11',
    updatedAt: '2023-10-13',
    excerpt: 'Take your skills to the next level with these advanced tips',
    content: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis.',
    author: 'Jane Smith',
    categories: ['Advanced', 'Tips'],
    tags: ['advanced', 'tips', 'tricks'],
    featuredImage: '/assets/images/advanced-tips.jpg'
  },
  {
    id: 'post-3',
    title: 'Product Updates - October 2023',
    slug: 'product-updates-oct-2023',
    status: 'published',
    createdAt: '2023-10-15',
    updatedAt: '2023-10-15',
    excerpt: 'See what\'s new in our latest product update',
    content: 'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati.',
    author: 'Product Team',
    categories: ['Updates', 'News'],
    tags: ['update', 'new features', 'release'],
    featuredImage: '/assets/images/product-update.jpg'
  },
  {
    id: 'post-4',
    title: 'Upcoming Features Preview',
    slug: 'upcoming-features',
    status: 'draft',
    createdAt: '2023-10-18',
    updatedAt: '2023-10-19',
    excerpt: 'A sneak peek at what we\'re working on next',
    content: 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.',
    author: 'Development Team',
    categories: ['Preview', 'Roadmap'],
    tags: ['upcoming', 'preview', 'roadmap'],
    featuredImage: '/assets/images/upcoming-features.jpg'
  }
];

// Generate dummy media items for Development tenant
export const getDummyMedia = (): DummyMedia[] => [
  {
    id: 'media-1',
    name: 'hero-image.jpg',
    type: 'image/jpeg',
    url: '/assets/images/hero.jpg',
    size: 1024000,
    createdAt: '2023-10-01',
    alt: 'Hero image for homepage'
  },
  {
    id: 'media-2',
    name: 'team-photo.jpg',
    type: 'image/jpeg',
    url: '/assets/images/team.jpg',
    size: 2048000,
    createdAt: '2023-10-02',
    alt: 'Our team photo'
  },
  {
    id: 'media-3',
    name: 'product-demo.mp4',
    type: 'video/mp4',
    url: '/assets/videos/demo.mp4',
    size: 15000000,
    createdAt: '2023-10-03'
  },
  {
    id: 'media-4',
    name: 'company-logo.svg',
    type: 'image/svg+xml',
    url: '/assets/images/logo.svg',
    size: 5000,
    createdAt: '2023-10-04',
    alt: 'Company logo'
  },
  {
    id: 'media-5',
    name: 'brochure.pdf',
    type: 'application/pdf',
    url: '/assets/documents/brochure.pdf',
    size: 3000000,
    createdAt: '2023-10-05'
  }
];

// Generate dummy users for Development tenant
export const getDummyUsers = (): DummyUser[] => [
  {
    id: 'user-1',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    status: 'active',
    createdAt: '2023-09-01'
  },
  {
    id: 'user-2',
    email: 'editor@example.com',
    firstName: 'Editor',
    lastName: 'User',
    role: 'editor',
    status: 'active',
    createdAt: '2023-09-15'
  },
  {
    id: 'user-3',
    email: 'author@example.com',
    firstName: 'Author',
    lastName: 'User',
    role: 'author',
    status: 'active',
    createdAt: '2023-09-20'
  },
  {
    id: 'user-4',
    email: 'pending@example.com',
    firstName: 'Pending',
    lastName: 'User',
    role: 'author',
    status: 'pending',
    createdAt: '2023-10-10'
  },
  {
    id: 'user-5',
    email: 'inactive@example.com',
    firstName: 'Inactive',
    lastName: 'User',
    role: 'subscriber',
    status: 'inactive',
    createdAt: '2023-08-15'
  }
];

// Generate dummy forms for Development tenant
export const getDummyForms = (): DummyForm[] => [
  {
    id: 'form-1',
    name: 'Contact Form',
    fields: [
      { id: 'field-1', name: 'name', type: 'text', required: true },
      { id: 'field-2', name: 'email', type: 'email', required: true },
      { id: 'field-3', name: 'subject', type: 'text', required: false },
      { id: 'field-4', name: 'message', type: 'textarea', required: true }
    ],
    submissions: 42,
    createdAt: '2023-09-10'
  },
  {
    id: 'form-2',
    name: 'Newsletter Signup',
    fields: [
      { id: 'field-1', name: 'email', type: 'email', required: true },
      { id: 'field-2', name: 'name', type: 'text', required: false },
      { id: 'field-3', name: 'interests', type: 'checkbox', required: false, options: ['News', 'Products', 'Events'] }
    ],
    submissions: 156,
    createdAt: '2023-09-12'
  },
  {
    id: 'form-3',
    name: 'Job Application',
    fields: [
      { id: 'field-1', name: 'fullName', type: 'text', required: true },
      { id: 'field-2', name: 'email', type: 'email', required: true },
      { id: 'field-3', name: 'phone', type: 'tel', required: true },
      { id: 'field-4', name: 'position', type: 'select', required: true, options: ['Developer', 'Designer', 'Manager', 'Other'] },
      { id: 'field-5', name: 'resume', type: 'file', required: true },
      { id: 'field-6', name: 'coverLetter', type: 'textarea', required: false }
    ],
    submissions: 28,
    createdAt: '2023-09-15'
  }
];

// Generate dummy components for Development tenant
export const getDummyComponents = (): DummyComponent[] => [
  {
    id: 'component-1',
    name: 'Hero Section',
    type: 'hero',
    content: {
      heading: 'Welcome to Our Platform',
      subheading: 'The best solution for your business',
      buttonText: 'Get Started',
      buttonUrl: '/signup',
      backgroundImage: '/assets/images/hero-bg.jpg'
    },
    createdAt: '2023-10-01'
  },
  {
    id: 'component-2',
    name: 'Feature Grid',
    type: 'features',
    content: {
      heading: 'Our Features',
      features: [
        { title: 'Easy to Use', description: 'Simple and intuitive interface', icon: 'smile' },
        { title: 'Powerful Tools', description: 'Advanced tools for professionals', icon: 'tool' },
        { title: 'Fast Performance', description: 'Optimized for speed', icon: 'zap' },
        { title: '24/7 Support', description: 'Always here to help', icon: 'headphones' }
      ]
    },
    createdAt: '2023-10-02'
  },
  {
    id: 'component-3',
    name: 'Testimonial Slider',
    type: 'testimonials',
    content: {
      heading: 'What Our Customers Say',
      testimonials: [
        { name: 'John D.', role: 'CEO', company: 'Example Inc', quote: 'This platform has transformed our business operations.', avatar: '/assets/images/avatar1.jpg' },
        { name: 'Sarah M.', role: 'Marketing Director', company: 'Sample Corp', quote: 'The best solution we\'ve used in years.', avatar: '/assets/images/avatar2.jpg' },
        { name: 'Robert K.', role: 'Developer', company: 'Tech Solutions', quote: 'Incredibly easy to implement and use.', avatar: '/assets/images/avatar3.jpg' }
      ]
    },
    createdAt: '2023-10-03'
  },
  {
    id: 'component-4',
    name: 'Call to Action',
    type: 'cta',
    content: {
      heading: 'Ready to Get Started?',
      text: 'Join thousands of satisfied customers today.',
      buttonText: 'Sign Up Now',
      buttonUrl: '/signup',
      backgroundColor: '#f8f9fa'
    },
    createdAt: '2023-10-04'
  },
  {
    id: 'component-5',
    name: 'Pricing Table',
    type: 'pricing',
    content: {
      heading: 'Choose Your Plan',
      plans: [
        { name: 'Basic', price: '$9.99', period: 'monthly', features: ['Feature 1', 'Feature 2', 'Feature 3'], buttonText: 'Choose Basic' },
        { name: 'Pro', price: '$19.99', period: 'monthly', features: ['All Basic Features', 'Feature 4', 'Feature 5', 'Feature 6'], buttonText: 'Choose Pro', highlighted: true },
        { name: 'Enterprise', price: '$49.99', period: 'monthly', features: ['All Pro Features', 'Feature 7', 'Feature 8', 'Priority Support'], buttonText: 'Choose Enterprise' }
      ]
    },
    createdAt: '2023-10-05'
  }
];

// Helper function to check if current tenant is the Development tenant
export const isDevelopmentTenant = (tenant: { id: string, isDevelopment?: boolean }): boolean => {
  return tenant.id === 'tenant-dev' || !!tenant.isDevelopment;
};
