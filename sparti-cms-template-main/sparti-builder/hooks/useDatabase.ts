import { useState } from 'react';

// Demo data structure for components
interface DemoComponent {
  id: string;
  name: string;
  type: string;
  category: string;
  content: any;
  is_active: boolean;
  tenant_id: string;
  created_at: string;
}

// Demo components data
const DEMO_COMPONENTS: DemoComponent[] = [
  {
    id: 'demo-hero-1',
    name: 'Hero Section',
    type: 'hero',
    category: 'hero',
    content: { title: 'Welcome to Sparti CMS Demo', subtitle: 'Experience visual editing' },
    is_active: true,
    tenant_id: 'demo',
    created_at: new Date().toISOString()
  },
  {
    id: 'demo-testimonials-1',
    name: 'Animated Testimonials',
    type: 'testimonials',
    category: 'testimonials',
    content: { items: [] },
    is_active: true,
    tenant_id: 'demo',
    created_at: new Date().toISOString()
  }
];

export const useDatabase = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Demo implementations that return static data
  const demoDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

  const executeWithLoading = async <T>(operation: () => Promise<T>): Promise<T | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await operation();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Database operation error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // Loading and error states (maintain compatibility)
    status: isLoading ? 'loading' : error ? 'error' : 'success',
    isLoading,
    error,
    
    // Components API (demo implementations)
    components: {
      getAll: () => executeWithLoading(async () => {
        await demoDelay(300);
        return DEMO_COMPONENTS;
      }),
      getById: (id: string) => executeWithLoading(async () => {
        await demoDelay(200);
        return DEMO_COMPONENTS.find(c => c.id === id) || null;
      }),
      getByName: (name: string) => executeWithLoading(async () => {
        await demoDelay(200);
        return DEMO_COMPONENTS.find(c => c.name === name) || null;
      }),
      getActive: () => executeWithLoading(async () => {
        await demoDelay(300);
        return DEMO_COMPONENTS.filter(c => c.is_active);
      }),
      create: (data: any) => executeWithLoading(async () => {
        await demoDelay(400);
        console.log('Demo: Would create component', data);
        return { id: 'demo-new-' + Date.now(), ...data };
      }),
      update: (id: string, data: any) => executeWithLoading(async () => {
        await demoDelay(400);
        console.log('Demo: Would update component', id, data);
        return { id, ...data };
      }),
      delete: (id: string) => executeWithLoading(async () => {
        await demoDelay(300);
        console.log('Demo: Would delete component', id);
        return true;
      }),
    },
    
    // Pages API (demo implementations)
    pages: {
      getAll: () => executeWithLoading(async () => {
        await demoDelay(300);
        return [];
      }),
      getPublished: () => executeWithLoading(async () => {
        await demoDelay(300);
        return [];
      }),
      getById: (_id: string) => executeWithLoading(async () => {
        await demoDelay(200);
        return null;
      }),
      getBySlug: (_slug: string) => executeWithLoading(async () => {
        await demoDelay(200);
        return null;
      }),
      create: (data: any) => executeWithLoading(async () => {
        await demoDelay(400);
        console.log('Demo: Would create page', data);
        return { id: 'demo-page-' + Date.now(), ...data };
      }),
      update: (id: string, data: any) => executeWithLoading(async () => {
        await demoDelay(400);
        console.log('Demo: Would update page', id, data);
        return { id, ...data };
      }),
      delete: (id: string) => executeWithLoading(async () => {
        await demoDelay(300);
        console.log('Demo: Would delete page', id);
        return true;
      }),
    },
    
    // Sections API (demo implementations)
    sections: {
      getAll: () => executeWithLoading(async () => {
        await demoDelay(300);
        return [];
      }),
      getById: (_id: string) => executeWithLoading(async () => {
        await demoDelay(200);
        return null;
      }),
      create: (data: any) => executeWithLoading(async () => {
        await demoDelay(400);
        console.log('Demo: Would create section', data);
        return { id: 'demo-section-' + Date.now(), ...data };
      }),
      update: (id: string, updates: any) => executeWithLoading(async () => {
        await demoDelay(400);
        console.log('Demo: Would update section', id, updates);
        return { id, ...updates };
      }),
      delete: (id: string) => executeWithLoading(async () => {
        await demoDelay(300);
        console.log('Demo: Would delete section', id);
        return true;
      }),
    },
    
    // Page Sections API (demo implementations)
    pageSections: {
      getByPageId: (_pageId: string) => executeWithLoading(async () => {
        await demoDelay(300);
        return [];
      }),
      addSectionToPage: (data: any) => executeWithLoading(async () => {
        await demoDelay(400);
        console.log('Demo: Would add section to page', data);
        return { id: 'demo-page-section-' + Date.now(), ...data };
      }),
      removeSectionFromPage: (id: string) => executeWithLoading(async () => {
        await demoDelay(300);
        console.log('Demo: Would remove section from page', id);
        return true;
      }),
      updateSectionOrder: (id: string, sortOrder: number) => executeWithLoading(async () => {
        await demoDelay(400);
        console.log('Demo: Would update section order', id, sortOrder);
        return { id, sort_order: sortOrder };
      }),
    },
    
    // Section Components API (demo implementations)
    sectionComponents: {
      getBySectionId: (_sectionId: string) => executeWithLoading(async () => {
        await demoDelay(300);
        return [];
      }),
      addComponentToSection: (data: any) => executeWithLoading(async () => {
        await demoDelay(400);
        console.log('Demo: Would add component to section', data);
        return { id: 'demo-section-component-' + Date.now(), ...data };
      }),
      removeComponentFromSection: (id: string) => executeWithLoading(async () => {
        await demoDelay(300);
        console.log('Demo: Would remove component from section', id);
        return true;
      }),
      updateComponentOrder: (id: string, sortOrder: number) => executeWithLoading(async () => {
        await demoDelay(400);
        console.log('Demo: Would update component order', id, sortOrder);
        return { id, sort_order: sortOrder };
      }),
    },
    
    // Settings API (demo implementations)
    settings: {
      get: () => executeWithLoading(async () => {
        await demoDelay(300);
        return {
          id: 'demo-settings',
          tenant_id: 'demo',
          site_name: 'Sparti CMS Demo',
          primary_color: '#3b82f6',
          secondary_color: '#64748b',
          font_family: 'Inter'
        };
      }),
      update: (data: any) => executeWithLoading(async () => {
        await demoDelay(400);
        console.log('Demo: Would update settings', data);
        return { id: 'demo-settings', ...data };
      }),
    },
  };
};

export default useDatabase;