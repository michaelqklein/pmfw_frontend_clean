'use client';

import dynamic from 'next/dynamic';

const AudiationStudioPage = dynamic(() => import("@/src/components/audiationStudio/AudiationStudioPage"), {
  ssr: false,
});

export default function AudiationStudioRoute() {
  return (
    <AudiationStudioPage />
  );
}