import React, { useState, useEffect } from 'react';
import eventEmitter from '@shared/utils/eventEmitter';

const BleepCounter = ({ visualCom, isMobile = false }) => {
  const [bleeps, setBleeps] = useState(0);
  const [showBleepAnimation, setShowBleepAnimation] = useState(false);

  useEffect(() => {
    const handleRowsClearedUpdate = (data) => {
      // Check if there was a perfect row (bonus) in this update
      if (data.latestBonus) {
        // Add 5 bleeps for each perfect row
        setBleeps(prevBleeps => prevBleeps + 5);
        
        // Show bleep animation
        setShowBleepAnimation(true);
        setTimeout(() => setShowBleepAnimation(false), 1500);
      }
    };

    // Listen for rows cleared updates via mitt
    eventEmitter.on('totalRowsClearedUpdate', handleRowsClearedUpdate);

    return () => {
      eventEmitter.off('totalRowsClearedUpdate', handleRowsClearedUpdate);
    };
  }, []);

  // Reset bleeps when starting a new game (when rows reset to 0)
  useEffect(() => {
    // Listen for game start events (when rows reset to 0)
    const handleRowsReset = (data) => {
      if (data.totalRowsCleared === 0) {
        setBleeps(0);
      }
    };

    eventEmitter.on('totalRowsClearedUpdate', handleRowsReset);

    return () => {
      eventEmitter.off('totalRowsClearedUpdate', handleRowsReset);
    };
  }, []);

  return (
    <div className={`mb-bleep-counter bg-gray-800 text-white ${isMobile ? 'p-2' : 'p-3'} rounded-lg border border-gray-600`}>
      <div className="text-center relative">
        
        {/* Bleeps Section */}
        <div className={isMobile ? 'mb-1' : 'mb-3'}>
          <div className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-300 ${isMobile ? 'mb-0' : 'mb-1'}`}>
            💰 {isMobile ? 'Bleeps' : 'Bleeps Earned'}
          </div>
          <div className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold text-yellow-400 ${showBleepAnimation ? 'animate-pulse scale-110' : ''} transition-all duration-300`}>
            {bleeps}
          </div>
        </div>

        {/* Bleep Animation Overlay */}
        {showBleepAnimation && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className={`text-yellow-400 font-bold ${isMobile ? 'text-sm' : 'text-lg'} animate-bounce`}>
              💰 +5 BLEEPS!
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BleepCounter; 