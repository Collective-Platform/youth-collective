import Image from "next/image";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import InternshipFAQ from "@/app/program/InternshipFAQ";
import ProgramButton from "./ProgramButton";
import FeatureCards from "./FeatureCards";
import ProgramHighlights from "./ProgramHighlights";
import RegistrationDialog from "./RegistrationDialog";

const registrationOpen = true;

export default function InternshipContent() {
  return (
    <main className="font-[Inter,sans-serif] bg-black">
      <div className="min-h-screen flex flex-col">
        <div className="bg-white">
          <Navbar />
        </div>

        <section className="relative flex min-h-svh flex-1 overflow-hidden bg-[#f45c36] text-white md:min-h-0">
          <p
            aria-hidden="true"
            className="pointer-events-none absolute -right-[0.18em] top-1/2 hidden -translate-y-1/2 select-none font-heading text-[clamp(10rem,27vw,28rem)] leading-none text-black/[0.08] lg:block"
          >
            GO
          </p>
          <div className="relative mx-auto grid w-full max-w-7xl items-stretch gap-10 px-6 py-10 sm:px-10 md:min-h-[80vh] md:grid-cols-[minmax(0,1fr)_minmax(18rem,0.72fr)] md:gap-12 md:px-16 md:py-16 lg:gap-20">
            <div className="flex flex-col justify-center py-8 md:py-12">
              <div className="mb-8 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-black sm:text-sm">
                <span className="block size-3 bg-black" />
                Strictly Students Learning Labs: Experience
              </div>
              <h1 className="max-w-3xl text-[clamp(2.75rem,7.2vw,7.25rem)] font-heading leading-[0.84] tracking-[-0.035em] uppercase text-balance">
                Step into an <span className="text-black">experience.</span>
              </h1>
              <p className="mt-8 max-w-xl text-base font-bold leading-relaxed text-white md:text-lg">
                A week away from distractions to experience God for yourself (while having fun).
              </p>
              <div className="mt-10 grid max-w-2xl grid-cols-[repeat(auto-fit,minmax(8rem,1fr))] gap-x-8 gap-y-5 border-y-2 border-black py-5 text-left">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-black">Dates</p>
                  <p className="mt-1 text-lg font-bold">Dec 7–13, 2026</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-black">Fee</p>
                  <p className="mt-1 text-lg font-bold">RM699</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-black">Age</p>
                  <p className="mt-1 text-lg font-bold">13–17</p>
                </div>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-5">
                <ProgramButton
                  href="#register"
                  size="sm"
                  variant="ink"
                  registrationOpen={registrationOpen}
                >
                  Apply now <span aria-hidden="true">↘</span>
                </ProgramButton>
                <p className="text-sm font-medium text-black/75 md:text-base">
                  *Registration closes on May 20, 2026
                </p>
              </div>
            </div>

            <div className="relative order-first min-h-92 overflow-hidden border-2 border-black bg-black md:order-none md:min-h-full">
              <Image
                src="/assets/internship/internship_dance.jpg"
                alt="Students enjoying a Strictly Students program"
                fill
                priority
                sizes="(min-width: 768px) 34vw, 100vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 text-white sm:p-6">
                <p className="max-w-36 text-xs font-bold uppercase leading-snug tracking-[0.14em]">
                  A different kind of school holiday
                </p>
                <span aria-hidden="true" className="font-heading text-5xl leading-none sm:text-6xl">
                  !
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <ProgramHighlights />

      {/* Does This Sound Familiar Section */}
      <section className="bg-[#0c0c0c] text-white py-20 md:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-heading uppercase tracking-wide mb-12 text-white">
            Does this sound like you?
          </h3>

          <div className="space-y-6 py-3 text-center max-w-2xl mx-auto">
            {[
              "👀 You've tried to change before. It didn't stick.",
              "👀 You know you’re called to more, but you don’t know where to start.",
              "👀 You are hungry for what's next.",
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-4 bg-[#f45c36] border-3 border-white px-10 py-6"
              >
                <p className="text-base text-center font-bold text-white">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f45c36] px-4 py-24 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-white font-bold uppercase text-2xl mb-4">
            &quot;Your life is hidden with Christ in God.&quot;
          </p>
          <div className="w-px h-8 bg-white mx-auto my-4"></div>
          <p className="mb-4 text-sm uppercase text-white/90">Colossians 3:3</p>
        </div>
      </section>

      {/* Your Created for More */}
      <section className="bg-white text-black py-20 md:py-24 px-4 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-[clamp(32px,6vw,64px)] font-black uppercase text-center mb-8 leading-tight">
            WHAT YOU&apos;LL EXPERIENCE
          </h2>

          {/* Feature Cards */}
          <FeatureCards />
        </div>
      </section>

      {/* FAQ Section */}
      <InternshipFAQ />

      {/* Summer Program CTA Section */}
      <section id="register" className="flex flex-col bg-black text-white md:flex-row">
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
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.16em] text-[#f45c36]">
            7–13 December 2026
          </p>
          <h2 className="mb-10 max-w-4xl text-[clamp(2rem,4vw,3.5rem)] font-heading leading-[1.02] uppercase text-balance">
            Strictly Students Learning Labs: Experience
          </h2>

          <div className="grid max-w-3xl gap-8 text-left sm:grid-cols-3">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white/70">Dates</h3>
              <p className="mt-2 text-2xl font-bold">
                Dec 7–13, 2026
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white/70">Age</h3>
              <p className="mt-2 text-2xl font-bold">13–17</p>
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white/70">Fee</h3>
              <p className="mt-2 text-2xl font-bold">RM699</p>
              <p className="mt-1 text-sm text-white/75">
                Stripe payment • Instalments available
              </p>
            </div>
          </div>

          <div className="mt-10">
            {registrationOpen ? (
              <RegistrationDialog />
            ) : (
              <ProgramButton href="#register" size="sm" registrationOpen={false}>
                Registration Closed
              </ProgramButton>
            )}
          </div>
        </div>
      </section>

      <div className="bg-white">
        <Footer />
      </div>
    </main>
  );
}
