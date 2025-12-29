import React from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { useRouter } from 'next/navigation';
import eventEmitter from '@shared/utils/eventEmitter';

const GameOverPopup = ({ isOpen, onContinue, isWin = false, isMobile = false }) => {
  const { currentUser } = useAuth();
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div className={`text-center ${isMobile ? 'py-2 px-3 max-w-2xl' : 'py-4 px-6 max-w-6xl'} mx-auto`}>
      {currentUser ? (
        // User is logged in - show original message
        <div>
          <p className={`${isMobile ? 'text-sm' : 'text-lg'} text-gray-600 ${isMobile ? 'mb-3' : 'mb-6'}`}>
            {isWin ? "Level Completed!" : "Sorry, you didn't make it"}
          </p>
          <button
            onClick={onContinue}
            className={`${isMobile ? 'px-3 py-2 text-sm' : 'px-6 py-3'} bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
          >
            Continue
          </button>
        </div>
      ) : (
        // User is not logged in - show signup message
        <div>
          <p className={`${isMobile ? 'text-sm' : 'text-lg'} text-gray-600 ${isMobile ? 'mb-2' : 'mb-4'}`}>
            {isWin ? "Level Completed!" : "Sorry, you didn't make it"}
          </p>
          <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500 ${isMobile ? 'mb-2' : 'mb-4'}`}>
            Login or sign-up to save your progress, unlocked levels, skins, and bleeps, so you can continue where you left off.
          </p>
          <div className={`flex ${isMobile ? 'gap-1 mb-2' : 'gap-2 mb-4'} w-full`}>
            <button
              onClick={() => {
                // Emit event to save level progress data to localStorage
                eventEmitter.emit('saveLevelProgressToLocalStorage');
                
                // Set sessionStorage to track signup context
                sessionStorage.setItem('mbSignupContext', JSON.stringify({
                  source: 'gameOver',
                  timestamp: Date.now(),
                  hasLevelData: true,
                  journey: 'signup'
                }));
                
                // Navigate to sign-up with return parameters
                router.push('/sign-up?returnTo=melody-bricks&source=gameOver');
              }}
              className={`flex-1 ${isMobile ? 'px-3 py-2 text-xs' : 'px-8 py-4 text-sm'} bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 whitespace-nowrap`}
            >
              Sign-up Free
            </button>
            <button
              onClick={onContinue}
              className={`flex-1 ${isMobile ? 'px-3 py-2 text-xs' : 'px-8 py-4 text-sm'} bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 whitespace-nowrap`}
            >
              Continue Without Saving
            </button>
          </div>
          
          {/* Login link */}
          <div className={`text-center ${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>
            <button
              onClick={() => router.push('/login')}
              className="text-green-600 hover:text-green-700 underline font-semibold cursor-pointer"
            >
              log in
            </button>
            <span> if you already have an account</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameOverPopup; 