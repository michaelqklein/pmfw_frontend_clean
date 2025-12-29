import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import '@/src/styles/kci/KCI_StarField.css';


const generateRandomPosition = (radius) => {
  // Generate a random angle in radians
  const angle = Math.random() * 2 * Math.PI;
  // Random distance from the center, you can adjust this to control the spread
  const distance = radius + Math.random() * radius;

  // Convert polar coordinates (angle, distance) to Cartesian (x, y)
  const x = distance * Math.cos(angle);
  const y = distance * Math.sin(angle);

  return { x, y };
};

const KCI_StarField = ({ travelSpeed = 10, numberOfStars = 300, paused = false }) => {
  const [stars, setStars] = useState([]);
  const [renewStars, setRenewStars] = useState(false);
  const [starDate, setStarDate] = useState(Date.now());

  useEffect(() => {
    const newStars = Array.from({ length: numberOfStars }, (_, index) => {
      const { x, y } = generateRandomPosition(1000); // Adjust radius for the desired spread
      return {
        id: index,
        initialX: 0,
        initialY: 0,
        finalX: x,
        finalY: y,
        finalScale: Math.random() * 12,
        duration: Math.random() * (20 * travelSpeed) + 2, // Random duration between 2 and 5 seconds
        delay: Math.random() * 1, // Random initial delay up to 1 second
      };
    });
    setStars(newStars);
  }, [numberOfStars, travelSpeed]);

  return (
    <div className="new-starfield-container">
      {stars.map((star) => (
        <Star
          renewStars={renewStars}
          setRenewStars={setRenewStars}
          starDate={starDate}
          setStarDate={setStarDate}
          key={`${star.id}-${travelSpeed}-${starDate}`}
          initialX={star.initialX}
          initialY={star.initialY}
          finalX={star.finalX}
          finalY={star.finalY}
          finalScale={star.finalScale}
          duration={star.duration}
          delay={star.delay}
          paused={paused}  // Pass the paused prop to each star
        />
      ))}
    </div>
  );
};

const Star = ({ renewStars, setRenewStars, starDate, setStarDate, initialX, initialY, finalX, finalY, finalScale, duration, delay, paused }) => {
  const controls = useAnimation(); // Hook to control animation

  useEffect(() => {
    if (paused) {
      controls.stop();  // Pause the animation
      setRenewStars(true);
    } else {
      if (renewStars) {
        setStarDate(Date.now())
        setRenewStars(false);
      }
      controls.start({
        x: finalX,
        y: finalY,
        scale: finalScale,
        opacity: 1,
        transition: {
          duration: duration,
          delay: delay,
          ease: [0.9, 0.05, 0.1, 1], // Aggressive acceleration curve
          repeat: Infinity,
          repeatType: 'loop',
          repeatDelay: 0,
        },
      });
    }
  }, [paused, controls, finalX, finalY, finalScale, duration, delay]);

  return (
    <motion.div
      className="new-star"
      initial={{
        x: initialX,
        y: initialY,
        scale: 0.05,
        opacity: 1,
      }}
      animate={controls} // Control the animation using the controls
    />
  );
};

export default KCI_StarField;
