import React, { useState, useEffect } from 'react';
import '@/src/styles/Fretboard.css'; // Add CSS for styling the fretboard
import playWavFile from '@/src/utils/playWavFile';
import getFileName from '@shared/utils/getFileName';
import eventEmitter from '@shared/utils/eventEmitter';

const strings = [
    { name: 'E', midiBase: 40 }, // Low E string
    { name: 'A', midiBase: 45 }, // A string
    { name: 'D', midiBase: 50 }, // D string
    { name: 'G', midiBase: 55 }, // G string
    { name: 'B', midiBase: 59 }, // B string
    { name: 'e', midiBase: 64 }, // High E string
];

const frets = Array.from({ length: 13 }, (_, i) => i); // Frets 0 to 12

const Fretboard = () => {
    const [pressedFret, setPressedFret] = useState(null);

    const handleFretDown = (string, fret) => {
        setPressedFret({ string, fret });

        const midiNote = string.midiBase + fret;
        const fileName = "/sound/piano_wav/" + getFileName(midiNote);

        playWavFile(fileName);

        eventEmitter.emit('demoKeyPressed', midiNote);
    };

    const handleFretUp = () => {
        setPressedFret(null);
    };

    return (
        <div className="fretboard">
            {strings.map((string, stringIndex) => (
                <div key={string.name} className="string-row">
                    {frets.map((fret) => (
                        <div
                            key={`${string.name}-${fret}`}
                            className={`fret ${pressedFret?.string === string && pressedFret?.fret === fret ? 'pressed' : ''}`}
                            onMouseDown={() => handleFretDown(string, fret)}
                            onMouseUp={handleFretUp}
                            onTouchStart={() => handleFretDown(string, fret)}
                            onTouchEnd={handleFretUp}
                        >
                            <div className="finger-position">
                                {fret > 0 && <div className="oval" />} {/* Show oval on non-open strings */}
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default Fretboard;
