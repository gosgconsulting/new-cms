import { readdir, stat, readFile, writeFile } from 'fs/promises';

/** @type {import('sharp') | null} - Loaded dynamically so install succeeds when sharp is optional */
let sharp = null;
import { join, extname, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const GALLERY_PATH = join(__dirname, '..', 'sparti-cms', 'theme', 'nail-queen', 'assets', 'gallery', 'Nail_Queen');
const MAX_SIZE_MB = 2; // Target max size in MB
const TARGET_SIZE_MB = 1; // Preferred size in MB
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const TARGET_SIZE_BYTES = TARGET_SIZE_MB * 1024 * 1024;

// Supported image extensions
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG'];

// Recursively find all image files
async function findImageFiles(dir, fileList = []) {
  const files = await readdir(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = join(dir, file.name);
    
    // Skip __MACOSX folders and ._ files
    if (file.name === '__MACOSX' || file.name.startsWith('._')) {
      continue;
    }
    
    if (file.isDirectory()) {
      await findImageFiles(fullPath, fileList);
    } else if (file.isFile()) {
      const ext = extname(file.name);
      if (IMAGE_EXTENSIONS.includes(ext)) {
        fileList.push(fullPath);
      }
    }
  }
  
  return fileList;
}

// Get file size in bytes
async function getFileSize(filePath) {
  const stats = await stat(filePath);
  return stats.size;
}

// Compress image to target size
async function compressImage(inputPath, targetSizeBytes = TARGET_SIZE_BYTES) {
  try {
    const originalSize = await getFileSize(inputPath);
    
    // If already small enough, skip
    if (originalSize <= targetSizeBytes) {
      console.log(`✓ ${inputPath} (${(originalSize / 1024 / 1024).toFixed(2)}MB) - already small enough`);
      return { compressed: false, originalSize, newSize: originalSize };
    }
    
    console.log(`Compressing ${inputPath} (${(originalSize / 1024 / 1024).toFixed(2)}MB)...`);
    
    // Read the image
    const imageBuffer = await readFile(inputPath);
    const ext = extname(inputPath).toLowerCase();
    
    let quality = 85; // Start with good quality
    let compressedBuffer;
    let newSize = originalSize;
    
    // Binary search for optimal quality
    let minQuality = 50;
    let maxQuality = 95;
    let bestBuffer = null;
    let bestSize = originalSize;
    let bestQuality = quality;
    
    // Try to get close to target size
    for (let attempt = 0; attempt < 10; attempt++) {
      if (ext === '.png') {
        compressedBuffer = await sharp(imageBuffer)
          .png({ quality, compressionLevel: 9 })
          .toBuffer();
      } else {
        compressedBuffer = await sharp(imageBuffer)
          .jpeg({ quality, mozjpeg: true })
          .toBuffer();
      }
      
      newSize = compressedBuffer.length;
      
      // If we're close to target or under, we're good
      if (newSize <= targetSizeBytes) {
        bestBuffer = compressedBuffer;
        bestSize = newSize;
        bestQuality = quality;
        // Try to improve quality if we have room
        if (newSize < targetSizeBytes * 0.8) {
          minQuality = quality;
          quality = Math.min(95, Math.floor((quality + maxQuality) / 2));
        } else {
          break;
        }
      } else {
        // Too large, reduce quality
        maxQuality = quality;
        quality = Math.max(minQuality, Math.floor((minQuality + quality) / 2));
      }
    }
    
    // If still too large, resize the image
    if (bestSize > MAX_SIZE_BYTES) {
      console.log(`  Image still too large (${(bestSize / 1024 / 1024).toFixed(2)}MB), resizing...`);
      
      const image = sharp(imageBuffer);
      const metadata = await image.metadata();
      
      // Calculate new dimensions to reduce file size
      let scaleFactor = Math.sqrt(MAX_SIZE_BYTES / bestSize);
      scaleFactor = Math.max(0.5, Math.min(0.9, scaleFactor)); // Limit scaling between 50% and 90%
      
      const newWidth = Math.floor(metadata.width * scaleFactor);
      const newHeight = Math.floor(metadata.height * scaleFactor);
      
      if (ext === '.png') {
        bestBuffer = await image
          .resize(newWidth, newHeight, { fit: 'inside', withoutEnlargement: true })
          .png({ quality: 85, compressionLevel: 9 })
          .toBuffer();
      } else {
        bestBuffer = await image
          .resize(newWidth, newHeight, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 80, mozjpeg: true })
          .toBuffer();
      }
      
      bestSize = bestBuffer.length;
    }
    
    // Only write if we achieved meaningful compression
    if (bestSize < originalSize) {
      await writeFile(inputPath, bestBuffer);
      const saved = ((originalSize - bestSize) / 1024 / 1024).toFixed(2);
      const reduction = ((1 - bestSize / originalSize) * 100).toFixed(1);
      console.log(`  ✓ Compressed to ${(bestSize / 1024 / 1024).toFixed(2)}MB (saved ${saved}MB, ${reduction}% reduction)`);
      return { compressed: true, originalSize, newSize: bestSize };
    } else {
      console.log(`  ⚠ Could not compress further, keeping original`);
      return { compressed: false, originalSize, newSize: originalSize };
    }
    
  } catch (error) {
    console.error(`  ✗ Error compressing ${inputPath}:`, error.message);
    return { compressed: false, error: error.message };
  }
}

// Main function
async function main() {
  try {
    sharp = (await import('sharp')).default;
  } catch (err) {
    console.error('sharp is not installed (optional dependency). Install with: npm install sharp');
    console.error('Or run: pnpm add sharp');
    process.exit(1);
  }

  console.log('🔍 Finding all images in gallery directory...');
  console.log(`Path: ${GALLERY_PATH}\n`);
  
  const imageFiles = await findImageFiles(GALLERY_PATH);
  console.log(`Found ${imageFiles.length} images to process\n`);
  
  let totalOriginalSize = 0;
  let totalNewSize = 0;
  let compressedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < imageFiles.length; i++) {
    const file = imageFiles[i];
    console.log(`[${i + 1}/${imageFiles.length}] Processing: ${file.replace(GALLERY_PATH, '')}`);
    
    const result = await compressImage(file);
    
    if (result.error) {
      errorCount++;
    } else {
      totalOriginalSize += result.originalSize;
      totalNewSize += result.newSize;
      
      if (result.compressed) {
        compressedCount++;
      } else {
        skippedCount++;
      }
    }
    
    console.log(''); // Empty line for readability
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 COMPRESSION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total images processed: ${imageFiles.length}`);
  console.log(`Successfully compressed: ${compressedCount}`);
  console.log(`Skipped (already small): ${skippedCount}`);
  console.log(`Errors: ${errorCount}`);
  console.log('');
  console.log(`Original total size: ${(totalOriginalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`New total size: ${(totalNewSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Total saved: ${((totalOriginalSize - totalNewSize) / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Overall reduction: ${((1 - totalNewSize / totalOriginalSize) * 100).toFixed(1)}%`);
  console.log('='.repeat(60));
}

// Run the script
main().catch(console.error);
