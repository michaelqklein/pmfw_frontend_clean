let audioElements = [];

const playWavChords = (fileNames, volume = 1.0) => {
    if (typeof window === 'undefined') return;
    
    // Stop and clear any previously created audio elements
    audioElements.forEach(audioElement => {
        audioElement.pause();
        audioElement.currentTime = 0;
        audioElement.src = ''; // Remove the source to stop the old audio
    });
    audioElements = [];

    fileNames.forEach((fileName) => {
        const audioElement = new Audio();
        audioElement.src = fileName;
        audioElement.volume = volume; // Set the volume of the audio element
        audioElement.load(); // Ensure the audio is loaded
        audioElement.oncanplaythrough = () => {
            audioElement.play().catch((error) => {
                console.error("Error playing audio file:", error);
            });
        };
        audioElements.push(audioElement);
    });
};

export default playWavChords;