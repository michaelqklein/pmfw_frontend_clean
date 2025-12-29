import { initMIDI, removeEventListeners } from '../utils/midiListener';
import { high_score } from '@data/audiation-studio/userData';
// import noteListGenerator from './noteListGenerator.js';
import pickRandOfList from '../utils/pickRandOfList';
import { playAudio, playAudioChords } from '../../utils/audioPlayer';
import getFileName from '../utils/getFileName';
import noteListGeneratorIntervals from '../utils/noteListGeneratorIntervals';
import eventEmitter from '../utils/eventEmitter';

// Performance data functions removed - now handled by level progress data in MBPage



// Audiation Elevation
// This module is responsible for the training logic of the Ear Trainer Intervals game.
// It is a singleton object that contains all the necessary data and methods to run the game.
// It is initialized with the startTraining method and stopped with the stopTraining method.
// The game logic is based on the MIDI messages received from the MIDI listener.


const melodyBricks = {
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
    rowsCleared: 0,
    bonuses: 0,
    intervalActive: false,

    startTraining(
        intervalScoreVector,
        task, subTask,
        currentLevel,
        randomIntervalRoot,
        whichKeys, oct, level, rangeLoLimit, rangeUpLimit, tonality, trainingDurationArg, refNumArg, audioCom, visualCom, replaytAfter, showAnimation, isLoggedIn = true, existingKeyRangeList = null) {

        // Clear all bricks from the game canvas at the start of training
        // Don't clear for "12 tone wall" levels as they have pre-stacked walls
        if (currentLevel?.type !== "12 tone wall") {
            eventEmitter.emit('clearAllBricks');
        }

        this.intervalScoreVector = intervalScoreVector;
        this.randomIntervalRoot = randomIntervalRoot;
        this.currentLevel = currentLevel;
        
        // Store the original keyRangeList for 12 tone wall levels
        if (existingKeyRangeList && currentLevel?.type === "12 tone wall") {
            this.originalKeyRangeList = existingKeyRangeList;
        }

        // Extract level properties
        const ascending = currentLevel?.settings?.ascending || false;
        const descending = currentLevel?.settings?.descending || false;
        const harmonic = currentLevel?.settings?.harmonic || false;
        this.ascendingVector = currentLevel?.settings?.ascendingVector || Array(12).fill(0);
        this.descendingVector = currentLevel?.settings?.descendingVector || Array(12).fill(0);
        this.harmonicVector = currentLevel?.settings?.harmonicVector || Array(12).fill(0);

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
        this.rowsCleared = 0;
        this.bonuses = 0;

        // Emit initial rows cleared count via mitt
        eventEmitter.emit('totalRowsClearedUpdate', {
            totalRowsCleared: this.rowsCleared,
            totalBonuses: this.bonuses,
            requiredRows: this.currentLevel?.winCondition?.eliminatedRows || 5
        });

        // Reset performance data if user is not logged in
        // if (!isLoggedIn) {
        //     resetPerformanceData();
        // }

        // Dispatch initial ratio update (0/0 => 0%)
        this.dispatchRatioUpdate();

        // Use existing keyRangeList if provided (for 12 tone wall levels)
        if (existingKeyRangeList && currentLevel?.type === "12 tone wall") {
            this.keyRangeList = existingKeyRangeList;
            this.noteList = noteListGeneratorIntervals(task, subTask, this.ascendingVector, this.descendingVector, this.harmonicVector, tonality, oct, level, rangeLoLimit, rangeUpLimit, currentLevel?.type)[0];
        } else {
            // Generate both noteList and keyRangeList
            [this.noteList, this.keyRangeList] = noteListGeneratorIntervals(task, subTask, this.ascendingVector, this.descendingVector, this.harmonicVector, tonality, oct, level, rangeLoLimit, rangeUpLimit, currentLevel?.type);
        }

        let zeroVector = Array.from({ length: 36 }, () => Array(10).fill(0));
        this.intervalScoreVector = zeroVector;

        const event1 = new CustomEvent('updateScore', { detail: this.intervalScoreVector });
        document.dispatchEvent(event1);

        // Dispatch updateKeyboard event with the correct keyRangeList
        const event2 = new CustomEvent('updateKeyboard', { detail: this.keyRangeList });
        document.dispatchEvent(event2);

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
        const event3 = new CustomEvent('updateNoteCounter', { detail: this.notesGenerated });
        document.dispatchEvent(event3);

        // Add event listener for demoKeyPressed (remove first to prevent duplicates)
        if (!this.boundHandleDemoKeyPressed) {
            this.boundHandleDemoKeyPressed = this.handleDemoKeyPressed.bind(this);
        }
        document.removeEventListener('demoKeyPressed', this.boundHandleDemoKeyPressed);
        document.addEventListener('demoKeyPressed', this.boundHandleDemoKeyPressed);
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

        // Timer now counts UP instead of DOWN - show elapsed time
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        const event = new CustomEvent('updateRemainingTime', {
            detail: {
                remainingTime: elapsed, // Now this represents elapsed time
                timeString: timeString
            }
        });
        document.dispatchEvent(event);

        // Timer no longer ends the game - game ends when bricks reach top row
    },

    handleTimeUp() {
        this.gameOver = true;
        this.trainingStarted = false;

        this.monitorMessage = "TIME'S UP!";
        const event3 = new CustomEvent('updateMonitorMessage', { detail: this.monitorMessage });
        document.dispatchEvent(event3);

        // dispatch message that training has stopped
        eventEmitter.emit('updateControlEvent', 'finished');

        // Emit session ended event for signup popup via mitt
        eventEmitter.emit('sessionEnded', {
            duration: this.trainingDuration,
            correctAnswers: this.correctAnswers,
            totalAnswers: this.notesGenerated
        });

        if (this.audioCom) playAudio('/game_sounds/Landing.wav');

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





    dispatchRatioUpdate() {
        // Emit accuracy update via mitt only
        eventEmitter.emit('accuracyUpdate', {
            correct: this.correctAnswers,
            total: this.notesGenerated
        });
    },

        calculateSimpleInterval() {
        // Convert intervalIndex to simple half-tone value (0-11)
        // This is the clean format GameCanvas expects
        let semitones;
        
        console.log('🔍 calculateSimpleInterval DEBUG:');
        console.log('  - this.selectedInterval:', this.selectedInterval);
        console.log('  - this.intervalIndex:', this.intervalIndex);
        
        if (this.selectedInterval === 'ascending') {
            // ascending intervals: intervalIndex 12=min2nd(1), 13=maj2nd(2), etc.
            semitones = this.intervalIndex - 12;
            console.log('  - ASCENDING: semitones = intervalIndex - 12 =', this.intervalIndex, '- 12 =', semitones);
        } else if (this.selectedInterval === 'descending') {
            // descending intervals: intervalIndex 11=perfect8th(11), 10=maj7th(10), etc.
            semitones = 11 - this.intervalIndex;
            console.log('  - DESCENDING: semitones = 12 - intervalIndex = 12 -', this.intervalIndex, '=', semitones);
        } else if (this.selectedInterval === 'harmonic') {
            // harmonic intervals: intervalIndex 24=min2nd(1), 25=maj2nd(2), etc.
            semitones = this.intervalIndex - 24;
            console.log('  - HARMONIC: semitones = intervalIndex - 24 =', this.intervalIndex, '- 24 =', semitones);
        } else {
            semitones = 0;
            console.log('  - DEFAULT: semitones = 0');
        }
        
        console.log('  - Final semitones result:', semitones);
        
        // Return the actual calculated value without artificial clamping
        return semitones;
    },

    // This is never used, can probably be deleted.
    /*
    calculateIntervalDegree() {
        // Convert interval index to interval degree (1st, 2nd, 3rd, etc.)
        // Based on the intervalLabelVector mapping
        const semitoneToInterval = {
            0: 1,   // Unison/Perfect 1st
            1: 2,   // Minor 2nd
            2: 2,   // Major 2nd  
            3: 3,   // Minor 3rd
            4: 3,   // Major 3rd
            5: 4,   // Perfect 4th
            6: 4,   // Tritone (considered 4th for visual purposes)
            7: 5,   // Perfect 5th
            8: 6,   // Minor 6th
            9: 6,   // Major 6th
            10: 7,  // Minor 7th
            11: 7,  // Major 7th
            12: 8   // Perfect 8th (Octave)
        };

        let semitones;
        if (this.selectedInterval === 'ascending') {
            semitones = this.intervalIndex - 11; // ascending starts at index 12 (min 2nd)
        } else if (this.selectedInterval === 'descending') {
            semitones = Math.abs(this.intervalIndex - 12); // descending starts at index 11 (desc perfect 8)
        } else if (this.selectedInterval === 'harmonic') {
            semitones = this.intervalIndex - 23; // harmonic starts at index 24 (harm min 2nd)
        } else {
            semitones = 0;
        }

        return semitoneToInterval[Math.abs(semitones)] || 1;
    },
    */

    stopTraining() {
        this.trainingStarted = false;
        // this.monitorMessage = "";
        removeEventListeners();

        /*  const event3 = new CustomEvent('updateMonitorMessage', { detail: this.monitorMessage });
         document.dispatchEvent(event3);
        */

        // Remove event listener for demoKeyPressed
        if (this.boundHandleDemoKeyPressed) {
            document.removeEventListener('demoKeyPressed', this.boundHandleDemoKeyPressed);
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
                const event = new CustomEvent('updateMonitorMessage', { detail: message });
                document.dispatchEvent(event);
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
        const event5 = new CustomEvent('updateMonitorMessage', { detail: this.monitorMessage });
        document.dispatchEvent(event5);

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
        this.intervalActive = true;
        this.nFalseAttempts = 0;
        this.notReceivedPointsYet = true;
        // Emit event to clear canvas when new interval starts
        eventEmitter.emit('intervalEnd');
        // console.log("nFalseAttempts: " + this.nFalseAttempts)
        const event = new CustomEvent('updateFalseAttempts', { detail: this.nFalseAttempts });
        document.dispatchEvent(event);

        // console.log("showAnimation is false");
        this.monitorMessage = "Target #" + this.notesGenerated;
        const event3 = new CustomEvent('updateMonitorMessage', { detail: this.monitorMessage });
        document.dispatchEvent(event3);

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
            
            // For 12 tone wall levels, use the stored original keyRangeList
            if (this.currentLevel?.type === "12 tone wall" && this.originalKeyRangeList) {
                // Use stored original keyRangeList
                this.keyRangeList = this.originalKeyRangeList;
                this.noteList = noteListGeneratorIntervals(this.task, this.subTask,
                    this.ascendingVector, this.descendingVector, this.harmonicVector, this.tonality, this.oct, this.level, this.rangeLoLimit, this.rangeUpLimit, this.currentLevel?.type)[0];
            } else {
                // For non-12 tone wall levels, generate both noteList and keyRangeList
                [this.noteList, this.keyRangeList] = noteListGeneratorIntervals(this.task, this.subTask,
                    this.ascendingVector, this.descendingVector, this.harmonicVector, this.tonality, this.oct, this.level, this.rangeLoLimit, this.rangeUpLimit, this.currentLevel?.type);
                // console.log('this.noteList: ', this.noteList);
                // console.log('this.keyRangeList: ', this.keyRangeList);
                const event4 = new CustomEvent('updateKeyboard', { detail: this.keyRangeList });
                document.dispatchEvent(event4);
            }
        }
        else {
            // console.log('Random interval root is false');
        }
        // dispatch event to update the rootNote
        const event2 = new CustomEvent('setRootNote', { detail: this.tonality + "4" });
        document.dispatchEvent(event2);

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
        console.log('🎵 runNewNoteCycle DEBUG:');
        console.log('  - selectedInterval:', this.selectedInterval);
        console.log('  - rootNote:', newRoot);
        console.log('  - targetNote:', newMidiNumber);
        console.log('  - scInterval (semitone diff):', scInterval);
        
        if (this.selectedInterval === 'ascending') {
            this.intervalIndex = 11 + scInterval;
            console.log('  - ASCENDING: intervalIndex = 11 + scInterval =', 11, '+', scInterval, '=', this.intervalIndex);
        }
        if (this.selectedInterval === 'descending') {
            this.intervalIndex = 12 + scInterval;
            console.log('  - DESCENDING: intervalIndex = 12 + scInterval =', 12, '+', scInterval, '=', this.intervalIndex);
        }
        if (this.selectedInterval === 'harmonic') {
            this.intervalIndex = 23 + scInterval;
            console.log('  - HARMONIC: intervalIndex = 23 + scInterval =', 23, '+', scInterval, '=', this.intervalIndex);
        }

        this.randomMidiNumber = newMidiNumber;

        this.monitorMessage = "Root note is " + this.tonality + "4";
        const event5 = new CustomEvent('updateMonitorMessage', { detail: this.monitorMessage });
        document.dispatchEvent(event5);

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
                // Emit event for canvas component when second note is played
                console.log('🎼 EMITTING secondNotePlay:', {
                    intervalType: this.selectedInterval,
                    intervalIndex: this.intervalIndex,
                    rootNote: newRoot,
                    targetNote: this.randomMidiNumber,
                    scInterval: newMidiNumber - newRoot
                });
                eventEmitter.emit('secondNotePlay', {
                    intervalType: this.selectedInterval, // 'ascending', 'descending', or 'harmonic'
                    intervalIndex: this.intervalIndex,
                    rootNote: newRoot,
                    targetNote: this.randomMidiNumber
                });
            }, intervalDelay);

        }



        this.notesGenerated = this.notesGenerated + 1;

        this.referenceCounter++;
        // console.log('refernce counter increased to: ' + this.referenceCounter);

        // Dispatch event to clear the correct note highlight
        const clearEvent = new CustomEvent('clearCorrectNote');
        document.dispatchEvent(clearEvent);
    },

    handleMIDIMessage(note) {
        // console.log('handleMIDIMessage called', note, new Date().toISOString());
        if (!this.trainingStarted || !this.intervalActive) return;

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
            const event = new CustomEvent('setCorrectNote', { detail: correctNoteName });
            document.dispatchEvent(event);
        }
        // If the note is incorrect, dispatch setWrongNote with the wrong note's name
        if (!isCorrectNote) {
            const wrongNoteName = this.keyRangeList.find(k => k.midi === note)?.note;
            if (wrongNoteName) {
                const wrongEvent = new CustomEvent('setWrongNote', { detail: wrongNoteName });
                document.dispatchEvent(wrongEvent);
            }
        } else {
            // If correct, clear any previous wrong note
            const clearWrongEvent = new CustomEvent('setWrongNote', { detail: null });
            document.dispatchEvent(clearWrongEvent);
        }

        // Performance data tracking removed - now handled by level progress data in MBPage
    },

    handleDemoKeyPressed(event) {
        const note = event.detail;
        // console.log("Demo key pressed: " + note);
        this.handleMIDIMessage(note);
    },

    handleWrongNote() {
        if (this.notReceivedPointsYet) {

            this.monitorMessage = "Incorrect !";

            const event3 = new CustomEvent('updateMonitorMessage', { detail: this.monitorMessage });
            document.dispatchEvent(event3);

            // Emit falseNote event for the canvas
            eventEmitter.emit('falseNote', {});

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

            const event1 = new CustomEvent('updateScore', { detail: this.intervalScoreVector });
            document.dispatchEvent(event1);

            // console.log("This is the correct Note");
            // console.log("n Targets: " + this.nTargets);
            this.notReceivedPointsYet = false;
            const increment = 1; // Simple increment of 1 point per correct answer
            // console.log("increment: " + increment);
            this.score += increment;
            // console.log("score: " + this.score);

            // Dispatch custom event to update note Counter
            const event2 = new CustomEvent('updateNoteCounter', { detail: this.notesGenerated });
            document.dispatchEvent(event2);

            // Dispatch ratio update
            this.dispatchRatioUpdate();

            // Removed runNewNoteCycle() call - new notes are now triggered when bricks land, not when answered incorrectly
            if (this.correctNoteTimer) {
                clearTimeout(this.correctNoteTimer);
            }
        }
        else {
            // console.log("wrong note already counted.");
        }
    },

    handleCorrectNote() {
        if (this.notReceivedPointsYet) {

            this.monitorMessage = "Correct !";
            const event3 = new CustomEvent('updateMonitorMessage', { detail: this.monitorMessage });
            document.dispatchEvent(event3);

            // Calculate the simple half-tone interval value (0-11) for GameCanvas
            const recognizedInterval = this.calculateSimpleInterval();
            // console.log('🎯 ENGINE DEBUG: Sending recognized interval:', recognizedInterval);
            eventEmitter.emit('correctNote', {
                recognizedInterval: recognizedInterval
            });

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

            const event1 = new CustomEvent('updateScore', { detail: this.intervalScoreVector });
            document.dispatchEvent(event1);

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
            const event2 = new CustomEvent('updateNoteCounter', { detail: this.notesGenerated });
            document.dispatchEvent(event2);

            // Dispatch ratio update
            this.dispatchRatioUpdate();

            if (this.checkWinningCondition()) {
                // console.log("You won !");
                this.monitorMessage = "You won !";
                const event3 = new CustomEvent('updateMonitorMessage', { detail: this.monitorMessage });
                document.dispatchEvent(event3);
                this.trainingStarted = false;
                eventEmitter.emit('updateControlEvent', 'finished');
                if (this.audioCom) playWavFile('/game_sounds/Landing.wav');
                this.gameOver = true;
            }

            // Removed runNewNoteCycle() call - new notes are now triggered when bricks land, not when answered correctly
            if (this.correctNoteTimer) {
                clearTimeout(this.correctNoteTimer);
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
            const event3 = new CustomEvent('updateMonitorMessage', { detail: this.monitorMessage });
            document.dispatchEvent(event3);

            console.log('🎮 MelodyBricks: Game ended - general game over');

            // Emit single gameEnded event - loss
            eventEmitter.emit('gameEnded', {
                result: 'lost',
                reason: 'game_over',
                levelId: this.currentLevel?.id,
                levelName: this.currentLevel?.name,
                rowsCleared: this.rowsCleared,
                requiredRows: this.currentLevel?.winCondition?.eliminatedRows || 5,
                duration: Date.now() - this.startTime,
                correctAnswers: this.correctAnswers,
                totalAnswers: this.notesGenerated,
                bonuses: this.bonuses
            });

            if (this.audioCom) playWavFile('/game_sounds/Landing.wav');
        }, 1000);
    },



    handleBrickLanded(data) {
        // Primary check: a brick has landed
        this.intervalActive = false;
        if (!this.gameOver && this.trainingStarted) {
            // Check if it landed in row 0 (top row) - game over condition
            if (data.isGameOver) {
                // Game over - brick reached the top
                this.gameOver = true;
                this.trainingStarted = false;

                this.monitorMessage = "Bricks reached the top! Game Over!";
                const event3 = new CustomEvent('updateMonitorMessage', { detail: this.monitorMessage });
                document.dispatchEvent(event3);

                console.log('🎮 MelodyBricks: Game ended - bricks reached top');

                // Emit single gameEnded event - loss
                eventEmitter.emit('gameEnded', {
                    result: 'lost',
                    reason: 'bricks_reached_top',
                    levelId: this.currentLevel?.id,
                    levelName: this.currentLevel?.name,
                    rowsCleared: this.rowsCleared,
                    requiredRows: this.currentLevel?.winCondition?.eliminatedRows || 5,
                    duration: Date.now() - this.startTime,
                    correctAnswers: this.correctAnswers,
                    totalAnswers: this.notesGenerated,
                    bonuses: this.bonuses
                });

                // Emit session ended event for signup popup via mitt
                eventEmitter.emit('sessionEnded', {
                    duration: Date.now() - this.startTime,
                    correctAnswers: this.correctAnswers,
                    totalAnswers: this.notesGenerated
                });

                if (this.audioCom) playWavFile('/game_sounds/Landing.wav');

                this.clearTimers();
            } else {
                // Normal brick landing - trigger next note cycle
                this.longTime = 1000; // 1 second delay before next note

                // Clear any existing timer
                if (this.correctNoteTimer) {
                    clearTimeout(this.correctNoteTimer);
                }

                this.correctNoteTimer = setTimeout(() => {
                    this.runNewNoteCycle();
                }, this.longTime);
            }
        }
    },

    handleRowsCleared(data) {
        if (data && data.rowsCleared > 0) {
            this.rowsCleared += data.rowsCleared;

            // Handle bonus (perfect clear without mistakes)
            if (data.bonus) {
                this.bonuses += 1;
            }

            // Check win condition and get required rows
            const requiredRows = this.currentLevel?.winCondition?.eliminatedRows || 5;

            // Emit total rows cleared and bonus update via mitt (for UI updates)
            eventEmitter.emit('totalRowsClearedUpdate', {
                totalRowsCleared: this.rowsCleared,
                totalBonuses: this.bonuses,
                latestBonus: data.bonus,
                requiredRows: requiredRows
            });

            // Check for win condition
            if (this.rowsCleared >= requiredRows) {
                // Game won!
                this.gameOver = true;
                this.trainingStarted = false;

                this.monitorMessage = `🏆 LEVEL COMPLETE! You cleared ${this.rowsCleared} rows!`;
                const event3 = new CustomEvent('updateMonitorMessage', { detail: this.monitorMessage });
                document.dispatchEvent(event3);

                console.log(`🎮 MelodyBricks: Game ended - level won! ${this.rowsCleared}/${requiredRows} rows cleared`);

                // Emit single gameEnded event - win
                eventEmitter.emit('gameEnded', {
                    result: 'won',
                    reason: 'required_rows_cleared',
                    levelId: this.currentLevel?.id,
                    levelName: this.currentLevel?.name,
                    rowsCleared: this.rowsCleared,
                    requiredRows: requiredRows,
                    duration: Date.now() - this.startTime,
                    correctAnswers: this.correctAnswers,
                    totalAnswers: this.notesGenerated,
                    bonuses: this.bonuses
                });

                if (this.audioCom) playWavFile('/game_sounds/Landing.wav');

                this.clearTimers();
            }
        }
    },

    handleIntervalTimeout() {
        // When a brick lands in column 0 (interval timeout), just update the display
        // The notesGenerated count is already correct, we just need to refresh the accuracy display
        this.dispatchRatioUpdate();
    },

    // Add these methods to the Audiation Studio object
    initListeners() {
        if (!this.boundHandleMIDIMessage) {
            this.boundHandleMIDIMessage = this.handleMIDIMessage.bind(this);
        }
        removeEventListeners();
        initMIDI(this.boundHandleMIDIMessage);

        // Add event listener for brick landed (handles both normal landing and game over) using mitt
        if (!this.boundHandleBrickLanded) {
            this.boundHandleBrickLanded = this.handleBrickLanded.bind(this);
        }
        eventEmitter.on('brickLanded', this.boundHandleBrickLanded);

        // Add event listener for rows cleared
        if (!this.boundHandleRowsCleared) {
            this.boundHandleRowsCleared = this.handleRowsCleared.bind(this);
        }
        eventEmitter.on('rowsCleared', this.boundHandleRowsCleared);

        // Add event listener for interval timeout (brick lands in column 0)
        if (!this.boundHandleIntervalTimeout) {
            this.boundHandleIntervalTimeout = this.handleIntervalTimeout.bind(this);
        }
        eventEmitter.on('intervalTimeout', this.boundHandleIntervalTimeout);
    },
    removeListeners() {
        removeEventListeners();
        if (this.boundHandleDemoKeyPressed) {
            document.removeEventListener('demoKeyPressed', this.boundHandleDemoKeyPressed);
        }
        if (this.boundHandleBrickLanded) {
            eventEmitter.off('brickLanded', this.boundHandleBrickLanded);
        }
        if (this.boundHandleRowsCleared) {
            eventEmitter.off('rowsCleared', this.boundHandleRowsCleared);
        }
        if (this.boundHandleIntervalTimeout) {
            eventEmitter.off('intervalTimeout', this.boundHandleIntervalTimeout);
        }
    },
};

export default melodyBricks;
