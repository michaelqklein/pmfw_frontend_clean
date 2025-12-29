'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createMelodyBricksEngine } from '@engines/melodyBricks';
import { webAudioAdapter } from '@/src/utils/webAudioAdapter';
import MBGUIMobile from '@/src/components/melody-bricks/MBGUIMobile';
import MBGUIDesktop from '@/src/components/melody-bricks/MBGUIDesktop';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import { useProduct } from '@/src/context/ProductContext';
import { usePerformanceData } from '@/src/hooks/usePerformanceData';
import { useMBLevelPerformanceData } from '@/src/hooks/useMBLevelPerformanceData';
import eventEmitter from '@shared/utils/eventEmitter';

import { high_score } from '@data/audiation-studio/userData'; // adjust path as needed
import noteListGenerator from '@shared/utils/noteListGenerator';
import noteListGeneratorIntervals from '@shared/utils/noteListGeneratorIntervals';
import playWavFile from '@/src/utils/playWavFile';
import levelsData from '@data/melodyBricks/levels.json';
import { getCurrentLevel, createLevelProgressData, updateLevelProgress, getActiveItems, syncLevelProgressWithDefinitions, hasProgressData } from '@/src/performance/melodyBricks/levelProgressData';
import MapCanvas from '@/src/canvases/melody-bricks/MapCanvas';
import MapCanvasMobile from '@/src/canvases/melody-bricks/MapCanvasMobile';
import ShopComponent from '@/src/components/melody-bricks/ShopComponent';
import Welcome from '@/src/components/melody-bricks/Welcome';
import IntroTextPopUp from '@/src/components/melody-bricks/IntroTextPopUp';
import { shopItems } from '@data/melodyBricks/shopData';
import RightSidebar from '@/src/components/melody-bricks/RightSidebar';
import ProgressView from '@/src/components/melody-bricks/ProgressView';
import SettingsView from '@/src/components/melody-bricks/SettingsView';
import { checkAccess } from '@/src/utils/checkAccess';

const MELODY_BRICKS_PRODUCT_ID = process.env.NEXT_PUBLIC_MELODY_BRICKS_VIRTUOSO_PRODUCT_ID;
const MELODY_BRICKS_PRICE_ID = process.env.NEXT_PUBLIC_MELODY_BRICKS_VIRTUOSO_PRICE_ID;

const MBPage = ({ currentUserData, setCurrentPage }) => {
    const { currentUser } = useAuth();
    const { setProductId, setPriceId, setFeatureId, setFeatureName, setFreeTrialAvailable, setBetaTesting } = useProduct();
    const { savePerformanceData, loadPerformanceData } = usePerformanceData();
    const { saveLevelPerformanceData, loadLevelPerformanceData } = useMBLevelPerformanceData();
    const [isMobile, setIsMobile] = useState(true);
    const router = useRouter();
    const searchParams = useSearchParams();
    const signupContextProcessed = useRef(false);
    const backendDataLoaded = useRef(false);

    // Create the game engine instance with web audio adapter
    const melodyBricks = useMemo(() => {
        console.log('🎮 MBPage: Creating melodyBricks engine instance (useMemo)');
        return createMelodyBricksEngine(webAudioAdapter);
    }, []); // Empty dependency array means it only creates once
    console.log('🎮 MBPage: Created melodyBricks engine instance:', melodyBricks);

    // Refs for MapCanvas components
    const mapCanvasRef = useRef(null);
    const mapCanvasMobileRef = useRef(null);

    let zeroVector = Array.from({ length: 36 }, () => Array(10).fill(0));
    // interval score vector
    // the order is descending (inverse), ascending, harmonic.
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(1);

    const [aiActive, setAiActive] = useState(false);
    const [intervalScoreVector, setIntervalScoreVector] = useState(zeroVector);
    const descendingInitialVector = [1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1];
    const ascendingInitialVector = [0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1];
    const harmonicInitialVector = [0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0];

    // Level progress data state
    const [levelProgress, setLevelProgress] = useState(() => createLevelProgressData());
    
    // Tab-like current view: 'sections' | 'levels' | 'progress' | 'settings' | 'shop' | 'game'
    const [currentView, setCurrentView] = useState('levels');
    const [currentSection, setCurrentSection] = useState('1');

    // Prevent body scrolling when map canvas is displayed or in settings/progress views
    useEffect(() => {
        if ((isMobile && (currentView === 'levels' || currentView === 'settings' || currentView === 'progress')) ||
            (!isMobile && (currentView === 'settings' || currentView === 'progress'))) {
            // Prevent main container scrolling for these views
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
        } else {
            // Restore body scrolling for other views (sections, shop, game, desktop levels)
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        }

        // Cleanup on unmount
        return () => {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        };
    }, [isMobile, currentView]);

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
      const [trainingDuration, setTrainingDuration] = useState(2.5 * 60 * 1000); // 2.5 minutes default (kept for backwards compatibility)
  const [remainingTime, setRemainingTime] = useState(0); // Now represents elapsed time, starts at 0
  const [timeString, setTimeString] = useState('0:00'); // Timer starts at 0:00
    const [gamesCompleted, setGamesCompleted] = useState(0);
    
    // Level management state
    const [currentLevel, setCurrentLevel] = useState(null);
    
    // Store the real game score from MBLevelScore for UI display
    const [realGameScore, setRealGameScore] = useState(0);
    
    // Track the last completed level for avatar movement
    const [lastCompletedLevelId, setLastCompletedLevelId] = useState(null);
    
    // Shop state
    const [showShop, setShowShop] = useState(false);
    
    // Welcome popup state - show every time page renders
    const [showWelcome, setShowWelcome] = useState(true);
    const [welcomeChecked, setWelcomeChecked] = useState(false);
    
    // Intro text popup state
    const [showIntroText, setShowIntroText] = useState(false);
    const [currentIntroText, setCurrentIntroText] = useState('');
    
    // Track game start time for duration calculation
    const [gameStartTime, setGameStartTime] = useState(null);
    const [launchedFromPayload, setLaunchedFromPayload] = useState(false);
    
    // Feedback sound settings
    const [correctSound, setCorrectSound] = useState('retrowin');
    const [correctVolume, setCorrectVolume] = useState(0.5);
    const [incorrectSound, setIncorrectSound] = useState('negative');
    const [incorrectVolume, setIncorrectVolume] = useState(0.5);

    // Handle level selection from MapCanvas
    const handlePlayLevel = (levelInfo) => {
        if (!levelInfo) {
            console.warn('No levelInfo provided to handlePlayLevel');
            return;
        }
        
        console.log('🎯 MBPage: Setting current level to:', levelInfo.name);
        
        // Reset the game score for the new game
        setRealGameScore(0);
        
        // Set game start time
        setGameStartTime(Date.now());
        
        // Set the current level
        setCurrentLevel(levelInfo);
        
        // Apply level settings
        const settings = levelInfo.settings;
        
        // Set interval types
        setAscending(settings.ascending);
        setDescending(settings.descending);
        setHarmonic(settings.harmonic);
        
        // Set interval vectors
        setAscendingVector(settings.ascendingVector);
        setDescendingVector(settings.descendingVector);
        setHarmonicVector(settings.harmonicVector);
        
        // Set other settings
        setRandomIntervalRoot(settings.randomIntervalRoot);
        
        // Generate keyRangeList immediately for 12 tone wall levels
        if (levelInfo.type === "12 tone wall") {
            const [noteList, keyRangeList] = noteListGeneratorIntervals(
                'ear', 
                'intervals', 
                settings.ascendingVector, 
                settings.descendingVector, 
                settings.harmonicVector, 
                'C', // tonality
                2,   // oct
                1,   // level
                48,  // rangeLoLimit
                72,  // rangeUpLimit
                levelInfo.type
            );
            setKeyRangeList(keyRangeList);
            console.log('🎹 MBPage: Generated keyRangeList for 12 tone wall:', keyRangeList);
        }
        
        // Close the map and show the game
        setCurrentView('game');
        
        // Show intro text popup instead of starting game immediately
        setCurrentIntroText(levelInfo.introText);
        setShowIntroText(true);
        
        console.log('🎮 MBPage: Level setup complete, showing intro text');
    };

    // Handle back to map navigation
    const handleBackToMap = () => {
        setCurrentView('levels');
        setTrainingStarted(false);
        setControlEvent('stop');
        
        // Auto-move avatar to next level if a level was just completed
        if (lastCompletedLevelId) {
            console.log(`🎯 Returning to map after completing level ${lastCompletedLevelId}, auto-moving avatar to next level`);
            
            // Small delay to ensure the map is rendered
            setTimeout(() => {
                if (isMobile && mapCanvasMobileRef.current) {
                    mapCanvasMobileRef.current.autoMoveToNextLevel(lastCompletedLevelId);
                } else if (!isMobile && mapCanvasRef.current) {
                    mapCanvasRef.current.autoMoveToNextLevel(lastCompletedLevelId);
                }
            }, 100);
            
            // Clear the last completed level ID
            setLastCompletedLevelId(null);
        }
    };

    // Handle level progress updates from MapCanvas
    const handleUpdateLevelProgress = (updatedProgress) => {
        console.log('MBPage debug - Updating levelProgress:', {
            oldTotalBleeps: levelProgress?.totalBleeps,
            newTotalBleeps: updatedProgress?.totalBleeps,
            updatedProgressKeys: updatedProgress ? Object.keys(updatedProgress) : 'No updatedProgress'
        });
        setLevelProgress(updatedProgress);
    };

    // Handle shop open/close
    const handleOpenShop = () => {
        console.log('MBPage debug - Opening shop with levelProgress:', {
            totalBleeps: levelProgress?.totalBleeps,
            levelProgressKeys: levelProgress ? Object.keys(levelProgress) : 'No levelProgress'
        });
        setShowShop(true);
        setCurrentView('shop');
    };

    const handleCloseShop = () => {
        setShowShop(false);
        // Return to previous non-modal view when closing shop
        if (currentView === 'shop') setCurrentView('levels');
    };

    const handleCloseWelcome = () => {
        setShowWelcome(false);
    };

    const handleCloseIntroText = () => {
        setShowIntroText(false);
        
        // For "12 tone wall" levels, trigger wall stacking first, then start game when complete
        if (currentLevel && currentLevel.type === "12 tone wall") {
            // Use a small delay to ensure the game canvas is ready
            setTimeout(() => {
                eventEmitter.emit('stackWall');
            }, 100);
            
            // Listen for wall stacking completion
            const handleWallStackingComplete = () => {
                setTrainingStarted(true);
                setControlEvent('run');
                eventEmitter.off('wallStackingComplete', handleWallStackingComplete);
            };
            eventEmitter.on('wallStackingComplete', handleWallStackingComplete);
        } else {
            // For non-12 tone wall levels, start immediately
            setTrainingStarted(true);
            setControlEvent('run');
        }
    };

    // Handle exit game
    const handleExitGame = () => {
        // If launched from course, return to course page; else go home
        const returnTo = searchParams.get('returnTo');
        if (returnTo) {
            router.push(returnTo);
        } else {
            router.push('/');
        }
    };

    // Set Melody Bricks product context when component mounts
    useEffect(() => {
        setProductId(MELODY_BRICKS_PRODUCT_ID);
        setPriceId(MELODY_BRICKS_PRICE_ID);
        setFeatureId(1);
        setFeatureName('Melody Bricks');
        setFreeTrialAvailable(false);
        setBetaTesting(false);
    }, [setProductId, setPriceId, setFeatureId, setFeatureName, setFreeTrialAvailable, setBetaTesting]);

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
    
    // Initialize current level
    useEffect(() => {
        // Check for JSON payload in URL parameters first
        const jsonPayload = searchParams.get('jsonPayload');
        if (jsonPayload) {
            try {
                const payloadLevel = JSON.parse(jsonPayload);
                console.log('🎮 MBPage: Using JSON payload level:', payloadLevel);
                setCurrentLevel(payloadLevel);
                // Set the view to game mode when using JSON payload
                setCurrentView('game');
                // Suppress welcome/intro when launched externally
                setShowWelcome(false);
                setWelcomeChecked(true);
                setShowIntroText(false);
                setLaunchedFromPayload(true);

                // Apply level settings just like when launched from map
                const settings = payloadLevel.settings || {};
                setAscending(!!settings.ascending);
                setDescending(!!settings.descending);
                setHarmonic(!!settings.harmonic);
                if (Array.isArray(settings.ascendingVector)) setAscendingVector(settings.ascendingVector);
                if (Array.isArray(settings.descendingVector)) setDescendingVector(settings.descendingVector);
                if (Array.isArray(settings.harmonicVector)) setHarmonicVector(settings.harmonicVector);
                setRandomIntervalRoot(!!settings.randomIntervalRoot);

                // For 12 tone wall, generate the 13-key one-octave keyboard range immediately
                if (payloadLevel.type === '12 tone wall') {
                    const [, keyRange] = noteListGeneratorIntervals(
                        'ear',
                        'intervals',
                        settings.ascendingVector || Array(12).fill(0),
                        settings.descendingVector || Array(12).fill(0),
                        settings.harmonicVector || Array(12).fill(0),
                        'C',
                        2,
                        1,
                        48,
                        72,
                        payloadLevel.type
                    );
                    setKeyRangeList(keyRange);
                    console.log('🎹 MBPage: (payload) Generated keyRangeList for 12 tone wall:', keyRange);
                }
                return;
            } catch (error) {
                console.error('🎮 MBPage: Error parsing JSON payload:', error);
            }
        }
        
        // Fallback to normal level selection
        const currentLevelId = getCurrentLevel(levelProgress);
        const level = levelsData.levels.find(l => l.id === currentLevelId);
        setCurrentLevel(level || levelsData.levels[0]); // Fallback to first level if none found
    }, [levelProgress, searchParams]);

    // If launched from payload, auto-stack (for 12 tone wall) and start the game
    useEffect(() => {
        if (!launchedFromPayload || !currentLevel || currentView !== 'game') return;

        if (currentLevel.type === '12 tone wall') {
            // Ensure canvas is ready, then stack, then start on completion
            setTimeout(() => {
                eventEmitter.emit('stackWall');
            }, 100);

            const handleWallStackingComplete = () => {
                setTrainingStarted(true);
                setControlEvent('run');
                eventEmitter.off('wallStackingComplete', handleWallStackingComplete);
                setLaunchedFromPayload(false);
            };
            eventEmitter.on('wallStackingComplete', handleWallStackingComplete);
        } else {
            setTrainingStarted(true);
            setControlEvent('run');
            setLaunchedFromPayload(false);
        }
    }, [launchedFromPayload, currentLevel, currentView]);
    
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
        
        // Only generate keyRangeList if not a 12 tone wall level (to avoid overriding the correct 1-octave keyboard)
        if (!currentLevel || currentLevel.type !== "12 tone wall") {
            [noteListLocal, keyRangeListLocal] = noteListGenerator(task, subTask, tonality, oct, level, rangeLoLimit, rangeUpLimit);
            setKeyRangeList(keyRangeListLocal);
        }
    }, [currentUserData]);

    useEffect(() => {
        let noteListLocal;
        let keyRangeListLocal;
        
        // Only generate keyRangeList if not a 12 tone wall level (to avoid overriding the correct 1-octave keyboard)
        if (!currentLevel || currentLevel.type !== "12 tone wall") {
            [noteListLocal, keyRangeListLocal] = noteListGenerator(task, subTask, tonality, oct, level, rangeLoLimit, rangeUpLimit);
            // console.log("level: " + level);
            setKeyRangeList(keyRangeListLocal);
            // console.log("ShowOverlay set to true");
        }
    }, [task, subTask, oct, tonality, level, rangeLoLimit, rangeUpLimit, rangeType, currentLevel]); // Added currentLevel to dependencies

    useEffect(() => {

        if ((controlEvent === 'run') && (task == 'ear') && (subTask == 'intervals')) {
            setTrainingStarted(true);
            setOct(2);
            
            // Check if user is logged in
            const isLoggedIn = currentUser && currentUser.user_ID;
            
            console.log('🎮 MBPage: About to call startTraining with currentLevel:', currentLevel);
            melodyBricks.startTraining(
                intervalScoreVector,
                task, subTask,
                currentLevel,
                randomIntervalRoot,
                whichKeys, oct, level, rangeLoLimit, rangeUpLimit,
                tonality, trainingDuration, reference,
                audioCom, visualCom, replayAfter, showAnimation, isLoggedIn, keyRangeList,
                correctSound, correctVolume, incorrectSound, incorrectVolume);
            setControlEvent(null);
        }

        if (controlEvent === 'stop') {
            // console.log("Stop has been pressed");
            const newTrainingDataList = melodyBricks.stopTraining();
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
            const newTrainingDataList = melodyBricks.stopTraining();
            setTrainingDataList(newTrainingDataList);
            // console.log("List: " + trainingDataList[0]);
            setControlEvent(null);
            setTrainingStarted(false);
            // Increment games completed counter
            setGamesCompleted(prev => prev + 1);
            // Don't return to map immediately - let MBGUIDesktop show game over popup first
            
            // Level progress update now handled in gameScore event
        }

        if (controlEvent === 'levelWon') {
            // Handle level completion
            const newTrainingDataList = melodyBricks.stopTraining();
            setTrainingDataList(newTrainingDataList);
            setControlEvent(null);
            setTrainingStarted(false);
            // Increment games completed counter
            setGamesCompleted(prev => prev + 1);
            // Don't return to map immediately - let MBGUIDesktop show game over popup first
        }

        if (controlEvent === 'quit') {


            const newTrainingDataList = melodyBricks.stopTraining();

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
            
            // Don't override keyRangeList for 12 tone wall levels (to preserve the correct 1-octave keyboard)
            if (!currentLevel || currentLevel.type !== "12 tone wall") {
                setKeyRangeList(keyRangeList);
            }
        };

        eventEmitter.on('updateKeyboard', handleUpdateKeyboard);

        return () => {
            eventEmitter.off('updateKeyboard', handleUpdateKeyboard);
        };
    }, [currentLevel]); // Added currentLevel to dependencies

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
            console.log(`🎮 Control event received: ${controlEvent}`);
            console.log(`🎮 Current level: ${currentLevel ? currentLevel.id : 'None'}`);
            
            setControlEvent(controlEvent);
        };

        eventEmitter.on('updateControlEvent', handleUpdateControlEvent);

        return () => {
            eventEmitter.off('updateControlEvent', handleUpdateControlEvent);
        };
    }, []);

    // Listen for unified game finished event (handles both wins and losses)
    useEffect(() => {
        const handleGameFinished = (gameData) => {
            console.log(`🎮 Game finished event received:`, gameData);
            
            if (gameData && gameData.levelId) {
                // Update the displayed score
                setRealGameScore(gameData.totalPoints);
                console.log(`🎮 Setting realGameScore to: ${gameData.totalPoints}`);
                
                // Calculate bleeps earned from this game (5 bleeps per perfect row)
                const bleepsEarned = (gameData.bonuses || 0) * 5;
                
                const levelScoreData = {
                    score: gameData.totalPoints,
                    time: gameData.duration,
                    completed: gameData.completed,
                    bleepsEarned: bleepsEarned
                };
                
                console.log(`🎮 Updating level progress for ${gameData.levelId}`);
                console.log(`🎮 Final score: ${gameData.totalPoints} (Accuracy: ${gameData.accuracyPoints}, Rows: ${gameData.rowPoints})`);
                console.log(`🎮 Bleeps earned: ${bleepsEarned} (from ${gameData.bonuses || 0} perfect rows)`);
                console.log(`🎮 Game result: ${gameData.reason}, Completed: ${gameData.completed}`);
                console.log(`🎮 Level score data being saved:`, levelScoreData);
                
                const updatedProgress = updateLevelProgress(levelProgress, gameData.levelId, levelScoreData);
                setLevelProgress(updatedProgress);
                
                console.log(`🎮 Level progress after update:`, updatedProgress[gameData.levelId]);
                
                // Save level progress data to backend if user is logged in
                if (currentUser) {
                    saveLevelPerformanceData(updatedProgress);
                }
                
                if (gameData.completed) {
                    console.log(`✅ Level ${gameData.levelId} completed! Score: ${gameData.totalPoints}`);
                    // Track the completed level for avatar movement
                    setLastCompletedLevelId(gameData.levelId);
                } else {
                    console.log(`❌ Level ${gameData.levelId} failed (${gameData.reason}) - Score: ${gameData.totalPoints}, attempts incremented`);
                }
            }
        };

        eventEmitter.on('gameFinished', handleGameFinished);

        return () => {
            eventEmitter.off('gameFinished', handleGameFinished);
        };
    }, [levelProgress]);

    useEffect(() => {
        const handleRepeatInterval = (event) => {
            melodyBricks.repeatInterval();
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
        // Reset timer to 0:00 when not training (timer now counts up from 0)
        if (!trainingStarted) {
            setTimeString('0:00');
            setRemainingTime(0);
        }
    }, [trainingStarted]);

    useEffect(() => {
        melodyBricks.initListeners();
        return () => {
            melodyBricks.removeListeners();
        };
    }, []);

    // Listen for level progress save to localStorage event
    useEffect(() => {
        const handleSaveLevelProgressToLocalStorage = () => {
            console.log('🔄 MBPage: Saving level progress data to localStorage');
            try {
                const temporaryData = {
                    level_progress_data: levelProgress,
                    timestamp: Date.now(),
                    expires: Date.now() + (24 * 60 * 60 * 1000) // Expire after 24 hours
                };
                
                localStorage.setItem('temporaryLevelProgressData', JSON.stringify(temporaryData));
                console.log('💾 MBPage: Temporary level progress data saved to localStorage');
            } catch (error) {
                console.error('❌ MBPage: Error saving temporary level progress data:', error);
            }
        };

        eventEmitter.on('saveLevelProgressToLocalStorage', handleSaveLevelProgressToLocalStorage);

        return () => {
            eventEmitter.off('saveLevelProgressToLocalStorage', handleSaveLevelProgressToLocalStorage);
        };
    }, [levelProgress]);

    // Load level performance data from backend for logged-in users (but not during signup flow)
    useEffect(() => {
        const loadLevelPerformanceDataFromBackend = async () => {
            // Prevent multiple loads
            if (backendDataLoaded.current) {
                return;
            }
            
            // Only load if user is logged in
            if (!currentUser) {
                return;
            }
            
            // Check if this is a signup flow - if so, don't load from backend
            const fromLogin = searchParams.get('fromLogin');
            const source = searchParams.get('source');
            const newUser = searchParams.get('newUser');
            const signupContextStr = sessionStorage.getItem('mbSignupContext');
            
            // Skip loading if this is a signup flow
            if (fromLogin === 'true' && source === 'gameOver' && newUser === 'true' && signupContextStr) {
                console.log('🔄 MBPage: Skipping backend load - user is in signup flow');
                return;
            }
            
            // Mark as loaded to prevent multiple calls
            backendDataLoaded.current = true;
            
            try {
                console.log('🔄 MBPage: Loading level performance data from backend...');
                const backendData = await loadLevelPerformanceData();
                
                if (backendData) {
                    console.log('📦 MBPage: Successfully loaded level performance data from backend');
                    // Sync the loaded data with current level definitions
                    const syncedData = syncLevelProgressWithDefinitions(backendData);
                    setLevelProgress(syncedData);
                    
                    // Check if there's meaningful progress data and hide Welcome popup if so
                    if (hasProgressData(syncedData)) {
                        console.log('📊 MBPage: Found existing progress data in backend, hiding Welcome popup');
                        setShowWelcome(false);
                        setWelcomeChecked(true);
                    }
                    
                    // Save the synced data back to backend if any changes were made
                    if (JSON.stringify(syncedData) !== JSON.stringify(backendData)) {
                        console.log('🔄 MBPage: Progress data was updated during sync, saving back to backend...');
                        saveLevelPerformanceData(syncedData);
                    }
                } else {
                    console.log('ℹ️ MBPage: No level performance data found in backend, using defaults');
                }
            } catch (error) {
                console.error('❌ MBPage: Error loading level performance data from backend:', error);
            }
        };

        loadLevelPerformanceDataFromBackend();
    }, []);

    // Check for existing progress data and conditionally show Welcome popup
    useEffect(() => {
        if (welcomeChecked) return; // Only check once
        
        // Check if there's any meaningful progress data
        const hasExistingProgress = hasProgressData(levelProgress);
        
        if (hasExistingProgress) {
            console.log('📊 MBPage: Found existing progress data, hiding Welcome popup');
            setShowWelcome(false);
        } else {
            console.log('📊 MBPage: No existing progress data found, showing Welcome popup');
        }
        
        setWelcomeChecked(true);
    }, [levelProgress, welcomeChecked]);

    // Handle signup context and localStorage restoration
    useEffect(() => {
        const handleSignupContext = async () => {
            // Prevent multiple executions
            if (signupContextProcessed.current) {
                return;
            }
            
            // Check URL parameters for signup context
            const fromLogin = searchParams.get('fromLogin');
            const source = searchParams.get('source');
            const newUser = searchParams.get('newUser');
            
            // Check sessionStorage for signup context
            const signupContextStr = sessionStorage.getItem('mbSignupContext');
            
            if (fromLogin === 'true' && source === 'gameOver' && newUser === 'true' && signupContextStr) {
                signupContextProcessed.current = true; // Mark as processed immediately
                
                try {
                    const signupContext = JSON.parse(signupContextStr);
                    
                    // Verify this is a valid signup context
                    if (signupContext.source === 'gameOver' && signupContext.journey === 'signup' && signupContext.hasLevelData) {
                        console.log('🔄 MBPage: Detected signup context from game over, checking localStorage...');
                        
                        // Check for temporary level progress data in localStorage
                        const storedData = localStorage.getItem('temporaryLevelProgressData');
                        if (storedData) {
                            try {
                                const temporaryData = JSON.parse(storedData);
                                
                                // Check if data has expired
                                if (Date.now() < temporaryData.expires) {
                                    console.log('📦 MBPage: Found valid temporary level progress data, restoring...');
                                    
                                    // Sync the temporary data with current level definitions
                                    const syncedData = syncLevelProgressWithDefinitions(temporaryData.level_progress_data);
                                    
                                    // Restore the synced level progress data to state
                                    setLevelProgress(syncedData);
                                    
                                    // Check if there's meaningful progress data and hide Welcome popup if so
                                    if (hasProgressData(syncedData)) {
                                        console.log('📊 MBPage: Found existing progress data in localStorage, hiding Welcome popup');
                                        setShowWelcome(false);
                                        setWelcomeChecked(true);
                                    }
                                    
                                    // Save the synced data to backend
                                    await saveLevelPerformanceData(syncedData);
                                    
                                    console.log('✅ MBPage: Level progress data restored and saved to backend');
                                } else {
                                    console.log('⏰ MBPage: Temporary level progress data expired');
                                }
                                
                                // Clear the temporary data
                                localStorage.removeItem('temporaryLevelProgressData');
                            } catch (error) {
                                console.error('❌ MBPage: Error parsing temporary level progress data:', error);
                                localStorage.removeItem('temporaryLevelProgressData');
                            }
                        } else {
                            console.log('ℹ️ MBPage: No temporary level progress data found in localStorage');
                        }
                    }
                    
                    // Clear the signup context
                    sessionStorage.removeItem('mbSignupContext');
                    
                    // Clean up URL parameters by replacing current history entry
                    const newUrl = window.location.pathname;
                    window.history.replaceState({}, '', newUrl);
                    
                } catch (error) {
                    console.error('❌ MBPage: Error handling signup context:', error);
                    sessionStorage.removeItem('mbSignupContext');
                }
            }
        };

        handleSignupContext();
    }, []); // Empty dependency array - only run once on mount

    // Add debug functions to window for development
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Import debug functions and add to window
            import('@/src/performance/melodyBricks/levelProgressData').then(module => {
                window.debugLevelUnlocks = module.debugLevelUnlocks;
                window.syncCurrentUserProgress = module.syncCurrentUserProgress;
                window.syncLevelProgressWithDefinitions = module.syncLevelProgressWithDefinitions;
                
                // Add shortcut to debug current level progress
                window.debugCurrentProgress = () => {
                    if (levelProgress) {
                        module.debugLevelUnlocks(levelProgress);
                    } else {
                        console.log('❌ No level progress data available');
                    }
                };
                
                console.log('🛠️ Debug functions added to window:');
                console.log('  - window.debugLevelUnlocks(progressData)');
                console.log('  - window.debugCurrentProgress()');
                console.log('  - window.syncCurrentUserProgress()');
                console.log('  - window.syncLevelProgressWithDefinitions(data)');
            });
        }
    }, []);

    // Update debug function when levelProgress changes
    useEffect(() => {
        if (typeof window !== 'undefined' && window.debugCurrentProgress) {
            window.debugCurrentProgress = () => {
                if (levelProgress) {
                    import('@/src/performance/melodyBricks/levelProgressData').then(module => {
                        module.debugLevelUnlocks(levelProgress);
                    });
                } else {
                    console.log('❌ No level progress data available');
                }
            };
        }
    }, [levelProgress]);

    // Function to get the active background image
    const getActiveBackgroundImage = () => {
        if (!levelProgress) return '/images/MelodyBricks.jpeg'; // Fallback
        
        const activeItems = getActiveItems(levelProgress);
        const activeBackgroundId = activeItems.background || 'default';
        
        // Find the background item in shop data
        const backgroundItem = shopItems.backgrounds.find(bg => bg.id === activeBackgroundId);
        
        return backgroundItem ? backgroundItem.image : '/images/MelodyBricks.jpeg';
    };

    return (
        <div 
            className={`bg-cover bg-center bg-no-repeat w-full ${isMobile ? 'h-screen overflow-hidden' : (currentView === 'settings' || currentView === 'progress' ? 'h-screen overflow-hidden' : 'min-h-screen')}`}
            style={{ backgroundImage: `url(${getActiveBackgroundImage()})` }}
        >
            {/* Main content area switches between Levels/Progress/Settings and Game */}
            {currentView !== 'game' ? (
                isMobile ? (
                    <>
                      {currentView === 'levels' && (
                        <MapCanvasMobile 
                            ref={mapCanvasMobileRef}
                            levelProgress={levelProgress}
                            onPlayLevel={handlePlayLevel}
                            onUpdateLevelProgress={handleUpdateLevelProgress}
                            onOpenShop={handleOpenShop}
                            onExitGame={handleExitGame}
                            correctSound={correctSound}
                            setCorrectSound={setCorrectSound}
                            correctVolume={correctVolume}
                            setCorrectVolume={setCorrectVolume}
                            incorrectSound={incorrectSound}
                            setIncorrectSound={setIncorrectSound}
                            incorrectVolume={incorrectVolume}
                            setIncorrectVolume={setIncorrectVolume}
                            section={currentSection}
                            onBackToSections={() => setCurrentView('sections')}
                            currentUnitLabel={currentLevel?.unit}
                        />
                      )}
                      {currentView === 'sections' && (
                        <div className="p-6 max-w-md mx-auto w-full">
                          <div className="grid grid-cols-1 gap-6">
                            {[{id:'1', name:'Ascending Intervals', emoji:'⬆️', premium:false},{id:'2', name:'Descending Intervals', emoji:'⬇️', premium:true}].map(sec => (
                              <button
                                key={sec.id}
                                onClick={async () => {
                                  if (sec.premium) {
                                    const isLoggedIn = currentUser && currentUser.user_ID;
                                    if (!isLoggedIn) {
                                      router.push('/upgrade/');
                                      return;
                                    }
                                    try {
                                      const { access } = await checkAccess(currentUser.user_ID, 1, 'Melody Bricks');
                                      if (!access) {
                                        router.push('/upgrade/');
                                        return;
                                      }
                                    } catch (e) {
                                      router.push('/upgrade/');
                                      return;
                                    }
                                  }
                                  setCurrentSection(sec.id);
                                  setCurrentView('levels');
                                }}
                                className={`bg-gray-900 border-2 rounded-xl p-6 text-left hover:bg-gray-800 transition-colors ${sec.premium ? 'border-yellow-600' : 'border-gray-700'}`}
                              >
                                <div className="text-3xl mb-2">{sec.emoji}</div>
                                <div className="text-white text-xl font-bold">Section {sec.id}</div>
                                <div className="text-gray-300 text-sm">{sec.name}</div>
                                {sec.premium && (
                                  <div className="text-yellow-400 text-sm mt-2">Premium</div>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      {currentView === 'progress' && (
                        <ProgressView levelProgress={levelProgress} />
                      )}
                      {currentView === 'settings' && (
                        <div className="h-screen overflow-y-auto pb-24">
                          <SettingsView
                            correctSound={correctSound}
                            setCorrectSound={setCorrectSound}
                            correctVolume={correctVolume}
                            setCorrectVolume={setCorrectVolume}
                            incorrectSound={incorrectSound}
                            setIncorrectSound={setIncorrectSound}
                            incorrectVolume={incorrectVolume}
                            setIncorrectVolume={setIncorrectVolume}
                            onTestSound={(soundFile, volume) => {
                              playWavFile(soundFile, volume);
                            }}
                          />
                        </div>
                      )}
                    </>
                ) : (
                    <>
                      {currentView === 'levels' && (
                        <MapCanvas 
                          ref={mapCanvasRef}
                          levelProgress={levelProgress}
                          onPlayLevel={handlePlayLevel}
                          onUpdateLevelProgress={handleUpdateLevelProgress}
                          onOpenShop={handleOpenShop}
                          onExitGame={handleExitGame}
                          correctSound={correctSound}
                          setCorrectSound={setCorrectSound}
                          correctVolume={correctVolume}
                          setCorrectVolume={setCorrectVolume}
                          incorrectSound={incorrectSound}
                          setIncorrectSound={setIncorrectSound}
                          incorrectVolume={incorrectVolume}
                          setIncorrectVolume={setIncorrectVolume}
                          section={currentSection}
                          onBackToSections={() => setCurrentView('sections')}
                          currentUnitLabel={currentLevel?.unit}
                        />
                      )}
                      {currentView === 'sections' && (
                        <div className="p-6 max-w-4xl mx-auto">
                          <div className="grid grid-cols-1 gap-6">
                            {[{id:'1', name:'Ascending Intervals', emoji:'⬆️', premium:false},{id:'2', name:'Descending Intervals', emoji:'⬇️', premium:true}].map(sec => (
                              <button
                                key={sec.id}
                                onClick={async () => {
                                  if (sec.premium) {
                                    const isLoggedIn = currentUser && currentUser.user_ID;
                                    if (!isLoggedIn) {
                                      router.push('/upgrade/');
                                      return;
                                    }
                                    try {
                                      const { access } = await checkAccess(currentUser.user_ID, 1, 'Melody Bricks');
                                      if (!access) {
                                        router.push('/upgrade/');
                                        return;
                                      }
                                    } catch (e) {
                                      router.push('/upgrade/');
                                      return;
                                    }
                                  }
                                  setCurrentSection(sec.id);
                                  setCurrentView('levels');
                                }}
                                className={`bg-gray-900 border-2 rounded-xl p-6 text-left hover:bg-gray-800 transition-colors ${sec.premium ? 'border-yellow-600' : 'border-gray-700'}`}
                              >
                                <div className="text-3xl mb-2">{sec.emoji}</div>
                                <div className="text-white text-xl font-bold">Section {sec.id}</div>
                                <div className="text-gray-300 text-sm">{sec.name}</div>
                                <div className={`text-sm ${sec.premium ? 'text-yellow-400' : 'text-emerald-400'}`}>
                                  {sec.premium ? 'Premium Training' : 'Free Training'}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      {currentView === 'progress' && (
                        <ProgressView levelProgress={levelProgress} />
                      )}
                      {currentView === 'settings' && (
                        <div className="h-screen overflow-y-auto">
                          <SettingsView
                            correctSound={correctSound}
                            setCorrectSound={setCorrectSound}
                            correctVolume={correctVolume}
                            setCorrectVolume={setCorrectVolume}
                            incorrectSound={incorrectSound}
                            setIncorrectSound={setIncorrectSound}
                            incorrectVolume={incorrectVolume}
                            setIncorrectVolume={setIncorrectVolume}
                            onTestSound={(soundFile, volume) => {
                              playWavFile(soundFile, volume);
                            }}
                          />
                        </div>
                      )}
                    </>
                )
            ) : (
                <>
                    {isMobile ? (
                        <MBGUIMobile
                            score={score}
                            intervalScoreVector={intervalScoreVector}
                            level={level}
                            currentLevel={currentLevel}
                            setCurrentLevel={setCurrentLevel}
                            onBackToMap={launchedFromPayload ? null : handleBackToMap}
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
                   
                        <MBGUIDesktop
                            aiActive={aiActive}
                            setAiActive={setAiActive}
                            score={score}
                            intervalScoreVector={intervalScoreVector}
                            level={level}
                            currentLevel={currentLevel}
                            setCurrentLevel={setCurrentLevel}
                            onBackToMap={launchedFromPayload ? null : handleBackToMap}
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

            {/* Right-side Sidebar - hidden during game play */}
            {currentView !== 'game' && (
              <RightSidebar
                currentView={currentView}
                onNavigate={(key) => {
                  if (key === 'shop') {
                    setShowShop(true);
                    setCurrentView('shop');
                  } else {
                    // Close shop modal when navigating away
                    if (showShop) setShowShop(false);
                    setCurrentView(key);
                  }
                }}
                onUpgrade={() => router.push('/upgrade/')}
                onExit={() => router.push('/')}
              />
            )}
            
            {/* Welcome Modal */}
            {showWelcome && !launchedFromPayload && (
                <Welcome 
                    isOpen={showWelcome}
                    onClose={handleCloseWelcome}
                    isMobile={isMobile}
                />
            )}
            
            {/* Intro Text Modal */}
            {showIntroText && !launchedFromPayload && (
                <IntroTextPopUp 
                    isOpen={showIntroText}
                    onClose={handleCloseIntroText}
                    introText={currentIntroText}
                    isMobile={isMobile}
                />
            )}
            
            {/* Shop Modal (Sidebar should remain visible above overlay) */}
            {showShop && (
                <ShopComponent 
                    onClose={handleCloseShop}
                    levelProgress={levelProgress}
                    onUpdateLevelProgress={handleUpdateLevelProgress}
                />
            )}
        </div>
    );
};

export default MBPage; 