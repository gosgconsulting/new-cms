import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { usePopup } from '../contexts/PopupContext';

type Item = {
  key: string;
  type: string;
  content?: string;
  items?: Array<Item>;
};

interface Gallery4SectionProps {
  items?: Item[];
  onContactClick?: () => void;
}

interface ServiceItem {
  id: string;
  title: string;
  image: string;
}

const Gallery4Section: React.FC<Gallery4SectionProps> = ({ items = [], onContactClick }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(4);
  const [isDragging, setIsDragging] = useState(false);
  const { openPopup } = usePopup();
  const dragStateRef = useRef({ 
    startX: 0, 
    scrollLeft: 0, 
    isDragging: false,
    startTime: 0,
    hasMoved: false // Track if user actually dragged
  });
  // Track card-specific click state
  const cardClickStateRef = useRef<Map<string, { startX: number; startY: number; startTime: number }>>(new Map());

  // Services data for GOSG
  const servicesData: ServiceItem[] = [
    {
      id: "website-design",
      title: "Website Design",
      image: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=900&auto=format&fit=crop&q=80",
    },
    {
      id: "seo",
      title: "SEO",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&auto=format&fit=crop&q=80",
    },
    {
      id: "sem",
      title: "SEM",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&auto=format&fit=crop&q=80",
    },
    {
      id: "social-ads",
      title: "Social Ads",
      image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=900&auto=format&fit=crop&q=80",
    },
    {
      id: "assets-creation",
      title: "Assets Creation",
      image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=900&auto=format&fit=crop&q=80",
    },
    {
      id: "tracking-reporting",
      title: "Tracking & Reporting",
      image: "https://images.unsplash.com/photo-1590479773265-7464e5d48118?w=900&auto=format&fit=crop&q=80",
    },
  ];

  // Update cards per view based on screen size
  useEffect(() => {
    const updateCardsPerView = () => {
      if (window.innerWidth >= 1024) {
        setCardsPerView(3); // lg: 3 cards (bigger images)
      } else if (window.innerWidth >= 640) {
        setCardsPerView(2); // sm: 2 cards
      } else {
        setCardsPerView(1); // mobile: 1 card
      }
    };

    updateCardsPerView();
    window.addEventListener('resize', updateCardsPerView);
    return () => window.removeEventListener('resize', updateCardsPerView);
  }, []);

  // Update current card index when scrolling
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const cardWidth = container.offsetWidth / cardsPerView;
      const gap = 24; // 1.5rem = 24px
      const cardIndex = Math.round(scrollLeft / (cardWidth + gap));
      setCurrentCardIndex(Math.max(0, Math.min(cardIndex, servicesData.length - 1)));
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [cardsPerView, servicesData.length]);

  const goToCard = useCallback((cardIndex: number) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = container.offsetWidth / cardsPerView;
      const gap = 24; // 1.5rem = 24px
      const scrollPosition = cardIndex * (cardWidth + gap);
      
      container.scrollTo({
        left: scrollPosition,
        behavior: 'smooth',
      });
      setCurrentCardIndex(cardIndex);
    }
  }, [cardsPerView]);

  // Global mouse handlers for smooth dragging
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!dragStateRef.current.isDragging) return;
      
      e.preventDefault();
      e.stopPropagation();
      
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const walk = x - dragStateRef.current.startX;
      
      // Mark as moved if drag distance exceeds threshold (5px)
      if (Math.abs(walk) > 5) {
        dragStateRef.current.hasMoved = true;
      }
      
      // Direct scroll update - no threshold needed
      container.scrollLeft = dragStateRef.current.scrollLeft - walk;
    };

    const handleGlobalMouseUp = (e: MouseEvent) => {
      if (!dragStateRef.current.isDragging) return;
      
      const wasDragging = dragStateRef.current.hasMoved;
      dragStateRef.current.isDragging = false;
      dragStateRef.current.hasMoved = false;
      setIsDragging(false);
      
      container.style.cursor = 'grab';
      container.style.userSelect = '';
      container.style.scrollBehavior = 'smooth';
      
      // Only snap if user was actually dragging, not just clicking
      if (wasDragging) {
        const cardWidth = container.offsetWidth / cardsPerView;
        const gap = 24;
        const scrollPosition = container.scrollLeft;
        const cardIndex = Math.round(scrollPosition / (cardWidth + gap));
        goToCard(Math.max(0, Math.min(cardIndex, servicesData.length - 1)));
      }
    };

    window.addEventListener('mousemove', handleGlobalMouseMove, { passive: false });
    window.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [cardsPerView, servicesData.length, goToCard]);

  // Mouse drag handlers - simplified and more responsive
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left mouse button
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const startXValue = e.clientX - rect.left;
    const scrollLeftValue = container.scrollLeft;
    
    // Initialize drag state
    dragStateRef.current = {
      startX: startXValue,
      scrollLeft: scrollLeftValue,
      isDragging: true,
      startTime: Date.now(),
      hasMoved: false
    };
    
    setIsDragging(true);
    
    // Disable smooth scrolling during drag for instant response
    container.style.scrollBehavior = 'auto';
    container.style.cursor = 'grabbing';
    container.style.userSelect = 'none';
    
    e.preventDefault();
    e.stopPropagation();
  };

  // Touch swipe handlers - simplified
  const handleTouchStart = (e: React.TouchEvent) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const startXValue = e.touches[0].clientX - rect.left;
    const scrollLeftValue = container.scrollLeft;
    
    dragStateRef.current = {
      startX: startXValue,
      scrollLeft: scrollLeftValue,
      isDragging: true,
      startTime: Date.now(),
      hasMoved: false
    };
    
    setIsDragging(true);
    container.style.scrollBehavior = 'auto';
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragStateRef.current.isDragging) return;
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const walk = x - dragStateRef.current.startX;
    
    // Mark as moved if drag distance exceeds threshold (5px)
    if (Math.abs(walk) > 5) {
      dragStateRef.current.hasMoved = true;
    }
    
    container.scrollLeft = dragStateRef.current.scrollLeft - walk;
    e.preventDefault();
  };

  const handleTouchEnd = () => {
    const container = scrollContainerRef.current;
    if (!container || !dragStateRef.current.isDragging) return;
    
    const wasDragging = dragStateRef.current.hasMoved;
    dragStateRef.current.isDragging = false;
    dragStateRef.current.hasMoved = false;
    setIsDragging(false);
    container.style.scrollBehavior = 'smooth';
    
    // Only snap if user was actually dragging, not just tapping
    if (wasDragging) {
      const cardWidth = container.offsetWidth / cardsPerView;
      const gap = 24;
      const scrollPosition = container.scrollLeft;
      const cardIndex = Math.round(scrollPosition / (cardWidth + gap));
      goToCard(Math.max(0, Math.min(cardIndex, servicesData.length - 1)));
    }
  };

  // Handle card mouse down - track click start
  const handleCardMouseDown = (e: React.MouseEvent, serviceId: string) => {
    // Only track if left mouse button
    if (e.button !== 0) return;
    
    cardClickStateRef.current.set(serviceId, {
      startX: e.clientX,
      startY: e.clientY,
      startTime: Date.now()
    });
  };

  // Handle card click - only trigger if not dragging
  const handleCardClick = (e: React.MouseEvent, serviceId: string) => {
    const clickState = cardClickStateRef.current.get(serviceId);
    
    if (!clickState) {
      // If no click state, it might be a programmatic click, allow it
      openPopup('contact');
      return;
    }
    
    // Calculate movement distance
    const deltaX = Math.abs(e.clientX - clickState.startX);
    const deltaY = Math.abs(e.clientY - clickState.startY);
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const timeSinceStart = Date.now() - clickState.startTime;
    
    // Only treat as click if:
    // 1. Mouse moved less than 5px (click, not drag)
    // 2. Time since mousedown is less than 300ms (quick click)
    // 3. Container wasn't being dragged
    if (distance < 5 && timeSinceStart < 300 && !dragStateRef.current.hasMoved) {
      e.preventDefault();
      e.stopPropagation();
      openPopup('contact');
    }
    
    // Clean up click state
    cardClickStateRef.current.delete(serviceId);
  };

  // Handle card touch - for mobile
  const handleCardTouchStart = (e: React.TouchEvent, serviceId: string) => {
    const touch = e.touches[0];
    cardClickStateRef.current.set(serviceId, {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now()
    });
  };

  const handleCardTouchEnd = (e: React.TouchEvent, serviceId: string) => {
    const clickState = cardClickStateRef.current.get(serviceId);
    
    if (!clickState) return;
    
    const touch = e.changedTouches[0];
    const deltaX = Math.abs(touch.clientX - clickState.startX);
    const deltaY = Math.abs(touch.clientY - clickState.startY);
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const timeSinceStart = Date.now() - clickState.startTime;
    
    // Only treat as tap if:
    // 1. Touch moved less than 10px (tap, not swipe)
    // 2. Time since touchstart is less than 300ms (quick tap)
    // 3. Container wasn't being dragged
    if (distance < 10 && timeSinceStart < 300 && !dragStateRef.current.hasMoved) {
      e.preventDefault();
      e.stopPropagation();
      openPopup('contact');
    }
    
    // Clean up click state
    cardClickStateRef.current.delete(serviceId);
  };

  const scrollToLeft = () => {
    if (currentCardIndex > 0) {
      goToCard(currentCardIndex - 1);
    }
  };

  const scrollToRight = () => {
    if (currentCardIndex < servicesData.length - 1) {
      goToCard(Math.min(currentCardIndex + cardsPerView, servicesData.length - 1));
    }
  };

  return (
    <section className="w-full bg-white py-20 px-4">
      <style>{`
        .carousel-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div className="container mx-auto max-w-7xl">
        {/* Header - Left aligned with navigation arrows on the right */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-4">
          <div className="flex-1">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl">
              Comprehensive digital marketing solutions designed to drive growth and deliver measurable results for your business.
            </p>
          </div>
          {/* Navigation Arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={scrollToLeft}
              disabled={currentCardIndex === 0}
              className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous services"
            >
              <ChevronLeft className="w-5 h-5 text-gray-900" />
            </button>
            <button
              onClick={scrollToRight}
              disabled={currentCardIndex >= servicesData.length - cardsPerView}
              className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Next services"
            >
              <ChevronRight className="w-5 h-5 text-gray-900" />
            </button>
          </div>
        </div>

        {/* Services Carousel */}
        <div className="relative">
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto carousel-scroll cursor-grab"
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
              touchAction: 'pan-x pinch-zoom',
              scrollBehavior: 'smooth'
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {servicesData.map((service) => (
              <div
                key={service.id}
                className="relative group flex-shrink-0 select-none cursor-pointer transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{ 
                  width: `calc((100% - ${(cardsPerView - 1) * 1.5}rem) / ${cardsPerView})`,
                  minWidth: `max(calc((100% - ${(cardsPerView - 1) * 1.5}rem) / ${cardsPerView}), 320px)`
                }}
                draggable={false}
                onMouseDown={(e) => handleCardMouseDown(e, service.id)}
                onClick={(e) => handleCardClick(e, service.id)}
                onTouchStart={(e) => handleCardTouchStart(e, service.id)}
                onTouchEnd={(e) => handleCardTouchEnd(e, service.id)}
              >
                {/* Image */}
                <div className="relative aspect-[3/4] overflow-hidden rounded-lg">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover pointer-events-none"
                    draggable={false}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                  {/* Gradient overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none"></div>
                  {/* Hover overlay effect */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 pointer-events-none"></div>
                </div>

                {/* Title at bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none">
                  <h3 className="text-white font-semibold text-lg">
                    {service.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>

          {/* Progress Bar with Dots - 6 dots for 6 service cards */}
          <div className="flex justify-center items-center mt-8">
            <div className="relative flex items-center" style={{ width: `${servicesData.length * 40}px` }}>
              {/* Horizontal line */}
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-gray-300"></div>
              
              {/* Dots positioned on the line - one for each service card */}
              <div className="relative flex items-center justify-between w-full">
                {servicesData.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToCard(index)}
                    className={`relative transition-all duration-300 ${
                      currentCardIndex === index
                        ? 'w-8 h-2 bg-gray-900 rounded-full'
                        : 'w-2 h-2 bg-gray-400 rounded-full hover:bg-gray-600'
                    }`}
                    aria-label={`Go to ${servicesData[index].title}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Gallery4Section;
