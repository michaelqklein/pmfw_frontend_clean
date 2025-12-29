'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentSessionStats } from '@/src/components/CoarseRatioDisplay';
import { saveTemporaryPerformanceData } from '@/src/engines/audiationStudio';

const SessionEndSignupPopup = ({ 
  isOpen, 
  onClose, 
  onCreateAccount, 
  sessionDuration, 
  isLoggedIn = false,
  gamesCompleted = 0
}) => {
  const router = useRouter();
  
  // Get current session stats directly from game engine when popup renders
  const sessionStats = useMemo(() => {
    if (isOpen) {
      return getCurrentSessionStats();
    }
    return { correctAnswers: 0, totalAnswers: 0, percentage: 0 };
  }, [isOpen]);

  const { correctAnswers, totalAnswers, percentage } = sessionStats;
  
  // Calculate points (correctAnswers * percentage)
  const points = correctAnswers * percentage;
  
  if (!isOpen) return null;

  const formatDuration = (gamesCount) => {
    // Each game is 2:30 (2.5 minutes)
    const totalMinutes = gamesCount * 2.5;
    const wholeMinutes = Math.floor(totalMinutes);
    const seconds = (totalMinutes - wholeMinutes) * 60;
    
    if (seconds === 0) {
      return wholeMinutes === 1 ? '1 minute' : `${wholeMinutes} minutes`;
    } else {
      return `${wholeMinutes}:${seconds.toString().padStart(2, '0')} minutes`;
    }
  };

  const getPerformanceMessage = () => {
    if (percentage >= 95) return { emoji: '🎯', title: 'Exceptional Skills!', message: 'You have an exceptional ear for intervals!' };
    if (percentage >= 85) return { emoji: '🌟', title: 'Outstanding!', message: 'Your interval recognition skills are excellent!' };
    if (percentage >= 70) return { emoji: '🎵', title: 'Great Progress!', message: 'You are developing a great ear for intervals!' };
    if (percentage >= 50) return { emoji: '📈', title: 'Great Work!', message: 'You\'re making solid progress with interval training!' };
    return { emoji: '🎯', title: 'Keep It Up!', message: 'Every practice session helps improve your ear training!' };
  };

  const getTrainingMessage = () => {
    if (gamesCompleted === 1) {
      return {
        showCTA: false,
        message: "You've completed half your daily training. Check out your analytics and change your training intervals in the settings to optimize your training."
      };
    } else if (gamesCompleted === 2) {
      return {
        showCTA: true,
        message: "You've completed your daily training. Create a free account to track your performance over multiple training sessions. This will allow you to see exactly where your ear is strong, and where it needs work. That's how you improve fast."
      };
    } else {
      // For game 3+, alternate between CTA and no CTA
      const shouldShowCTA = gamesCompleted % 2 === 0; // Even games show CTA, odd games don't
      return {
        showCTA: shouldShowCTA,
        message: shouldShowCTA 
          ? "Create an account to save your data, so you can continue your optimized training tomorrow."
          : "Check out your analytics and change your training intervals in the settings to optimize your training."
      };
    }
  };

  const performanceData = getPerformanceMessage();
  const trainingData = getTrainingMessage();

  const handleLogin = () => {
    onClose();
    router.push('/login');
  };

  const handleCreateAccount = () => {
    // Save current performance data to localStorage before navigating away
    console.log('🔄 SessionEndSignupPopup: About to save temporary performance data');
    saveTemporaryPerformanceData();
    console.log('✅ SessionEndSignupPopup: Temporary performance data saved, navigating to signup');
    
    // Call the original onCreateAccount handler
    if (onCreateAccount) {
      onCreateAccount();
    } else {
      onClose();
      router.push('/sign-up');
    }
  };

  return (
    <div className="fixed inset-0 flex items-start justify-center z-50 bg-black bg-opacity-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-xl w-full mx-4 my-4">
        {/* Header with emoji and title */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">{performanceData.emoji}</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">{performanceData.title}</h2>
          <p className="text-lg text-gray-600 mb-3">
            You've completed {formatDuration(gamesCompleted)} of ear training.
          </p>
          <p className="text-lg text-gray-700 font-medium">{performanceData.message}</p>
        </div>

        {/* Performance Stats */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-1">{points} points</div>
            <div className="text-base text-gray-600">
              {correctAnswers} correct out of {totalAnswers} intervals
            </div>
          </div>
        </div>

        {/* Content based on login status */}
        {!isLoggedIn ? (
          <>
            {/* Training progress message */}
            <div className="mb-6">
              <p className="text-lg text-gray-700 text-center">
                {trainingData.message}
              </p>
            </div>

            {/* Conditional CTA content */}
            {trainingData.showCTA ? (
              <>

                {/* Buttons with CTA */}
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleCreateAccount}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-lg"
                  >
                    Create Free Account
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors text-lg"
                  >
                    Continue Without Saving
                  </button>
                  
                  {/* Login link */}
                  <div className="text-center text-base text-gray-500 mt-2">
                    <span 
                      className="text-green-600 hover:text-green-700 cursor-pointer underline"
                      onClick={handleLogin}
                    >
                      log in
                    </span> if you already have an account
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* No CTA - just continue button */}
                <div className="flex flex-col gap-3">
                  <button
                    onClick={onClose}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-lg"
                  >
                    Continue Training
                  </button>
                </div>
              </>
            )}
          </>
        ) : (
          <>
            {/* Message for logged-in users */}
            <div className="mb-6">
              <p className="text-lg text-gray-700 text-center">
                Your progress has been automatically saved to your account!
              </p>
            </div>

            {/* Button for logged-in users */}
            <div className="flex flex-col gap-3">
              <button
                onClick={onClose}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-lg"
              >
                Continue Training
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SessionEndSignupPopup; 