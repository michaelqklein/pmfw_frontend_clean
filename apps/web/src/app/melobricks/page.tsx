'use client';

import dynamic from 'next/dynamic';

const GameCanvas = dynamic(() => import('@/src/components/melody-bricks/GameCanvasComponentV2'), {
  ssr: false,
});

export default function MelodyBricksPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
       <p className="mt-4 text-center text-2xl text-white">
        This feature is in development and will be released soon.
      </p>
      <GameCanvas />
    </div>
  );
}
