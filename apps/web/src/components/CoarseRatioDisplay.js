'use client';

import React, { useEffect, useState } from 'react';
import eventEmitter from '@shared/utils/eventEmitter';

const CoarseRatioDisplay = ({ visualCom }) => {
  const [correctCount, setCorrectCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    if (visualCom) {
      const handleRatioUpdate = (ratioData) => {
        const { correct, total } = ratioData;
        const newPercentage = total > 0 ? Math.round((correct / total) * 100) : 0;
        setCorrectCount(correct);
        setTotalCount(total);
        setPercentage(newPercentage);
        // Update the module-level stats for other components to access
        updateCurrentStats(correct, total, newPercentage);
      };

      eventEmitter.on('updateCoarseRatio', handleRatioUpdate);

      return () => {
        eventEmitter.off('updateCoarseRatio', handleRatioUpdate);
      };
    }
  }, [visualCom]);

  // Calculate points: correct answers × percentage
  const points = correctCount * percentage;

  return (
    <div
      className="
        relative
        text-center
        bg-white/80
        border-2 border-green-700
        rounded-lg
        shadow-sm
        overflow-hidden
        h-16
        w-48
        flex flex-col items-center justify-center
        px-4
        py-2
      "
    >
      {visualCom && (
        <>
          <h1 className="text-base font-semibold truncate leading-none text-green-800">
            {correctCount}/{totalCount} ⇒ {percentage}%
          </h1>
          <div className="text-sm text-green-700 leading-tight mt-1">
            <span className="font-bold">{points}</span> points
          </div>
        </>
      )}
    </div>
  );
};

// Create a module-level variable to store the current stats
let currentSessionStats = { correctCount: 0, totalCount: 0, percentage: 0 };

// Update the stats whenever the component updates
const updateCurrentStats = (correct, total, percentage) => {
  currentSessionStats = { correctCount: correct, totalCount: total, percentage };
};

// Export getter function for other components to use
export const getCurrentSessionStats = () => {
  return {
    correctAnswers: currentSessionStats.correctCount,
    totalAnswers: currentSessionStats.totalCount,
    percentage: currentSessionStats.percentage
  };
};

export default CoarseRatioDisplay; 