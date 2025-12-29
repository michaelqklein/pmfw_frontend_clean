import React from 'react';

const VideoModal = ({ isOpen, onClose, isMobile = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-75">
      <div className={`relative ${isMobile ? 'w-full h-full mx-4' : 'max-w-md w-full mx-4'}`}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white text-2xl font-bold hover:text-gray-300 transition-colors duration-200 z-10"
          aria-label="Close video"
        >
          ✕
        </button>
        
        {/* Video container - optimized for vertical video */}
        <div className="relative w-full aspect-[9/16] max-h-[80vh]">
          <video
            className="w-full h-full object-contain rounded-lg"
            controls
            autoPlay
            playsInline
            preload="metadata"
          >
            <source src="/videos/MelodyBricks/MB_Intro.mov" type="video/quicktime" />
            <source src="/videos/MelodyBricks/MB_Intro.mov" type="video/mp4" />
            <source src="/videos/MelodyBricks/MB_Intro.mov" type="video/x-msvideo" />
            Your browser does not support the video tag.
          </video>
        </div>
        
        {/* Mobile close button overlay */}
        {isMobile && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black bg-opacity-50 text-white text-xl font-bold rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-75 transition-colors duration-200"
            aria-label="Close video"
          >
            ✕
          </button>
        )}
        
        {/* Additional close button below video for better UX */}
        <button
          onClick={onClose}
          className={`mt-4 w-full ${isMobile ? 'px-4 py-2 text-sm' : 'px-6 py-3 text-base'} bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50`}
        >
          Close Video
        </button>
      </div>
    </div>
  );
};

export default VideoModal; 