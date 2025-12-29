'use client';

import React, { useState, useRef, useEffect } from 'react';
import OrientationWarning from '@/src/components/OrientationWarning';
import { useProduct } from "@/src/context/ProductContext";
import FreeTrialOrUpgradePopUp from '@/src/components/FreeTrialOrUpgradePopUp';
import { checkAccess } from '@/src/utils/checkAccess';
import { useAuth } from '@/src/context/AuthContext'; // Access currentUser
import SelectorButton from '@/src/components/SelectorButton';
import DemoKeyboard from '@/src/components/DemoKeyboard';
import BarDisplay from '@/src/components/kci/BarDisplay.js';
import MessageBox from '@/src/components/MessageBox';
import playWavFile from '@/src/utils/playWavFile';
import midiLookup from '@shared/utils/midiLookup.json';
import eventEmitter from '@shared/utils/eventEmitter';
import IntervalSelector from './IntervalSelector';
import CoarseRatioDisplay from '@/src/components/CoarseRatioDisplay';
import IntervalAccuracyTable from '@/src/components/IntervalAccuracyTable';
import SessionEndSignupPopup from '@/src/components/SessionEndSignupPopup';

const AudiationStudioGUIMobile = ({
  score,
  intervalScoreVector,
  level,
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
  const { setProductId } = useProduct();
  const { setFreeTrialAvailable } = useProduct();
  const { setBetaTesting } = useProduct();
  const { featureId } = useProduct();
  const { featureName } = useProduct();
  const [landingPage, setLandingPage] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showFreeTrialPopUp, setShowFreeTrialPopUp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMoreSettings, setShowMoreSettings] = useState(null);
  const [changeTonality, setChangeTonality] = useState(false);
  const [changeRange, setChangeRange] = useState(false);
  const [accessGranted, setAccessGranted] = useState(false);
  const [intervalTypeWarning, setIntervalTypeWarning] = useState("");
  const [timeString, setTimeString] = useState('5:00');
  const [remainingTime, setRemainingTime] = useState(5 * 60 * 1000);
  const [showSessionEndPopup, setShowSessionEndPopup] = useState(false);
  const [sessionData, setSessionData] = useState({ correctAnswers: 0, totalAnswers: 0, duration: 0 });

  const paywall_inactive = () => {
    // TEMPORARY: Always return true to bypass paywall for interval changes
    return true;
    
    // Original paywall logic (commented out):
    // if (accessGranted) {
    //   // console.log("paywall is inactive, access granted");
    //   return true; // No paywall
    // } else {
    //   console.log("Access not yet granted — triggering paywall");
    //   triggerPaywallCheck(); // async, fire-and-forget
    //   return false; // Block access for now
    // }
  };

  // async function called in the background
  const triggerPaywallCheck = async () => {
    const userId = currentUser.user_ID;
    console.log("Checking access for: ", userId);

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

  const changeSettings = (sType, sValue) => {
    switch (sType) {
      case 'run':
        // setShowSettings(!showSettings);
        setTrainingStarted(true);
        setControlEvent('run');
        break;
      // case 'pause':
      //   setControlEvent('pause');
      //   break;
      case 'stop':
        setTrainingStarted(false);
        setTrainingPaused(false);
        setControlEvent('stop');
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
      // case 'intervals':
      //   const newVector = [...intervalVector];
      //   newVector[sValue] = newVector[sValue] === 0 ? 1 : 0;
      //   setIntervalVector(newVector);
      //   break;
      case 'repeatInterval':
        eventEmitter.emit('repeatInterval', null);
        break;
      case 'ascendingIntervals':
        if (paywall_inactive()) {
          console.log("interval change accessed: ");
          if (sValue === 'all')
            setAscendingVector([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);
          else if (sValue === 'none')
            setAscendingVector([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
          else {
            const newAVector = [...ascendingVector];
            newAVector[sValue] = newAVector[sValue] === 0 ? 1 : 0;
            setAscendingVector(newAVector);
          }
        }
        else {
          console.log("interval change not accessed: ");
        }
        break;
      case 'descendingIntervals':
        if (paywall_inactive()) {
          if (sValue === 'all')
            setDescendingVector([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);
          else if (sValue === 'none')
            setDescendingVector([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
          else {
            const newDVector = [...descendingVector];
            newDVector[sValue] = newDVector[sValue] === 0 ? 1 : 0;
            setDescendingVector(newDVector);
          }
        }
        break;
      case 'harmonicIntervals':
        if (paywall_inactive()) {
          if (sValue === 'all')
            setHarmonicVector([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);
          else if (sValue === 'none')
            setHarmonicVector([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
          else {
            const newHVector = [...harmonicVector];
            newHVector[sValue] = newHVector[sValue] === 0 ? 1 : 0;
            setHarmonicVector(newHVector);
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
      case 'exitGame':
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

  React.useEffect(() => {
    const handleRemainingTimeUpdate = (timeData) => {
      setRemainingTime(timeData.remainingTime);
      setTimeString(timeData.timeString);
    };
    eventEmitter.on('updateRemainingTime', handleRemainingTimeUpdate);
    return () => {
      eventEmitter.off('updateRemainingTime', handleRemainingTimeUpdate);
    };
  }, []);

  React.useEffect(() => {
    const handleControlEvent = (controlEvent) => {
      if (controlEvent === 'finished') {
        setLandingPage(true);
      }
    };
    eventEmitter.on('updateControlEvent', handleControlEvent);
    return () => {
      eventEmitter.off('updateControlEvent', handleControlEvent);
    };
  }, []);

  React.useEffect(() => {
    const handleSessionEnd = (sessionData) => {
      const { duration, correctAnswers, totalAnswers } = sessionData;
      setSessionData({ correctAnswers, totalAnswers, duration });
      setShowSessionEndPopup(true);
    };
    eventEmitter.on('sessionEnded', handleSessionEnd);
    return () => {
      eventEmitter.off('sessionEnded', handleSessionEnd);
    };
  }, [currentUser]);

  const handleCreateAccount = () => {
    setShowSessionEndPopup(false);
    // Navigate to signup/login page - adjust the route as needed
    window.location.href = '/sign-up';
  };

  const handleContinueWithoutSaving = () => {
    setShowSessionEndPopup(false);
  };

  // Mobile landscape fullscreen handling
  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Function to hide address bar in landscape mode
      const hideAddressBar = () => {
        // Only hide address bar when in landscape orientation
        if (window.orientation === 90 || window.orientation === -90 || window.innerWidth > window.innerHeight) {
          setTimeout(() => {
            window.scrollTo(0, 1);
            // Force a second scroll after layout
            setTimeout(() => window.scrollTo(0, 1), 100);
          }, 100);
        }
      };

      // Hide address bar on component mount if in landscape
      hideAddressBar();

      // Hide address bar when orientation changes to landscape
      const handleOrientationChange = () => {
        setTimeout(hideAddressBar, 500);
      };

      // Hide address bar on first touch in landscape
      const handleFirstTouch = () => {
        hideAddressBar();
      };

      window.addEventListener('orientationchange', handleOrientationChange);
      document.addEventListener('touchstart', handleFirstTouch, { once: true });

      return () => {
        window.removeEventListener('orientationchange', handleOrientationChange);
        document.removeEventListener('touchstart', handleFirstTouch);
      };
    }
  }, []);

  return (
    <div className="relative h-screen w-screen overflow-hidden" style={{
      height: '100vh',
      width: '100vw'
    }}>
      <OrientationWarning />
      {/* ✅ Free Trial Pop-up */}
      {showFreeTrialPopUp && (
        <FreeTrialOrUpgradePopUp
          addedMessage="To change settings, please upgrade your account. "
          setShowFreeTrialPopUp={setShowFreeTrialPopUp}
        />
      )}

      {/* ✅ Settings Panel (Still Functional) */}
      {showSettings && (
        <div className="flex flex-col space-y-2 items-center justify-center w-full p-4">
          <button
            className={showSettings ? "bg-white text-black border-red-600 border-2 font-bold py-2 px-4 rounded shadow" : "bg-blue-100 text-blue-700 font-bold py-2 px-4 rounded shadow"}
            onClick={() => changeSettings("showSettings", null)}
          >
            Exit Settings
          </button>
        </div>
      )}

      {showSettings && (
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
          <div className="flex flex-col gap-4 items-center justify-center w-full mt-4">
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
        </div>
      )}

      <div className="h-[100dvw] w-[100dvh] rotate-90 origin-center overflow-hidden font-roboto flex flex-col justify-between items-stretch sm:rotate-0 sm:h-screen sm:w-screen">
        {showAnalytics ? (
          <div className="flex flex-col items-center justify-center h-full space-y-6">
            <button
              className="bg-yellow-50 text-black border-red-600 border-2 font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-red-700 transition-colors mb-4"
              onClick={() => setShowAnalytics(false)}
            >
              Exit Analytics
            </button>
            <IntervalAccuracyTable />
          </div>
        ) : landingPage && !showSettings ? (
          // Landing Page View
          <div className="flex flex-col items-center justify-center h-full space-y-6">
            <h1 className="text-4xl font-bold">Audiation Studio</h1>
            <p className="text-lg text-gray-500">Serious Ear Training.</p>

            <div className="flex flex-col space-y-4 w-full max-w-xs">
              <button
                className="bg-white text-black font-bold border-green-600 border-2 py-3 px-6 rounded-lg shadow-lg hover:bg-green-700 transition-colors"
                onClick={() => {
                  changeSettings("run", null);
                  setLandingPage(false);
                }}
              >
                Start
              </button>

              <button
                className="bg-white text-black font-bold border-yellow-500 border-2 py-3 px-6 rounded-lg shadow-lg hover:bg-purple-700 transition-colors"
                onClick={() => setShowAnalytics(true)}
              >
                Analytics
              </button>

              <button
                className="bg-white text-black font-bold border-yellow-500 border-2 py-3 px-6 rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
                onClick={() => changeSettings("showSettings", null)}
              >
                Settings
              </button>
             
              <button
                className="bg-white text-black font-bold border-red-600 border-2 py-3 px-6 rounded-lg shadow-lg hover:bg-red-700 transition-colors"
                onClick={() => changeSettings("exitGame", null)}
              >
                Exit
              </button>
            </div>
          </div>
        ) : (
          // Game View
          <>
            {/* Top Row: Timer, MessageBox, CoarseRatioDisplay */}
            {!showSettings && (
              <div className="flex flex-row items-center justify-between w-full px-2 mt-2 gap-1">
                {/* Timer (Clock) - Left */}
                <div className="flex items-center justify-start" style={{ minWidth: '120px', maxWidth: '180px' }}>
                  <div className="bg-green-100 bg-opacity-80 border-2 border-green-600 rounded-xl shadow-lg text-center px-2 py-1 w-full">
                    <div className="text-xs font-semibold text-green-800">Time Left</div>
                    <div className="text-lg font-bold text-green-900">{timeString}</div>
                  </div>
                </div>
                {/* Message Box - Center */}
                <div className="flex-grow flex justify-center items-center min-w-[120px] max-w-[260px]">
                  <MessageBox visualCom={visualCom} />
                </div>
                {/* CoarseRatioDisplay - Right */}
                <div className="flex items-center justify-end" style={{ minWidth: '120px', maxWidth: '180px' }}>
                  <CoarseRatioDisplay visualCom={visualCom} />
                </div>
              </div>
            )}
            {/* Second Row: Stop and Repeat Interval Buttons */}
            {!showSettings && (
              <div className="flex flex-row justify-center items-center w-full gap-4 mt-2 mb-2">
                <button
                  className="bg-yellow-50 text-black border-red-600 border-2 font-bold py-2 px-4 rounded shadow"
                  onClick={() => {
                    changeSettings("stop", null);
                    setLandingPage(true);
                  }}
                >
                  Stop
                </button>
                <button
                  className="bg-yellow-50 text-black border-green-600 border-2 font-bold py-2 px-4 rounded shadow"
                  onClick={() => changeSettings("repeatInterval", null)}
                >
                  Repeat Interval
                </button>
              </div>
            )}
            {/* Keyboard at Bottom */}
            {!showSettings && showKeyboard && (
              <div className="w-full mt-2 px-4 pb-4">
                <div className="bg-beige/80 border-2 border-yellow-600 rounded-xl shadow-lg p-3 text-center">
                  <DemoKeyboard keyRangeList={keyRangeList} />
                </div>
              </div>
            )}
          </>
        )}
      </div>
      {showSessionEndPopup && (
        <SessionEndSignupPopup
          isOpen={showSessionEndPopup}
          onClose={handleContinueWithoutSaving}
          onCreateAccount={handleCreateAccount}
          sessionDuration={sessionData.duration || remainingTime}
          isLoggedIn={currentUser && currentUser.user_ID}
          gamesCompleted={gamesCompleted}
        />
      )}
    </div>
  );

}

export default AudiationStudioGUIMobile;