import midiLookup from './midiLookup.json';
import majorScales from './majorScales.json';
import getLimits from './getLimits';

const noteListGenerator = (
                            task, 
                            subTask, 
                            key, 
                            oct, 
                            level, 
                            startNoteIn, 
                            endNoteIn) => {
   /*  console.log("In function: noteListGenerator");
    console.log("task: ", task);
    console.log("subTask: ", subTask);
    console.log("key: ", key);
    console.log("oct: ", oct);
    console.log("level: ", level);
    console.log("startNoteIn: ", startNoteIn);
    console.log("endNoteIn: ", endNoteIn); */
   
    let startNote = startNoteIn;
    let endNote = endNoteIn;
    let startNoteKeys;
    let endNoteKeys;

    function generateCustomKeyList(key, returnType, startNote, endNote) {

        let include = false;
        let keys = [];
        const keyList = [];
        const scaleNotes = majorScales.majorScale[key];
        let returnList;

        // console.log("noteListGenerator: ");
        // console.log("start note in function : " + startNote);
        // console.log("end note in function: " + endNote);

        if (!scaleNotes) {
            // console.error("Invalid key provided.");
            return keyList;
        }

        for (const [midi, keyData] of Object.entries(midiLookup.midiLookup)) {

            if (midiLookup.midiLookup[midi].denotation === startNote)
                include = true;

            if (include) {
                if (scaleNotes.includes(keyData.note))
                    keyList.push(midi);

                keys.push({
                    note: midiLookup.midiLookup[midi].denotation,
                    midi: midi,
                    type: midiLookup.midiLookup[midi].type
                });
            }
            if (midiLookup.midiLookup[midi].denotation === endNote)
                include = false;
        }
        if (returnType === 'scale') returnList = keyList;
        if (returnType === 'keyboard') returnList = keys;
        return returnList;
    }

    function getOctaveLimits(oct) {
        switch (oct) {
            case 1:
                if (key === 'C') { startNote = 'C4'; endNote = 'C5'; }
                if (key === 'G') { startNote = 'G3'; endNote = 'G4'; }
                break;
            case 2:
                if (key === 'C') { startNote = 'C3'; endNote = 'C5'; }
                if (key === 'G') { startNote = 'G3'; endNote = 'G5'; }
                break;
            case 3:
                if (key === 'C') { startNote = 'C4'; endNote = 'C7'; }
                if (key === 'G') { startNote = 'G3'; endNote = 'G6'; }
                break;
            case 4:
                if (key === 'C') { startNote = 'C4'; endNote = 'C8'; }
                if (key === 'G') { startNote = 'G3'; endNote = 'G7'; }
                break;
            default:
                startNote = 'C4'; endNote = 'C5';
                break;
        }
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

    if (task === 'ear' && (subTask ==='notes' || subTask === 'chords')) {
       
        if (level === 0) {
            // console.log("level is 0");
            startNote = midiLookup.midiLookup[String(startNoteIn)].denotation;
            endNote = midiLookup.midiLookup[String(endNoteIn)].denotation;

            startNoteKeys = startNote;
            endNoteKeys = endNote;

        }
        else
        {
            let keyLevel = level;
            if (level > 4) keyLevel = 4;
    
            [startNote, endNote] = getLimits(level,key);
            [startNoteKeys, endNoteKeys] = getLimits(keyLevel, key);
        }

        const keyNoteList = generateCustomKeyList(key, 'scale', startNote, endNote);
        // console.log("keyNoteList: ", keyNoteList);
        const keyRangeList = generateCustomKeyList(key, 'keyboard', startNoteKeys, endNoteKeys);
        // console.log("scaleRangeList: ", keyRangeList)
        return [keyNoteList, keyRangeList];
    }

    if ((task === 'scales') || (task === 'ear' && subTask === 'intervals')) {
        [startNote, endNote] = getOctaveLimits(oct);
        const keyNoteList = generateCustomKeyList(key, 'scale', startNote, endNote);
        // console.log("keyNoteList: ", keyNoteList);
        const keyScaleList = upAndDown(keyNoteList);
        // console.log("keyScaleList: ", keyScaleList);
        startNoteKeys = startNote;
        endNoteKeys = endNote;
        const scaleRangeList = generateCustomKeyList(key, 'keyboard', startNoteKeys, endNoteKeys);
        // console.log("scaleRangeList: ", scaleRangeList)
        return [keyScaleList, scaleRangeList];
    }
}
export default noteListGenerator;