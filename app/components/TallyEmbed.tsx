"use client";

import { useEffect, useRef } from "react";

interface TallyEmbedProps {
  src: string;
  height?: number;
  title?: string;
}

export default function TallyEmbed({
  src,
  height = 386,
  title = "Serving Form",
}: TallyEmbedProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const scriptUrl = "https://tally.so/widgets/embed.js";

    const loadEmbeds = () => {
      if (typeof (window as { Tally?: { loadEmbeds: () => void } }).Tally !== "undefined") {
        (window as { Tally: { loadEmbeds: () => void } }).Tally.loadEmbeds();
      } else {
        document
          .querySelectorAll("iframe[data-tally-src]:not([src])")
          .forEach((el) => {
            const iframe = el as HTMLIFrameElement;
            iframe.src = iframe.dataset.tallySrc || "";
          });
      }
    };

    if (typeof (window as { Tally?: unknown }).Tally !== "undefined") {
      loadEmbeds();
    } else if (!document.querySelector(`script[src="${scriptUrl}"]`)) {
      const script = document.createElement("script");
      script.src = scriptUrl;
      script.onload = loadEmbeds;
      script.onerror = loadEmbeds;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <iframe
      ref={iframeRef}
      data-tally-src={src}
      loading="lazy"
      width="100%"
      height={height}
      frameBorder="0"
      marginHeight={0}
      marginWidth={0}
      title={title}
    />
  );
}
