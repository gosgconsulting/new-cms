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
  
  // Gallery Images - Personal Training Gallery
  personalTrainingGallery: [
    `${ASSET_BASE_PATH}/gallery/personal-training-1.png`,
    `${ASSET_BASE_PATH}/gallery/personal-training-2.png`,
    `${ASSET_BASE_PATH}/gallery/personal-training-3.png`,
    `${ASSET_BASE_PATH}/gallery/personal-training-4.png`,
    `${ASSET_BASE_PATH}/gallery/personal-training-5.png`,
    `${ASSET_BASE_PATH}/gallery/personal-training-6.png`,
    `${ASSET_BASE_PATH}/gallery/personal-training-7.png`,
    `${ASSET_BASE_PATH}/gallery/personal-training-8.png`,
    `${ASSET_BASE_PATH}/gallery/personal-training-9.png`,
  ],
  
  // Gallery Images - Group Class Gallery
  groupClassGallery: [
    `${ASSET_BASE_PATH}/gallery/group-class-1.png`,
    `${ASSET_BASE_PATH}/gallery/group-class-2.png`,
    `${ASSET_BASE_PATH}/gallery/group-class-3.png`,
    `${ASSET_BASE_PATH}/gallery/group-class-4.png`,
    `${ASSET_BASE_PATH}/gallery/group-class-5.png`,
    `${ASSET_BASE_PATH}/gallery/group-class-6.png`,
  ],
  
  // Gallery Images - Physiotherapy Gallery
  physiotherapyGallery: [
    `${ASSET_BASE_PATH}/gallery/physiotherapy-1.png`,
    `${ASSET_BASE_PATH}/gallery/physiotherapy-2.png`,
    `${ASSET_BASE_PATH}/gallery/physiotherapy-3.png`,
    `${ASSET_BASE_PATH}/gallery/physiotherapy-4.png`,
    `${ASSET_BASE_PATH}/gallery/physiotherapy-5.png`,
    `${ASSET_BASE_PATH}/gallery/physiotherapy-6.png`,
  ],
  
  // Legacy gallery - kept for backward compatibility (defaults to personal training)
  gallery: [
    `${ASSET_BASE_PATH}/gallery/personal-training-1.png`,
    `${ASSET_BASE_PATH}/gallery/personal-training-2.png`,
    `${ASSET_BASE_PATH}/gallery/personal-training-3.png`,
    `${ASSET_BASE_PATH}/gallery/personal-training-4.png`,
    `${ASSET_BASE_PATH}/gallery/personal-training-5.png`,
    `${ASSET_BASE_PATH}/gallery/personal-training-6.png`,
    `${ASSET_BASE_PATH}/gallery/personal-training-7.png`,
    `${ASSET_BASE_PATH}/gallery/personal-training-8.png`,
    `${ASSET_BASE_PATH}/gallery/personal-training-9.png`,
  ],
} as const;

// Helper function to get Personal Training gallery images with alt text
export const getPersonalTrainingGalleryImages = () => {
  const altTexts = [
    'STR Personal Training - Plyometric box jump exercise with trainer observation',
    'STR Personal Training - One-on-one training session with leg exercise',
    'STR Personal Training - Dynamic plyometric training session',
    'STR Personal Training - Outdoor training with plyometric boxes',
    'STR Personal Training - Trainer and client interaction during workout',
    'STR Personal Training - Resistance band exercise with trainer guidance',
    'STR Personal Training - Abdominal exercise with trainer support',
    'STR Personal Training - Manual therapy and assessment session',
    'STR Personal Training - Hands-on training and therapy session',
  ];
  
  return STR_ASSETS.personalTrainingGallery.map((src, index) => ({
    src,
    alt: altTexts[index] || 'STR Personal Training gallery image',
  }));
};

// Helper function to get Group Class gallery images with alt text
export const getGroupClassGalleryImages = () => {
  const altTexts = [
    'STR Group Class - Dynamic group training session with multiple exercises',
    'STR Group Class - Functional training with rowing machines and equipment',
    'STR Group Class - Team of trainers and athletes at STR facility',
    'STR Group Class - Group rowing session with Concept2 machines',
    'STR Group Class - Outdoor training session with stretching',
    'STR Group Class - Instructor-led group class with participants',
  ];
  
  return STR_ASSETS.groupClassGallery.map((src, index) => ({
    src,
    alt: altTexts[index] || 'STR Group Class gallery image',
  }));
};

// Helper function to get Physiotherapy gallery images with alt text
export const getPhysiotherapyGalleryImages = () => {
  const altTexts = [
    'STR Physiotherapy - Manual therapy session with therapist treating patient on treatment table',
    'STR Physiotherapy - Hands-on physiotherapy treatment with therapist applying manual techniques',
    'STR Physiotherapy - Active rehabilitation session with leg exercise and therapist guidance',
    'STR Physiotherapy - Knee and thigh rehabilitation with manual therapy techniques',
    'STR Physiotherapy - Treadmill assessment and monitoring during rehabilitation',
    'STR Physiotherapy - Leg curl and extension exercise with therapist assistance',
  ];
  
  return STR_ASSETS.physiotherapyGallery.map((src, index) => ({
    src,
    alt: altTexts[index] || 'STR Physiotherapy gallery image',
  }));
};

// Legacy function - kept for backward compatibility (defaults to personal training)
export const getGalleryImages = () => {
  return getPersonalTrainingGalleryImages();
};
