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

  const scenarios: NotificationScenario[] = [
    {
      name: "Nicole",
      role: "Property Agent",
      metric: "generated",
      value: 15,
      unit: "leads today"
    },
    {
      name: "Sarah",
      role: "Florist",
      metric: "generated",
      value: 8,
      unit: "leads today"
    },
    {
      name: "Emma",
      role: "Fashion Boutique Owner",
      metric: "generated",
      value: 12,
      unit: "leads today"
    },
    {
      name: "Michael",
      role: "E-commerce Store",
      metric: "generated",
      value: "$2,400",
      unit: "in revenue today"
    },
    {
      name: "Jessica",
      role: "Home Decor Shop",
      metric: "generated",
      value: "$850",
      unit: "in revenue today"
    },
    {
      name: "David",
      role: "Pajama Store",
      metric: "generated",
      value: "$1,200",
      unit: "in revenue today"
    },
    {
      name: "Lisa",
      role: "Real Estate Agent",
      metric: "generated",
      value: 9,
      unit: "leads today"
    },
    {
      name: "James",
      role: "Online Flower Shop",
      metric: "generated",
      value: "$3,200",
      unit: "in revenue today"
    }
  ];

  useEffect(() => {
    // Show notification after 10 seconds
    const timer = setTimeout(() => {
      // Randomly select a scenario
      const randomIndex = Math.floor(Math.random() * scenarios.length);
      setCurrentScenario(scenarios[randomIndex]);
      setIsVisible(true);
    }, 10000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

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
    <div className="fixed bottom-6 left-6 z-50 animate-in slide-in-from-left-5 duration-300">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-sm min-w-[320px]">
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
