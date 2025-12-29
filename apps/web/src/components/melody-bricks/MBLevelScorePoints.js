import React, { useState, useEffect } from 'react';
import eventEmitter from '@shared/utils/eventEmitter';

const MBLevelScorePoints = ({ visualCom }) => {
  const [correctCount, setCorrectCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [rowsCleared, setRowsCleared] = useState(0);
  const [bonuses, setBonuses] = useState(0);

  useEffect(() => {
    const handleRowsClearedUpdate = (data) => {
      setRowsCleared(data.totalRowsCleared);
      setBonuses(data.totalBonuses || 0);
    };

    eventEmitter.on('totalRowsClearedUpdate', handleRowsClearedUpdate);

    return () => {
      eventEmitter.off('totalRowsClearedUpdate', handleRowsClearedUpdate);
    };
  }, []);

  useEffect(() => {
    if (visualCom) {
      const handleAccuracyUpdate = (data) => {
        const newPercentage = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
        setCorrectCount(data.correct);
        setTotalCount(data.total);
        setPercentage(newPercentage);
      };

      eventEmitter.on('accuracyUpdate', handleAccuracyUpdate);

      return () => {
        eventEmitter.off('accuracyUpdate', handleAccuracyUpdate);
      };
    }
  }, [visualCom]);

  // Calculate points: correct answers × percentage
  const accuracyPoints = correctCount * percentage;
  
  // Calculate row points: 500 for every row cleared + 500 for every bonus
  const rowPoints = (rowsCleared * 500) + (bonuses * 500);
  
  // Calculate total points
  const totalPoints = accuracyPoints + rowPoints;

  return (
    <div className="mb-level-score-points bg-gray-800 text-white p-2 rounded-lg border border-gray-600">
      <div className="text-center">
        <div className="text-xs font-medium text-gray-300 mb-0">
          Points
        </div>
        <div className="text-xl font-bold text-white">
          {totalPoints}
        </div>
      </div>
    </div>
  );
};

export default MBLevelScorePoints;

