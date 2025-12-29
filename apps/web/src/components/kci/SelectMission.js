import React, { useEffect } from 'react';
import eventEmitter from '@shared/utils/eventEmitter';
import '@/src/styles/kci/SelectMission.css';  // Styles for the window and overlay

const SelectMission = ({ 
    showSelectMissionWindow, 
    setShowSelectMissionWindow, 
    accomplishments,
    currentMission,  // Selected mission should be passed in
    selectCurrentMission  // Function to change the selected mission
}) => {

    useEffect(() => {
        console.log("currentMission: ", currentMission);  // Check the value on every render
    }, [currentMission]);

    const saveAndExit = () => {
        setShowSelectMissionWindow(false);

        // Emit event to notify mission selection
        console.log("In SelectMission: currentMission: ", currentMission);
        eventEmitter.emit('selectMissionClosed', currentMission);
    };

    if (!showSelectMissionWindow) return null;  // Do not render component if not visible

    return (
        <div className="overlay_tw">
            <div className="top-window">
                <h2>Select Mission</h2>
                <p>Select a mission to start:</p>

                <div className="mission-list">
                    {Object.entries(accomplishments.gameLevels).map(([level, data]) => (
                        <div key={level} className="mission-item">
                            <button
                                className={`mission-button ${parseInt(currentMission) === parseInt(level) ? 'selected' : ''}`}
                                onClick={() => data.unlocked === "1" && selectCurrentMission(level)}
                                disabled={data.unlocked !== "1"}  // Disable locked missions
                            >
                                Mission {level}
                            </button>
                            <span className="lock-status">
                                {data.unlocked === "1" ? "✅" : "🔒"}  {/* Friendly symbol for unlocked */}
                            </span>
                        </div>
                    ))}
                </div>

                <button onClick={saveAndExit} className="save-exit-button">Save and Exit</button>
            </div>
        </div>
    );
};

export default SelectMission;
