import React, { useState, useRef } from 'react';
import { Image as ImageIcon, Upload, X, Edit3, Info } from 'lucide-react';
import { Button } from '../../../src/components/ui/button';
import { Input } from '../../../src/components/ui/input';
import { Label } from '../../../src/components/ui/label';
import MediaModal from '../admin/MediaModal';
import api from '../../utils/api';
import { useAuth } from '../auth/AuthProvider';

interface FeaturedImageSelectorProps {
  imageUrl?: string;
  imageId?: number;
  altText?: string;
  metaDescription?: string;
  onImageChange: (url: string, imageId?: number) => void;
  onAltTextChange: (altText: string) => void;
  onMetaDescriptionChange: (metaDescription: string) => void;
}

export const FeaturedImageSelector: React.FC<FeaturedImageSelectorProps> = ({
  imageUrl,
  imageId,
  altText = '',
  metaDescription = '',
  onImageChange,
  onAltTextChange,
  onMetaDescriptionChange,
}) => {
  const { currentTenantId } = useAuth();
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('sparti-user-session');
      const authToken = token ? JSON.parse(token).token : null;

      const response = await fetch(`${api.getBaseUrl()}/api/upload`, {
        method: 'POST',
        headers: {
          ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
          ...(currentTenantId && { 'X-Tenant-Id': currentTenantId }),
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      let imageUrl = result.url;

      // Ensure the URL is a full URL with domain
      if (imageUrl && !imageUrl.startsWith('http')) {
        const baseUrl = window.location.origin;
        imageUrl = `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
      }

      onImageChange(imageUrl, result.id);
    } catch (error) {
      console.error('[testing] Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleMediaSelect = (url: string) => {
    onImageChange(url);
    setIsMediaModalOpen(false);
  };

  const handleRemoveImage = () => {
    onImageChange('', undefined);
    onAltTextChange('');
    onMetaDescriptionChange('');
  };

  return (
    <div className="space-y-4">
      {/* Image Preview */}
      <div className="space-y-2">
        {imageUrl ? (
          <div className="relative group">
            <div className="aspect-square w-full max-w-[200px] rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
              <img
                src={imageUrl}
                alt={altText || 'Featured image'}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMediaModalOpen(true)}
                  className="bg-white/90 hover:bg-white text-gray-900"
                >
                  <Edit3 className="h-4 w-4 mr-1" />
                  Replace
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveImage}
                  className="bg-white/90 hover:bg-white text-red-600"
                >
                  <X className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="aspect-square w-full max-w-[200px] rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center bg-gray-50">
            <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500 mb-2">No image selected</p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Upload className="h-4 w-4 mr-1" />
                Upload
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsMediaModalOpen(true)}
              >
                Select from Library
              </Button>
            </div>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Edit Cover Image Link */}
      {imageUrl && (
        <div>
          <button
            type="button"
            onClick={() => setIsMediaModalOpen(true)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
          >
            <Edit3 className="h-3 w-3" />
            Edit Cover Image
          </button>
        </div>
      )}

      {/* Alt Text Field */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Label htmlFor="image-alt-text" className="text-sm font-medium">
            Image Alt Text
          </Label>
          <span title="Alt text for accessibility and SEO">
            <Info className="h-3 w-3 text-gray-400" />
          </span>
        </div>
        <Input
          id="image-alt-text"
          placeholder="Placeholder Text"
          value={altText}
          onChange={(e) => onAltTextChange(e.target.value)}
          className="text-sm"
        />
      </div>

      {/* Meta Description Field */}
      <div>
        <Label htmlFor="image-meta-description" className="text-sm font-medium mb-1 block">
          Meta description
        </Label>
        <Input
          id="image-meta-description"
          placeholder="Enter meta description for SEO"
          value={metaDescription}
          onChange={(e) => onMetaDescriptionChange(e.target.value)}
          className="text-sm"
        />
      </div>

      {/* Media Modal */}
      <MediaModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={handleMediaSelect}
        title="Select Featured Image"
        acceptedTypes={['image/*']}
      />
    </div>
  );
};

export default FeaturedImageSelector;