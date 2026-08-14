import Image from "next/image";
import FeatureCards from "./components/FeatureCards";
import FAQ from "./components/FAQ";
import HeroGallery from "./components/HeroGallery";
import RegistrationDialog from "./components/RegistrationDialog";

/*
 * THESIS: The programme is introduced as a future memory wall—an accumulating record of the week teens will make together.
 * OWN-WORLD: Orange printed-paper fields, black marker-like type, white caption strips, honest photo crops, and hard black rules.
 * STORY: Find yourself in the moments first, then understand the programme, practical details, and one clear way to ask about a place.
 * FIRST VIEWPORT: A four-part pinboard opens with a living photo, huge “meet your people” message, and the date pinned at the edge.
 * FORM: A responsive memory wall: big moments, clipped notes, proof photos, then an unmissable practical close.
 */

const registrationOpen = true;

const familiarMoments = [
  "You've tried to change before. It didn't stick.",
  "You know you’re called to more, but you don’t know where to start.",
  "You are hungry for what's next.",
] as const;

export default function LearningLabsExperience() {
  return (
    <main className="min-h-screen bg-black font-[Inter,sans-serif] text-black">
      <section aria-label="Learning Labs introduction" className="flex min-h-svh flex-col md:min-h-0">
        <div className="relative my-3 bg-cover bg-center px-4 py-2 text-white sm:my-5">
          <div className="absolute inset-0 bg-[#f45c36]"></div>
          <div className="relative mx-auto max-w-4xl text-center">
            <p className="text-balance text-sm font-bold uppercase text-black md:text-lg">
              {"God is making all things new, "}<br className="md:hidden" />starting with you.
            </p>
          </div>
        </div>

        <div className="flex flex-1 bg-black px-3 pb-3 text-black sm:px-5 sm:pb-5 md:pb-12">
          <div className="mx-auto w-full max-w-[92rem] overflow-hidden bg-[#f45c36]">
            <div className="flex h-full min-h-[31rem] flex-col justify-center border-b-2 border-black p-6 sm:p-8 md:min-h-[36rem] md:items-center md:px-10 md:py-16 md:text-center lg:min-h-[calc(100svh-12rem)]">
            <h1 className="mt-7 max-w-3xl font-heading text-[clamp(2rem,4.5vw,3.5rem)] uppercase leading-[1] tracking-[-0.04em] sm:mt-8 md:text-balance">
              Learning Labs: Experience
            </h1>
            <p className="mt-6 max-w-md text-base font-semibold leading-snug sm:mt-7 sm:text-lg">
              A week away from distractions to experience God for yourself (while having fun).
            </p>
            <dl className="mt-8 grid w-full max-w-2xl grid-cols-2 gap-3 border-y-2 border-black py-4 text-base sm:gap-5 sm:text-lg md:grid-cols-3">
              <div>
                <dt className="text-sm font-medium">Dates</dt>
                <dd className="mt-1 font-bold">6–12 Dec 2026</dd>
              </div>
              <div>
                <dt className="text-sm font-medium">Age</dt>
                <dd className="mt-1 font-bold">13–17</dd>
              </div>
              <div className="col-span-2 md:col-span-1">
                <dt className="text-sm font-medium">Fee</dt>
                <dd className="mt-1 font-bold">RM699</dd>
                <p className="mt-1 text-xs font-semibold leading-tight opacity-50 sm:text-sm">
                  (RM799 after 19 October)
                </p>
              </div>
            </dl>
            {registrationOpen ? (
              <div className="mt-8 flex flex-col items-start gap-2 md:items-center">
                <RegistrationDialog triggerClassName="inline-flex w-fit border-2 border-black bg-black px-6 py-4 text-sm font-bold tracking-[0.08em] text-white transition-colors hover:bg-[#edeae5] hover:text-black focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-black" />
                <p className="mt-1 text-xs font-semibold leading-tight opacity-50 sm:text-sm">
                  Registration closes 15 November
                </p>
              </div>
            ) : null}
          </div>
          </div>
        </div>
      </section>

      <section aria-label="Programme photo gallery" className="bg-black px-3 pb-3 text-black sm:px-5 sm:pb-5">
        <div className="mx-auto max-w-[92rem] overflow-hidden">
          <HeroGallery />
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

      <section className="relative text-white py-10 md:py-18 px-4 bg-cover bg-center">
        <div className="absolute inset-0 bg-[#f45c36]"></div>
        <div className="relative max-w-4xl mx-auto text-center">
          <p className="text-white font-bold uppercase text-lg md:text-2xl mb-4">
            &quot;Your life is hidden with Christ in God.&quot;
          </p>
          <div className="w-px h-4 md:h-8 bg-white mx-auto my-4"></div>
          <p className="text-white/90 text-sm uppercase">Colossians 3:3</p>
        </div>
      </section>

      <section className="bg-[#edeae5] px-5 py-16 text-black sm:px-8 md:py-24">
        <div className="mx-auto max-w-[76rem]">
          <div className="mb-8 flex justify-center text-center">
            <h2 className="font-heading text-[clamp(32px,6vw,56px)] leading-tight tracking-[-0.04em]">What you&apos;ll experience</h2>
          </div>

          <div>
            <FeatureCards />
          </div>
        </div>
      </section>

      <FAQ surfaceClassName="bg-[#edeae5]" />

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
              <p className="mt-2 text-2xl font-bold">Dec 6–12, 2026</p>
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white/70">Age</h3>
              <p className="mt-2 text-2xl font-bold">13–17</p>
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white/70">Fee</h3>
              <div className="flex items-end gap-2 mt-2 mt-2">
              <p className="text-2xl font-bold">RM699</p>
              <p className="text-sm text-white/75 mb-1">(RM799 after 19 October)</p>
              </div>
              <p className="mt-1 text-sm text-white/75">Includes accommodation, meals and all materials.</p>
            </div>
          </div>

          <div className="mt-10">
            {registrationOpen ? (
              <>
                <RegistrationDialog />
                <p className="mt-4 text-sm leading-tight opacity-75 sm:text-sm">
                  Registration closes 15 November
                </p>
              </>
            ) : null}
          </div>
        </div>
      </section>

    </main>
  );
}
