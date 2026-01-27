"use client";

import React from 'react';

interface DonutChartProps {
  data: Array<{ label: string; value: number; color: string }>;
  size?: number;
}

const DonutChart: React.FC<DonutChartProps> = ({ data, size = 80 }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = size / 2 - 5;
  const circumference = 2 * Math.PI * radius;
  let currentOffset = circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100;
          const strokeDasharray = (percentage / 100) * circumference;
          const strokeDashoffset = currentOffset;
          currentOffset -= strokeDasharray;

          return (
            <circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={item.color}
              strokeWidth="8"
              strokeDasharray={`${strokeDasharray} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-xs font-semibold text-gray-700">
          {total}%
        </div>
      </div>
    </div>
  );
};

export default DonutChart;
