'use client';
import React from 'react';
import '@/src/styles/Tier.css'; // Adjust the path as necessary

const Tier = ({ imageUrl = null, title, text, selected, onClick }) => {
  return (
    <div className={`tier ${selected ? 'selected' : ''}`} onClick={onClick}>
      <a href="#" onClick={(e) => { e.preventDefault(); onClick(); }} className="tier-link">
        {/* Conditionally render the image only if imageUrl is provided */}
        {imageUrl && (
          <img src={imageUrl} alt={title} className="tier-image" />
        )}
      </a>
      <div className="tier-content">
        <a href="#" onClick={(e) => { e.preventDefault(); onClick(); }} className="tier-title-link">
          <h3 className="tier-title">{title}</h3>
        </a>
        <p className="tier-text" dangerouslySetInnerHTML={{ __html: text }}></p>
      </div>
    </div>
  );
};

export default Tier;
