"use client";

import { useState } from "react";

const featureItems = [
  {
    title: "Teaching that goes deeper than your feed.",
    desc: `In a world that is constantly talking, how do we listen? Not just to others, but to the voice of God? `,
  },
  {
    title: "Space to process what's within you.",
    desc: `Guided reflection. Honest conversations. Room to name the patterns you've been carrying and let them go.`,
  },
  {
    title: "Practices you'll take home.",
    desc: `The new you needs new rhythms. You'll be equipped with practical tools to sustain the life you're stepping into.`,
  },
  {
    title: "Community that sees you.",
    desc: `Surround yourself with like-minded people. A week where you're known—not just attended. `,
  },
];

export default function FeatureCards() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  return (
    <div className="flex flex-col gap-4 md:max-w-xl md:mx-auto">
      {featureItems.map((item, i) => {
        const isExpanded = expandedIndex === i;
        return (
          <div
            key={i}
            onClick={() => setExpandedIndex(isExpanded ? null : i)}
            className="cursor-pointer bg-[#f45c36] p-6 transition-all duration-300"
          >
            <h3 className="text-base font-bold text-white text-center text-balance">
              {item.title}
            </h3>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                isExpanded ? "max-h-40 mt-4 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <p className="text-white text-center text-sm text-balance">
                {item.desc}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
