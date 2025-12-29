import React, { useRef, useEffect } from "react";
import eventEmitter from '@shared/utils/eventEmitter';
import GameCanvasV2 from '../../canvases/melody-bricks/gameCanvasV2.js';

function GameCanvasComponentV2({ currentLevel = null, isMobile = false }) {
  const canvasRef = useRef(null);
  const gameInstanceRef = useRef(null);

  // Initialize the pure JS game engine
  useEffect(() => {
    if (canvasRef.current) {
      gameInstanceRef.current = new GameCanvasV2(canvasRef.current, {
        eventEmitter,
        currentLevel
      });
    }

    // Cleanup function
    return () => {
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy();
      }
    };
  }, []); // Only run once on mount

  // Update game when currentLevel changes
  useEffect(() => {
    if (gameInstanceRef.current && currentLevel) {
      gameInstanceRef.current.updateLevel(currentLevel);
    }
  }, [currentLevel]);

  // Calculate dynamic dimensions based on current level
  const GRID_COLS = currentLevel ? 
    (currentLevel.type === "12 tone wall" ? 13 : currentLevel.intervals.length + 1) : 4;
  const GRID_ROWS = currentLevel && currentLevel.type === "12 tone wall" ? 24 : 12;
  
  // Mobile scaling - 0.82 of original size
  const scaleFactor = isMobile ? 0.82 : 1;
  // For "12 tone wall" type, use half-sized cells (25px base width)
  const baseWidth = currentLevel && currentLevel.type === "12 tone wall" ? 25 : 50;
  const baseHeight = 600; // Base height for all levels
  
  // Apply vertical scale to match React Native aspect ratio (0.75)
  const scaleY = 0.75;
  
  const canvasWidth = GRID_COLS * baseWidth * scaleFactor;
  const canvasHeight = baseHeight * scaleY * scaleFactor; // Apply both vertical scaling and mobile scaling

  return (
    <div className="canvas-container flex justify-center">
      <canvas 
        ref={canvasRef} 
        className="border border-gray-400 bg-black"
        style={{ 
          width: `${canvasWidth}px`, 
          height: `${canvasHeight}px`
        }}
      />
    </div>
  );
}

export default GameCanvasComponentV2; 