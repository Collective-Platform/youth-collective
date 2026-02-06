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
    <main className="antialiased font-sans">
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
            src="/assets/Untitled_design_liR9LnHLUuLfVZyBWMD2l.jpg"
            alt="Youth photo"
            width={1200}
            height={800}
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

      {/* Alpha Youth Section */}
      <section className="relative bg-[#5138e0] py-10 my-12 overflow-hidden">
        <Container className="text-center relative z-10">
          {/* Decorative Images - positioned absolutely */}
          <Image
            src="/assets/alpha/What_s_on_your_mind_aZKPaQ0byEEFmMxIO3VG3.png"
            alt="What's on your mind"
            width={300}
            height={200}
            className="mx-auto mb-6"
          />

          <p className="text-lg md:text-xl text-white mb-4">
            An 8 week journey to explore life, faith, and meaning—no judgment,
            no pressure, just real conversations.
          </p>

          <p className="font-bold text-[#c1fe03] mb-6">
            Sunday | 1pm - 3pm | Stage 8
          </p>

          <Link
            href="/alpha"
            className="inline-block bg-[#c1fe03] text-[#ff0087] px-8 py-3 rounded-lg font-bold border-2 border-[#ff0087] hover:bg-[#ff0087] hover:text-[#c1fe03] hover:border-[#c1fe03] transition-colors"
          >
            Join Alpha
          </Link>
        </Container>

        {/* Decorative corner images */}
        <Image
          src="/assets/Icon_1_a-hU9tJFz_p_ks0lpsvkQ.png"
          alt=""
          width={200}
          height={200}
          className="absolute -left-10 top-0 w-32 md:w-48 opacity-80"
        />
        <Image
          src="/assets/Icon_3_aW_gDKiW0gTfDJErmdojF.png"
          alt=""
          width={200}
          height={200}
          className="absolute -right-10 top-0 w-32 md:w-48 opacity-80"
        />
        <Image
          src="/assets/Icon_2_EbPOWXD_WcapVhJTZZjdh.png"
          alt=""
          width={200}
          height={200}
          className="absolute -right-10 bottom-0 w-32 md:w-48 opacity-80"
        />
      </section>

      <Footer />
    </main>
  );
}
