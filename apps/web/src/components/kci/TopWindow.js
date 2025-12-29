import React, { useState, useEffect } from 'react';
import eventEmitter from '@shared/utils/eventEmitter';
import '@/src/styles/kci/TopWindow.css';  // We'll define the styles here to center the window

const TopWindow = ({trainingPaused, setTrainingPaused}) => {
    const [showTopWindow, setShowTopWindow] = useState(false);

    useEffect(() => {
        const handleUpdateShowTopWindow = (showTopWindowValue) => {
            setShowTopWindow(showTopWindowValue);
            if  (showTopWindowValue)
                setTrainingPaused(true);
            else 
                setTrainingPaused(false);
        };

        eventEmitter.on('updateShowTopWindow', handleUpdateShowTopWindow);

        return () => {
            eventEmitter.off('updateShowTopWindow', handleUpdateShowTopWindow);
        };
    }, []);

    const yesCloseWindow = () => {
        setShowTopWindow(false);

        // Emit event to notify 'Yes' was clicked
        eventEmitter.emit('confirmResetYes');
    };

    const noCloseWindow = () => {
        setShowTopWindow(false);

        // Emit event to notify 'No' was clicked
        eventEmitter.emit('confirmResetNo');
    };

    if (!showTopWindow) return null; 
    
    return (
        <div className="overlay_tw">
            <div className="top-window">
                <h2>Restart KEYCOMMANDER I </h2>
                <p>Are you sure?</p>
                <button onClick={yesCloseWindow}>Yes</button>
                <button onClick={noCloseWindow}>No</button>
            </div>
        </div>
    );
};

export default TopWindow;
