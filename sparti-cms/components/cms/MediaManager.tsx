import React, { useState, ChangeEvent } from 'react';
import { useCMSSettings } from '../../context/CMSSettingsContext';
import { Upload, Trash2, Search, Grid, List, Image as ImageIcon, FileText, Film, Music, File } from 'lucide-react';

interface MediaItem {
  id: string;
  name: string;
  type: 'image' | 'document' | 'video' | 'audio' | 'other';
  url: string;
  size: number;
  dateUploaded: string;
}

const MediaManager: React.FC = () => {
  const { settings, addMediaItem, removeMediaItem } = useCMSSettings();
  const mediaItems = settings.mediaItems;
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploading(true);
      setUploadProgress(0);
      
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              const newItems: MediaItem[] = Array.from(e.target.files || []).map((file, index) => ({
                id: `new-${Date.now()}-${index}`,
                name: file.name,
                type: getFileType(file.type),
                size: file.size,
                url: URL.createObjectURL(file),
                dateUploaded: new Date().toISOString().split('T')[0]
              }));
              
              // Add each new media item to the context
              newItems.forEach(item => addMediaItem(item));
              setUploading(false);
              setUploadProgress(0);
            }, 500);
            return 100;
          }
          return prev + 10;
        });
      }, 300);
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
  
  const handleDeleteSelected = () => {
    if (selectedItems.length > 0) {
      // Remove each selected item from the context
      selectedItems.forEach(id => removeMediaItem(id));
      setSelectedItems([]);
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
  
  // Filter media items based on search query
  const filteredItems = mediaItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Media Manager</h2>
      <p className="text-gray-600 mb-6">Upload, organize, and manage your media files</p>
      
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
          <p className="text-gray-500">No media items found</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredItems.map(item => (
            <div 
              key={item.id}
              className={`relative border rounded-lg overflow-hidden group ${
                selectedItems.includes(item.id) ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => handleItemSelect(item.id)}
            >
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                {item.type === 'image' ? (
                  <img 
                    src={item.url} 
                    alt={item.name} 
                    className="w-full h-full object-cover"
                  />
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
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <input 
                  type="checkbox" 
                  checked={selectedItems.includes(item.id)}
                  onChange={() => {}}
                  className="h-5 w-5 accent-blue-500"
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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map(item => (
                <tr 
                  key={item.id} 
                  className={`hover:bg-gray-50 ${selectedItems.includes(item.id) ? 'bg-blue-50' : ''}`}
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
                          <img className="h-10 w-10 object-cover rounded" src={item.url} alt="" />
                        ) : (
                          getFileIcon(item.type)
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Media Stats */}
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
      </div>
    </div>
  );
};

export default MediaManager;
