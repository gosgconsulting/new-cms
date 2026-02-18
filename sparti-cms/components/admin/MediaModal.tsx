import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, Search, Grid, List, Image as ImageIcon, FileText, Film, Music, File, Check, X } from 'lucide-react';
import { useCMSSettings } from '../../context/CMSSettingsContext';
import { uploadFile } from '../../utils/uploadToBlob';

interface MediaItem {
  id: string;
  name: string;
  type: 'image' | 'document' | 'video' | 'audio' | 'other';
  url: string;
  size: number;
  dateUploaded: string;
  folderId: string | null;
}

interface MediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  title?: string;
  acceptedTypes?: string[];
  maxFileSize?: number;
}

const MediaModal: React.FC<MediaModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  title = "Select Media",
  acceptedTypes = ['image/*'],
  maxFileSize = 2 * 1024 * 1024 // 2MB default
}) => {
  const { settings, addMediaItem } = useCMSSettings();
  const mediaItems = Array.isArray(settings.mediaItems) ? settings.mediaItems : [];
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Filter media items based on accepted types and search query
  const filteredItems = mediaItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = acceptedTypes.some(type => {
      if (type === 'image/*') return item.type === 'image';
      if (type === 'video/*') return item.type === 'video';
      if (type === 'audio/*') return item.type === 'audio';
      if (type === 'document/*') return item.type === 'document';
      return true;
    });
    return matchesSearch && matchesType;
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file size
    if (file.size > maxFileSize) {
      alert(`File size must be less than ${Math.round(maxFileSize / 1024 / 1024)}MB`);
      return;
    }

    // Validate file type
    const isValidType = acceptedTypes.some(type => {
      if (type === 'image/*') return file.type.startsWith('image/');
      if (type === 'video/*') return file.type.startsWith('video/');
      if (type === 'audio/*') return file.type.startsWith('audio/');
      if (type === 'document/*') return file.type.startsWith('application/') || file.type.startsWith('text/');
      return file.type === type;
    });

    if (!isValidType) {
      alert(`File type not supported. Accepted types: ${acceptedTypes.join(', ')}`);
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const result = await uploadFile(file);
      setUploadProgress(100);

      const newMediaItem: MediaItem = {
        id: Date.now().toString(),
        name: file.name,
        type: getFileType(file.type),
        url: result.url,
        size: file.size,
        dateUploaded: new Date().toISOString(),
        folderId: null
      };

      // Add to media items
      addMediaItem(newMediaItem);
      
      // Auto-select the uploaded item
      setSelectedItem(newMediaItem.url);
      
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const getFileType = (mimeType: string): MediaItem['type'] => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.startsWith('application/') || mimeType.startsWith('text/')) return 'document';
    return 'other';
  };

  const getFileIcon = (type: MediaItem['type']) => {
    switch (type) {
      case 'image': return <ImageIcon className="h-4 w-4" />;
      case 'video': return <Film className="h-4 w-4" />;
      case 'audio': return <Music className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
      default: return <File className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSelect = () => {
    if (selectedItem) {
      onSelect(selectedItem);
      onClose();
      setSelectedItem(null);
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedItem(null);
    setSearchQuery('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] p-0">
        <DialogHeader className="p-6 pb-4 border-b border-border">
          <DialogTitle className="flex items-center justify-between">
            <span>{title}</span>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full">
          {/* Toolbar */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search media..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              
              <div className="flex items-center gap-1 border border-border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="file"
                id="media-upload"
                className="hidden"
                accept={acceptedTypes.join(',')}
                onChange={handleFileUpload}
                disabled={uploading}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('media-upload')?.click()}
                disabled={uploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? `Uploading... ${uploadProgress}%` : 'Upload'}
              </Button>
            </div>
          </div>

          {/* Media Grid/List */}
          <ScrollArea className="flex-1 p-4">
            {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery ? 'No media found matching your search.' : 'No media files yet. Upload some to get started.'}
                </p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className={`relative group cursor-pointer rounded-lg border-2 transition-all ${
                      selectedItem === item.url
                        ? 'border-brandPurple bg-brandPurple/10'
                        : 'border-border hover:border-brandPurple/50'
                    }`}
                    onClick={() => {
                      // Auto-select and close on single click for better UX
                      setSelectedItem(item.url);
                      // Small delay to show selection feedback, then auto-select
                      setTimeout(() => {
                        onSelect(item.url);
                        onClose();
                        setSelectedItem(null);
                      }, 150);
                    }}
                  >
                    <div className="aspect-square p-2">
                      {item.type === 'image' ? (
                        <img
                          src={item.url}
                          alt={item.name}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-full bg-secondary/20 rounded flex items-center justify-center">
                          {getFileIcon(item.type)}
                        </div>
                      )}
                    </div>
                    
                    {selectedItem === item.url && (
                      <div className="absolute top-2 right-2 bg-brandPurple text-white rounded-full p-1">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                    
                    <div className="p-2 border-t border-border">
                      <p className="text-xs font-medium truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(item.size)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                      selectedItem === item.url
                        ? 'bg-brandPurple/10 border border-brandPurple'
                        : 'hover:bg-secondary/50 border border-transparent'
                    }`}
                    onClick={() => {
                      // Auto-select and close on single click for better UX
                      setSelectedItem(item.url);
                      // Small delay to show selection feedback, then auto-select
                      setTimeout(() => {
                        onSelect(item.url);
                        onClose();
                        setSelectedItem(null);
                      }, 150);
                    }}
                  >
                    <div className="flex-shrink-0">
                      {item.type === 'image' ? (
                        <img
                          src={item.url}
                          alt={item.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-secondary/20 rounded flex items-center justify-center">
                          {getFileIcon(item.type)}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(item.size)} • {new Date(item.dateUploaded).toLocaleDateString()}
                      </p>
                    </div>
                    
                    {selectedItem === item.url && (
                      <Check className="h-5 w-5 text-brandPurple" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-border bg-background">
            <div className="text-sm text-muted-foreground">
              {selectedItem ? (
                <span>
                  Selected: <span className="font-medium text-foreground">{filteredItems.find(item => item.url === selectedItem)?.name}</span>
                </span>
              ) : (
                'Click an item to select it automatically, or use the Select button below'
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleSelect} 
                disabled={!selectedItem}
                className="bg-brandPurple hover:bg-brandPurple/90 min-w-[100px]"
              >
                {selectedItem ? 'Select & Close' : 'Select'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MediaModal;
