'use client';

import React, { useState, useEffect } from 'react';

const items = [
  { key: 'levels', label: 'Levels', icon: '🎯' },
  { key: 'progress', label: 'Progress', icon: '📈' },
  { key: 'shop', label: 'Shop', icon: '🛒' },
  { key: 'settings', label: 'Settings', icon: '⚙️' },
  { key: 'upgrade', label: 'Upgrade', icon: '💎' },
  { key: 'exit', label: 'Exit', icon: '⏏️' },
];

export default function RightSidebar({ currentView, onNavigate, onUpgrade, onExit }) {
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    function checkMobile() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const mobile = Math.min(width, height) <= 768;
      setIsMobile(mobile);
      
      // Add bottom padding to body when mobile navbar is present
      if (mobile) {
        document.body.style.paddingBottom = '80px';
      } else {
        document.body.style.paddingBottom = '0px';
      }
    }

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
      document.body.style.paddingBottom = '0px';
    };
  }, []);
  const handleClick = (key) => {
    if (key === 'upgrade') {
      onUpgrade && onUpgrade();
      return;
    }
    if (key === 'exit') {
      onExit && onExit();
      return;
    }
    onNavigate && onNavigate(key);
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-[100]">
      {isMobile ? (
        // Mobile: Bottom horizontal navbar
        <div className="pointer-events-auto fixed bottom-0 left-0 right-0 bg-black/70 border-t-2 border-gray-600 p-3 shadow-xl">
          <div className="flex justify-around gap-2">
            {items.map((it) => {
              const active = (currentView === it.key) || (it.key === 'levels' && (currentView === 'levels' || currentView === 'game'));
              return (
                <button
                  key={it.key}
                  onClick={() => handleClick(it.key)}
                  className={`${active ? 'bg-emerald-600/25 ring-2 ring-emerald-500/40' : ''} text-gray-200 hover:text-white hover:bg-white/10 rounded-xl px-2 py-3 flex flex-col items-center gap-1 min-w-0 flex-1`}
                  aria-label={it.label}
                >
                  <span className="text-xl leading-none">{it.icon}</span>
                  <span className="text-xs font-semibold truncate">{it.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        // Desktop: Right vertical sidebar
        <div className="pointer-events-auto fixed right-4 top-8 bg-black/70 border-2 border-gray-600 rounded-2xl p-3 flex flex-col gap-2 shadow-xl">
          {items.map((it) => {
            const active = (currentView === it.key) || (it.key === 'levels' && (currentView === 'levels' || currentView === 'game'));
            return (
              <button
                key={it.key}
                onClick={() => handleClick(it.key)}
                className={`${active ? 'bg-emerald-600/25 ring-2 ring-emerald-500/40' : ''} text-gray-200 hover:text-white hover:bg-white/10 rounded-xl px-4 py-3 flex items-center gap-3`}
                aria-label={it.label}
              >
                <span className="text-2xl leading-none w-8 text-center">{it.icon}</span>
                <span className="hidden md:inline text-lg font-semibold">{it.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}


