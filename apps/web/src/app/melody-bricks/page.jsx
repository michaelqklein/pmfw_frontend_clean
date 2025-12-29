'use client';

import dynamic from 'next/dynamic';

const MBPage = dynamic(() => import("@/src/components/melody-bricks/MBPage"), {
  ssr: false,
});

export default function MBRoute() {
  return (
    <MBPage />
  );
}