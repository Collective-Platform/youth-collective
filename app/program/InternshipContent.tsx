"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import InternshipFAQ from "@/app/program/InternshipFAQ";
import ProgramButton from "./ProgramButton";

const skillSetItems = [
  {
    title: "Communication",
    desc: "Frustrated that people don't get you? Speak clearly. Speak authentically. Be the real you, not the nervous one trying to impress.",
    image: "/assets/Youth_camp_1_D55hasyvyAkcoqlthwZBl.jpg",
  },
  {
    title: "Finance",
    desc: "Learn to manage money as someone who trusts God, not someone who's just trying to survive.",
    image: "/assets/DSCF3714i_0z_zfBPvg8MR_d-MTR3t7.jpg",
  },
  {
    title: "Time",
    desc: "The goal isn't to cram more in. It's to clear space for what actually matters. Build rhythms that sustain the life you're stepping into.",
    image: "/assets/Touch_Grass_KhYgYu3ocGH_CkMzr8y6F.jpg",
  },
];

function SkillSetSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: { offset: { x: number }; velocity: { x: number } },
  ) => {
    const threshold = 50;
    const velocity = info.velocity.x;
    const offset = info.offset.x;

    if (offset < -threshold || velocity < -500) {
      setCurrentIndex((prev) => Math.min(prev + 1, skillSetItems.length - 1));
    } else if (offset > threshold || velocity > 500) {
      setCurrentIndex((prev) => Math.max(prev - 1, 0));
    }
  };

  return (
    <div className="relative overflow-hidden">
      <div
        ref={containerRef}
        className="w-full md:w-[80%] mx-auto overflow-hidden"
      >
        <motion.div
          className="flex"
          animate={{ x: `-${currentIndex * 100}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          onDragEnd={handleDragEnd}
        >
          {skillSetItems.map((item, i) => (
            <div key={i} className="w-full flex-shrink-0 px-2 md:px-4">
              <div className="relative aspect-[4/5] md:aspect-[16/9] overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/50" />
                <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12">
                  <h3 className="text-2xl md:text-4xl font-black uppercase mb-3 text-white">
                    {item.title}
                  </h3>
                  <p className="text-white/80 text-sm md:text-lg leading-relaxed max-w-xl">
                    {item.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Navigation dots */}
      <div className="flex justify-center gap-2 mt-6">
        {skillSetItems.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              i === currentIndex ? "bg-[#FF6B35] w-8" : "bg-white/40"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Arrow navigation - desktop only */}
      <button
        onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
        className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 items-center justify-center transition-colors"
        aria-label="Previous slide"
        disabled={currentIndex === 0}
      >
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <button
        onClick={() =>
          setCurrentIndex((prev) =>
            Math.min(prev + 1, skillSetItems.length - 1),
          )
        }
        className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 items-center justify-center transition-colors"
        aria-label="Next slide"
        disabled={currentIndex === skillSetItems.length - 1}
      >
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  );
}

const MarqueeSolid = ({
  text,
  reverse = false,
  containerClassName = "py-6 bg-[#0a34df] border-t-3 border-b-3 border-white",
  textClassName = "text-[clamp(16px,3vw,24px)] font-bold uppercase mx-8 text-white",
  duration = reverse ? 30 : 80,
}: {
  text: string;
  reverse?: boolean;
  containerClassName?: string;
  textClassName?: string;
  duration?: number;
}) => (
  <div className={`overflow-hidden whitespace-nowrap ${containerClassName}`}>
    <div
      className="inline-flex"
      style={{
        animation: `${reverse ? "marquee-reverse" : "marquee"} ${duration}s linear infinite`,
      }}
    >
      {[...Array(12)].map((_, i) => (
        <span key={i} className={textClassName}>
          {text}
        </span>
      ))}
    </div>
  </div>
);

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

function FeatureCards() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  return (
    <div className="grid md:grid-cols-2 gap-4 mb-16">
      {featureItems.map((item, i) => {
        const isExpanded = expandedIndex === i;
        return (
          <div
            key={i}
            onClick={() => setExpandedIndex(isExpanded ? null : i)}
            className={`cursor-pointer bg-[#ff6b35] p-6 transition-all duration-300 ${
              isExpanded ? "md:col-span-2" : ""
            }`}
          >
            <h3 className="text-xl font-bold text-white text-center">
              {item.title}
            </h3>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                isExpanded ? "max-h-40 mt-4 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <p className="text-white text-center leading-relaxed">
                {item.desc}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function InternshipContent() {
  return (
    <main className="font-[Inter,sans-serif] bg-black">
      <style jsx global>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        @keyframes marquee-reverse {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }
        .animate-marquee {
          animation: marquee 80s linear infinite;
        }
        .animate-marquee-reverse {
          animation: marquee-reverse 30s linear infinite;
        }
        @keyframes slideDown {
          from {
            height: 0;
          }
          to {
            height: var(--radix-accordion-content-height);
          }
        }
        @keyframes slideUp {
          from {
            height: var(--radix-accordion-content-height);
          }
          to {
            height: 0;
          }
        }
        .animate-slideDown {
          animation: slideDown 300ms ease-out;
        }
        .animate-slideUp {
          animation: slideUp 300ms ease-out;
        }
      `}</style>

      <div className="min-h-screen flex flex-col">
        <div className="bg-white">
          <Navbar />
        </div>

        {/* Hero Section */}
        <section className="relative bg-[#0a34df] text-white overflow-hidden min-h-svh md:min-h-0 md:flex-1 flex flex-col">
          <div className="flex flex-col md:flex-row flex-1 md:min-h-[80vh] items-center md:items-stretch">
            <MarqueeSolid
              text="God is making all things new — starting from you."
              containerClassName="py-6"
              textClassName="text-[clamp(16px,3vw,24px)] font-bold uppercase mx-8 text-white"
            />
            {/* Left - Text Content */}
            <div className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-16 pt-4 pb-12 md:py-16">
              <h1 className="text-[clamp(36px,5vw,56px)] font-heading uppercase mb-8 leading-10">
                GET READY FOR THE BEST OF YOUR SCHOOL HOLIDAY
              </h1>

              <p className="text-md font-bold w-62.5 text-white mb-12">
                The week where you won’t just dream about your level up —{" "}
                <br></br>you’ll step into it.
              </p>

              <div className="mb-8">
                <ProgramButton href="#register" size="sm">
                  Apply Now 🚀
                </ProgramButton>
              </div>
              <p className="text-white text-sm md:text-base font-medium leading-tight">
                *Registration closes on March 8, 2026
              </p>
            </div>

            {/* Right - Image */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-[#ecebe4]">
              <div className="relative aspect-3/4 w-full max-w-125">
                <Image
                  src="/assets/internship/internship_dance.jpg"
                  alt="Youth Program"
                  fill
                  className="object-cover"
                />
                <p className="absolute bottom-4 right-4 text-white/90 text-md md:text-base text-right max-w-60 md:max-w-70 font-bold">
                  &quot;See, I am doing a new thing! Now it springs up; do you
                  not perceive it?&quot; — Isaiah 43:19
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Apply Today Marquee */}
      <MarqueeSolid
        text='"See, I am doing a new thing! Now it springs up; do you not perceive it?" — Isaiah 43:19'
        containerClassName="py-6 bg-[#FF6B35] border-t-3 border-b-3 border-white"
      />

      {/* Does This Sound Familiar Section */}
      <section className="bg-[#0c0c0c] text-[#ecebe4] py-20 md:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-heading uppercase tracking-wide mb-12 text-white">
            Does this sound like you?
          </h3>

          <div className="space-y-6 py-3 text-center max-w-2xl mx-auto">
            {[
              "👀 You've tried to change before. It didn't stick.",
              "👀 You're tired of trying harder and failing.",
              "👀 You know you’re called to more, but you don’t know where to start.",
              "👀 You are hungry for what's next",
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-4 group bg-[#0a34df] border-3 border-white px-10 py-6"
              >
                <p className="text-base text-center font-bold capitalized text-white">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Isn't Another Altar Call Section */}
      <section
        className="relative text-white py-24 px-4 bg-cover bg-center"
        style={{ backgroundImage: "url('/assets/lrt.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-4xl mx-auto text-center">
          <p className="text-white uppercase text-3xl font-bold mb-4">
            &quot;Your life is hidden with Christ in God.&quot;
          </p>
          <div className="w-px h-8 bg-white mx-auto my-4"></div>
          <p className="text-white/80 uppercase mb-4">Colossians 3:3</p>
        </div>
      </section>

      {/* Your Created for More */}
      <section className="bg-[#ecebe4] text-black py-24 px-4 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-[clamp(32px,6vw,64px)] font-black uppercase text-center mb-8 leading-tight">
            WHAT YOU&apos;LL EXPERIENCE
          </h2>

          {/* Feature Cards */}
          <FeatureCards />
        </div>
      </section>

      {/* Apply Today Marquee */}
      <MarqueeSolid text="Your biggest limitation is your old identity." />

      {/* Skill-set Section */}
      <section className="bg-[#0c0c0c] text-white py-24">
        <div className="max-w-6xl mx-auto px-4 mb-8">
          <h2 className="text-[clamp(32px,6vw,64px)] font-black uppercase text-center mb-4">
            Skill-sets
          </h2>
          <p className="text-sm text-center font-bold mb-12">
            Becoming who you are — practically
          </p>
        </div>
        <SkillSetSlider />
        <div className="text-center mt-12">
          <ProgramButton href="#register">I Want In!! 🔥</ProgramButton>
        </div>
      </section>

      {/* FAQ Section */}
      <InternshipFAQ />

      {/* Summer Program CTA Section */}
      <section
        id="register"
        className="bg-[#0c0c0c] text-white min-h-screen flex flex-col md:flex-row"
      >
        {/* Left - Image */}
        <div className="w-full md:w-[30%] h-[50vw] md:h-screen relative shrink-0">
          <Image
            src="/assets/DSCF3714i_0z_zfBPvg8MR_d-MTR3t7.jpg"
            alt="Collective Youth Summer Program"
            className="w-full h-full object-cover"
            width={300}
            height={400}
          />
        </div>

        {/* Right - Content */}
        <div className="flex-1 flex flex-col justify-center items-center md:items-start px-8 md:px-16 py-16 md:py-0">
          <h1 className="text-[clamp(32px,5vw,56px)] leading-10 font-black uppercase mb-8 text-left">
            Collective Youth <br /> Summer Program
          </h1>

          <div className="space-y-6 text-left uppercase">
            <div>
              <h4 className="text-sm tracking-wider">Dates:</h4>
              <h2 className="text-xl md:text-4xl font-bold">
                March 23 - 29, 2026
              </h2>
            </div>

            <div>
              <h4 className="text-sm tracking-wider">Location:</h4>
              <h2 className="text-xl md:text-4xl font-bold">Collective</h2>
            </div>

            <div>
              <h4 className="text-sm tracking-wider">Fee:</h4>
              <h2 className="text-xl md:text-4xl font-bold">RM599</h2>
              <p className=" text-white/80 text-sm capitalize">
                Includes accommodation, meals and all materials.
              </p>
            </div>
          </div>

          <div className="mt-10">
            <ProgramButton href="#register">APPLY TODAY</ProgramButton>
          </div>

          <p className="mt-6 text-white/70 text-sm">
            *Registration closes on March 8, 2026
          </p>
        </div>
      </section>

      <div className="bg-white">
        <Footer />
      </div>
    </main>
  );
}
