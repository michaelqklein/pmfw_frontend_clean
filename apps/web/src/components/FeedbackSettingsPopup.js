'use client';

import React from 'react';
import FeedbackSettings from './FeedbackSettings';

const FeedbackSettingsPopup = ({ 
  isOpen, 
  onClose, 
  correctSound, 
  setCorrectSound, 
  correctVolume, 
  setCorrectVolume,
  incorrectSound, 
  setIncorrectSound, 
  incorrectVolume, 
  setIncorrectVolume,
  onTestSound 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Game Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <FeedbackSettings
            correctSound={correctSound}
            setCorrectSound={setCorrectSound}
            correctVolume={correctVolume}
            setCorrectVolume={setCorrectVolume}
            incorrectSound={incorrectSound}
            setIncorrectSound={setIncorrectSound}
            incorrectVolume={incorrectVolume}
            setIncorrectVolume={setIncorrectVolume}
            onTestSound={onTestSound}
          />
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackSettingsPopup; 