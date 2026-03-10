import InteractiveBentoGallery from "./ui/interactive-bento-gallery";

export function GallerySlider() {
  // Convert gallery images to InteractiveBentoGallery format
  const mediaItems = [
    {
      id: 1,
      type: "image",
      title: "Ballet Excellence",
      desc: "Royal Academy of Dance Certified Training - Our students master classical ballet technique through RAD syllabus, developing grace, strength, and artistry in our beautiful studios.",
      url: "https://images.pexels.com/photos/8612992/pexels-photo-8612992.jpeg",
      span: "md:col-span-1 md:row-span-3 sm:col-span-1 sm:row-span-2",
    },
    {
      id: 2,
      type: "image",
      title: "Performance Opportunities",
      desc: "Annual Showcases & Competition Success - Students shine on stage through our annual recitals, competitions, and special performances throughout Singapore.",
      url: "https://images.pexels.com/photos/5278773/pexels-photo-5278773.jpeg",
      span: "md:col-span-2 md:row-span-2 col-span-1 sm:col-span-2 sm:row-span-2",
    },
    {
      id: 3,
      type: "image",
      title: "Contemporary Expression",
      desc: "Modern Dance & Creative Movement - Explore contemporary dance forms that emphasize creativity, emotion, and personal expression in movement.",
      url: "https://images.pexels.com/photos/3737633/pexels-photo-3737633.jpeg",
      span: "md:col-span-1 md:row-span-3 sm:col-span-2 sm:row-span-2",
    },
    {
      id: 4,
      type: "image",
      title: "Youth Development",
      desc: "Building Confidence & Character - Our youth programs focus on personal growth, discipline, and self-expression through the art of dance.",
      url: "https://images.pexels.com/photos/8923183/pexels-photo-8923183.jpeg",
      span: "md:col-span-2 md:row-span-2 sm:col-span-1 sm:row-span-2",
    },
    {
      id: 5,
      type: "image",
      title: "Adult Classes",
      desc: "Never Too Late to Start - Adult dancers discover joy, fitness, and community in our welcoming and supportive environment.",
      url: "https://images.pexels.com/photos/7319333/pexels-photo-7319333.jpeg",
      span: "md:col-span-1 md:row-span-3 sm:col-span-1 sm:row-span-2",
    },
    {
      id: 6,
      type: "image",
      title: "Competition Training",
      desc: "Excellence in Performance - Dedicated students train for competitions with personalized coaching and advanced technique development.",
      url: "https://images.pexels.com/photos/7319717/pexels-photo-7319717.jpeg",
      span: "md:col-span-2 md:row-span-2 sm:col-span-1 sm:row-span-2",
    },
  ];

  return (
    <section id="gallery" className="py-32 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <InteractiveBentoGallery
          mediaItems={mediaItems}
          title="Gallery Shots Collection"
          description="Drag and explore our curated collection of dance moments"
        />
      </div>
    </section>
  );
}
