import React, { useEffect, useState } from 'react';
import '@/src/styles/kci/Shatter.css';
import Delaunator from 'delaunator';

const generateRandomPoints = (count) => {
  const edgePoints = Math.floor(count * 0.4); // 40% of points on edges
  const innerPoints = count - edgePoints; // Remaining points inside the screen
  const points = [];

  // Generate edge points
  for (let i = 0; i < edgePoints; i++) {
    const position = Math.random();
    if (Math.random() < 0.5) {
      // Randomly place on top or bottom edge
      points.push({
        x: position * window.innerWidth,
        y: Math.random() < 0.5 ? 0 : window.innerHeight,
      });
    } else {
      // Randomly place on left or right edge
      points.push({
        x: Math.random() < 0.5 ? 0 : window.innerWidth,
        y: position * window.innerHeight,
      });
    }
  }

  // Generate inner points
  for (let i = 0; i < innerPoints; i++) {
    points.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
    });
  }

  return points;
};

const Shatter = ({ pointCount = 100 }) => {
  const [triangles, setTriangles] = useState([]);

  useEffect(() => {
    const points = generateRandomPoints(pointCount).map(({ x, y }) => [x, y]);
    const delaunay = Delaunator.from(points);
    const triangles = [];

    for (let i = 0; i < delaunay.triangles.length; i += 3) {
      const triangle = [
        points[delaunay.triangles[i]],
        points[delaunay.triangles[i + 1]],
        points[delaunay.triangles[i + 2]],
      ];
      triangles.push(triangle);
    }

    setTriangles(triangles);
  }, [pointCount]);

  return (
    <div className="shatter-container">
      {triangles.map((triangle, index) => (
        <React.Fragment key={index}>
          <div
            className="shatter-line"
            style={{
              width: `${Math.hypot(
                triangle[1][0] - triangle[0][0],
                triangle[1][1] - triangle[0][1]
              )}px`,
              transform: `translate(${triangle[0][0]}px, ${triangle[0][1]}px) rotate(${Math.atan2(
                triangle[1][1] - triangle[0][1],
                triangle[1][0] - triangle[0][0]
              )}rad)`,
            }}
          />
          <div
            className="shatter-line"
            style={{
              width: `${Math.hypot(
                triangle[2][0] - triangle[1][0],
                triangle[2][1] - triangle[1][1]
              )}px`,
              transform: `translate(${triangle[1][0]}px, ${triangle[1][1]}px) rotate(${Math.atan2(
                triangle[2][1] - triangle[1][1],
                triangle[2][0] - triangle[1][0]
              )}rad)`,
            }}
          />
          <div
            className="shatter-line"
            style={{
              width: `${Math.hypot(
                triangle[2][0] - triangle[0][0],
                triangle[2][1] - triangle[0][1]
              )}px`,
              transform: `translate(${triangle[2][0]}px, ${triangle[2][1]}px) rotate(${Math.atan2(
                triangle[0][1] - triangle[2][1],
                triangle[0][0] - triangle[2][0]
              )}rad)`,
            }}
          />
        </React.Fragment>
      ))}
    </div>
  );
};

export default Shatter;
