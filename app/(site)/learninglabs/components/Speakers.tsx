"use client";

import { Fragment, useState } from "react";
import Image from "next/image";

const speakers = [
  {
    name: "Pr. Kevin Loo & Esther Ku",
    role: [
      "Lead Pastor at Collective",
      "Co-founder of Collective, Relationship Coach",
    ],
    roleJoiner: " & ",
    topic: "Love At First Pasta. Made by hand. Share with Love",
    image: "/assets/learning/speakers/kevin-esther.jpg",
  },
  {
    name: "Jentz Tan",
    role: [
      "Innovation & Design Strategist",
      "Founder of Uncharted Lab & TrainerScore",
    ],
    roleJoiner: ", ",
    topic: "Human-Centered Design",
    image: "/assets/learning/speakers/jentz-tan.jpg",
    credit: "© Thomas Roese",
  },
  {
    name: "Gary Chong",
    role: [
      "Founder & Creative Director",
      "Gary Chong Studios & Industry Advisor Academic",
    ],
    roleJoiner: " at ",
    topic:
      'How to make people think "Wow, we could really click"\nafter you leave the room.',
    image: "/assets/learning/speakers/gary-chong.jpg",
  },
  {
    name: "Kysern Lim",
    role: ["Head of Creative at Collective"],
    roleJoiner: "",
    topic: "No Script. Just Speak",
    image: "/assets/learning/speakers/kysern-lim.jpg",
  },
];

export default function Speakers() {
  const [pressedIndex, setPressedIndex] = useState<number | null>(null);

  const press = (index: number) => (event: React.PointerEvent) => {
    if (event.pointerType !== "mouse") setPressedIndex(index);
  };
  const release = () => setPressedIndex(null);

  return (
    <section
      aria-labelledby="speakers-heading"
      className="bg-[#f45c36] px-5 py-16 text-white sm:px-8 md:py-24"
    >
      <div className="mx-auto max-w-[76rem]">
        <h2
          id="speakers-heading"
          className="mb-10 text-center font-heading text-[clamp(32px,6vw,56px)] leading-tight tracking-[-0.04em] md:mb-14"
        >
          Get the sauces from…
        </h2>

        <ul className="group/list -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:-mx-8 sm:px-8 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:p-0 [&::-webkit-scrollbar]:hidden">
          {speakers.map((speaker, index) => (
            <li
              key={speaker.name}
              onPointerDown={press(index)}
              onPointerUp={release}
              onPointerCancel={release}
              onPointerLeave={release}
              className={`group/card relative aspect-video w-[85%] shrink-0 snap-center md:w-auto ${
                pressedIndex === null || pressedIndex === index
                  ? ""
                  : "max-md:grayscale max-md:contrast-125 max-md:brightness-90"
              } overflow-hidden overflow-hidden rounded-2xl bg-black transition-[filter] duration-300 md:group-hover/list:grayscale md:group-hover/list:contrast-125 md:group-hover/list:brightness-90 md:hover:!grayscale-0 md:hover:!contrast-100 md:hover:!brightness-100`}
            >
              <Image
                src={speaker.image}
                alt={speaker.name}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
              {"credit" in speaker && (
                <span className="absolute top-2 right-3 z-10 text-[10px] text-white/90 [text-shadow:0_1px_2px_rgb(0_0_0/0.7)]">
                  {speaker.credit}
                </span>
              )}
              <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/20 to-transparent transition-opacity duration-300 md:opacity-0 md:group-hover/card:opacity-100" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-white transition-[opacity,transform] duration-300 ease-out sm:p-6 md:translate-y-6 md:opacity-0 md:group-hover/card:translate-y-0 md:group-hover/card:opacity-100">
                <h3 className="text-base font-bold">{speaker.name}</h3>
                <p className="mt-1 text-xs text-white/80 sm:text-sm">
                  {speaker.role.map((line, i) => (
                    <Fragment key={line}>
                      {i > 0 && (
                        <>
                          <br className="sm:hidden" />
                          <span className="max-sm:hidden">
                            {speaker.roleJoiner}
                          </span>
                        </>
                      )}
                      {line}
                    </Fragment>
                  ))}
                </p>
                <p className="mt-3 inline-block bg-[#f45c36] px-3 py-1.5 text-xs font-bold whitespace-pre-line sm:text-sm">
                  {speaker.topic}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
