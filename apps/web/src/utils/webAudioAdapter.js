// Web audio adapter for the game engine
// Implements the audio interface expected by melodyBricks engine

import playWavFile from './playWavFile';

export const webAudioAdapter = {
    async playAudio(fileName, volume = 1.0) {
        // Web implementation using local playWavFile
        playWavFile(fileName, volume);
        return true;
    },

    async playAudioChords(fileNames, volume = 1.0) {
        // Play multiple audio files simultaneously
        const promises = fileNames.map(fileName => this.playAudio(fileName, volume));
        await Promise.all(promises);
        return true;
    },

    async initAudio() {
        // Web audio is always ready
        return true;
    },

    async stopAllAudio() {
        // Web audio sources are one-shot, so nothing to stop
        return true;
    },

    async cleanupAudio() {
        // Web audio cleanup if needed
        return true;
    }
}; 