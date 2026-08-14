"use client";

import Image, { getImageProps } from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { preload } from "react-dom";

const CHANGE_INTERVAL_MS = 5_200;
const UPPER_FOCAL_POINT_IMAGES = new Set([
  "/assets/program/summer/summer-program-07.jpg",
  "/assets/program/summer/summer-program-09.jpg",
]);

const heroImages = [
  {
    src: "/assets/program/summer/summer-program-01.jpg",
    alt: "Students preparing food together during the programme",
  },
  {
    src: "/assets/program/summer/summer-program-02.jpg",
    alt: "Students enjoying an activity during the programme",
  },
  {
    src: "/assets/program/summer/summer-program-03.jpg",
    alt: "Students sharing a moment together during the programme",
  },
  {
    src: "/assets/program/summer/summer-program-04.jpg",
    alt: "A student enjoying time outdoors during the programme",
  },
  {
    src: "/assets/program/summer/summer-program-05.jpg",
    alt: "Students listening during a programme session",
  },
  {
    src: "/assets/program/summer/summer-program-06.jpg",
    alt: "Students reflecting together around a table",
  },
  {
    src: "/assets/program/summer/summer-program-07.jpg",
    alt: "Students posing together outdoors",
  },
  {
    src: "/assets/program/summer/summer-program-08.jpg",
    alt: "Students spending time together outdoors during the programme",
  },
  {
    src: "/assets/program/summer/summer-program-09.jpg",
    alt: "Students gathered together outdoors during the programme",
  },
  {
    src: "/assets/program/summer/summer-program-10.jpg",
    alt: "Students gathered for a summer programme session",
  },
] as const;

export default function HeroGallery() {
  const galleryRef = useRef<HTMLDivElement>(null);
  const activeProgressRef = useRef<HTMLSpanElement>(null);
  const activeIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState<number | null>(null);
  const [isInView, setIsInView] = useState(true);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const showImage = useCallback((nextIndex: number) => {
    const currentIndex = activeIndexRef.current;
    if (nextIndex === currentIndex) return;

    setPreviousIndex(currentIndex);
    activeIndexRef.current = nextIndex;
    setActiveIndex(nextIndex);
  }, []);

  const showNextImage = useCallback(() => {
    showImage((activeIndexRef.current + 1) % heroImages.length);
  }, [showImage]);

  const showPreviousImage = useCallback(() => {
    showImage((activeIndexRef.current - 1 + heroImages.length) % heroImages.length);
  }, [showImage]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updateMotionPreference();
    mediaQuery.addEventListener("change", updateMotionPreference);

    return () => mediaQuery.removeEventListener("change", updateMotionPreference);
  }, []);

  useEffect(() => {
    const updatePageVisibility = () => setIsPageVisible(!document.hidden);

    updatePageVisibility();
    document.addEventListener("visibilitychange", updatePageVisibility);

    return () => document.removeEventListener("visibilitychange", updatePageVisibility);
  }, []);

  useEffect(() => {
    const gallery = galleryRef.current;
    if (!gallery) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.1 },
    );

    observer.observe(gallery);
    return () => observer.disconnect();
  }, []);

  const isTimerRunning = !prefersReducedMotion && isInView && isPageVisible;

  useEffect(() => {
    if (!isTimerRunning) return;

    const startedAt = performance.now();
    let animationFrameId = 0;

    const updateProgress = (now: number) => {
      const progress = Math.min((now - startedAt) / CHANGE_INTERVAL_MS, 1);
      activeProgressRef.current?.style.setProperty("--story-progress", String(progress));

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(updateProgress);
      }
    };

    animationFrameId = window.requestAnimationFrame(updateProgress);
    const timeoutId = window.setTimeout(showNextImage, CHANGE_INTERVAL_MS);
    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.clearTimeout(timeoutId);
    };
  }, [activeIndex, isTimerRunning, showNextImage]);

  useEffect(() => {
    for (let offset = 1; offset <= 2; offset += 1) {
      const nextImage = heroImages[(activeIndex + offset) % heroImages.length];
      const { props } = getImageProps({
        src: nextImage.src,
        alt: "",
        fill: true,
        sizes: "100vw",
      });

      preload(props.src, {
        as: "image",
        imageSrcSet: props.srcSet,
        imageSizes: props.sizes,
      });
    }
  }, [activeIndex]);

  const activeImage = heroImages[activeIndex];
  const previousImage = previousIndex === null ? null : heroImages[previousIndex];
  const getObjectPosition = (src: string) =>
    UPPER_FOCAL_POINT_IMAGES.has(src) ? "md:object-[center_20%]" : "";

  return (
    <div ref={galleryRef} className="relative min-h-[24rem] overflow-hidden md:min-h-[43rem]">
      {previousImage ? (
        <Image
          src={previousImage.src}
          alt=""
          fill
          sizes="100vw"
          className={`object-cover ${getObjectPosition(previousImage.src)}`}
        />
      ) : null}
      <Image
        key={activeImage.src}
        src={activeImage.src}
        alt={activeImage.alt}
        fill
        priority={activeIndex === 0}
        sizes="100vw"
        className={`animate-in fade-in duration-700 motion-reduce:animate-none object-cover ${getObjectPosition(activeImage.src)}`}
      />
      <div className="pointer-events-none absolute inset-0 bg-[#f45c36]/25 mix-blend-multiply" aria-hidden="true" />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex gap-1.5 p-3 sm:p-4" aria-hidden="true">
        {heroImages.map((image, index) => {
          const isComplete = index < activeIndex;
          const isActive = index === activeIndex;
          const isFilled = isComplete || (isActive && prefersReducedMotion);

          return (
            <span key={image.src} className="h-1 flex-1 overflow-hidden rounded-full bg-black/40 shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
              <span
                key={isActive ? activeImage.src : image.src}
                ref={isActive ? activeProgressRef : null}
                className="block h-full origin-left bg-white"
                style={{
                  transform: isActive && !prefersReducedMotion
                    ? "scaleX(var(--story-progress, 0))"
                    : `scaleX(${isFilled ? 1 : 0})`,
                  willChange: isActive && isTimerRunning ? "transform" : undefined,
                }}
              />
            </span>
          );
        })}
      </div>

      <div className="absolute inset-0 z-10 grid grid-cols-2">
        <button
          type="button"
          onClick={showPreviousImage}
          aria-label={`Show previous programme photo. Currently showing photo ${activeIndex + 1} of ${heroImages.length}.`}
          className="cursor-pointer focus-visible:outline-3 focus-visible:outline-offset-[-5px] focus-visible:outline-white"
        />
        <button
          type="button"
          onClick={showNextImage}
          aria-label={`Show next programme photo. Currently showing photo ${activeIndex + 1} of ${heroImages.length}.`}
          className="cursor-pointer focus-visible:outline-3 focus-visible:outline-offset-[-5px] focus-visible:outline-white"
        />
      </div>
      <p className="sr-only">Programme photo {activeIndex + 1} of {heroImages.length}. Tap the left half for the previous photo or the right half for the next photo.</p>
    </div>
  );
}
