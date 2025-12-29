'use client';

import React from 'react';
import FeedbackSettings from '@/src/components/FeedbackSettings';

export default function SettingsView({
  correctSound,
  setCorrectSound,
  correctVolume,
  setCorrectVolume,
  incorrectSound,
  setIncorrectSound,
  incorrectVolume,
  setIncorrectVolume,
  onTestSound,
}) {
  return (
    <div className="w-full min-h-[700px] p-6 flex justify-center">
      <div className="w-full max-w-3xl bg-gray-900 border-2 border-gray-700 rounded-xl shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Game Settings</h2>
        </div>
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
      </div>
    </div>
  );
}


