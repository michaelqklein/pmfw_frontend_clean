// React Native touch input handler for melodyBricks engine
// This provides touch-based note input as an alternative to MIDI

import { isReactNative, isWeb } from './platformDetection';
import { handleTouchNote } from './midiListener';

// Touch input configuration
const touchConfig = {
    // Virtual piano layout
    pianoKeys: {
        // White keys (C, D, E, F, G, A, B)
        white: [60, 62, 64, 65, 67, 69, 71], // C4, D4, E4, F4, G4, A4, B4
        // Black keys (C#, D#, F#, G#, A#)
        black: [61, 63, 66, 68, 70] // C#4, D#4, F#4, G#4, A#4
    },
    // Touch sensitivity
    touchThreshold: 50, // Minimum touch distance to register as a note
    // Visual feedback
    showTouchFeedback: true
};

// Touch state tracking
let touchState = {
    isActive: false,
    currentNote: null,
    touchStartTime: null,
    touchStartY: null
};

// Initialize touch input system
export const initTouchInput = () => {
    if (!isReactNative) {
        console.warn('Touch input init called on non-React Native platform');
        return false;
    }

    console.log('🎹 React Native touch input system initialized');
    return true;
};

// Handle touch start event
export const handleTouchStart = (event, note) => {
    if (!isReactNative) return;

    const touch = event.nativeEvent;
    touchState.isActive = true;
    touchState.currentNote = note;
    touchState.touchStartTime = Date.now();
    touchState.touchStartY = touch.pageY;

    // Emit touch start event for visual feedback
    if (touchConfig.showTouchFeedback) {
        // This would trigger visual feedback in the UI
        console.log('🎹 Touch started on note:', note);
    }
};

// Handle touch end event
export const handleTouchEnd = (event, note) => {
    if (!isReactNative) return;

    const touch = event.nativeEvent;
    const touchEndTime = Date.now();
    const touchDuration = touchEndTime - touchState.touchStartTime;
    const touchDistance = Math.abs(touch.pageY - touchState.touchStartY);

    // Only register as a note if touch was brief and didn't move much
    if (touchDuration < 500 && touchDistance < touchConfig.touchThreshold) {
        // Simulate MIDI note on event
        handleTouchNote(note);
        
        console.log('🎹 Touch note played:', note);
    }

    // Reset touch state
    touchState.isActive = false;
    touchState.currentNote = null;
    touchState.touchStartTime = null;
    touchState.touchStartY = null;

    // Emit touch end event for visual feedback
    if (touchConfig.showTouchFeedback) {
        console.log('🎹 Touch ended on note:', note);
    }
};

// Handle touch move event (for continuous input)
export const handleTouchMove = (event, note) => {
    if (!isReactNative) return;

    const touch = event.nativeEvent;
    const currentY = touch.pageY;
    const distance = Math.abs(currentY - touchState.touchStartY);

    // Update touch state
    touchState.touchStartY = currentY;

    // Optional: Handle continuous touch input for sustained notes
    if (distance > touchConfig.touchThreshold) {
        // Touch moved significantly, could trigger different behavior
        console.log('🎹 Touch moved on note:', note, 'distance:', distance);
    }
};

// Create virtual piano key component props
export const createPianoKeyProps = (note, isBlack = false) => {
    return {
        note: note,
        isBlack: isBlack,
        onTouchStart: (event) => handleTouchStart(event, note),
        onTouchEnd: (event) => handleTouchEnd(event, note),
        onTouchMove: (event) => handleTouchMove(event, note),
        style: {
            backgroundColor: isBlack ? '#333' : '#fff',
            borderColor: isBlack ? '#000' : '#ccc',
            borderWidth: 1,
            borderRadius: isBlack ? 4 : 8,
            width: isBlack ? 30 : 40,
            height: isBlack ? 120 : 200,
            marginHorizontal: 1,
            justifyContent: 'center',
            alignItems: 'center'
        }
    };
};

// Get piano layout for rendering
export const getPianoLayout = () => {
    return {
        white: touchConfig.pianoKeys.white.map(note => ({
            note: note,
            props: createPianoKeyProps(note, false)
        })),
        black: touchConfig.pianoKeys.black.map(note => ({
            note: note,
            props: createPianoKeyProps(note, true)
        }))
    };
};

// Update touch configuration
export const updateTouchConfig = (newConfig) => {
    Object.assign(touchConfig, newConfig);
    console.log('🎹 Touch config updated:', touchConfig);
};

// Get current touch state
export const getTouchState = () => {
    return { ...touchState };
};

// Clean up touch input system
export const cleanupTouchInput = () => {
    touchState = {
        isActive: false,
        currentNote: null,
        touchStartTime: null,
        touchStartY: null
    };
    console.log('🎹 Touch input system cleaned up');
};

export default {
    initTouchInput,
    handleTouchStart,
    handleTouchEnd,
    handleTouchMove,
    createPianoKeyProps,
    getPianoLayout,
    updateTouchConfig,
    getTouchState,
    cleanupTouchInput
}; 