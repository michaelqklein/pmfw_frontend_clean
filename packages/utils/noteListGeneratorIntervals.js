import midiLookup from './midiLookup.json';
import majorScales from './majorScales.json';
import getLimits from './getLimits';

const noteListGeneratorIntervals = (
    task,
    subTask,
    ascendingVector,
    descendingVector,
    harmonicVector,
    key,
    oct,
    level,
    startNoteIn,
    endNoteIn,
    levelType = null) => {
    // console.log("In function: noteListGenerator");
// console.log("task: ", task);
// console.log("subTask: ", subTask);
// console.log("descendingVector: ", descendingVector);
// console.log("ascendingVector: ", ascendingVector);
// console.log("harmonicVector: ", harmonicVector);
// console.log("key: ", key);
// console.log("oct: ", oct);
// console.log("level: ", level);
// console.log("startNoteIn: ", startNoteIn);
// console.log("endNoteIn: ", endNoteIn); 

    let startNoteTargetDomain = startNoteIn;
    let endNoteTargetDomain = endNoteIn;
    let startNote = startNoteIn;
    let endNote = endNoteIn;
   
    let startNoteKeys;
    let endNoteKeys;

    function generateTargetNoteList(key, midiKeyStartNote, midiKeyEndNote) {
        // Descending intervals
        const invertedDescendingVector = [...descendingVector].reverse();
        const descendingList = [];
        const descendingstart = midiKeyStartNote;
        const descendingend = midiKeyStartNote + 11;
        let descIndex = 0;
        for (const [midi, keyData] of Object.entries(midiLookup.midiLookup)) {
            const midiNum = parseInt(midi, 10);
            if (midiNum >= descendingstart && midiNum <= descendingend) {
                if (invertedDescendingVector[descIndex] === 1) {
                    descendingList.push(midi);
                }
                descIndex++;
            }
        }

        // Ascending intervals
        const ascendingList = [];
        const ascendingstart = midiKeyStartNote + 13;
        const ascendingend = midiKeyEndNote;
        let ascIndex = 0;
        for (const [midi, keyData] of Object.entries(midiLookup.midiLookup)) {
            const midiNum = parseInt(midi, 10);
            if (midiNum >= ascendingstart && midiNum <= ascendingend) {
                if (ascendingVector[ascIndex] === 1) {
                    ascendingList.push(midi);
                }
                ascIndex++;
            }
        }

        // Harmonic intervals
        const harmonicList = [];
        const harmonicstart = midiKeyStartNote + 13;
        const harmoniceend = midiKeyEndNote;
        let harmIndex = 0;
        for (const [midi, keyData] of Object.entries(midiLookup.midiLookup)) {
            const midiNum = parseInt(midi, 10);
            if (midiNum >= harmonicstart && midiNum <= harmoniceend) {
                if (harmonicVector[harmIndex] === 1) {
                    harmonicList.push(midi);
                }
                harmIndex++;
            }
        }

        // console.log("descendingList: ", descendingList);
// console.log("ascendingList: ", ascendingList);
// console.log("harmonicList: ", harmonicList);
        return [descendingList, ascendingList, harmonicList];
    }

    function generateKeyboardList(key, startNote, endNote) {
        let include = false;
        const keys = [];
        const scaleNotes = majorScales.majorScale[key];
        // ...
        const invertedVector = [...descendingVector].reverse();
        invertedVector.push(0);
        const finalIntervalVector = invertedVector.concat(ascendingVector);
        let intervalVectorIndex = 0;
        for (const [midi, keyData] of Object.entries(midiLookup.midiLookup)) {
            if (midiLookup.midiLookup[midi].denotation === startNote)
                include = true;
            if (include) {
                keys.push({
                    note: midiLookup.midiLookup[midi].denotation,
                    midi: midi,
                    type: midiLookup.midiLookup[midi].type
                });
                intervalVectorIndex++;
            }
            if (midiLookup.midiLookup[midi].denotation === endNote)
                include = false;
        }
        return keys;
    }

    function getOctaveLimits(oct) {
        switch (oct) {
            case 1:
                if (key === 'C') { startNote = 'C4'; endNote = 'C5'; }
                if (key === 'G') { startNote = 'G4'; endNote = 'G5'; }
                break;
            case 2:
                startNote = 'C3'; endNote = 'C5';
                if (key === 'C') { startNote = 'C3'; endNote = 'C5'; }
                if (key === 'G') { startNote = 'G3'; endNote = 'G5'; }
                if (key === 'D') { startNote = 'D3'; endNote = 'D5'; }
                if (key === 'A') { startNote = 'A3'; endNote = 'A5'; }
                if (key === 'E') { startNote = 'E3'; endNote = 'E5'; }
                if (key === 'B') { startNote = 'B3'; endNote = 'B5'; }
                if (key === 'Gb') { startNote = 'Gb3'; endNote = 'Gb5'; }
                if (key === 'Db') { startNote = 'Db3'; endNote = 'Db5'; }
                if (key === 'Ab') { startNote = 'Ab3'; endNote = 'Ab5'; }
                if (key === 'Eb') { startNote = 'Eb3'; endNote = 'Eb5'; }
                if (key === 'Bb') { startNote = 'Bb3'; endNote = 'Bb5'; }
                if (key === 'F') { startNote = 'F3'; endNote = 'F5'; }
                break;
            default:
                startNote = 'C4'; endNote = 'C5';
                break;
        }
        // console.log("key: ", key);
        // console.log("startNote: ", startNote);
        // console.log("endNote: ", endNote);  
        return [startNote, endNote];
    }

    function upAndDown(keyNoteList) {
        const result = keyNoteList.slice();
        result.push(...keyNoteList.slice(0, -1).reverse());
        return result;
    }

    // console.log("start note in : " + startNoteIn);
    // console.log("end note in: " + endNoteIn);

    // console.log("endNote = " + endNote);

    // console.log("keyNoteList: " + keyNoteList);
    //console.log("generator: " + levelNoteList);

   /*  if (task === 'ear' && (subTask === 'notes' || subTask === 'chords')) {

        if (level === 0) {
            // console.log("level is 0");
            startNote = midiLookup.midiLookup[String(startNoteIn)].denotation;
            endNote = midiLookup.midiLookup[String(endNoteIn)].denotation;

            startNoteKeys = startNote;
            endNoteKeys = endNote;

        }
        else {
            let keyLevel = level;
            if (level > 4) keyLevel = 4;

            [startNote, endNote] = getLimits(level, key);
            [startNoteKeys, endNoteKeys] = getLimits(keyLevel, key);
        }

        // console.log("midiKeyStartNote: ", midiKeyStartNote);
// console.log("midiKeyEndNote: ", midiKeyEndNote);
        const keyNoteList = generateTargetNoteList(key, midiKeyStartNote, midiKeyEndNote);
        // console.log("keyNoteList: ", keyNoteList);

        const keyRangeList = generateKeyboardList(key, startNoteKeys, endNoteKeys);
        // console.log("scaleRangeList: ", keyRangeList)

        return [keyNoteList, keyRangeList];
    }
 */
    if ((task === 'scales') || (task === 'ear' && subTask === 'intervals')) {
        // console.log("startNoteTargetDomain before Oct Limits: ", startNoteTargetDomain);
        [startNoteKeys, endNoteKeys] = getOctaveLimits(2);
        // console.log("key: ", key);
        const octaveLimits = getOctaveLimitsMidiNumbers(key);
        // console.log("octaveLimits: ", octaveLimits);
        startNoteTargetDomain = octaveLimits.lower;
        endNoteTargetDomain = octaveLimits.higher;
        // console.log("startNoteTargetDomain after Oct Limits: ", startNoteTargetDomain);
        const keyNoteList = generateTargetNoteList(key, startNoteTargetDomain, endNoteTargetDomain);
        // console.log("keyNoteList: ", keyNoteList);
        const keyScaleList = upAndDown(keyNoteList);
        // console.log("keyScaleList: ", keyScaleList);
        // For 12 tone wall, modify keyboard range based on ascending/descending
        if (levelType === "12 tone wall") {
            const hasAscending = ascendingVector.some(val => val === 1);
            const hasDescending = descendingVector.some(val => val === 1);
            
            if (hasAscending && !hasDescending) {
                // Ascending only - use upper octave (e.g., C4 to C5)
                const octaveLimits = getOctaveLimitsMidiNumbers(key);
                startNoteKeys = midiLookup.midiLookup[String(octaveLimits.middle)].denotation;
                endNoteKeys = midiLookup.midiLookup[String(octaveLimits.higher)].denotation;
            } else {
                // Descending only or mixed - use lower octave (e.g., C3 to C4)
                const octaveLimits = getOctaveLimitsMidiNumbers(key);
                startNoteKeys = midiLookup.midiLookup[String(octaveLimits.lower)].denotation;
                endNoteKeys = midiLookup.midiLookup[String(octaveLimits.middle)].denotation;
            }
        } else {
            // Regular behavior - use the original range
            startNoteKeys = startNote;
            endNoteKeys = endNote;
        }
        
        const scaleRangeList = generateKeyboardList(key, startNoteKeys, endNoteKeys);
        // console.log("scaleRangeList: ", scaleRangeList)
        return [keyNoteList, scaleRangeList];
    }
}

/**
 * Given a note name (e.g., 'Bb'), assumes it's 'Bb4', finds the midi number for 'Bb4',
 * and returns the midi numbers for the same note an octave lower and an octave higher.
 * @param {string} note - The note name, e.g., 'Bb'
 * @returns {{lower: number, middle: number, higher: number} | null}
 */
export function getOctaveLimitsMidiNumbers(note) {
    const tonalityList = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
    const lower = tonalityList.indexOf(note) + 60 - 12;
    const middle = tonalityList.indexOf(note) + 60;
    const higher = lower + 24;
  return { lower, middle, higher };
}

export default noteListGeneratorIntervals;