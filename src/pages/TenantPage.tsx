import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../sparti-cms/utils/api';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import ErrorBoundary from '@/components/ErrorBoundary';
import FlowbiteHeader from '@/libraries/flowbite/components/FlowbiteHeader';
import FlowbiteFooter from '@/libraries/flowbite/components/FlowbiteFooter';

interface Page {
  id: number;
  page_name: string;
  slug: string;
  meta_title: string;
  meta_description: string;
  status: string;
  layout?: any;
}

interface Tenant {
  id: string;
  name: string;
  slug: string;
}

/**
 * Client-side React component for tenant sub-pages
 * Fetches page content by slug for specific tenant and renders it
 */
const TenantPage: React.FC = () => {
  const { tenantSlug, pageSlug } = useParams<{ tenantSlug: string; pageSlug: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState<Page | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!tenantSlug || !pageSlug) {
        setError('Tenant slug and page slug are required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // First, fetch tenant to get tenant ID
        const tenantResponse = await api.get(`/api/tenants/by-slug/${tenantSlug}`);
        
        if (!tenantResponse.ok) {
          if (tenantResponse.status === 404) {
            setError('Tenant not found');
          } else {
            setError('Failed to load tenant information');
          }
          setLoading(false);
          return;
        }

        const tenantData = await tenantResponse.json();
        if (!tenantData.success || !tenantData.data) {
          setError('Invalid tenant data received');
          setLoading(false);
          return;
        }

        const tenantInfo = tenantData.data;
        setTenant(tenantInfo);

        // Fetch page by slug with tenant context
        // Ensure slug starts with /
        const normalizedSlug = pageSlug.startsWith('/') ? pageSlug : `/${pageSlug}`;
        
        // Send X-Tenant-Id header for authentication (required by /api/v1/* endpoints)
        const pageResponse = await api.get(
          `/api/v1/pages${normalizedSlug}?tenantId=${tenantInfo.id}`,
          {
            headers: {
              'X-Tenant-Id': tenantInfo.id
            },
            tenantId: tenantInfo.id
          }
        );

        if (!pageResponse.ok) {
          if (pageResponse.status === 404) {
            setError('Page not found');
          } else {
            setError('Failed to load page content');
          }
          setLoading(false);
          return;
        }

        const pageData = await pageResponse.json();
        if (pageData.success && pageData.data) {
          setPage(pageData.data);
        } else {
          setError('Invalid page data received');
        }
      } catch (err) {
        console.error('[testing] Error fetching tenant page:', err);
        setError('Failed to load page content');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tenantSlug, pageSlug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading page...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!page || !tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Not Found</AlertTitle>
          <AlertDescription>Page or tenant not found.</AlertDescription>
        </Alert>
      </div>
    );
  }

  // For now, render a simple page structure
  // In the future, this could render the layout from page.layout
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        {/* Flowbite master header */}
        <FlowbiteHeader tenantId={tenant.id} />

        {/* Page content */}
        <main className="container mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold mb-4">{page.page_name}</h1>
          {page.meta_description && (
            <p className="text-xl text-muted-foreground mb-8">{page.meta_description}</p>
          )}
          
          {/* TODO: Render page.layout components here when layout rendering is implemented */}
          <div className="prose max-w-none">
            <p className="text-muted-foreground">
              Page content will be rendered here. Layout rendering from database is coming soon.
            </p>
          </div>
        </main>

        {/* Flowbite master footer */}
        <FlowbiteFooter tenantId={tenant.id} />
      </div>
    </ErrorBoundary>
  );
};

export default TenantPage;