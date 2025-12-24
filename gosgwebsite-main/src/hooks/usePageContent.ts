import { useState, useEffect } from 'react';
import { fetchPageContent, PageSchema } from '@/services/api';

/**
 * Custom hook for fetching page content by slug
 * @param slug - The page slug to fetch
 * @returns Object containing data, loading state, and error
 */
export const usePageContent = (slug: string) => {
  const [data, setData] = useState<PageSchema | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        let result;
        
        // Special case for home page - we can use the convenience endpoint
        if (slug === 'home') {
          result = await fetchPageContent('home');
        } else {
          result = await fetchPageContent(slug);
        }
        
        // Make sure components is an array
        if (result && typeof result.components === 'string') {
          try {
            console.log('Parsing components from string:', result.components.substring(0, 100) + '...');
            result.components = JSON.parse(result.components);
          } catch (e) {
            console.error('Failed to parse components JSON:', e);
            result.components = [];
          }
        }
        
        // Log the components for debugging
        console.log('Components after processing:', 
          Array.isArray(result.components) 
            ? `Array with ${result.components.length} items` 
            : typeof result.components);
        
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
        console.error(`Error fetching page content for slug "${slug}":`, err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  return { data, isLoading, error };
};

export default usePageContent;