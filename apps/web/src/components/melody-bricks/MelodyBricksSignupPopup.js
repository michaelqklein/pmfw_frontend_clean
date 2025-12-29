'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

const MelodyBricksSignupPopup = ({ onClose }) => {
    const router = useRouter();

    const handleCreateAccount = () => {
        onClose();
        router.push('/sign-up');
    };

    const handleLogin = () => {
        onClose();
        router.push('/login');
    };

    return (
        <div className="fixed inset-0 flex items-start justify-center z-50 bg-black bg-opacity-50 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-xl w-full mx-4 my-4">
                {/* Header with emoji and title */}
                <div className="text-center mb-6">
                    <div className="text-5xl mb-3">🎵</div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Virtuoso Mode</h2>
                    <p className="text-lg text-gray-600 mb-3">
                        Unlock advanced interval training
                    </p>
                    <p className="text-lg text-gray-700 font-medium">
                        Access descending intervals and complete your ear training journey
                    </p>
                </div>

                {/* Content */}
                <div className="mb-6">
                    <p className="text-lg text-gray-700 text-center">
                        Sign up to upgrade to Virtuoso mode and access descending interval training, or log in if you already have an account.
                    </p>
                </div>

                {/* Buttons */}
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
                        Continue Free Training
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
            </div>
        </div>
    );
};

export default MelodyBricksSignupPopup; 