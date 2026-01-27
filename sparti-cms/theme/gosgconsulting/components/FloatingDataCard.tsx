"use client";

import React from 'react';
import DonutChart from './DonutChart';
import MiniChart from './MiniChart';

interface FloatingDataCardProps {
  type: 'audience' | 'sales';
  position: { top?: string; bottom?: string; left?: string; right?: string };
}

const FloatingDataCard: React.FC<FloatingDataCardProps> = ({ type, position }) => {
  if (type === 'audience') {
    const audienceData = [
      { label: 'Segment 1', value: 39, color: '#9b87f5' },
      { label: 'Segment 2', value: 31, color: '#36d399' },
      { label: 'Segment 3', value: 17, color: '#fbbf24' },
      { label: 'Segment 4', value: 9, color: '#F94E40' },
      { label: 'Other', value: 4, color: '#e5e7eb' },
    ];

    return (
      <div
        className="absolute bg-white rounded-xl shadow-lg p-4 z-20 hidden md:block"
        style={{
          top: position.top,
          bottom: position.bottom,
          left: position.left,
          right: position.right,
          minWidth: '180px',
        }}
      >
        <h3 className="text-sm font-semibold text-gray-800 mb-2">Our Audience</h3>
        <div className="flex items-center gap-3">
          <DonutChart data={audienceData} size={60} />
          <div className="flex-1 space-y-1">
            {audienceData.slice(0, 4).map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-gray-600">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="absolute bg-white rounded-xl shadow-lg p-4 z-20 hidden md:block"
      style={{
        top: position.top,
        bottom: position.bottom,
        left: position.left,
        right: position.right,
        minWidth: '200px',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-xs text-gray-500 mb-1">Today's Sale</p>
          <p className="text-2xl font-bold text-gray-800">$8,549</p>
          <div className="flex items-center gap-1 mt-1">
            <MiniChart type="line" trend="up" color="#10b981" />
            <span className="text-xs text-green-500">+20% This Week</span>
          </div>
        </div>
        <div className="shrink-0">
          <MiniChart type="bar" />
        </div>
      </div>
    </div>
  );
};

export default FloatingDataCard;
