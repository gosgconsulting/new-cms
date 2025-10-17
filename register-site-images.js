import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  createMediaFolder, 
  getMediaFolders, 
  createMediaItem, 
  getMediaItems,
  trackMediaUsage 
} from './sparti-cms/db/postgres.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Image file extensions to scan for
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.ico'];

// Define image metadata with SEO-optimized alt text and descriptions
const IMAGE_METADATA = {
  // Main logos
  'go-sg-logo-official.png': {
    title: 'GO SG Official Logo',
    alt: 'GO SG Digital Marketing Agency official logo',
    description: 'Official logo of GO SG, Singapore\'s leading digital marketing and SEO agency',
    usage: [
      { type: 'component', id: 'header', context: 'main_logo' },
      { type: 'page', id: 'homepage', context: 'branding' }
    ]
  },
  'go-sg-logo.png': {
    title: 'GO SG Logo',
    alt: 'GO SG logo for digital marketing services',
    description: 'GO SG logo used across marketing materials and website',
    usage: [
      { type: 'component', id: 'footer', context: 'branding' }
    ]
  },
  'favicon.png': {
    title: 'GO SG Favicon',
    alt: 'GO SG website favicon',
    description: 'Favicon for GO SG website browser tab display',
    usage: [
      { type: 'page', id: 'all', context: 'favicon' }
    ]
  },
  'favicon.ico': {
    title: 'GO SG Favicon ICO',
    alt: 'GO SG website favicon in ICO format',
    description: 'Favicon in ICO format for browser compatibility',
    usage: [
      { type: 'page', id: 'all', context: 'favicon' }
    ]
  },

  // Team members
  'member-1.png': {
    title: 'Team Member - SEO Specialist',
    alt: 'Professional headshot of GO SG SEO specialist team member',
    description: 'Team member photo showcasing our experienced SEO specialists',
    usage: [
      { type: 'component', id: 'team-section', context: 'team_photo' }
    ]
  },
  'member-2.jpeg': {
    title: 'Team Member - Digital Marketing Expert',
    alt: 'Professional headshot of GO SG digital marketing expert',
    description: 'Team member photo of our digital marketing specialist',
    usage: [
      { type: 'component', id: 'team-section', context: 'team_photo' }
    ]
  },
  'member-3.png': {
    title: 'Team Member - Content Strategist',
    alt: 'Professional headshot of GO SG content strategist',
    description: 'Team member photo showcasing our content strategy expertise',
    usage: [
      { type: 'component', id: 'team-section', context: 'team_photo' }
    ]
  },
  'member-4.png': {
    title: 'Team Member - Technical SEO Specialist',
    alt: 'Professional headshot of GO SG technical SEO specialist',
    description: 'Team member photo of our technical SEO expert',
    usage: [
      { type: 'component', id: 'team-section', context: 'team_photo' }
    ]
  },

  // SEO service images
  'keyword-research-1.png': {
    title: 'Keyword Research Analytics Dashboard',
    alt: 'SEO keyword research analytics dashboard showing search volume and competition data',
    description: 'Professional keyword research dashboard displaying search volume, competition metrics, and keyword opportunities for SEO campaigns',
    usage: [
      { type: 'component', id: 'seo-services', context: 'keyword_research' }
    ]
  },
  'keyword-research-2.png': {
    title: 'Advanced Keyword Analysis Tool',
    alt: 'Advanced keyword analysis interface with competitor research and ranking data',
    description: 'Comprehensive keyword analysis tool showing competitor rankings and search opportunities',
    usage: [
      { type: 'component', id: 'seo-services', context: 'keyword_research' }
    ]
  },
  'content-strategy-1.png': {
    title: 'Content Strategy Planning Dashboard',
    alt: 'Content strategy planning dashboard with editorial calendar and performance metrics',
    description: 'Professional content strategy dashboard showing editorial calendar, content performance, and planning tools',
    usage: [
      { type: 'component', id: 'seo-services', context: 'content_strategy' }
    ]
  },
  'content-strategy-2.png': {
    title: 'Content Performance Analytics',
    alt: 'Content performance analytics showing engagement metrics and SEO impact',
    description: 'Detailed content performance analytics dashboard displaying engagement metrics and SEO effectiveness',
    usage: [
      { type: 'component', id: 'seo-services', context: 'content_strategy' }
    ]
  },
  'link-building-1.png': {
    title: 'Link Building Campaign Dashboard',
    alt: 'Link building campaign dashboard showing backlink acquisition and domain authority metrics',
    description: 'Professional link building dashboard displaying backlink campaigns, domain authority growth, and link quality metrics',
    usage: [
      { type: 'component', id: 'seo-services', context: 'link_building' }
    ]
  },
  'link-building-2.png': {
    title: 'Backlink Analysis Tool',
    alt: 'Backlink analysis interface showing link quality assessment and competitor backlink profiles',
    description: 'Advanced backlink analysis tool displaying link quality metrics and competitor backlink strategies',
    usage: [
      { type: 'component', id: 'seo-services', context: 'link_building' }
    ]
  },

  // Results/case studies
  'result-1.png': {
    title: 'SEO Results - 400% Traffic Increase',
    alt: 'SEO case study showing 400% organic traffic increase over 6 months',
    description: 'Impressive SEO results demonstrating 400% organic traffic growth achieved through comprehensive SEO strategy',
    usage: [
      { type: 'component', id: 'results-slider', context: 'case_study' }
    ]
  },
  'result-2.png': {
    title: 'SEO Results - Keyword Ranking Improvement',
    alt: 'SEO case study displaying dramatic keyword ranking improvements from page 5 to page 1',
    description: 'SEO success story showing significant keyword ranking improvements and search visibility growth',
    usage: [
      { type: 'component', id: 'results-slider', context: 'case_study' }
    ]
  },
  'result-3.png': {
    title: 'SEO Results - Local Search Domination',
    alt: 'Local SEO results showing top rankings for Singapore-based business searches',
    description: 'Local SEO case study demonstrating domination of Singapore local search results',
    usage: [
      { type: 'component', id: 'results-slider', context: 'case_study' }
    ]
  },
  'result-4.png': {
    title: 'SEO Results - E-commerce Growth',
    alt: 'E-commerce SEO results showing increased online sales and product visibility',
    description: 'E-commerce SEO success story with significant sales growth and product search visibility',
    usage: [
      { type: 'component', id: 'results-slider', context: 'case_study' }
    ]
  },
  'result-5.png': {
    title: 'SEO Results - Content Marketing Success',
    alt: 'Content marketing SEO results showing blog traffic and engagement growth',
    description: 'Content marketing SEO case study with impressive blog traffic and user engagement improvements',
    usage: [
      { type: 'component', id: 'results-slider', context: 'case_study' }
    ]
  },
  'result-6.png': {
    title: 'SEO Results - Technical SEO Improvements',
    alt: 'Technical SEO audit results showing site speed and performance improvements',
    description: 'Technical SEO case study demonstrating significant site performance and search engine crawlability improvements',
    usage: [
      { type: 'component', id: 'results-slider', context: 'case_study' }
    ]
  },
  'result-7.png': {
    title: 'SEO Results - Mobile Search Optimization',
    alt: 'Mobile SEO results showing improved mobile search rankings and user experience',
    description: 'Mobile SEO optimization case study with enhanced mobile search performance and user experience',
    usage: [
      { type: 'component', id: 'results-slider', context: 'case_study' }
    ]
  },
  'result-8.png': {
    title: 'SEO Results - International SEO Expansion',
    alt: 'International SEO results showing global market penetration and multilingual search success',
    description: 'International SEO case study demonstrating successful global market expansion and multilingual search optimization',
    usage: [
      { type: 'component', id: 'results-slider', context: 'case_study' }
    ]
  },
  'result-9.png': {
    title: 'SEO Results - Brand Visibility Growth',
    alt: 'Brand SEO results showing increased brand search volume and online visibility',
    description: 'Brand SEO case study with significant brand search volume growth and online visibility improvements',
    usage: [
      { type: 'component', id: 'results-slider', context: 'case_study' }
    ]
  },
  'result-10.png': {
    title: 'SEO Results - Conversion Rate Optimization',
    alt: 'SEO and CRO results showing improved conversion rates and lead generation',
    description: 'Combined SEO and conversion rate optimization case study with enhanced lead generation and sales conversions',
    usage: [
      { type: 'component', id: 'results-slider', context: 'case_study' }
    ]
  },

  // Client logos
  'art-in-bloom.png': {
    title: 'Art in Bloom Client Logo',
    alt: 'Art in Bloom client logo - GO SG SEO success story',
    description: 'Logo of Art in Bloom, a satisfied GO SG client showcasing our SEO expertise',
    usage: [
      { type: 'component', id: 'client-logos', context: 'client_logo' }
    ]
  },
  'selenightco.png': {
    title: 'Selenight Co Client Logo',
    alt: 'Selenight Co client logo - digital marketing success case',
    description: 'Logo of Selenight Co, demonstrating GO SG\'s digital marketing success',
    usage: [
      { type: 'component', id: 'client-logos', context: 'client_logo' }
    ]
  },
  'smooy.png': {
    title: 'Smooy Client Logo',
    alt: 'Smooy client logo - SEO and digital marketing case study',
    description: 'Logo of Smooy, showcasing GO SG\'s effective SEO and digital marketing strategies',
    usage: [
      { type: 'component', id: 'client-logos', context: 'client_logo' }
    ]
  },
  'solstice.png': {
    title: 'Solstice Client Logo',
    alt: 'Solstice client logo - successful SEO campaign results',
    description: 'Logo of Solstice, representing successful SEO campaign results by GO SG',
    usage: [
      { type: 'component', id: 'client-logos', context: 'client_logo' }
    ]
  },
  'grub.png': {
    title: 'Grub Client Logo',
    alt: 'Grub client logo - local SEO success story',
    description: 'Logo of Grub, demonstrating GO SG\'s local SEO expertise and success',
    usage: [
      { type: 'component', id: 'client-logos', context: 'client_logo' }
    ]
  },
  'nail-queen.png': {
    title: 'Nail Queen Client Logo',
    alt: 'Nail Queen client logo - beauty industry SEO success',
    description: 'Logo of Nail Queen, showcasing GO SG\'s success in beauty industry SEO',
    usage: [
      { type: 'component', id: 'client-logos', context: 'client_logo' }
    ]
  },
  'caro-patisserie.png': {
    title: 'Caro Patisserie Client Logo',
    alt: 'Caro Patisserie client logo - food industry digital marketing success',
    description: 'Logo of Caro Patisserie, representing GO SG\'s expertise in food industry digital marketing',
    usage: [
      { type: 'component', id: 'client-logos', context: 'client_logo' }
    ]
  },
  'spirit-stretch.png': {
    title: 'Spirit Stretch Client Logo',
    alt: 'Spirit Stretch client logo - fitness industry SEO case study',
    description: 'Logo of Spirit Stretch, demonstrating GO SG\'s fitness industry SEO expertise',
    usage: [
      { type: 'component', id: 'client-logos', context: 'client_logo' }
    ]
  },

  // Public assets
  'gregoire-liao.png': {
    title: 'Gregoire Liao - GO SG Founder',
    alt: 'Professional photo of Gregoire Liao, founder and CEO of GO SG digital marketing agency',
    description: 'Professional headshot of Gregoire Liao, founder and CEO of GO SG, Singapore\'s leading SEO and digital marketing agency',
    usage: [
      { type: 'page', id: 'about', context: 'founder_photo' },
      { type: 'component', id: 'about-section', context: 'team_leader' }
    ]
  },
  'seo-results-1.png': {
    title: 'SEO Performance Dashboard',
    alt: 'Comprehensive SEO performance dashboard showing traffic growth and ranking improvements',
    description: 'Professional SEO performance dashboard displaying comprehensive analytics, traffic growth, and search ranking improvements',
    usage: [
      { type: 'page', id: 'services', context: 'performance_showcase' }
    ]
  },

  // Placeholder and generic assets
  'placeholder.svg': {
    title: 'Image Placeholder',
    alt: 'Generic image placeholder for GO SG website',
    description: 'Generic SVG placeholder image used throughout the GO SG website for content loading states',
    usage: [
      { type: 'component', id: 'various', context: 'placeholder' }
    ]
  }
};

// Function to get file size
function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    console.warn(`Could not get file size for ${filePath}:`, error.message);
    return 0;
  }
}

// Function to get MIME type from extension
function getMimeType(extension) {
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon'
  };
  return mimeTypes[extension.toLowerCase()] || 'image/png';
}

// Function to scan directory for images
function scanDirectoryForImages(dirPath, relativePath = '') {
  const images = [];
  
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const relativeItemPath = relativePath ? path.join(relativePath, item) : item;
      
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Recursively scan subdirectories
        images.push(...scanDirectoryForImages(fullPath, relativeItemPath));
      } else if (stat.isFile()) {
        const extension = path.extname(item).toLowerCase();
        if (IMAGE_EXTENSIONS.includes(extension)) {
          images.push({
            filename: item,
            fullPath,
            relativePath: relativeItemPath,
            extension,
            size: stat.size,
            directory: relativePath || 'root'
          });
        }
      }
    }
  } catch (error) {
    console.warn(`Could not scan directory ${dirPath}:`, error.message);
  }
  
  return images;
}

// Function to determine folder based on path
function getFolderFromPath(relativePath) {
  const pathParts = relativePath.split(path.sep);
  
  // Map directories to folder names
  if (pathParts.includes('logos')) return 'logos';
  if (pathParts.includes('team')) return 'team';
  if (pathParts.includes('seo')) return 'seo';
  if (pathParts.includes('results')) return 'results';
  if (pathParts.includes('lovable-uploads')) return 'blog';
  
  return 'general'; // Default folder
}

// Main function to register all images
async function registerAllImages() {
  console.log('[testing] Starting comprehensive image registration...\n');
  
  try {
    // Get existing folders
    const existingFolders = await getMediaFolders();
    console.log(`✅ Found ${existingFolders.length} existing media folders`);
    
    // Get existing media items to avoid duplicates
    const existingMedia = await getMediaItems(1000, 0);
    console.log(`✅ Found ${existingMedia.total} existing media items`);
    
    // Scan for images in multiple directories
    const imagePaths = [
      { path: path.join(__dirname, 'src', 'assets'), baseUrl: '/src/assets', basePath: 'src/assets' },
      { path: path.join(__dirname, 'public'), baseUrl: '', basePath: 'public' },
      { path: path.join(__dirname, 'public', 'assets'), baseUrl: '/assets', basePath: 'public/assets' },
      { path: path.join(__dirname, 'public', 'lovable-uploads'), baseUrl: '/lovable-uploads', basePath: 'public/lovable-uploads' }
    ];
    
    let totalImages = 0;
    let registeredImages = 0;
    let skippedImages = 0;
    
    for (const scanPath of imagePaths) {
      if (!fs.existsSync(scanPath.path)) {
        console.log(`⚠️  Directory not found: ${scanPath.path}`);
        continue;
      }
      
      console.log(`\n📁 Scanning: ${scanPath.path}`);
      const images = scanDirectoryForImages(scanPath.path);
      totalImages += images.length;
      
      console.log(`   Found ${images.length} images`);
      
      for (const image of images) {
        const filename = image.filename;
        const relativePath = image.relativePath.replace(/\\/g, '/'); // Normalize path separators
        const url = `${scanPath.baseUrl}/${relativePath}`.replace(/\/+/g, '/'); // Clean up double slashes
        
        // Check if already exists
        const existingItem = existingMedia.media.find(item => 
          item.filename === filename || item.url === url || item.relative_path === relativePath
        );
        
        if (existingItem) {
          console.log(`   ⏭️  Skipping existing: ${filename}`);
          skippedImages++;
          continue;
        }
        
        // Get metadata for this image
        const metadata = IMAGE_METADATA[filename] || {
          title: filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          alt: `${filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ')} - GO SG digital marketing`,
          description: `Professional image asset used in GO SG digital marketing and SEO services`
        };
        
        // Determine folder
        const folderName = getFolderFromPath(relativePath);
        const folder = existingFolders.find(f => f.slug === folderName);
        
        try {
          // Create media item
          const mediaItem = await createMediaItem({
            filename: filename,
            original_filename: filename,
            alt_text: metadata.alt,
            title: metadata.title,
            description: metadata.description,
            url: url,
            relative_path: relativePath,
            mime_type: getMimeType(image.extension),
            file_extension: image.extension.replace('.', ''),
            file_size: image.size,
            folder_id: folder ? folder.id : null,
            media_type: 'image',
            is_featured: filename.includes('logo') || filename.includes('result'),
            seo_optimized: true,
            metadata: {
              source_directory: scanPath.basePath,
              scan_date: new Date().toISOString(),
              file_path: image.fullPath
            }
          });
          
          console.log(`   ✅ Registered: ${filename} (ID: ${mediaItem.id})`);
          registeredImages++;
          
          // Track usage if defined
          if (metadata.usage) {
            for (const usage of metadata.usage) {
              await trackMediaUsage(mediaItem.id, usage.type, usage.id, usage.context);
            }
            console.log(`      📊 Tracked ${metadata.usage.length} usage records`);
          }
          
        } catch (error) {
          console.error(`   ❌ Failed to register ${filename}:`, error.message);
        }
      }
    }
    
    // Final statistics
    console.log('\n📊 Registration Summary:');
    console.log(`   Total images found: ${totalImages}`);
    console.log(`   Successfully registered: ${registeredImages}`);
    console.log(`   Skipped (already exists): ${skippedImages}`);
    console.log(`   Failed: ${totalImages - registeredImages - skippedImages}`);
    
    // Show folder statistics
    console.log('\n📁 Final folder statistics:');
    const finalFolders = await getMediaFolders();
    finalFolders.forEach(folder => {
      console.log(`   ${folder.name}: ${folder.media_count} items (${Math.round(folder.total_size / 1024)}KB)`);
    });
    
    console.log('\n🎉 Image registration completed successfully!');
    
  } catch (error) {
    console.error('❌ Image registration failed:', error);
    throw error;
  }
}

// Run the registration
registerAllImages().then(() => {
  console.log('\n✅ Script completed successfully');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Script failed:', error);
  process.exit(1);
});
