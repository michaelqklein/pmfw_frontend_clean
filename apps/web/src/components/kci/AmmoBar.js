import React from 'react';
import '@/src/styles/TrainingMenu.css';
import '@/src/styles/kci/BarDisplay.css';

const AmmoBar = ({ ammo }) => {
    // console.log("value is: ", ammo);
  // Validate the health prop is between 0 and 100
  if (ammo < 0 || ammo > 100) {
    throw new Error('Health prop should be between 0 and 100.');
  }

  return (
    <div className="window-container">
      <div className="name-container">
        <div className="bar-container">
          <div className={`bar ${ammo >= 25 ? 'green' : 'red'}`} style={{ width: `${ammo}%` }} />
          <div className="text">
            Ammo: {ammo}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AmmoBar;