// /src/performance/performanceData.js

const NUM_INTERVALS = 36;
export const MAX_ATTEMPTS = 25; // Central constant for max attempts

// add confusion matrix for neuroZart

export function createPerformanceData() {
  return {
    intervals: Array.from({ length: NUM_INTERVALS }, () => ({
      attempts: [], // up to MAX_ATTEMPTS most recent (1 = correct, 0 = incorrect)
      accuracy: { correct: 0, wrong: 0 }, // object with two integer counts
    })),
  };
}
