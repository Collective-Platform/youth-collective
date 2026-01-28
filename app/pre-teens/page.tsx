"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

// Meeting schedule data
const meetingDates = ["17 Mar", "21 Apr", "19 May", "16 Jun"];

export default function PreTeensPage() {
  return (
    <main className="antialiased font-sans">
      <Navbar />

      {/* Hero Section with Background */}
      <section className="relative flex flex-col items-center justify-center min-h-[60vh] overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('/assets/349A9745-3_18SVl1d8w9pFnne_JfYS1.jpg')",
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white tracking-tight">
            PRE-TEENS
          </h1>
        </div>
      </section>

      {/* Age & Description */}
      <section className="py-12 px-4 text-center max-w-4xl mx-auto">
        <p className="text-lg text-gray-600 mb-4">(12-13 years old)</p>
        <p className="text-lg text-gray-800">
          We want to see pre-teens grasp God&apos;s love and step into their
          part of God&apos;s story.
        </p>
      </section>

      {/* Tagline Banner - Desktop */}
      <section className="hidden md:block bg-[#E9F55F] py-16 px-4 -rotate-2 -mx-4 my-8">
        <p className="text-center text-2xl md:text-3xl lg:text-4xl font-bold text-black max-w-4xl mx-auto">
          Practice the way of Jesus together as friends.
        </p>
      </section>

      {/* Tagline Banner - Mobile */}
      <section className="md:hidden bg-black py-12 px-4 my-8">
        <p className="text-center text-xl font-bold text-white max-w-md mx-auto">
          Practice the way of Jesus together as friends.
        </p>
      </section>

      {/* Gather on Sundays Section */}
      <section className="py-16 px-4 max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Gather on Sundays
        </h2>

        <p className="text-lg text-gray-700 mb-4">
          Every month we gather as pre-teens to hear from God, pray for one
          another and spend time together. Come and hang out with us! We meet in{" "}
          <strong>Upper Room</strong>, typically on the{" "}
          <strong>third Sunday of each month.</strong>
        </p>

        <p className="text-lg text-gray-700 mb-2">
          <strong>Time:</strong> 11:00 AM - 12:30 PM
        </p>

        <p className="text-lg text-gray-700">
          <strong>Date:</strong> {meetingDates.join(", ")}
        </p>
      </section>

      {/* Step Into Your Story Banner - Desktop */}
      <section className="hidden md:block bg-[#E9F55F] py-12 px-4 my-8">
        <p className="text-center text-xl md:text-2xl font-bold text-black max-w-3xl mx-auto">
          Step into your part of God&apos;s story.
        </p>
      </section>

      {/* Step Into Your Story Banner - Mobile */}
      <section className="md:hidden bg-black py-10 px-4 my-8">
        <p className="text-center text-lg font-bold text-white max-w-md mx-auto">
          Step into your part of God&apos;s story.
        </p>
      </section>

      {/* Happenings Section */}
      <section className="py-16 px-4 max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Happenings</h2>

        <p className="text-lg text-gray-700 mb-8">
          Look forward to upcoming events available throughout the year to have
          fun, make new friends and form our lives around Jesus.
        </p>

        <hr className="border-gray-300" />
      </section>

      {/* Next Page Link */}
      <section className="py-8 px-4 max-w-4xl mx-auto">
        <Link
          href="/teens"
          className="inline-flex items-center gap-2 text-2xl font-bold text-black no-underline hover:underline group"
        >
          <span>Teens</span>
          <ChevronRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
        </Link>
      </section>

      <Footer />
    </main>
  );
}
