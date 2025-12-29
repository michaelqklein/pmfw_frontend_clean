import { initMIDI, removeEventListeners } from '../utils/midiListener';
import { high_score } from '@data/audiation-studio/userData';
// import noteListGenerator from './noteListGenerator.js';
import pickRandOfList from '../utils/pickRandOfList';
import playWavFile from '@/src/utils/playWavFile';
import playWavChords from '../utils/playWavChords';
import getFileName from '../utils/getFileName';
import noteListGeneratorIntervals from '../utils/noteListGeneratorIntervals';
import { createPerformanceData } from '@/src/performance/performanceData';
import { updateIntervalAttempt } from '@/src/performance/performanceUpdates';
import eventEmitter from '@shared/utils/eventEmitter';

const data = createPerformanceData();

// Function to get current performance data
export function getCurrentPerformanceData() {
  return data;
}

// Getter function for UI analytics - returns only accuracy data for all 36 intervals
export function getUIAnalyticsVector() {
  return data.intervals.map(interval => ({
    correct: interval.accuracy.correct,
    wrong: interval.accuracy.wrong
  }));
}



// Function to dispatch current performance data to UI
export function dispatchCurrentPerformanceData() {
  for (let i = 0; i < data.intervals.length; i++) {
    const accuracyData = data.intervals[i].accuracy;
    const eventDetail = {
      interval: i,
      correct: accuracyData.correct,
      wrong: accuracyData.wrong
    };
    
    eventEmitter.emit('updateGUIliveAnalytics', eventDetail);
  }
}

// Function to reset performance data (for non-logged-in users)
export function resetPerformanceData() {
  // Reset all intervals to zero
  for (let i = 0; i < data.intervals.length; i++) {
    data.intervals[i].attempts = [];
    data.intervals[i].accuracy = { correct: 0, wrong: 0 };
  }
  
  // Dispatch updates to UI
  dispatchCurrentPerformanceData();
}

// Function to update performance data with loaded data from backend
export function updatePerformanceData(loadedData) {
  // console.log('🔄 updatePerformanceData: Received data to update:', loadedData);
  if (loadedData && typeof loadedData === 'object') {
    // Update the global performance data with loaded data
    Object.assign(data, loadedData);
    
    // Dispatch updates to UI
    // console.log('📡 updatePerformanceData: Dispatching updates to UI...');
    dispatchCurrentPerformanceData();
    // console.log('✅ updatePerformanceData: Performance data updated and UI notified');
  } else {
    // console.log('❌ updatePerformanceData: Invalid performance data received, using defaults');
    resetPerformanceData();
  }
}

// Function to save current performance data to localStorage temporarily
// This is called when user clicks "Create Account" to preserve their session data
export function saveTemporaryPerformanceData() {
  if (typeof window === 'undefined') return;
  
  try {
    const currentData = getCurrentPerformanceData();
    // console.log('📊 saveTemporaryPerformanceData: Current data to save:', currentData);
    
    const temporaryData = {
      performance_data: currentData,
      timestamp: Date.now(),
      expires: Date.now() + (24 * 60 * 60 * 1000) // Expire after 24 hours
    };
    
    localStorage.setItem('temporaryPerformanceData', JSON.stringify(temporaryData));
    // console.log('💾 Temporary performance data saved to localStorage:', temporaryData);
  } catch (error) {
    console.error('❌ Error saving temporary performance data:', error);
  }
}

// Function to retrieve and clear temporary performance data from localStorage
export function getAndClearTemporaryPerformanceData() {
  if (typeof window === 'undefined') return null;
  
  try {
    // console.log('🔍 getAndClearTemporaryPerformanceData: Checking localStorage for temporary data...');
    const storedData = localStorage.getItem('temporaryPerformanceData');
    if (!storedData) {
      // console.log('❌ getAndClearTemporaryPerformanceData: No temporary data found in localStorage');
      return null;
    }
    
    // console.log('📦 getAndClearTemporaryPerformanceData: Found raw localStorage data:', storedData);
    const temporaryData = JSON.parse(storedData);
    // console.log('📊 getAndClearTemporaryPerformanceData: Parsed temporary data:', temporaryData);
    
    // Check if data has expired
    if (Date.now() > temporaryData.expires) {
      localStorage.removeItem('temporaryPerformanceData');
      // console.log('⏰ getAndClearTemporaryPerformanceData: Temporary performance data expired and removed');
      return null;
    }
    
    // Clear the temporary data since we're using it now
    localStorage.removeItem('temporaryPerformanceData');
    // console.log('✅ getAndClearTemporaryPerformanceData: Retrieved and cleared temporary performance data');
    
    return temporaryData.performance_data;
  } catch (error) {
    console.error('❌ getAndClearTemporaryPerformanceData: Error retrieving temporary performance data:', error);
    // Clear corrupted data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('temporaryPerformanceData');
    }
    return null;
  }
}

// When user answers:
// updateIntervalAttempt(data, 5, true);



// Audiation Elevation
// This module is responsible for the training logic of the Ear Trainer Intervals game.
// It is a singleton object that contains all the necessary data and methods to run the game.
// It is initialized with the startTraining method and stopped with the stopTraining method.
// The game logic is based on the MIDI messages received from the MIDI listener.


const audiationStudio = {
    intervalLabelVector: [
        'desc perfect 8', 'desc Maj 7', 'desc min 7', 'desc Maj 6', 'desc min 6', 'desc perfect 5', 'desc Tritone', 'desc perfect 4', 'desc Maj 3', 'desc min 3', 'desc Maj 2', 'desc min 2',
        'asc min 2', 'asc Maj 2', 'asc min 3', 'asc Maj 3', 'asc perfect 4', 'asc Tritone', 'asc perfect 5', 'asc min 6', 'asc Maj 6', 'asc min 7', 'asc Maj 7', 'asc perfect 8',
        'harm min 2', 'harm Maj 2', 'harm min 3', 'harm Maj 3', 'harm perfect 4', 'harm Tritone', 'harm perfect 5', 'harm min 6', 'harm Maj 6', 'harm min 7', 'harm Maj 7', 'harm perfect 8'
    ],
    intervalScoreVector: Array.from({ length: 36 }, () => Array(10).fill(0)),
    intervalIndex: 0,
    randomIntervalRoot: false,
    intervalVector: [],
    selectedInterval: null,
    error: 0,
    task: 'notes',
    subTask: 'notes',
    activeIntervals: [],
    newData: false,
    level: 1,
    tonality: 'C',
    notReceivedPointsYet: false,
    keyRangeList: [],
    whichKeys: 'onScreen',
    replayAfter: 1000,
    audioCom: true,
    visualCom: true,
    score: 0,
    noteList: [],
    notesGenerated: 0,
    correctAnswers: 0,
    randomMidiNumber: null,
    rootFile: null,
    filename: "",
    nFalseAttempts: 0,
    nFalseReplay: 0,
    trainingStarted: false,
    correctNoteTimer: null,
    refNum: 1,
    referenceCounter: 0,
    // Timer-based properties (replacing nTargets)
    trainingDuration: 1 * 60 * 1000, // 5 minutes in milliseconds
    startTime: null,
    gameTimer: null,
    remainingTime: 0,
    lastMIDITime: null,
    lastMIDIKey: null,
    gameOver: false,
    monitorMessage: "",
    longTime: 1000,
    trainingDataList: [],
    showAnimation: true,

    startTraining(
        intervalScoreVector,
        task, subTask,
        ascending, descending, harmonic,
        ascendingVector, descendingVector, harmonicVector,
        randomIntervalRoot,
        whichKeys, oct, level, rangeLoLimit, rangeUpLimit, tonality, trainingDurationArg, refNumArg, audioCom, visualCom, replaytAfter, showAnimation, isLoggedIn = true) {
        this.intervalScoreVector = intervalScoreVector;
        this.randomIntervalRoot = randomIntervalRoot;
        this.ascendingVector = ascendingVector;
        this.descendingVector = descendingVector;
        this.harmonicVector = harmonicVector;
        this.task = task;
        this.subTask = subTask;
        this.newData = true;
        this.level = level;
        this.tonality = tonality;
        this.whichKeys = whichKeys;
        this.audioCom = audioCom;
        this.visualCom = visualCom;
        this.replayAfter = replaytAfter;
        this.gameOver = false;
        this.score = 0;
        
        // Initialize timer system
        this.trainingDuration = trainingDurationArg || (5 * 60 * 1000); // Default to 5 minutes
        this.startTime = Date.now();
        this.remainingTime = this.trainingDuration;
        
        this.referenceCounter = 0;
        this.refNum = refNumArg;
        this.nFalseAttempts = 0;
        this.nFalseReplay = 0;
        this.notesGenerated = 0;
        this.correctAnswers = 0;
        this.trainingStarted = true;
        this.showAnimation = showAnimation;
        
        // Reset performance data if user is not logged in
        // if (!isLoggedIn) {
        //     resetPerformanceData();
        // }
        
        // Dispatch initial ratio update (0/0 => 0%)
        this.dispatchRatioUpdate();
        
        [this.noteList, this.keyRangeList] = noteListGeneratorIntervals(task, subTask, ascendingVector, descendingVector, harmonicVector, tonality, oct, level, rangeLoLimit, rangeUpLimit);

        let zeroVector = Array.from({ length: 36 }, () => Array(10).fill(0));
        this.intervalScoreVector = zeroVector;

        eventEmitter.emit('updateScore', this.intervalScoreVector);

        eventEmitter.emit('updateKeyboard', this.keyRangeList);

        this.activeIntervals = [];
        if (ascending) this.activeIntervals.push('ascending');
        if (descending) {
            this.activeIntervals.push('descending');
        }
        if (harmonic) this.activeIntervals.push('harmonic');

        this.longTime = 1000;
        // Launch countdown sequence

        if (!(this.refNum === 0 || this.subTask === 'intervals')) {
            this.playReference();
            this.longTime = 4000;
        }

        // Start the game timer
        this.startGameTimer();

        setTimeout(() => {
            this.runNewNoteCycle();
        }, this.longTime);

        // Dispatch custom event to update note Counter
        eventEmitter.emit('updateNoteCounter', this.notesGenerated);

        // Add event listener for demoKeyPressed (remove first to prevent duplicates)
        if (!this.boundHandleDemoKeyPressed) {
            this.boundHandleDemoKeyPressed = this.handleDemoKeyPressed.bind(this);
        }
        eventEmitter.off('demoKeyPressed', this.boundHandleDemoKeyPressed);
        eventEmitter.on('demoKeyPressed', this.boundHandleDemoKeyPressed);
    },

    startGameTimer() {
        // Update remaining time every second
        this.gameTimer = setInterval(() => {
            this.updateRemainingTime();
        }, 1000);
    },

    updateRemainingTime() {
        if (!this.trainingStarted) return;
        
        const elapsed = Date.now() - this.startTime;
        this.remainingTime = Math.max(0, this.trainingDuration - elapsed);
        
        // Dispatch event with remaining time for UI update
        const minutes = Math.floor(this.remainingTime / 60000);
        const seconds = Math.floor((this.remainingTime % 60000) / 1000);
        const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        eventEmitter.emit('updateRemainingTime', { 
            remainingTime: this.remainingTime,
            timeString: timeString 
        });
        
        // Check if time is up
        if (this.remainingTime <= 0) {
            this.handleTimeUp();
        }
    },

    handleTimeUp() {
        this.gameOver = true;
        this.trainingStarted = false;
        
        this.monitorMessage = "TIME'S UP!";
        eventEmitter.emit('updateMonitorMessage', this.monitorMessage);

        // dispatch message that training has stopped
        eventEmitter.emit('updateControlEvent', 'finished');

        // Save performance data if user is logged in
        this.savePerformanceDataIfLoggedIn();

        // Dispatch session ended event for signup popup
        eventEmitter.emit('sessionEnded', { 
            duration: this.trainingDuration,
            correctAnswers: this.correctAnswers,
            totalAnswers: this.notesGenerated
        });

        if (this.audioCom) playWavFile('/game_sounds/Landing.wav');
        
        this.clearTimers();
    },

    clearTimers() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
        if (this.correctNoteTimer) {
            clearTimeout(this.correctNoteTimer);
            this.correctNoteTimer = null;
        }
    },

    // Save performance data to backend if user is logged in
    async savePerformanceDataIfLoggedIn() {
        try {
            // Check if user is logged in using AuthContext
            // This should be called from a component that has access to AuthContext
            eventEmitter.emit('requestAuthStatus');
            
            // Wait for the auth status response (we'll need to implement this)
            // For now, we'll use a simpler approach with custom events
            eventEmitter.emit('savePerformanceData', {
                performance_data: getCurrentPerformanceData()
            });
            
        } catch (error) {
            console.error('Error requesting performance data save:', error);
        }
    },

    // Load performance data from backend if user is logged in
    // This should be called when the Audiation Studio page loads
    loadPerformanceDataIfLoggedIn() {
        try {
            // Dispatch event to request loading performance data
            // This will be handled by a component that has access to AuthContext
            eventEmitter.emit('loadPerformanceData');
            
        } catch (error) {
            console.error('Error requesting performance data load:', error);
        }
    },

    dispatchRatioUpdate() {
        eventEmitter.emit('updateCoarseRatio', { 
            correct: this.correctAnswers, 
            total: this.notesGenerated 
        });
    },

    stopTraining() {
        this.trainingStarted = false;
        // this.monitorMessage = "";
        removeEventListeners();
        


        // Remove event listener for demoKeyPressed
        if (this.boundHandleDemoKeyPressed) {
            eventEmitter.off('demoKeyPressed', this.boundHandleDemoKeyPressed);
        }

        if (this.newData) {
            const returnedData = this.createTrainingData();
            // console.log("Piano Gym (Training Data about to be arrayed):", returnedData); // For now, log the data
            this.trainingDataList.push(returnedData);
            // console.log("Piano Gym (Training Data List elememnt):", this.trainingDataList[0]); // For now, log the data
            if (this.trainingDataList.length > 10)
                this.trainingDataList.shift();
            this.newData = false;
        }
        // console.log("Piano Gym (returning Training Data List):", this.trainingDataList[0]); // For now, log the data   
        return this.trainingDataList;
    },

    // Function to create the data object for the session
    createTrainingData() {
        // console.log("update Training Data");
        const date = new Date();
        const scoreData = new high_score(
            this.score.toFixed(2), // Percentage score
            date.toISOString().split('T')[0], // YYYY-MM-DD format
            date.toTimeString().split(' ')[0], // HH:MM:SS format
            this.level); // level
        // console.log("Piano Gym (Training Data about to be returned):", scoreData); // For now, log the data
        return scoreData;
    },

    playReference() {
        // play reference chord
        // console.log('reference triggered ! ');
        let relativeFile = '/ref_wav/' + this.tonality + '_ref.wav';
        playWavFile(relativeFile);

        const messages = ["Wait", "You are playing in the key of " + this.tonality + " - major", "Here is your tonic, dominant, and tonic chord", "and the note " + this.tonality + "4"];
        messages.forEach((message, index) => {
            setTimeout(() => {
                eventEmitter.emit('updateMonitorMessage', message);
            }, (index * 1000)); // Dispatch each message 1 second apart
        });
    },

    // This function checks whether the game has reached a winning condition
    // The winning condition is accompished if this.intervalScoreVector has 5 elements
    // for each of the selected intervals, 
    // i.e, the intervals that are 1 in the intervalVector  

    checkWinningCondition() {
        // console.log("checkWinningCondition called");
        let vectorStart = 0;
        if (this.selectedInterval === 'descending') {
            this.intervalVector = [... this.descendingVector].reverse(); // use spread to avoid mutating original
            vectorStart = 0;
        }
        if (this.selectedInterval === 'ascending') {
            this.intervalVector = this.ascendingVector; 
            vectorStart = 12;
        }
        if (this.selectedInterval === 'harmonic') {
            this.intervalVector = this.harmonicVector;
            vectorStart = 24;
        }
        // console.log("intervalVector: " + this.intervalVector);
        for (let i = 0; i < this.intervalVector.length; i++) {
            // console.log("intervalVector[" + i + "]: " + this.intervalVector[i]);
            if (this.intervalVector[i] === 1) {
                // console.log("Interval " + i + " is selected");
                const scoreArray = this.intervalScoreVector[i + vectorStart];
                // Validate that the scoreArray exists and has exactly five 1s
                if (!Array.isArray(scoreArray) || scoreArray.filter(val => val === 1).length !== 5) {
                    // console.log("Winning condition not met for interval " + i);
                    return false; // Winning condition not met
                }
            }
        }
        return true; // All required intervals have 5 scores
    },

    repeatInterval() {
        this.monitorMessage = "Root note is " + this.tonality + "4";
        eventEmitter.emit('updateMonitorMessage', this.monitorMessage);

        let intervalDelay = 0;
        if (this.selectedInterval === 'harmonic') {
            const intervalFile = "/sound/piano_wav/" + getFileName(this.randomMidiNumber);
            const harmonicFiles = [this.rootFile, intervalFile];
            playWavChords(harmonicFiles);
        }
        else {
            // play key note if subTask is intervals
            if (this.subTask === 'intervals') {
                // This should just be the lowest note in the interval scale for a start.
                playWavFile(this.rootFile);
                // set intervalDelay to 2 seconds
                intervalDelay = 750;
            }

            setTimeout(() => {
                this.fileName = "/sound/piano_wav/" + getFileName(this.randomMidiNumber);
                playWavFile(this.fileName);
            }, intervalDelay);

        }
    },

    runNewNoteCycle() {
        if (this.noteList.length === 0) return;
        this.nFalseAttempts = 0;
        this.notReceivedPointsYet = true;
        // console.log("nFalseAttempts: " + this.nFalseAttempts)
        eventEmitter.emit('updateFalseAttempts', this.nFalseAttempts);

        // console.log("showAnimation is false");
        this.monitorMessage = "Target #" + this.notesGenerated;
        eventEmitter.emit('updateMonitorMessage', this.monitorMessage);

        let intervalDelay = 0;
        // generate Midi Note Identifier.

        // I have 3 types of interval tasks: ascending, descending, and harmonic
        // however, they might not all be active. 
        // They are given as true are false in the arguments of the main funcion startTraining
        // I will need to generate a random number to determine which type of interval to generate

        if (this.activeIntervals.length > 0) {
            const randomIndex = Math.floor(Math.random() * this.activeIntervals.length);
            this.selectedInterval = this.activeIntervals[randomIndex];
            // console.log(`Selected interval type: ${this.selectedInterval}`);
        } else {
            // console.log('No active interval types available.');
        }

        // set root to C4
        this.rootFile = "/sound/piano_wav/060_C4.wav";
        let newRoot = 60;

        // random interval root
        if (this.randomIntervalRoot) {
            // console.log('Random interval root is true');
            // pick a random tonality
            newRoot = pickRandOfList([60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71]);
            this.rootFile = "/sound/piano_wav/" + getFileName(newRoot);
            const tonalityList = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
            this.tonality = tonalityList[newRoot - 60];
            // console.log('Random tonality: ' + this.tonality);
            [this.noteList, this.keyRangeList] = noteListGeneratorIntervals(this.task, this.subTask,
                this.ascendingVector, this.descendingVector, this.harmonicVector, this.tonality, this.oct, this.level, this.rangeLoLimit, this.rangeUpLimit);
            // console.log('this.noteList: ', this.noteList);
            // console.log('this.keyRangeList: ', this.keyRangeList);
            eventEmitter.emit('updateKeyboard', this.keyRangeList);
        }
        else {
            // console.log('Random interval root is false');
        }
        // dispatch event to update the rootNote
        eventEmitter.emit('setRootNote', this.tonality + "4");

        let wrongNote = true;
        let newMidiNumber;
        // console.log('this.noteList: ', this.noteList);
        let domainList;
        if (this.selectedInterval === 'descending') {
            domainList = this.noteList[0];
        }
        if (this.selectedInterval === 'ascending') {
            domainList = this.noteList[1];
        }
        if (this.selectedInterval === 'harmonic') {
            domainList = this.noteList[2];
        }
        while (wrongNote) {
            // console.log('wrong note loop');
            // console.log('domainList: ', domainList);
            newMidiNumber = pickRandOfList(domainList);

            wrongNote = false;
            if (newMidiNumber === this.randomMidiNumber)
                wrongNote = true;
             if (newMidiNumber == newRoot)
                wrongNote = true;
        }

        const scInterval = newMidiNumber - newRoot;
        // console.log('scInterval: ' + scInterval);
        if (this.selectedInterval === 'ascending')
            this.intervalIndex = 11 + scInterval;
        if (this.selectedInterval === 'descending') {
            this.intervalIndex = 12 + scInterval;
            // console.log('computed: descending');
        }
        if (this.selectedInterval === 'harmonic')
            this.intervalIndex = 23 + scInterval;

        // console.log('intervalIndex: ' + this.intervalIndex);

        this.randomMidiNumber = newMidiNumber;

        this.monitorMessage = "Root note is " + this.tonality + "4";
        eventEmitter.emit('updateMonitorMessage', this.monitorMessage);

        if (this.selectedInterval === 'harmonic') {
            const intervalFile = "/sound/piano_wav/" + getFileName(this.randomMidiNumber);
            const harmonicFiles = [this.rootFile, intervalFile];
            playWavChords(harmonicFiles);
        }
        else {
            // play key note if subTask is intervals
            if (this.subTask === 'intervals') {
                // This should just be the lowest note in the interval scale for a start.
                playWavFile(this.rootFile);
                // set intervalDelay to 2 seconds
                intervalDelay = 750;
            }

            setTimeout(() => {
                this.fileName = "/sound/piano_wav/" + getFileName(this.randomMidiNumber);
                playWavFile(this.fileName);
            }, intervalDelay);

        }



        this.notesGenerated = this.notesGenerated + 1;

        this.referenceCounter++;
        // console.log('refernce counter increased to: ' + this.referenceCounter);

        // Dispatch event to clear the correct note highlight
        eventEmitter.emit('clearCorrectNote');
    },

    handleMIDIMessage(note) {
        // console.log('handleMIDIMessage called', note, new Date().toISOString());
        if (!this.trainingStarted) return;
        
        // Deduplicate rapid-fire identical notes (within 100ms)
        const now = Date.now();
        const key = `${note}_${this.intervalIndex}`;
        if (this.lastMIDITime && this.lastMIDIKey === key && (now - this.lastMIDITime) < 100) {
            // console.log('DEBUG: Duplicate MIDI message ignored - same note within 100ms');
            return;
        }
        this.lastMIDITime = now;
        this.lastMIDIKey = key;
        // console.log("note detected");
        // console.log("randomMidiNumber: " +  typeof(this.randomMidiNumber));
        // console.log("Pressed note: " + typeof(note));
        const isCorrectNote = (Number(note) === Number(this.randomMidiNumber));
        if (note === this.randomMidiNumber) {
            // console.log("correct note: ");
        }
        else {
            // console.log("incorrect note");
        }

        if (!isCorrectNote) {
            this.error = note - this.randomMidiNumber
            // if error > 0 note is too high
            // if error < 0 note is too low
            // console.log("wrong note");
            this.handleWrongNote();
        } else {
            // console.log("correct note")
            this.handleCorrectNote();
        }

        // Always dispatch the correct note after a note is played
        const correctNoteName = this.keyRangeList.find(k => k.midi === this.randomMidiNumber)?.note;
        if (correctNoteName) {
            eventEmitter.emit('setCorrectNote', correctNoteName);
        }
        // If the note is incorrect, dispatch setWrongNote with the wrong note's name
        if (!isCorrectNote) {
            const wrongNoteName = this.keyRangeList.find(k => k.midi === note)?.note;
            if (wrongNoteName) {
                eventEmitter.emit('setWrongNote', wrongNoteName);
            }
        } else {
            // If correct, clear any previous wrong note
            eventEmitter.emit('setWrongNote', null);
        }

        // Update interval attempt
        // console.log('DEBUG: Calling updateIntervalAttempt with:', {
        //     intervalIndex: this.intervalIndex,
        //     isCorrectNote: isCorrectNote,
        //     intervalLabel: this.intervalLabelVector[this.intervalIndex]
        // });
        
        updateIntervalAttempt(data, this.intervalIndex, isCorrectNote);
        
        // console.log('DEBUG: Updated performance data for interval', this.intervalIndex, ':', data.intervals[this.intervalIndex]);

        // Dispatch updateIntervalAccuracy event
        const accuracyData = data.intervals[this.intervalIndex].accuracy;
        const eventDetail = {
            interval: this.intervalIndex,
            correct: accuracyData.correct,
            wrong: accuracyData.wrong
        };
        
        console.log('🎯 ENGINE: Dispatching updateGUIliveAnalytics event with:', eventDetail);
        console.log('🎯 ENGINE: Current interval data:', data.intervals[this.intervalIndex]);
        
        eventEmitter.emit('updateGUIliveAnalytics', eventDetail);
        console.log('🎯 ENGINE: Event dispatched successfully');
    },

    handleDemoKeyPressed(note) {
        // console.log("Demo key pressed: " + note);
        this.handleMIDIMessage(note);
    },

    handleWrongNote() {
        if (this.notReceivedPointsYet) {

            this.monitorMessage = "Incorrect !";

            eventEmitter.emit('updateMonitorMessage', this.monitorMessage);
            

            this.notReceivedPointsYet = false;
            if (this.audioCom) {
                if (this.whichKeys === 'onScreen') {
                    setTimeout(() => {
                        playWavFile('/sound/game_sounds/Negative.wav', 0.7);
                    }, 500);
                }
                else {
                    playWavFile('/sound/game_sounds/Negative.wav', 0.7);
                }
            }
            if (Array.isArray(this.intervalScoreVector[this.intervalIndex])) {
                // Add a new element (e.g., newValue) at the end
                this.intervalScoreVector[this.intervalIndex].push(-1);

                // Remove the first element to maintain length 5
                if (this.intervalScoreVector[this.intervalIndex].length > 5) {
                    this.intervalScoreVector[this.intervalIndex].shift();
                }
            }

            // Dispatch custom event to update score
            // console.log("Interval Score Vector (incorrect): " + this.intervalScoreVector);

            eventEmitter.emit('updateScore', this.intervalScoreVector);

            // console.log("This is the correct Note");
            // console.log("n Targets: " + this.nTargets);
            this.notReceivedPointsYet = false;
            const increment = 1; // Simple increment of 1 point per correct answer
            // console.log("increment: " + increment);
            this.score += increment;
            // console.log("score: " + this.score);

            // Dispatch custom event to update note Counter
            eventEmitter.emit('updateNoteCounter', this.notesGenerated);

            // Dispatch ratio update
            this.dispatchRatioUpdate();

            if (this.correctNoteTimer) {
                clearTimeout(this.correctNoteTimer);
            }

            if (!this.gameOver) {
                this.longTime = 2000; // without ref
                // console.log("Ref Num: " + this.refNum);
                if ((this.refNum > 2) && (!(this.subTask === 'intervals'))) {
                    // console.log("Reference Counter: ", this.referenceCounter);
                    if (this.referenceCounter === this.refNum) {
                        this.correctNoteTimer = setTimeout(() => {
                            this.playReference();
                        }, 2000);
                        this.referenceCounter = 0;
                        this.longTime = 6000; // with ref
                    }
                }
                this.correctNoteTimer = setTimeout(() => {
                    this.runNewNoteCycle();
                }, this.longTime);
            }
        }
        else {
            // console.log("wrong note already counted.");
        }
    },

    handleCorrectNote() {
        if (this.notReceivedPointsYet) {

            this.monitorMessage = "Correct !";
            eventEmitter.emit('updateMonitorMessage', this.monitorMessage);

            this.notReceivedPointsYet = false;
            if (this.audioCom) {
                if (this.whichKeys === 'onScreen') {
                    setTimeout(() => {
                        playWavFile('/sound/game_sounds/RetroWin.wav', 0.3);
                    }, 500);
                }
                else {
                    playWavFile('/sound/game_sounds/RetroWin.wav', 0.3);
                }
            }

            if (Array.isArray(this.intervalScoreVector[this.intervalIndex])) {
                // Add a new element (e.g., newValue) at the end
                this.intervalScoreVector[this.intervalIndex].push(1);

                // Remove the first element to maintain length 5
                if (this.intervalScoreVector[this.intervalIndex].length > 5) {
                    this.intervalScoreVector[this.intervalIndex].shift();
                }
            }

            // Dispatch custom event to update score
            // console.log("Interval Score Vector (correct): " + this.intervalScoreVector);

            eventEmitter.emit('updateScore', this.intervalScoreVector);

            // console.log("This is the correct Note");
            // console.log("n Targets: " + this.nTargets);
            this.notReceivedPointsYet = false;
            const increment = 1; // Simple increment of 1 point per correct answer
            // console.log("increment: " + increment);
            this.score += increment;
            // console.log("score: " + this.score);

            // Increment correct answers counter
            this.correctAnswers++;

            // Dispatch custom event to update note Counter
            eventEmitter.emit('updateNoteCounter', this.notesGenerated);

            // Dispatch ratio update
            this.dispatchRatioUpdate();

            if (this.checkWinningCondition()) {
                // console.log("You won !");
                this.monitorMessage = "You won !";
                eventEmitter.emit('updateMonitorMessage', this.monitorMessage);
                this.trainingStarted = false;
                eventEmitter.emit('updateControlEvent', 'finished');
                if (this.audioCom) playWavFile('/game_sounds/Landing.wav');
                this.gameOver = true;
            }

            if (this.correctNoteTimer) {
                clearTimeout(this.correctNoteTimer);
            }

            if (!this.gameOver) {
                this.longTime = 2000; // without ref
                // console.log("Ref Num: " + this.refNum);
                if ((this.refNum > 2) && (!(this.subTask === 'intervals'))) {
                    // console.log("Reference Counter: ", this.referenceCounter);
                    if (this.referenceCounter === this.refNum) {
                        this.correctNoteTimer = setTimeout(() => {
                            this.playReference();
                        }, 2000);
                        this.referenceCounter = 0;
                        this.longTime = 6000; // with ref
                    }
                }
                this.correctNoteTimer = setTimeout(() => {
                    this.runNewNoteCycle();
                }, this.longTime);
            }
        }
        else {
            // console.log("correct note already counted.");

        }

    },

    handleGameOver() {
        setTimeout(() => {
            this.monitorMessage = "GAME OVER"
            this.trainingStarted = false;
            eventEmitter.emit('updateMonitorMessage', this.monitorMessage);

            // dispatch message that training has stopped
            eventEmitter.emit('updateControlEvent', 'finished');

            if (this.audioCom) playWavFile('/game_sounds/Landing.wav');
        }, 1000);
    },

    // Add these methods to the Audiation Studio object
    initListeners() {
        if (!this.boundHandleMIDIMessage) {
            this.boundHandleMIDIMessage = this.handleMIDIMessage.bind(this);
        }
        removeEventListeners();
        initMIDI(this.boundHandleMIDIMessage);
    },
    removeListeners() {
        removeEventListeners();
        if (this.boundHandleDemoKeyPressed) {
            document.removeEventListener('demoKeyPressed', this.boundHandleDemoKeyPressed);
        }
    },
};

export default audiationStudio;
