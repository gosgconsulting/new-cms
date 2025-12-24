import { useState, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Upload, Edit2, Save, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface FeaturedImageGalleryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brandId: string;
  userId: string;
}

interface ImageData {
  id: string;
  url: string;
  name: string;
  topics: string[];
  description: string;
}

export const FeaturedImageGalleryModal = ({ 
  open, 
  onOpenChange,
  brandId,
  userId 
}: FeaturedImageGalleryModalProps) => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [editingImage, setEditingImage] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    topics: '',
    description: ''
  });

  // Load images from database when modal opens
  useEffect(() => {
    if (open && brandId) {
      loadImages();
    }
  }, [open, brandId]);

  const loadImages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('featured_image_gallery')
        .select('*')
        .eq('brand_id', brandId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setImages(data.map(img => ({
        id: img.id,
        url: img.image_url,
        name: img.name || 'Untitled',
        topics: img.topics || [],
        description: img.description || ''
      })));
    } catch (error) {
      console.error('Error loading images:', error);
      toast.error('Failed to load images from gallery');
    } finally {
      setLoading(false);
    }
  };

  const handleAddImageUrl = async () => {
    if (!imageUrl.trim()) {
      toast.error('Please enter an image URL');
      return;
    }

    try {
      const imageName = `Image ${images.length + 1}`;
      
      const { data, error } = await supabase
        .from('featured_image_gallery')
        .insert({
          brand_id: brandId,
          user_id: userId,
          image_url: imageUrl,
          name: imageName,
          topics: [],
          description: ''
        })
        .select()
        .single();

      if (error) throw error;

      setImages([...images, {
        id: data.id,
        url: data.image_url,
        name: data.name,
        topics: data.topics || [],
        description: data.description || ''
      }]);
      
      setImageUrl('');
      toast.success('Image added to gallery');
    } catch (error) {
      console.error('Error adding image:', error);
      toast.error('Failed to add image to gallery');
    }
  };

  const handleUploadImages = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    setUploading(true);
    const newImages: ImageData[] = [];

    try {
      for (const file of fileArray) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image file`);
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `${userId}/${brandId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, file);

        if (uploadError) {
          console.error(`Error uploading ${file.name}:`, uploadError);
          toast.error(`Failed to upload ${file.name}`);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(filePath);

        // Save to database
        const { data: dbData, error: dbError } = await supabase
          .from('featured_image_gallery')
          .insert({
            brand_id: brandId,
            user_id: userId,
            image_url: publicUrl,
            name: file.name,
            topics: [],
            description: ''
          })
          .select()
          .single();

        if (dbError) {
          console.error(`Error saving ${file.name} to database:`, dbError);
          toast.error(`Failed to save ${file.name} to gallery`);
          continue;
        }

        newImages.push({
          id: dbData.id,
          url: dbData.image_url,
          name: dbData.name,
          topics: dbData.topics || [],
          description: dbData.description || ''
        });
      }

      if (newImages.length > 0) {
        setImages([...images, ...newImages]);
        toast.success(`${newImages.length} image(s) uploaded successfully`);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleUploadImages(e.target.files);
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleUploadImages(files);
    }
  }, [handleUploadImages]);

  const handleDeleteImage = async (id: string) => {
    try {
      const { error } = await supabase
        .from('featured_image_gallery')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setImages(images.filter(img => img.id !== id));
      toast.success('Image removed from gallery');
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
    }
  };

  const handleEditImage = (image: ImageData) => {
    setEditingImage(image.id);
    setEditForm({
      name: image.name,
      topics: image.topics.join(', '),
      description: image.description
    });
  };

  const handleSaveEdit = async () => {
    if (!editingImage) return;

    try {
      const topicsArray = editForm.topics
        .split(',')
        .map(topic => topic.trim())
        .filter(topic => topic.length > 0);

      const { error } = await supabase
        .from('featured_image_gallery')
        .update({
          name: editForm.name,
          topics: topicsArray,
          description: editForm.description
        })
        .eq('id', editingImage);

      if (error) throw error;

      setImages(images.map(img => 
        img.id === editingImage 
          ? { ...img, name: editForm.name, topics: topicsArray, description: editForm.description }
          : img
      ));

      setEditingImage(null);
      setEditForm({ name: '', topics: '', description: '' });
      toast.success('Image updated successfully');
    } catch (error) {
      console.error('Error updating image:', error);
      toast.error('Failed to update image');
    }
  };

  const handleCancelEdit = () => {
    setEditingImage(null);
    setEditForm({ name: '', topics: '', description: '' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Featured Image Gallery</DialogTitle>
          <DialogDescription>
            Manage your collection of featured images for articles
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add Image Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Add Image by URL</Label>
              <div className="flex gap-2">
                <Input
                  id="imageUrl"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddImageUrl()}
                />
                <Button onClick={handleAddImageUrl}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUpload">Upload Images</Label>
              <div
                className={cn(
                  "relative border-2 border-dashed rounded-lg p-6 transition-colors",
                  isDragging ? "border-primary bg-primary/5" : "border-border",
                  uploading && "opacity-50 cursor-not-allowed"
                )}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center justify-center gap-2 text-center">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <div className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">Click to upload</span> or drag and drop
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Multiple images supported (PNG, JPG, WEBP)
                  </p>
                </div>
                <Input
                  id="imageUpload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileInputChange}
                  disabled={uploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Gallery Grid */}
          <div className="space-y-2">
            <Label>Gallery ({images.length} images)</Label>
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading gallery...
              </div>
            ) : images.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                No images in gallery. Add images using the options above.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {images.map((image) => (
                  <div key={image.id} className="border rounded-lg p-4 space-y-3">
                    <div className="relative">
                      <img
                        src={image.url}
                        alt={image.name}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <div className="absolute top-2 right-2 flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleEditImage(image)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteImage(image.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {editingImage === image.id ? (
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor={`name-${image.id}`}>Name</Label>
                          <Input
                            id={`name-${image.id}`}
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            placeholder="Image name"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`topics-${image.id}`}>Topics (comma-separated)</Label>
                          <Input
                            id={`topics-${image.id}`}
                            value={editForm.topics}
                            onChange={(e) => setEditForm({ ...editForm, topics: e.target.value })}
                            placeholder="e.g., technology, business, marketing"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`description-${image.id}`}>Description</Label>
                          <Textarea
                            id={`description-${image.id}`}
                            value={editForm.description}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            placeholder="Describe what this image shows and when it should be used"
                            rows={3}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSaveEdit}>
                            <Save className="h-4 w-4 mr-2" />
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <h3 className="font-medium">{image.name}</h3>
                        {image.topics.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {image.topics.map((topic, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {image.description && (
                          <p className="text-sm text-muted-foreground">{image.description}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
