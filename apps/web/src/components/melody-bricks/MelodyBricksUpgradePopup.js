'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

const MelodyBricksUpgradePopup = ({ message, onClose }) => {
    const router = useRouter();

    const handleUpgrade = () => {
        onClose();
        // Navigate to upgrade page
        router.push('/upgrade/');
    };

    const handleCancel = () => {
        onClose();
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm mx-4 border-2 border-gray-300">
                <div className="text-center">
                    <h3 className="text-lg font-bold mb-3 text-gray-800">
                        🎵 Upgrade to Virtuoso
                    </h3>
                    <p className="text-sm mb-6 text-gray-600">
                        {message || "Unlock premium levels and advanced features!"}
                    </p>
                    
                    <div className="flex flex-col gap-3">
                        <button
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
                            onClick={handleUpgrade}
                        >
                            Upgrade Now
                        </button>
                        <button
                            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                            onClick={handleCancel}
                        >
                            Maybe Later
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MelodyBricksUpgradePopup; 