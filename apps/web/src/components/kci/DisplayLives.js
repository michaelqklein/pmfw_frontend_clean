import React from 'react';
import '@/src/styles/TrainingMenu.css';
import '@fortawesome/fontawesome-free/css/all.min.css';


const DisplayLives = ({ lives }) => {
  return (
        <div className="heart-container">
          {Array.from({ length: lives }, (_, index) => (
            <i key={index} className="heart far fa-heart"></i>
          ))}
        </div>
  );
};

export default DisplayLives;