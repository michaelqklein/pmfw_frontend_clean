// /src/components/PerformancePlot.jsx
'use client';
import { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';

export default function AnalyticsPlot({ performanceData }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!performanceData) return;

    const streaks = calculateStreaks(performanceData.lastTen);
    const labels = streaks.map((_, i) => `Interval ${i + 1}`);

    const trace = {
      x: labels,
      y: streaks,
      type: 'bar',
      marker: { color: 'orange' },
    };

    const layout = {
      title: 'Current Streaks per Interval',
      xaxis: { title: 'Interval' },
      yaxis: { title: 'Streak Length', dtick: 1 },
      margin: { t: 40, b: 40, l: 40, r: 10 },
    };

    Plotly.newPlot(containerRef.current, [trace], layout);

    return () => Plotly.purge(containerRef.current);
  }, [performanceData]);

  return <div ref={containerRef} style={{ width: '100%', height: '400px' }} />;
}

function calculateStreaks(lastTenArray) {
  return lastTenArray.map((attempts) => {
    let streak = 0;
    for (let i = attempts.length - 1; i >= 0; i--) {
      if (attempts[i] === true) streak++;
      else break;
    }
    return streak;
  });
}
