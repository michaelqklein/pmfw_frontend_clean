import React, { useEffect, useState } from 'react';
import VerticalPercentBar from './VerticalPercentBar';
import { getUIAnalyticsVector } from '@/src/engines/audiationStudio';
import eventEmitter from '@shared/utils/eventEmitter';
import { MAX_ATTEMPTS } from '@/src/performance/performanceData';

const intervalLabels = [
  'desc perfect 8', 'desc Maj 7', 'desc min 7', 'desc Maj 6', 'desc min 6', 'desc perfect 5', 'desc Tritone', 'desc perfect 4', 'desc Maj 3', 'desc min 3', 'desc Maj 2', 'desc min 2',
  'asc min 2', 'asc Maj 2', 'asc min 3', 'asc Maj 3', 'asc perfect 4', 'asc Tritone', 'asc perfect 5', 'asc min 6', 'asc Maj 6', 'asc min 7', 'asc Maj 7', 'asc perfect 8',
  'harm min 2', 'harm Maj 2', 'harm min 3', 'harm Maj 3', 'harm perfect 4', 'harm Tritone', 'harm perfect 5', 'harm min 6', 'harm Maj 6', 'harm min 7', 'harm Maj 7', 'harm perfect 8'
];

const shortLabels = [
  'p8', 'M7', 'm7', 'M6', 'm6', 'p5', 'TT', 'p4', 'M3', 'm3', 'M2', 'm2',
  'm2', 'M2', 'm3', 'M3', 'p4', 'TT', 'p5', 'm6', 'M6', 'm7', 'M7', 'p8',
  'm2', 'M2', 'm3', 'M3', 'p4', 'TT', 'p5', 'm6', 'M6', 'm7', 'M7', 'p8'
];

export default function IntervalAccuracyTable() {
  // Array of 36 objects: { correct, wrong }
  const [barData, setBarData] = useState(Array(36).fill().map(() => ({ correct: 0, wrong: 0 })));
  const [hoveredIdx, setHoveredIdx] = useState(null);

  useEffect(() => {
    let lastEventTime = 0;
    
    function handleUpdate(event) {
      // Prevent duplicate events within 50ms
      const now = Date.now();
      if (now - lastEventTime < 50) return;
      lastEventTime = now;
      
      const { interval, correct, wrong } = event;
      
      console.log('🎯 IntervalAccuracyTable: Received update:', { interval, correct, wrong });
      
      setBarData(prev => {
        const updated = [...prev];
        updated[interval] = { correct, wrong };
        console.log('🎯 IntervalAccuracyTable: Updated barData for interval', interval, ':', updated[interval]);
        return updated;
      });
    }
    
    eventEmitter.on('updateGUIliveAnalytics', handleUpdate);
    
    // Initialize component with current analytics data
    const currentAnalytics = getUIAnalyticsVector();
    setBarData(currentAnalytics);
    
    return () => {
      eventEmitter.off('updateGUIliveAnalytics', handleUpdate);
    };
  }, []);

  const renderBarSection = (startIdx, endIdx, title) => {
    const sectionData = barData.slice(startIdx, endIdx);
    return (
      <div className="flex flex-col items-center mx-6">
        {/* Section Title */}
        <h3 className="text-sm font-semibold mb-3 text-center">{title}</h3>
        
        {/* Bars Container */}
        <div className="flex flex-row justify-center items-end overflow-visible">
          {sectionData.map((data, sectionIdx) => {
            const actualIdx = startIdx + sectionIdx;
            const total = data.correct + data.wrong;
            const percent = total ? (data.correct / total) * 100 : 0;
            const accuracyFraction = `${data.correct}/${total}`;
            return (
              <div
                key={actualIdx}
                className="flex flex-col items-center relative w-[32px] min-w-[32px] h-[140px] mx-1"
                onMouseEnter={() => {
                  setHoveredIdx(actualIdx);
                }}
                onMouseLeave={() => setHoveredIdx(null)}
                onTouchStart={() => {
                  setHoveredIdx(actualIdx);
                }}
                onTouchEnd={() => {
                  setTimeout(() => setHoveredIdx(null), 2000);
                }}
              >
                {/* Tooltip */}
                {hoveredIdx === actualIdx && (
                  <div className="absolute -top-[55px] left-1/2 -translate-x-1/2 bg-yellow-50 text-black px-3 py-1.5 rounded-md text-sm whitespace-nowrap z-[9999] border border-yellow-500 pointer-events-none">
                    {intervalLabels[actualIdx]}: {percent.toFixed(0)}% ({accuracyFraction})
                  </div>
                )}
                <VerticalPercentBar correct={data.correct} wrong={data.wrong} height={100} width={24} />
                <div className="text-xs mt-1">{shortLabels[actualIdx]}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="overflow-x-auto w-full pt-[60px] px-2 min-w-full scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100" style={{
      scrollbarWidth: 'thin',
      scrollbarColor: '#9CA3AF #F3F4F6'
    }}>
      <div className="flex flex-row justify-start items-start space-x-4 min-w-max">
        {renderBarSection(0, 12, "Descending Intervals")}
        {renderBarSection(12, 24, "Ascending Intervals")}
        {renderBarSection(24, 36, "Harmonic Intervals")}
      </div>
    </div>
  );
} 