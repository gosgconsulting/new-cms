import React, { useState, ChangeEvent, useEffect } from 'react';
import { useCMSSettings } from '../../context/CMSSettingsContext';
import { useAuth } from '../auth/AuthProvider';
import { Upload, Trash2, Search, Grid, List, Image as ImageIcon, FileText, Film, Music, File, Folder, FolderPlus, X, RefreshCw, Eye, Edit3, Save } from 'lucide-react';
import { api } from '../../utils/api';

interface MediaItem {
  id: string;
  name: string;
  type: 'image' | 'document' | 'video' | 'audio' | 'other';
  url: string;
  size: number;
  dateUploaded: string;
  folderId: string | null;
  alt?: string;
  title?: string;
  description?: string;
}

interface MediaFolder {
  id: string;
  name: string;
  itemCount: number;
}

interface MediaViewModalProps {
  item: MediaItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<MediaItem>) => void;
}

const MediaViewModal: React.FC<MediaViewModalProps> = ({ item, isOpen, onClose, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedItem, setEditedItem] = useState<Partial<MediaItem>>({});

  useEffect(() => {
    if (item) {
      setEditedItem({
        name: item.name,
        alt: item.alt || '',
        title: item.title || '',
        description: item.description || ''
      });
    }
    setIsEditing(false);
  }, [item]);

  if (!isOpen || !item) return null;

  const handleSave = () => {
    onSave(item.id, editedItem);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedItem({
      name: item.name,
      alt: item.alt || '',
      title: item.title || '',
      description: item.description || ''
    });
    setIsEditing(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Media Details</h2>
          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Edit3 className="h-4 w-4 mr-1" />
                Edit
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  className="flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center px-3 py-2 text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Media Preview */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Preview</h3>
              <div className="border rounded-lg overflow-hidden bg-gray-50">
                {item.type === 'image' ? (
                  <img
                    src={item.url}
                    alt={item.alt || item.name}
                    className="w-full h-auto max-h-96 object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-12 text-gray-500">
                    {item.type === 'document' && <FileText className="h-16 w-16 mb-4" />}
                    {item.type === 'video' && <Film className="h-16 w-16 mb-4" />}
                    {item.type === 'audio' && <Music className="h-16 w-16 mb-4" />}
                    {item.type === 'other' && <File className="h-16 w-16 mb-4" />}
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-gray-400 mt-1">{item.type.toUpperCase()}</p>
                  </div>
                )}
              </div>

              {/* File Info */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <h4 className="font-medium text-gray-900">File Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Type:</span>
                    <span className="ml-2 font-medium">{item.type}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Size:</span>
                    <span className="ml-2 font-medium">{formatFileSize(item.size)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Uploaded:</span>
                    <span className="ml-2 font-medium">{item.dateUploaded}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">URL:</span>
                    <span className="ml-2 font-mono text-xs break-all">{item.url}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Media Details Form */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Details</h3>
              
              {/* Media Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Media Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedItem.name || ''}
                    onChange={(e) => setEditedItem(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter media name"
                  />
                ) : (
                  <p className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">{item.name}</p>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedItem.title || ''}
                    onChange={(e) => setEditedItem(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter media title"
                  />
                ) : (
                  <p className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">{item.title || 'No title set'}</p>
                )}
              </div>

              {/* Alt Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alt Text
                  <span className="text-xs text-gray-500 ml-1">(Important for SEO and accessibility)</span>
                </label>
                {isEditing ? (
                  <textarea
                    value={editedItem.alt || ''}
                    onChange={(e) => setEditedItem(prev => ({ ...prev, alt: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Describe this media for screen readers and SEO"
                  />
                ) : (
                  <p className="px-3 py-2 bg-gray-50 rounded-md text-gray-900 min-h-[80px]">
                    {item.alt || 'No alt text set'}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                {isEditing ? (
                  <textarea
                    value={editedItem.description || ''}
                    onChange={(e) => setEditedItem(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Enter a detailed description of this media"
                  />
                ) : (
                  <p className="px-3 py-2 bg-gray-50 rounded-md text-gray-900 min-h-[100px]">
                    {item.description || 'No description set'}
                  </p>
                )}
              </div>

              {/* URL (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={item.url}
                    readOnly
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-l-md text-gray-600 font-mono text-sm"
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(item.url)}
                    className="px-3 py-2 bg-gray-200 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-300 transition-colors text-sm"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MediaManager: React.FC = () => {
  const { currentTenantId } = useAuth();
  const { settings, addMediaItem, removeMediaItem, updateMediaItem, addMediaFolder, removeMediaFolder, updateMediaItemFolder } = useCMSSettings();
  const mediaItems = Array.isArray(settings.mediaItems) ? settings.mediaItems : [];
  const mediaFolders = Array.isArray(settings.mediaFolders) ? settings.mediaFolders : [{ id: 'uncategorized', name: 'Uncategorized', itemCount: 0 }];
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [showDebugInfo, setShowDebugInfo] = useState<boolean>(false);
  
  // Modal state
  const [viewModalItem, setViewModalItem] = useState<MediaItem | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  
  // Load media from database API (tenant-based)
  useEffect(() => {
    if (currentTenantId) {
      loadMediaFromDatabase();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTenantId]);

  // Function to load media from database API
  const loadMediaFromDatabase = async () => {
    if (!currentTenantId) {
      console.log('[testing] No tenant ID, skipping media load');
      // Clear existing media for this tenant
      mediaItems.forEach(item => removeMediaItem(item.id));
      return;
    }

    setIsSyncing(true);
    try {
      // Load folders
      const foldersResponse = await api.get(`/api/media/folders?tenantId=${encodeURIComponent(currentTenantId)}`, {
        tenantId: currentTenantId
      });

      // Clear existing folders (except uncategorized) and reload from database
      const foldersToRemove = mediaFolders.filter(f => f.id !== 'uncategorized');
      foldersToRemove.forEach(f => removeMediaFolder(f.id));

      if (foldersResponse.ok) {
        const folders = await foldersResponse.json();
        if (Array.isArray(folders)) {
          folders.forEach(folder => {
            const folderData = {
              id: folder.id.toString(),
              name: folder.name,
              itemCount: 0 // Will be updated when we load files
            };
            addMediaFolder(folderData);
          });
        }
      }

      // Clear existing media items first
      mediaItems.forEach(item => removeMediaItem(item.id));

      // Load media files
      const filesResponse = await api.get(`/api/media/files?tenantId=${encodeURIComponent(currentTenantId)}&limit=1000`, {
        tenantId: currentTenantId
      });

      if (filesResponse.ok) {
        const result = await filesResponse.json();
        const files = result.files || [];
        
        // Add database items
        // Convert database format to MediaItem format
        files.forEach((file: any) => {
          const mediaItem: MediaItem = {
            id: file.id.toString(),
            name: file.filename || file.original_filename,
            type: file.media_type || 'other',
            url: file.url || file.relative_path,
            size: file.file_size || 0,
            dateUploaded: file.created_at ? new Date(file.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            folderId: file.folder_id ? file.folder_id.toString() : null,
            alt: file.alt_text || '',
            title: file.title || '',
            description: file.description || ''
          };
          addMediaItem(mediaItem);
        });
      } else {
        console.error('[testing] Error loading media files:', await filesResponse.text());
      }
    } catch (error) {
      console.error('[testing] Error loading media from database:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !currentTenantId) {
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const files = Array.from(e.target.files);
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        if (selectedFolder) {
          formData.append('folder_id', selectedFolder);
        }
        formData.append('tenantId', currentTenantId);

        // Update progress
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));

        // For FormData, we need to let the browser set Content-Type
        const token = localStorage.getItem('sparti-user-session') ? JSON.parse(localStorage.getItem('sparti-user-session') || '{}').token : null;
        const headers: Record<string, string> = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        // Don't set Content-Type - browser will set it with boundary for FormData
        
        const response = await fetch(`${api.getBaseUrl()}/api/media/upload?tenantId=${encodeURIComponent(currentTenantId)}`, {
          method: 'POST',
          headers: headers,
          body: formData
        });

        if (response.ok) {
          const result = await response.json();
          if (result.file) {
            const mediaItem: MediaItem = {
              id: result.file.id.toString(),
              name: result.file.filename || result.file.original_filename,
              type: result.file.media_type || getFileType(file.type),
              url: result.file.url || result.url,
              size: result.file.file_size || file.size,
              dateUploaded: result.file.created_at ? new Date(result.file.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              folderId: result.file.folder_id ? result.file.folder_id.toString() : null,
              alt: result.file.alt_text || '',
              title: result.file.title || '',
              description: result.file.description || ''
            };
            addMediaItem(mediaItem);
          }
        } else {
          const errorText = await response.text();
          console.error('[testing] Error uploading file:', errorText);
          throw new Error(`Failed to upload ${file.name}`);
        }
      }

      setUploadProgress(100);
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 500);
    } catch (error) {
      console.error('[testing] Error uploading files:', error);
      setUploading(false);
      setUploadProgress(0);
      alert('Failed to upload files. Please try again.');
    }
  };
  
  const getFileType = (mimeType: string): MediaItem['type'] => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return 'document';
    return 'other';
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };
  
  const handleItemSelect = (id: string) => {
    setSelectedItems(prev => {
      if (prev.includes(id)) {
        return prev.filter(itemId => itemId !== id);
      } else {
        return [...prev, id];
      }
    });
  };
  
  const handleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map(item => item.id));
    }
  };
  
  const handleDeleteSelected = async () => {
    if (selectedItems.length === 0 || !currentTenantId) return;

    try {
      for (const id of selectedItems) {
        const response = await api.delete(`/api/media/files/${id}?tenantId=${encodeURIComponent(currentTenantId)}`, {
          tenantId: currentTenantId
        });

        if (response.ok) {
          removeMediaItem(id);
        } else {
          console.error(`[testing] Error deleting file ${id}:`, await response.text());
        }
      }
      setSelectedItems([]);
      // Reload media to refresh counts
      await loadMediaFromDatabase();
    } catch (error) {
      console.error('[testing] Error deleting files:', error);
      alert('Failed to delete some files. Please try again.');
    }
  };
  
  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !currentTenantId) return;

    try {
      const slug = newFolderName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const folderPath = `/${slug}`;

      const response = await api.post(`/api/media/folders?tenantId=${encodeURIComponent(currentTenantId)}`, {
        name: newFolderName.trim(),
        slug: slug,
        folder_path: folderPath,
        description: ''
      }, {
        tenantId: currentTenantId
      });

      if (response.ok) {
        const folder = await response.json();
        addMediaFolder({
          id: folder.id.toString(),
          name: folder.name,
          itemCount: 0
        });
        setNewFolderName('');
        setShowNewFolderDialog(false);
      } else {
        const errorText = await response.text();
        console.error('[testing] Error creating folder:', errorText);
        alert('Failed to create folder. Please try again.');
      }
    } catch (error) {
      console.error('[testing] Error creating folder:', error);
      alert('Failed to create folder. Please try again.');
    }
  };
  
  const handleDeleteFolder = async (folderId: string) => {
    if (folderId === 'uncategorized' || !currentTenantId) return;

    try {
      const response = await api.delete(`/api/media/folders/${folderId}?tenantId=${encodeURIComponent(currentTenantId)}`, {
        tenantId: currentTenantId
      });

      if (response.ok) {
        // Move items in this folder to uncategorized (null folder_id)
        const itemsInFolder = mediaItems.filter(item => item.folderId === folderId);
        for (const item of itemsInFolder) {
          try {
            await api.put(`/api/media/files/${item.id}?tenantId=${encodeURIComponent(currentTenantId)}`, {
              folder_id: null
            }, {
              tenantId: currentTenantId
            });
            updateMediaItemFolder(item.id, null);
          } catch (error) {
            console.error(`[testing] Error moving item ${item.id}:`, error);
          }
        }
        removeMediaFolder(folderId);
        // Reload media to refresh
        await loadMediaFromDatabase();
      } else {
        const errorText = await response.text();
        console.error('[testing] Error deleting folder:', errorText);
        alert('Failed to delete folder. Please try again.');
      }
    } catch (error) {
      console.error('[testing] Error deleting folder:', error);
      alert('Failed to delete folder. Please try again.');
    }
  };

  const handleViewMedia = (item: MediaItem) => {
    setViewModalItem(item);
    setIsViewModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsViewModalOpen(false);
    setViewModalItem(null);
  };

  const handleSaveMedia = async (id: string, updates: Partial<MediaItem>) => {
    if (!currentTenantId) return;

    try {
      const response = await api.put(`/api/media/files/${id}?tenantId=${encodeURIComponent(currentTenantId)}`, {
        alt_text: updates.alt || '',
        title: updates.title || '',
        description: updates.description || '',
        folder_id: updates.folderId ? parseInt(updates.folderId) : null
      }, {
        tenantId: currentTenantId
      });

      if (response.ok) {
        updateMediaItem(id, updates);
      } else {
        const errorText = await response.text();
        console.error('[testing] Error updating media:', errorText);
        alert('Failed to update media. Please try again.');
      }
    } catch (error) {
      console.error('[testing] Error updating media:', error);
      alert('Failed to update media. Please try again.');
    }
  };
  
  const getFileIcon = (type: MediaItem['type']) => {
    switch (type) {
      case 'image': return <ImageIcon className="h-6 w-6 text-blue-500" />;
      case 'document': return <FileText className="h-6 w-6 text-green-500" />;
      case 'video': return <Film className="h-6 w-6 text-purple-500" />;
      case 'audio': return <Music className="h-6 w-6 text-yellow-500" />;
      default: return <File className="h-6 w-6 text-gray-500" />;
    }
  };
  
  // Filter media items based on search query and selected folder
  const filteredItems = mediaItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    let matchesFolder = false;
    
    if (selectedFolder === null) {
      // Show items without a folder or with 'uncategorized' folder in the Uncategorized section
      matchesFolder = !item.folderId || item.folderId === 'uncategorized';
    } else {
      // For other folders, match by folder ID
      matchesFolder = item.folderId === selectedFolder;
    }
    
    return matchesSearch && matchesFolder;
  });
  
  // Debug: log items and their folders
  console.log('Media items with folders:', mediaItems.map(item => ({ name: item.name, folder: item.folderId })));
  console.log('Selected folder:', selectedFolder);
  console.log('Filtered items:', filteredItems.map(item => item.name));
  
  // Calculate folder item counts
  const foldersWithCounts = mediaFolders.map(folder => ({
    ...folder,
    itemCount: folder.id === 'uncategorized' 
      ? mediaItems.filter(item => !item.folderId || item.folderId === 'uncategorized').length
      : mediaItems.filter(item => item.folderId === folder.id).length
  }));
  
  return (
    <div className="flex gap-6">
      {/* Media View Modal */}
      <MediaViewModal
        item={viewModalItem}
        isOpen={isViewModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveMedia}
      />

      {/* Folders Sidebar */}
      <div className="w-64 bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Folders</h3>
          <button
            onClick={() => setShowNewFolderDialog(true)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="New Folder"
          >
            <FolderPlus className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        
        <div className="space-y-1">
          {foldersWithCounts.map(folder => (
            <div
              key={folder.id}
              className={`flex items-center justify-between p-2 rounded-lg cursor-pointer group ${
                selectedFolder === folder.id || (selectedFolder === null && folder.id === 'uncategorized')
                  ? 'bg-blue-50 text-blue-900'
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
              onClick={() => setSelectedFolder(folder.id === 'uncategorized' ? null : folder.id)}
            >
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <Folder className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm font-medium truncate">{folder.name}</span>
                <span className="text-xs text-gray-500">({folder.itemCount})</span>
              </div>
              {folder.id !== 'uncategorized' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteFolder(folder.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all"
                  title="Delete Folder"
                >
                  <Trash2 className="h-3 w-3 text-red-500" />
                </button>
              )}
            </div>
          ))}
        </div>
        
        {/* New Folder Dialog */}
        {showNewFolderDialog && (
          <div className="mt-4 p-3 border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">New Folder</span>
              <button
                onClick={() => {
                  setShowNewFolderDialog(false);
                  setNewFolderName('');
                }}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <X className="h-3 w-3 text-gray-500" />
              </button>
            </div>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded mb-2"
              onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
              autoFocus
            />
            <button
              onClick={handleCreateFolder}
              disabled={!newFolderName.trim()}
              className="w-full bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Create
            </button>
          </div>
        )}
      </div>
      
      {/* Main Content */}
      <div className="flex-1 bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Media Manager</h2>
            <p className="text-gray-600">Upload, organize, and manage your tenant-based media files.</p>
          </div>
          <button
            onClick={loadMediaFromDatabase}
            disabled={isSyncing}
            className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh Media"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
        
        {/* Upload and Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-4">
            <label className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors cursor-pointer flex items-center">
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
              <input 
                type="file" 
                multiple 
                className="hidden" 
                onChange={handleFileUpload}
              />
            </label>
            
            {selectedItems.length > 0 && (
              <button 
                onClick={handleDeleteSelected}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected ({selectedItems.length})
              </button>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search media..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
            
            <div className="flex border border-gray-300 rounded-md overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100' : 'bg-white'}`}
                title="Grid View"
              >
                <Grid className="h-5 w-5 text-gray-600" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-gray-100' : 'bg-white'}`}
                title="List View"
              >
                <List className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Upload Progress */}
        {uploading && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Uploading...</span>
              <span className="text-sm font-medium text-gray-700">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}
        
        {/* Media Items */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <Folder className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No media items in this folder</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredItems.map(item => (
              <div 
                key={item.id}
                className={`relative border rounded-lg overflow-hidden group cursor-pointer ${
                  selectedItems.includes(item.id) ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => handleItemSelect(item.id)}
              >
                <div className="aspect-square bg-gray-100 flex items-center justify-center">
                  {item.type === 'image' ? (
                    <>
                      <img 
                        src={item.url} 
                        alt={item.alt || item.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error(`Error loading image: ${item.url}`);
                          // Try an alternative URL format
                          const altUrl = `/src/assets/${item.folderId}/${item.name}`;
                          console.log(`Trying alternative URL: ${altUrl}`);
                          e.currentTarget.src = altUrl;
                          e.currentTarget.onerror = () => {
                            console.error(`Alternative URL also failed: ${altUrl}`);
                            e.currentTarget.style.display = 'none';
                            const next = e.currentTarget.nextSibling as HTMLElement | null;
                            if (next) next.style.display = 'block';
                          };
                        }}
                      />
                      <div style={{display: 'none'}} className="p-4 flex flex-col items-center justify-center h-full">
                        <ImageIcon className="h-6 w-6 text-red-500" />
                        <span className="mt-2 text-xs text-red-500 truncate max-w-full">
                          Failed to load: {item.name}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="p-4 flex flex-col items-center justify-center h-full">
                      {getFileIcon(item.type)}
                      <span className="mt-2 text-xs text-gray-500 truncate max-w-full">
                        {item.name}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <p className="text-sm font-medium text-gray-900 truncate" title={item.name}>
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(item.size)}
                  </p>
                </div>
                
                {/* Hover Actions */}
                <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewMedia(item);
                    }}
                    className="p-1.5 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full shadow-sm transition-all"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4 text-gray-700" />
                  </button>
                  <input 
                    type="checkbox" 
                    checked={selectedItems.includes(item.id)}
                    onChange={() => {}}
                    className="h-5 w-5 accent-blue-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input 
                      type="checkbox" 
                      checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                      onChange={handleSelectAll}
                      className="h-4 w-4 accent-blue-500"
                    />
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    File
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Uploaded
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map(item => (
                  <tr 
                    key={item.id} 
                    className={`hover:bg-gray-50 cursor-pointer ${selectedItems.includes(item.id) ? 'bg-blue-50' : ''}`}
                    onClick={() => handleItemSelect(item.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input 
                        type="checkbox" 
                        checked={selectedItems.includes(item.id)}
                        onChange={() => {}}
                        className="h-4 w-4 accent-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center">
                          {item.type === 'image' ? (
                            <img className="h-10 w-10 object-cover rounded" src={item.url} alt={item.alt || item.name} />
                          ) : (
                            getFileIcon(item.type)
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          {item.alt && (
                            <div className="text-xs text-gray-500 truncate max-w-xs" title={item.alt}>
                              Alt: {item.alt}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 capitalize">{item.type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatFileSize(item.size)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.dateUploaded}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewMedia(item);
                        }}
                        className="text-blue-600 hover:text-blue-900 flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Debug Information */}
        {showDebugInfo && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg border border-gray-300 overflow-auto">
            <h3 className="text-lg font-semibold mb-2">Debug Information</h3>
            <div className="mb-4">
              <h4 className="font-medium">Media Folders:</h4>
              <pre className="bg-white p-2 rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(mediaFolders, null, 2)}
              </pre>
            </div>
            <div>
              <h4 className="font-medium">Media Items:</h4>
              <pre className="bg-white p-2 rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(mediaItems.map(item => ({ 
                  id: item.id,
                  name: item.name, 
                  folderId: item.folderId,
                  url: item.url,
                  alt: item.alt,
                  title: item.title
                })), null, 2)}
              </pre>
              <div className="mt-2">
                <h4 className="font-medium">Current Folder Items:</h4>
                <pre className="bg-white p-2 rounded text-xs overflow-auto max-h-40">
                  {JSON.stringify(filteredItems.map(item => ({ 
                    name: item.name, 
                    url: item.url
                  })), null, 2)}
                </pre>
              </div>
            </div>
            <button 
              onClick={() => setShowDebugInfo(false)}
              className="mt-2 px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Hide Debug Info
            </button>
          </div>
        )}
        
        {/* Media Stats */}
        {(() => {
          const blobItems = mediaItems.filter(item =>
            item.url && typeof item.url === 'string' && item.url.includes('blob.vercel-storage.com')
          );
          const blobCount = blobItems.length;
          const blobSize = blobItems.reduce((acc, item) => acc + (item.size || 0), 0);
          return (
            <div className="mt-6 flex flex-wrap gap-4">
              <div className="bg-gray-50 rounded-md p-4 flex-1">
                <p className="text-sm text-gray-500">Total Files</p>
                <p className="text-xl font-bold text-gray-900">{mediaItems.length}</p>
              </div>
              <div className="bg-gray-50 rounded-md p-4 flex-1">
                <p className="text-sm text-gray-500">Images</p>
                <p className="text-xl font-bold text-gray-900">
                  {mediaItems.filter(item => item.type === 'image').length}
                </p>
              </div>
              <div className="bg-gray-50 rounded-md p-4 flex-1">
                <p className="text-sm text-gray-500">Documents</p>
                <p className="text-xl font-bold text-gray-900">
                  {mediaItems.filter(item => item.type === 'document').length}
                </p>
              </div>
              <div className="bg-gray-50 rounded-md p-4 flex-1">
                <p className="text-sm text-gray-500">Total Size</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatFileSize(mediaItems.reduce((acc, item) => acc + item.size, 0))}
                </p>
              </div>
              <div className="bg-blue-50 rounded-md p-4 flex-1 border border-blue-100">
                <p className="text-sm text-blue-700">Blob storage</p>
                <p className="text-xl font-bold text-blue-900">
                  {blobCount} file{blobCount !== 1 ? 's' : ''}
                </p>
                <p className="text-xs text-blue-600 mt-0.5">
                  {formatFileSize(blobSize)} in Vercel Blob
                </p>
              </div>
            </div>
          );
        })()}
        
        <div className="mt-4 text-center">
          <button 
            onClick={() => setShowDebugInfo(!showDebugInfo)}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
          >
            {showDebugInfo ? 'Hide' : 'Show'} Debug Info
          </button>
        </div>
      </div>
    </div>
  );
};

export default MediaManager;