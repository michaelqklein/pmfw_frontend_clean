import React, { useState } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { useRouter } from 'next/navigation';
import VideoModal from './VideoModal';

const Welcome = ({ isOpen, onClose, isMobile = false }) => {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [showVideo, setShowVideo] = useState(false);

  if (!isOpen && !showVideo) return null;

  const handleLogin = () => {
    router.push('/login?returnTo=melody-bricks');
  };

  const handleWatchIntro = () => {
    // Close the welcome popup and show the video
    setShowVideo(true);
  };

  const handleSkip = () => {
    onClose();
  };

  const handleCloseVideo = () => {
    setShowVideo(false);
    // Video is closed, user goes directly to game (no welcome popup)
    onClose();
  };

  // If video is showing, only show the video modal
  if (showVideo) {
    return (
      <VideoModal 
        isOpen={showVideo} 
        onClose={handleCloseVideo} 
        isMobile={isMobile} 
      />
    );
  }

  // Otherwise show the welcome popup
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className={`bg-white rounded-lg shadow-xl ${isMobile ? 'mx-4 p-6' : 'p-8 max-w-md w-full mx-4'}`}>
        <div className="text-center">
          {currentUser ? (
            // User is logged in - only show intro video option
            <div>
              <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-800 mb-4`}>
                Welcome, {currentUser.first_name || currentUser.name || 'there'}!
              </h2>
              <p className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-600 mb-6 leading-relaxed`}>
                I recommend this short intro video to get started.
              </p>
              
              <div className={`space-y-3 ${isMobile ? 'space-y-2' : 'space-y-3'}`}>
                <button
                  onClick={handleWatchIntro}
                  className={`w-full ${isMobile ? 'px-4 py-2 text-sm' : 'px-6 py-3 text-base'} bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50`}
                >
                  Watch Intro
                </button>
                
                <button
                  onClick={handleSkip}
                  className={`w-full ${isMobile ? 'px-4 py-2 text-sm' : 'px-6 py-3 text-base'} bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50`}
                >
                  Skip
                </button>
              </div>
            </div>
          ) : (
            // User is not logged in - show all options
            <div>
              <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-800 mb-4`}>
                Welcome to Melody Bricks
              </h2>
              <p className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-600 mb-6 leading-relaxed`}>
                If you have an account please log in to continue your game where you left off. 
                If you are here for the first time I recommend this short intro video.
              </p>
              
              <div className={`space-y-3 ${isMobile ? 'space-y-2' : 'space-y-3'}`}>
                <button
                  onClick={handleLogin}
                  className={`w-full ${isMobile ? 'px-4 py-2 text-sm' : 'px-6 py-3 text-base'} bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
                >
                  Login
                </button>
                
                <button
                  onClick={handleWatchIntro}
                  className={`w-full ${isMobile ? 'px-4 py-2 text-sm' : 'px-6 py-3 text-base'} bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50`}
                >
                  Watch Intro
                </button>
                
                <button
                  onClick={handleSkip}
                  className={`w-full ${isMobile ? 'px-4 py-2 text-sm' : 'px-6 py-3 text-base'} bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50`}
                >
                  Skip
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Welcome; 