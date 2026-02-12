import Link from "next/link";
import Image from "next/image";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Container from "./Container";

// Image Card component for tribe section
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

export default function HomePage() {
  return (
    <main className="antialiased">
      <Navbar />

      {/* Hero Section */}
      <Container className="flex flex-col lg:flex-row items-center justify-center gap-4 my-12">
        <div className="flex-1">
          <h1 className="text-4xl text-left md:text-5xl lg:text-6xl font-heading leading-tight">
            A God-centered community that loves people relentlessly.
          </h1>
        </div>

        <div className="flex-1">
          <Image
            src="/assets/homepage/hero-image.jpg"
            alt="Youth photo"
            width={1200}
            height={800}
            priority
            className="w-full lg:w-150 max-h-[90vh] object-cover rounded-lg"
          />
        </div>
      </Container>

      {/* Find Your Tribe Section */}
      <Container>
        <h1 className="text-4xl text-center md:text-5xl lg:text-6xl font-heading leading-tight">
          Find Your Tribe
        </h1>
      </Container>
      <Container className="grid lg:grid-cols-3 gap-4 my-12">
        <TribeCard
          href="/pre-teens"
          title="Pre-Teens"
          imageSrc="/assets/homepage/pre-teens.jpg"
          imageAlt="Pre-teens group"
        />
        <TribeCard
          href="/teens"
          title="Teens"
          imageSrc="/assets/homepage/teens.jpg"
          imageAlt="Teens group"
        />
        <TribeCard
          href="/campus"
          title="Campus"
          imageSrc="/assets/homepage/campus.jpg"
          imageAlt="Campus group"
        />
      </Container>

      <Footer />
    </main>
  );
}
