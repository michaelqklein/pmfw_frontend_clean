'use client';

import React from 'react';

const TeacherComponent = ({ onPersonalizedSession, onManualSettings }) => {
    return (
        <div className="flex items-center justify-center p-4 mt-16 md:mt-24">
            <div className="bg-yellow-50 rounded-xl shadow-2xl p-6 md:p-8 max-w-md md:max-w-lg w-full">
                <div className="text-center mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
                        Welcome to Audiation Studio. 
                    </h1>
                    {/* <p className="text-lg md:text-xl text-gray-600">
                    I'm here to guide your training today. Would you like me to:
                    </p> */}
                </div>

                <div className="space-y-4">
                    {/* <button
                        onClick={onPersonalizedSession}
                        className="w-full bg-green-100 hover:bg-green-500 text-gray-800 hover:text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 text-sm md:text-base leading-tight"
                    >
                        Create an optimized training session based on your current skill level and training history
                    </button>

                    <button
                        onClick={onManualSettings}
                        className="w-full bg-green-100 hover:bg-green-500 text-gray-800 hover:text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 text-sm md:text-base leading-tight"
                    >
                        Recommend a training focus, but let you choose your own settings.
                    </button> */}
                    
                    <button
                        onClick={onManualSettings}
                        className="w-full bg-green-100 hover:bg-green-500 text-gray-800 hover:text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 text-sm md:text-base leading-tight"
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TeacherComponent; 