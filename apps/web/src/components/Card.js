'use client';

import React from 'react';
import Image from 'next/image';
import '@/styles/Card.css';

const Card = ({ imageUrl, title, text, selected, onClick }) => {
  return (
    <div
      className={`card ${selected ? 'selected' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => { if (e.key === 'Enter') onClick(); }}
    >
      <div className="card-image-wrapper">
        <Image
          src={imageUrl}
          alt={title}
          className="card-image"
          width={300}
          height={200}
        />
      </div>
      <div className="card-content">
        <h3 className="card-title">{title}</h3>
        <p className="card-text">{text}</p>
      </div>
    </div>
  );
};

export default Card;
