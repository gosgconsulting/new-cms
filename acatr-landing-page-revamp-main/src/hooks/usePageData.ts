/**
 * Hook to fetch and manage page data from CMS API
 */

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ApiResponse, PageData } from "@/types/schema";

interface UsePageDataOptions {
  slug?: string;
  apiUrl?: string;
}

/**
 * Fetch page data from API
 */
async function fetchPageData(
  slug?: string,
  apiUrl?: string
): Promise<PageData> {
  const baseUrl = apiUrl || import.meta.env.VITE_API_URL || "/api";
  
  let url = `${baseUrl}/pages`;
  if (slug) {
    url = `${url}/${slug.replace(/^\//, '')}`;
  } else {
    // Default to home page
    url = `${url}/home`;
  }

  const headers: HeadersInit = {};
  const apiKey = import.meta.env.VITE_BACKEND_API_KEY || '37f64aed-76fc-4ef4-9bc5-5052b3177799';
  if (apiKey) {
   headers['Authorization'] = `Bearer ${apiKey}`;
  }
  
  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`Failed to fetch page data: ${response.statusText}`);
  }

  const data: ApiResponse = await response.json();
  
  if (!data.success) {
    throw new Error("API returned unsuccessful response");
  }

  return data.data;
}

/**
 * Hook to use page data with React Query
 */
export function usePageData(options: UsePageDataOptions = {}) {
  const { slug, apiUrl = 'https://cms.sparti.ai/api/v1' } = options;

  return useQuery({
    queryKey: ["pageData", slug || "home"],
    queryFn: () => fetchPageData(slug, apiUrl),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook to use page data with useState (for static data or manual updates)
 */
export function usePageDataState(initialData?: PageData) {
  const [pageData, setPageData] = useState<PageData | undefined>(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<Error | null>(null);

  const loadPageData = async (slug?: string, apiUrl?: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPageData(slug, apiUrl);
      setPageData(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load page data"));
    } finally {
      setLoading(false);
    }
  };

  return {
    pageData,
    loading,
    error,
    setPageData,
    loadPageData,
  };
}

