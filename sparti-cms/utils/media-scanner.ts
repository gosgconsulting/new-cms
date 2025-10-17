import { MediaItem } from '../context/CMSSettingsContext';

/**
 * Get file type based on file extension
 */
export const getFileTypeFromExtension = (filename: string): MediaItem['type'] => {
  const extension = filename.toLowerCase().split('.').pop() || '';
  
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension)) {
    return 'image';
  } else if (['mp4', 'webm', 'mov', 'avi'].includes(extension)) {
    return 'video';
  } else if (['mp3', 'wav', 'ogg'].includes(extension)) {
    return 'audio';
  } else if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'md'].includes(extension)) {
    return 'document';
  } else {
    return 'other';
  }
};

/**
 * Get file size in bytes (mock function as we can't access actual file size)
 * In a real implementation, this would use the File API or server-side code
 */
export const getMockFileSize = (type: MediaItem['type']): number => {
  // Mock sizes based on file type
  switch (type) {
    case 'image': return Math.floor(Math.random() * 1000000) + 50000; // 50KB to 1MB
    case 'video': return Math.floor(Math.random() * 50000000) + 1000000; // 1MB to 50MB
    case 'audio': return Math.floor(Math.random() * 10000000) + 500000; // 500KB to 10MB
    case 'document': return Math.floor(Math.random() * 5000000) + 100000; // 100KB to 5MB
    default: return Math.floor(Math.random() * 1000000) + 10000; // 10KB to 1MB
  }
};

/**
 * Convert file path to URL for use in the browser
 */
export const filePathToUrl = (filePath: string): string => {
  // Handle different path formats
  let normalizedPath = filePath;
  
  // Remove 'src/' prefix if present
  if (normalizedPath.startsWith('src/')) {
    normalizedPath = normalizedPath.substring(4);
  }
  
  // Remove 'assets/' prefix if present to match the actual file structure
  if (normalizedPath.startsWith('assets/')) {
    normalizedPath = normalizedPath.substring(7);
  }
  
  // Create a relative URL that works in the browser
  // Make sure the path is correct for all folders
  const url = `/src/assets/${normalizedPath}`;
  console.log(`Converting path ${filePath} to URL ${url}`);
  return url;
};

/**
 * Create a MediaItem object from a file path
 */
export const createMediaItemFromPath = (filePath: string): MediaItem => {
  // Extract filename from path
  const pathParts = filePath.split('/');
  const filename = pathParts[pathParts.length - 1];
  
  // Determine folder from path
  let folder: string | null = null;
  if (pathParts.length > 1) {
    // If the file is in a subdirectory, use that as the folder
    if (pathParts.length > 1) {
      folder = pathParts[0]; // First part of the path is the folder
    }
  }
  
  const type = getFileTypeFromExtension(filename);
  const size = getMockFileSize(type);
  
  return {
    id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: filename,
    type,
    url: filePathToUrl(filePath),
    size,
    dateUploaded: new Date().toISOString().split('T')[0],
    folderId: folder ? folder : null
  };
};

/**
 * Scan directory structure and create MediaItem objects
 * This is a mock function that would normally use server-side code
 * to scan the actual file system
 */
export const scanAssetsDirectory = async (): Promise<{
  mediaItems: MediaItem[];
  mediaFolders: { id: string; name: string; itemCount: number }[];
}> => {
  // In a real implementation, this would scan the actual file system
  // For now, we'll hard-code the structure based on the file listing we observed
  
  const assetFiles = [
    'go-sg-logo-official.png',
    'go-sg-logo.png',
    'gregoire-liao.png',
    'logos/art-in-bloom.png',
    'logos/caro-patisserie.png',
    'logos/grub.png',
    'logos/nail-queen.png',
    'logos/selenightco.png',
    'logos/smooy.png',
    'logos/solstice.png',
    'logos/spirit-stretch.png',
    'results/result-1.png',
    'results/result-10.png',
    'results/result-2.png',
    'results/result-3.png',
    'results/result-4.png',
    'results/result-5.png',
    'results/result-6.png',
    'results/result-7.png',
    'results/result-8.png',
    'results/result-9.png',
    'seo/content-strategy-1.png',
    'seo/content-strategy-2.png',
    'seo/keyword-research-1.png',
    'seo/keyword-research-2.png',
    'seo/link-building-1.png',
    'seo/link-building-2.png',
    'team/member-1.png',
    'team/member-2.jpeg',
    'team/member-3.png',
    'team/member-4.png'
  ];
  
  // Create media items from file paths
  const mediaItems: MediaItem[] = assetFiles.map(filePath => 
    createMediaItemFromPath(filePath)
  );
  
  // Extract unique folders
  const folderSet = new Set<string>();
  assetFiles.forEach(filePath => {
    const parts = filePath.split('/');
    if (parts.length > 1) {
      folderSet.add(parts[0]); // Add the folder name (first part of the path)
    }
  });
  
  // Create folder objects with counts
  const mediaFolders = Array.from(folderSet).map(folderName => {
    const itemCount = mediaItems.filter(item => item.folderId === folderName).length;
    return {
      id: folderName,
      name: folderName.charAt(0).toUpperCase() + folderName.slice(1), // Capitalize first letter
      itemCount
    };
  });
  
  // Add uncategorized folder
  const uncategorizedCount = mediaItems.filter(item => !item.folderId || item.folderId === 'uncategorized').length;
  mediaFolders.unshift({
    id: 'uncategorized',
    name: 'Uncategorized',
    itemCount: uncategorizedCount
  });
  
  console.log('Created folders:', mediaFolders);
  console.log('Media items with folders:', mediaItems.map(item => ({ name: item.name, folder: item.folderId })));
  
  return { mediaItems, mediaFolders };
};
