import React, { useState, useEffect } from 'react';
import playWavFile from '../utils/playWavFile';
import getFileName from '@shared/utils/getFileName';
import eventEmitter from '@shared/utils/eventEmitter';


import '../styles/DemoKeyboard.css';

let keys = [
    { note: 'F3',  midi: 53, type: 'white' },
    { note: 'F#3', midi: 54, type: 'black' },
    { note: 'G3',  midi: 55, type: 'white' },
    { note: 'A#3', midi: 56, type: 'black' },
    { note: 'A3',  midi: 57, type: 'white' },
    { note: 'Bb3', midi: 58, type: 'black' },
    { note: 'B3',  midi: 59, type: 'white' },
    { note: 'C4',  midi: 60, type: 'white' },
    { note: 'C#4', midi: 61, type: 'black' },
    { note: 'D4',  midi: 62, type: 'white' },
    { note: 'Eb4', midi: 63, type: 'black' },
    { note: 'E4',  midi: 64, type: 'white' },
    { note: 'F4',  midi: 65, type: 'white' },
    { note: 'F#4', midi: 66, type: 'black' },
    { note: 'G4',  midi: 67, type: 'white' }
];

const DemoKeyboard = ({ keyRangeList }) => {
    const [pressedKey, setPressedKey] = useState(null);
    const [rootNote, setRootNote] = useState(null);
    const [correctNote, setCorrectNote] = useState(null);
    const [wrongNote, setWrongNote] = useState(null);

    // Update keys if keyRangeList is provided
    keys = keyRangeList;

    // Handle incoming custom events to set root note
    useEffect(() => {
        const handleSetRootNote = (note) => {
            
            // Check if the note is valid
            const validNotes = keys.map(key => key.note);
            if (!validNotes.includes(note)) {
                // console.error(`Invalid root note: ${note}`);
                return;
            }
            // Set the root note if valid
            setRootNote(note); // note should be a note string like 'C4'
        };

        eventEmitter.on('setRootNote', handleSetRootNote);
        return () => {
            eventEmitter.off('setRootNote', handleSetRootNote);
        };
    }, []);

    // Listen for setCorrectNote and clearCorrectNote events
    useEffect(() => {
        const handleSetCorrectNote = (note) => setCorrectNote(note);
        const handleClearCorrectNote = () => {
            setCorrectNote(null);
            setWrongNote(null);
        };
        const handleSetWrongNote = (note) => setWrongNote(note);
        eventEmitter.on('setCorrectNote', handleSetCorrectNote);
        eventEmitter.on('clearCorrectNote', handleClearCorrectNote);
        eventEmitter.on('setWrongNote', handleSetWrongNote);
        return () => {
            eventEmitter.off('setCorrectNote', handleSetCorrectNote);
            eventEmitter.off('clearCorrectNote', handleClearCorrectNote);
            eventEmitter.off('setWrongNote', handleSetWrongNote);
        };
    }, []);

    const handleKeyDown = (note) => {
        setPressedKey(note);

        const key = keys.find(k => k.note === note);
        if (key) {
            const fileName = "/sound/piano_wav/" + getFileName(key.midi);
            playWavFile(fileName);

            eventEmitter.emit('demoKeyPressed', key.midi);
        }
    };

    const handleKeyUp = () => {
        setPressedKey(null);
    };

    return (
        <div className="keyboard">
            {keys.map(({ note, type }) => (
                <div
                    key={note}
                    className={`key ${type} ${pressedKey === note ? 'pressed' : ''} ${rootNote === note ? 'green' : ''} ${correctNote === note ? 'green' : ''} ${wrongNote === note ? 'red' : ''}`}
                    onMouseDown={() => handleKeyDown(note)}
                    onMouseUp={handleKeyUp}
                    onTouchStart={() => handleKeyDown(note)}
                    onTouchEnd={handleKeyUp}
                >
                    {note}
                </div>
            ))}
        </div>
    );
};

export default DemoKeyboard;
