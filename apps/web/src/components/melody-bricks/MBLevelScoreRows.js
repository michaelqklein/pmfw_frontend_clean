import React, { useState, useEffect } from 'react';
import eventEmitter from '@shared/utils/eventEmitter';

const MBLevelScoreRows = ({ visualCom }) => {
  const [rowsCleared, setRowsCleared] = useState(0);
  const [requiredRows, setRequiredRows] = useState(5);
  const [showBonusAnimation, setShowBonusAnimation] = useState(false);

  useEffect(() => {
    const handleRowsClearedUpdate = (data) => {
      setRowsCleared(data.totalRowsCleared);
      setRequiredRows(data.requiredRows || 5);
      
      // Show bonus animation if there was a bonus
      if (data.latestBonus) {
        setShowBonusAnimation(true);
        setTimeout(() => setShowBonusAnimation(false), 1500);
      }
    };

    eventEmitter.on('totalRowsClearedUpdate', handleRowsClearedUpdate);

    return () => {
      eventEmitter.off('totalRowsClearedUpdate', handleRowsClearedUpdate);
    };
  }, []);

  return (
    <div className="mb-level-score-rows bg-gray-800 text-white p-2 rounded-lg border border-gray-600 relative">
      <div className="text-center">
        <div className="text-xs font-medium text-gray-300 mb-0">
          Rows
        </div>
        <div className={`text-lg font-bold text-blue-400 ${showBonusAnimation ? 'animate-pulse scale-110' : ''} transition-all duration-300`}>
          {rowsCleared}/{requiredRows}
        </div>
      </div>

      {/* Bonus Animation Overlay */}
      {showBonusAnimation && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-yellow-400 font-bold text-sm animate-bounce">
            🎉 PERFECT!
          </div>
        </div>
      )}
    </div>
  );
};

export default MBLevelScoreRows;

