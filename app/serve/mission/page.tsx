import type { Metadata } from "next";
import Footer from "@/app/components/Footer";
import Navbar from "@/app/components/Navbar";
import CTAButton from "@/app/components/CTAButton";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Mission",
  description:
    "We want to care for the most vulnerable among us. See what God can do through you when you choose to support those in need.",
};

export default function MissionPage() {
  return (
    <main className="w-full min-h-screen font-sans antialiased">
      <Navbar />
      {/* Hero Title Section */}
      <div className="py-4 px-4 relative z-10 text-center">
        <h1 className="text-5xl lg:text-5xl font-heading text-black tracking-tight">
          MISSION
        </h1>
      </div>

      {/* Bring A Light - Image Gallery */}
      <section className="w-full overflow-x-auto">
        <div className="flex flex-row min-w-max md:min-w-0">
          <Image
            src="/assets/serve/missions/bring-a-light.jpg"
            alt="Bring A Light mission"
            width={1000}
            height={562}
            className="w-[80vw] md:w-1/3 h-auto object-cover aspect-video shrink-0 md:shrink"
          />
          <Image
            src="/assets/serve/missions/bring-a-light-2.jpg"
            alt="Bring A Light mission"
            width={1000}
            height={562}
            className="w-[80vw] md:w-1/3 h-auto object-cover aspect-video shrink-0 md:shrink"
          />
          <Image
            src="/assets/serve/missions/bring-a-light-3.jpg"
            alt="Bring A Light mission"
            width={750}
            height={424}
            className="w-[80vw] md:w-1/3 h-auto object-cover aspect-video shrink-0 md:shrink"
          />
        </div>
      </section>

      {/* Bring A Light - Content */}
      <section className="w-full flex flex-col items-center justify-center px-4 py-12 md:px-8 lg:px-16 mt-8 mb-8">
        <div className="w-full max-w-2xl flex flex-col items-center gap-6 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading">
            Bring A Light
          </h2>
          <p className="text-sm md:text-lg leading-relaxed whitespace-pre-line">
            {`Light up homes in rural villages with no electricity.
Location: Pulau Berhala, Sabah
Date: 3 - 6 August
Cost: RM 400
Deadline: 28 May 2023`}
          </p>
          <CTAButton href="#tally-open=3lrK1V&tally-layout=modal">
            COUNT ME IN!
          </CTAButton>
        </div>
      </section>

      {/* Trip Up North - Image Gallery */}
      <section className="w-full overflow-x-auto">
        <div className="flex flex-row min-w-max md:min-w-0">
          <Image
            src="/assets/serve/missions/soul-christmas.png"
            alt="Soul Christmas"
            width={896}
            height={598}
            className="w-[80vw] md:w-1/2 h-auto object-cover aspect-video shrink-0 md:shrink"
          />
          <Image
            src="/assets/serve/missions/soul-kids.png"
            alt="Soul Kids"
            width={1000}
            height={1003}
            className="w-[80vw] md:w-1/2 h-auto object-cover aspect-video shrink-0 md:shrink"
          />
        </div>
      </section>

      {/* Trip Up North - Content */}
      <section className="w-full flex flex-col items-center justify-center px-4 py-12 md:px-8 lg:px-16 mt-8 mb-8">
        <div className="w-full max-w-2xl flex flex-col items-center gap-6 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading">
            Trip Up North
          </h2>
          <p className="text-sm md:text-lg leading-relaxed whitespace-pre-line">
            {`Serving other churches together!
Location : Ascent & Soul
Date : 28 June - 1 July
Cost: RM 200
Deadline: 21 May 2023`}
          </p>
          <CTAButton href="#tally-open=3xY41E&tally-layout=modal">
            COUNT ME IN!
          </CTAButton>
        </div>
      </section>

      {/* Refugee School - Image Gallery */}
      <section className="w-full overflow-x-auto">
        <div className="flex flex-row min-w-max md:min-w-0">
          <Image
            src="/assets/serve/missions/refugee-school-1.jpg"
            alt="Refugee School"
            width={1500}
            height={1125}
            className="w-[80vw] md:w-1/3 h-auto object-cover aspect-video shrink-0 md:shrink"
          />
          <Image
            src="/assets/serve/missions/refugee-school-2.jpg"
            alt="Refugee School"
            width={750}
            height={563}
            className="w-[80vw] md:w-1/3 h-auto object-cover aspect-video shrink-0 md:shrink"
          />
          <Image
            src="/assets/serve/missions/refugee-school-3.jpg"
            alt="Refugee School"
            width={750}
            height={563}
            className="w-[80vw] md:w-1/3 h-auto object-cover aspect-video shrink-0 md:shrink"
          />
        </div>
      </section>

      {/* Refugee School Title */}
      <section className="w-full flex flex-col items-center justify-center px-4 py-12 md:px-8 lg:px-16 mt-8 mb-8">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading text-center">
          Refugee School
        </h2>
      </section>

      {/* Refugee School - Roles Section */}
      <section className="w-full flex flex-col items-center justify-center px-4 py-8 md:px-8 lg:px-16 mb-8">
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* In-class Teacher */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xl md:text-2xl font-bold  font-heading">
              In-class Teacher
            </h3>
            <p className="text-sm md:text-lg leading-relaxed">
              Commit 1-2 hours a week for a year to teach subjects such as
              reading &amp; writing.
            </p>
          </div>

          {/* Substitute Teacher */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xl md:text-2xl font-bold  font-heading">
              Substitute Teacher
            </h3>
            <p className="text-sm md:text-lg leading-relaxed">
              Fill-in and teach the lesson plans that have been left by the
              absent teacher.
            </p>
          </div>

          {/* Extra-curriculum */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xl md:text-2xl font-bold  font-heading">
              Extra-curriculum
            </h3>
            <p className="text-sm md:text-lg leading-relaxed">
              Commit 1 hour a week for 2-3 months to conduct extra-curricular
              activities.
            </p>
          </div>
        </div>
      </section>

      {/* Serve Now Section */}
      <section className="w-full flex flex-col items-center justify-center px-4 py-12 md:px-8 lg:px-16 mt-8 mb-8">
        <div className="w-full max-w-2xl flex flex-col items-center gap-6 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading">
            Serve Now
          </h2>
          <p className="text-sm md:text-lg leading-relaxed max-w-xl">
            We want to care for the most vulnerable among us. It&apos;s not just
            about meeting local needs, but also building relationships with
            those on the margins. See what God can do through you when you
            choose to support and stand for those who are in need.
          </p>
          <CTAButton href="#tally-open=wLpvNz&tally-layout=modal">
            SIGN ME UP!
          </CTAButton>
        </div>
      </section>

      {/* Back Navigation */}
      <section className="w-full flex items-center justify-start px-4 py-8 md:px-8 lg:px-16 mb-8">
        <a
          href="/serve/ss"
          className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors font-bold text-lg"
        >
          <div className="w-6 h-6 flex items-center justify-center">
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 1024 1024"
              xmlns="http://www.w3.org/2000/svg"
              className="fill-current"
            >
              <path d="M609.408 149.376L277.76 489.6a32 32 0 0 0 0 44.672l331.648 340.352a29.12 29.12 0 0 0 41.728 0a30.592 30.592 0 0 0 0-42.752L339.264 511.936l311.872-319.872a30.592 30.592 0 0 0 0-42.688a29.12 29.12 0 0 0-41.728 0" />
            </svg>
          </div>
          <span>SS</span>
        </a>
      </section>
      <Footer />
    </main>
  );
}
