import type { Metadata } from "next";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Image from "next/image";
import FAQSection from "./FAQSection";
import { EpisodeCard, type Episode } from "@/app/alpha/episode-card";

export const metadata: Metadata = {
  title: "Alpha Youth",
  description:
    "An 8 week journey to explore life, faith, and meaning, no judgment, no pressure, just real conversations.",
};

// Episode data - matching original Webstudio content exactly
const episodes: Episode[] = [
  {
    number: 1,
    title: "Welcome to the conversation",
    date: "May 4 | Stage 8 | 1PM - 3PM",
    variant: "blue" as const,
  },
  {
    number: 2,
    title: "Jesus is...",
    date: "May 18 | Stage 8 | 1PM - 3PM",
    variant: "lime" as const,
  },
  {
    number: 3,
    title: "What does real love look like?",
    date: "June 1 | Stage 8 | 1PM - 3PM",
    variant: "blue" as const,
  },
  {
    number: 4,
    title: "Why would I want a relationship with God?",
    date: "June 15 | Stage 8 | 1PM - 3PM",
    variant: "lime" as const,
  },
  {
    number: 5,
    title: "What does a relationship with God look like?",
    date: "June 22 | Stage 8 | 1PM - 3PM",
    variant: "blue" as const,
  },
  {
    number: 6,
    title: "Who is the holy spirit?",
    date: null,
    alphaWeekend: true,
    variant: "lime" as const,
  },
  {
    number: 7,
    title: "how can i be filled with the holy spirit?",
    date: null,
    alphaWeekend: true,
    variant: "blue" as const,
  },
  {
    number: 8,
    title: "how does god help us overcome evil?",
    date: null,
    alphaWeekend: true,
    variant: "lime" as const,
  },
  {
    number: 9,
    title: "does god heal today?",
    date: "July 13 | Stage 8 | 1PM - 3PM",
    variant: "blue" as const,
  },
  {
    number: 10,
    title: "what happens next?",
    date: "July 20 | Stage 8 | 1PM - 3PM",
    variant: "lime" as const,
    isBold: true,
  },
];

export default function AlphaPage() {
  return (
    <main className="font-[Inter,sans-serif]">
      <Navbar />
      {/* Hero Section - Purple background #5038E1 */}
      <section className="bg-[rgb(80,56,225)] min-h-[80vh] flex flex-col items-center justify-center text-center pt-5 pb-15 px-4 relative overflow-hidden">
        {/* Decorative images */}
        <Image
          src="/assets/alpha/Icon_1_a-hU9tJFz_p_ks0lpsvkQ.png"
          alt=""
          width={300}
          height={300}
          className="absolute left-0 bottom-0 w-75 pointer-events-none"
        />
        <Image
          src="/assets/alpha/Icon_3_aW_gDKiW0gTfDJErmdojF.png"
          alt=""
          width={250}
          height={250}
          className="absolute top-0 left-0 w-62.5 pointer-events-none"
        />
        <Image
          src="/assets/alpha/Icon_2_EbPOWXD_WcapVhJTZZjdh.png"
          alt=""
          width={350}
          height={350}
          className="absolute bottom-0 right-0 w-87.5 pointer-events-none"
        />
        {/* Main content */}
        <Image
          src="/assets/alpha/What_s_on_your_mind_aZKPaQ0byEEFmMxIO3VG3.png"
          alt="What's on your mind?"
          width={350}
          height={350}
          className="w-[60%] max-w-150 mb-4"
        />
        <p className="text-white font-[Inter,sans-serif] text-center w-[60%] max-w-150 mb-4">
          An 8 week journey to explore life, faith, and meaning—no judgment, no
          pressure, just real conversations.
        </p>
        <p className="text-[rgb(193,254,1)] font-bold font-[Inter,sans-serif] text-center">
          Sunday | 1pm - 3pm | Stage 8
        </p>
      </section>

      {/* What is Alpha Section */}
      <section className="bg-black text-white flex flex-col items-center pt-8 pb-15 px-4">
        <div className="w-full max-w-300">
          <div className="flex flex-col md:flex-row gap-15">
            {/* Left content */}
            <div className="flex flex-col items-start justify-center gap-4 flex-1 min-w-0">
              <h2 className="text-[rgb(193,254,1)] text-start font-black text-[60px] uppercase leading-none m-0">
                What is Alpha?
              </h2>
              <p className="text-start font-black text-white m-0">
                Let&apos;s talk.{" "}
                <span className="text-[rgb(254,34,236)]">No judgment,</span>{" "}
                <span className="text-[rgb(255,0,135)]">just real convos.</span>
              </p>
              <p className="text-white font-[Inter,sans-serif] text-start text-base m-0">
                Alpha is a 8-week journey designed for you to explore big
                questions about life and faith in an open, no-pressure
                environment. Expect food, fun, and open discussions where every
                opinion is welcome.
              </p>
              <div className="flex flex-col gap-2 mt-4">
                <p className="text-white font-[Inter,sans-serif] text-start text-base m-0">
                  Time: <span className="text-[rgb(193,254,1)]">1PM-3PM</span>
                </p>
                <p className="text-white font-[Inter,sans-serif] text-start text-base m-0">
                  Location:{" "}
                  <span className="text-[rgb(193,254,1)]">Stage 8</span>
                </p>
              </div>
              <p className="text-white font-[Inter,sans-serif] text-start text-base m-0">
                Dates: <span className="text-[rgb(193,254,1)]">May 4, 18,</span>{" "}
                <span className="text-[rgb(254,34,236)]">June 1, 15, 22,</span>{" "}
                <span className="text-[rgb(255,0,135)]">July 13, 20</span>
              </p>
            </div>
            {/* Right content - phone image */}
            <div>
              <Image
                src="/assets/alpha/Alpha_Phone_5OzpZnWtVovGiIgK4Q2bq.jpg"
                alt="Alpha Youth"
                width={400}
                height={120}
              />
            </div>
          </div>

          {/* Sticker and group photo */}
          <div className="relative mt-8">
            <Image
              src="/assets/alpha/Alpha_youth_APpvBuyart-uJ7tTaggeT.png"
              alt="Alpha Youth Sticker"
              id="sticker"
              width={100}
              height={100}
              className="absolute -left-25 -bottom-25 w-30 md:w-75 z-10 rotate-[5deg] object-contain"
            />
            <Image
              src="/assets/alpha/SS_yw0v7rd-kjP80pPAj2fD-.jpg"
              alt="Alpha Youth Group"
              width={500}
              height={300}
              className="w-full aspect-video rounded-lg object-cover"
            />
          </div>

          {/* What to expect section */}
          <div className="flex flex-col items-center mt-16">
            <p className="text-white font-[Inter,sans-serif] text-center text-base mb-8">
              Here&apos;s what to expect in each session:
            </p>
            <div className="flex flex-row flex-wrap justify-center gap-15">
              <div className="flex flex-col items-center gap-2">
                <Image
                  src="/assets/alpha/Eat_Together_yLb0B-bZytfZQyPL7UkX_.png"
                  alt="Eat Together"
                  width={120}
                  height={120}
                />
                <p className="text-[rgb(193,254,1)] font-bold font-[Inter,sans-serif] text-center m-0">
                  Eat Together
                </p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Image
                  src="/assets/alpha/Learn_Together_G3V1RjD1RPQhkkdcJFYxO.png"
                  alt="Learn Together"
                  width={120}
                  height={120}
                />
                <p className="text-[rgb(254,34,236)] font-bold font-[Inter,sans-serif] text-center m-0">
                  Learn Together
                </p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Image
                  src="/assets/alpha/Discuss_Together_h9SUQIlfJFNXWRqDjsw9q.png"
                  alt="Discuss Together"
                  width={120}
                  height={120}
                />
                <p className="text-[rgb(255,0,135)] font-bold font-[Inter,sans-serif] text-center m-0">
                  Discuss Together
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Episode List Section */}
      <section className="bg-black flex flex-col items-center px-4 pb-15">
        <h2 className="text-white text-center font-black text-[60px] uppercase leading-none mb-8">
          Episode List
        </h2>
        <div className="flex overflow-x-auto gap-4 w-full pb-4 snap-x">
          <div className="min-w-10 pointer-events-none" aria-hidden="true" />
          {episodes.map((episode) => (
            <EpisodeCard key={episode.number} episode={episode} />
          ))}
        </div>
        <div className="flex items-center justify-center mt-8">
          <a
            href="#register"
            className="bg-[rgb(193,254,1)] text-[rgb(255,0,135)] font-[Inter,sans-serif] font-bold uppercase py-2.5 px-6 rounded-[10px] no-underline"
          >
            Sign Up for Alpha Getaway
          </a>
        </div>
      </section>

      {/* Be a Sponsor Section - Purple background */}
      <section className="bg-[rgb(80,56,225)] flex flex-col items-center py-15 px-4">
        <h2 className="text-[rgb(193,254,1)] text-center font-black text-[60px] uppercase leading-none mb-8">
          Be a Sponsor
        </h2>
        <div className="flex justify-center w-full">
          <div className="bg-white text-[rgb(80,56,225)] rounded-[10px] flex flex-col items-center gap-4 p-8 max-w-150 w-full shadow-lg">
            <h3 className="text-inherit font-black text-center uppercase m-0">
              Sponsors
            </h3>
            <p className="text-inherit font-[Inter,sans-serif] text-center text-base m-0">
              Want to make a difference?
              <br />
              <br />
              Become a sponsor to support our youth! Your giving helps provide
              meals for weekly sessions and makes Alpha Weekend Getaway
              accessible to everyone.
              <br />
              <br />
              Every contribution makes a difference.
              <br />
              Thank you for your generosity and heart to invest in the next
              generation!
            </p>
            <a
              href="https://buy.stripe.com/7sI8z98F93yIgtW28t"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[rgb(193,254,1)] text-[rgb(80,56,225)] font-[Inter,sans-serif] font-bold uppercase py-2.5 px-6 rounded-[10px] no-underline"
            >
              Be a Sponsor
            </a>
          </div>
        </div>
      </section>

      <FAQSection />
      <Footer />
    </main>
  );
}
