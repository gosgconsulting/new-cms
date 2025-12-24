import { useState, useEffect } from 'react';
import { fetchPageContent } from '@/services/api';

/**
 * Custom hook for fetching global schema data (header, footer, etc.)
 * @returns Object containing data, loading state, and error
 */
export const useGlobalSchema = () => {
  const [data, setData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const result = await fetchPageContent('global');
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
        console.error('Error fetching global schema:', err);
        // Set default data if fetch fails
        setData({
          navbar: {},
          footer: {}
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, isLoading, error };
};

export default useGlobalSchema;
