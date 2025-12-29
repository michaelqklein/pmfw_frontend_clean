'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import gameLevelsFile from '@shared/utils/levelsKeyCommanderI.json';
import KciGUI from './KciGUI.js';
import noteListGenerator from '@shared/utils/noteListGenerator.js';
import keyCommanderI from '@/src/engines/keyCommanderI.js';
import playWavFile from '@/src/utils/playWavFile.js';
import eventEmitter from '@shared/utils/eventEmitter';
import '@/src/styles/kci/kciGamePage.css';
import '@/src/styles/kci/kciGUI.css';


const KciGamePage = ({ setCurrentPage }) => {
    const { currentUser } = useAuth();
    const [initialized, setInitialized] = useState(false);
    // const [gameLevel, setGameLevel] = useState();
    const [levelProperties, setLevelProperties] = useState(gameLevelsFile.gameLevels[1]);
    const [currentMission, setCurrentMission] = useState(1); // Track selected mission
    const [accomplishments, setAccomplishments] = useState(null);
    const [lives, setLives] = useState(5);
    const [health, setHealth] = useState(100);
    const [ammo, setAmmo] = useState(0);
    const [xp, setXP] = useState(0);
    const [noteAlien, setNoteAlien] = useState(false);
    const [alienNumber, setAlienNumber] = useState(0);
    const [nTargetsDestroyed, setNTargetsDestroyed] = useState(0);
    const [destroyRatio, setDestroyRatio] = useState(0);
    const [shoot, setShoot] = useState(['off', 0]);
    const [shatter, setShatter] = useState(false);
    const [chords, setChords] = useState('random');
    const [subTask, setSubTask] = useState('notes');
    const [oct, setOct] = useState(1);
    const [controlEvent, setControlEvent] = useState(null);
    const [showSelectMissionWindow, setShowSelectMissionWindow] = useState(false);
    const [accLoaded, setAccLoaded] = useState(false);
    const [trainingDataList, setTrainingDataList] = useState([]); // New state for storing training data
    const [task, setTask] = useState('ear');
    const [keyboardSize, setKeyboardSize] = useState(25);
    const [rangeLoLimit, setRangeLoLimit] = useState(48);
    const [rangeUpLimit, setRangeUpLimit] = useState(72);
    const [whichKeys, setWhichKeys] = useState('onScreen');
    const [keyRangeList, setKeyRangeList] = useState([]);
    const [rangeType, setRangeType] = useState('standard');
    const [showKeyboard, setShowKeyboard] = useState(true);
    const [replayAfter, setReplayAfter] = useState(1000);
    const [audioCom, setAudioCom] = useState(true);
    const [visualCom, setVisualCom] = useState(true);
    const [showHighScores, setShowHighScores] = useState(false);
    const [numberOfTargets, setNumberOfTargets] = useState(20);
    const [showOverlay, setShowOverlay] = useState(false);
    const [overlayShown, setOverlayShown] = useState(false);
    const [level, setLevel] = useState(1);
    const [tonality, setTonality] = useState('C');
    const [reference, setReference] = useState(10);
    const [feedback, setFeedback] = useState('Too high/low');
    const [trainingStarted, setTrainingStarted] = useState(false);
    const [trainingPaused, setTrainingPaused] = useState(false);
    const [feedbackAV, setFeedbackAV] = useState('Audio + Visual');
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [nFalseAttempts, setNFalseAttempts] = useState(0);
    const [midiNotePressed, setMidiNotePressed] = useState(null);
    const [showAnimation, setShowAnimation] = useState(false);

    useEffect(() => {
        keyCommanderI.initialize();
        setInitialized(true);
    }, []);

    useEffect(() => {
        if (!initialized && currentUser && currentUser._id) {
            setInitialized(true);
            setAccomplishments(createUnlockedLevels(gameLevelsFile, 1));
            const user_ID = currentUser._id;
            console.log('userId: ', user_ID);
            if (!accLoaded) {
                setAccLoaded(true);
                const fetchAccomplishment = async () => {
                    try {
                        const response = await fetch(`http://localhost:3000/getAccomplishments/${user_ID}`);
                        const data = await response.json();
                        if (data.success) {
                            const accomplishment = data.accomplishments[0];
                            if (accomplishment) {
                                setAccomplishments(createUnlockedLevels(gameLevelsFile, accomplishment.current_mission));
                                setXP(accomplishment.XP);
                                setCurrentMission(accomplishment.current_mission);
                            } else {
                                console.error('No accomplishment found for the user, default values assigned.');
                            }
                        } else {
                            console.error('Failed to load accomplishment:', data.message);
                        }
                    } catch (error) {
                        console.error('Error fetching accomplishment:', error);
                    }
                };
                fetchAccomplishment();
            }
            console.log('*******************  NEW RUN ***********************');
            let noteListLocal;
            let keyRangeListLocal;
            setShowAnimation(true);
            if (audioCom) playWavFile('/game_sounds/Darkside.wav');
            setShowOverlay(true);
            setOverlayShown(true);
            [noteListLocal, keyRangeListLocal] = noteListGenerator(task, subTask, tonality, oct, level, rangeLoLimit, rangeUpLimit);
            setKeyRangeList(keyRangeListLocal);
        }
    }, [initialized, currentUser, accLoaded]);

    useEffect(() => {
        let noteListLocal;
        let keyRangeListLocal;
        [noteListLocal, keyRangeListLocal] = noteListGenerator(task, subTask, tonality, oct, level, rangeLoLimit, rangeUpLimit);
        // console.log("level: " + level);
        setKeyRangeList(keyRangeListLocal);
        // console.log("ShowOverlay set to true");
    }, [task, subTask, oct, tonality, level, rangeLoLimit, rangeUpLimit, rangeType]); // Empty dependency array ensures this runs only once

    // controls: 
    useEffect(() => {
        if (controlEvent === 'run') {
            console.log('starting Key Commander I');
            setShowOverlay(false);
            setTrainingStarted(true);
            keyCommanderI.run(whichKeys);
            setControlEvent(null);
        }

        if (controlEvent === 'stop') {
            console.log("Stop has been pressed");
            const newTrainingDataList = keyCommanderI.stop();
            console.log("Score to be written: " + newTrainingDataList);
            setShowOverlay(true);
            setTrainingDataList(newTrainingDataList);
            console.log("List: " + trainingDataList[0]);
            setControlEvent(null);
            setTrainingStarted(false);
            setNoteAlien(false);
            setControlEvent(null);
        }

        if (controlEvent === 'pause') {
            if (!trainingPaused) {
                keyCommanderI.pauseTraining();
                setTrainingPaused(true);
            }
            else if (trainingPaused) {
                keyCommanderI.unpauseTraining();
                setTrainingPaused(false);
            }
            setControlEvent(null);
        }

        if (controlEvent === 'restartMission') {
            setShowOverlay(false);
            setTrainingStarted(false);
            setNoteAlien(false);
            setTrainingStarted(true);
            keyCommanderI.restartMission(whichKeys);
            setControlEvent(null);
        }

        if (controlEvent === 'selectMission') {
            const newTrainingDataList = keyCommanderI.stop();
            setTrainingStarted(false);
            setNoteAlien(false);
            setShowSelectMissionWindow(true);
            setControlEvent(null);
        }

        if (controlEvent === 'resetGame') {
            setTrainingStarted(false);
            if (!trainingPaused) {
                setTrainingPaused(true);
            }
            setAccomplishments(createUnlockedLevels(gameLevelsFile, 1));
            keyCommanderI.resetGame(whichKeys);
            setControlEvent(null);
        }

        if (controlEvent === 'finished') {
            console.log("Stop has been pressed");
            const newTrainingDataList = PianoGym.stopTraining();
            setTrainingDataList(newTrainingDataList);
            console.log("List: " + trainingDataList[0]);
            setControlEvent(null);
            setTrainingStarted(false);
        }

        if (controlEvent === 'quit') {
            keyCommanderI.quit();

            setControlEvent(null);
            setTrainingStarted(false);
            setCurrentPage('Training/Courses');
        }
    }, [controlEvent]);

    useEffect(() => {
        const handleUpdateKeyboard = (keyRangeListData) => {
            setKeyRangeList(keyRangeListData);
        };

        eventEmitter.on('updateKeyboard', handleUpdateKeyboard);

        return () => {
            eventEmitter.off('updateKeyboard', handleUpdateKeyboard);
        };
    }, []);

    useEffect(() => {
        const handleUpdateAmmo = (ammoValue) => {
            setAmmo(ammoValue);
        };

        eventEmitter.on('updateAmmo', handleUpdateAmmo);

        return () => {
            eventEmitter.off('updateAmmo', handleUpdateAmmo);
        };
    }, []);

    useEffect(() => {
        const handleUpdateLifes = (livesValue) => {
            setLives(livesValue);
        };

        eventEmitter.on('updateLifes', handleUpdateLifes);

        return () => {
            eventEmitter.off('updateLifes', handleUpdateLifes);
        };
    }, []);

    useEffect(() => {
        const handleShatter = (shatterValue) => {
            if (shatterValue) setShatter(true);
            else setShatter(false);
        };

        eventEmitter.on('updateShatter', handleShatter);

        return () => {
            eventEmitter.off('updateShatter', handleShatter);
        };
    }, []);


    useEffect(() => {
        const handleUpdateHealth = (healthValue) => {
            setHealth(healthValue);
        };

        eventEmitter.on('updateHealth', handleUpdateHealth);

        return () => {
            eventEmitter.off('updateHealth', handleUpdateHealth);
        };
    }, []);

    useEffect(() => {
        const handleUpdateAlienNumber = (alienNumberValue) => {
            setAlienNumber(alienNumberValue);
        };
        const handleUpdateDestroyRatio = (destroyRatioValue) => {
            setDestroyRatio(destroyRatioValue);
        };
        const handleUpdateLevelProperties = (levelPropertiesData) => {
            // console.log("game_page, travelSpeed: ", levelProperties.travelSpeed);
            setLevelProperties(levelPropertiesData);
        };
        const handleUpdateXP = (xpValue) => {
            setXP(xpValue);
        };

        const handleUpdateAccomplishments = (accomplishmentsValue) => {
            setAccomplishments(createUnlockedLevels(gameLevelsFile, accomplishmentsValue));
        };

        const handleUpdateMission = (missionValue) => {
            setCurrentMission(missionValue);
        };

        const handleSelectMissionClosed = (missionValue) => {
            setCurrentMission(missionValue);
            keyCommanderI.selectMission(missionValue);
            console.log("setting current mission to: ", missionValue);
        }

        eventEmitter.on('selectMissionClosed', handleSelectMissionClosed);
        eventEmitter.on('updateCurrentMission', handleUpdateMission);
        eventEmitter.on('updateAccomplishments', handleUpdateAccomplishments);
        eventEmitter.on('updateXP', handleUpdateXP);
        eventEmitter.on('updateLevelProperties', handleUpdateLevelProperties);
        eventEmitter.on('updateAlienNumber', handleUpdateAlienNumber);
        eventEmitter.on('updateDestroyRatio', handleUpdateDestroyRatio);

        return () => {
            eventEmitter.off('selectMissionClosed', handleSelectMissionClosed);
            eventEmitter.off('updateCurrentMission', handleUpdateMission);
            eventEmitter.off('updateAccomplishments', handleUpdateAccomplishments);
            eventEmitter.off('updateXP', handleUpdateXP);
            eventEmitter.off('updateLevelProperties', handleUpdateLevelProperties);
            eventEmitter.off('updateAlienNumber', handleUpdateAlienNumber);
            eventEmitter.off('updateDestroyRatio', handleUpdateDestroyRatio);
        };
    }, []);

    useEffect(() => {
        const handleUpdateFalseAttempts = (falseAttemptsValue) => {
            setNFalseAttempts(falseAttemptsValue);
        };

        eventEmitter.on('updateFalseAttempts', handleUpdateFalseAttempts);

        return () => {
            eventEmitter.off('updateFalseAttempts', handleUpdateFalseAttempts);
        };
    }, []);

    useEffect(() => {
        const handleNTargetsDestroyedUpdate = (nTargetsDestroyedValue) => {
            setNTargetsDestroyed(nTargetsDestroyedValue);
        };

        eventEmitter.on('updateNTargetsDestroyed', handleNTargetsDestroyedUpdate);

        return () => {
            eventEmitter.off('updateNTargetsDestroyed', handleNTargetsDestroyedUpdate);
        };
    }, []);

    useEffect(() => {
        const handleUpdateControlEvent = (controlEventValue) => {
            setControlEvent(controlEventValue);
        };

        eventEmitter.on('updateControlEvent', handleUpdateControlEvent);

        return () => {
            eventEmitter.off('updateControlEvent', handleUpdateControlEvent);
        };
    }, []);

    useEffect(() => {
        const handleScoreUpdate = (scoreValue) => {
            setScore(scoreValue);
        };

        eventEmitter.on('updateScore', handleScoreUpdate);

        return () => {
            eventEmitter.off('updateScore', handleScoreUpdate);
        };
    }, []);

    // saving the user's accomplishments
    useEffect(() => {
        const saveAccomplishments = (accomplishmentData) => {
            const { current_mission, best_mission, XP } = accomplishmentData; // Destructure mission and XP from event details
            console.log('current_mission: ', current_mission);
            const user_ID = currentUser && currentUser._id; // Get the actual user ID
            if (!user_ID) {
                console.error('No user ID found in context.');
                return;
            }
            // Log the data to be sent
            console.log('Saving accomplishment with current_mission: ', current_mission, ' best_mission: ', best_mission, 'and XP:', XP);
            // Send the data to the backend
            fetch('http://localhost:3000/updateAccomplishments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_ID, accomplishments: [{ current_mission, best_mission, XP }] }) // Wrap in an array
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.success) {
                        console.log('Accomplishment saved successfully');
                    } else {
                        console.error('Failed to save accomplishment:', data.message);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        };
        eventEmitter.on('saveAccomplishments', saveAccomplishments);
        return () => {
            eventEmitter.off('saveAccomplishments', saveAccomplishments);
        };
    }, [currentUser]);


    const createUnlockedLevels = (gameLevelsFile, unlockedLevel) => {
        const returnAccomplishments = { gameLevels: {} };

        // Iterate through each level in the original gameLevels
        for (let level in gameLevelsFile.gameLevels) {
            returnAccomplishments.gameLevels[level] = {
                "unlocked": level <= unlockedLevel ? "1" : "0"
            };
        }

        // console.log(returnAccomplishments);
        return returnAccomplishments;
    };

    return (
        <KciGUI
            // gameLevel={gameLevel}
            // setGameLevel={setGameLevel}
            levelProperties={levelProperties}
            currentMission={currentMission}
            setCurrentMission={setCurrentMission}
            accomplishments={accomplishments}
            lives={lives}
            setLives={setLives}
            health={health}
            setHealth={setHealth}
            shatter={shatter}
            setShatter={setShatter}
            ammo={ammo}
            setAmmo={setAmmo}
            xp={xp}
            setXP={setXP}
            noteAlien={noteAlien}
            setNoteAlien={setNoteAlien}
            alienNumber={alienNumber}
            nTargetsDestroyed={nTargetsDestroyed}
            setNTargetsDestroyed={setNTargetsDestroyed}
            destroyRatio={destroyRatio}
            shoot={shoot}
            setShoot={setShoot}
            showSelectMissionWindow={showSelectMissionWindow}
            setShowSelectMissionWindow={setShowSelectMissionWindow}
            showAnimation={showAnimation}
            setShowAnimation={setShowAnimation}
            chords={chords}
            setChords={setChords}
            subTask={subTask}
            setSubTask={setSubTask}
            oct={oct}
            setOct={setOct}
            controlEvent={controlEvent}
            setControlEvent={setControlEvent}
            task={task}
            setTask={setTask}
            keyboardSize={keyboardSize}
            setKeyboardSize={setKeyboardSize}
            rangeLoLimit={rangeLoLimit}
            setRangeLoLimit={setRangeLoLimit}
            rangeUpLimit={rangeUpLimit}
            setRangeUpLimit={setRangeUpLimit} s
            whichKeys={whichKeys}
            setWhichKeys={setWhichKeys}
            keyRangeList={keyRangeList}
            setKeyRangeList={setKeyRangeList}
            rangeType={rangeType}
            setRangeType={setRangeType}
            trainingDataList={trainingDataList}
            showKeyboard={showKeyboard}
            setShowKeyboard={setShowKeyboard}
            showOverlay={showOverlay}
            setCurrentPage={setCurrentPage}
            replayAfter={replayAfter}
            setReplayAfter={setReplayAfter}
            audioCom={audioCom}
            setAudioCom={setAudioCom}
            visualCom={visualCom}
            setVisualCom={setVisualCom}
            showHighScores={showHighScores}
            setShowHighScores={setShowHighScores}
            numberOfNotes={numberOfTargets}
            setNumberOfNotes={setNumberOfTargets}
            level={level}
            setLevel={setLevel}
            tonality={tonality}
            setTonality={setTonality}
            reference={reference}
            setReference={setReference}
            feedback={feedback}
            setFeedback={setFeedback}
            trainingStarted={trainingStarted}
            setTrainingStarted={setTrainingStarted}
            trainingPaused={trainingPaused}
            setTrainingPaused={setTrainingPaused}
            feedbackAV={feedbackAV}
            setFeedbackAV={setFeedbackAV}
            score={score}
            setScore={setScore}
            nFalseAttempts={nFalseAttempts}
            setNFalseAttempts={setNFalseAttempts}
            noteCounter={nTargetsDestroyed}
            setNoteCounter={setNTargetsDestroyed}
            midiNotePressed={midiNotePressed}
            setMidiNotePressed={setMidiNotePressed}
        />
    );
};

export default KciGamePage;
