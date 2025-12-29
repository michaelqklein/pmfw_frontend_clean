import React from 'react';
import { MAX_ATTEMPTS } from '@/src/performance/performanceData';

export default function VerticalPercentBar({ correct, wrong, height = 100, width = 20 }) {
  // Calculate percentages based on MAX_ATTEMPTS (25) for consistent visualization
  const correctPercent = (correct / MAX_ATTEMPTS) * 100;
  const wrongPercent = (wrong / MAX_ATTEMPTS) * 100;
  const emptyPercent = ((MAX_ATTEMPTS - correct - wrong) / MAX_ATTEMPTS) * 100;

  return (
    <div
      style={{
        height,
        width,
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #333',
        background: '#eee',
        overflow: 'hidden'
      }}
    >
      <div style={{ height: `${emptyPercent}%`, background: '#f0f0f0', width: '100%' }} />
      <div style={{ height: `${wrongPercent}%`, background: 'red', width: '100%' }} />
      <div style={{ height: `${correctPercent}%`, background: 'green', width: '100%' }} />
    </div>
  );
} 