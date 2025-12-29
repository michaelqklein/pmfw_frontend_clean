import React, { useState, useEffect } from 'react';
import eventEmitter from '@shared/utils/eventEmitter';

const MBLevelScore = ({ visualCom, isMobile = false }) => {
  const [rowsCleared, setRowsCleared] = useState(0);
  const [requiredRows, setRequiredRows] = useState(5);
  const [bonuses, setBonuses] = useState(0);
  const [showBonusAnimation, setShowBonusAnimation] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [gameScoreEmitted, setGameScoreEmitted] = useState(false);

  useEffect(() => {
    const handleRowsClearedUpdate = (data) => {
      setRowsCleared(data.totalRowsCleared);
      setBonuses(data.totalBonuses || 0);
      setRequiredRows(data.requiredRows || 5);
      
      // Reset game score emission flag when starting a new game (rows reset to 0)
      if (data.totalRowsCleared === 0) {
        setGameScoreEmitted(false);
      }
      
      // Show bonus animation if there was a bonus
      if (data.latestBonus) {
        setShowBonusAnimation(true);
        setTimeout(() => setShowBonusAnimation(false), 1500);
      }
    };

    // Listen for rows cleared updates via mitt
    eventEmitter.on('totalRowsClearedUpdate', handleRowsClearedUpdate);

    return () => {
      eventEmitter.off('totalRowsClearedUpdate', handleRowsClearedUpdate);
    };
  }, []);

  useEffect(() => {
    if (visualCom) {
      // Listen for accuracy updates via mitt only
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

  // Listen for game end events and emit the real score
  useEffect(() => {
    const handleGameEnd = (gameEndData) => {
      console.log(`📊 MBLevelScore: Game ended event received:`, gameEndData);
      console.log(`📊 MBLevelScore: Local state - totalPoints: ${totalPoints}, rowsCleared: ${rowsCleared}, correctCount: ${correctCount}, percentage: ${percentage}`);
      console.log(`📊 MBLevelScore: Game data - rowsCleared: ${gameEndData.rowsCleared}, bonuses: ${gameEndData.bonuses}`);
      console.log(`📊 MBLevelScore: gameScoreEmitted flag: ${gameScoreEmitted}`);
      
      // Only emit once per game
      if (!gameScoreEmitted) {
        // Calculate final score using the ACTUAL game end data, not local state
        const finalAccuracyPoints = correctCount * percentage;
        const finalRowPoints = (gameEndData.rowsCleared * 500) + (gameEndData.bonuses * 500);
        const finalTotalPoints = finalAccuracyPoints + finalRowPoints;
        
        console.log(`📊 MBLevelScore: Final calculation - Accuracy: ${finalAccuracyPoints} (${correctCount} * ${percentage}%), Rows: ${finalRowPoints} (${gameEndData.rowsCleared} * 500 + ${gameEndData.bonuses} * 500), Total: ${finalTotalPoints}`);
        
        // Emit score data combined with game end data
        eventEmitter.emit('gameFinished', {
          // Game result data
          result: gameEndData.result,
          reason: gameEndData.reason,
          levelId: gameEndData.levelId,
          levelName: gameEndData.levelName,
          rowsCleared: gameEndData.rowsCleared,
          requiredRows: gameEndData.requiredRows,
          duration: gameEndData.duration,
          correctAnswers: gameEndData.correctAnswers,
          totalAnswers: gameEndData.totalAnswers,
          bonuses: gameEndData.bonuses,
          // Score data calculated from FINAL game state
          totalPoints: finalTotalPoints,
          accuracyPoints: finalAccuracyPoints,
          rowPoints: finalRowPoints,
          percentage: percentage,
          correctCount: correctCount,
          totalCount: totalCount,
          // Completion status
          completed: gameEndData.result === 'won'
        });
        setGameScoreEmitted(true);
        
      } else {
        console.log(`📊 MBLevelScore: Skipping emission - already emitted for this game`);
      }
    };

    eventEmitter.on('gameEnded', handleGameEnd);

    return () => {
      eventEmitter.off('gameEnded', handleGameEnd);
    };
  }, [correctCount, percentage, totalCount, gameScoreEmitted]);

  return (
    <div className={`mb-level-score bg-gray-800 text-white ${isMobile ? 'p-2' : 'p-3'} rounded-lg border border-gray-600`}>
      <div className="text-center relative">
        
        {/* Mobile Version - Simplified */}
        {isMobile && visualCom && (
          <>
            {/* Rows Cleared Section */}
            <div className="mb-2">
              <div className="text-xs font-medium text-gray-300 mb-0">
                Rows
              </div>
              <div className="text-lg font-bold text-blue-400">
                {rowsCleared}/{requiredRows}
              </div>
            </div>

            {/* Total Points */}
            <div className="border-t border-gray-600 pt-2">
              <div className="text-xs font-medium text-gray-300 mb-0">
                Points
              </div>
              <div className="text-xl font-bold text-white">
                {totalPoints}
              </div>
            </div>
          </>
        )}

        {/* Desktop Version - Full */}
        {!isMobile && visualCom && (
          <>
            <div className="mb-3">
              <div className="text-sm font-medium text-gray-300 mb-1">
                Accuracy
              </div>
              <div className="text-base font-semibold text-green-400">
                {correctCount}/{totalCount} ⇒ {percentage}%
              </div>
            </div>

            {/* First Divider */}
            <div className="border-t border-gray-600 pt-3">
              {/* Rows Cleared Section */}
              <div className="mb-3">
                <div className="text-sm font-medium text-gray-300 mb-1">
                  Rows Cleared
                </div>
                <div className="text-2xl font-bold text-blue-400">
                  {rowsCleared}/{requiredRows}
                </div>
              </div>

              {/* Perfect Clears Section */}
              <div className="mb-3">
                <div className="text-xs font-medium text-gray-400 mb-1">
                  Perfect Clears
                </div>
                <div className={`text-lg font-bold text-yellow-400 ${showBonusAnimation ? 'animate-pulse scale-110' : ''} transition-all duration-300`}>
                  {bonuses}
                </div>
              </div>

              {/* Second Divider and Points Section */}
              <div className="border-t border-gray-600 pt-3">
                {/* Accuracy Points */}
                <div className="mb-3">
                  <div className="text-xs font-medium text-gray-400 mb-1">
                    Accuracy Points
                  </div>
                  <div className="text-lg font-bold text-green-400">
                    {accuracyPoints}
                  </div>
                </div>
                
                {/* Row Points */}
                <div className="mb-3">
                  <div className="text-xs font-medium text-gray-400 mb-1">
                    Row Points
                  </div>
                  <div className="text-lg font-bold text-blue-400">
                    {rowPoints}
                  </div>
                </div>
                
                {/* Total Points */}
                <div>
                  <div className="text-lg font-medium text-gray-300 mb-1">
                    Total Points
                  </div>
                  <div className="text-3xl font-bold text-white">
                    {totalPoints}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Show rows and bonuses even when visualCom is false */}
        {!visualCom && (
          <>
            {/* Rows Cleared Section */}
            <div className="mb-3">
              <div className="text-sm font-medium text-gray-300 mb-1">
                Rows Cleared
              </div>
              <div className="text-2xl font-bold text-blue-400">
                {rowsCleared}/{requiredRows}
              </div>
            </div>

            {/* Perfect Clears Section */}
            <div className="mb-3">
              <div className="text-xs font-medium text-gray-400 mb-1">
                Perfect Clears
              </div>
              <div className={`text-lg font-bold text-yellow-400 ${showBonusAnimation ? 'animate-pulse scale-110' : ''} transition-all duration-300`}>
                {bonuses}
              </div>
            </div>
          </>
        )}

        {/* Bonus Animation Overlay */}
        {showBonusAnimation && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-yellow-400 font-bold text-lg animate-bounce">
              🎉 PERFECT!
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MBLevelScore; 