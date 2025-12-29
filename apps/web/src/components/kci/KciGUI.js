'use client';

import React, { useState, useRef } from 'react';
import SelectorButton from '@/src/components/SelectorButton.tsx';
import DemoKeyboard from '@/src/components/DemoKeyboard.js';
import Fretboard from '@/src/components/Fretboard.js';
import DisplayLives from '@/src/components/kci/DisplayLives.js';
import AmmoBar from '@/src/components/kci/AmmoBar.js';
import HealthBar from '@/src/components/kci/HealthBar.js';
import KCI_BarDisplay from '@/src/components/kci/BarDisplay.js';
import Shatter from '@/src/components/kci/Shatter.js';
// import ShowHighScores from '@/src/components/ShowHighScores.js';
import KCIscreen from '@/src/components/kci/KCIscreen.js';
import playWavFile from '@/src/utils/playWavFile.js';
import eventEmitter from '@shared/utils/eventEmitter';
import TopWindow from './TopWindow.js';
import SelectMission from './SelectMission.js';
import midiLookup from '@shared/utils/midiLookup.json';
import '@/src/styles/kci/kciGUI.css';

const KciGUI = ({
  levelProperties,
  accomplishments,
  currentMission,
  setCurrentMission,
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
  noteAlien,
  setNoteAlien,
  alienNumber,
  nTargetsDestroyed,
  setNTargetsDestroyed,
  destroyRatio,
  shoot,
  setShoot,
  showSelectMissionWindow,
  setShowSelectMissionWindow,
  showAnimation,
  setShowAnimation,
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
  level,
  setLevel,
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
  score,
  nFalseAttempts,
  noteCounter
}) => {

  const [showSettings, setShowSettings] = useState(false);
  const [showMoreSettings, setShowMoreSettings] = useState(null);
  const [changeTonality, setChangeTonality] = useState(false);
  const [changeRange, setChangeRange] = useState(false);

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
      case 'pause':
        setControlEvent('pause');
        break;
      case 'restartMission':
        setControlEvent('restartMission');
        break;
      case 'selectMission':
        setTrainingStarted(true);
        setControlEvent('selectMission');
        break;
      case 'resetGame':
        setTrainingStarted(true);
        setControlEvent('resetGame');
        break;
      case 'quit':
          if (audioCom) playWavFile('/game_sounds/Space_sound.wav', 0.1);
          setControlEvent('quit');
          break;
      case 'chords':
        if (audioCom) playWavFile('/game_sounds/Space_sound.wav', 0.1);
        setChords(sValue);
        break;
      case 'oct':
        if (audioCom) playWavFile('/game_sounds/Space_sound.wav', 0.1);
        setOct(sValue);
        break;

      case 'subTask':
        if (audioCom) playWavFile('/game_sounds/Space_sound.wav', 0.1);
        if (!((sValue === 'notes') || (sValue === 'chords'))) {
          const monitorMessage = "Coming Soon ... ";
          eventEmitter.emit('updateMonitorMessage', monitorMessage);
        }
        else {
          setSubTask(sValue)
          if ((sValue === 'chords') && (level < 2)) {
            const monitorMessage = "Range Increased to Allow for Chords";
            eventEmitter.emit('updateMonitorMessage', monitorMessage);
            setLevel(2);
          }
        }
        // setTask(sValue);
        break;
      case 'task':
        if (audioCom) playWavFile('/game_sounds/Space_sound.wav', 0.1);
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
        if (audioCom) playWavFile('/game_sounds/Space_sound.wav', 0.1);
        setChangeTonality(!changeTonality);
        setShowMoreSettings(null)
        break;
      case 'changeRange':
        if (audioCom) playWavFile('/game_sounds/Space_sound.wav', 0.1);
        setChangeRange(!changeRange);
        setShowMoreSettings(null)
        break;
      case 'rangeLoLimit':
        console.log("change range low limit");
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
        console.log("new limit = " + rangeLoLimit)
        if (audioCom) playWavFile('/game_sounds/Space_sound.wav', 0.1);
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
        if (audioCom) playWavFile('/game_sounds/Space_sound.wav', 0.1);
        break;
      case 'whichKeys':
        setWhichKeys(sValue);
        if (audioCom) playWavFile('/game_sounds/Space_sound.wav', 0.1);
        break;
      case 'rangeType':
        if (sValue === 'custom') {
          if (currentUserData.getFeatureName() === 'key_commander_full') {
            setRangeType(sValue);
            setLevel(0);
          }
          else {
            const monitorMessage = "Upgrade your account to access this feature";
            eventEmitter.emit('updateMonitorMessage', monitorMessage);
          }
        }
        if (sValue === 'standard') {
          setLevel(1);
        }
        if (audioCom) playWavFile('/game_sounds/Space_sound.wav', 0.1);
        break;
      case 'showSettings':
        if (audioCom) playWavFile('/game_sounds/Space_sound.wav', 0.1);
        if (!trainingStarted) {
          {
            if (showSettings) {
              setChangeRange(false);
              setChangeTonality(false);
              setShowMoreSettings(null);
            }
            setShowHighScores(false);
            setShowSettings(!showSettings);
          }
        }
        else {
          const monitorMessage = "Can't change settings while game is running";
          eventEmitter.emit('updateMonitorMessage', monitorMessage);
        }
        break
      case 'showMoreSettings':
        if (audioCom) playWavFile('/game_sounds/Space_sound.wav', 0.1);
        if (!trainingStarted) {
          if (changeTonality) setChangeTonality(false);
          if (changeRange) setChangeRange(false);
          if (showMoreSettings === sValue)
            setShowMoreSettings(null)
          else
            setShowMoreSettings(sValue);
        }
        else {
          const monitorMessage = "Can't change settings while game is running";
          eventEmitter.emit('updateMonitorMessage', monitorMessage);
        }
        break;
      case 'displayHighscores':
        if (audioCom) playWavFile('/game_sounds/Space_sound.wav', 0.1);
        setShowHighScores(!showHighScores);
        break;
      case 'aCom':
        if (!audioCom) playWavFile('/game_sounds/Space_sound.wav', 0.1);
        setAudioCom(!audioCom);
        break;
      case 'vCom':
        setVisualCom(!visualCom);
        if (audioCom) playWavFile('/game_sounds/Space_sound.wav', 0.1);
        break;
      case 'showAnimation':
        setShowAnimation(!showAnimation);
        if (audioCom) playWavFile('/game_sounds/Space_sound.wav', 0.1);
        break;
      case 'tNumber':
        setNumberOfNotes(sValue);
        if (audioCom) playWavFile('/game_sounds/Space_sound.wav', 0.1);
        break;
      case 'level':
        if (whichKeys === "onScreen")
          if (sValue < 5)
            setLevel(sValue);
          else {
            setLevel(4);
            const monitorMessage = "Onscreen keyboard size is limited";
            eventEmitter.emit('updateMonitorMessage', monitorMessage);
          }
        else setLevel(sValue);
        if (audioCom) playWavFile('/game_sounds/Space_sound.wav', 0.1);
        break;
      case 'reference':
        setReference(sValue);
        if (audioCom) playWavFile('/game_sounds/Space_sound.wav', 0.1);
        break;
      case 'replayAfter':
        setReplayAfter(sValue);
        if (audioCom) playWavFile('/game_sounds/Space_sound.wav', 0.1);
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

  return (
    <div className="cockpit-container">
      <TopWindow show={false}
        trainingPaused={trainingPaused}
        setTrainingPaused={setTrainingPaused} />
      <SelectMission
        showSelectMissionWindow={showSelectMissionWindow}
        setShowSelectMissionWindow={setShowSelectMissionWindow}
        accomplishments={accomplishments}
        currentMission={currentMission}
        selectCurrentMission={setCurrentMission}
        trainingPaused={trainingPaused}
        setTrainingPaused={setTrainingPaused} />
      {shatter && <Shatter pointCount={((100 - health) * (120 - health)) / 100} />}
      <div className="window-container">

      {/* {showHighScores && <ShowHighScores
          setShowHighScores={setShowHighScores}
          trainingDataList={trainingDataList} // Pass the training data list to ShowHighScores
      />} */}
        {!showHighScores &&
          <KCIscreen
            starField={!showOverlay}
            visualCom={visualCom}
            showOverlay={showOverlay}
            showAnimation={showAnimation}
            shoot={shoot}
            noteAlien={noteAlien}
            setNoteAlien={setNoteAlien}
            travelSpeed={levelProperties.travelSpeed}
            trainingPaused={trainingPaused}
          />
        }
      </div>

      <div className="control-container">

        {!showSettings &&
          < HealthBar
            health={health}
            lives={lives} />
        }

        {!showSettings  &&
          < KCI_BarDisplay name={"Ammo"}
            number={1}
            value={ammo}
            red={0} />
        }

        {!showSettings &&
          < KCI_BarDisplay
            name={"Encountered"}
            value={alienNumber}
            maxValue={levelProperties.aliens.length}
            rate={destroyRatio} />
        }

        {!showSettings  &&
          < KCI_BarDisplay name={"Destroyed"}
            number={2}
            value={nTargetsDestroyed}
            maxValue={levelProperties.aliens.length}
            redValue={0}
            ratio={destroyRatio.toFixed(2)}
            redRatio={levelProperties.destroyRateRequirement} />
        }

        {!showSettings &&
          < KCI_BarDisplay name={"Hit Rate"}
            number={1}
            value={score.toFixed(2)}
            unit={'%'}
            redValue={levelProperties.destroyPerShotRequirement} />
        }

        {!showSettings &&
          < KCI_BarDisplay name={"XP"}
            value={xp}
            maxValue={500}
            redValue={0} />
        }

      </div>

      {
        (showKeyboard) &&
        <div className="window-container">
          <div className="name-container">
            <DemoKeyboard
              keyRangeList={keyRangeList} />
          </div>
        </div >
      }
      <div className="control-container">
        <div className="k-table">
          <div>
            <div className="table-row">

              {!showSettings &&
                <div>
                  <div className="table-cell">
                    <button
                      className={`k-button ${trainingStarted ? 'selected' : ''}`}
                      onClick={() => changeSettings('run', null)}
                    >
                      RUN
                    </button>

                    <button
                      className={`k-button ${!trainingStarted ? 'selected' : ''}`}
                      onClick={() => changeSettings('stop', null)}
                    >
                      STOP
                    </button>

                    <button
                      className={`k-button ${trainingPaused ? 'selected' : ''}`}
                      onClick={() => changeSettings('pause', null)}
                    >
                      PAUSE
                    </button>

                    <button
                      className={`k-button ${(showSettings) ? 'selected' : ''}`}
                      onClick={() => changeSettings('restartMission', null)}
                    >
                      Restart Mission
                    </button>

                    <button
                      className={`k-button ${(showSettings) ? 'selected' : ''}`}
                      onClick={() => changeSettings('selectMission', null)}
                    >
                      Select Mission
                    </button>

                    <button
                      className={`k-button ${(showSettings) ? 'selected' : ''}`}
                      onClick={() => changeSettings('resetGame', null)}
                    >
                      Reset Game
                    </button>

                    <button
                      className={`k-button ${(showSettings) ? 'selected' : ''}`}
                      onClick={() => changeSettings('showSettings', null)}
                    >
                      Settings
                    </button>

                    {/* 
                    <button
                      className={`${showHighScores ? 'selected' : ''}`}
                      onClick={() => changeSettings('displayHighscores', null)}
                    >
                      Highscores
                    </button> */}

                    <button
                      className={`k-button ${(showSettings) ? 'selected' : ''}`} 
                      onClick={() => changeSettings('quit', null)}
                    >
                      Quit
                    </button>
                  </div>
                </div>
              }

              {showSettings &&
                <div>
                  <div className="table-cell">Design Your Game:</div>
                  <div className="table-cell">
                    <button
                      className={`k-button ${(showSettings) ? 'selected' : ''}`}
                      onClick={() => changeSettings('showSettings', null)}
                    >
                      Exit Settings
                    </button>

                    <button
                      className={`k-button ${(showMoreSettings === 'keyboard') ? 'selected' : ''}`}
                      onClick={() => changeSettings('showMoreSettings', 'keyboard')}
                    >
                      Keyboard Selection
                    </button>

                    {/*    <button
                      className={`${(showMoreSettings === 'comms') ? 'selected' : ''}`}
                      onClick={() => changeSettings('showMoreSettings', 'comms')}
                    >
                      Sound and Visuals
                    </button>
 */}
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>

      {(showSettings && changeTonality) &&
        <div className="window-container">
          <div className='k-table'>
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
              <div className="k-table">
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
            <div className="k-table">
              <div className="table-row">
                <div className="table-cell">How Many Target Notes (to find):</div>
                <div className="table-cell">
                  <SelectorButton value="5" selected={numberOfNotes === 5}
                    onClick={() => changeSettings('tNumber', 5)} />
                  <SelectorButton value="10" selected={numberOfNotes === 10}
                    onClick={() => changeSettings('tNumber', 10)} />
                  <SelectorButton value="20" selected={numberOfNotes === 20}
                    onClick={() => changeSettings('tNumber', 20)} />
                  <SelectorButton value="50" selected={numberOfNotes === 50}
                    onClick={() => changeSettings('tNumber', 50)} />
                  <SelectorButton value="100" selected={numberOfNotes === 100}
                    onClick={() => changeSettings('tNumber', 100)} />
                  <SelectorButton value="200" selected={numberOfNotes === 200}
                    onClick={() => changeSettings('tNumber', 200)} />
                </div>
              </div>
            </div>
          }

          {showSettings && (showMoreSettings === 'task') &&
            <div className="k-table">
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
            <div className="k-table">
              <div>
                <div className="table-row">
                  <div className="table-cell">Task Selection:</div>
                  <div className="table-cell">

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
                      Intervals
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
            <div className="k-table">
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
            <div className="k-table">
              <div className="table-row">
                <div className="table-cell">Communication:</div>
                <div className="table-cell">

                  <button
                    className={`${showAnimation ? 'selected' : ''}`}
                    onClick={() => changeSettings('showAnimation', null)}
                  >
                    Show Animation
                  </button>
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
            <div className="k-table">
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
            <div className="k-table">

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
            <div className="k-table">
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
            <div className="k-table">
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
            <div className="k-table">
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
            <div className="k-table">
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
            <div className="k-table">
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

      {(false) &&
        <div className="window-container">
          <div className="name-container">
            <h1>Key Commander I</h1>
          </div>
        </div>
      }

    </div >
  );
};

export default KciGUI;
