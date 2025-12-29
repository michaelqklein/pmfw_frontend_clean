import { initMIDI, removeEventListeners } from '@shared/utils/midiListener';
// import { high_score } from '../UserData';
import gameLevelsFile from '@shared/utils/levelsKeyCommanderI.json';
import alienTypesFile from '@shared/utils/alienTypes.json';
import noteListGenerator from '@shared/utils/noteListGenerator.js';
import pickRandOfList from '@shared/utils/pickRandOfList.js';
import playWavFile from '@/src/utils/playWavFile';
import getFileName from '@shared/utils/getFileName';
import eventEmitter from '@shared/utils/eventEmitter';

const keyCommanderI = {
    initialized: false,
    tellStory: false,
    gameStartMission: 1, // (usually 1) enter testing/starting mission here
    gameCurrentMission: 1,
    highestUnlockedMission: 1,
    gameAllMissions: null,
    gameAllAliens: null,
    currentLevelProperties: null,
    currentAlien: null,
    alienNumber: 0,
    fireInfo: null,
    nTargetsDestroyed: 0,
    destroyRatio: 0,
    alienSpeed: 4,
    alienColor: null,
    ammoPerAlien: 5,
    bufferResetTimer: null,
    phase: 'start',
    startTimer: null,
    alienTimer: null,
    totalDuration: null,
    startTime: null,
    remainingTime: null,
    elapsedTime: null,
    health: 100,
    ammo: 50,
    lives: 5,
    error: 0,
    shotsFired: 0,
    task: 'notes',
    newData: false,
    level: 1,
    xp: 0,
    tonality: 'C',
    oct: 1,
    notReceivedPointsYet: false,
    keyRangeList: [],
    whichKeys: 'onScreen',
    replayAfter: 1000,
    audioCom: true,
    visualCom: true,
    destroyedPerShot: 0,
    noteList: [],
    notesGenerated: 0,
    noteBuffer: [],
    melody: [],
    lastNote: null,
    filename: "",
    nFalseAttempts: 0,
    nFalseReplay: 0,
    trainingStarted: false,
    correctNoteTimer: null,
    refNum: 1,
    referenceCounter: 0,
    nTargets: null,
    gameOver: false,
    readyToLevelUp: false,
    monitorMessage: "",
    longTime: 1000,
    trainingDataList: [],
    // showAnimation: true,

    initialize() {
        if (!this.initialized) {
            initMIDI(this.handleMIDIMessage.bind(this));
            eventEmitter.on('demoKeyPressed', this.handleDemoKeyPressed.bind(this));
            this.loadAllMissions();
            this.gameCurrentMission = this.gameStartMission;
            this.initialized = true;
        }
    },

    run(whichKeys) {
        if (this.trainingStarted) return;
        this.setRunParameters(whichKeys);
        this.startGame();
    },

    stop() {
        clearTimeout(this.alienTimer);
        this.trainingStarted = false;
        // this.monitorMessage = "";

        if (this.correctNoteTimer) {
            clearTimeout(this.correctNoteTimer);
        }
        // Removed CustomEvent - now using eventEmitter
        // eventEmitter.emit('updateMonitorMessage', this.monitorMessage);

       /*  if (this.newData) {
            const returnedData = this.createTrainingData();
            // console.log("Piano Gym (Training Data about to be arrayed):", returnedData); // For now, log the data
            this.trainingDataList.push(returnedData);
            // console.log("Piano Gym (Training Data List elememnt):", this.trainingDataList[0]); // For now, log the data
            if (this.trainingDataList.length > 10)
                this.trainingDataList.shift();
            this.newData = false;
        } */
        // console.log("Piano Gym (returning Training Data List):", this.trainingDataList[0]); // For now, log the data   
        return this.trainingDataList;
    },

    pauseTraining() {
        if (this.trainingStarted)
            this.trainingStarted = false;
        switch (this.phase) {
            case 'start':
                clearTimeout(this.startTimer);
                this.elapsedTime = Date.now() - this.startTime;
                console.log("elapsedTime: ", this.elapsedTime);
                this.remainingTime = this.totalDuration - this.elapsedTime;  // Calculate actual remaining time
                this.totalDuration = this.remainingTime;
                console.log("remainingTime: ", this.remainingTime);
                break;
            case 'alien':
                clearTimeout(this.alienTimer);
                this.elapsedTime = Date.now() - this.startTime;
                console.log("elapsedTime: ", this.elapsedTime);
                this.remainingTime = this.totalDuration - this.elapsedTime;  // Calculate actual remaining time
                this.totalDuration = this.remainingTime;
                console.log("remainingTime: ", this.remainingTime);
                break;
            case 'interval':
                break;
            default:
                break;
        }
    },

    unpauseTraining() {
        if (!this.trainingStarted && this.remainingTime > 0) {
            this.trainingStarted = true;
            switch (this.phase) {
                case 'start':
                    this.startTime = Date.now();  // Reset start time
                    this.startTimer = setTimeout(() => {
                        this.runNewNoteCycle();
                    }, this.remainingTime);  // Use the remaining time directly
                    break;
                case 'alien':
                    this.startTime = Date.now();  // Reset start time
                    this.alienTimer = setTimeout(() => {
                        this.endAlienTimer();
                    }, this.remainingTime);  // Use the remaining time directly
                    break;
                case 'interval':
                    break;
                default:
                    break;
            }
        }
    },

    restartMission(whichKeys) {
        clearTimeout(this.alienTimer);
        this.trainingStarted = false;
        // this.monitorMessage = "";

        if (this.correctNoteTimer) {
            clearTimeout(this.correctNoteTimer);
        }

        this.setRunParameters(whichKeys);
        this.startGame();
    },

    selectMission(currentMission) {
        this.pauseTraining();
        clearTimeout(this.alienTimer);
        this.trainingStarted = false;
        if (this.correctNoteTimer) {
            clearTimeout(this.correctNoteTimer);
        }
        this.gameCurrentMission = currentMission;
        // console.log("gameCurrentMission set to: ", this.gameCurrentMission);
    },

    resetGame(whichKeys) {
        this.pauseTraining();

        // Step 1: Dispatch the event to show the confirmation window
        eventEmitter.emit('updateShowTopWindow', true);

        // Step 2: Wait for the user's response using a Promise
        this.getUserConfirmation().then((confirmed) => {
            // Step 3: Handle the response (confirmed = true or false)
            if (confirmed) {
                // If the user confirmed, proceed with resetting the game
                this.gameCurrentMission = 1;
                this.highestUnlockedMission = 1;
            } else {
                this.unpauseTraining();
            }
        });
    },

    quit() {
        removeEventListeners();
        eventEmitter.off('demoKeyPressed', this.handleDemoKeyPressed.bind(this));
    },

    // Utility function to return a Promise that resolves when the user responds
    getUserConfirmation() {
        return new Promise((resolve) => {
            // Listen for the user's response (Yes or No)
            const onYes = () => {
                resolve(true); // User clicked 'Yes'
                cleanup(); // Remove event listeners
            };
            const onNo = () => {
                resolve(false); // User clicked 'No'
                cleanup(); // Remove event listeners
            };

            // Add event listeners for the Yes and No buttons
            eventEmitter.on('confirmResetYes', onYes);
            eventEmitter.on('confirmResetNo', onNo);

            // Clean up listeners after the response
            const cleanup = () => {
                eventEmitter.off('confirmResetYes', onYes);
                eventEmitter.off('confirmResetNo', onNo);
            };
        });
    },

    setRunParameters(whichKeys) {
        this.gameOver = false;
        this.shotsFired = 0;
        this.noteBuffer = [];
        this.nTargetsDestroyed = 0;
        this.alienNumber = 0;
        this.fireInfo = {
            fireState: 'load',
            error: 0,
            numberNotes: 1,
            activeNotes: 0,
            targetX: 0,
            targetY: 0
        }
        this.destroyRatio = 0;
        this.destroyedPerShot = 0;
        this.alienSpeed = 4000;
        this.ammoPerAlien = 5;
        this.health = 100;
        this.ammo = 0;
        this.lives = 5;
        this.newData = true;
        this.readyToLevelUp = false;
        this.referenceCounter = 0;
        this.nFalseAttempts = 0;
        this.nFalseReplay = 0;
        this.notesGenerated = 0;
    },

    startGame() {

        this.trainingStarted = true;

        // Dispatch custom event to update note Counter
        eventEmitter.emit('updateNoteCounter', this.notesGenerated);
        eventEmitter.emit('updateScore', this.destroyedPerShot);
        eventEmitter.emit('updateHealth', this.health);
        eventEmitter.emit('updateAmmo', this.ammo);
        eventEmitter.emit('updateLifes', this.lives);
        eventEmitter.emit('updateDestroyRatio', 0);

        this.updateGUI();

        // Add event listener for demoKeyPressed

        // story is currently deactivated.
        let storyTime = 0; // 10000; // usually 
        if (this.tellStory) {
            storyTime = 10000;
            this.story();
        }
        if (this.trainingStarted) {
            setTimeout(() => {
                this.loadMission();
                this.loadNextAlien();

                this.longTime = 5000;
                // Launch countdown sequence

                setTimeout(() => {
                    if (!(this.refNum === 0)) {
                        if (this.trainingStarted) {
                            this.playReference();
                        }
                        this.longTime += 5000;
                    }
                }, storyTime + 5000);

                this.totalDuration = storyTime + this.longTime + 5000;
                this.startTime = Date.now();
                this.phase = 'start';
                this.startTimer = setTimeout(() => {
                    if (this.trainingStarted) {
                        this.runNewNoteCycle();
                    }
                }, this.totalDuration);
            }, storyTime);
        }
    },

    story() {
        const messages = ["Earth is under Attack!", "An invasive alien species called the Tonians is threating to invade our planet.", "Among many brave humans, you are send out to defend earth.", "Tonians can only be killed by a sound ball that emits a specific frequency.", "Fortunatly they emit the same frequncy that can destroy them.", "To destroy them you have to identify the frequency and fire a pulse ball emiting the same frequency."];
        messages.forEach((message, index) => {
            setTimeout(() => {
                        eventEmitter.emit('updateMonitorMessage', message);
            }, (index * 2000)); // Dispatch each message 1 second apart
        });
    },

    loadAllMissions() {
        this.gameAllMissions = gameLevelsFile.gameLevels;
        this.gameAllAliens = alienTypesFile.alienTypes;
    },

    updateGUI() {
        eventEmitter.emit('updateNTargetsDestroyed', this.nTargetsDestroyed);
        eventEmitter.emit('updateAlienNumber', this.alienNumber);
        eventEmitter.emit('updateDestroyRatio', this.destroyRatio);
        eventEmitter.emit('updateScore', this.destroyedPerShot);
        eventEmitter.emit('updateAmmo', this.ammo);

        // Events are now emitted directly above
    },

    loadMission() {
        // console.log("mission: ", this.gameCurrentMission);
        if (!this.gameAllMissions) {
            this.loadAllMissions();
        }

        // load the next level if there is one.
        if (this.gameAllMissions.hasOwnProperty(this.gameCurrentMission)) {

            this.currentLevelProperties = this.gameAllMissions[this.gameCurrentMission];
            eventEmitter.emit('updateLevelProperties', this.currentLevelProperties);

            this.nTargets = this.currentLevelProperties.aliens.length;

            this.ammo = this.currentLevelProperties.initialAmmo;
            this.ammoPerAlien = this.currentLevelProperties.ammoPerAlien;

            this.nTargetsDestroyed = 0;
            this.alienNumber = 0;
            this.destroyRatio = 0;
            this.shotsFired = 0;
            this.destroyedPerShot = 0;

            this.updateGUI();

            this.monitorMessage = "Level " + this.currentLevelProperties.level + " - Mission " + this.gameCurrentMission
            eventEmitter.emit('updateMonitorMessage', this.monitorMessage);
            setTimeout(() => {
                eventEmitter.emit('updateMonitorMessage', this.currentLevelProperties.startText);
            }, 2000);

            [this.noteList, this.keyRangeList] = noteListGenerator('ear', 'notes',
                this.tonality, this.oct, 0, this.currentLevelProperties.startNote, this.currentLevelProperties.endNote);
            eventEmitter.emit('updateKeyboard', this.keyRangeList);
        } else {
            console.log("not loading levels");
            this.handleGameOver();
            return null;
        }
    },

    loadNextAlien() {
        this.noteBuffer = [];
        eventEmitter.emit('updateNumberActive', this.noteBuffer.length);

        const alienTypeNumber = this.currentLevelProperties.aliens[this.alienNumber];
        this.currentAlien = this.gameAllAliens[alienTypeNumber];

        console.log("loadNextAlien, number", alienTypeNumber);
        console.log("loadNextAlien, damage", this.currentAlien.damage);
        console.log("currentAlien.damage: ", this.currentAlien.damage);


        eventEmitter.emit('updateAlien', this.currentAlien);

        this.alienSpeed = this.currentAlien.alienSpeed;
        this.alienColor = this.currentAlien.color;

        eventEmitter.emit('updateScaleSpeed', this.currentAlien.alienSpeed);

        eventEmitter.emit('updateAlienColor', this.currentAlien.color);
        eventEmitter.emit('updateAlienSize', this.currentAlien.size);

        eventEmitter.emit('updateAlienNumber', this.alienNumber);
    },
    // Function to create the data object for the session
  /*   createTrainingData() {
        // console.log("update Troining Data");
        const date = new Date();
        const scoreData = new high_score(
            this.destroyedPerShot.toFixed(2), // Percentage score
            date.toISOString().split('T')[0], // YYYY-MM-DD format
            date.toTimeString().split(' ')[0], // HH:MM:SS format
            this.level); // level
        // console.log("Piano Gym (Training Data about to be returned):", scoreData); // For now, log the data
        return scoreData;
    }, */

    playReference() {
        // play reference chord
        // console.log('reference triggered ! ');
        let relativeFile = '/ref_wav/' + this.tonality + '_ref.wav';
        playWavFile(relativeFile);

        const messages = ["get ready", "3", "2", "1", "here comes your target"];
        messages.forEach((message, index) => {
            if (this.trainingStarted)
                setTimeout(() => {
                    eventEmitter.emit('updateMonitorMessage', message);
                }, (index * 1000)); // Dispatch each message 1 second apart
        });
    },

    endAlienTimer() {
        // this is for all aliens
        this.phase = 'interval';
        eventEmitter.emit('updateNoteAlien', false);


        console.log("endAlientimer");
        console.log("currentAlien.damage: ", this.currentAlien.damage);

        // this is for aliens that do damage only
        if (this.currentAlien.damage > 0) {
            console.log("D A M A G E");
                    eventEmitter.emit('updateShatter', true);
            playWavFile('/game_sounds/Explosion.wav', 0.5);
            // console.log("health before: ", this.health);
            this.health -= this.currentAlien.damage;
            // console.log("health after: ", this.health    )
            eventEmitter.emit('updateHealth', this.health);
        }


        setTimeout(() => {

            if (this.currentAlien.damage > 0) {
                eventEmitter.emit('updateShatter', false);
            }

            if (this.health === 0) {
                this.health = 100;
                this.lives -= 1;
                eventEmitter.emit('updateLifes', this.lives);
                eventEmitter.emit('updateHealth', this.health);
            }
        }, 1000);

        this.finishTargetCycle();
    },

    prepareNextNoteCycle() {
        if (this.gameOver) return;
        // console.log("in prepareNextNoteCycle, this.noteGenerated: ", this.notesGenerated);
        // console.log("this.nTargets: ", this.nTargets);

        if (this.nTargets === (this.alienNumber))
            this.readyToLevelUp = true;

        // Dispatch custom event to update note Counter
        if (this.readyToLevelUp) {

            setTimeout(() => {
                this.handleLevelUp();
            }, 3000);
        }

        if (this.correctNoteTimer) {
            clearTimeout(this.correctNoteTimer);
        }

        if (!this.readyToLevelUp) {
            this.longTime = 2000; // without ref
            // console.log("Ref Num: " + this.refNum);
            if (this.refNum > 2) {
                // console.log("Reference Counter: ", this.referenceCounter);
                if (this.referenceCounter === this.refNum) {
                    this.correctNoteTimer = setTimeout(() => {
                        this.playReference();
                    }, 1000);
                    this.referenceCounter = 0;
                    this.longTime = 8000; // with ref
                }
            }

            this.correctNoteTimer = setTimeout(() => {

                this.loadNextAlien();
                this.runNewNoteCycle();
            }, this.longTime);
        }
    },

    runNewNoteCycle() {
        if (this.gameOver) return;
        if (this.noteList.length === 0) return;

        this.ammo += this.ammoPerAlien;
        if (this.ammo > 100) this.ammo = 100;
        eventEmitter.emit('updateAmmo', this.ammo);

        eventEmitter.emit('updateAlienNumber', (this.alienNumber + 1));

        this.nFalseAttempts = 0;
        this.notReceivedPointsYet = true;
        // console.log("nFalseAttempts: " + this.nFalseAttempts)
        eventEmitter.emit('updateFalseAttempts', this.nFalseAttempts);

        eventEmitter.emit('updateNoteAlien', true);

        let waitTime = 0
        for (let i = 0; i < (this.currentAlien.notes); i++) {
            if (i === 0) {
                this.melody[i] = pickRandOfList(this.noteList, this.last_note, this.currentLevelProperties.newNotes);
                this.last_note = this.melody[i];
            }
            else
                do {
                    this.melody[i] = pickRandOfList(this.noteList, this.lastNote, this.currentLevelProperties.newNotes);
                } while (this.melody[i] === this.melody[i - 1]);
            this.last_note = this.melody[i];

            setTimeout(() => {
                this.fileName = "/sound/piano_wav/" + getFileName(this.melody[i]);
                playWavFile(this.fileName);
            }, waitTime);
            waitTime += 500;
        }

        this.notesGenerated = this.notesGenerated + 1;

        this.referenceCounter++;

        // time out until end of alien

        let alienExistanceTimeFactor = 850;
        if (this.currentAlien.damage === 0)
            // aliens that don't do damage need to fly away again
            alienExistanceTimeFactor = 2000;

        this.totalDuration = this.alienSpeed * alienExistanceTimeFactor; // to get to ms
        console.log("totalDuration: ", this.totalDuration);
        this.startTime = Date.now();

        this.phase = 'alien';
        this.alienTimer = setTimeout(() => {
            this.endAlienTimer();
        }, this.totalDuration);
    },

    handleMIDIMessage(note) {

        clearTimeout(this.bufferResetTimer);
        let fired = false;
        if (!this.trainingStarted) return;
        if (this.ammo > 0) {

            this.bufferResetTimer = setTimeout(() => {
                this.noteBuffer = [];
                eventEmitter.emit('updateNumberActive', this.noteBuffer.length);
            }, 1000);

            let isCorrectNote = true;

            if (Number(note) === Number(this.melody[this.noteBuffer.length])) {
                this.noteBuffer.push(note);
            }
            else {
                this.shotsFired += 1;
                this.ammo -= 1;
                eventEmitter.emit('updateAmmo', this.ammo);
                this.noteBuffer = [];
                this.error = note - this.melody[this.noteBuffer.length];
                if (this.currentAlien.notes === 1) {
                    this.handleWrongNote();
                }
                else {
                    this.handleWrongNoteSound();
                }
            }
            eventEmitter.emit('updateNumberActive', this.noteBuffer.length);

            if (this.noteBuffer.length === this.currentAlien.notes) {
                this.shotsFired += 1;
                // count down ammo
                this.ammo -= 1
                eventEmitter.emit('updateAmmo', this.ammo);

                fired = true;
                // console.log("noteBuffer: ", this.noteBuffer);

                for (let i = 0; i < this.currentAlien.notes; i++) {
                    console.log("Iteration number: " + i);
                    if (!(this.noteBuffer[i] === this.melody[i]))
                        isCorrectNote = false;
                }
                this.noteBuffer = [];
                setTimeout(() => {
                    this.fireInfo.fireState = 'off';
                    eventEmitter.emit('updateNumberActive', this.noteBuffer.length);
                }, 1000);
            }

            if (fired) {
                if (!isCorrectNote) {

                    // if error > 0 note is too high
                    // if error < 0 note is too low
                    // console.log("wrong note");
                    this.handleWrongNote();
                } else {
                    // console.log("correct note")
                    this.handleCorrectNote();
                }
            }
        }
    },

    handleDemoKeyPressed(note) {
        // console.log("Demo key pressed: " + note);
        this.handleMIDIMessage(note);
    },

    updateScore() {

        if (this.shotsFired > 0)
            this.destroyedPerShot = (this.nTargetsDestroyed / this.shotsFired) * 100
        else this.score = 0;

        // Dispatch custom event to update score
        eventEmitter.emit('updateScore', this.destroyedPerShot);
    },

    handleWrongNoteSound() {

        if (this.audioCom) {
            if (this.whichKeys === 'onScreen') {
                setTimeout(() => {
                    playWavFile('/game_sounds/Negative.wav', 0.7);
                }, 500);
            }
            else {
                playWavFile('/game_sounds/Negative.wav', 0.7);
            }
        }
    },

    handleWrongNote() {
        eventEmitter.emit('shoot', 'miss');

        this.fireInfo.error = this.error;
        this.fireInfo.fireState = 'miss';
        eventEmitter.emit('updateFireInfo', this.fireInfo);

        this.handleWrongNoteSound()

        this.nFalseAttempts++;
        this.nFalseReplay++;
        if (this.nFalseReplay === this.replayAfter) {
            setTimeout(() => {
                playWavFile(this.fileName);
            }, 500);
            this.nFalseReplay = 0;
        }

        this.updateScore();
        // console.log("Failed Attempts: " + this.nFalseAttempts);
    },

    handleCorrectNote() {
        clearTimeout(this.alienTimer);

        if (this.notReceivedPointsYet) {
            this.nTargetsDestroyed += 1;

            eventEmitter.emit('shoot', 'kill');

            this.fireInfo.error = 0;
            this.fireInfo.fireState = 'kill';
            eventEmitter.emit('updateFireInfo', this.fireInfo);
            eventEmitter.emit('updateNoteAlien', false);

            this.notReceivedPointsYet = false;
            if (this.audioCom) {
                if (this.whichKeys === 'onScreen') {
                    setTimeout(() => {
                        playWavFile('/game_sounds/RetroWin.wav', 0.3);
                    }, 500);
                }
                else {
                    playWavFile('/game_sounds/RetroWin.wav', 0.3);
                }
            }
            // console.log("This is the correct Note");
            // console.log("n Targets: " + this.nTargets);
            this.notReceivedPointsYet = false;

            // Dispatch custom event to update note Counter
            eventEmitter.emit('updateNTargetsDestroyed', this.nTargetsDestroyed);

        }

        this.finishTargetCycle()
        /*  else
             console.log("correct note already counted.");
    */
    },

    finishTargetCycle() {

        this.noteBuffer = [];
        console.log("compute destroyRatio:")
        console.log(this.nTargetsDestroyed, "/", this.alienNumber);
        this.destroyRatio = 100 * (this.nTargetsDestroyed / (this.alienNumber + 1));
        eventEmitter.emit('updateDestroyRatio', this.destroyRatio);

        this.updateScore();

        setTimeout(() => {
            this.alienNumber += 1;
            console.log("alien number: ", this.alienNumber);
            if (this.trainingStarted) {
                this.prepareNextNoteCycle();
            }
        }, 500);
    },

    handleLevelUp() {
        let missionAccomplished = true;
        // check mission conditions
        if (this.destroyRatio < this.currentLevelProperties.destroyRateRequirement)
            missionAccomplished = false;
        console.log("this.destroyPerShot: ", this.destroyedPerShot);
        console.log("this.currentLevelProperties.destroyPerShotRequiremet: ", this.currentLevelProperties.destroyPerShotRequirement);
        if (this.destroyedPerShot < this.currentLevelProperties.destroyPerShotRequirement)
            missionAccomplished = false;
        if (missionAccomplished) {

            eventEmitter.emit('updateMonitorMessage', "Mission accomplished.");
            this.gameCurrentMission += 1;
            eventEmitter.emit('updateCurrentMission', this.gameCurrentMission);
            if (this.highestUnlockedMission < this.gameCurrentMission) {
                this.highestUnlockedMission = this.gameCurrentMission;
                this.xp += 1;
                eventEmitter.emit('updateXP', this.xp);

                // saving the new accomplishments to the database
                console.log("keyCommander, this.currentMission: ", this.gameCurrentMission);
                eventEmitter.emit('saveAccomplishments', {
                    current_mission: this.gameCurrentMission,
                    best_mission: this.highestUnlockedMission,
                    XP: this.xp
                });

                eventEmitter.emit('updateAccomplishments', this.highestUnlockedMission);
                setTimeout(() => {
                    eventEmitter.emit('updateMonitorMessage', "You have unlocked Mission " + this.highestUnlockedMission);
                }, 3000);

            }
        }
        else {
            eventEmitter.emit('updateMonitorMessage', "Mission failed. Try again.");
        }
        setTimeout(() => {
            this.loadMission();
            this.readyToLevelUp = false;

            setTimeout(() => {
                this.notesGenerated = 0;
                // console.log("in handleLevelUp, this.noteGenerated: ", this.notesGenerated);

                eventEmitter.emit('updateNoteCounter', this.notesGenerated);

                this.prepareNextNoteCycle();
            }, 10000);
        }, 6000);
    },

    handleGameOver() {
        setTimeout(() => {
            this.gameOver = true;
            this.stopTraining();

            this.monitorMessage = "GAME OVER"
            this.trainingStarted = false;
            eventEmitter.emit('updateMonitorMessage', this.monitorMessage);

            // dispatch message that training has stopped
            eventEmitter.emit('updateControlEvent', 'finished');

            if (this.audioCom) playWavFile('/game_sounds/Landing.wav');
        }, 1000);
    },

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


};

export default keyCommanderI;
