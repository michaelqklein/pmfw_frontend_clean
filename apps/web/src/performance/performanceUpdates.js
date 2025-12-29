// /src/performance/performanceUpdates.js

import { MAX_ATTEMPTS } from './performanceData';

export function updateIntervalAttempt(data, intervalIndex, isCorrect) {
  console.log('🎯 updateIntervalAttempt: Called with:', { intervalIndex, isCorrect });
  
  const interval = data.intervals[intervalIndex];
  // Add new attempt (1 for correct, 0 for incorrect)
  if (interval.attempts.length >= MAX_ATTEMPTS) {
    interval.attempts.shift(); // Remove oldest
  }
  interval.attempts.push(isCorrect ? 1 : 0);

  // Update accuracy object
  const totalCorrect = interval.attempts.reduce((sum, val) => sum + val, 0);
  const totalWrong = interval.attempts.length - totalCorrect;
  
  interval.accuracy = {
    correct: totalCorrect,
    wrong: totalWrong
  };
  
  console.log('🎯 updateIntervalAttempt: Updated interval', intervalIndex, ':', interval.accuracy);
}
