import React from 'react';
import { MapPin, Users, TrendingUp, Briefcase, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInViewOnce } from '@/libraries/flowbite/hooks/useInViewOnce';

interface StatItem {
  icon: React.ReactNode;
  value: string;
  label: string;
  prefix?: string;
}

interface StatisticsSectionProps {
  className?: string;
}

const StatisticsSection: React.FC<StatisticsSectionProps> = ({ className = '' }) => {
  const { ref, inView } = useInViewOnce<HTMLElement>({
    rootMargin: '0px 0px -10% 0px',
    threshold: 0.1,
  });

  const stats: StatItem[] = [
    {
      icon: <MapPin className="h-8 w-8" />,
      value: '38',
      label: 'LOCATIONS',
      prefix: 'SERVED ACROSS',
    },
    {
      icon: <Users className="h-8 w-8" />,
      value: '3,000',
      label: 'LICENSED USERS',
      prefix: 'CERTIFIED OVER',
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      value: '7,000',
      label: 'HIGH POTENTIALS',
      prefix: 'PREDICTED OVER',
    },
    {
      icon: <Briefcase className="h-8 w-8" />,
      value: '70,000',
      label: 'PROFESSIONALS',
      prefix: 'ASSESSED OVER',
    },
    {
      icon: <FileText className="h-8 w-8" />,
      value: '100,000',
      label: 'ASSESSMENTS',
      prefix: 'DELIVERED OVER',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6
      },
    },
  };

  return (
    <section
      ref={ref as any}
      className={`relative overflow-hidden py-16 sm:py-20 px-4 sm:px-6 lg:px-8 ${className}`}
      style={{
        background: 'linear-gradient(135deg, #0f3f6f 0%, #145598 50%, #1a6bb8 100%)',
      }}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-indigo-500/5 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={containerVariants}
        >
          {/* Title */}
          <motion.div variants={itemVariants} className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Optimal By Numbers
            </h2>
          </motion.div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 sm:gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="flex flex-col items-center text-center px-8 sm:px-10 py-6 sm:py-7 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300"
              >
                {/* Icon */}
                <div className="mb-4 p-3 rounded-full bg-white/10 border border-white/20">
                  <div className="text-white">{stat.icon}</div>
                </div>

                {/* Value */}
                <div className="mb-2">
                  <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
                    {stat.value}
                  </span>
                </div>

                {/* Label */}
                <div className="space-y-1">
                  {stat.prefix && (
                    <p className="text-xs sm:text-sm font-semibold text-white/80 uppercase tracking-wider">
                      {stat.prefix}
                    </p>
                  )}
                  <p className="text-sm sm:text-base font-semibold text-white uppercase tracking-wider">
                    {stat.label}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default StatisticsSection;