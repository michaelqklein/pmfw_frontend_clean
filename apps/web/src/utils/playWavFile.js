let audioElement = null;

const playWavFile = (fileName, volume = 1.0) => {
  if (typeof window === 'undefined') return;
  
  if (!audioElement) {
    audioElement = new Audio();
  }

  // console.log('🎵 Attempting to play audio file:', fileName);
  
  audioElement.src = fileName;
  audioElement.volume = volume; // Set the volume of the audio element
  
  audioElement.onerror = (error) => {
    // console.error('❌ Audio file failed to load:', fileName, error);
    // console.error('❌ Audio error details:', {
    //   error: audioElement.error,
    //   networkState: audioElement.networkState,
    //   readyState: audioElement.readyState
    // });
  };
  
  audioElement.onloadstart = () => {
    // console.log('🔄 Started loading:', fileName);
  };
  
  audioElement.oncanplay = () => {
    // console.log('✅ Can play:', fileName);
  };
  
  audioElement.load(); // Ensure the audio is loaded
  
  audioElement.oncanplaythrough = () => {
    // console.log('🎯 Ready to play:', fileName);
    audioElement.play().catch((error) => {
      // console.error("❌ Error playing audio file:", fileName, error);
      
      // Check if it's an autoplay policy issue
      if (error.name === 'NotAllowedError') {
        // console.warn('🚫 Autoplay blocked - user interaction required');
      }
    });
  };
};

export default playWavFile;
