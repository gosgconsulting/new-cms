import React, { useState, useRef, useMemo, useEffect } from 'react';
import './theme.css';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, CarouselIndicators } from '@/components/ui/carousel';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Star, Menu, X, ArrowRight, Wrench, Award, Users, ChevronUp, Plus, Minus, Instagram } from 'lucide-react';
import ContactModal from './ContactModal';
import HeroSection from './components/HeroSection';
import { STR_ASSETS, getPersonalTrainingGalleryImages } from './config/assets';
import { fetchSTRReviews, type STRTestimonial, type STRPlaceInfo, formatReviewDate, getInitials } from './services/googleReviews';
import { useThemeBranding } from '../../hooks/useThemeSettings';
import { getSiteName, getSiteDescription, getLogoSrc, getFaviconSrc, applyFavicon } from './utils/settings';
import { SEOHead } from './components/SEOHead';
import { GTM } from './components/GTM';
import { GoogleAnalytics } from './components/GoogleAnalytics';
import { useCustomCode } from './hooks/useCustomCode';

interface TenantLandingProps {
  tenantName?: string;
  tenantSlug?: string;
  tenantId?: string;
  pageSlug?: string;
}

const PersonalTrainingPage: React.FC<TenantLandingProps> = ({
  tenantName = 'STR',
  tenantSlug = 'str',
  tenantId
}) => {
  // Load branding settings from database
  const { branding, loading: brandingLoading } = useThemeBranding('str', tenantId || undefined);
  
  // Load custom code settings (for GTM, GA, etc.)
  const { customCode } = useCustomCode(tenantId || undefined);
  
  // Get settings from database with fallback to defaults
  const siteName = getSiteName(branding, tenantName);
  const siteDescription = getSiteDescription(branding, 'Personal Training - STR Fitness Club - Evidence-based strength training and personalized coaching in Singapore.');
  const logoSrc = getLogoSrc(branding, STR_ASSETS.logos.header);
  const faviconSrc = getFaviconSrc(branding);
  
  // Apply favicon when branding loads
  useEffect(() => {
    if (faviconSrc && !brandingLoading) {
      const timeoutId1 = setTimeout(() => {
        applyFavicon(faviconSrc);
      }, 100);
      
      const timeoutId2 = setTimeout(() => {
        applyFavicon(faviconSrc);
      }, 500);
      
      return () => {
        clearTimeout(timeoutId1);
        clearTimeout(timeoutId2);
        if ((window as any).__faviconObserver) {
          (window as any).__faviconObserver.disconnect();
          delete (window as any).__faviconObserver;
        }
      };
    }
  }, [faviconSrc, brandingLoading]);
  
  // Page meta
  const pageMeta = useMemo(() => ({
    title: `Personal Training - ${siteName}`,
    description: siteDescription,
    keywords: 'STR Fitness, personal training, strength training, Singapore, fitness coaching',
    url: typeof window !== 'undefined' ? window.location.href : '',
  }), [siteName, siteDescription]);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeProgramme, setActiveProgramme] = useState(0);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<{ src: string; alt: string } | null>(null);
  const galleryCarouselApi = useRef<any>(null);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const [testimonials, setTestimonials] = useState<STRTestimonial[]>([]);
  const [placeInfo, setPlaceInfo] = useState<STRPlaceInfo | null>(null);
  const [testimonialsLoading, setTestimonialsLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

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

  // Fetch Google reviews on component mount
  useEffect(() => {
    const loadReviews = async () => {
      setTestimonialsLoading(true);
      try {
        const reviewsData = await fetchSTRReviews(15); // Fetch up to 15 reviews (5 slides × 3 reviews)
        setPlaceInfo(reviewsData.place);
        if (reviewsData.reviews.length > 0) {
          setTestimonials(reviewsData.reviews);
        } else {
          // Fallback to default testimonials if no reviews found - at least 9 reviews for 3 slides
          const now = Math.floor(Date.now() / 1000);
          const oneDayAgo = now - 86400;
          const threeDaysAgo = now - (86400 * 3);
          const oneWeekAgo = now - (86400 * 7);
          const twoWeeksAgo = now - (86400 * 14);
          const oneMonthAgo = now - (86400 * 30);
          
          setTestimonials([
            {
              name: 'Melissa K.',
              role: 'Student',
              quote: 'The Coaches Are Knowledgeable And Supportive, Making Every Workout Feel Focused, Effective, And Perfectly Aligned With My Fitness Goals.',
              rating: 5,
              time: now,
              relativeTime: 'Recently',
            },
            {
              name: 'Daniel R.',
              role: 'Entrepreneur',
              quote: 'Training Here Feels Structured And Motivating, With Clear Guidance That Helps Me Stay Consistent And See Real Progress Over Time.',
              rating: 5,
              time: oneDayAgo,
              relativeTime: '1 day ago',
            },
            {
              name: 'Jonathan P.',
              role: 'Athlete',
              quote: 'The Programs Are Well-Designed And Challenging, Pushing Me To Improve While Still Feeling Safe And Properly Coached.',
              rating: 5,
              time: threeDaysAgo,
              relativeTime: '3 days ago',
            },
            {
              name: 'Sarah L.',
              role: 'Professional',
              quote: 'I\'ve Tried Many Gyms, But STR Stands Out With Its Personalized Approach. Every Session Is Tailored To My Needs, And I\'ve Seen Incredible Improvements In Both Strength And Mobility.',
              rating: 5,
              time: oneWeekAgo,
              relativeTime: '1 week ago',
            },
            {
              name: 'Michael T.',
              role: 'Executive',
              quote: 'The One-On-One Attention Makes All The Difference. My Coach Understands My Busy Schedule And Creates Workouts That Fit Perfectly Into My Routine While Delivering Maximum Results.',
              rating: 5,
              time: oneWeekAgo,
              relativeTime: '1 week ago',
            },
            {
              name: 'Emma W.',
              role: 'Rehabilitation Client',
              quote: 'After My Injury, I Was Nervous About Training Again. The Team At STR Created A Safe, Progressive Program That Helped Me Recover Stronger Than Before. Highly Recommend!',
              rating: 5,
              time: twoWeeksAgo,
              relativeTime: '2 weeks ago',
            },
            {
              name: 'James H.',
              role: 'Competitive Athlete',
              quote: 'The Assessment Process Is Thorough And The Training Plans Are Data-Driven. I\'ve Hit Personal Bests I Never Thought Possible. This Is Professional Training At Its Finest.',
              rating: 5,
              time: twoWeeksAgo,
              relativeTime: '2 weeks ago',
            },
            {
              name: 'Rachel C.',
              role: 'Fitness Enthusiast',
              quote: 'What I Love Most Is The Focus On Long-Term Health, Not Just Quick Fixes. The Coaches Teach You Proper Form And Movement Patterns That Will Benefit You For Years To Come.',
              rating: 5,
              time: oneMonthAgo,
              relativeTime: '1 month ago',
            },
            {
              name: 'David M.',
              role: 'Business Owner',
              quote: 'The Investment In Personal Training At STR Has Been Worth Every Dollar. I Have More Energy, Better Posture, And Feel Confident In My Physical Capabilities. The Results Speak For Themselves.',
              rating: 5,
              time: oneMonthAgo,
              relativeTime: '1 month ago',
            },
          ]);
        }
      } catch (error) {
        console.error('[testing] Failed to load Google reviews:', error);
        // Keep default testimonials on error
      } finally {
        setTestimonialsLoading(false);
      }
    };

    loadReviews();
  }, []);
  const testimonialsCarouselApi = useRef<any>(null);
  const [activeTestimonialSlide, setActiveTestimonialSlide] = useState(0);

  // Navigation items
  const navItems = [
    { name: 'About Us', href: '#about' },
    { name: 'Programmes', href: '#programmes' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'Reviews', href: '#testimonials' },
    { name: 'Team', href: '#team' },
    { name: 'FAQ', href: '#faq' },
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

  // Programmes data for accordion - PT-focused services
  const programmes = [
    {
      title: 'INITIAL ASSESSMENT & GOAL SETTING',
      description: `Your journey begins with a comprehensive movement and strength assessment. We evaluate your current fitness level, identify movement patterns, assess any limitations, and discuss your specific goals. This foundation allows us to design a program that's perfectly tailored to your body and objectives—whether that's injury recovery, performance enhancement, or long‑term health.`,
      content: '',
    },
    {
      title: 'CUSTOMIZED TRAINING PROGRAMS',
      description: `Every workout is designed specifically for you. Based on your assessment, goals, and progress, your coach creates a structured program that evolves with you. No generic templates—just evidence‑based training that addresses your unique needs, schedule, and preferences. Each session builds on the last, ensuring continuous progress toward your goals.`,
      content: '',
    },
    {
      title: 'MOVEMENT CORRECTION & FORM COACHING',
      description: `Proper form isn't just about safety—it's about maximizing results. Your coach provides real‑time feedback on every exercise, correcting movement patterns and teaching you the fundamentals of effective training. This attention to detail ensures you're not just going through the motions, but building strength, mobility, and movement quality that will serve you for years to come.`,
      content: '',
    },
    {
      title: 'PROGRESS TRACKING & ADJUSTMENTS',
      description: `Your program isn't set in stone—it adapts as you improve. Your coach tracks your progress, measures your strength gains, and adjusts your training load, exercises, and intensity based on how your body responds. This data‑driven approach ensures you're always progressing, never plateauing, and always working at the right level for optimal results. To enhance precision and track progress objectively, we use advanced tools such as force plates and dynamometers. These technologies allow us to measure strength, power, balance, and movement efficiency, ensuring rehabilitation is tailored, measurable, and results-driven.`,
      content: '',
    },
    {
      title: 'INJURY PREVENTION & REHABILITATION SUPPORT',
      description: `Having a team that includes a physiotherapist means that your coach understands how to work with injuries, not around them. Whether you're recovering from an injury or preventing one, your training program incorporates rehabilitation principles, movement corrections, and progressive loading that supports your body's healing and resilience. Train safely while building back stronger.`,
      content: '',
    },
    {
      title: 'NUTRITION & LIFESTYLE GUIDANCE',
      description: `Training is only part of the equation. Your coach provides evidence‑based guidance on nutrition, recovery, sleep, and lifestyle factors that support your goals. While we're not dietitians, we help you understand how to fuel your body for performance, recovery, and long‑term health—creating sustainable habits that amplify your training results.`,
      content: '',
    },
  ];

  // Gallery images - loaded from centralized asset config
  const galleryImages = getPersonalTrainingGalleryImages();

  // Team members
  const teamMembers = [
    {
      name: 'JJ',
      role: 'Head Coach | Founder | Physiotherapist',
      description: 'JJ, a former National Youth Wushu Athlete, earned a Physiotherapy degree from Trinity College Dublin and specialized in sports physiotherapy at Sengkang General Hospital. He competes in endurance events like Hyrox — ranking top 6 Singaporean in 2024 — and volunteers with the Special Olympics and Wushu community.',
      qualifications: '',
      specialization: '',
      image: '/theme/str/assets/team/JJ-Head-Coach-scaled-e1743491665639.jpg',
      profileLink: '#',
    },
    {
      name: 'Brandon Khoo',
      role: 'PT Coach',
      description: 'Brandon Khoo is an experienced strength and conditioning coach specializing in kettlebell and barbell training. He has designed and led both individualized and group training programs, focusing on strength, endurance, mobility, and injury prevention. He is passionate about helping clients build functional strength through structured progression.',
      qualifications: '',
      specialization: '',
      image: '/theme/str/assets/team/Brandon-Khoo-Coach-scaled-e1743491558663.jpg',
      profileLink: '#',
    },
    {
      name: 'Jing Yong',
      role: 'Group Class Coach',
      description: 'Jing Yong earned an Accountancy degree from Nanyang Technological University and currently holds a managerial position at a local investment firm. A former competitive athlete in triathlons, track and field and cross-country running, he now focuses on endurance events such as Hyrox, marathons, and team-based functional fitness races.',
      qualifications: '',
      specialization: '',
      image: '/theme/str/assets/team/Jing-Yong-Coach-e1743491534837.jpg',
      profileLink: '#',
    },
    {
      name: 'Jessica',
      role: 'Group Class Coach | PT Coach',
      description: 'Jessica is an experienced and versatile personal trainer with expertise in both strength and hybrid training. She has helped numerous clients achieve both fitness and aesthetic goals, while ensuring that they train safely and efficiently. She competes in half marathons and HYROX, ranking as the top Singaporean woman in both Open (2nd overall, first in AG) and Pro (3rd overall, first in AG) categories in HYROX 2024 races.',
      qualifications: '',
      specialization: '',
      image: '/theme/str/assets/team/Jessica-e1744082680759.jpeg',
      profileLink: '#',
    },
    {
      name: 'Jacqueline',
      role: 'Group Class Coach',
      description: 'Jacqueline is a passionate fitness trainer dedicated to helping others feel strong, confident, and empowered through movement. While she works as an HR professional by day, her true energy comes from the world of fitness—especially spin and pilates. She believes fitness should be fun, approachable, and inclusive, regardless of experience level. Her mission is to create a supportive space where members are encouraged to grow, challenge themselves, and celebrate progress.',
      qualifications: '',
      specialization: '',
      image: '/theme/str/assets/team/Jacqueline-e1744082763597.jpeg',
      profileLink: '#',
    },
  ];

  // FAQ data - PT-focused
  const faqData = [
    {
      question: 'What makes STR Personal Training different?',
      answer: 'STR Personal Training is assessment‑led and physiotherapy‑informed. Every program starts with a comprehensive evaluation of your movement, strength, and goals. Unlike generic training programs, your coach designs every session specifically for you, provides real‑time form correction, and adjusts your program based on your progress. You get undivided attention, evidence‑based coaching, and a program that evolves with you—not a one‑size‑fits‑all template.',
    },
    {
      question: 'How does the initial assessment work?',
      answer: 'Your first session is a comprehensive assessment where your coach evaluates your movement patterns, strength levels, mobility, and any limitations or injuries. We discuss your goals, training history, and lifestyle factors. This foundation allows us to design a program that\'s perfectly tailored to your body and objectives. The assessment typically takes 60‑90 minutes and includes movement screening, strength testing, and goal setting.',
    },
    {
      question: 'What should I expect in my first 1‑on‑1 session?',
      answer: 'After your initial assessment, your first training session introduces you to your personalized program. Your coach guides you through each exercise with real‑time form correction, explains the purpose of each movement, and ensures you\'re comfortable with the training approach. You\'ll learn proper technique, understand how the program addresses your goals, and experience the level of attention and coaching you\'ll receive in every session.',
    },
    {
      question: 'How often should I do personal training?',
      answer: 'Training frequency depends on your goals, experience level, schedule, and budget. Most clients train 2‑3 times per week for optimal results, though some train more frequently for specific goals like competition prep or injury rehabilitation. During your initial consultation, your coach will recommend a training frequency that balances your goals with your lifestyle and ensures sustainable progress.',
    },
    {
      question: 'Can personal training help with injury recovery?',
      answer: 'Yes. Our physiotherapy‑informed approach means your coach understands how to work with injuries safely and effectively. Your program incorporates rehabilitation principles, movement corrections, and progressive loading that supports your body\'s healing process. We work closely with physiotherapists when needed and design training that addresses your injury while building strength and function. Many clients come to us specifically for post‑injury training.',
    },
    {
      question: 'What results can I expect from personal training?',
      answer: 'Results depend on your goals, consistency, and commitment, but most clients see measurable improvements within 4‑6 weeks. You can expect increased strength, improved movement quality, better body composition, enhanced performance, and reduced injury risk. Our evidence‑based approach focuses on sustainable, long‑term improvements rather than quick fixes. Your coach tracks your progress and adjusts your program to ensure you\'re always moving toward your goals.',
    },
  ];

  const isHomepage = true; // Use homepage layout with header in hero

  // Track scroll position for sticky header visibility
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 250);
    };

    // Check initial scroll position
    handleScroll();

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="str-theme min-h-screen bg-background text-foreground">
      {/* SEO metadata */}
      <SEOHead meta={pageMeta} favicon={faviconSrc || undefined} />
      
      {/* Google Tag Manager */}
      <GTM gtmId={customCode?.gtmId} />
      
      {/* Google Analytics */}
      <GoogleAnalytics gaId={customCode?.gaId} />
      
      {/* Header - appears after scrolling */}
      {isScrolled && (
        <header className="z-60 bg-background/95 backdrop-blur-sm border-b border-border transition-opacity duration-300">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-20 items-center justify-between">
              {/* Logo */}
              <div className="flex items-center space-x-2">
                <a href="/theme/str">
                  <img 
                    src={logoSrc} 
                    alt={siteName} 
                    className="h-12 w-auto"
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
                </a>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center space-x-8">
                {navItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="transition-colors text-foreground hover:text-primary"
                  >
                    {item.name}
                  </a>
                ))}
                <Button
                  className="bg-[#E00000] text-white hover:bg-[#E00000]/90 font-bold uppercase px-6 py-2 rounded-lg text-sm transition-all duration-300"
                  onClick={() => setIsContactModalOpen(true)}
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
            <div className="lg:hidden border-t border-border bg-background/95 backdrop-blur-sm">
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
                    setIsContactModalOpen(true);
                  }}
                >
                  Get Started
                </Button>
              </div>
            </div>
          )}
        </header>
      )}

      {/* Hero Section */}
      <HeroSection 
        tenantSlug={tenantSlug}
        items={undefined} // Can be populated from database schema in future
        showHeader={true}
        navItems={navItems}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        isHomepage={true}
        title="1‑On‑1 Personal Training For Performance And Longevity"
        subtitle="Personalized Coaching In A Physiotherapy‑Informed Environment"
        description="Assessment‑led, structured, and built for long‑term results. Every session is tailored to your goals—whether you're recovering from injury, preparing for competition, or building long‑term health and strength."
        buttonText="Chat With Us"
        onButtonClick={() => setIsContactModalOpen(true)}
      />

      {/* About Us Section */}
      <section id="about" className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8 min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img
            src={STR_ASSETS.backgrounds.aboutUs}
            alt="STR Fitness Gym Training"
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to placeholder if image not found
              const target = e.target as HTMLImageElement;
              target.src = 'https://images.pexels.com/photos/4164754/pexels-photo-4164754.jpeg?auto=compress&cs=tinysrgb&w=1920';
              target.className = 'w-full h-full object-cover grayscale';
            }}
          />
          <div className="absolute inset-0 bg-background/80"></div>
        </div>

        <div className="container mx-auto relative z-10 w-full px-4 sm:px-6 lg:px-8">
          <div className="w-full">
            {/* Main Heading */}
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold uppercase mb-6 text-foreground leading-tight">
              Why Choose STR Personal Training
            </h2>

            {/* Content */}
            <p className="text-lg md:text-xl text-foreground mb-16 max-w-3xl leading-relaxed">
              At STR, we believe personal training should be exactly that—personal. Every 1‑on‑1 session begins with a comprehensive assessment of your movement patterns, strength levels, and specific goals. Our physiotherapy‑informed approach ensures you train safely while making measurable progress. Whether you're recovering from injury, preparing for competition, or building long‑term health, your program is designed specifically for you—not a generic template. No classes. No crowds. Just focused, expert coaching that delivers real results.
            </p>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 1-on-1 Expert Coaching Card */}
              <div className="bg-white rounded-3xl p-6 shadow-2xl h-full flex flex-col">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-4 shrink-0">
                  <Wrench className="h-6 w-6 text-black" />
                </div>
                <h3 className="text-xl font-bold uppercase text-black mb-3">1‑ON‑1 EXPERT COACHING</h3>
                <p className="text-black/80 text-sm leading-relaxed grow">
                  Work directly with experienced coaches who provide undivided attention, real‑time form correction, and personalized guidance every single session. No distractions, no waiting—just you and your coach.
                </p>
              </div>

              {/* Personalized Training Plans Card */}
              <div className="bg-white rounded-3xl p-6 shadow-2xl h-full flex flex-col">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-4 shrink-0">
                  <Award className="h-6 w-6 text-black" />
                </div>
                <h3 className="text-xl font-bold uppercase text-black mb-3">PERSONALIZED TRAINING PLANS</h3>
                <p className="text-black/80 text-sm leading-relaxed grow">
                  Every program starts with a comprehensive assessment. Your training plan is built specifically for your body, your goals, and your schedule—not a one‑size‑fits‑all template.
                </p>
              </div>

              {/* Individual Attention Card */}
              <div className="bg-white rounded-3xl p-6 shadow-2xl h-full flex flex-col">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-4 shrink-0">
                  <Users className="h-6 w-6 text-black" />
                </div>
                <h3 className="text-xl font-bold uppercase text-black mb-3">DEDICATED SUPPORT</h3>
                <p className="text-black/80 text-sm leading-relaxed grow">
                  Your coach tracks your progress, adjusts your program in real‑time, and provides the accountability you need to stay consistent. Every session is focused entirely on your success.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Our Programmes Section */}
      <section id="programmes" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
            {/* Left Column - Big Title */}
            <div className="flex flex-col justify-center">
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold uppercase text-foreground leading-tight mb-6">
                WHAT'S INCLUDED IN YOUR PT PROGRAM
              </h2>
              <p className="text-lg md:text-xl text-foreground/80 leading-relaxed max-w-xl mb-8">
                Every 1‑on‑1 personal training program at STR includes comprehensive support from assessment to results. Here's what you get when you train with us.
              </p>
              {/* Programmes Image */}
              <div className="w-full max-w-xl">
                <img 
                  src={STR_ASSETS.images.programmes}
                  alt="STR Fitness Gym Facilities - Rowing Machines, Training Area, and Weightlifting Equipment"
                  className="w-full h-auto rounded-lg object-cover shadow-lg"
                  onError={(e) => {
                    // Fallback if image not found
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
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
                        {/* Red Accent on Top and Left - Irregular/Tilted Shape */}
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
                            className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center shrink-0 hover:bg-gray-700 transition-colors"
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
                            onClick={() => setIsContactModalOpen(true)}
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
                            className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center shrink-0 hover:bg-gray-700 transition-colors"
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
      <section id="gallery" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold uppercase mb-6 text-center text-foreground leading-tight">GALLERY</h2>
          
          {/* Introduction Text */}
          <p className="text-sm text-muted-foreground text-center mb-12">
            Training sessions, facility photos and videos
          </p>

          {/* Gallery Slider - 4 images per slide */}
          <div className="relative mb-8">
            <Carousel
              opts={{
                align: 'start',
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
              <CarouselContent className="-ml-2 md:-ml-4">
                {/* Group images into slides of 4 */}
                {Array.from({ length: Math.ceil(galleryImages.length / 4) }).map((_, slideIndex) => {
                  const slideImages = galleryImages.slice(slideIndex * 4, slideIndex * 4 + 4);
                  return (
                    <CarouselItem key={slideIndex} className="pl-2 md:pl-4 basis-full">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {slideImages.map((image, imageIndex) => {
                          const globalIndex = slideIndex * 4 + imageIndex;
                          return (
                            <div
                              key={globalIndex}
                              className="relative rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer"
                              onClick={() => setSelectedGalleryImage(image)}
                            >
                              <div className="aspect-square relative">
                                <img
                                  src={image.src}
                                  alt={image.alt}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                  loading="lazy"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = 'https://images.pexels.com/photos/4164754/pexels-photo-4164754.jpeg?auto=compress&cs=tinysrgb&w=800';
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
            </Carousel>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => galleryCarouselApi.current?.scrollPrev()}
              className="w-12 h-12 rounded-full border-2 border-[#E00000] bg-background flex items-center justify-center hover:bg-[#E00000]/10 transition-colors"
              aria-label="Previous images"
            >
              <ArrowRight className="h-5 w-5 text-[#E00000] transition-colors rotate-180" />
            </button>
            <button
              onClick={() => galleryCarouselApi.current?.scrollNext()}
              className="w-12 h-12 rounded-full border-2 border-[#E00000] bg-background flex items-center justify-center hover:bg-[#E00000]/10 transition-colors"
              aria-label="Next images"
            >
              <ArrowRight className="h-5 w-5 text-[#E00000] transition-colors" />
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="container mx-auto max-w-7xl">
          {/* Section Header */}
          <div className="mb-12">
            {/* Main Heading */}
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold uppercase text-foreground leading-tight mb-8">
              RESULT YOU CAN FEEL & SEE
            </h2>

            {/* Google Badge */}
            {placeInfo && placeInfo.rating > 0 && (
              <div className="flex items-center gap-4 mb-8 p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                {/* Google Logo */}
                <div className="shrink-0">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                </div>
                {/* Rating and Review Count */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <span className="text-3xl font-bold text-foreground">{placeInfo.rating.toFixed(1)}</span>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-5 w-5 ${
                            star <= Math.round(placeInfo.rating)
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-400 fill-gray-400'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="h-6 w-px bg-foreground/20"></div>
                  <div>
                    <p className="text-foreground font-medium">
                      Based on <span className="font-bold">{placeInfo.totalReviews}</span> Google reviews
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Testimonial Cards Carousel - Google Reviews Style */}
          {testimonialsLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#E00000] mb-4"></div>
                <p className="text-foreground/60">Loading reviews...</p>
              </div>
            </div>
          ) : testimonials.length > 0 ? (
            <>
              {/* Reviews Carousel */}
              <div className="relative mb-8">
                <Carousel
                  opts={{
                    align: 'start',
                    loop: true,
                    slidesToScroll: 1,
                  }}
                  className="w-full"
                  setApi={(api) => {
                    if (api) {
                      testimonialsCarouselApi.current = api;
                      setActiveTestimonialSlide(api.selectedScrollSnap());
                      api.on('select', () => {
                        setActiveTestimonialSlide(api.selectedScrollSnap());
                      });
                    }
                  }}
                >
                  <CarouselContent className="-ml-4 md:-ml-6">
                    {/* Group reviews into slides of 3 */}
                    {Array.from({ length: Math.ceil(testimonials.length / 3) }).map((_, slideIndex) => {
                      const slideReviews = testimonials.slice(slideIndex * 3, slideIndex * 3 + 3);
                      return (
                        <CarouselItem key={slideIndex} className="pl-4 md:pl-6 basis-full">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {slideReviews.map((testimonial, reviewIndex) => {
                              const reviewDate = formatReviewDate(testimonial.time);
                              const initials = getInitials(testimonial.name);
                              const globalIndex = slideIndex * 3 + reviewIndex;
                              
                              return (
                                <div
                                  key={globalIndex}
                                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 h-full flex flex-col"
                                >
                                  {/* Avatar with Google Logo */}
                                  <div className="flex items-start gap-4 mb-4">
                                            <div className="relative shrink-0">
                                      {testimonial.profilePhotoUrl ? (
                                        <img
                                          src={testimonial.profilePhotoUrl}
                                          alt={testimonial.name}
                                          className="w-12 h-12 rounded-full object-cover"
                                          onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                            const parent = target.parentElement;
                                            if (parent && !parent.querySelector('.initials-fallback')) {
                                              const fallback = document.createElement('div');
                                              fallback.className = 'initials-fallback w-12 h-12 rounded-full bg-[#EA4335] flex items-center justify-center text-white font-bold text-lg';
                                              fallback.textContent = initials;
                                              parent.appendChild(fallback);
                                            }
                                          }}
                                        />
                                      ) : (
                                        <div className="w-12 h-12 rounded-full bg-[#EA4335] flex items-center justify-center text-white font-bold text-lg">
                                          {initials}
                                        </div>
                                      )}
                                      {/* Google 'G' Logo Badge */}
                                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-md border border-gray-200">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                        </svg>
                                      </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-bold text-gray-900 text-base mb-1 truncate">{testimonial.name}</p>
                                      <p className="text-gray-500 text-sm">{reviewDate}</p>
                                    </div>
                                  </div>

                                  {/* Star Rating */}
                                  <div className="flex items-center gap-2 mb-4">
                                    <div className="flex items-center gap-0.5">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                          key={star}
                                          className={`h-4 w-4 ${
                                            star <= testimonial.rating
                                              ? 'text-yellow-400 fill-yellow-400'
                                              : 'text-gray-300 fill-gray-300'
                                          }`}
                                        />
                                      ))}
                                    </div>
                                    {/* Verified Checkmark */}
                                    <div className="w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center">
                                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    </div>
                                  </div>

                                  {/* Review Text */}
                                  <p className="text-gray-700 mb-4 leading-relaxed text-sm grow">
                                    {testimonial.quote.length > 150 ? (
                                      <>
                                        {testimonial.quote.substring(0, 150)}...{' '}
                                        <button className="text-gray-500 hover:text-gray-700 text-sm font-medium">
                                          Read more
                                        </button>
                                      </>
                                    ) : (
                                      testimonial.quote
                                    )}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </CarouselItem>
                      );
                    })}
                  </CarouselContent>
                </Carousel>
              </div>

              {/* Bullet Navigation */}
              <div className="flex justify-center items-center gap-2 mb-8">
                {Array.from({ length: Math.ceil(testimonials.length / 3) }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      testimonialsCarouselApi.current?.scrollTo(index);
                    }}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      activeTestimonialSlide === index
                        ? 'bg-[#E00000] w-8'
                        : 'bg-gray-400 w-2 hover:bg-gray-500'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-foreground/60">No reviews available at this time.</p>
            </div>
          )}

          {/* CTA Button */}
          <div className="flex justify-center">
            <Button
              size="lg"
              className="bg-[#E00000] text-white hover:bg-[#E00000]/90 text-lg px-10 py-6 font-bold uppercase rounded-lg transition-all duration-300 hover:scale-105"
              onClick={() => setIsContactModalOpen(true)}
            >
              GET STARTED TODAY
            </Button>
          </div>
        </div>
      </section>

      {/* Our Team Section */}
      <section id="team" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold uppercase mb-12 text-center text-foreground leading-tight">OUR TEAM</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member, index) => (
              <div key={index} className="relative rounded-2xl overflow-hidden transition-all duration-300 border border-gray-700/50 flex flex-col h-full">
                {/* Image Area - Fixed Height */}
                <div className="relative h-64 md:h-72 overflow-hidden shrink-0">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                {/* Dark Panel - Bottom Section with Flex Grow */}
                <div className="bg-background p-6 flex flex-col grow">
                  <h3 className="text-2xl font-bold uppercase text-foreground mb-2">{member.name.toUpperCase()}</h3>
                  <p className="text-[#A0A0A0] text-sm font-medium mb-3">{member.role}</p>
                  <p className="text-muted-foreground text-sm leading-relaxed grow">
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
                  <div className="ml-auto shrink-0 w-8 h-8 rounded-full bg-[#E00000] border border-[#E00000]/50 flex items-center justify-center relative">
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
              onClick={() => setIsContactModalOpen(true)}
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
              READY TO START YOUR PERSONAL TRAINING JOURNEY?
            </h2>
            <p className="text-lg md:text-xl text-foreground/80 mb-8 max-w-2xl mx-auto leading-relaxed">
              Experience 1‑on‑1 coaching that's assessment‑led, physiotherapy‑informed, and designed specifically for you. Whether you're recovering from injury, preparing for competition, or building long‑term health, your personalized program starts with a conversation. Chat with us today to learn how we can help you achieve your goals.
            </p>
            
            {/* CTA Button */}
            <Button
              size="lg"
              className="bg-[#E00000] text-white hover:bg-[#E00000]/90 text-lg px-10 py-6 font-bold uppercase rounded-lg transition-all duration-300 hover:scale-105"
              onClick={() => setIsContactModalOpen(true)}
            >
              CHAT WITH US
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-background border-t border-border/20">
        <div className="container mx-auto max-w-7xl">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 lg:gap-16 mb-12">
            {/* Left Column - Logo & Social */}
            <div className="space-y-3">
              <img 
                src={logoSrc} 
                alt="STR" 
                className="h-12 w-auto"
                onError={(e) => {
                  // Fallback to text if image not found
                  const target = e.target as HTMLImageElement;
                  if (target.dataset.fallbackAdded) return; // Prevent duplicate fallback
                  target.style.display = 'none';
                  target.dataset.fallbackAdded = 'true';
                  const fallback = document.createElement('div');
                  fallback.className = 'text-2xl font-bold text-foreground uppercase tracking-tight';
                  fallback.textContent = 'STR';
                  target.parentElement?.appendChild(fallback);
                }}
              />
              <div className="flex items-center gap-4">
                <a
                  href="https://www.instagram.com/strfitnessclub.sg/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border-2 border-foreground/30 flex items-center justify-center hover:border-[#E00000] hover:bg-[#E00000]/10 transition-all duration-300 group"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5 text-foreground group-hover:text-[#E00000] transition-colors" />
                </a>
                <a
                  href="https://wa.me/6588411329"
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

      {/* Contact Modal */}
      <ContactModal 
        isOpen={isContactModalOpen} 
        onClose={() => setIsContactModalOpen(false)} 
      />

      {/* Gallery Image Modal */}
      <Dialog open={!!selectedGalleryImage} onOpenChange={() => setSelectedGalleryImage(null)}>
        <DialogContent className="max-w-7xl max-h-[95vh] p-0 bg-transparent border-0">
          {selectedGalleryImage && (
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={selectedGalleryImage.src}
                alt={selectedGalleryImage.alt}
                className="max-w-full max-h-[95vh] w-auto h-auto object-contain rounded-lg"
                loading="lazy"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PersonalTrainingPage;
