const getLimits = (level, key) => {

    let startNote;
    let endNote;

    switch (level) {
        case 0:
            break;
        case 1:
            if (key === 'C') { startNote = 'A3'; endNote = 'E4'; }
            if (key === 'G') { startNote = 'E4'; endNote = 'B4'; }
            if (key === 'D') { startNote = 'B3'; endNote = 'Gb4'; }
            if (key === 'A') { startNote = 'Gb4'; endNote = 'Db5'; }
            if (key === 'E') { startNote = 'Db4'; endNote = 'Ab4'; }
            if (key === 'B') { startNote = 'Ab4'; endNote = 'Eb5'; }
            if (key === 'Gb') { startNote = 'Eb4'; endNote = 'Bb4'; }
            if (key === 'Db') { startNote = 'Bb3'; endNote = 'F4'; }
            if (key === 'Ab') { startNote = 'F4'; endNote = 'C5'; }
            if (key === 'Eb') { startNote = 'C4'; endNote = 'G4'; }
            if (key === 'Bb') { startNote = 'G4'; endNote = 'D5'; }
            if (key === 'F') { startNote = 'D4'; endNote = 'A4'; }
            // console.log("case 1: endNote = " + endNote);
            break;
        case 2:
            if (key === 'C') { startNote = 'F3'; endNote = 'G4'; }
            if (key === 'G') { startNote = 'C4'; endNote = 'D5'; }
            if (key === 'D') { startNote = 'G3'; endNote = 'A4'; }
            if (key === 'A') { startNote = 'D4'; endNote = 'E5'; }
            if (key === 'E') { startNote = 'A3'; endNote = 'B4'; }
            if (key === 'B') { startNote = 'E4'; endNote = 'Gb5'; }
            if (key === 'Gb') { startNote = 'B3'; endNote = 'Db5'; }
            if (key === 'Db') { startNote = 'Gb3'; endNote = 'Ab4'; }
            if (key === 'Ab') { startNote = 'Db4'; endNote = 'Eb5'; }
            if (key === 'Eb') { startNote = 'Ab3'; endNote = 'Bb4'; }
            if (key === 'Bb') { startNote = 'Eb4'; endNote = 'F5'; }
            if (key === 'F') { startNote = 'Bb3'; endNote = 'C5'; }
            break;
        case 3: startNote = key + '3'; endNote = key + '5'; break;
        case 4: startNote = key + '2'; endNote = key + '6'; break;
        case 5: startNote = key + '1'; endNote = key + '7'; break;
        case 6: startNote = 'A0'; endNote = 'C8'; break;
        default: startNote = 'A3'; endNote = 'E4'; break;
    }
    return [startNote, endNote];
}

export default getLimits;
