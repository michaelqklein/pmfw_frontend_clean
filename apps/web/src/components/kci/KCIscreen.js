

import React, { useEffect, useState } from 'react';
import FinalFire from './FinalFire.js';
import '@/src/styles/kci/KCIscreen.css';
import OverlayText from '@/src/components/OverlayText.js';
import Alien from './Alien';
import KCI_StarField from './KCI_StarField.jsx';
import eventEmitter from '@shared/utils/eventEmitter';

const KCIscreen = ({ 
  starField = true,
  visualCom,
  showOverlay,
  showAnimation,
  noteAlien,
  setNoteAlien,
  travelSpeed,
  trainingPaused }) => {
  const [alienNumber, setAlienNumber] = useState(0);
  const [currentAlien, setCurrentAlien] = useState({ "1": { "notes": 1 } });
  const [numberActive, setNumberActive] = useState(0);
  const [alienSize, setAlienSize] = useState(5);
  const [alienColor, setAlienColor] = useState('green');
  const [scaleSpeed, setScaleSpeed] = useState(10);
  const [isVisible, setIsVisible] = useState(false);
  const [monitorMessage, setMonitorMessage] = useState('');
  const [shoot, setShoot] = useState('off');
  const [fireInfo, setFireInfo] = useState({
    fireState: 'load',
    error: 0,
    numberNotes: 1,
    activeNotes: 0,
    targetX: 0,
    targetY: 0
  })

  // console.log("Screen, travelSpeed: ", travelSpeed);


  useEffect(() => {
    if (visualCom) {
      const handleMonitorMessageUpdate = (message) => {
        setMonitorMessage(message);
        setIsVisible(false); // Hide the message initially

        // Re-add the fade-in-out class after a short delay to trigger the animation
        setTimeout(() => {
          setIsVisible(true);
        }, 100); // Small delay to ensure reflow
      };

      const handleNoteAlien = (noteAlienValue) => {
        if (noteAlienValue === true)
          setNoteAlien(true);
        else
          setTimeout(() => {
            setNoteAlien(false);
          }, 500); // Adjust delay as needed to match animation duration
      };

      const handleAlienNumber = (alienNumberValue) => {
        setAlienNumber(alienNumberValue)
      }

      const handleFireInfo = (fireInfoData) => {
        setFireInfo(fireInfoData)
      }

      const handleNumberActive = (numberActiveValue) => {
        setNumberActive(numberActiveValue);
        console.log("screen: notebuffer.length: ", numberActiveValue.length);
      }

      const handleScaleSpeed = (scaleSpeedValue) => {
        setScaleSpeed(scaleSpeedValue);
      };

      const handleAlienColor = (alienColorValue) => {
        setAlienColor(alienColorValue);
      };

      const handleAlienSize = (alienSizeValue) => {
        setAlienSize(alienSizeValue);
      };

      const handleAlien = (alienData) => {
        setCurrentAlien(alienData)
      };

      const handleShootEvent = (shootValue) => {
        setShoot(shootValue);

        // Reset shoot state to 'off' after a short delay
        setTimeout(() => {
          setShoot('off');
          setNumberActive(0);
        }, 600); // Adjust delay as needed to match animation duration
      };
      eventEmitter.on('updateAlienNumber', handleAlienNumber);
      eventEmitter.on('updateFireInfo', handleFireInfo);
      eventEmitter.on('updateNumberActive', handleNumberActive);
      eventEmitter.on('updateAlien', handleAlien);
      eventEmitter.on('updateAlienSize', handleAlienSize);
      eventEmitter.on('updateAlienColor', handleAlienColor);
      eventEmitter.on('updateScaleSpeed', handleScaleSpeed);
      eventEmitter.on('updateNoteAlien', handleNoteAlien);
      eventEmitter.on('updateMonitorMessage', handleMonitorMessageUpdate);
      eventEmitter.on('shoot', handleShootEvent);

      return () => {
        eventEmitter.off('updateAlienNumber', handleAlienNumber);
        eventEmitter.off('updateFireInfo', handleFireInfo);
        eventEmitter.off('updateNumberActive', handleNumberActive);
        eventEmitter.off('updateAlien', handleAlien);
        eventEmitter.off('updateAlienSize', handleAlienSize);
        eventEmitter.off('updateAlienColor', handleAlienColor);
        eventEmitter.off('updateScaleSpeed', handleScaleSpeed);
        eventEmitter.off('updateNoteAlien', handleNoteAlien);
        eventEmitter.off('updateMonitorMessage', handleMonitorMessageUpdate);
        eventEmitter.off('shoot', handleShootEvent);
      };
    }
  }, [visualCom]);

  return (
    <div className="kci-message-display small">
      <div className={`kci-mMsize ${isVisible ? 'fade-in-out-slow' : ''}`}>
        <h1>{monitorMessage}</h1>
      </div>
      {starField && <KCI_StarField 
      travelSpeed={travelSpeed}
      paused={trainingPaused}  />}
      {showOverlay &&
        <OverlayText showIt={showOverlay} />}
      {noteAlien && <Alien 
      scaleSpeed={scaleSpeed}
        alienColor={alienColor}
        alienSize={alienSize}
        currentAlien={currentAlien}
        paused={trainingPaused} />}
      <FinalFire alienNumber={alienNumber}
        numberNotes={currentAlien.notes}
        numberActive={numberActive}
        shoot={shoot}
        fireInfo={fireInfo} />
    </div >
  );
};

export default KCIscreen;
