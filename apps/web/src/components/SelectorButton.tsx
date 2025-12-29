'use client';

import React from 'react';
import '../styles/SelectorButton.css'; // Adjust the path as necessary

interface SelectorButtonProps {
  value: string;
  selected: boolean;
  onClick: () => void;
}

const SelectorButton: React.FC<SelectorButtonProps> = ({ value, selected, onClick }) => {
  return (
    <button
      className={`selector-button ${selected ? 'selected' : ''}`}
      onClick={onClick}
    >
      {value}
    </button>
  );
};

export default SelectorButton;
