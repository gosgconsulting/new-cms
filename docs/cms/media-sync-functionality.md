# Media Sync Functionality

This document explains how the media sync functionality works in the Sparti CMS.

## Overview

The media sync functionality allows the CMS to scan the `src/assets` directory and display the media files in the Media Manager. This is useful for managing existing media files and uploading new ones.

## Implementation Details

### 1. Media Scanner Utility

The `media-scanner.ts` utility provides functions to scan the `src/assets` directory and create MediaItem objects for each file. It includes:

- `getFileTypeFromExtension`: Determines the file type based on the file extension
- `getMockFileSize`: Generates a mock file size (since we can't access the actual file size from the browser)
- `filePathToUrl`: Converts a file path to a URL for use in the browser
- `createMediaItemFromPath`: Creates a MediaItem object from a file path
- `scanAssetsDirectory`: Scans the assets directory and returns MediaItem and MediaFolder objects

### 2. MediaManager Component

The MediaManager component has been updated to use the media scanner utility. It includes:

- Initial loading of assets when the component mounts (if no media items exist)
- A "Sync Assets" button to manually refresh media from the assets directory
- Visual feedback during the sync process

### 3. Usage

To use the media sync functionality:

1. Navigate to the Media section in the CMS dashboard
2. Click the "Sync Assets" button to load media files from the `src/assets` directory
3. The media files will be displayed in the Media Manager
4. You can organize the media files into folders and use them in your content

## Future Enhancements

In the future, we plan to:

1. Implement actual file uploads that save to the `src/assets` directory
2. Store media metadata in a database for better persistence
3. Add support for more file types and better file type detection
4. Implement server-side scanning for better performance with large media libraries

## Technical Notes

- The media items are currently stored in localStorage via the CMSSettingsContext
- The file paths are converted to URLs that work in the browser
- The file sizes are currently mocked since we can't access the actual file size from the browser
- The sync process is non-destructive - it adds new files but doesn't remove existing ones

## Troubleshooting

If media files are not displaying correctly:

1. Check that the file paths in the media scanner utility match your actual directory structure
2. Verify that the CMSSettingsProvider is properly set up in your application
3. Clear localStorage if you encounter issues with stale data
4. Check the browser console for any errors during the sync process
