'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useProduct } from "@/src/context/ProductContext";
import FreeTrialOrUpgradePopUp from '@/src/components/FreeTrialOrUpgradePopUp';
import { checkAccess } from '@/src/utils/checkAccess';
import { useAuth } from '@/src/context/AuthContext'; // Access currentUser
import SelectorButton from '@/src/components/SelectorButton';
import DemoKeyboard from '@/src/components/DemoKeyboard';
import MBKeyboard from '@/src/components/MBKeyboard';
import VisualCommunication from '@/src/components/MessageBox';
import MBLevelScore from './MBLevelScore';
import BleepCounter from './BleepCounter';
import SessionEndSignupPopup from '@/src/components/SessionEndSignupPopup';
import GameOverPopup from '@/src/components/GameOverPopup';
import playWavFile from '@/src/utils/playWavFile';
import midiLookup from '@shared/utils/midiLookup.json';
import IntervalSelector from './IntervalSelector';
import IntervalAccuracyTable from '@/src/components/IntervalAccuracyTable';
import GameCanvasComponentV2 from './GameCanvasComponentV2';

import eventEmitter from '@shared/utils/eventEmitter';


const MBGUIDesktop = ({
  aiActive,
  setAiActive,
  score,
  intervalScoreVector,
  level,
  currentLevel,
  setCurrentLevel,
  onBackToMap,
  ascendingVector,
  descendingVector,
  harmonicVector,
  setAscendingVector,
  setDescendingVector,
  setHarmonicVector,
  ascending,
  setAscending,
  descending,
  setDescending,
  harmonic,
  setHarmonic,
  randomIntervalRoot,
  setRandomIntervalRoot,
  gameOrTraining,
  lives,
  setLives,
  health,
  setHealth,
  shatter,
  setShatter,
  ammo,
  setAmmo,
  xp,
  setXp,
  chords,
  setChords,
  subTask,
  setSubTask,
  oct,
  setOct,
  currentUserData,
  controlEvent,
  setControlEvent,
  task,
  setTask,
  keyboardSize,
  setKeyboardSize,
  rangeLoLimit,
  setRangeLoLimit,
  rangeUpLimit,
  setRangeUpLimit,
  whichKeys,
  setWhichKeys,
  keyRangeList,
  setKeyRangeList,
  rangeType,
  setRangeType,
  trainingDataList,
  showKeyboard,
  setShowKeyboard,
  showOverlay,
  setCurrentPage,
  replayAfter,
  setReplayAfter,
  audioCom,
  setAudioCom,
  visualCom,
  setVisualCom,
  showHighScores,
  setShowHighScores,
  numberOfNotes,
  setNumberOfNotes,
  trainingDuration,
  setTrainingDuration,
  remainingTime,
  timeString,
  tonality,
  setTonality,
  reference,
  setReference,
  feedback,
  setFeedback,
  feedbackAV,
  setFeedbackAV,
  trainingStarted,
  setTrainingStarted,
  trainingPaused,
  setTrainingPaused,
  nFalseAttempts,
  noteCounter,
  gamesCompleted
}) => {

  const { currentUser } = useAuth();
  const router = useRouter();
  const { setProductId } = useProduct();
  const { setFreeTrialAvailable } = useProduct();
  const { setBetaTesting } = useProduct();
  const { featureId } = useProduct();
  const { featureName } = useProduct();
  const [showFreeTrialPopUp, setShowFreeTrialPopUp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [displayGameCanvas, setDisplayGameCanvas] = useState(true);

  const [showMoreSettings, setShowMoreSettings] = useState(null);
  const [changeTonality, setChangeTonality] = useState(false);
  const [changeRange, setChangeRange] = useState(false);
  const [accessGranted, setAccessGranted] = useState(false);
  const [intervalTypeWarning, setIntervalTypeWarning] = useState("");
  const [showSessionEndPopup, setShowSessionEndPopup] = useState(false);
  const [sessionData, setSessionData] = useState({ correctAnswers: 0, totalAnswers: 0, duration: 0 });
  const [showGameOverPopup, setShowGameOverPopup] = useState(false);
  const [gameWon, setGameWon] = useState(false);


  const paywall_inactive = () => {
    // TEMPORARY: Always return true to bypass paywall for interval changes
    return true;
    
    // Original paywall logic (commented out):
    // if (accessGranted) {
    //   // console.log("paywall is inactive, access granted");
    //   return true; // No paywall
    // } else {
    //   // console.log("Access not yet granted — triggering paywall");
    //   triggerPaywallCheck(); // async, fire-and-forget
    //   return false; // Block access for now
    // }
  };

  // async function called in the background
  const triggerPaywallCheck = async () => {
    const userId = currentUser.user_ID;
    // console.log("Checking access for: ", userId);

    const {
      access,
      freeTrialAvailable: trialOption,
      message
    } = await checkAccess(userId, featureId, featureName);

    if (access) {
      console.log("Access granted");
      setAccessGranted(true);
    } else {
      console.log("Access denied. Prompting for upgrade.");
      setFreeTrialAvailable(false);
      setBetaTesting(false);
      setShowFreeTrialPopUp(true);
      setAccessGranted(false);
    }
  };



  // Listen for session end events
  useEffect(() => {
    const handleSessionEnd = (eventData) => {
      // Capture the session data from the event
      const { duration, correctAnswers, totalAnswers } = eventData;
      setSessionData({ correctAnswers, totalAnswers, duration });
      // Don't show popup immediately - let GameOverPopup show first
      // setShowSessionEndPopup(true);
    };

    eventEmitter.on('sessionEnded', handleSessionEnd);

    return () => {
      eventEmitter.off('sessionEnded', handleSessionEnd);
    };
  }, [currentUser]);

  // Listen for game over events via mitt
  useEffect(() => {
    const handleGameEnd = (gameEndData) => {
      console.log(`🎮 MBGUIDesktop: Game end event received:`, gameEndData);
      
      if (gameEndData.result === 'won') {
        console.log(`🎮 MBGUIDesktop: Setting gameWon to true`);
        setGameWon(true);
        setShowGameOverPopup(true);
      } else if (gameEndData.result === 'lost') {
        console.log(`🎮 MBGUIDesktop: Setting gameWon to false`);
        setGameWon(false);
        setShowGameOverPopup(true);
      }
    };

    eventEmitter.on('gameEnded', handleGameEnd);

    return () => {
      eventEmitter.off('gameEnded', handleGameEnd);
    };
  }, []);

  const handleCreateAccount = () => {
    setShowSessionEndPopup(false);
    // Navigate to signup/login page - adjust the route as needed
    router.push('/sign-up');
  };

  const handleContinueWithoutSaving = () => {
    setShowSessionEndPopup(false);
    // Return to map after user closes the session end popup
    if (onBackToMap) {
      onBackToMap();
    }
  };

  const handleGameOverContinue = () => {
    setShowGameOverPopup(false);
    // Skip the session end popup and go directly back to map
    if (onBackToMap) {
      onBackToMap();
    }
  };



  const changeSettings = (sType, sValue) => {
    switch (sType) {
      case 'run':
        setTrainingStarted(true);
        setControlEvent('run');
        break;
      case 'stop':
        setTrainingStarted(false);
        setTrainingPaused(false);
        setControlEvent('stop');
        break;
      case 'showAnalytics':
        setShowAnalytics(!showAnalytics);
        break;
      case 'displayCanvas':
        setDisplayGameCanvas(!displayGameCanvas);
        break;

      case 'showSettings':
        if (audioCom) playWavFile('/sound/game_sounds/Space_sound.wav', 0.1);
        if (!trainingStarted) {
          {
            if (showSettings) {
              setChangeRange(false);
              setChangeTonality(false);
              setShowMoreSettings(null);
            }
            // setShowHighScores(false);
            setShowSettings(!showSettings);
          }
        }
        else {
          const monitorMessage = "Can't change settings while game is running";
          eventEmitter.emit('updateMonitorMessage', monitorMessage);
        }
        break;
      case 'help':
        setControlEvent('help');
        break
      case 'repeatInterval':
        eventEmitter.emit('repeatInterval', null);
        break;
      case 'ascendingIntervals':
        if (paywall_inactive()) {
          // console.log("interval change accessed: ");
          if (sValue === 'all') {
            const newVec = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
            // console.log('New Ascending Vector:', newVec);
            setAscendingVector(newVec);
          }
          else if (sValue === 'none') {
            const newVec = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            // console.log('New Ascending Vector:', newVec);
            setAscendingVector(newVec);
          }
          else {
            setAscendingVector(prev => {
              const newAVector = [...prev];
              newAVector[sValue] = newAVector[sValue] === 0 ? 1 : 0;
              // console.log('New Ascending Vector:', newAVector);
              return newAVector;
            });
          }
        }
        else {
          // console.log("interval change not accessed: ");
        }
        break;
      case 'descendingIntervals':
        if (paywall_inactive()) {
          if (sValue === 'all') {
            const newVec = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
            // console.log('New Descending Vector:', newVec);
            setDescendingVector(newVec);
          }
          else if (sValue === 'none') {
            const newVec = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            // console.log('New Descending Vector:', newVec);
            setDescendingVector(newVec);
          }
          else {
            setDescendingVector(prev => {
              const newDVector = [...prev];
              newDVector[sValue] = newDVector[sValue] === 0 ? 1 : 0;
              // console.log('New Descending Vector:', newDVector);
              return newDVector;
            });
          }
        }
        break;
      case 'harmonicIntervals':
        if (paywall_inactive()) {
          if (sValue === 'all') {
            const newVec = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
            // console.log('New Harmonic Vector:', newVec);
            setHarmonicVector(newVec);
          }
          else if (sValue === 'none') {
            const newVec = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            // console.log('New Harmonic Vector:', newVec);
            setHarmonicVector(newVec);
          }
          else {
            setHarmonicVector(prev => {
              const newHVector = [...prev];
              newHVector[sValue] = newHVector[sValue] === 0 ? 1 : 0;
              // console.log('New Harmonic Vector:', newHVector);
              return newHVector;
            });
          }
        }
        break;
      case 'ascending':
        if (paywall_inactive()) {
          setAscending(!ascending);
        }
        break;
      case 'descending':
        if (paywall_inactive()) {
          setDescending(!descending);
        }
        break;
      case 'harmonic':
        if (paywall_inactive()) {
          setHarmonic(!harmonic);
        }
        break;
      case 'randomIntervalRoot':
        if (paywall_inactive()) {
          setRandomIntervalRoot(!randomIntervalRoot);
        }
        break;
      case 'chords':
        if (audioCom) playWavFile('/sound/game_sounds/Space_sound.wav', 0.1);
        setChords(sValue);
        break;
      case 'oct':
        if (audioCom) playWavFile('/sound/game_sounds/Space_sound.wav', 0.1);
        setOct(sValue);
        break;

      // case 'pause':
      //   setControlEvent('pause');
      //   break;

      case 'subTask':
        if (audioCom) playWavFile('/sound/game_sounds/Space_sound.wav', 0.1);
        if ((sValue === 'scales') || (sValue === 'melodies')) {
          const monitorMessage = "Coming Soon ... ";
          eventEmitter.emit('updateMonitorMessage', monitorMessage);
        }
        else {
          setSubTask(sValue)
          if ((sValue === 'chords') && (level < 2)) {
            const monitorMessage = "Range Increased to Allow for Chords";
            eventEmitter.emit('updateMonitorMessage', monitorMessage);
            // setLevel(2);
          }
        }
        // setTask(sValue);
        break;
      case 'task':
        if (audioCom) playWavFile('/sound/game_sounds/Space_sound.wav', 0.1);
        if (!((sValue === 'ear') || (sValue === 'scales'))) {
          const monitorMessage = "Coming Soon ... ";
          eventEmitter.emit('updateMonitorMessage', monitorMessage);
        }
        else {
          setTask(sValue)
        }
        // setTask(sValue);
        break;
      case 'changeTonality':
        if (audioCom) playWavFile('/sound/game_sounds/Space_sound.wav', 0.1);
        setChangeTonality(!changeTonality);
        setShowMoreSettings(null)
        break;
      case 'changeRange':
        if (audioCom) playWavFile('/sound/game_sounds/Space_sound.wav', 0.1);
        setChangeRange(!changeRange);
        setShowMoreSettings(null)
        break;
      case 'rangeLoLimit':
        // console.log("change range low limit");
        if (sValue === 'down')
          if (rangeLoLimit > 21) {
            setRangeLoLimit(rangeLoLimit - 1);
            setKeyboardSize(keyboardSize + 1);
            if (keyboardSize > 47) setRangeUpLimit(rangeUpLimit - 1)
          }
        if (sValue === 'up') {
          if (rangeLoLimit + 1 < rangeUpLimit) setRangeLoLimit(rangeLoLimit + 1);
          setKeyboardSize(keyboardSize - 1);
        }
        // console.log("new limit = " + rangeLoLimit)
        if (audioCom) playWavFile('/sound/game_sounds/Space_sound.wav', 0.1);
        break;
      case 'rangeUpLimit':
        if (sValue === 'down') {
          if (rangeUpLimit - 1 > rangeLoLimit) setRangeUpLimit(rangeUpLimit - 1);
          setKeyboardSize(keyboardSize - 1);
        }
        if (sValue === 'up') {
          if (rangeUpLimit < 108) {
            setRangeUpLimit(rangeUpLimit + 1);
            setKeyboardSize(keyboardSize + 1);
            if (keyboardSize > 47) setRangeLoLimit(rangeLoLimit + 1)
          }
        }
        if (audioCom) playWavFile('/sound/game_sounds/Space_sound.wav', 0.1);
        break;
      case 'whichKeys':
        setWhichKeys(sValue);
        if (audioCom) playWavFile('/sound/game_sounds/Space_sound.wav', 0.1);
        break;
      case 'rangeType':
        if (sValue === 'custom') {
          if (currentUserData.getFeatureName() === 'key_commander_full') {
            setRangeType(sValue);
            // setLevel(0);
          }
          else {
            const monitorMessage = "Upgrade your account to access this feature";
            eventEmitter.emit('updateMonitorMessage', monitorMessage);
          }
        }
        if (sValue === 'standard') {
          // setLevel(1);
        }
        if (audioCom) playWavFile('/sound/game_sounds/Space_sound.wav', 0.1);
        break;
      case 'displayHighscores':
        if (audioCom) playWavFile('/sound/game_sounds/Space_sound.wav', 0.1);
        setShowHighScores(!showHighScores);
        break;
      case 'exit':
        if (audioCom) playWavFile('/sound/game_sounds/Space_sound.wav', 0.1);
        setControlEvent('quit');
        break;
      case 'aCom':
        if (!audioCom) playWavFile('/sound/game_sounds/Space_sound.wav', 0.1);
        setAudioCom(!audioCom);
        break;
      case 'vCom':
        setVisualCom(!visualCom);
        if (audioCom) playWavFile('/sound/game_sounds/Space_sound.wav', 0.1);
        break;
      // case 'showAnimation':
      //   setShowAnimation(!showAnimation);
      //   if (audioCom) playWavFile('/game_sounds/Space_sound.wav', 0.1);
      //   break;
      case 'tNumber':
        setNumberOfNotes(sValue);
        if (audioCom) playWavFile('/sound/game_sounds/Space_sound.wav', 0.1);
        break;
      case 'tDuration':
        if (sValue === 2.5) {
          setTrainingDuration(2.5 * 60 * 1000); // Handle 2:30 specifically
        } else {
          setTrainingDuration(sValue * 60 * 1000); // Convert minutes to milliseconds
        }
        if (audioCom) playWavFile('/sound/game_sounds/Space_sound.wav', 0.1);
        break;
      // case 'level':
      //   if (whichKeys === "onScreen")
      //     if (sValue < 5)
      //       setLevel(sValue);
      //     else {
      //       setLevel(4);
      //       const monitorMessage = "Onscreen keyboard size is limited";
      //       const event3 = new CustomEvent('updateMonitorMessage', { detail: monitorMessage });
      //       document.dispatchEvent(event3);
      //     }
      //   else setLevel(sValue);
      //   if (audioCom) playWavFile('/game_sounds/Space_sound.wav', 0.1);
      //   break;
      case 'reference':
        setReference(sValue);
        if (audioCom) playWavFile('/sound/game_sounds/Space_sound.wav', 0.1);
        break;
      case 'replayAfter':
        setReplayAfter(sValue);
        if (audioCom) playWavFile('/sound/game_sounds/Space_sound.wav', 0.1);
        break;
      case 'tonality':
        setTonality(sValue);
        if (!(sValue === 'C')) {
          const monitorMessage = "Upgrade your account to access this feature";
          eventEmitter.emit('updateMonitorMessage', monitorMessage);
        }
        break;
      default:
        break;
    }
  };

  const handleIntervalTypeToggle = (type) => {
    const selected = [ascending, descending, harmonic];
    let count = selected.filter(Boolean).length;
    if (
      (type === 'ascending' && ascending && count === 1) ||
      (type === 'descending' && descending && count === 1) ||
      (type === 'harmonic' && harmonic && count === 1)
    ) {
      setIntervalTypeWarning("At least one interval type must be selected.");
      setTimeout(() => setIntervalTypeWarning(""), 2000);
      return;
    }
    setIntervalTypeWarning("");
    if (type === 'ascending') setAscending(!ascending);
    if (type === 'descending') setDescending(!descending);
    if (type === 'harmonic') setHarmonic(!harmonic);
  };

  return (
    <div className="pt-2 cockpit-container" style={{ paddingLeft: 'clamp(8px, 5vw, 160px)', paddingRight: 'clamp(8px, 5vw, 160px)' }}>
      {/* Interval Accuracy Table only when showAnalytics is true */}
      {showAnalytics && (
        <div className="w-full flex justify-center">
          <IntervalAccuracyTable />
        </div>
      )}
      
      {showFreeTrialPopUp && (
        <FreeTrialOrUpgradePopUp
          addedMessage={"To change settings, please upgrade your account"}
          setShowFreeTrialPopUp={setShowFreeTrialPopUp}
        />
      )}

      {/* Three Column Layout when settings are hidden */}
      {!showSettings && (
        <div className="flex w-full h-screen pt-1 gap-4">
          
          {/* Left Column - Controls */}
          <div className="flex flex-col flex-1 gap-4 min-w-[150px]">
            {/* Back Button - Map or Course */}
            {onBackToMap && (
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-colors duration-200"
                onClick={onBackToMap}
              >
                ← Back
              </button>
            )}

            {/* Timer Display */}
            <div className="bg-green-100 bg-opacity-80 border-2 border-green-600 rounded-xl shadow-lg text-center" style={{ padding: 'clamp(8px, 1.5vw, 16px)' }}>
              <div className="text-lg font-semibold text-green-800">Elapsed Time:</div>
              <div className="text-2xl font-bold text-green-900">{timeString}</div>
            </div>

            {/* Message Box */}
            {/* <div className="flex justify-center">
              <VisualCommunication
                smallDisplay={false}
                visualCom={visualCom}
                showOverlay={showOverlay}
              />
            </div> */}

            {/* Main Control Buttons */}
            <div className="bg-white bg-opacity-80 border-2 border-yellow-600 rounded-xl shadow-lg" style={{ padding: 'clamp(8px, 1.5vw, 16px)' }}>
              <div className="flex flex-col gap-2">
                <button
                  className={`py-2 px-4 rounded font-bold shadow border ${trainingStarted ? 'bg-green-700 text-white' : 'bg-white text-black hover:bg-green-100'}`}
                  onClick={() => changeSettings('run', null)}
                >
                  Start
                </button>
                <button
                  className={`py-2 px-4 rounded font-bold shadow border ${!trainingStarted ? 'bg-green-700 text-white' : 'bg-white text-black hover:bg-green-100'}`}
                  onClick={() => changeSettings('stop', null)}
                >
                  Stop
                </button>
                {/* <button
                  className={`py-2 px-4 rounded font-bold shadow border ${displayGameCanvas ? 'bg-green-700 text-white' : 'bg-white text-black hover:bg-green-100'}`}
                  onClick={() => changeSettings('displayCanvas', null)}
                >
                  Canvas
                </button>
                <button
                  className={`py-2 px-4 rounded font-bold shadow border ${showAnalytics ? 'bg-green-700 text-white' : 'bg-white text-black hover:bg-green-100'}`}
                  onClick={() => changeSettings('showAnalytics', null)}
                >
                  Analytics
                </button>
                
                <button
                  className={`py-2 px-4 rounded font-bold shadow border ${showSettings ? 'bg-green-700 text-white' : 'bg-white text-black hover:bg-green-100'}`}
                  onClick={() => changeSettings('showSettings', null)}
                >
                  Open Settings
                </button> */}
                {/* <button
                  className="py-2 px-4 rounded font-bold shadow border bg-white text-black hover:bg-green-100"
                  onClick={() => changeSettings('repeatInterval', null)}
                >
                  Repeat Interval
                </button> */}
                {/* <button
                  className="py-2 px-4 rounded font-bold shadow border bg-red-600 text-white hover:bg-red-700"
                  onClick={() => changeSettings('exit', null)}
                >
                  Exit
                </button> */}
              </div>
            </div>

            {/* Bleep Counter Display */}
            <div className="flex justify-center">
              <BleepCounter
                visualCom={visualCom}
              />
            </div>
          </div>

          {/* Middle Column - Canvas and Keyboard - Fixed Width */}
          <div className={`flex flex-col items-center mt-0 relative w-[400px] flex-shrink-0 ${currentLevel?.type === "12 tone wall" ? "gap-0" : "gap-1"}`}>
            {/* Canvas Component */}
            {displayGameCanvas && (
              <div className="bg-gray-100 bg-opacity-80 border-2 border-gray-400 rounded-xl shadow-lg p-2">
                <GameCanvasComponentV2 currentLevel={currentLevel} />
              </div>
            )}

            {/* Keyboard - MBKeyboard for 12 tone wall, DemoKeyboard for others */}
            {showKeyboard && !showGameOverPopup && currentLevel?.type === "12 tone wall" && (
              <div className="bg-blue-100 bg-opacity-80 border-2 border-blue-600 rounded-xl shadow-lg text-center p-2" style={{ marginLeft: '17px' }}>
                <MBKeyboard keyRangeList={keyRangeList} isMobile={false} />
              </div>
            )}

            {showKeyboard && !showGameOverPopup && currentLevel?.type !== "12 tone wall" && (
              <div className="bg-yellow-100 bg-opacity-80 border-2 border-yellow-600 rounded-xl shadow-lg text-center p-2">
                <DemoKeyboard keyRangeList={keyRangeList} />
              </div>
            )}

            {/* Game Over Popup positioned to replace keyboard */}
            {showGameOverPopup && (
              <div className="bg-yellow-100 bg-opacity-80 border-2 border-yellow-600 rounded-xl shadow-lg text-center p-2 w-full max-w-6xl">
                <GameOverPopup
                  isOpen={showGameOverPopup}
                  onContinue={handleGameOverContinue}
                  isWin={gameWon}
                />
              </div>
            )}
          </div>

          {/* Right Column - Score */}
          <div className="flex flex-col flex-1 gap-4 min-w-[150px]">
            {/* Level Score Display */}
            <div className="flex justify-center">
              <MBLevelScore
                visualCom={visualCom}
              />
            </div>
          </div>
        </div>
      )}

      {/* Settings Control Panel */}
      {showSettings && (
        <div className="w-full flex flex-col items-center px-4 py-2">
          <div className="w-full max-w-5xl bg-white bg-opacity-80 border-2 border-yellow-600 rounded-xl shadow-lg p-4">
            <div className="flex justify-center">
              <button
                className="px-3 py-2 rounded-md border font-bold shadow bg-green-700 text-white hover:bg-green-800"
                onClick={() => changeSettings('showSettings', null)}
              >
                Close Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {showSettings &&
        <div className="w-full flex flex-col items-center justify-center mb-4">
          <div className="bg-white/80 border border-black rounded-lg shadow-lg p-4 flex flex-wrap gap-8 justify-center items-center">
            <div className="flex flex-col items-center">
              <div className="font-semibold text-lg mb-2 text-black text-center">Pick Your Interval Types:</div>
              {intervalTypeWarning && <div className="text-red-600 font-semibold mb-2 text-center">{intervalTypeWarning}</div>}
              <div className="flex flex-wrap gap-2 justify-center items-center">
                <button
                  className={`px-3 py-2 mr-2 mb-2 rounded-md border font-bold shadow ${ascending === true ? 'bg-green-700 text-black' : 'bg-white text-black hover:bg-gray-200'}`}
                  onClick={() => handleIntervalTypeToggle('ascending')}
                >
                  ascending
                </button>
                <button
                  className={`px-3 py-2 mr-2 mb-2 rounded-md border font-bold shadow ${descending === true ? 'bg-green-700 text-black' : 'bg-white text-black hover:bg-gray-200'}`}
                  onClick={() => handleIntervalTypeToggle('descending')}
                >
                  descending
                </button>
                <button
                  className={`px-3 py-2 mr-2 mb-2 rounded-md border font-bold shadow ${harmonic === true ? 'bg-green-700 text-black' : 'bg-white text-black hover:bg-gray-200'}`}
                  onClick={() => handleIntervalTypeToggle('harmonic')}
                >
                  harmonic
                </button>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="font-semibold text-lg mb-2 text-black text-center">Pick Your Root Note:</div>
              <div className="flex flex-wrap gap-2 justify-center items-center">
                <button
                  className={`px-3 py-2 mr-2 mb-2 rounded-md border font-bold shadow ${randomIntervalRoot === false ? 'bg-green-700 text-black' : 'bg-white text-black hover:bg-gray-200'}`}
                  onClick={() => changeSettings('randomIntervalRoot', 0)}
                >
                  C4 (Middle C)
                </button>
                <button
                  className={`px-3 py-2 mr-2 mb-2 rounded-md border font-bold shadow ${randomIntervalRoot === true ? 'bg-green-700 text-black' : 'bg-white text-black hover:bg-gray-200'}`}
                  onClick={() => changeSettings('randomIntervalRoot', 0)}
                >
                  Random
                </button>
              </div>
            </div>
          </div>
        </div>
      }

      {showSettings && (
        <div className="flex flex-col gap-4 items-center justify-center w-full">
          {ascending && (
            <IntervalSelector
              label="Ascending"
              vector={ascendingVector}
              onChange={(val) => changeSettings('ascendingIntervals', val)}
            />
          )}
          {descending && (
            <IntervalSelector
              label="Descending"
              vector={descendingVector}
              onChange={(val) => changeSettings('descendingIntervals', val)}
            />
          )}
          {harmonic && (
            <IntervalSelector
              label="Harmonic"
              vector={harmonicVector}
              onChange={(val) => changeSettings('harmonicIntervals', val)}
            />
          )}
        </div>
      )}

      {(showSettings && changeTonality) &&
        <div className="window-container">
          <div className='table'>
            <div className="table-row">
              <div className="table-cell">Tonality:</div>
              <div className="table-cell">
                <SelectorButton
                  value="C"
                  selected={tonality === 'C'}
                  onClick={() => changeSettings('tonality', 'C')}
                />
                <SelectorButton
                  value="G"
                  selected={tonality === 'G'}
                  onClick={() => changeSettings('tonality', 'G')}
                />
                <SelectorButton
                  value="D"
                  selected={tonality === 'D'}
                  onClick={() => changeSettings('tonality', 'D')}
                />
                <SelectorButton
                  value="A"
                  selected={tonality === 'A'}
                  onClick={() => changeSettings('tonality', 'A')}
                />
                <SelectorButton
                  value="E"
                  selected={tonality === 'E'}
                  onClick={() => changeSettings('tonality', 'E')}
                />
                <SelectorButton
                  value="B"
                  selected={tonality === 'B'}
                  onClick={() => changeSettings('tonality', 'B')}
                />
                <SelectorButton
                  value="F"
                  selected={tonality === 'F'}
                  onClick={() => changeSettings('tonality', 'F')}
                />
                <SelectorButton
                  value="Bb"
                  selected={tonality === 'Bb'}
                  onClick={() => changeSettings('tonality', 'Bb')}
                />
                <SelectorButton
                  value="Eb"
                  selected={tonality === 'Eb'}
                  onClick={() => changeSettings('tonality', 'Eb')}
                />
                <SelectorButton
                  value="Ab"
                  selected={tonality === 'Ab'}
                  onClick={() => changeSettings('tonality', 'Ab')}
                />
                <SelectorButton
                  value="Db"
                  selected={tonality === 'Db'}
                  onClick={() => changeSettings('tonality', 'Db')}
                />
                <SelectorButton
                  value="Gb"
                  selected={tonality === 'Gb'}
                  onClick={() => changeSettings('tonality', 'Gb')}
                />
              </div>
            </div>
          </div>
        </div>
      }

      <div className="menu-container">

        {/* Table container #1 */}
        <div className="table-container">

          {(showSettings && changeRange) &&
            <div>
              <div className="table">
                <div className="table-row">
                  <div className="table-cell">Game:</div>
                  <div className="table-cell">
                    <button
                      className={`${(rangeType === 'standard') ? 'selected' : ''}`}
                      onClick={() => changeSettings('rangeType', 'standard')}
                    >
                      Standard
                    </button>
                    <button
                      className={`${(rangeType === 'custom') ? 'selected' : ''}`}
                      onClick={() => changeSettings('rangeType', 'custom')}
                    >
                      Customn
                    </button>
                  </div>
                </div>
              </div>
            </div>
          }

          {showSettings && (showMoreSettings === 'duration') &&
            <div className="table">
              <div className="table-row">
                <div className="table-cell">Training Duration:</div>
                <div className="table-cell">
                  <SelectorButton value="1 min" selected={trainingDuration === 1 * 60 * 1000}
                    onClick={() => changeSettings('tDuration', 1)} />
                  <SelectorButton value="2:30 min" selected={trainingDuration === 2.5 * 60 * 1000}
                    onClick={() => changeSettings('tDuration', 2.5)} />
                  <SelectorButton value="5 min" selected={trainingDuration === 5 * 60 * 1000}
                    onClick={() => changeSettings('tDuration', 5)} />
                  <SelectorButton value="10 min" selected={trainingDuration === 10 * 60 * 1000}
                    onClick={() => changeSettings('tDuration', 10)} />
                  <SelectorButton value="15 min" selected={trainingDuration === 15 * 60 * 1000}
                    onClick={() => changeSettings('tDuration', 15)} />
                  <SelectorButton value="30 min" selected={trainingDuration === 30 * 60 * 1000}
                    onClick={() => changeSettings('tDuration', 30)} />
                </div>
              </div>
              <div className="table-row">
                <div className="table-cell">Time Remaining:</div>
                <div className="table-cell">
                  <span className="text-xl font-bold text-green-600">{timeString}</span>
                </div>
              </div>
            </div>
          }

          {showSettings && (showMoreSettings === 'task') &&
            <div className="table">
              <div>
                <div className="table-row">
                  <div className="table-cell">Task Selection:</div>
                  <div className="table-cell">


                    <button
                      className={`${(task === 'ear') ? 'selected' : ''}`}
                      onClick={() => changeSettings('task', 'ear')}
                    >
                      Ear Trainer
                    </button>


                    <button
                      className={`${(task === 'scales') ? 'selected' : ''}`}
                      onClick={() => changeSettings('task', 'scales')}
                    >
                      Learn Scales
                    </button>

                    <button
                      className={`${(task === 'pieces') ? 'selected' : ''}`}
                      onClick={() => changeSettings('task', 'pieces')}
                    >
                      Learn Pieces
                    </button>

                  </div>
                </div>
              </div>
            </div>
          }

          {showSettings && (showMoreSettings === 'task') && (task === 'ear') &&
            <div className="table">
              <div>
                <div className="table-row">
                  <div className="table-cell">Task Selection:</div>
                  <div className="table-cell">

                    <button
                      className={`${(subTask === 'intervals') ? 'selected' : ''}`}
                      onClick={() => changeSettings('subTask', 'intervals')}
                    >
                      Intervals
                    </button>

                    <button
                      className={`${(subTask === 'notes') ? 'selected' : ''}`}
                      onClick={() => changeSettings('subTask', 'notes')}
                    >
                      Single Notes
                    </button>



                    <button
                      className={`${(subTask === 'scales') ? 'selected' : ''}`}
                      onClick={() => changeSettings('subTask', 'scales')}
                    >
                      Scales
                    </button>

                    <button
                      className={`${(subTask === 'chords') ? 'selected' : ''}`}
                      onClick={() => changeSettings('subTask', 'chords')}
                    >
                      Chords
                    </button>

                    <button
                      className={`${(subTask === 'melodies') ? 'selected' : ''}`}
                      onClick={() => changeSettings('subTask', 'melodies')}
                    >
                      Melodies
                    </button>

                  </div>
                </div>
              </div>
            </div>
          }


          {showSettings && (showMoreSettings === 'keyboard') &&
            <div className="table">
              <div>
                <div className="table-row">
                  <div className="table-cell">Keyboard Settings:</div>
                  <div className="table-cell">
                    <button
                      className={`${(whichKeys === 'midi') ? 'selected' : ''}`}
                      onClick={() => changeSettings('whichKeys', 'midi')}
                    >
                      Midi Keys
                    </button>
                    <button
                      className={`${(whichKeys === 'onScreen') ? 'selected' : ''}`}
                      onClick={() => changeSettings('whichKeys', 'onScreen')}
                    >
                      Screen Keys
                    </button>
                  </div>
                </div>
              </div>
            </div>
          }

          {showSettings && (showMoreSettings === 'comms') &&
            <div className="table">
              <div className="table-row">
                <div className="table-cell">Communication:</div>
                <div className="table-cell">

                  {/* <button
                    className={`${showAnimation ? 'selected' : ''}`}
                    onClick={() => changeSettings('showAnimation', null)}
                  >
                    Show Animation
                  </button> */}
                  <button
                    className={`${audioCom ? 'selected' : ''}`}
                    onClick={() => changeSettings('aCom', null)}
                  >
                    Audio
                  </button>
                  <button
                    className={`${visualCom ? 'selected' : ''}`}
                    onClick={() => changeSettings('vCom', null)}
                  >
                    Visual
                  </button>
                </div>
              </div>
            </div>
          }

          {showSettings && (showMoreSettings === 'ref') &&
            <div className="table">
              <div className="table-row">
                <div className="table-cell">Play Key Chord + Note (Tonic):</div>
                <div className="table-cell">
                  <button
                    className={`${reference === 0 ? 'selected' : ''}`}
                    onClick={() => changeSettings('reference', 0)}
                  >
                    Never
                  </button>
                  <button
                    className={`${reference === 1 ? 'selected' : ''}`}
                    onClick={() => changeSettings('reference', 1)}
                  >
                    Once
                  </button>
                  <button
                    className={`${reference === 5 ? 'selected' : ''}`}
                    onClick={() => changeSettings('reference', 5)}
                  >
                    After 5
                  </button>
                  <button
                    className={`${reference === 10 ? 'selected' : ''}`}
                    onClick={() => changeSettings('reference', 10)}
                  >
                    After 10
                  </button>
                </div>
              </div>
            </div>
          }

          {showSettings && (showMoreSettings === 'repeat') &&
            <div className="table">

              <div className="table-row">
                <div className="table-cell">Repeat Correct Note after # wrong Notes:</div>
                <div className="table-cell">
                  <button
                    className={`${replayAfter === 1000 ? 'selected' : ''}`}
                    onClick={() => changeSettings('replayAfter', 1000)}
                  >
                    Never
                  </button>
                  <button
                    className={`${replayAfter === 1 ? 'selected' : ''}`}
                    onClick={() => changeSettings('replayAfter', 1)}
                  >
                    1
                  </button>
                  <button
                    className={`${replayAfter === 2 ? 'selected' : ''}`}
                    onClick={() => changeSettings('replayAfter', 2)}
                  >
                    2
                  </button>
                  <button
                    className={`${replayAfter === 5 ? 'selected' : ''}`}
                    onClick={() => changeSettings('replayAfter', 5)}
                  >
                    5
                  </button>
                  <button
                    className={`${replayAfter === 10 ? 'selected' : ''}`}
                    onClick={() => changeSettings('replayAfter', 10)}
                  >
                    10
                  </button>
                </div>
              </div>
            </div>
          }
        </div>

        {/* Table container #2 */}
        <div className="table-container">

          {showSettings && (showMoreSettings === 'task') &&
            <div className="table">
              <div>
                <div className="table-row">
                  <div className="table-cell">Let the AI teacher select your task</div>
                  <div className="table-cell">
                    <button
                      className={`${(task === 'AI') ? 'selected' : ''}`}
                      onClick={() => changeSettings('task', 'AI')}
                    >
                      Activate AI Teaching Agent
                    </button>
                  </div>
                </div>
              </div>
            </div>
          }

          {showSettings && (showMoreSettings === 'task') && (task === 'ear') && (subTask === 'chords') &&
            <div className="table">
              <div>
                <div className="table-row">
                  <div className="table-cell"> Chords of a Key or Random Chords</div>
                  <div className="table-cell">
                    <button
                      className={`${(chords === 'random') ? 'selected' : ''}`}
                      onClick={() => changeSettings('chords', 'random')}
                    >
                      Random Triads
                    </button>

                    <button
                      className={`${(chords === 'inKey') ? 'selected' : ''}`}
                      onClick={() => changeSettings('chords', 'inKey')}
                    >
                      Triads in a Key
                    </button>


                  </div>
                </div>
              </div>
            </div>
          }

          {(showSettings && (task == 'scales') && changeRange) &&
            <div className="table">
              <div className="table-row">
                <div className="table-cell">Number of Octaves:</div>
                <div className="table-cell">
                  <SelectorButton value="1" selected={oct === 1}
                    onClick={() => changeSettings('oct', 1)} />
                  <SelectorButton value="2" selected={oct === 2}
                    onClick={() => changeSettings('oct', 2)} />
                  <SelectorButton value="3" selected={oct === 3}
                    onClick={() => changeSettings('oct', 3)} />
                  <SelectorButton value="4" selected={oct === 4}
                    onClick={() => changeSettings('oct', 4)} />
                </div>
              </div>
            </div>
          }


          {(showSettings && !(task == 'scales') && changeRange && (rangeType === 'standard')) &&
            <div className="table">
              <div className="table-row">
                <div className="table-cell">Number of Keys (to choose from):</div>
                <div className="table-cell">
                  <SelectorButton value="5" selected={level === 1}
                    onClick={() => changeSettings('level', 1)} />
                  <SelectorButton value="11" selected={level === 2}
                    onClick={() => changeSettings('level', 2)} />
                  <SelectorButton value="15" selected={level === 3}
                    onClick={() => changeSettings('level', 3)} />
                  <SelectorButton value="29" selected={level === 4}
                    onClick={() => changeSettings('level', 4)} />
                  <SelectorButton value="43" selected={level === 5}
                    onClick={() => changeSettings('level', 5)} />
                  <SelectorButton value="52" selected={level === 6}
                    onClick={() => changeSettings('level', 6)} />
                </div>
              </div>
            </div>
          }

          {(showSettings && !(task == 'scales') && changeRange && (rangeType === 'custom')) &&
            <div className="table">
              <div className="table-row">
                <div className="table-cell">Select Highest and Lowest Key:</div>
                <div className="table-cell">
                  <button
                    onClick={() => changeSettings('rangeLoLimit', 'down')}
                  >
                    {String.fromCharCode(0x25C0)}
                  </button>
                  <button> {midiLookup.midiLookup[String(rangeLoLimit)].denotation} </button>

                  <button
                    onClick={() => changeSettings('rangeLoLimit', 'up')}
                  >
                    {String.fromCharCode(0x25B6)}
                  </button>

                  <button
                    onClick={() => changeSettings('rangeUpLimit', 'down')}
                  >
                    {String.fromCharCode(0x25C0)}
                  </button>
                  <button> {midiLookup.midiLookup[String(rangeUpLimit)].denotation} </button>
                  <button
                    onClick={() => changeSettings('rangeUpLimit', 'up')}
                  >
                    {String.fromCharCode(0x25B6)}
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
              </div >

      {showSessionEndPopup && (
        <SessionEndSignupPopup
          isOpen={showSessionEndPopup}
          onClose={handleContinueWithoutSaving}
          onCreateAccount={handleCreateAccount}
          sessionDuration={trainingDuration}
          isLoggedIn={currentUser && currentUser.user_ID}
          gamesCompleted={gamesCompleted}
        />
      )}



    </div >
  );
};

export default MBGUIDesktop;