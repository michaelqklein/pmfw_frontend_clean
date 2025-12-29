import React from 'react';
import DisplayLives from './DisplayLives';
import PropTypes from 'prop-types';
import '@/src/styles//TrainingMenu.css';
import '@/src/styles/kci/BarDisplay.css';

const HealthBar = ({ health, lives }) => {
  // Validate the health prop is between 0 and 100
  if (health < 0 || health > 100) {
    throw new Error('Health prop should be between 0 and 100.');
  }

  return (
    <div className="window-container">
      <div className="name-container">
        Health:
        <div className="bar-container">
          <div className={`bar ${health >= 50 ? 'green' : 'red'}`} style={{ width: `${health}%` }} />
          <div className="text">
            {health.toFixed(2)}%
          </div>
        </div>
        < DisplayLives lives={lives} />
      </div>
    </div>
  );
};

HealthBar.propTypes = {
  health: PropTypes.number.isRequired,
};

export default HealthBar;