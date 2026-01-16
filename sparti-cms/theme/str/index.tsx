import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import './theme.css';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, CarouselIndicators } from '@/components/ui/carousel';
import { Star, Menu, X, ArrowRight, Wrench, Award, Users, ChevronUp, Plus, Minus, Instagram } from 'lucide-react';
import BookingPage from './booking';
import PackagesPage from './packages';
import ClassesPage from './classes';
import ThankYouPage from './thank-you';
import ContactModal from './ContactModal';
import HeroSection from './components/HeroSection';

interface TenantLandingProps {
  tenantName?: string;
  tenantSlug?: string;
  tenantId?: string;
  pageSlug?: string;
}

const STRTheme: React.FC<TenantLandingProps> = ({
  tenantName = 'STR',
  tenantSlug = 'str',
  tenantId,
  pageSlug
}) => {
  const location = useLocation();
  const params = useParams<{ pageSlug?: string }>();
  
  // Determine which page to render
  const currentPage = useMemo(() => {
    // Check pageSlug prop first (passed from TenantLandingPage)
    if (pageSlug) {
      return pageSlug;
    }
    
    // Check if we have a pageSlug param (from /theme/:tenantSlug/:pageSlug route)
    if (params.pageSlug) {
      return params.pageSlug;
    }
    
    // Otherwise, extract from pathname
    const pathParts = location.pathname.split('/').filter(Boolean);
    
    // Look for 'theme' in path to determine if we're in theme mode
    const themeIndex = pathParts.indexOf('theme');
    const tenantIndex = pathParts.indexOf(tenantSlug);
    
    // If we're in theme mode (/theme/str/...)
    if (themeIndex >= 0 && tenantIndex === themeIndex + 1) {
      // The page slug should be after the tenant slug
      if (tenantIndex + 1 < pathParts.length) {
        // Handle nested routes like booking/classes
        const remainingParts = pathParts.slice(tenantIndex + 1);
        return remainingParts.join('/');
      }
      return ''; // Homepage if nothing after tenant slug
    }
    
    // Handle standalone deployment (pathname doesn't include /theme/str/)
    // Direct access like /booking or /packages
    if (tenantIndex < 0) {
      // Check if it's a known page
      const firstPart = pathParts[0];
      if (firstPart === 'booking' || firstPart === 'packages') {
        return firstPart;
      }
      return firstPart || '';
    }
    
    // Fallback: if tenant slug is found, check what comes after it
    if (tenantIndex >= 0 && tenantIndex < pathParts.length - 1) {
      // Handle nested routes
      const remainingParts = pathParts.slice(tenantIndex + 1);
      return remainingParts.join('/');
    }
    
    return ''; // Homepage
  }, [location.pathname, tenantSlug, params.pageSlug, pageSlug]);

  // Render the appropriate page component based on current route
  if (currentPage === 'booking') {
    return <BookingPage tenantName={tenantName} tenantSlug={tenantSlug} tenantId={tenantId} pageSlug={currentPage} />;
  }
  
  if (currentPage === 'packages') {
    return <PackagesPage tenantName={tenantName} tenantSlug={tenantSlug} tenantId={tenantId} pageSlug={currentPage} />;
  }
  
  if (currentPage === 'booking/classes') {
    return <ClassesPage tenantName={tenantName} tenantSlug={tenantSlug} tenantId={tenantId} pageSlug={currentPage} />;
  }
  
  if (currentPage === 'thank-you') {
    return <ThankYouPage tenantName={tenantName} tenantSlug={tenantSlug} tenantId={tenantId} pageSlug={currentPage} />;
  }
  
  // Default: render homepage
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeProgramme, setActiveProgramme] = useState(0);
  const [activeGalleryFilter, setActiveGalleryFilter] = useState('All');
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // Check for #contact hash in URL and open modal
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#contact') {
        setIsContactModalOpen(true);
        // Remove hash from URL without scrolling
        window.history.replaceState(null, '', window.location.pathname);
      }
    };

    // Check on mount
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);
  const galleryCarouselApi = useRef<any>(null);

  // Navigation items
  const navItems = [
    { name: 'About Us', href: '#about' },
    { name: 'Programmes', href: '#programmes' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'FAQs', href: '#faq' },
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
      description: 'Designed specifically for your own personal goals, work with a professional coach with fully guided and supervised sessions to ensure maximal success in achieving your goals.',
      content: '',
    },
    {
      title: 'SPORTS MASSAGE',
      description: 'Sports massage focuses on preventing and treating sports-related injuries by improving muscle flexibility and reducing tension.',
      content: '',
    },
    {
      title: 'STR MEMBERSHIP PROGRAMME',
      description: 'Unlimited access to group classes and open gym access, here at STR Fitness club',
      content: '',
    },
    {
      title: 'PHYSIOTHERAPY',
      description: 'Our fully equipped gym with state-of-the-art rehabilitation equipment ensures that your recovery is optimised all the way, from symptom relief, restoration of function, all the way to performance.',
      content: '',
    },
    {
      title: 'GROUP CLASSES',
      description: 'We offer classes of different intensity, ranging from beginners-friendly to more advanced levels, to help you build the strength and speed needed for your next race. Whether you are looking to start your HYROX journey, maintain your fitness during the off-season or train for your next podium win, we have just the right class for you.',
      content: '',
    },
    {
      title: 'OPEN GYM',
      description: 'Open Gym Access. Capped at 5 pax per hourly slot, train with our official HYROX Center Equipment and state of the art equipment. Unwind, relax and connect afterwards at our outdoor terrace! Open Gym Hours: Monday - Friday 10am - 5pm, Saturday - Sunday 12pm - 5pm',
      content: '',
    },
    {
      title: 'YOUTH STRENGTH & CONDITIONING',
      description: 'Engaging the youth and propelling them for long term athletic development while developing lifelong habits and values. Our coaches are specially equipped with the right skillset to motivate and teach the youth population.',
      content: '',
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
      name: 'JJ',
      role: 'Head Coach | Founder | Physiotherapist',
      description: 'JJ, a former National Youth Wushu Athlete, earned a Physiotherapy degree from Trinity College Dublin and specialized in sports physiotherapy at Sengkang General Hospital. He competes in endurance events like Hyrox — ranking top 6 Singaporean in 2024 — and volunteers with the Special Olympics and Wushu community.',
      qualifications: '',
      specialization: '',
      image: 'https://images.pexels.com/photos/4164754/pexels-photo-4164754.jpeg?auto=compress&cs=tinysrgb&w=600',
      profileLink: '#',
    },
    {
      name: 'Brandon Khoo',
      role: 'PT Coach',
      description: 'Brandon Khoo is an experienced strength and conditioning coach specializing in kettlebell and barbell training. He has designed and led both individualized and group training programs, focusing on strength, endurance, mobility, and injury prevention. He is passionate about helping clients build functional strength through structured progression.',
      qualifications: '',
      specialization: '',
      image: 'https://images.pexels.com/photos/4164754/pexels-photo-4164754.jpeg?auto=compress&cs=tinysrgb&w=600',
      profileLink: '#',
    },
    {
      name: 'Jing Yong',
      role: 'Group Class Coach',
      description: 'Jing Yong earned an Accountancy degree from Nanyang Technological University and currently holds a managerial position at a local investment firm. A former competitive athlete in triathlons, track and field and cross-country running, he now focuses on endurance events such as Hyrox, marathons, and team-based functional fitness races.',
      qualifications: '',
      specialization: '',
      image: 'https://images.pexels.com/photos/4164754/pexels-photo-4164754.jpeg?auto=compress&cs=tinysrgb&w=600',
      profileLink: '#',
    },
    {
      name: 'Jessica',
      role: 'Group Class Coach | PT Coach',
      description: 'Jessica is an experienced and versatile personal trainer with expertise in both strength and hybrid training. She has helped numerous clients achieve both fitness and aesthetic goals, while ensuring that they train safely and efficiently. She competes in half marathons and HYROX, ranking as the top Singaporean woman in both Open (2nd overall, first in AG) and Pro (3rd overall, first in AG) categories in HYROX 2024 races.',
      qualifications: '',
      specialization: '',
      image: 'https://images.pexels.com/photos/4164754/pexels-photo-4164754.jpeg?auto=compress&cs=tinysrgb&w=600',
      profileLink: '#',
    },
    {
      name: 'Jacqueline',
      role: 'Group Class Coach',
      description: 'Jacqueline is a passionate fitness trainer dedicated to helping others feel strong, confident, and empowered through movement. While she works as an HR professional by day, her true energy comes from the world of fitness—especially spin and pilates. She believes fitness should be fun, approachable, and inclusive, regardless of experience level. Her mission is to create a supportive space where members are encouraged to grow, challenge themselves, and celebrate progress.',
      qualifications: '',
      specialization: '',
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
      <header className="relative z-50 bg-background/95 backdrop-blur-sm border-b border-border">
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
              <Button
                className="bg-[#E00000] text-white hover:bg-[#E00000]/90 font-bold uppercase px-6 py-2 rounded-lg text-sm transition-all duration-300"
                onClick={() => window.location.href = '/theme/str/booking'}
              >
                Get Started
              </Button>
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
              <Button
                className="w-full bg-[#E00000] text-white hover:bg-[#E00000]/90 font-bold uppercase px-6 py-3 rounded-lg text-sm transition-all duration-300 mt-4"
                onClick={() => {
                  setIsMenuOpen(false);
                  window.location.href = '/theme/str/booking';
                }}
              >
                Get Started
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <HeroSection 
        tenantSlug={tenantSlug}
        items={undefined} // Can be populated from database schema in future
      />

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
              About Us
            </h2>

            {/* Content */}
            <p className="text-lg md:text-xl text-foreground mb-16 max-w-3xl leading-relaxed">
              Our space is dedicated to cultivating an environment to guide individuals on a transformative journey that balances the physical and mental aspects of health. By integrating personalized training and evidence-based rehabilitation, we empower anyone to unlock their full potential. Through a focus on mental resilience, self-belief, and holistic well-being, we cultivate a space where individuals overcome challenges, enhance performance, and achieve a sustainable, confident lifestyle.
            </p>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Expert Coaching Card */}
              <div className="bg-white rounded-3xl p-6 shadow-2xl h-full flex flex-col">
                <div className="w-12 h-12 rounded-full bg-[#E48D2A] flex items-center justify-center mb-4 flex-shrink-0">
                  <Wrench className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold uppercase text-black mb-3">EXPERT COACHING</h3>
                <p className="text-black/80 text-sm leading-relaxed flex-grow">
                  Train With Experienced Coaches Who Guide Every Workout With Proper Form And Purpose.
                </p>
              </div>

              {/* Structured Programs Card */}
              <div className="bg-white rounded-3xl p-6 shadow-2xl h-full flex flex-col">
                <div className="w-12 h-12 rounded-full bg-[#E48D2A] flex items-center justify-center mb-4 flex-shrink-0">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-black mb-3">Structured Programs</h3>
                <p className="text-black/80 text-sm leading-relaxed flex-grow">
                  Follow Proven Training Programs Designed To Deliver Real, Measurable Results.
                </p>
              </div>

              {/* Supportive Community Card */}
              <div className="bg-white rounded-3xl p-6 shadow-2xl h-full flex flex-col">
                <div className="w-12 h-12 rounded-full bg-[#E48D2A] flex items-center justify-center mb-4 flex-shrink-0">
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
                        {/* Orange Accent on Top and Left - Irregular/Tilted Shape */}
                        <div className="absolute top-0 left-0 w-3 h-full bg-[#E48D2A]"></div>
                        <div 
                          className="absolute top-0 left-0 w-full h-2 bg-[#E48D2A]"
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
                          <p className="text-black/70 text-base leading-relaxed mb-6">
                            {programme.description}
                            {programme.content && (
                              <>
                                <br /><br />
                                <span className="text-black/60 text-sm">{programme.content}</span>
                              </>
                            )}
                          </p>
                          {/* CTA Button */}
                          <Button
                            className="bg-[#E00000] text-white hover:bg-[#E00000]/90 font-bold uppercase px-6 py-3 rounded-lg text-sm transition-all duration-300 hover:scale-105"
                            onClick={() => window.location.href = '/theme/str/booking'}
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
                    ? 'bg-[#E48D2A] text-white'
                    : 'bg-transparent border border-white text-white hover:bg-white/10'
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
              className="w-12 h-12 rounded-full border-2 border-[#E48D2A] bg-background flex items-center justify-center hover:bg-[#E48D2A]/10 transition-colors"
              aria-label="Previous image"
            >
              <ArrowRight className="h-5 w-5 text-[#E48D2A] transition-colors rotate-180" />
            </button>
            <button
              onClick={() => galleryCarouselApi.current?.scrollNext()}
              className="w-12 h-12 rounded-full border-2 border-[#E48D2A] bg-background flex items-center justify-center hover:bg-[#E48D2A]/10 transition-colors"
              aria-label="Next image"
            >
              <ArrowRight className="h-5 w-5 text-[#E48D2A] transition-colors" />
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
              onClick={() => window.location.href = '/theme/str/booking'}
            >
              START YOUR JOURNEY
            </Button>
          </div>
        </div>
      </section>

      {/* Our Team Section */}
      <section id="team" className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold uppercase mb-12 text-center text-foreground leading-tight">OUR TEAM</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member, index) => (
              <div key={index} className="relative rounded-2xl overflow-hidden transition-all duration-300 border border-gray-700/50 flex flex-col h-full">
                {/* Image Area - Fixed Height */}
                <div className="relative h-64 md:h-72 overflow-hidden flex-shrink-0">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                {/* Dark Panel - Bottom Section with Flex Grow */}
                <div className="bg-background p-6 flex flex-col flex-grow">
                  <h3 className="text-2xl font-bold uppercase text-foreground mb-2">{member.name.toUpperCase()}</h3>
                  <p className="text-[#A0A0A0] text-sm font-medium mb-3">{member.role}</p>
                  <p className="text-muted-foreground text-sm leading-relaxed flex-grow">
                    {member.description}
                  </p>
                </div>
              </div>
            ))}
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
                  <div className="ml-auto shrink-0 w-8 h-8 rounded-full bg-[#E48D2A] border border-[#E48D2A]/50 flex items-center justify-center relative">
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
              onClick={() => window.location.href = '/theme/str/booking'}
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
              onClick={() => window.location.href = '/theme/str#programmes'}
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
                  className="w-10 h-10 rounded-full border-2 border-foreground/30 flex items-center justify-center hover:border-[#E48D2A] hover:bg-[#E48D2A]/10 transition-all duration-300 group"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5 text-foreground group-hover:text-[#E48D2A] transition-colors" />
                </a>
                <a
                  href="https://wa.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border-2 border-foreground/30 flex items-center justify-center hover:border-[#E48D2A] hover:bg-[#E48D2A]/10 transition-all duration-300 group"
                  aria-label="WhatsApp"
                >
                  <svg
                    className="h-5 w-5 text-foreground group-hover:text-[#E48D2A] transition-colors"
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

      {/* Contact Modal */}
      <ContactModal 
        isOpen={isContactModalOpen} 
        onClose={() => setIsContactModalOpen(false)} 
      />
    </div>
  );
};

export default STRTheme;
