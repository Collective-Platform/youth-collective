"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

export default function CampusPage() {
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
              "url('/assets/Edited349A0860_RcayXCa9NIdjy0UUlmS1y.jpg')",
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white tracking-tight">
            UNIVERSITY COLLEGE
          </h1>
        </div>
      </section>

      {/* Age & Description */}
      <section className="py-12 px-4 text-center max-w-4xl mx-auto">
        <p className="text-lg text-gray-600 mb-4">(18 years old & above)</p>
        <p className="text-lg text-gray-800">
          We want to see every campus student with a heart to follow the way of
          Jesus and live for what matters most in the modern culture.
        </p>
      </section>

      {/* Come and See Banner - Desktop */}
      <section className="hidden md:block bg-[#E9F55F] py-16 px-4 -rotate-2 -mx-4 my-8">
        <p className="text-center text-2xl md:text-3xl lg:text-4xl font-bold text-black max-w-4xl mx-auto">
          Come
          <br />
          and See.
        </p>
      </section>

      {/* Come and See Banner - Mobile */}
      <section className="md:hidden bg-black py-12 px-4 my-8">
        <p className="text-center text-xl font-bold text-white max-w-md mx-auto">
          Come
          <br />
          and See.
        </p>
      </section>

      {/* Gather on Sundays Section */}
      <section className="py-16 px-4 max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Gather on Sundays
        </h2>

        <p className="text-lg text-gray-700 mb-6">
          Every Sunday we gather together to meet the One who loves us deeply,
          create space to hear from Him and pray for one another. It is in these
          moments that God meets us where we are at.
        </p>

        <Link
          href="/rockzone"
          className="inline-block bg-black text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          ROCK ZONE
        </Link>
      </section>

      {/* Experience Youth Section */}
      <section className="py-16 px-4 max-w-4xl mx-auto bg-gray-50">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Experience Youth
        </h2>

        <p className="text-lg text-gray-700 mb-4">
          Growing up can be all kinds of awkward but this is where you can come
          as you are. It is a time for ALL youth to meet up, grow in faith, and
          have fun. This takes place on the 4th Sunday of each month. Don&apos;t
          come alone, bring a friend!
        </p>

        <p className="text-lg text-gray-700 mb-2">
          <strong>Time:</strong> 2:00 PM - 3:30 PM
        </p>

        <p className="text-lg text-gray-700">
          <strong>Location:</strong> Upper Room
        </p>
      </section>

      {/* Stay and Grow Banner - Desktop */}
      <section className="hidden md:block bg-[#E9F55F] py-12 px-4 my-8">
        <p className="text-center text-xl md:text-2xl font-bold text-black max-w-3xl mx-auto">
          <span className="text-[#E9F55F] bg-black px-2">Stay</span>
          <br />
          and Grow.
        </p>
      </section>

      {/* Stay and Grow Banner - Mobile */}
      <section className="md:hidden bg-black py-10 px-4 my-8">
        <p className="text-center text-lg font-bold text-white max-w-md mx-auto">
          Stay
          <br />
          and Grow.
        </p>
      </section>

      {/* Getting Baptized Section */}
      <section className="py-16 px-4 max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Getting Baptized
        </h2>

        <p className="text-lg text-gray-700 mb-6">
          Jesus calls us to a new different life and it starts with baptism.
          There will be a three-week course to walk you through this new
          adventure with God. If you are a follower of Jesus and have yet to get
          baptized, we encourage you to take that step.
        </p>

        <a
          href="#tally-open=w4rXRo&tally-layout=modal&tally-overlay=1"
          className="inline-block bg-black text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          ENTER INTO WATERS
        </a>
      </section>

      {/* Live In Community Section */}
      <section className="py-16 px-4 max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Live In Community
        </h2>

        <p className="text-lg text-gray-700 mb-6">
          This is the way we gather during the week around the table. We eat
          together, pray for one another, and share life together. It is in
          these ordinary rhythms of life that we become more like Jesus.
        </p>

        <Link
          href="/community"
          className="inline-block bg-black text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          LIVE IN COMMUNITY
        </Link>
      </section>

      {/* Go and Make Banner - Desktop */}
      <section className="hidden md:block bg-[#E9F55F] py-12 px-4 my-8">
        <p className="text-center text-xl md:text-2xl font-bold text-black max-w-3xl mx-auto">
          <span className="text-[#E9F55F] bg-black px-2">Go</span>
          <br />
          and Make.
        </p>
      </section>

      {/* Go and Make Banner - Mobile */}
      <section className="md:hidden bg-black py-10 px-4 my-8">
        <p className="text-center text-lg font-bold text-white max-w-md mx-auto">
          Go
          <br />
          and Make.
        </p>
      </section>

      {/* Give Section */}
      <section className="py-16 px-4 max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Give</h2>

        <p className="text-lg text-gray-700 mb-6">
          You can create room for more people to experience God&apos;s love by
          supporting the work Collective is doing locally and globally, no
          matter what your age is. You can start with your tithe, which is 10%
          of what you have (pocket money) back to God.
        </p>

        <a
          href="https://give.collective.my/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-black text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          GIVE NOW
        </a>
      </section>

      {/* Serve Section */}
      <section className="py-16 px-4 max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Serve</h2>

        <p className="text-lg text-gray-700 mb-6">
          You can help others experience his love when you serve humbly in love.
          You can change the world for those around you when you allow God to
          move in you and through you.
        </p>

        <Link
          href="/serve"
          className="inline-block bg-black text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          SERVE NOW
        </Link>
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

      {/* Navigation Link - Previous Page */}
      <section className="py-8 px-4 max-w-4xl mx-auto">
        <Link
          href="/teens"
          className="inline-flex items-center gap-2 text-2xl font-bold text-black no-underline hover:underline group"
        >
          <ChevronLeft className="w-6 h-6 transition-transform group-hover:-translate-x-1" />
          <span>Teens</span>
        </Link>
      </section>

      <Footer />
    </main>
  );
}
