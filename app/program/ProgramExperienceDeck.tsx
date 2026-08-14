"use client";

import Image from "next/image";
import { useState } from "react";
import InternshipFAQ from "./InternshipFAQ";

/*
 * THESIS: Five ways into one week, built as a living event poster instead of a conventional programme hero.
 * OWN-WORLD: Signal orange, absolute black, and paper white; oversized Archivo lettering, hard edges, and photo crops that break the frame.
 * STORY: A teen can feel the energy, see the essential facts, choose a mood, then start registration without losing the thread.
 * FIRST VIEWPORT: Full black poster frame; the active concept fills it, with five entry markers across the top and the action held at the lower edge.
 * FORM: Five-cut poster deck. Each cut is a complete composition, while the programme facts remain a single source of truth.
 */

const directions = [
  { id: "pulse", number: "01", label: "Pulse", note: "big energy" },
  { id: "field", number: "02", label: "Field notes", note: "make the week yours" },
  { id: "signal", number: "03", label: "Signal", note: "tune in" },
  { id: "memory", number: "04", label: "Memory wall", note: "show up together" },
  { id: "night", number: "05", label: "After dark", note: "step out" },
] as const;

type DirectionId = (typeof directions)[number]["id"];

const factLine = "7–13 Dec 2026 · Ages 13–17 · RM699";
const whatsappUrl = "https://wa.me/601123646715";

function Details({ inverse = false }: { inverse?: boolean }) {
  return (
    <p
      className={`text-xs font-bold uppercase tracking-[0.13em] sm:text-sm ${
        inverse ? "text-white" : "text-black"
      }`}
    >
      {factLine}
    </p>
  );
}

function PulseDirection() {
  return (
    <div className="relative min-h-[42rem] overflow-hidden bg-[#f45c36] px-5 py-7 text-black sm:px-8 md:min-h-[46rem] lg:px-12">
      <p className="relative z-10 max-w-40 text-xs font-bold uppercase leading-tight tracking-[0.14em] sm:max-w-none">
        Strictly Students<br />
        Learning Labs
      </p>
      <div className="absolute right-0 top-0 h-full w-[59%] border-l-2 border-black sm:w-[48%]">
        <Image
          src="/assets/program/summer/summer-program-07.jpg"
          alt="Students posing together outdoors"
          fill
          priority
          sizes="(min-width: 1024px) 48vw, 59vw"
          className="object-cover object-center grayscale contrast-125"
        />
        <div className="absolute inset-0 bg-[#f45c36]/25 mix-blend-multiply" />
      </div>
      <div className="relative z-10 flex min-h-[35rem] flex-col justify-between pt-16 sm:pt-20">
        <h1 className="max-w-[9ch] font-heading text-[clamp(5.6rem,15vw,13.5rem)] leading-[0.72] tracking-[-0.045em] uppercase sm:max-w-[8ch]">
          Go<br />
          all<br />
          in.
        </h1>
        <div className="flex flex-wrap items-end justify-between gap-6 border-t-2 border-black pt-5">
          <div>
            <p className="mb-2 max-w-56 text-base font-semibold leading-tight sm:text-lg">
              A week away from the usual, with God and your people.
            </p>
            <Details />
          </div>
          <span className="font-heading text-7xl leading-none" aria-hidden="true">↘</span>
        </div>
      </div>
    </div>
  );
}

function FieldNotesDirection() {
  return (
    <div className="grid min-h-[42rem] overflow-hidden bg-white text-black md:min-h-[46rem] md:grid-cols-[0.78fr_1.22fr]">
      <div className="flex flex-col border-b-2 border-black p-5 sm:p-8 md:border-b-0 md:border-r-2 md:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.16em]">Your field notes</p>
        <h1 className="mt-8 font-heading text-[clamp(4rem,8vw,8.5rem)] leading-[0.76] tracking-[-0.04em] uppercase">
          Write<br />
          your<br />
          next
        </h1>
        <div className="mt-auto pt-16">
          <p className="max-w-xs text-base font-semibold leading-snug sm:text-lg">
            Seven days to get honest, try something new, and discover that faith is not a spectator sport.
          </p>
          <div className="mt-6 border-y-2 border-black py-4"><Details /></div>
        </div>
      </div>
      <div className="relative min-h-[28rem] overflow-hidden bg-black">
        <Image
          src="/assets/program/summer/summer-program-01.jpg"
          alt="Students in a small group conversation"
          fill
          sizes="(min-width: 768px) 62vw, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/15" />
        <div className="absolute left-[8%] top-[9%] max-w-[15rem] border-2 border-black bg-[#f45c36] p-4 shadow-[8px_8px_0_0_#000] sm:max-w-xs sm:p-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em]">Pocket prompt</p>
          <p className="mt-3 font-heading text-2xl leading-[0.9] uppercase sm:text-3xl">
            What if you gave this week your full yes?
          </p>
        </div>
        <p className="absolute bottom-5 right-5 bg-white px-3 py-2 text-xs font-bold uppercase tracking-[0.13em] sm:bottom-8 sm:right-8">
          No. 2026 / Experience
        </p>
      </div>
    </div>
  );
}

function SignalDirection() {
  return (
    <div className="relative min-h-[42rem] overflow-hidden bg-black px-5 py-7 text-white sm:px-8 md:min-h-[46rem] lg:px-12">
      <div className="absolute inset-x-0 top-[18%] h-px bg-white/30" />
      <div className="absolute inset-x-0 top-[62%] h-px bg-white/30" />
      <div className="absolute bottom-0 left-[23%] top-0 w-px bg-white/30" />
      <div className="absolute bottom-0 left-[69%] top-0 w-px bg-white/30" />
      <div className="relative flex items-start justify-between gap-5">
        <p className="text-xs font-bold uppercase tracking-[0.16em]">Signal received / 2026</p>
        <p className="text-xs font-bold uppercase tracking-[0.16em]">Kuala Lumpur</p>
      </div>
      <div className="relative mt-18 grid gap-9 md:mt-24 md:grid-cols-[1.18fr_0.82fr] md:gap-12">
        <div>
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-[#f45c36]">You are invited to</p>
          <h1 className="font-heading text-[clamp(4.5rem,12vw,11rem)] leading-[0.73] tracking-[-0.04em] uppercase">
            The<br />
            real<br />
            thing.
          </h1>
          <div className="mt-10 inline-flex items-center gap-3 bg-[#f45c36] px-4 py-3 text-black">
            <span className="size-3 animate-pulse rounded-full bg-black" aria-hidden="true" />
            <Details />
          </div>
        </div>
        <div className="relative min-h-64 overflow-hidden border-2 border-white md:min-h-[25rem]">
          <Image
            src="/assets/program/summer/summer-program-05.jpg"
            alt="Students listening to a summer program session"
            fill
            sizes="(min-width: 768px) 40vw, 100vw"
            className="object-cover grayscale contrast-125"
          />
          <div className="absolute inset-0 bg-[#f45c36]/30 mix-blend-screen" />
          <p className="absolute bottom-0 left-0 bg-black px-4 py-3 text-xs font-bold uppercase tracking-[0.14em]">Live where it counts</p>
        </div>
      </div>
      <p className="relative mt-12 max-w-lg text-base font-medium leading-relaxed text-white/85 sm:text-lg">
        Less scrolling. More conversation. More worship. More of the kind of fun that changes what Monday feels like.
      </p>
    </div>
  );
}

function MemoryDirection() {
  return (
    <div className="min-h-[42rem] overflow-hidden bg-[#f45c36] text-black md:min-h-[46rem]">
      <div className="grid grid-cols-2 border-b-2 border-black md:grid-cols-4">
        {["eat together", "ask everything", "get outside", "meet God"].map((item) => (
          <p key={item} className="border-r-2 border-black px-3 py-3 text-[0.65rem] font-bold uppercase tracking-[0.12em] last:border-r-0 sm:px-5 sm:text-xs">
            {item}
          </p>
        ))}
      </div>
      <div className="grid gap-0 md:grid-cols-[1.05fr_0.95fr]">
        <div className="relative min-h-[22rem] border-b-2 border-black md:min-h-[42.8rem] md:border-b-0 md:border-r-2">
          <Image
            src="/assets/program/summer/summer-program-04.jpg"
            alt="A student enjoying a barbecue during the programme"
            fill
            sizes="(min-width: 768px) 53vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[#f45c36]/25 mix-blend-multiply" />
          <p className="absolute bottom-0 left-0 bg-white px-5 py-3 text-xs font-bold uppercase tracking-[0.14em]">Keep this one</p>
        </div>
        <div className="flex min-h-[27rem] flex-col p-5 sm:p-8 md:min-h-[42.8rem] md:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.16em]">A future memory</p>
          <h1 className="mt-6 font-heading text-[clamp(4rem,9vw,8.5rem)] leading-[0.75] tracking-[-0.04em] uppercase">
            Meet<br />
            your<br />
            people.
          </h1>
          <div className="mt-auto border-t-2 border-black pt-5">
            <p className="max-w-sm text-base font-semibold leading-snug sm:text-lg">
              You do not have to turn up already sorted. Bring your questions, your weird jokes, and the whole version of you.
            </p>
            <div className="mt-5"><Details /></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NightDirection() {
  return (
    <div className="relative min-h-[42rem] overflow-hidden bg-black text-white md:min-h-[46rem]">
      <Image
        src="/assets/program/summer/summer-program-10.jpg"
        alt="Students gathered in a summer program session"
        fill
        sizes="100vw"
        className="object-cover object-center opacity-70"
      />
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-x-0 bottom-0 h-[58%] bg-linear-to-t from-black via-black/60 to-transparent" />
      <div className="relative flex min-h-[42rem] flex-col justify-between p-5 sm:p-8 md:min-h-[46rem] md:p-12">
        <div className="flex items-start justify-between gap-4">
          <p className="max-w-40 text-xs font-bold uppercase leading-tight tracking-[0.15em]">Strictly Students<br />Learning Labs</p>
          <p className="border border-white/70 px-3 py-2 text-xs font-bold uppercase tracking-[0.14em]">One week only</p>
        </div>
        <div>
          <p className="mb-5 max-w-md text-base font-semibold leading-snug sm:text-xl">The best stories begin when you decide to leave the ordinary behind.</p>
          <h1 className="max-w-5xl font-heading text-[clamp(4.7rem,13vw,12rem)] leading-[0.72] tracking-[-0.045em] uppercase">
            Start<br />
            somewhere.
          </h1>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-5 border-t-2 border-[#f45c36] pt-5">
            <Details inverse />
            <span className="bg-[#f45c36] px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-black">There is room for you</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function DirectionVisual({ direction }: { direction: DirectionId }) {
  switch (direction) {
    case "pulse": return <PulseDirection />;
    case "field": return <FieldNotesDirection />;
    case "signal": return <SignalDirection />;
    case "memory": return <MemoryDirection />;
    case "night": return <NightDirection />;
  }
}

export default function ProgramExperienceDeck() {
  const [activeDirection, setActiveDirection] = useState<DirectionId>("pulse");

  return (
    <main className="min-h-screen bg-black font-[Inter,sans-serif]">
      <section className="bg-black px-3 py-3 text-white sm:px-5 sm:py-5">
        <div className="mx-auto max-w-[92rem]">
          <div className="mb-3 flex flex-col justify-between gap-3 border-b border-white/30 pb-3 sm:flex-row sm:items-center">
            <p className="font-heading text-2xl tracking-[-0.03em] uppercase sm:text-3xl">Experience / 2026</p>
            <p className="max-w-sm text-xs font-medium uppercase leading-relaxed tracking-[0.12em] text-white/75 sm:text-right">Five first impressions. One unforgettable week.</p>
          </div>
          <div className="grid grid-cols-5 gap-1" aria-label="Explore five Experience landing directions">
            {directions.map((direction) => {
              const isActive = activeDirection === direction.id;
              return (
                <button
                  key={direction.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActiveDirection(direction.id)}
                  className={`min-h-16 border px-2 py-2 text-left transition-colors focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#f45c36] sm:min-h-20 sm:px-3 ${
                    isActive ? "border-[#f45c36] bg-[#f45c36] text-black" : "border-white/35 bg-transparent text-white hover:border-white hover:bg-white hover:text-black"
                  }`}
                >
                  <span className="block text-[0.62rem] font-bold tracking-[0.12em] sm:text-xs">{direction.number}</span>
                  <span className="mt-1 block text-xs font-bold uppercase leading-none sm:text-sm">{direction.label}</span>
                  <span className="mt-1 hidden text-[0.62rem] font-medium uppercase tracking-wide sm:block">{direction.note}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section id="experience-canvas" aria-live="polite" className="px-3 pb-3 sm:px-5 sm:pb-5">
        <div className="mx-auto max-w-[92rem] border-2 border-white">
          <DirectionVisual direction={activeDirection} />
        </div>
      </section>

      <section id="apply" className="border-y-2 border-[#f45c36] bg-white px-5 py-12 text-black sm:px-8 md:py-16">
        <div className="mx-auto grid max-w-[92rem] gap-10 md:grid-cols-[1.25fr_0.75fr] md:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#c53d1d]">Your next move</p>
            <h2 className="mt-4 max-w-3xl font-heading text-[clamp(3.5rem,8vw,7.5rem)] leading-[0.78] tracking-[-0.04em] uppercase">
              Make this your week.
            </h2>
          </div>
          <div className="md:pb-1">
            <p className="mb-6 max-w-md text-base font-medium leading-relaxed sm:text-lg">7–13 December 2026. For ages 13–17. RM699, with instalments available.</p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex border-2 border-black bg-black px-8 py-5 text-base font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#f45c36] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[#f45c36]"
            >
              Check availability on WhatsApp ↗
            </a>
          </div>
        </div>
      </section>
      <InternshipFAQ />
      <footer className="bg-black px-5 py-6 text-center text-xs font-bold uppercase tracking-[0.14em] text-white/70">Strictly Students Learning Labs: Experience</footer>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-4 right-4 z-20 border-2 border-black bg-[#f45c36] px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-black shadow-[4px_4px_0_0_#fff] transition-transform hover:-translate-y-1 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-white sm:bottom-6 sm:right-6"
      >
        Check availability ↗
      </a>
    </main>
  );
}
