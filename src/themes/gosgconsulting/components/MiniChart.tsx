"use client";

import React from 'react';

interface MiniChartProps {
  type?: 'line' | 'bar';
  trend?: 'up' | 'down';
  color?: string;
}

const MiniChart: React.FC<MiniChartProps> = ({ type = 'line', trend = 'down', color = '#ef4444' }) => {
  if (type === 'line') {
    return (
      <svg width="24" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d={trend === 'down' ? "M0 0 L8 8 L16 4 L24 12" : "M0 12 L8 4 L16 8 L24 0"}
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg width="24" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="12" width="4" height="4" fill="#9b87f5" />
      <rect x="5" y="8" width="4" height="8" fill="#7E69AB" />
      <rect x="10" y="6" width="4" height="10" fill="#F94E40" />
      <rect x="15" y="10" width="4" height="6" fill="#36d399" />
      <rect x="20" y="4" width="4" height="12" fill="#fbbf24" />
    </svg>
  );
};

export default MiniChart;
