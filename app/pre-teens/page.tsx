import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import TaglineBanner from "../components/TaglineBanner";
import Happenings from "../components/Happenings";

export const metadata: Metadata = {
  title: "Pre-Teens",
  description:
    "We want to see pre-teens grasp God's love and step into their part of God's story.",
};

// Meeting schedule data
const meetingDates = ["17 Mar", "21 Apr", "19 May", "16 Jun"];

export default function PreTeensPage() {
  return (
    <main className="antialiased font-sans">
      <Navbar />

      {/* Hero Content */}
      <div className="relative z-10 text-center">
        <h1 className="text-5xl lg:text-5xl font-heading text-black tracking-tight">
          PRE-TEENS
        </h1>
      </div>

      {/* Age & Description */}
      <section className="py-4 px-4 text-center max-w-4xl mx-auto">
        <p className="text-sm md:text-lg text-gray-600 mb-4">
          (12-13 years old)
        </p>
        <p className="text-sm md:text-lg text-gray-800">
          We want to see pre-teens grasp God&apos;s love and step into their
          part of God&apos;s story.
        </p>
      </section>

      <TaglineBanner
        imageSrc="/assets/pre-teens/unsplash-image.jpg"
        justify="left"
      >
        Practice the way of Jesus together as friends.
      </TaglineBanner>

      {/* Gather on Sundays Section */}
      <section className="py-4 md:py-16 px-4 max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-heading mb-6">
          Gather on Sundays
        </h2>

        <p className="text-sm md:text-lg  mb-4">
          Every month we gather as pre-teens to hear from God, pray for one
          another and spend time together. Come and hang out with us! We meet in{" "}
          <strong>Upper Room</strong>, typically on the{" "}
          <strong>third Sunday of each month.</strong>
        </p>

        <p className="text-sm md:text-lg  mb-2">
          <strong>Time:</strong> 11:00 AM - 12:30 PM
        </p>

        <p className="text-sm md:text-lg ">
          <strong>Date:</strong> {meetingDates.join(", ")}
        </p>
      </section>

      <TaglineBanner imageSrc="/assets/pre-teens/security.jpg" justify="right">
        Step into your part of God&apos;s story.
      </TaglineBanner>

      <Happenings announcements={[]} />

      {/* Next Page Link */}
      <section className="flex justify-end py-8 px-4 max-w-4xl mx-auto">
        <Link
          href="/teens"
          className="inline-flex items-center gap-2 text-2xl font-heading text-black no-underline hover:underline group"
        >
          <span>Teens</span>
          <ChevronRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
        </Link>
      </section>

      <Footer />
    </main>
  );
}
