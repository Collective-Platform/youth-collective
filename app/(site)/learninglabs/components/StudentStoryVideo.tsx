"use client";

import { useRef, useState } from "react";

const videoSrc = "https://mqyxc4xvodvuodmx.public.blob.vercel-storage.com/Learning%20Labs_video_v4.mp4";

export default function StudentStoryVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasStarted, setHasStarted] = useState(false);

  const startStory = () => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = 0;
    video.muted = false;
    video.loop = false;
    setHasStarted(true);
    void video.play();
  };

  return (
    <div className="relative mx-auto w-full max-w-[64rem] bg-black">
      <video
        ref={videoRef}
        autoPlay
        muted={!hasStarted}
        loop={!hasStarted}
        controls={hasStarted}
        playsInline
        preload="auto"
        aria-label="Learning Labs student story"
        className="block aspect-video w-full bg-black"
      >
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support embedded video.
      </video>
      {!hasStarted ? (
        <button
          type="button"
          onClick={startStory}
          className="absolute inset-0 flex items-center justify-center focus-visible:outline-3 focus-visible:outline-offset-[-6px] focus-visible:outline-white"
          aria-label="Play the Learning Labs student story from the beginning"
        >
          <span className="flex size-16 items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-110">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="ml-1 size-7 fill-current">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </button>
      ) : null}
    </div>
  );
}
