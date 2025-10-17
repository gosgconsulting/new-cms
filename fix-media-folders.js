import { 
  getMediaItems, 
  getMediaFolders, 
  updateMediaItem 
} from './sparti-cms/db/postgres.js';

// Function to determine correct folder based on filename and path
function getCorrectFolder(filename, relativePath, folders) {
  const pathLower = relativePath.toLowerCase();
  const filenameLower = filename.toLowerCase();
  
  // Check for specific folder patterns
  if (pathLower.includes('logos') || pathLower.includes('logo')) {
    return folders.find(f => f.slug === 'logos');
  }
  
  if (pathLower.includes('team') || pathLower.includes('member')) {
    return folders.find(f => f.slug === 'team');
  }
  
  if (pathLower.includes('seo') || (pathLower.includes('seo') && !pathLower.includes('result'))) {
    return folders.find(f => f.slug === 'seo');
  }
  
  if (pathLower.includes('results') || pathLower.includes('result')) {
    return folders.find(f => f.slug === 'results');
  }
  
  if (pathLower.includes('lovable-uploads') || pathLower.includes('blog')) {
    return folders.find(f => f.slug === 'blog');
  }
  
  // Check filename patterns for specific categorization
  if (filenameLower.includes('logo')) {
    return folders.find(f => f.slug === 'logos');
  }
  
  if (filenameLower.includes('member') || filenameLower.includes('team') || filenameLower.includes('gregoire')) {
    return folders.find(f => f.slug === 'team');
  }
  
  if (filenameLower.includes('result')) {
    return folders.find(f => f.slug === 'results');
  }
  
  if (filenameLower.includes('keyword') || filenameLower.includes('content') || filenameLower.includes('link')) {
    return folders.find(f => f.slug === 'seo');
  }
  
  // Default to general
  return folders.find(f => f.slug === 'general');
}

async function fixMediaFolders() {
  console.log('[testing] Starting media folder assignment fix...\n');
  
  try {
    // Get all media items
    const mediaResult = await getMediaItems(1000, 0);
    const mediaItems = mediaResult.media;
    
    // Get all folders
    const folders = await getMediaFolders();
    
    console.log(`Found ${mediaItems.length} media items to process`);
    console.log(`Available folders: ${folders.map(f => f.name).join(', ')}\n`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const item of mediaItems) {
      const correctFolder = getCorrectFolder(item.filename, item.relative_path, folders);
      
      if (!correctFolder) {
        console.log(`⚠️  No suitable folder found for: ${item.filename}`);
        skippedCount++;
        continue;
      }
      
      // Check if already in correct folder
      if (item.folder_id === correctFolder.id) {
        console.log(`✅ Already correct: ${item.filename} → ${correctFolder.name}`);
        skippedCount++;
        continue;
      }
      
      // Update the folder assignment
      try {
        await updateMediaItem(item.id, {
          folder_id: correctFolder.id
        });
        
        console.log(`📁 Updated: ${item.filename} → ${correctFolder.name}`);
        updatedCount++;
      } catch (error) {
        console.error(`❌ Failed to update ${item.filename}:`, error.message);
      }
    }
    
    console.log('\n📊 Folder Assignment Summary:');
    console.log(`   Updated: ${updatedCount}`);
    console.log(`   Skipped (already correct): ${skippedCount}`);
    console.log(`   Total processed: ${mediaItems.length}`);
    
    // Show final folder statistics
    console.log('\n📁 Final folder statistics:');
    const finalFolders = await getMediaFolders();
    finalFolders.forEach(folder => {
      console.log(`   ${folder.name}: ${folder.media_count} items (${Math.round(folder.total_size / 1024)}KB)`);
    });
    
    console.log('\n🎉 Media folder assignment fix completed!');
    
  } catch (error) {
    console.error('❌ Folder assignment fix failed:', error);
    throw error;
  }
}

// Run the fix
fixMediaFolders().then(() => {
  console.log('\n✅ Fix script completed successfully');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Fix script failed:', error);
  process.exit(1);
});
