'use client';

import React, { useMemo } from 'react';
import levelsData from '@data/melodyBricks/levels.json';
import { getOverallProgress, getTotalBleeps } from '@/src/performance/melodyBricks/levelProgressData';

export default function ProgressView({ levelProgress }) {
  const totalLevels = useMemo(() => {
    try {
      return levelsData.levels.filter(l => l.active !== false).length;
    } catch {
      return 0;
    }
  }, []);

  const overall = getOverallProgress(levelProgress || {});
  const totalBleeps = getTotalBleeps(levelProgress || {});

  // Calculate total score from all active completed levels
  const totalScore = useMemo(() => {
    if (!levelProgress) return 0;
    return levelsData.levels
      .filter(level => level.active !== false)
      .reduce((sum, level) => {
        const data = levelProgress[level.id];
        return sum + (data?.highestScore || 0);
      }, 0);
  }, [levelProgress]);

  return (
    <div className="w-full min-h-[700px] p-6 flex justify-center">
      <div className="w-full max-w-3xl space-y-4">
        <div className="bg-gray-900 border-2 border-emerald-600 rounded-xl p-5 text-center">
          <div className="text-sm text-gray-300 font-semibold">Total Score</div>
          <div className="text-3xl font-extrabold text-emerald-400">{totalScore.toLocaleString()}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-900 border-2 border-gray-600 rounded-xl p-5 text-center">
            <div className="text-sm text-gray-300 font-semibold">💰 Total Bleeps</div>
            <div className="text-2xl font-bold text-yellow-400">{totalBleeps.toLocaleString()}</div>
          </div>
          <div className="bg-gray-900 border-2 border-gray-600 rounded-xl p-5 text-center">
            <div className="text-sm text-gray-300 font-semibold">Progress</div>
            <div className="text-2xl font-bold text-white">{overall.progressPercentage}%</div>
            <div className="mt-1 text-xs text-gray-400">{overall.completedLevels}/{totalLevels} levels</div>
          </div>
        </div>

        <div className="bg-gray-900 border-2 border-gray-600 rounded-xl p-5">
          <div className="text-sm text-gray-300 mb-2">Completion</div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-emerald-500 h-2 rounded-full"
              style={{ width: `${overall.progressPercentage || 0}%` }}
            />
          </div>
          <div className="mt-3 text-center text-xs text-gray-400">
            {overall.completedLevels === overall.totalLevels
              ? "🎉 All levels completed! You're a melody master!"
              : `${Math.max(0, totalLevels - (overall.completedLevels || 0))} levels remaining`}
          </div>
        </div>
      </div>
    </div>
  );
}


