
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CMSContent {
  id: string;
  page_id: string;
  element_id: string;
  element_type: string;
  content: any;
  version: number;
  updated_at: string;
  updated_by: string | null;
}

export const useCMSContent = (pageId: string) => {
  const [content, setContent] = useState<Record<string, CMSContent>>({});
  const [isLoading, setIsLoading] = useState(false);

  const loadContent = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('cms_content')
        .select('*')
        .eq('page_id', pageId);

      if (error) {
        console.error('Error loading CMS content:', error);
        return;
      }

      const contentMap: Record<string, CMSContent> = {};
      data?.forEach((item) => {
        contentMap[item.element_id] = item as CMSContent;
      });
      
      setContent(contentMap);
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setIsLoading(false);
    }
  }, [pageId]);

  const saveContent = useCallback(async (elementId: string, elementType: string, newContent: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const contentData = {
        page_id: pageId,
        element_id: elementId,
        element_type: elementType,
        content: newContent,
        updated_by: user.id
      };

      const { data, error } = await supabase
        .from('cms_content')
        .upsert(contentData, {
          onConflict: 'page_id,element_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving content:', error);
        return false;
      }

      if (data) {
        setContent(prev => ({
          ...prev,
          [elementId]: data as CMSContent
        }));
      }

      return true;
    } catch (error) {
      console.error('Error saving content:', error);
      return false;
    }
  }, [pageId]);

  const getContent = useCallback((elementId: string) => {
    return content[elementId]?.content;
  }, [content]);

  return {
    content,
    isLoading,
    loadContent,
    saveContent,
    getContent
  };
};
