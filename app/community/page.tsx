import type { Metadata } from "next";
import Image from "next/image";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import TaglineBanner from "../components/TaglineBanner";

export const metadata: Metadata = {
  title: "Community",
  description:
    "Share life together around the table. Live as family, become like Jesus, do what Jesus did.",
};

export default function CommunityPage() {
  return (
    <main className="text-black min-h-screen font-sans">
      <Navbar />
      {/* Hero Content */}
      <div className="relative z-10 text-center">
        <h1 className="text-5xl lg:text-5xl font-heading text-black tracking-tight uppercase">
          Live is Community
        </h1>
      </div>

      {/* Age & Description */}
      <section className="py-4 px-4 text-center max-w-4xl mx-auto">
        <p className="text-sm md:text-lg ">
          Spiritual maturity goes from something you do alone to something we do
          together.
        </p>
      </section>

      {/* Hero Image with Text Overlay */}
      <TaglineBanner imageSrc="/assets/community/discussion.jpg" justify="left">
        Share life together
        <br />
        around the table.
      </TaglineBanner>

      {/* Three Pillars Section */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12">
          {/* Live as family */}
          <div>
            <h3 className="font-heading text-2xl md:text-3xl mb-4">
              Live as family
            </h3>
            <p className="text-sm md:text-lg  mb-6">
              As the family of God, we take time to eat together, pray for one
              another, talk honestly and share life together. We exist to love
              and support each other in practical ways.
            </p>
          </div>

          {/* Become like Jesus */}
          <div>
            <h3 className="font-heading text-2xl md:text-3xl mb-4">
              Become like Jesus
            </h3>
            <p className="text-sm md:text-lg  mb-6">
              Through deep friendships, we can change our lives to be more like
              Jesus by helping each other follow him. Yes, living together means
              we&apos;ll have conflict. But that&apos;s okay. When we stick with
              each other, even when we&apos;re different, we learn more about
              ourselves and how to love others better.
            </p>
          </div>

          {/* Do what Jesus did */}
          <div>
            <h3 className="font-['Archivo_Black'] text-2xl md:text-3xl mb-4">
              Do what Jesus did
            </h3>
            <p className="text-sm md:text-lg  mb-6">
              We&apos;re not just living for ourselves, we&apos;re living for
              something bigger. We want to do what Jesus would do if He was one
              of us, working with God to show his love to those we meet and
              bring hope to a broken world.
            </p>
          </div>
        </div>
      </section>

      {/* Hero Image with Text Overlay */}
      <TaglineBanner imageSrc="/assets/community/praying.jpg" justify="right">
        Practice the way of
        <br />
        Jesus together.
      </TaglineBanner>

      {/* What We Do & How It Works - Light Section */}
      <section className="bg-white text-black py-16 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16">
          {/* What we do */}
          <div>
            <h2 className="font-heading text-3xl md:text-4xl mb-8">
              What we do?
            </h2>
            <div className="space-y-6">
              <div>
                <p className="text-base leading-relaxed">
                  <b>Eat Together</b>
                  <br />
                  We gather around the table to eat together and talk to each
                  other. Sometimes a few of us whip up something for the rest,
                  but most of the time we grabfood together.
                </p>
              </div>
              <div>
                <p className="text-base leading-relaxed">
                  <b>Learn Together</b>
                  <br />
                  We learn about a practice from the way of Jesus and discuss
                  how it&apos;s like for us with our small group after trying it
                  out. Sometimes we pair up with people who are different from
                  us because it helps us to discover a part of us that we never
                  knew before. But we stick with the same group for four weeks.
                  Less awkward.
                </p>
              </div>
            </div>
          </div>

          {/* How it works */}
          <div>
            <h2 className="font-heading text-3xl md:text-4xl mb-8">
              How it works?
            </h2>
            <div className="space-y-6">
              <p className="text-base font-bold leading-relaxed">
                Information alone is not enough to produce formation.
              </p>
              <p className="text-base leading-relaxed">
                The Practices are a multi-week journey that you do with a group.
                Each week, you&apos;ll meet with your group to learn. Then
                you&apos;ll try to put it into practice in your life. Before you
                meet up again, you can reflect with God and others, and maybe
                check out some extra books if you want.
                <br />
                <br />
                We don&apos;t just want to know what Jesus taught, we want to do
                what he taught. We get his ideas from our minds into the muscle
                memory of our bodies. It opens us to God, helps us get closer to
                him and let him change us into people of love.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Full Width Image */}
      <section className="w-full">
        <Image
          src="/assets/community/circle.jpg"
          alt="Community gathering"
          width={1500}
          height={951}
          className="w-full h-auto object-cover"
        />
      </section>

      {/* Commit to Community CTA */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-left">
          <h2 className="font-['Archivo_Black'] text-3xl md:text-4xl  mb-6">
            Commit to a Community
          </h2>
          <p className="text-lg leading-relaxed mx-auto">
            Be a part of this family and stick it out to grow together. You need
            a safe space as much as everyone else, but it only works if all of
            us show up together.
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
}
