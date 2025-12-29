'use client';

import audiationStudio from '@/src/engines/audiationStudio.js';
import AudiationStudioGUIMobile from '@/src/components/audiationStudio/AudiationStudioGUIMobile.js';
import AudiationStudioGUIDesktop from '@/src/components/audiationStudio/AudiationStudioGUIDesktop.js';
import TeacherComponent from '@/src/components/audiationStudio/TeacherComponent.js';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import { usePerformanceData } from '@/src/hooks/usePerformanceData';
import eventEmitter from '@shared/utils/eventEmitter';

import { high_score } from '@data/audiation-studio/userData.js'; // adjust path as needed
import noteListGenerator from '@shared/utils/noteListGenerator';
import playWavFile from '@/src/utils/playWavFile';

const AudiationStudioPage = ({ currentUserData, setCurrentPage }) => {
    const { currentUser } = useAuth();
    const { savePerformanceData, loadPerformanceData } = usePerformanceData();
    const [isMobile, setIsMobile] = useState(true);
    const [showTeacherComponent, setShowTeacherComponent] = useState(true);

    let zeroVector = Array.from({ length: 36 }, () => Array(10).fill(0));
    // interval score vector
    // the order is descending (inverse), ascending, harmonic.
    const router = useRouter();
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(1);

    const [aiActive, setAiActive] = useState(false);
    const [intervalScoreVector, setIntervalScoreVector] = useState(zeroVector);
    const descendingInitialVector = [1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1];
    const ascendingInitialVector = [0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1];
    const harmonicInitialVector = [0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0];

    const [ascendingVector, setAscendingVector] = useState(ascendingInitialVector);
    const [descendingVector, setDescendingVector] = useState(descendingInitialVector);
    const [harmonicVector, setHarmonicVector] = useState(harmonicInitialVector);
    const [ascending, setAscending] = useState(true);
    const [descending, setDescending] = useState(false);
    const [harmonic, setHarmonic] = useState(false);
    const [randomIntervalRoot, setRandomIntervalRoot] = useState(false);
    const [gameLevel, setGameLevel] = useState();
    const [chords, setChords] = useState('random');
    const [subTask, setSubTask] = useState('intervals');
    const [oct, setOct] = useState(2);
    const [controlEvent, setControlEvent] = useState(null);
    const [scoreLoaded, setScoreLoaded] = useState(false);
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
    const [showHighScores, setShowHighScores] = useState(true);
    const [numberOfTargets, setNumberOfTargets] = useState(20);
    const [showOverlay, setShowOverlay] = useState(false);
    const [overlayShown, setOverlayShown] = useState(false);
    const [tonality, setTonality] = useState('C');
    const [reference, setReference] = useState(5);
    const [feedback, setFeedback] = useState('Too high/low');
    const [trainingStarted, setTrainingStarted] = useState(false);
    const [trainingPaused, setTrainingPaused] = useState(false);
    const [feedbackAV, setFeedbackAV] = useState('Audio + Visual');
    const [gameOver, setGameOver] = useState(false);
    const [nFalseAttempts, setNFalseAttempts] = useState(0);
    const [noteCounter, setNoteCounter] = useState(0);
    const [midiNotePressed, setMidiNotePressed] = useState(null);
    const [showAnimation, setShowAnimation] = useState(false);
    // Timer-based training states
    const [trainingDuration, setTrainingDuration] = useState(2.5 * 60 * 1000); // 2.5 minutes default
    const [remainingTime, setRemainingTime] = useState(2.5 * 60 * 1000);
    const [timeString, setTimeString] = useState('2:30');
    const [gamesCompleted, setGamesCompleted] = useState(0);

    // Handler functions for TeacherComponent
    const handlePersonalizedSession = () => {
        // TODO: Implement personalized session logic
        console.log('Personalized session selected - not implemented yet');
    };

    const handleManualSettings = () => {
        setShowTeacherComponent(false);
    };

    useEffect(() => {
        function checkMobile() {
          const width = window.innerWidth;
          const height = window.innerHeight;
          setIsMobile(Math.min(width, height) <= 768);
        }
    
        checkMobile();
        window.addEventListener('resize', checkMobile);
    
        return () => window.removeEventListener('resize', checkMobile);
      }, []);

    // Load performance data when component mounts if user is logged in
    useEffect(() => {
        if (currentUser) {
            // console.log('🔄 AudiationStudioPage: User logged in, loading performance data for user:', currentUser);
            loadPerformanceData().catch(error => {
                // console.log('⚠️ AudiationStudioPage: Failed to load performance data, but continuing with defaults:', error.message);
                // Error is already handled in usePerformanceData hook, just log here
            });
        } else {
            // console.log('ℹ️ AudiationStudioPage: No user logged in, skipping performance data load');
        }
    }, [currentUser]); // Only depend on currentUser, not the function

    // Event listeners for performance data save/load requests from Audiation Studio engine
    useEffect(() => {
        const handleSavePerformanceData = (event) => {
            // console.log('Save performance data event received');
            savePerformanceData().catch(error => {
                // console.log('⚠️ AudiationStudioPage: Failed to save performance data:', error.message);
            });
        };

        const handleLoadPerformanceData = (event) => {
            // console.log('Load performance data event received');
            loadPerformanceData().catch(error => {
                // console.log('⚠️ AudiationStudioPage: Failed to load performance data, but continuing:', error.message);
            });
        };

        eventEmitter.on('savePerformanceData', handleSavePerformanceData);
        eventEmitter.on('loadPerformanceData', handleLoadPerformanceData);

        return () => {
            eventEmitter.off('savePerformanceData', handleSavePerformanceData);
            eventEmitter.off('loadPerformanceData', handleLoadPerformanceData);
        };
    }, [savePerformanceData, loadPerformanceData]);
    
    useEffect(() => {
        if (!currentUserData || typeof currentUserData.getUserID !== 'function') return;

        const user_ID = currentUserData.getUserID();
        if (!scoreLoaded) {
            const fetchHighScores = async () => {
                try {
                    const response = await fetch(`/api/highScores/${user_ID}`);
                    const data = await response.json();
                    if (data.success) {
                        const highScores = data.highScores.map(score =>
                            new high_score(score.percent, score.date, score.time, score.level)
                        );
                        setTrainingDataList(highScores);
                    }
                } catch (error) {
                    console.error('Error fetching high scores:', error);
                }
            };
            fetchHighScores();
            setScoreLoaded(true);
        }

        let noteListLocal, keyRangeListLocal;
        if (gameOrTraining === 'game') {
            setShowAnimation(true);
            if (audioCom) playWavFile('/game_sounds/Darkside.wav');
        }
        setShowOverlay(true);
        setOverlayShown(true);
        [noteListLocal, keyRangeListLocal] = noteListGenerator(task, subTask, tonality, oct, level, rangeLoLimit, rangeUpLimit);
        setKeyRangeList(keyRangeListLocal);
    }, [currentUserData]);

    useEffect(() => {
        let noteListLocal;
        let keyRangeListLocal;
        [noteListLocal, keyRangeListLocal] = noteListGenerator(task, subTask, tonality, oct, level, rangeLoLimit, rangeUpLimit);
        // console.log("level: " + level);
        setKeyRangeList(keyRangeListLocal);
        // console.log("ShowOverlay set to true");
    }, [task, subTask, oct, tonality, level, rangeLoLimit, rangeUpLimit, rangeType]); // Empty dependency array ensures this runs only once

    useEffect(() => {

        if ((controlEvent === 'run') && (task == 'ear') && (subTask == 'intervals')) {
            setTrainingStarted(true);
            setOct(2);
            
            // Check if user is logged in
            const isLoggedIn = currentUser && currentUser.user_ID;
            
            audiationStudio.startTraining(
                intervalScoreVector,
                task, subTask,
                ascending, descending, harmonic,
                ascendingVector, descendingVector, harmonicVector,
                randomIntervalRoot,
                whichKeys, oct, level, rangeLoLimit, rangeUpLimit,
                tonality, trainingDuration, reference,
                audioCom, visualCom, replayAfter, showAnimation, isLoggedIn);
            setControlEvent(null);
        }

        if (controlEvent === 'stop') {
            // console.log("Stop has been pressed");
            const newTrainingDataList = audiationStudio.stopTraining();
            // console.log("Score to be written: " + newTrainingDataList);
            setShowOverlay(true);
            setTrainingDataList(newTrainingDataList);
            // console.log("List: " + trainingDataList[0]);
            setControlEvent(null);
            setTrainingStarted(false);
            // setNoteAlien(false);
        }

        if (controlEvent === 'finished') {
            // console.log("Stop has been pressed");
            const newTrainingDataList = audiationStudio.stopTraining();
            setTrainingDataList(newTrainingDataList);
            // console.log("List: " + trainingDataList[0]);
            setControlEvent(null);
            setTrainingStarted(false);
            // Increment games completed counter
            setGamesCompleted(prev => prev + 1);
        }

        if (controlEvent === 'quit') {


            const newTrainingDataList = audiationStudio.stopTraining();

            setControlEvent(null);
            setTrainingStarted(false);
            router.push('/');
        }
        if (controlEvent === 'help') {
            router.push('/help');
        }
    }, [controlEvent]);

    useEffect(() => {
        const handleUpdateKeyboard = (keyRangeList) => {
            // console.log("Keyboard update event received");
            // console.log("Keyboard update event received: " + keyRangeList);
            setKeyRangeList(keyRangeList);
        };

        eventEmitter.on('updateKeyboard', handleUpdateKeyboard);

        return () => {
            eventEmitter.off('updateKeyboard', handleUpdateKeyboard);
        };
    }, []);

    useEffect(() => {
        const handleUpdateFalseAttempts = (falseAttempts) => {
            setNFalseAttempts(falseAttempts);
        };

        eventEmitter.on('updateFalseAttempts', handleUpdateFalseAttempts);

        return () => {
            eventEmitter.off('updateFalseAttempts', handleUpdateFalseAttempts);
        };
    }, []);

    useEffect(() => {
        const handleNoteNumberUpdate = (noteCounter) => {
            setNoteCounter(noteCounter);
        };

        eventEmitter.on('updateNoteCounter', handleNoteNumberUpdate);

        return () => {
            eventEmitter.off('updateNoteCounter', handleNoteNumberUpdate);
        };
    }, []);

    useEffect(() => {
        const handleUpdateControlEvent = (controlEvent) => {
            setControlEvent(controlEvent);
        };

        eventEmitter.on('updateControlEvent', handleUpdateControlEvent);

        return () => {
            eventEmitter.off('updateControlEvent', handleUpdateControlEvent);
        };
    }, []);

    useEffect(() => {
        const handleRepeatInterval = (event) => {
            audiationStudio.repeatInterval();
        };

        eventEmitter.on('repeatInterval', handleRepeatInterval);

        return () => {
            eventEmitter.off('repeatInterval', handleRepeatInterval);
        };
    }, []);

    useEffect(() => {
        const handleRemainingTimeUpdate = (timeData) => {
            setRemainingTime(timeData.remainingTime);
            setTimeString(timeData.timeString);
        };

        eventEmitter.on('updateRemainingTime', handleRemainingTimeUpdate);

        return () => {
            eventEmitter.off('updateRemainingTime', handleRemainingTimeUpdate);
        };
    }, []);

    useEffect(() => {
        const handleScoreUpdate = (scoreData) => {
            const sum2DArray = (arr) => {
                return arr.reduce((sum, row) => sum + row.reduce((rowSum, value) => rowSum + value, 0), 0);
            };

            // console.log("Score update event received");
            const tempScore = sum2DArray(scoreData);
            // console.log("Score updated: " + tempScore);
            setScore(tempScore);
            const tempLevel = Math.min(Math.floor(tempScore / 18) + 1, 10);
            setLevel(tempLevel);
            setIntervalScoreVector(scoreData);
            // console.log("Score vector updated: " + intervalScoreVector);
        };

        eventEmitter.on('updateScore', handleScoreUpdate);

        return () => {
            eventEmitter.off('updateScore', handleScoreUpdate);
        };
    }, []);

    useEffect(() => {
        // Update timeString when duration changes and training is not active
        if (!trainingStarted) {
            const minutes = Math.floor(trainingDuration / 60000);
            const seconds = Math.floor((trainingDuration % 60000) / 1000);
            setTimeString(`${minutes}:${seconds.toString().padStart(2, '0')}`);
            setRemainingTime(trainingDuration);
        }
    }, [trainingDuration, trainingStarted]);

    useEffect(() => {
        audiationStudio.initListeners();
        return () => {
            audiationStudio.removeListeners();
        };
    }, []);

    return (
        <>
            {showTeacherComponent ? (
                <TeacherComponent 
                    onPersonalizedSession={handlePersonalizedSession}
                    onManualSettings={handleManualSettings}
                />
            ) : (
                <>
                    {isMobile ? (
                        <AudiationStudioGUIMobile
                    score={score}
                    intervalScoreVector={intervalScoreVector}
                    level={level}
                    ascendingVector={ascendingVector}
                    descendingVector={descendingVector}
                    harmonicVector={harmonicVector}
                    setAscendingVector={setAscendingVector}
                    setDescendingVector={setDescendingVector}
                    setHarmonicVector={setHarmonicVector}
                    ascending={ascending}
                    setAscending={setAscending}
                    descending={descending}
                    setDescending={setDescending}
                    harmonic={harmonic}
                    randomIntervalRoot={randomIntervalRoot}
                    setRandomIntervalRoot={setRandomIntervalRoot}
                    setHarmonic={setHarmonic}
                    gameLevel={gameLevel}
                    setGameLevel={setGameLevel}
                    chords={chords}
                    setChords={setChords}
                    subTask={subTask}
                    setSubTask={setSubTask}
                    oct={oct}
                    setOct={setOct}
                    currentUserData={currentUserData}
                    controlEvent={controlEvent}
                    setControlEvent={setControlEvent}
                    task={task}
                    setTask={setTask}
                    keyboardSize={keyboardSize}
                    setKeyboardSize={setKeyboardSize}
                    rangeLoLimit={rangeLoLimit}
                    setRangeLoLimit={setRangeLoLimit}
                    rangeUpLimit={rangeUpLimit}
                    setRangeUpLimit={setRangeUpLimit}
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
                    trainingDuration={trainingDuration}
                    setTrainingDuration={setTrainingDuration}
                    remainingTime={remainingTime}
                    timeString={timeString}
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
                    nFalseAttempts={nFalseAttempts}
                    setNFalseAttempts={setNFalseAttempts}
                    noteCounter={noteCounter}
                    setNoteCounter={setNoteCounter}
                    midiNotePressed={midiNotePressed}
                    setMidiNotePressed={setMidiNotePressed}
                    gamesCompleted={gamesCompleted}
                />
            ) : (
           
                <AudiationStudioGUIDesktop
                    aiActive={aiActive}
                    setAiActive={setAiActive}
                    score={score}
                    intervalScoreVector={intervalScoreVector}
                    level={level}
                    ascendingVector={ascendingVector}
                    descendingVector={descendingVector}
                    harmonicVector={harmonicVector}
                    setAscendingVector={setAscendingVector}
                    setDescendingVector={setDescendingVector}
                    setHarmonicVector={setHarmonicVector}
                    ascending={ascending}
                    setAscending={setAscending}
                    descending={descending}
                    setDescending={setDescending}
                    harmonic={harmonic}
                    randomIntervalRoot={randomIntervalRoot}
                    setRandomIntervalRoot={setRandomIntervalRoot}
                    setHarmonic={setHarmonic}
                    gameLevel={gameLevel}
                    setGameLevel={setGameLevel}
                    chords={chords}
                    setChords={setChords}
                    subTask={subTask}
                    setSubTask={setSubTask}
                    oct={oct}
                    setOct={setOct}
                    currentUserData={currentUserData}
                    controlEvent={controlEvent}
                    setControlEvent={setControlEvent}
                    task={task}
                    setTask={setTask}
                    keyboardSize={keyboardSize}
                    setKeyboardSize={setKeyboardSize}
                    rangeLoLimit={rangeLoLimit}
                    setRangeLoLimit={setRangeLoLimit}
                    rangeUpLimit={rangeUpLimit}
                    setRangeUpLimit={setRangeUpLimit}
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
                    trainingDuration={trainingDuration}
                    setTrainingDuration={setTrainingDuration}
                    remainingTime={remainingTime}
                    timeString={timeString}
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
                    nFalseAttempts={nFalseAttempts}
                    setNFalseAttempts={setNFalseAttempts}
                    noteCounter={noteCounter}
                    setNoteCounter={setNoteCounter}
                    midiNotePressed={midiNotePressed}
                    setMidiNotePressed={setMidiNotePressed}
                    gamesCompleted={gamesCompleted}
                />
                    )}
                </>
            )}
        </>
    );
};

export default AudiationStudioPage; 