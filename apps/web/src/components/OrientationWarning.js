'use client';

import { useEffect, useState } from 'react';

export default function OrientationWarning() {
  const [isLandscape, setIsLandscape] = useState(true);

  useEffect(() => {
    const updateOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };

    window.addEventListener('resize', updateOrientation);
    updateOrientation(); // check on load

    return () => window.removeEventListener('resize', updateOrientation);
  }, []);

  if (!isLandscape) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white text-black px-6 py-4 rounded-2xl border border-gray-300 shadow-xl text-center text-base max-w-xs w-[90%]">
          Please rotate your device to landscape to continue.
        </div>
      </div>
    );
  }

  return null;
}
