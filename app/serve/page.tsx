import type { Metadata } from "next";
import Link from "next/link";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import TaglineBanner from "../components/TaglineBanner";
import Image from "next/image";
import Container from "../components/Container";

export const metadata: Metadata = {
  title: "Campus",
  description:
    "We want to see every campus student with a heart to follow the way of Jesus and live for what matters most.",
};

const TribeCard = ({
  href,
  title,
  imageSrc,
  imageAlt,
}: {
  href: string;
  title: string;
  imageSrc: string;
  imageAlt: string;
}) => (
  <div className="flex-1">
    <Link
      href={href}
      className="relative block aspect-square overflow-hidden group"
    >
      <p className="absolute inset-0 z-10 flex text-center items-center justify-center text-white text-4xl md:text-5xl lg:text-4xl font-heading drop-shadow-lg">
        {title}
      </p>
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105"
      />
    </Link>
  </div>
);

export default function CampusPage() {
  return (
    <main className="antialiased font-sans">
      <Navbar />

      {/* Hero Content */}
      <div className="relative z-10 text-center">
        <h1 className="text-5xl lg:text-5xl font-heading text-black tracking-tight">
          Serve
        </h1>
      </div>

      {/* Age & Description */}
      <section className="py-4 px-4 text-center max-w-4xl mx-auto">
        <p className="text-sm md:text-lg text-gray-800">
          Jesus shows us true greatness comes from serving others.
        </p>
      </section>

      <TaglineBanner imageSrc="/assets/serve/worship.jpg" justify="left">
        Chasing
        <br />
        Greatness.
      </TaglineBanner>

      {/* Why do we serve Section */}
      <section className="py-6 px-4 max-w-4xl mx-auto my-8">
        <h2 className="text-3xl md:text-4xl font-heading mb-6">
          Why do we serve?
        </h2>

        <p className="text-sm md:text-lg  mb-6">
          Jesus simply asks us to do what He did — put others before Him so that
          they can experience the kind of love that exists within Himself. When
          we serve, others have a chance to experience His love and be changed
          by His love.
        </p>
      </section>

      {/* Who do we serve Section */}
      <section className="py-6 px-4 max-w-4xl mx-auto my-8">
        <h2 className="text-3xl md:text-4xl font-heading mb-6">
          Who do we serve?
        </h2>

        <p className="text-sm md:text-lg  mb-6">
          After explaining what it means to be great, Jesus put a child in the
          middle of the room to help the disciples understand who they should
          serve. In the same way Jesus serves others, we should serve someone
          who cannot do anything for us, like a child.
        </p>
      </section>

      {/* How do we serve Section */}
      <section className="py-6 px-4 max-w-4xl mx-auto my-8">
        <h2 className="text-3xl md:text-4xl font-heading mb-6">
          How do we serve?
        </h2>

        <p className="text-sm md:text-lg  mb-6">
          For God, with God. Jesus is more concerned with our hearts than our
          works. Yes, works are important, but they overflow from a heart in the
          right relationship with Him. As He said, “Without me, you can do
          nothing” (John 15:5c).
        </p>
      </section>

      <Container className="grid lg:grid-cols-2 gap-4 my-12">
        <TribeCard
          href="/serve/ss"
          title="SS"
          imageSrc="/assets/serve/usher.jpg"
          imageAlt="SS"
        />
        <TribeCard
          href="/serve/mission"
          title="Mission"
          imageSrc="/assets/serve/missions/bring-a-light-3.jpg"
          imageAlt="Mission"
        />
      </Container>

      <Footer />
    </main>
  );
}
