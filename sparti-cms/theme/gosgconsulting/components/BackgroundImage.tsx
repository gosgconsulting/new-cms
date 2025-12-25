import React from 'react';

interface BackgroundImageProps {
  backgroundType?: string; // default: "image"
  backgroundColor?: string; // default: "#ffffff"
  backgroundImage?: string; // default: "/placeholder.svg"
  backgroundVideo?: string; // default: ""
  backgroundSize?: string; // default: "cover"
  backgroundPosition?: string; // default: "center"
  backgroundRepeat?: string; // default: "no-repeat"
  backgroundAttachment?: string; // default: "scroll"
  overlay?: boolean; // default: false
  overlayColor?: string; // default: "rgba(0,0,0,0.5)"
  minHeight?: string; // default: "400px"
  padding?: string; // default: "2rem"
  content?: string; // default: "<div class='p-4'><h2>Section with Background</h2><p>Add your content here</p></div>"
}

const BackgroundImage: React.FC<BackgroundImageProps> = ({
  backgroundType = 'image',
  backgroundColor = '#ffffff',
  backgroundImage = '/placeholder.svg',
  backgroundVideo = '',
  backgroundSize = 'cover',
  backgroundPosition = 'center',
  backgroundRepeat = 'no-repeat',
  backgroundAttachment = 'scroll',
  overlay = false,
  overlayColor = 'rgba(0,0,0,0.5)',
  minHeight = '400px',
  padding = '2rem',
  content = '<div class=\'p-4\'><h2>Section with Background</h2><p>Add your content here</p></div>',
}) => {
  return (
    <section className="py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {backgroundImage && (
          <img src={backgroundImage} alt="backgroundImage" className="w-full h-auto rounded-lg" />
        )}
        {content && (
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">{content}</p>
        )}
      </div>
    </section>
  );
};

export default BackgroundImage;
