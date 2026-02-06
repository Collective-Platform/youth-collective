import type { Metadata } from "next";
import Link from "next/link";
import CTAButton from "../components/CTAButton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import TaglineBanner from "../components/TaglineBanner";
import Happenings from "../components/Happenings";

export const metadata: Metadata = {
  title: "Teens",
  description:
    "We want to see teens discover who they are in Jesus and live with purpose.",
};

export default function TeensPage() {
  return (
    <main className="antialiased font-sans">
      <Navbar />

      {/* Hero Content */}
      <div className="relative z-10 text-center">
        <h1 className="text-5xl lg:text-5xl font-heading text-black tracking-tight">
          TEENS
        </h1>
      </div>

      {/* Age & Description */}
      <section className="py-4 px-4 text-center max-w-4xl mx-auto">
        <p className="text-sm md:text-lg text-gray-600 mb-4">
          (14-17 years old)
        </p>
        <p className="text-sm md:text-lg text-gray-800">
          We want to see teens discover who they are in Jesus and live with
          purpose.
        </p>
      </section>

      <TaglineBanner imageSrc="/assets/teens/worship.jpg" justify="left">
        Discover who you are in Jesus.
      </TaglineBanner>

      {/* Gather on Sundays Section */}
      <section className="py-4 md:py-16 px-4 max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-heading mb-6">
          Gather on Sundays
        </h2>

        <p className="text-sm md:text-lg  mb-6">
          Every Sunday we gather together to meet the One who loves us deeply,
          create space to hear from Him and pray for one another. It is in these
          moments that God meets us where we are at.
        </p>

        <CTAButton href="/rockzone">ROCK ZONE</CTAButton>
      </section>

      {/* Experience Youth Section */}
      {/* <section className="py-4 md:py-16 px-4 max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-heading mb-6">
          Experience Youth
        </h2>

        <p className="text-sm md:text-lg  mb-4">
          Growing up can be all kinds of awkward but this is where you can come
          as you are. It is a time for ALL youth to meet up, grow in faith, and
          have fun. This takes place on the 4th Sunday of each month. Don&apos;t
          come alone, bring a friend!
        </p>

        <p className="text-sm md:text-lg  mb-2">
          <strong>Time:</strong> 2:00 PM - 3:30 PM
        </p>

        <p className="text-sm md:text-lg ">
          <strong>Location:</strong> Upper Room
        </p>
      </section> */}

      <TaglineBanner imageSrc="/assets/teens/step-into.jpg" justify="right">
        Step into your part of God&apos;s story.
      </TaglineBanner>

      {/* Getting Baptized Section */}
      <section className="py-4 md:py-16 px-4 max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-heading mb-6">
          Getting Baptized
        </h2>

        <p className="text-sm md:text-lg  mb-6">
          Jesus calls us to a new different life and it starts with baptism.
          There will be a three-week course to walk you through this new
          adventure with God. If you are a follower of Jesus and have yet to get
          baptized, we encourage you to take that step.
        </p>

        <CTAButton href="#tally-open=w4rXRo&tally-layout=modal&tally-overlay=1">
          ENTER INTO WATER
        </CTAButton>
      </section>

      {/* Give Section */}
      <section className="py-4 md:py-16 px-4 max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-heading mb-6">Give</h2>

        <p className="text-sm md:text-lg  mb-6">
          You can create room for more people to experience God&apos;s love by
          supporting the work Collective is doing locally and globally, no
          matter what your age is. You can start with your tithe, which is 10%
          of what you have (pocket money) back to God.
        </p>

        <CTAButton href="https://give.collective.my/">GIVE NOW</CTAButton>
      </section>

      {/* Serve Section */}
      <section className="py-4 md:py-16 px-4 max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-heading mb-6">Serve</h2>

        <p className="text-sm md:text-lg  mb-6">
          You can help others experience his love when you serve humbly in love.
          You can change the world for those around you when you allow God to
          move in you and through you.
        </p>

        <CTAButton href="/serve">SERVE NOW</CTAButton>
      </section>

      <Happenings announcements={[]} />

      {/* Navigation Links */}
      <section className="py-8 px-4 max-w-4xl mx-auto flex justify-between items-center">
        <Link
          href="/pre-teens"
          className="inline-flex items-center gap-2 text-2xl font-heading text-black no-underline hover:underline group"
        >
          <ChevronLeft className="w-6 h-6 transition-transform group-hover:-translate-x-1" />
          <span>Pre-teens</span>
        </Link>

        <Link
          href="/campus"
          className="inline-flex items-center gap-2 text-2xl font-heading text-black no-underline hover:underline group"
        >
          <span>Campus</span>
          <ChevronRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
        </Link>
      </section>

      <Footer />
    </main>
  );
}
