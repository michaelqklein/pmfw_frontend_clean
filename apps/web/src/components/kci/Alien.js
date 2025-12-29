import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import '@/src/styles/kci/Alien.css';

const Alien = ({ scaleSpeed, alienColor, alienSize, currentAlien, paused }) => {
  const [toggle, setToggle] = useState(false);
  const [randomRotation] = useState(
    currentAlien.rotation === 1 
      ? Math.floor(Math.random() * 181) - 90  // Random number between -90 and 90
      : 0  // Use 0 otherwise
  );

  const controls = useAnimation();  // Animation control hook

  useEffect(() => {
    let interval;

    if (!paused) {
      interval = setInterval(() => {
        setToggle(prevToggle => !prevToggle);
      }, 500); // Change shape every 500ms
    }

    // Clear the interval when component unmounts or when paused is true
    return () => clearInterval(interval);
  }, [paused]);  // Restart interval when paused changes

  useEffect(() => {
    if (paused) {
      controls.stop();  // Pause the animation when paused is true
    } else {
      // Start or resume the animation
      controls.start({
        scale: alienSize,
        x: currentAlien.x + (alienSize * 10 * currentAlien.rotation) + randomRotation,
        y: currentAlien.y + (alienSize * 2),
        rotate: randomRotation,  // Apply the random rotation
        transition: {
          duration: scaleSpeed,
          repeat: 1,
          repeatType: 'reverse'
        }
      });
    }
  }, [paused, controls, alienSize, currentAlien.x, currentAlien.y, currentAlien.rotation, randomRotation, scaleSpeed]);

  return (
    <motion.div
      className={`alien ${alienColor} ${toggle ? 'shape1' : 'shape3'}`}
      initial={{
        scale: 0.01,
        bottom: '10%', 
        left: '48.5%', 
      }}
      animate={controls}  // Use controls for manual animation
    ></motion.div>
  );
};

export default Alien;
