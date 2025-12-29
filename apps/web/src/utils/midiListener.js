// Robust MIDI listener utility
let midiAccess = null;
let onMidiMessageCallback = null;
let midiListenersInitialized = false;
let midiInputs = new Set();
let midiStateChangeHandler = null;

// Helper to remove all listeners from all known inputs
function removeAllInputListeners() {
    if (!midiAccess) return;
    for (let input of midiAccess.inputs.values()) {
        if (input && typeof input === 'object') {
            input.removeEventListener('midimessage', handleMIDIMessage);
            midiInputs.delete(input);
        }
    }
}

// Function to initialize MIDI access (only once per page load)
export const initMIDI = (callback) => {
    if (typeof navigator === 'undefined') return;
    
    onMidiMessageCallback = callback;
    if (midiListenersInitialized) {
        // Remove all listeners before re-adding
        removeAllInputListeners();
        addListenersToAllInputs();
        return;
    }
    midiListenersInitialized = true;
    if (navigator.requestMIDIAccess) {
        navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
    } else {
        console.error("Web MIDI API is not supported in this browser.");
    }
};

// Add listeners to all current inputs
function addListenersToAllInputs() {
    if (!midiAccess) return;
    let inputCount = 0;
    for (let input of midiAccess.inputs.values()) {
        if (input && typeof input === 'object') {
            input.removeEventListener('midimessage', handleMIDIMessage); // Defensive: remove first
            input.addEventListener('midimessage', handleMIDIMessage);
            midiInputs.add(input);
            inputCount++;
        }
    }
    // console.log('DEBUG: Total MIDI input devices with listeners:', inputCount);
}

// Function to handle successful MIDI access
const onMIDISuccess = (access) => {
    midiAccess = access;
    addListenersToAllInputs();
    // Listen for device hot-plugging
    if (midiStateChangeHandler) {
        midiAccess.removeEventListener('statechange', midiStateChangeHandler);
    }
    midiStateChangeHandler = (event) => {
        // console.log('DEBUG: MIDI device state change:', event);
        // Always remove and re-add listeners to all inputs
        removeAllInputListeners();
        addListenersToAllInputs();
    };
    midiAccess.addEventListener('statechange', midiStateChangeHandler);
};

// Function to handle failure in MIDI access
const onMIDIFailure = () => {
    console.error("Could not access your MIDI devices.");
};

// Function to handle MIDI messages
function handleMIDIMessage(event) {
    const [status, note, velocity] = event.data;
    // console.log('DEBUG: MIDI message received - Status:', status, 'Note:', note, 'Velocity:', velocity);
    if (status === 0x90 && velocity > 0) {
        // console.log('DEBUG: Processing note on event for note:', note);
        if (onMidiMessageCallback) onMidiMessageCallback(note);
    }
}

// Function to remove event listeners from MIDI input devices
export const removeEventListeners = () => {
    removeAllInputListeners();
    if (midiAccess && midiStateChangeHandler) {
        midiAccess.removeEventListener('statechange', midiStateChangeHandler);
        midiStateChangeHandler = null;
    }
    midiListenersInitialized = false;
};