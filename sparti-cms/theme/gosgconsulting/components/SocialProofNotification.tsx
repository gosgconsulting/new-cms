"use client";

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface SocialProofNotificationProps {
  onLearnHow?: () => void;
}

type NotificationScenario = {
  name: string;
  role: string;
  metric: string;
  value: number | string;
  unit: string;
};

const SocialProofNotification: React.FC<SocialProofNotificationProps> = ({ onLearnHow }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentScenario, setCurrentScenario] = useState<NotificationScenario | null>(null);
  const [notificationQueue, setNotificationQueue] = useState<NotificationScenario[]>([]);
  const [shownIndices, setShownIndices] = useState<Set<number>>(new Set());
  const autoCloseDelay = 5000; // 5 seconds
  
  // Use refs to access current state in callbacks
  const queueRef = React.useRef<NotificationScenario[]>([]);
  const shownIndicesRef = React.useRef<Set<number>>(new Set());
  
  // Keep refs in sync with state
  React.useEffect(() => {
    queueRef.current = notificationQueue;
  }, [notificationQueue]);
  
  React.useEffect(() => {
    shownIndicesRef.current = shownIndices;
  }, [shownIndices]);

  const scenarios: NotificationScenario[] = [
    // Service Providers - Leads
    {
      name: "Nicole",
      role: "Property Agent",
      metric: "generated",
      value: 15,
      unit: "leads today"
    },
    {
      name: "Sarah",
      role: "Restaurant Owner",
      metric: "generated",
      value: 12,
      unit: "leads today"
    },
    {
      name: "Emma",
      role: "Fitness Coach",
      metric: "generated",
      value: 18,
      unit: "leads today"
    },
    {
      name: "Michael",
      role: "Yoga Instructor",
      metric: "generated",
      value: 14,
      unit: "leads today"
    },
    {
      name: "Jessica",
      role: "Dance Studio Owner",
      metric: "generated",
      value: 11,
      unit: "leads today"
    },
    {
      name: "David",
      role: "Singing Teacher",
      metric: "generated",
      value: 9,
      unit: "leads today"
    },
    {
      name: "Lisa",
      role: "Gym Owner",
      metric: "generated",
      value: 22,
      unit: "leads today"
    },
    {
      name: "James",
      role: "Personal Trainer",
      metric: "generated",
      value: 16,
      unit: "leads today"
    },
    {
      name: "Rachel",
      role: "Pilates Instructor",
      metric: "generated",
      value: 13,
      unit: "leads today"
    },
    {
      name: "Kevin",
      role: "Martial Arts Coach",
      metric: "generated",
      value: 10,
      unit: "leads today"
    },
    {
      name: "Amanda",
      role: "Swimming Instructor",
      metric: "generated",
      value: 8,
      unit: "leads today"
    },
    {
      name: "Daniel",
      role: "Real Estate Agent",
      metric: "generated",
      value: 17,
      unit: "leads today"
    },
    {
      name: "Sophie",
      role: "Beauty Salon Owner",
      metric: "generated",
      value: 19,
      unit: "leads today"
    },
    {
      name: "Ryan",
      role: "Hair Stylist",
      metric: "generated",
      value: 15,
      unit: "leads today"
    },
    {
      name: "Michelle",
      role: "Nail Salon Owner",
      metric: "generated",
      value: 12,
      unit: "leads today"
    },
    {
      name: "Jason",
      role: "Massage Therapist",
      metric: "generated",
      value: 14,
      unit: "leads today"
    },
    {
      name: "Grace",
      role: "Spa Owner",
      metric: "generated",
      value: 11,
      unit: "leads today"
    },
    {
      name: "Marcus",
      role: "Tutor",
      metric: "generated",
      value: 20,
      unit: "leads today"
    },
    {
      name: "Vivian",
      role: "Music School Owner",
      metric: "generated",
      value: 13,
      unit: "leads today"
    },
    {
      name: "Alex",
      role: "Language Teacher",
      metric: "generated",
      value: 16,
      unit: "leads today"
    },
    {
      name: "Catherine",
      role: "Photographer",
      metric: "generated",
      value: 10,
      unit: "leads today"
    },
    {
      name: "Benjamin",
      role: "Event Planner",
      metric: "generated",
      value: 9,
      unit: "leads today"
    },
    {
      name: "Isabella",
      role: "Wedding Planner",
      metric: "generated",
      value: 7,
      unit: "leads today"
    },
    {
      name: "Nathan",
      role: "Interior Designer",
      metric: "generated",
      value: 12,
      unit: "leads today"
    },
    {
      name: "Olivia",
      role: "Graphic Designer",
      metric: "generated",
      value: 15,
      unit: "leads today"
    },
    {
      name: "Ethan",
      role: "Web Developer",
      metric: "generated",
      value: 11,
      unit: "leads today"
    },
    {
      name: "Zoe",
      role: "Marketing Consultant",
      metric: "generated",
      value: 14,
      unit: "leads today"
    },
    {
      name: "Lucas",
      role: "Accountant",
      metric: "generated",
      value: 18,
      unit: "leads today"
    },
    {
      name: "Maya",
      role: "Lawyer",
      metric: "generated",
      value: 8,
      unit: "leads today"
    },
    {
      name: "Noah",
      role: "Insurance Agent",
      metric: "generated",
      value: 16,
      unit: "leads today"
    },
    {
      name: "Luna",
      role: "Financial Advisor",
      metric: "generated",
      value: 13,
      unit: "leads today"
    },
    {
      name: "Aiden",
      role: "Car Dealer",
      metric: "generated",
      value: 10,
      unit: "leads today"
    },
    {
      name: "Chloe",
      role: "Travel Agent",
      metric: "generated",
      value: 12,
      unit: "leads today"
    },
    {
      name: "Liam",
      role: "Catering Service",
      metric: "generated",
      value: 15,
      unit: "leads today"
    },
    {
      name: "Ava",
      role: "Cleaning Service",
      metric: "generated",
      value: 19,
      unit: "leads today"
    },
    {
      name: "Mason",
      role: "Plumber",
      metric: "generated",
      value: 11,
      unit: "leads today"
    },
    {
      name: "Ella",
      role: "Electrician",
      metric: "generated",
      value: 14,
      unit: "leads today"
    },
    {
      name: "Henry",
      role: "Handyman",
      metric: "generated",
      value: 17,
      unit: "leads today"
    },
    {
      name: "Charlotte",
      role: "Pet Groomer",
      metric: "generated",
      value: 13,
      unit: "leads today"
    },
    {
      name: "Sebastian",
      role: "Veterinarian",
      metric: "generated",
      value: 9,
      unit: "leads today"
    },
    // Product Sellers - Revenue
    {
      name: "Michael",
      role: "Ice Cream Shop",
      metric: "generated",
      value: "$1,850",
      unit: "in revenue today"
    },
    {
      name: "Jessica",
      role: "Clothing Brand",
      metric: "generated",
      value: "$3,200",
      unit: "in revenue today"
    },
    {
      name: "David",
      role: "Dress Shop",
      metric: "generated",
      value: "$2,600",
      unit: "in revenue today"
    },
    {
      name: "James",
      role: "Online Flower Shop",
      metric: "generated",
      value: "$1,400",
      unit: "in revenue today"
    },
    {
      name: "Rachel",
      role: "Jewelry Store",
      metric: "generated",
      value: "$4,500",
      unit: "in revenue today"
    },
    {
      name: "Kevin",
      role: "Electronics Retailer",
      metric: "generated",
      value: "$5,200",
      unit: "in revenue today"
    },
    {
      name: "Amanda",
      role: "Shoe Store",
      metric: "generated",
      value: "$2,100",
      unit: "in revenue today"
    },
    {
      name: "Daniel",
      role: "Accessories Shop",
      metric: "generated",
      value: "$1,750",
      unit: "in revenue today"
    },
    {
      name: "Sophie",
      role: "Cosmetics Store",
      metric: "generated",
      value: "$2,800",
      unit: "in revenue today"
    },
    {
      name: "Ryan",
      role: "Perfume Shop",
      metric: "generated",
      value: "$1,950",
      unit: "in revenue today"
    },
    {
      name: "Michelle",
      role: "Handbag Store",
      metric: "generated",
      value: "$3,400",
      unit: "in revenue today"
    },
    {
      name: "Jason",
      role: "Watch Retailer",
      metric: "generated",
      value: "$4,800",
      unit: "in revenue today"
    },
    {
      name: "Grace",
      role: "Home Decor Shop",
      metric: "generated",
      value: "$2,300",
      unit: "in revenue today"
    },
    {
      name: "Marcus",
      role: "Furniture Store",
      metric: "generated",
      value: "$3,600",
      unit: "in revenue today"
    },
    {
      name: "Vivian",
      role: "Toy Store",
      metric: "generated",
      value: "$1,600",
      unit: "in revenue today"
    },
    {
      name: "Alex",
      role: "Bookstore",
      metric: "generated",
      value: "$950",
      unit: "in revenue today"
    },
    {
      name: "Catherine",
      role: "Stationery Shop",
      metric: "generated",
      value: "$1,200",
      unit: "in revenue today"
    },
    {
      name: "Benjamin",
      role: "Sports Equipment Store",
      metric: "generated",
      value: "$2,700",
      unit: "in revenue today"
    },
    {
      name: "Isabella",
      role: "Bicycle Shop",
      metric: "generated",
      value: "$1,850",
      unit: "in revenue today"
    },
    {
      name: "Nathan",
      role: "Pet Supply Store",
      metric: "generated",
      value: "$1,450",
      unit: "in revenue today"
    },
    {
      name: "Olivia",
      role: "Baby Products Store",
      metric: "generated",
      value: "$2,100",
      unit: "in revenue today"
    },
    {
      name: "Ethan",
      role: "Gadget Store",
      metric: "generated",
      value: "$3,800",
      unit: "in revenue today"
    },
    {
      name: "Zoe",
      role: "Phone Accessories Shop",
      metric: "generated",
      value: "$1,650",
      unit: "in revenue today"
    },
    {
      name: "Lucas",
      role: "Art Supplies Store",
      metric: "generated",
      value: "$1,100",
      unit: "in revenue today"
    },
    {
      name: "Maya",
      role: "Craft Store",
      metric: "generated",
      value: "$1,350",
      unit: "in revenue today"
    },
    {
      name: "Noah",
      role: "Gift Shop",
      metric: "generated",
      value: "$1,900",
      unit: "in revenue today"
    },
    {
      name: "Luna",
      role: "Souvenir Shop",
      metric: "generated",
      value: "$1,550",
      unit: "in revenue today"
    },
    {
      name: "Aiden",
      role: "Herbal Medicine Shop",
      metric: "generated",
      value: "$2,200",
      unit: "in revenue today"
    },
    {
      name: "Chloe",
      role: "Health Supplements Store",
      metric: "generated",
      value: "$2,500",
      unit: "in revenue today"
    },
    {
      name: "Liam",
      role: "Organic Food Store",
      metric: "generated",
      value: "$1,750",
      unit: "in revenue today"
    },
    {
      name: "Ava",
      role: "Bakery",
      metric: "generated",
      value: "$1,300",
      unit: "in revenue today"
    },
    {
      name: "Mason",
      role: "Coffee Shop",
      metric: "generated",
      value: "$1,600",
      unit: "in revenue today"
    },
    {
      name: "Ella",
      role: "Bubble Tea Shop",
      metric: "generated",
      value: "$1,850",
      unit: "in revenue today"
    },
    {
      name: "Henry",
      role: "Snack Store",
      metric: "generated",
      value: "$1,200",
      unit: "in revenue today"
    },
    {
      name: "Charlotte",
      role: "Wine Shop",
      metric: "generated",
      value: "$2,400",
      unit: "in revenue today"
    },
    {
      name: "Sebastian",
      role: "Gourmet Food Store",
      metric: "generated",
      value: "$1,950",
      unit: "in revenue today"
    }
  ];

  // Function to prepare queue with up to 4 more notifications
  const prepareNotificationQueue = React.useCallback(() => {
    const currentShown = shownIndicesRef.current;
    const availableIndices = scenarios
      .map((_, index) => index)
      .filter(index => !currentShown.has(index));
    
    if (availableIndices.length === 0) {
      // Reset if all scenarios have been shown
      setShownIndices(new Set());
      shownIndicesRef.current = new Set();
      return;
    }
    
    const queue: NotificationScenario[] = [];
    const maxQueueSize = 4;
    
    // Shuffle available indices
    const shuffled = [...availableIndices].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < Math.min(maxQueueSize, shuffled.length); i++) {
      const index = shuffled[i];
      queue.push(scenarios[index]);
      currentShown.add(index);
    }
    
    const newShown = new Set(currentShown);
    shownIndicesRef.current = newShown;
    setShownIndices(newShown);
    
    const currentQueue = queueRef.current;
    const newQueue = [...currentQueue, ...queue];
    queueRef.current = newQueue;
    setNotificationQueue(newQueue);
  }, []);

  // Function to show next notification from queue or get a new one
  const showNextNotification = React.useCallback(() => {
    const currentQueue = queueRef.current;
    const currentShown = shownIndicesRef.current;
    
    let nextScenario: NotificationScenario | null = null;
    
    if (currentQueue.length > 0) {
      // Show next from queue
      nextScenario = currentQueue[0];
      const newQueue = currentQueue.slice(1);
      queueRef.current = newQueue;
      setNotificationQueue(newQueue);
      
      // Refill queue if it's getting low
      if (newQueue.length <= 1) {
        prepareNotificationQueue();
      }
    } else {
      // Get a new random scenario
      const unshownIndices = scenarios
        .map((_, index) => index)
        .filter(index => !currentShown.has(index));
      
      if (unshownIndices.length === 0) {
        // Reset if all scenarios have been shown
        setShownIndices(new Set());
        shownIndicesRef.current = new Set();
        const resetIndex = Math.floor(Math.random() * scenarios.length);
        nextScenario = scenarios[resetIndex];
        shownIndicesRef.current.add(resetIndex);
        setShownIndices(new Set([resetIndex]));
      } else {
        const randomIndex = unshownIndices[Math.floor(Math.random() * unshownIndices.length)];
        nextScenario = scenarios[randomIndex];
        const newShown = new Set([...currentShown, randomIndex]);
        shownIndicesRef.current = newShown;
        setShownIndices(newShown);
      }
      
      // Prepare queue for next notifications
      prepareNotificationQueue();
    }
    
    if (nextScenario) {
      setCurrentScenario(nextScenario);
      setIsVisible(true);
    }
  }, []);

  const handleClose = React.useCallback(() => {
    setIsVisible(false);
    // Show next notification after a short delay
    setTimeout(() => {
      showNextNotification();
    }, 500); // Small delay for smooth transition
  }, [showNextNotification]);

  useEffect(() => {
    // Show first notification after 10 seconds
    const initialTimer = setTimeout(() => {
      const currentShown = shownIndicesRef.current;
      const unshownIndices = scenarios
        .map((_, index) => index)
        .filter(index => !currentShown.has(index));
      
      if (unshownIndices.length === 0) {
        // Reset if all scenarios have been shown
        setShownIndices(new Set());
        shownIndicesRef.current = new Set();
        const resetIndex = Math.floor(Math.random() * scenarios.length);
        const firstScenario = scenarios[resetIndex];
        shownIndicesRef.current.add(resetIndex);
        setShownIndices(new Set([resetIndex]));
        setCurrentScenario(firstScenario);
        setIsVisible(true);
        prepareNotificationQueue();
      } else {
        const randomIndex = unshownIndices[Math.floor(Math.random() * unshownIndices.length)];
        const firstScenario = scenarios[randomIndex];
        const newShown = new Set([...currentShown, randomIndex]);
        shownIndicesRef.current = newShown;
        setShownIndices(newShown);
        setCurrentScenario(firstScenario);
        setIsVisible(true);
        // Prepare queue for next notifications
        prepareNotificationQueue();
      }
    }, 10000);

    return () => clearTimeout(initialTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prepareNotificationQueue]);

  // Auto-close timer effect
  useEffect(() => {
    if (isVisible && currentScenario) {
      const autoCloseTimer = setTimeout(() => {
        handleClose();
      }, autoCloseDelay);

      return () => clearTimeout(autoCloseTimer);
    }
  }, [isVisible, currentScenario, handleClose]);

  const handleLearnHow = () => {
    if (onLearnHow) {
      onLearnHow();
    }
    setIsVisible(false);
  };

  if (!isVisible || !currentScenario) {
    return null;
  }

  return (
    <div 
      className="fixed bottom-6 left-6 z-50"
      style={{
        animation: 'slideInFromLeft 0.3s ease-out',
      }}
    >
      <style>{`
        @keyframes slideInFromLeft {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-sm min-w-[320px] relative">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Main content */}
        <div className="pr-6">
          <p className="text-sm text-gray-800 leading-relaxed">
            <span className="font-bold">{currentScenario.name}</span>
            {', '}
            <span className="font-semibold">{currentScenario.role}</span>
            {' '}
            {currentScenario.metric}{' '}
            <span className="font-bold">{currentScenario.value}</span>{' '}
            {currentScenario.unit}
          </p>
        </div>

        {/* Action button */}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-gray-500">Just now</span>
          <button
            onClick={handleLearnHow}
            className="px-4 py-2 bg-gradient-to-r from-[#FF6B35] to-[#FFA500] text-white text-xs font-semibold rounded-full hover:from-[#FF5722] hover:to-[#FF9800] transition-all"
          >
            Learn how
          </button>
        </div>
      </div>
    </div>
  );
};

export default SocialProofNotification;
