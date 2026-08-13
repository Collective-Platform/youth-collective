import Image from "next/image";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import InternshipFAQ from "./InternshipFAQ";
import MemoryNotesGrid from "./MemoryNotesGrid";
import ProgramHeroGallery from "./ProgramHeroGallery";
import RegistrationDialog from "./RegistrationDialog";

/*
 * THESIS: The programme is introduced as a future memory wall—an accumulating record of the week teens will make together.
 * OWN-WORLD: Orange printed-paper fields, black marker-like type, white caption strips, honest photo crops, and hard black rules.
 * STORY: Find yourself in the moments first, then understand the programme, practical details, and one clear way to ask about a place.
 * FIRST VIEWPORT: A four-part pinboard opens with a living photo, huge “meet your people” message, and the date pinned at the edge.
 * FORM: A responsive memory wall: big moments, clipped notes, proof photos, then an unmissable practical close.
 */

const registrationOpen = true;

const memoryNotes = [
  {
    title: "Teaching that goes deeper than your feed.",
    copy: "In a world that is constantly talking, how do we listen? Not just to others, but to the voice of God?",
    image: "/assets/program/summer/summer-program-10.jpg",
    alt: "Students listening as a leader teaches during a programme session",
  },
  {
    title: "Space to process what’s within you.",
    copy: "Guided reflection. Honest conversations. Room to name the patterns you’ve been carrying and let them go.",
    image: "/assets/program/summer/summer-program-06.jpg",
    alt: "Students reflecting together around a table",
  },
  {
    title: "Practices you’ll take home.",
    copy: "The new you needs new rhythms. You’ll be equipped with practical tools to sustain the life you’re stepping into.",
    image: "/assets/program/summer/summer-program-01.jpg",
    alt: "Students preparing food together during the programme",
  },
  {
    title: "Community that sees you.",
    copy: "Surround yourself with like-minded people. A week where you’re known—not just attended.",
    image: "/assets/program/summer/summer-program-08.jpg",
    alt: "Students taking a photo together on a forest walk",
  },
] as const;

const familiarMoments = [
  "You've tried to change before. It didn't stick.",
  "You know you’re called to more, but you don’t know where to start.",
  "You are hungry for what's next.",
] as const;

export default function MemoryWallExperience() {
  return (
    <main className="min-h-screen bg-black font-[Inter,sans-serif] text-black">
      <div className="bg-white"><Navbar /></div>

      <section className="bg-black px-3 py-3 text-black sm:px-5 sm:py-5 md:pb-12">
        <div className="mx-auto max-w-[92rem] overflow-hidden bg-[#f45c36]">
          <div className="flex min-h-[31rem] flex-col justify-center border-b-2 border-black p-6 sm:p-8 md:min-h-[36rem] md:items-center md:px-10 md:py-16 md:text-center">
            <p className="text-md font-bold tracking-[0.08em]">
              God is making all things new — starting from you.
            </p>
            <h1 className="mt-7 max-w-3xl font-heading text-[clamp(2rem,4.5vw,3.5rem)] uppercase leading-[1] tracking-[-0.04em] sm:mt-8 md:text-balance">
              Strictly Students Learning Labs: Experience
            </h1>
            <p className="mt-6 max-w-md text-base font-semibold leading-snug sm:mt-7 sm:text-lg">
              A week away from distractions to experience God for yourself (while having fun).
            </p>
            <dl className="mt-8 grid w-full max-w-2xl grid-cols-2 gap-3 border-y-2 border-black py-4 text-base sm:gap-5 sm:text-lg md:grid-cols-3">
              <div>
                <dt className="text-sm font-medium">Dates</dt>
                <dd className="mt-1 font-bold">7–13 Dec 2026</dd>
              </div>
              <div>
                <dt className="text-sm font-medium">Age</dt>
                <dd className="mt-1 font-bold">13–17</dd>
              </div>
              <div className="col-span-2 md:col-span-1">
                <dt className="text-sm font-medium">Fee</dt>
                <dd className="mt-1 font-bold">RM699</dd>
              </div>
            </dl>
            {registrationOpen ? (
              <RegistrationDialog triggerClassName="mt-8 inline-flex w-fit border-2 border-black bg-black px-6 py-4 text-sm font-bold tracking-[0.08em] text-white transition-colors hover:bg-[#edeae5] hover:text-black focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-black" />
            ) : null}
          </div>
        </div>
      </section>

      <section aria-label="Programme photo gallery" className="bg-black px-3 pb-3 text-black sm:px-5 sm:pb-5">
        <div className="mx-auto max-w-[92rem] overflow-hidden">
          <ProgramHeroGallery />
          <div className="grid grid-cols-2 border-t-2 border-black bg-[#f45c36] md:grid-cols-4">
            {["eat together", "ask everything", "get outside", "meet God"].map((item) => (
              <p key={item} className="flex min-h-9 items-center justify-center border-black/60 px-3 py-2 text-center text-[0.62rem] font-bold uppercase tracking-[0.1em] text-black/70 odd:border-r [&:nth-child(-n+2)]:border-b sm:px-5 sm:text-xs md:min-h-11 md:border-r-2 md:border-black md:px-5 md:py-3 md:text-center md:tracking-[0.12em] md:text-black md:[&:nth-child(-n+2)]:border-b-0 md:last:border-r-0">
                {item}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="familiar-heading" className="bg-[#0c0c0c] px-4 py-20 text-white md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h2 id="familiar-heading" className="mb-12 font-heading text-3xl uppercase tracking-wide">
            Does this sound like you?
          </h2>

          <ul className="mx-auto max-w-2xl space-y-6 py-3">
            {familiarMoments.map((moment) => (
              <li key={moment} className="border-3 border-white bg-[#f45c36] px-10 py-6">
                <p className="text-center text-base font-bold text-white">👀 {moment}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-[#f45c36] px-5 py-16 text-black sm:px-8 md:py-24">
        <div className="mx-auto max-w-[76rem]">
          <blockquote className="mx-auto max-w-2xl text-center text-2xl font-bold leading-tight sm:text-3xl">
            “Your life is hidden with Christ in God.”
            <footer className="mt-4 text-sm font-bold uppercase tracking-[0.14em]">Colossians 3:3</footer>
          </blockquote>
        </div>
      </section>

      <section className="bg-[#edeae5] px-5 py-16 text-black sm:px-8 md:py-24">
        <div className="mx-auto max-w-[76rem]">
          <div className="flex justify-center pb-10 text-center">
            <h2 className="font-heading text-[clamp(32px,6vw,56px)] leading-tight tracking-[-0.04em]">What you&apos;ll experience</h2>
          </div>

          <div className="mt-10">
            <MemoryNotesGrid notes={memoryNotes} />
          </div>
        </div>
      </section>

      <InternshipFAQ surfaceClassName="bg-[#edeae5]" />

      <section className="flex flex-col bg-black text-white md:flex-row">
        <div className="relative aspect-5/4 w-full shrink-0 md:aspect-auto md:min-h-[44rem] md:w-1/2">
          <Image
            src="/assets/program/summer/summer-program-10.jpg"
            alt="Students gathered for a summer program session"
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="flex w-full flex-col justify-center px-8 py-20 md:w-1/2 md:px-16 md:py-28">
          <h2 className="mb-10 max-w-4xl font-heading text-[clamp(2rem,4vw,3.5rem)] uppercase leading-[1.02] text-balance">
            Strictly Students Learning Labs: Experience
          </h2>

          <div className="grid max-w-3xl gap-8 text-left">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white/70">Dates</h3>
              <p className="mt-2 text-2xl font-bold">Dec 7–13, 2026</p>
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white/70">Age</h3>
              <p className="mt-2 text-2xl font-bold">13–17</p>
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white/70">Fee</h3>
              <p className="mt-2 text-2xl font-bold">RM699</p>
              <p className="mt-1 text-sm text-white/75">Includes accommodation, meals and all materials.</p>
            </div>
          </div>

          <div className="mt-10">
            {registrationOpen ? <RegistrationDialog /> : null}
          </div>
        </div>
      </section>

      <div className="bg-[#edeae5]"><Footer /></div>
    </main>
  );
}
