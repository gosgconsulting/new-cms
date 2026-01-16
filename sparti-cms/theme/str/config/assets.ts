// Centralized asset configuration for STR theme
// Update these paths to change assets without modifying component code

const ASSET_BASE_PATH = '/theme/str/assets';

export const STR_ASSETS = {
  // Logos
  logos: {
    header: `${ASSET_BASE_PATH}/logos/logo.png`, // Main header logo (uses existing logo.png file)
    circular: `${ASSET_BASE_PATH}/logos/logo-circle.png`, // Circular logo for hero section (uses existing logo-circle.png file)
    footer: `${ASSET_BASE_PATH}/logos/logo.png`, // Footer logo (uses existing logo.png file)
  },
  
  // Hero Section
  hero: {
    background: `${ASSET_BASE_PATH}/hero/hero-background.jpg`,
  },
  
  // Section Backgrounds
  backgrounds: {
    aboutUs: `${ASSET_BASE_PATH}/about/ABOUT-US-BACKGROUND.jpg`,
  },
  
  // Content Images
  images: {
    programmes: `${ASSET_BASE_PATH}/programmes/Group-1171274862-1.png`,
  },
  
  // Gallery Images
  gallery: [
    `${ASSET_BASE_PATH}/gallery/athlete-1-300x300.png`,
    `${ASSET_BASE_PATH}/gallery/athlete-2-300x300.png`,
    `${ASSET_BASE_PATH}/gallery/athlete-3-300x300.png`,
    `${ASSET_BASE_PATH}/gallery/athlete-4-200x300.png`,
    `${ASSET_BASE_PATH}/gallery/Athletes-300x225.jpg`,
    `${ASSET_BASE_PATH}/gallery/GALLERY-2-200x300.jpg`,
    `${ASSET_BASE_PATH}/gallery/GALLERY-200x300.jpg`,
    `${ASSET_BASE_PATH}/gallery/Personal-Training-200x300.jpg`,
    `${ASSET_BASE_PATH}/gallery/Physio-space-200x300.jpg`,
    `${ASSET_BASE_PATH}/gallery/programme-1-300x300.png`,
    `${ASSET_BASE_PATH}/gallery/programme-2-300x300.png`,
    `${ASSET_BASE_PATH}/gallery/Programmes-1-200x300.jpg`,
    `${ASSET_BASE_PATH}/gallery/Programmes-139x300.png`,
    `${ASSET_BASE_PATH}/gallery/Programmes-2-200x300.jpg`,
    `${ASSET_BASE_PATH}/gallery/Programmes-3-200x300.jpg`,
    `${ASSET_BASE_PATH}/gallery/Programmes-31-200x300.jpg`,
    `${ASSET_BASE_PATH}/gallery/Programmes-4-200x300.jpg`,
    `${ASSET_BASE_PATH}/gallery/Programmes-5-200x300.jpg`,
    `${ASSET_BASE_PATH}/gallery/Programmes-6-200x300.jpg`,
  ],
} as const;

// Helper function to get gallery images with alt text
export const getGalleryImages = () => {
  const altTexts = [
    'STR Fitness athlete training',
    'STR Fitness athlete in action',
    'STR Fitness athlete workout',
    'STR Fitness athlete training session',
    'STR Fitness athletes group training',
    'STR Fitness gallery training session',
    'STR Fitness gallery facility',
    'STR Fitness personal training session',
    'STR Fitness physiotherapy space',
    'STR Fitness programme training',
    'STR Fitness programme session',
    'STR Fitness programmes training',
    'STR Fitness programmes facility',
    'STR Fitness programmes session',
    'STR Fitness programmes training area',
    'STR Fitness programmes workout',
    'STR Fitness programmes facility',
    'STR Fitness programmes training',
    'STR Fitness programmes session',
  ];
  
  return STR_ASSETS.gallery.map((src, index) => ({
    src,
    alt: altTexts[index] || 'STR Fitness gallery image',
  }));
};
