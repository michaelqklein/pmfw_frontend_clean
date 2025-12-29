'use client';

import React, { useEffect, useState } from 'react';
import '../styles/OverlayText.css';

const OverlayText = ({showIt}) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const handleAnimationEnd = () => {
            setVisible(false);
        };

        const overlayElement = document.querySelector('.overlay');
        overlayElement.addEventListener('animationend', handleAnimationEnd);

        // Cleanup event listener on component unmount
        return () => {
            overlayElement.removeEventListener('animationend', handleAnimationEnd);
        };
    }, []);

    if (!visible) return null;

    return (
        <div className="overlay">
            {(showIt) &&
                <div className="overlay-text">KEY COMMANDER I</div>
            }
        </div>
    );
};

export default OverlayText;
