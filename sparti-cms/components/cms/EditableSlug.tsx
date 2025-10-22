import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../../../src/components/ui/button';
import { Input } from '../../../src/components/ui/input';
import { Edit2, Check, X, AlertCircle } from 'lucide-react';
import { toast } from '../../../src/components/ui/use-toast';
import { useAuth } from '../auth/AuthProvider';

interface EditableSlugProps {
  pageId: string;
  pageType: 'page' | 'landing' | 'legal';
  currentSlug: string;
  pageName: string;
  isHomepage?: boolean;
  onSlugUpdate?: (newSlug: string) => void;
}

export const EditableSlug: React.FC<EditableSlugProps> = ({
  pageId,
  pageType,
  currentSlug,
  pageName,
  isHomepage = false,
  onSlugUpdate
}) => {
  const { currentTenant } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(currentSlug);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const validateSlug = (slug: string): string | null => {
    // Remove leading/trailing whitespace
    slug = slug.trim();
    
    // Add leading slash if missing
    if (!slug.startsWith('/')) {
      slug = '/' + slug;
    }
    
    // Validate slug format (alphanumeric, hyphens, slashes only)
    const slugRegex = /^\/[a-z0-9\-\/]*$/;
    if (!slugRegex.test(slug)) {
      return 'Slug can only contain lowercase letters, numbers, hyphens, and slashes';
    }
    
    // Prevent double slashes
    if (slug.includes('//')) {
      return 'Slug cannot contain double slashes';
    }
    
    // Prevent ending with slash (except root)
    if (slug.length > 1 && slug.endsWith('/')) {
      slug = slug.slice(0, -1);
    }
    
    return null;
  };

  const handleEdit = () => {
    if (isHomepage) {
      toast({
        title: "Cannot Edit Homepage Slug",
        description: "The homepage slug cannot be modified.",
        variant: "destructive"
      });
      return;
    }
    setIsEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue(currentSlug);
    setError(null);
  };

  const handleSave = async () => {
    const validationError = validateSlug(editValue);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Normalize the slug
    let normalizedSlug = editValue.trim();
    if (!normalizedSlug.startsWith('/')) {
      normalizedSlug = '/' + normalizedSlug;
    }
    if (normalizedSlug.length > 1 && normalizedSlug.endsWith('/')) {
      normalizedSlug = normalizedSlug.slice(0, -1);
    }

    if (normalizedSlug === currentSlug) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Call the backend API to update the slug
      const response = await fetch('/api/pages/update-slug', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageId,
          pageType,
          newSlug: normalizedSlug,
          oldSlug: currentSlug,
          tenantId: currentTenant.id
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update slug');
      }

      const result = await response.json();
      
      // Show success message
      toast({
        title: "Slug Updated Successfully",
        description: `Page slug changed from "${currentSlug}" to "${normalizedSlug}"`,
      });

      // Handle special case for blog slug change
      if (currentSlug === '/blog' && normalizedSlug !== '/blog') {
        toast({
          title: "Blog Slug Changed",
          description: "Note: Blog post URLs may need manual updates in the frontend code.",
          variant: "default"
        });
      }

      // Update parent component
      if (onSlugUpdate) {
        onSlugUpdate(normalizedSlug);
      }

      setIsEditing(false);
      setEditValue(normalizedSlug);

    } catch (error) {
      console.error('[testing] Error updating slug:', error);
      setError(error instanceof Error ? error.message : 'Failed to update slug');
      
      toast({
        title: "Failed to Update Slug",
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setEditValue(value);
    setError(null);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 min-w-0">
        <div className="flex-1 min-w-0">
          <Input
            ref={inputRef}
            value={editValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder="/page-slug"
            className={`text-sm ${error ? 'border-red-500' : ''}`}
            disabled={isLoading}
          />
          {error && (
            <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
              <AlertCircle className="h-3 w-3" />
              <span>{error}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSave}
            disabled={isLoading || !!error}
            className="h-6 w-6 p-0"
          >
            <Check className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCancel}
            disabled={isLoading}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 group">
      <span className="text-sm text-muted-foreground flex-1 min-w-0 truncate">
        {currentSlug}
      </span>
      {!isHomepage && (
        <Button
          size="sm"
          variant="ghost"
          onClick={handleEdit}
          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Edit slug"
        >
          <Edit2 className="h-3 w-3" />
        </Button>
      )}
      {isHomepage && (
        <span className="text-xs text-gray-400 italic">
          (fixed)
        </span>
      )}
    </div>
  );
};

export default EditableSlug;
