'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import '@/src/styles/FreeTrialOrUpgradePopUp.css';

const FreeTrialOrUpgradePopUp = ({ addedMessage, setShowFreeTrialPopUp }) => {
    const router = useRouter();

    const showOptions = () => {
        setShowFreeTrialPopUp(false);
        router.push('/upgrade/');
    };

    const saveAndExit = () => {
        setShowFreeTrialPopUp(false);
    };

    return (
        <div className="overlay_tw">
            <div className="top-window">
                <h2>You don't have access to this Feature. </h2>
                <p>{addedMessage} Would you like to see your access options?</p>

                <div className="flex gap-2 mt-4 justify-center">
                    <button onClick={showOptions} className="save-exit-button">Show Options</button>
                    <button onClick={saveAndExit} className="save-exit-button">Close</button>
                </div>
            </div>
        </div>
    );
};

export default FreeTrialOrUpgradePopUp;
