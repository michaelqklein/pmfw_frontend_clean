"use client";
import { useRef } from "react";

export default function VideoPlayer() {
  const videoRef = useRef(null);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 p-4">
      <div className="w-full max-w-4xl shadow-2xl rounded-2xl overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-auto rounded-2xl"
          controls
          preload="metadata"
        >
          <source src="/videos/FreeImprov_Tutorial.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
}
