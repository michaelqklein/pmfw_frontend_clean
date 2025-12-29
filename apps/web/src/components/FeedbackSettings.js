'use client';

import React, { useState, useEffect } from 'react';

const FeedbackSettings = ({ 
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
  const [localCorrectSound, setLocalCorrectSound] = useState(correctSound || 'c-short');
  const [localCorrectVolume, setLocalCorrectVolume] = useState(correctVolume || 0.5);
  const [localIncorrectSound, setLocalIncorrectSound] = useState(incorrectSound || 'negative');
  const [localIncorrectVolume, setLocalIncorrectVolume] = useState(incorrectVolume || 0.5);

  const correctSoundOptions = [
    // Make C-short the default and top option
    { value: 'c-short', label: 'Short', file: '/sound/game_sounds/C-short.wav' },
    { value: 'retrowin', label: 'RetroWin', file: '/sound/game_sounds/RetroWin.wav' },
    { value: 'c-bell', label: 'Bell', file: '/sound/game_sounds/C-bell.wav' },
    { value: 'c-voice', label: 'Voice', file: '/sound/game_sounds/C-voice.wav' }
  ];

  const incorrectSoundOptions = [
    { value: 'negative', label: 'Negative', file: '/sound/game_sounds/Negative.wav' },
    { value: 'w-short', label: 'Short', file: '/sound/game_sounds/W-short.wav' },
    { value: 'w-down', label: 'Down', file: '/sound/game_sounds/W-down.wav' },
    { value: 'w-voice', label: 'Voice', file: '/sound/game_sounds/W-voice.wav' }
  ];

  useEffect(() => {
    setLocalCorrectSound(correctSound || 'off');
    setLocalCorrectVolume(correctVolume || 0.5);
    setLocalIncorrectSound(incorrectSound || 'off');
    setLocalIncorrectVolume(incorrectVolume || 0.5);
  }, [correctSound, correctVolume, incorrectSound, incorrectVolume]);

  const handleCorrectSoundChange = (value) => {
    setLocalCorrectSound(value);
    setCorrectSound(value);
  };

  const handleCorrectVolumeChange = (value) => {
    setLocalCorrectVolume(value);
    setCorrectVolume(value);
  };

  const handleIncorrectSoundChange = (value) => {
    setLocalIncorrectSound(value);
    setIncorrectSound(value);
  };

  const handleIncorrectVolumeChange = (value) => {
    setLocalIncorrectVolume(value);
    setIncorrectVolume(value);
  };

  const testCorrectSound = () => {
    if (localCorrectSound !== 'off' && onTestSound) {
      const soundFile = correctSoundOptions.find(s => s.value === localCorrectSound)?.file;
      if (soundFile) {
        onTestSound(soundFile, localCorrectVolume);
      }
    }
  };

  const testIncorrectSound = () => {
    if (localIncorrectSound !== 'off' && onTestSound) {
      const soundFile = incorrectSoundOptions.find(s => s.value === localIncorrectSound)?.file;
      if (soundFile) {
        onTestSound(soundFile, localIncorrectVolume);
      }
    }
  };

  return (
    <div className="bg-gray-900 border-2 border-gray-700 rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
      <h3 className="text-xl font-bold text-center text-white mb-6">
        Feedback Sound Settings
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Correct Answer Settings */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-green-700 text-center">
            Correct Answer Feedback
          </h4>
          
          {/* On/Off Toggle */}
          <div className="flex justify-center">
            <button
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                localCorrectSound === 'off'
                  ? 'bg-gray-300 text-gray-600'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
              onClick={() => handleCorrectSoundChange(localCorrectSound === 'off' ? 'c-short' : 'off')}
            >
              {localCorrectSound === 'off' ? 'Sound Off' : 'Sound On'}
            </button>
          </div>

          {/* Sound Options - Only show when sound is on */}
          {localCorrectSound !== 'off' && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-300 text-center">
                Choose Sound:
              </label>
              <div className="flex flex-col gap-2">
                {correctSoundOptions.map((option) => (
                  <button
                    key={option.value}
                    className={`px-3 py-2 rounded-md font-medium transition-colors ${
                      localCorrectSound === option.value
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-800 text-gray-200 hover:bg-gray-700'
                    }`}
                    onClick={() => handleCorrectSoundChange(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Volume Control */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300 text-center">
              Volume: {Math.round(localCorrectVolume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={localCorrectVolume}
              onChange={(e) => handleCorrectVolumeChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #10b981 0%, #10b981 ${localCorrectVolume * 100}%, #e5e7eb ${localCorrectVolume * 100}%, #e5e7eb 100%)`
              }}
            />
          </div>

          {/* Test Button */}
          <button
            onClick={testCorrectSound}
            disabled={localCorrectSound === 'off'}
            className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
              localCorrectSound === 'off'
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-green-700 text-white hover:bg-green-600'
            }`}
          >
            Test Sound
          </button>
        </div>

        {/* Incorrect Answer Settings */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-red-400 text-center">
            Incorrect Answer Feedback
          </h4>
          
          {/* On/Off Toggle */}
          <div className="flex justify-center">
            <button
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                localIncorrectSound === 'off'
                  ? 'bg-gray-700 text-gray-400'
                  : 'bg-red-700 text-white hover:bg-red-600'
              }`}
              onClick={() => handleIncorrectSoundChange(localIncorrectSound === 'off' ? 'space' : 'off')}
            >
              {localIncorrectSound === 'off' ? 'Sound Off' : 'Sound On'}
            </button>
          </div>

          {/* Sound Options - Only show when sound is on */}
          {localIncorrectSound !== 'off' && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-300 text-center">
                Choose Sound:
              </label>
              <div className="flex flex-col gap-2">
                {incorrectSoundOptions.map((option) => (
                  <button
                    key={option.value}
                      className={`px-2 py-2 rounded-md font-medium transition-colors ${
                      localIncorrectSound === option.value
                        ? 'bg-red-700 text-white'
                        : 'bg-gray-800 text-gray-200 hover:bg-gray-700'
                    }`}
                    onClick={() => handleIncorrectSoundChange(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Volume Control */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300 text-center">
              Volume: {Math.round(localIncorrectVolume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={localIncorrectVolume}
              onChange={(e) => handleIncorrectVolumeChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${localIncorrectVolume * 100}%, #e5e7eb ${localIncorrectVolume * 100}%, #e5e7eb 100%)`
              }}
            />
          </div>

          {/* Test Button */}
          <button
            onClick={testIncorrectSound}
            disabled={localIncorrectSound === 'off'}
            className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
              localIncorrectSound === 'off'
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-red-700 text-white hover:bg-red-600'
            }`}
          >
            Test Sound
          </button>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-400">
          Changes are saved automatically. Use the Test Sound buttons to preview your settings.
        </p>
      </div>
    </div>
  );
};

export default FeedbackSettings; 