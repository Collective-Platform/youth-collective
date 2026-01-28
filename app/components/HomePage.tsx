import Link from "next/link";
import Image from "next/image";
import Navbar from "./Navbar";
import Footer from "./Footer";

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
  <div className="flex-1 min-w-70">
    <Link
      href={href}
      className="flex flex-col items-center justify-center group"
    >
      <p className="absolute z-10 text-white text-4xl font-bold drop-shadow-lg">
        {title}
      </p>
      <Image
        src={imageSrc}
        alt={imageAlt}
        width={400}
        height={400}
        className="transition-transform duration-300 group-hover:scale-105"
      />
    </Link>
  </div>
);

export default function HomePage() {
  return (
    <main className="antialiased font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="flex flex-col lg:flex-row items-center justify-center gap-4 mx-auto my-12 max-w-7xl px-4">
        <div className="flex-1 text-center lg:text-left">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            A God-centered community that loves people relentlessly.
          </h1>
        </div>

        <div className="hidden lg:block flex-1">
          <Image
            src="/assets/Untitled_design_liR9LnHLUuLfVZyBWMD2l.jpg"
            alt="Community photo"
            width={600}
            height={900}
            className="w-full h-auto object-cover rounded-lg"
          />
        </div>
      </section>

      {/* Find Your Tribe Section */}
      <section className="grid grid-cols-3 gap-4 mx-auto my-12 max-w-7xl px-4">
        <TribeCard
          href="/pre-teens"
          title="Pre-Teens"
          imageSrc="/assets/349A9717-1_Hh-xM17_QBPmc90SMou3u.jpg"
          imageAlt="Pre-teens group"
        />
        <TribeCard
          href="/teens"
          title="Teens"
          imageSrc="/assets/349A9960-36_mmZgSDKuv_CL29wqr8c5F.jpg"
          imageAlt="Teens group"
        />
        <TribeCard
          href="/campus"
          title="Campus"
          imageSrc="/assets/EditedDSCF4332-24_KkLjsVQfYtLLFG2nD0ZFZ.jpg"
          imageAlt="Campus group"
        />
      </section>

      {/* Alpha Youth Section */}
      <section className="relative bg-[#5138e0] py-10 px-4 my-12 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Decorative Images - positioned absolutely */}
          <Image
            src="/assets/What_s_on_your_mind_aZKPaQ0byEEFmMxIO3VG3.png"
            alt="What's on your mind"
            width={300}
            height={200}
            className="mx-auto mb-6"
          />

          <p className="text-lg md:text-xl text-black mb-4">
            An 8 week journey to explore life, faith, and meaning—no judgment,
            no pressure, just real conversations.
          </p>

          <p className="font-bold text-black mb-6">
            Sunday | 1pm - 3pm | Stage 8
          </p>

          <Link
            href="/alpha"
            className="inline-block bg-black text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Join Alpha
          </Link>
        </div>

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
