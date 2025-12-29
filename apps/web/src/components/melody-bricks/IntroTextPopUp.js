import React from 'react';

const IntroTextPopUp = ({ isOpen, onClose, introText, isMobile = false }) => {
  if (!isOpen) return null;

  const handleStart = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className={`bg-white rounded-lg shadow-xl ${isMobile ? 'mx-4 p-6' : 'p-8 max-w-lg w-full mx-4'}`}>
        <div className="text-center">
          <div className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-700 mb-6 leading-relaxed text-left font-rubik`}>
            {introText}
          </div>
          
          <button
            onClick={handleStart}
            className={`${isMobile ? 'px-6 py-3 text-sm' : 'px-8 py-4 text-base'} bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50`}
          >
            Start
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntroTextPopUp; 