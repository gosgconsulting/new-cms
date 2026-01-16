import React, { useState, useRef } from 'react';
import './theme.css';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, CarouselIndicators } from '@/components/ui/carousel';
import { Star, Menu, X, ArrowRight, Wrench, Award, Users, ChevronUp, Plus, Minus, Instagram } from 'lucide-react';

interface TenantLandingProps {
  tenantName?: string;
  tenantSlug?: string;
  tenantId?: string;
  pageSlug?: string;
}

const STRTheme: React.FC<TenantLandingProps> = ({
  tenantName = 'STR',
  tenantSlug = 'str',
  tenantId
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeProgramme, setActiveProgramme] = useState(0);
  const [activeGalleryFilter, setActiveGalleryFilter] = useState('All');
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const galleryCarouselApi = useRef<any>(null);
  const teamCarouselApi = useRef<any>(null);

  // Navigation items
  const navItems = [
    { name: 'About Us', href: '#about' },
    { name: 'Programmes', href: '#programmes' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'FAQs', href: '#faq' },
    { name: 'Contact', href: '#contact' },
  ];

  // Footer menu items
  const footerMenuItems = [
    { name: 'About Us', href: '#about' },
    { name: 'Our Programmes', href: '#programmes' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'Reviews', href: '#testimonials' },
    { name: 'Our Team', href: '#team' },
    { name: 'FAQ', href: '#faq' },
  ];

  // Programmes data for accordion
  const programmes = [
    {
      title: 'PERSONAL TRAINING',
      description: 'One-on-one coaching tailored to your individual goals, whether you\'re looking to build strength, improve performance, or recover from injury. Our experienced coaches guide every workout with proper form and purpose.',
      content: 'Personal training at STR is designed to give you individualized attention and a program specifically tailored to your needs. Whether you\'re a beginner or an advanced athlete, our coaches will work with you to achieve your goals through evidence-based training methods.',
    },
    {
      title: 'SPORTS TRAINING',
      description: 'Specialized programs designed for athletes looking to enhance their performance, speed, agility, and sport-specific skills. Follow proven training programs designed to deliver real, measurable results.',
      content: 'Our sports training programs are built on scientific principles and years of experience working with athletes. We focus on developing the physical attributes that matter most for your sport, from power and speed to endurance and agility.',
    },
    {
      title: 'REHABILITATION',
      description: 'Evidence-based rehabilitation programs to help you recover from injuries and return to peak physical condition safely and effectively. Train in a motivating environment that helps you stay consistent and reach your goals.',
      content: 'STR\'s rehabilitation programs combine therapeutic exercise with progressive strength training to help you recover from injuries and prevent future ones. Our approach is evidence-based and tailored to your specific needs.',
    },
    {
      title: 'STRENGTH PROGRAMMES',
      description: 'Comprehensive strength training programs for all levels, from beginners to advanced athletes seeking to maximize their potential. Build real strength through structured, progressive training.',
      content: 'Our strength programmes are designed to help you build functional strength that translates to real-world performance. We use proven methods and progressive overload to ensure continuous improvement.',
    },
  ];

  // Gallery filters
  const galleryFilters = ['All', 'Training', 'Facility', 'Equipment', 'Team', 'Results'];

  // Gallery images
  const galleryImages = [
    { src: 'https://images.pexels.com/photos/4164754/pexels-photo-4164754.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Training session', title: 'Athlete Training', category: 'Training' },
    { src: 'https://images.pexels.com/photos/4164754/pexels-photo-4164754.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Equipment', title: 'Training Equipment', category: 'Equipment' },
    { src: 'https://images.pexels.com/photos/4164754/pexels-photo-4164754.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Client workout', title: 'Client Session', category: 'Training' },
    { src: 'https://images.pexels.com/photos/4164754/pexels-photo-4164754.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Group training', title: 'Group Training', category: 'Training' },
    { src: 'https://images.pexels.com/photos/4164754/pexels-photo-4164754.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Training environment', title: 'Facility', category: 'Facility' },
    { src: 'https://images.pexels.com/photos/4164754/pexels-photo-4164754.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Athlete performance', title: 'Performance Training', category: 'Training' },
    { src: 'https://images.pexels.com/photos/4164754/pexels-photo-4164754.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Rehabilitation', title: 'Rehab Session', category: 'Training' },
    { src: 'https://images.pexels.com/photos/4164754/pexels-photo-4164754.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Strength training', title: 'Strength Workout', category: 'Training' },
    { src: 'https://images.pexels.com/photos/4164754/pexels-photo-4164754.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Coaching', title: 'Coaching Session', category: 'Team' },
  ];

  // Filter gallery images
  const filteredGalleryImages = activeGalleryFilter === 'All' 
    ? galleryImages 
    : galleryImages.filter(img => img.category === activeGalleryFilter);

  // Testimonials
  const testimonials = [
    {
      name: 'Melissa K.',
      role: 'Student',
      quote: 'The Coaches Are Knowledgeable And Supportive, Making Every Workout Feel Focused, Effective, And Perfectly Aligned With My Fitness Goals.',
    },
    {
      name: 'Daniel R.',
      role: 'Entrepreneur',
      quote: 'Training Here Feels Structured And Motivating, With Clear Guidance That Helps Me Stay Consistent And See Real Progress Over Time.',
    },
    {
      name: 'Jonathan P.',
      role: 'Athlete',
      quote: 'The Programs Are Well-Designed And Challenging, Pushing Me To Improve While Still Feeling Safe And Properly Coached.',
    },
    {
      name: 'Sarah M.',
      role: 'Professional',
      quote: 'STR Has Completely Transformed My Approach To Training. The Evidence-Based Coaching And Personalized Attention Have Helped Me Achieve Goals I Never Thought Possible.',
    },
    {
      name: 'James T.',
      role: 'Rehabilitation Client',
      quote: 'After A Serious Injury, STR\'s Rehabilitation Program Got Me Back To Full Strength. The Team\'s Expertise And Support Were Invaluable Throughout My Recovery.',
    },
    {
      name: 'Emma R.',
      role: 'Athlete',
      quote: 'The Sports Training Program Has Significantly Improved My Performance. The Coaches Understand What Athletes Need And Deliver Results.',
    },
  ];

  // Team members
  const teamMembers = [
    {
      name: 'Alex Johnson',
      role: 'Head Coach',
      description: 'Expert in strength & conditioning with over 10 years of experience helping athletes reach peak performance.',
      qualifications: 'MSc Sports Science, CSCS',
      specialization: 'Strength & Conditioning, Performance Training',
      image: 'https://images.pexels.com/photos/4164754/pexels-photo-4164754.jpeg?auto=compress&cs=tinysrgb&w=600',
      profileLink: '#',
    },
    {
      name: 'Sarah Williams',
      role: 'Senior Coach',
      description: 'Specialized in rehabilitation and injury prevention, helping clients recover and prevent future injuries.',
      qualifications: 'BSc Physiotherapy, NASM-CPT',
      specialization: 'Rehabilitation, Injury Prevention',
      image: 'https://images.pexels.com/photos/4164754/pexels-photo-4164754.jpeg?auto=compress&cs=tinysrgb&w=600',
      profileLink: '#',
    },
    {
      name: 'David Martinez',
      role: 'Performance Coach',
      description: 'Dedicated to athletic development and sports-specific training for competitive athletes.',
      qualifications: 'MSc Exercise Physiology, USAW',
      specialization: 'Sports Training, Athletic Development',
      image: 'https://images.pexels.com/photos/4164754/pexels-photo-4164754.jpeg?auto=compress&cs=tinysrgb&w=600',
      profileLink: '#',
    },
    {
      name: 'Lisa Anderson',
      role: 'Strength Coach',
      description: 'Focuses on building functional strength and power through evidence-based training methods.',
      qualifications: 'BSc Kinesiology, NSCA-CSCS',
      specialization: 'Strength Programmes, Power Development',
      image: 'https://images.pexels.com/photos/4164754/pexels-photo-4164754.jpeg?auto=compress&cs=tinysrgb&w=600',
      profileLink: '#',
    },
  ];

  // FAQ data
  const faqData = [
    {
      question: 'What experience level do I need to train at STR?',
      answer: 'STR welcomes clients of all experience levels, from complete beginners to elite athletes. Our coaches tailor programs to your current fitness level and goals, ensuring safe and effective progression.',
    },
    {
      question: 'How do I know if STR is right for me?',
      answer: 'STR is ideal if you\'re looking for evidence-based coaching, personalized attention, and long-term physical development. We focus on building strength, improving performance, and supporting rehabilitation needs.',
    },
    {
      question: 'What should I expect in my first session?',
      answer: 'Your first session includes a comprehensive assessment of your movement patterns, strength levels, and goals. This allows us to design a program specifically tailored to your needs and objectives.',
    },
    {
      question: 'How often should I train?',
      answer: 'Training frequency depends on your goals, experience level, and schedule. Our coaches will recommend an optimal training schedule during your initial consultation, typically ranging from 2-5 sessions per week.',
    },
    {
      question: 'Do you offer group training sessions?',
      answer: 'Yes, we offer both individual and small group training options. Group sessions provide a supportive environment while maintaining personalized coaching attention.',
    },
    {
      question: 'What results can I expect?',
      answer: 'Results vary based on individual goals, consistency, and commitment. Our evidence-based approach focuses on sustainable, long-term improvements in strength, performance, and overall physical health.',
    },
  ];

  return (
    <div className="str-theme min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <img 
                src="/theme/str/assets/logos/str-logo-1-1024x604.png" 
                alt="STR" 
                className="h-8 w-auto"
                onError={(e) => {
                  // Fallback to text if image not found
                  const target = e.target as HTMLImageElement;
                  if (target.dataset.fallbackAdded) return; // Prevent duplicate fallback
                  target.style.display = 'none';
                  target.dataset.fallbackAdded = 'true';
                  const fallback = document.createElement('div');
                  fallback.className = 'text-2xl font-bold text-primary';
                  fallback.textContent = 'STR';
                  target.parentElement?.appendChild(fallback);
                }}
              />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-foreground hover:text-primary transition-colors"
                >
                  {item.name}
                </a>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden text-foreground"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-border bg-background">
            <div className="container mx-auto px-4 py-4 space-y-3">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block text-foreground hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img
            src="/theme/str/assets/hero/hero-background.jpg"
            alt="Training"
            className="w-full h-full object-cover grayscale"
            onError={(e) => {
              // Fallback to placeholder if image not found
              const target = e.target as HTMLImageElement;
              target.src = 'https://images.pexels.com/photos/4164754/pexels-photo-4164754.jpeg?auto=compress&cs=tinysrgb&w=1920';
            }}
          />
          <div className="absolute inset-0 bg-background/70"></div>
        </div>
        
        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold uppercase text-foreground mb-6 leading-tight">
              TRAINING BETTER, LIVING BETTER
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              Strength Training • Rehabilitation • Performance • Conditioning
            </p>
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6 font-semibold"
            >
              EXPLORE OUR PROGRAMMES
            </Button>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="relative py-20 px-4 sm:px-6 lg:px-8 min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/4164754/pexels-photo-4164754.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Training"
            className="w-full h-full object-cover grayscale"
          />
          <div className="absolute inset-0 bg-background/80"></div>
        </div>

        <div className="container mx-auto relative z-10 w-full px-4 sm:px-6 lg:px-8">
          <div className="w-full">
            {/* Main Heading */}
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold uppercase mb-6 text-foreground leading-tight">
              MORE THAN JUST A GYM
            </h2>

            {/* Subheading */}
            <p className="text-lg md:text-xl text-foreground mb-16 max-w-3xl leading-relaxed">
              Where Smart Training Meets Proven Methods To Help You Achieve Real, Lasting Results.
            </p>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Expert Coaching Card */}
              <div className="bg-white rounded-3xl p-6 shadow-2xl h-full flex flex-col">
                <div className="w-12 h-12 rounded-full bg-[#E00000] flex items-center justify-center mb-4 flex-shrink-0">
                  <Wrench className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold uppercase text-black mb-3">EXPERT COACHING</h3>
                <p className="text-black/80 text-sm leading-relaxed flex-grow">
                  Train With Experienced Coaches Who Guide Every Workout With Proper Form And Purpose.
                </p>
              </div>

              {/* Structured Programs Card */}
              <div className="bg-white rounded-3xl p-6 shadow-2xl h-full flex flex-col">
                <div className="w-12 h-12 rounded-full bg-[#E00000] flex items-center justify-center mb-4 flex-shrink-0">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-black mb-3">Structured Programs</h3>
                <p className="text-black/80 text-sm leading-relaxed flex-grow">
                  Follow Proven Training Programs Designed To Deliver Real, Measurable Results.
                </p>
              </div>

              {/* Supportive Community Card */}
              <div className="bg-white rounded-3xl p-6 shadow-2xl h-full flex flex-col">
                <div className="w-12 h-12 rounded-full bg-[#E00000] flex items-center justify-center mb-4 flex-shrink-0">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold uppercase text-black mb-3">SUPPORTIVE COMMUNITY</h3>
                <p className="text-black/80 text-sm leading-relaxed flex-grow">
                  Train In A Motivating Environment That Helps You Stay Consistent And Reach Your Goals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Our Programmes Section */}
      <section id="programmes" className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Left Column - Big Title */}
            <div className="flex flex-col justify-center">
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold uppercase text-foreground leading-tight mb-6">
                OUR PROGRAMMES
              </h2>
              <p className="text-lg md:text-xl text-foreground/80 leading-relaxed max-w-xl">
                Discover our comprehensive training programmes designed to help you achieve your fitness goals, whether you're building strength, improving performance, or recovering from injury.
              </p>
            </div>

            {/* Right Column - Accordion */}
            <div className="space-y-0">
              {programmes.map((programme, index) => {
                const isActive = activeProgramme === index;
                return (
                  <div key={index} className="relative mb-1">
                    {/* Active State - White Background with Lime Green Accent */}
                    {isActive ? (
                      <div className="relative bg-white rounded-2xl p-6 shadow-lg overflow-hidden">
                        {/* Lime Green Accent on Top and Left - Irregular/Tilted Shape */}
                        <div className="absolute top-0 left-0 w-3 h-full bg-[#E00000]"></div>
                        <div 
                          className="absolute top-0 left-0 w-full h-2 bg-[#E00000]"
                          style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0 100%)' }}
                        ></div>
                        
                        <div className="flex items-center justify-between pl-6">
                          <h3 className="text-2xl md:text-3xl font-bold text-black uppercase">
                            {programme.title}
                          </h3>
                          <button
                            onClick={() => setActiveProgramme(activeProgramme === index ? -1 : index)}
                            className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0 hover:bg-gray-700 transition-colors"
                            aria-label={`Toggle ${programme.title}`}
                          >
                            <ChevronUp className="h-4 w-4 text-white" />
                          </button>
                        </div>
                        
                        {/* Expanded Content */}
                        <div className="mt-6 pl-6">
                          <p className="text-black/70 text-base leading-relaxed mb-4">
                            {programme.description}
                          </p>
                          <p className="text-black/60 text-sm leading-relaxed mb-6">
                            {programme.content}
                          </p>
                          {/* CTA Button */}
                          <Button
                            className="bg-[#E00000] text-white hover:bg-[#E00000]/90 font-bold uppercase px-6 py-3 rounded-lg text-sm transition-all duration-300 hover:scale-105"
                            onClick={() => window.location.href = '#contact'}
                          >
                            GET STARTED
                          </Button>
                        </div>
                      </div>
                    ) : (
                      /* Inactive State - Dark Gray Background */
                      <div className="relative">
                        <div className="flex items-center justify-between py-5 px-6 bg-gray-800/60 rounded-lg hover:bg-gray-800/70 transition-colors cursor-pointer" onClick={() => setActiveProgramme(index)}>
                          <h3 className="text-lg md:text-xl font-medium text-gray-400 uppercase">
                            {programme.title}
                          </h3>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveProgramme(index);
                            }}
                            className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0 hover:bg-gray-700 transition-colors"
                            aria-label={`Open ${programme.title}`}
                          >
                            <ChevronUp className="h-4 w-4 text-white rotate-180" />
                          </button>
                        </div>
                        {/* Separator Line */}
                        {index < programmes.length - 1 && (
                          <div className="h-px bg-gray-700/50 mt-1"></div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="container mx-auto">
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold uppercase mb-6 text-center text-foreground leading-tight">GALLERY</h2>
          
          {/* Introduction Text */}
          <p className="text-sm text-muted-foreground text-center mb-8">
            Training sessions, facility photos and videos
          </p>

          {/* Filter Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
            {galleryFilters.map((filter) => (
              <button
                key={filter}
                onClick={() => {
                  setActiveGalleryFilter(filter);
                  setActiveGalleryIndex(0);
                }}
                className={`px-6 py-2 rounded-full font-medium uppercase text-sm transition-all ${
                  activeGalleryFilter === filter
                    ? 'bg-[#E00000] text-white'
                    : 'bg-transparent border border-[#E00000] text-[#E00000] hover:bg-[#E00000]/10'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Image Slider */}
          <div className="relative mb-8">
            <Carousel
              opts={{
                align: 'center',
                loop: true,
                slidesToScroll: 1,
              }}
              className="w-full"
              setApi={(api) => {
                if (api) {
                  galleryCarouselApi.current = api;
                  setActiveGalleryIndex(api.selectedScrollSnap());
                  api.on('select', () => {
                    setActiveGalleryIndex(api.selectedScrollSnap());
                  });
                }
              }}
            >
              <CarouselContent className="-ml-4 md:-ml-8">
                {filteredGalleryImages.map((image, index) => (
                  <CarouselItem key={index} className="pl-4 md:pl-8 basis-full md:basis-2/3 lg:basis-1/2">
                    <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                      <div className="aspect-[4/3] relative">
                        <img
                          src={image.src}
                          alt={image.alt}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        {/* Optional video play icon overlay */}
                        {index % 3 === 1 && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                              <div className="w-0 h-0 border-l-[12px] border-l-black border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ml-1"></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => galleryCarouselApi.current?.scrollPrev()}
              className="w-12 h-12 rounded-full border-2 border-[#A0A0A0] bg-background flex items-center justify-center hover:border-[#E00000] hover:bg-[#E00000]/10 transition-colors"
              aria-label="Previous image"
            >
              <ArrowRight className="h-5 w-5 text-[#A0A0A0] hover:text-[#E00000] transition-colors rotate-180" />
            </button>
            <button
              onClick={() => galleryCarouselApi.current?.scrollNext()}
              className="w-12 h-12 rounded-full border-2 border-[#A0A0A0] bg-background flex items-center justify-center hover:border-[#E00000] hover:bg-[#E00000]/10 transition-colors"
              aria-label="Next image"
            >
              <ArrowRight className="h-5 w-5 text-[#A0A0A0] hover:text-[#E00000] transition-colors" />
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="container mx-auto">
          {/* Section Header */}
          <div className="mb-12">
            {/* Main Heading */}
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold uppercase text-foreground leading-tight">
              RESULT YOU CAN FEEL & SEE
            </h2>
          </div>

          {/* Testimonial Cards Grid - 2 Rows */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-gray-800/60 rounded-3xl p-6 h-full transition-all duration-300 border border-transparent"
              >
                {/* Star Icon at Top Center */}
                <div className="flex justify-center mb-4">
                  <Star className="h-5 w-5 text-[#E00000]" fill="#E00000" />
                </div>

                {/* Testimonial Text */}
                <p className="text-foreground mb-6 leading-relaxed text-base">
                  {testimonial.quote}
                </p>

                {/* Author Information */}
                <div className="mt-auto">
                  <p className="font-bold text-foreground text-lg mb-1">{testimonial.name}</p>
                  <p className="text-gray-400 text-sm">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div className="flex justify-center">
            <Button
              size="lg"
              className="bg-[#E00000] text-white hover:bg-[#E00000]/90 text-lg px-10 py-6 font-bold uppercase rounded-lg transition-all duration-300 hover:scale-105"
              onClick={() => window.location.href = '#programmes'}
            >
              START YOUR JOURNEY
            </Button>
          </div>
        </div>
      </section>

      {/* Our Team Section */}
      <section id="team" className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="container mx-auto">
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold uppercase mb-12 text-center text-foreground leading-tight">OUR TEAM</h2>
          <div className="relative">
            <Carousel
              opts={{
                align: 'start',
                loop: true,
                slidesToScroll: 1,
              }}
              className="w-full"
              setApi={(api) => {
                if (api) {
                  teamCarouselApi.current = api;
                }
              }}
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {teamMembers.map((member, index) => (
                  <CarouselItem key={index} className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/4">
                    <div className="relative rounded-2xl overflow-hidden transition-all duration-300 border border-gray-700/50">
                      {/* Image Area - Top 60% */}
                      <div className="relative h-64 md:h-80 overflow-hidden">
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>

                      {/* Dark Panel - Bottom 40% */}
                      <div className="bg-background p-6">
                        <h3 className="text-2xl font-bold uppercase text-foreground mb-2">{member.name.toUpperCase()}</h3>
                        <p className="text-[#A0A0A0] text-sm font-medium mb-3">{member.role}</p>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {member.description}
                        </p>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
            
            {/* Navigation Controls */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => teamCarouselApi.current?.scrollPrev()}
              className="w-12 h-12 rounded-full border-2 border-[#A0A0A0] bg-background flex items-center justify-center hover:border-[#E00000] hover:bg-[#E00000]/10 transition-colors"
              aria-label="Previous team member"
            >
              <ArrowRight className="h-5 w-5 text-[#A0A0A0] hover:text-[#E00000] transition-colors rotate-180" />
            </button>
            <button
              onClick={() => teamCarouselApi.current?.scrollNext()}
              className="w-12 h-12 rounded-full border-2 border-[#A0A0A0] bg-background flex items-center justify-center hover:border-[#E00000] hover:bg-[#E00000]/10 transition-colors"
              aria-label="Next team member"
            >
              <ArrowRight className="h-5 w-5 text-[#A0A0A0] hover:text-[#E00000] transition-colors" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold uppercase mb-12 text-center text-foreground leading-tight">FREQUENTLY ASKED QUESTIONS</h2>
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqData.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`} 
                className="border-0 rounded-xl px-6 py-4 bg-[#2C2C2C] data-[state=open]:bg-[#2C2C2C]"
              >
                <AccordionTrigger className="text-left hover:no-underline py-0 [&>svg]:hidden">
                  <span className="text-foreground text-lg font-medium pr-4 flex-1">{faq.question}</span>
                  <div className="ml-auto shrink-0 w-8 h-8 rounded-full bg-[#38304C] border border-[#8A2BE2]/50 flex items-center justify-center relative">
                    <Plus className="plus-icon h-4 w-4 text-white" />
                    <Minus className="minus-icon h-4 w-4 text-white" />
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-[#B0B0B0] text-base pt-4 pb-2 px-0">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          
          {/* CTA Button */}
          <div className="flex justify-center mt-12">
            <Button
              size="lg"
              className="bg-[#E00000] text-white hover:bg-[#E00000]/90 text-lg px-10 py-6 font-bold uppercase rounded-lg transition-all duration-300 hover:scale-105"
              onClick={() => window.location.href = '#contact'}
            >
              GET STARTED TODAY
            </Button>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section id="contact" className="py-24 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
        {/* Background Pattern/Overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        <div className="container mx-auto max-w-4xl relative z-10">
          <div className="text-center">
            {/* Marketing Hook */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold uppercase mb-6 text-foreground leading-tight">
              READY TO TRANSFORM YOUR TRAINING?
            </h2>
            <p className="text-lg md:text-xl text-foreground/80 mb-8 max-w-2xl mx-auto leading-relaxed">
              Join STR today and experience evidence-based coaching that delivers real, lasting results. Your journey to better strength, performance, and rehabilitation starts here.
            </p>
            
            {/* CTA Button */}
            <Button
              size="lg"
              className="bg-[#E00000] text-white hover:bg-[#E00000]/90 text-lg px-10 py-6 font-bold uppercase rounded-lg transition-all duration-300 hover:scale-105"
              onClick={() => window.location.href = '#programmes'}
            >
              EXPLORE OUR PROGRAMMES
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 sm:px-6 lg:px-8 bg-background border-t border-border/20">
        <div className="container mx-auto max-w-7xl">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 mb-12">
            {/* Left Column - Logo & Social */}
            <div className="space-y-6">
              <img 
                src="/theme/str/assets/logos/str-logo-1-1024x604.png" 
                alt="STR" 
                className="h-12 w-auto"
                onError={(e) => {
                  // Fallback to text if image not found
                  const target = e.target as HTMLImageElement;
                  if (target.dataset.fallbackAdded) return; // Prevent duplicate fallback
                  target.style.display = 'none';
                  target.dataset.fallbackAdded = 'true';
                  const fallback = document.createElement('div');
                  fallback.className = 'text-4xl font-bold text-foreground uppercase tracking-tight';
                  fallback.textContent = 'STR';
                  target.parentElement?.appendChild(fallback);
                }}
              />
              <div className="flex items-center gap-4">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border-2 border-foreground/30 flex items-center justify-center hover:border-[#E00000] hover:bg-[#E00000]/10 transition-all duration-300 group"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5 text-foreground group-hover:text-[#E00000] transition-colors" />
                </a>
                <a
                  href="https://wa.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border-2 border-foreground/30 flex items-center justify-center hover:border-[#E00000] hover:bg-[#E00000]/10 transition-all duration-300 group"
                  aria-label="WhatsApp"
                >
                  <svg
                    className="h-5 w-5 text-foreground group-hover:text-[#E00000] transition-colors"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Middle Column - Menu */}
            <div>
              <h3 className="text-lg font-bold uppercase text-foreground mb-4 relative inline-block">
                MENU
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#E00000]"></span>
              </h3>
              <nav className="mt-6 space-y-3">
                {footerMenuItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="block text-foreground/80 hover:text-[#E00000] transition-colors text-sm font-medium group"
                  >
                    <span className="group-hover:translate-x-1 inline-block transition-transform duration-200">
                      {item.name}
                    </span>
                  </a>
                ))}
              </nav>
            </div>

            {/* Right Column - Customer Support */}
            <div>
              <h3 className="text-lg font-bold uppercase text-foreground mb-4">CUSTOMER SUPPORT</h3>
              <p className="text-foreground/80 text-sm mt-6">
                Mon-Friday – 9am – 6pm
              </p>
            </div>
          </div>

          {/* Bottom Section - Legal & Copyright */}
          <div className="pt-8 border-t border-border/20 space-y-4">
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-foreground/60">
              <a
                href="/privacy-policy"
                className="hover:text-[#E00000] transition-colors"
              >
                Privacy Policy
              </a>
              <span className="text-foreground/40">•</span>
              <a
                href="/terms-conditions"
                className="hover:text-[#E00000] transition-colors"
              >
                Terms & Conditions
              </a>
            </div>
            <div className="text-center text-sm text-foreground/60">
              @ 2025. <span className="font-bold text-foreground">STR</span>. © All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default STRTheme;
