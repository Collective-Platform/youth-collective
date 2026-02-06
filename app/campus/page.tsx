import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import CTAButton from "../components/CTAButton";
import TaglineBanner from "../components/TaglineBanner";
import Happenings from "../components/Happenings";

export const metadata: Metadata = {
  title: "Campus",
  description:
    "We want to see every campus student with a heart to follow the way of Jesus and live for what matters most.",
};

export default function CampusPage() {
  return (
    <main className="antialiased font-sans">
      <Navbar />

      {/* Hero Content */}
      <div className="relative z-10 text-center">
        <h1 className="text-5xl lg:text-5xl font-heading text-black tracking-tight">
          UNIVERSITY COLLEGE
        </h1>
      </div>

      {/* Age & Description */}
      <section className="py-4 px-4 text-center max-w-4xl mx-auto">
        <p className="text-sm md:text-lg text-gray-600 mb-4">
          (18 years old & above)
        </p>
        <p className="text-sm md:text-lg text-gray-800">
          We want to see every campus student with a heart to follow the way of
          Jesus and live for what matters most in the modern culture.
        </p>
      </section>

      <TaglineBanner
        imageSrc="/assets/campus/campus-worship.jpg"
        justify="left"
      >
        Come
        <br />
        and See.
      </TaglineBanner>

      {/* Gather on Sundays Section */}
      <section className="py-16 px-4 max-w-4xl mx-auto my-8">
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

      <TaglineBanner imageSrc="/assets/campus/worship.jpg" justify="right">
        Stay
        <br />
        and Grow.
      </TaglineBanner>

      {/* Getting Baptized Section */}
      <section className="py-16 px-4 max-w-4xl mx-auto">
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
          ENTER INTO WATERS
        </CTAButton>
      </section>

      {/* Live In Community Section */}
      <section className="py-16 px-4 max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-heading mb-6">
          Live In Community
        </h2>

        <p className="text-sm md:text-lg  mb-6">
          This is the way we gather during the week around the table. We eat
          together, pray for one another, and share life together. It is in
          these ordinary rhythms of life that we become more like Jesus.
        </p>

        <CTAButton href="/community">LIVE IN COMMUNITY</CTAButton>
      </section>

      <TaglineBanner
        imageSrc="/assets/campus/campus-children-church.jpg"
        justify="left"
      >
        Go
        <br />
        and Make.
      </TaglineBanner>

      {/* Give Section */}
      <section className="py-16 px-4 max-w-4xl mx-auto">
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

      {/* Navigation Link - Previous Page */}
      <section className="py-8 px-4 max-w-4xl mx-auto">
        <Link
          href="/teens"
          className="inline-flex items-center gap-2 text-2xl font-heading text-black no-underline hover:underline group"
        >
          <ChevronLeft className="w-6 h-6 transition-transform group-hover:-translate-x-1" />
          <span>Teens</span>
        </Link>
      </section>

      <Footer />
    </main>
  );
}
