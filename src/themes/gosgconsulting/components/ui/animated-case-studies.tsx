"use client";

import { motion } from "framer-motion";
import { useRef, useEffect, useState } from "react";

interface CaseStudyCard {
  id: string;
  metric: string;
  timeframe: string;
  delay: number;
  gradient: string;
  icon: string;
  chartType: 'line' | 'bar';
  dataPoints?: number[];
  metricLabels?: string[];
}

const caseStudies: CaseStudyCard[] = [
  // First row - Line charts with metric labels
  {
    id: "1",
    metric: "+320% Organic Traffic",
    timeframe: "in 5 months",
    delay: 0,
    gradient: "from-purple-500 to-teal-500",
    icon: "📈",
    chartType: 'line',
    dataPoints: [45, 35, 25, 15, 12],
    metricLabels: ['1.2K', '2.8K', '4.5K', '6.2K', '8.1K']
  },
  {
    id: "2", 
    metric: "+450% Leads Growth",
    timeframe: "in 6 months",
    delay: 0.2,
    gradient: "from-blue-500 to-cyan-500",
    icon: "🎯",
    chartType: 'bar',
    dataPoints: [15, 18, 22, 28, 35, 42, 48, 52, 55, 58, 60, 62],
    metricLabels: ['10', '15', '22', '28', '35', '42', '48', '52', '55', '58', '60', '62']
  },
  {
    id: "3",
    metric: "+280% Revenue", 
    timeframe: "in 4 months",
    delay: 0.4,
    gradient: "from-green-500 to-emerald-500",
    icon: "💰",
    chartType: 'bar',
    dataPoints: [12, 15, 18, 22, 26, 30, 34, 38, 42, 46, 50, 54],
    metricLabels: ['5K', '8K', '12K', '18K', '25K', '32K', '38K', '42K', '46K', '50K', '54K', '58K']
  },
  // Second row
  {
    id: "4",
    metric: "+650% ROI",
    timeframe: "in 8 months", 
    delay: 0.6,
    gradient: "from-orange-500 to-red-500",
    icon: "🚀",
    chartType: 'bar',
    dataPoints: [10, 12, 15, 18, 22, 26, 30, 35, 40, 45, 50, 55],
    metricLabels: ['x1.2', 'x1.5', 'x1.8', 'x2.1', 'x2.5', 'x2.8', 'x3.2', 'x3.6', 'x4.0', 'x4.3', 'x4.6', 'x5.0']
  },
  {
    id: "5",
    metric: "+180% Conversion Rate",
    timeframe: "in 3 months", 
    delay: 0.8,
    gradient: "from-pink-500 to-rose-500",
    icon: "🎪",
    chartType: 'line',
    dataPoints: [48, 38, 28, 18, 12],
    metricLabels: ['2.0%', '3.2%', '4.1%', '5.3%', '6.2%']
  },
  {
    id: "6",
    metric: "+220% CTR Increase",
    timeframe: "in 5 months", 
    delay: 1.0,
    gradient: "from-indigo-500 to-purple-500",
    icon: "👆",
    chartType: 'line',
    dataPoints: [50, 40, 30, 20, 10],
    metricLabels: ['0.7%', '1.2%', '1.8%', '2.4%', '3.1%']
  }
];

interface AnimatedCaseStudiesProps {
  className?: string;
}

export default function AnimatedCaseStudies({ className = "" }: AnimatedCaseStudiesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const renderChart = (study: CaseStudyCard) => {
    if (study.chartType === 'line') {
      const points = [
        { x: 20, y: study.dataPoints![0] },
        { x: 60, y: study.dataPoints![1] },
        { x: 120, y: study.dataPoints![2] },
        { x: 160, y: study.dataPoints![3] },
        { x: 180, y: study.dataPoints![4] }
      ];

      return (
        <svg className="w-full h-full" viewBox="0 0 200 60">
          {/* Subtle grid background */}
          <defs>
            <pattern id={`grid-${study.id}`} width="25" height="15" patternUnits="userSpaceOnUse">
              <path d="M 25 0 L 0 0 0 15" fill="none" stroke="#f1f5f9" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="200" height="60" fill={`url(#grid-${study.id})`} />
          
          {/* Smooth growth line */}
          <motion.path
            d={`M ${points[0].x} ${points[0].y} Q ${points[1].x} ${points[1].y} ${points[2].x} ${points[2].y} T ${points[3].x} ${points[3].y} ${points[4].x} ${points[4].y}`}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={isVisible ? { pathLength: 1 } : {}}
            transition={{ duration: 1.8, delay: study.delay + 0.3, ease: "easeInOut" }}
          />
          
          {/* Data points with metric labels */}
          {points.map((point, i) => (
            <g key={i}>
              {/* Dot */}
              <motion.circle
                cx={point.x}
                cy={point.y}
                r="4"
                fill="#10b981"
                stroke="#ffffff"
                strokeWidth="2"
                initial={{ scale: 0, opacity: 0 }}
                animate={isVisible ? { scale: 1, opacity: 1 } : {}}
                transition={{ 
                  delay: study.delay + 0.8 + (i * 0.15), 
                  duration: 0.4,
                  type: "spring",
                  stiffness: 200
                }}
              />
              
              {/* Metric label */}
              <motion.text
                x={point.x}
                y={point.y - 8}
                textAnchor="middle"
                fontSize="8"
                fill="#374151"
                fontWeight="600"
                initial={{ opacity: 0, y: point.y }}
                animate={isVisible ? { opacity: 1, y: point.y - 8 } : {}}
                transition={{ 
                  delay: study.delay + 1.0 + (i * 0.15), 
                  duration: 0.3
                }}
              >
                {study.metricLabels![i]}
              </motion.text>
            </g>
          ))}
        </svg>
      );
    }

    if (study.chartType === 'bar') {
      const barWidth = 12;
      const barSpacing = 15;
      const barHeights = study.dataPoints!;

      return (
        <svg className="w-full h-full" viewBox="0 0 200 60">
          {/* Subtle grid background */}
          <defs>
            <pattern id={`grid-${study.id}`} width="20" height="12" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 12" fill="none" stroke="#f1f5f9" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="200" height="60" fill={`url(#grid-${study.id})`} />
          
          {/* Bars with labels */}
          {barHeights.map((height, i) => {
            const x = 8 + (i * barSpacing);
            return (
              <g key={i}>
                {/* Bar */}
                <motion.rect
                  x={x}
                  y={60 - height}
                  width={barWidth}
                  height={height}
                  fill="url(#barGradient)"
                  rx="2"
                  initial={{ height: 0, y: 60 }}
                  animate={isVisible ? { height, y: 60 - height } : {}}
                  transition={{ delay: study.delay + 0.5 + (i * 0.05), duration: 0.4 }}
                />
                
                {/* Metric label on top of bar */}
                <motion.text
                  x={x + barWidth/2}
                  y={60 - height - 3}
                  textAnchor="middle"
                  fontSize="6"
                  fill="#374151"
                  fontWeight="600"
                  initial={{ opacity: 0 }}
                  animate={isVisible ? { opacity: 1 } : {}}
                  transition={{ 
                    delay: study.delay + 0.8 + (i * 0.05), 
                    duration: 0.3
                  }}
                >
                  {study.metricLabels![i]}
                </motion.text>
              </g>
            );
          })}
          
          {/* Bar gradient */}
          <defs>
            <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
          </defs>
        </svg>
      );
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`w-full ${className}`}
    >
      {/* Grid layout: 3 cards per row, 2 rows */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {caseStudies.map((study) => (
          <motion.div
            key={study.id}
            initial={{ 
              opacity: 0, 
              y: 50,
              scale: 0.9
            }}
            animate={isVisible ? { 
              opacity: 1, 
              y: 0,
              scale: 1
            } : {}}
            transition={{
              duration: 0.6,
              delay: study.delay,
              type: "spring",
              stiffness: 100,
              damping: 15
            }}
            whileHover={{
              scale: 1.02,
              transition: { duration: 0.2 }
            }}
            className="bg-white rounded-xl p-4 shadow-lg border border-gray-100"
          >
            {/* Chart area */}
            <div className="h-16 mb-3 relative overflow-hidden rounded-lg bg-gradient-to-br from-gray-50 to-gray-100">
              {renderChart(study)}
            </div>

            {/* Metric badge */}
            <motion.div
              className={`inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r ${study.gradient} text-white text-sm font-semibold shadow-lg mb-2`}
              initial={{ scale: 0 }}
              animate={isVisible ? { scale: 1 } : {}}
              transition={{ delay: study.delay + 1.2, type: "spring" }}
            >
              <span className="text-xs mr-1">{study.icon}</span>
              {study.metric}
            </motion.div>
            
            {/* Timeframe */}
            <div className="text-xs text-gray-600 font-medium">
              {study.timeframe}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

