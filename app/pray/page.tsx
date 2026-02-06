import type { Metadata } from "next";
import Image from "next/image";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CTAButton from "../components/CTAButton";
import TaglineBanner from "../components/TaglineBanner";

export const metadata: Metadata = {
  title: "Pray",
  description:
    "Find more ways to pray. Tools and teachings to help you connect with God.",
};

export default function PrayPage() {
  return (
    <main className="text-black min-h-screen font-sans">
      <Navbar />
      {/* Hero Section */}
      <div className="relative z-10 text-center">
        <h1 className="text-5xl lg:text-5xl font-heading text-black tracking-tight uppercase">
          Pray
        </h1>
      </div>
      {/* Description */}
      <section className="py-4 px-4 text-center max-w-4xl mx-auto">
        <p className="text-sm md:text-lg text-gray-800">
          Prayer is simply talking with God and listening to God.
        </p>
      </section>

      <TaglineBanner imageSrc="/assets/pray/DSCF7707_(1).jpg" justify="left">
        &apos;By praying, we learn to pray.&apos; <br></br> Richard Foster
      </TaglineBanner>

      <section className="py-4 md:py-16 px-4 max-w-4xl mx-auto">
        <h2 className="text-3xl uppercase md:text-4xl font-heading mb-6">
          Pray as you can
        </h2>
        <p className="text-sm md:text-lg mb-4">
          If you’ve never prayed for an hour before, don’t try. It’ll feel like
          forever. Start with a minute.
        </p>
        <h3 className="text-sm md:text-lg mb-4 font-bold">Pray as you can.</h3>
        <p className="text-sm md:text-lg mb-4">
          If you zone out when you sit down to pray, try walking down the
          sidewalk to pray.{" "}
        </p>
        <h3 className="text-sm md:text-lg mb-4 font-bold">Pray as you can.</h3>
        <p className="text-sm md:text-lg mb-4">
          If you can’t give thanks, don’t fake it. Pray your complaints, anger
          and confusion.
        </p>
        <h3 className="text-sm md:text-lg mb-4 font-bold">Pray as you can.</h3>
        <p className="text-sm md:text-lg mb-4">
          If you can’t concentrate to pray out loud, journal your prayers with
          paper and pen.
        </p>
        <h3 className="text-sm md:text-lg mb-4 font-bold">Pray as you can.</h3>
        <p className="text-sm md:text-lg mb-4">
          If you can’t pray with hope and faith, God’s not bothered by you. He
          wants you to tell him about your doubts and disappointment.
        </p>
        <h3 className="text-sm md:text-lg mb-4 font-bold">Pray as you can.</h3>
      </section>

      {/* Prayer Apps Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-center text-black mb-12 font-black uppercase">
            Try praying
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Echo Prayer */}
            <div className="flex flex-col items-start">
              <div className="relative w-full aspect-square mb-4">
                <Image
                  src="/assets/pray/inner-room-resource_content_header-scaled_13lZRk8ML9rwnORdISa6_.jpg"
                  alt="Echo Prayer"
                  fill
                  className="object-cover rounded"
                />
              </div>
              <h3 className="font-heading text-xl md:text-2xl text-black mb-2">
                Inner Room
              </h3>
              <p className="text-black text-sm md:text-lg leading-relaxed mb-4">
                Turn your phone into a prayer room.
              </p>
              <CTAButton href="#">PRAY NOW</CTAButton>
            </div>

            {/* Lectio 365 */}
            <div className="flex flex-col items-start">
              <div className="relative w-full aspect-square mb-4">
                <Image
                  src="/assets/pray/lectio-scaled_sCGv1_aZFapAInAeye8e8.webp"
                  alt="Lectio 365"
                  fill
                  className="object-cover rounded"
                />
              </div>
              <h3 className="font-heading text-xl md:text-2xl text-black mb-2">
                Lectio 365
              </h3>
              <p className="text-black text-sm md:text-lg leading-relaxed mb-4">
                Help you to pray the Bible every day.
              </p>
              <CTAButton href="https://www.24-7prayer.com/resource/lectio-365/">
                PRAY NOW
              </CTAButton>
            </div>

            {/* How to pray */}
            <div className="flex flex-col items-start">
              <div className="relative w-full aspect-square mb-4">
                <Image
                  src="/assets/pray/inner-room-resource_content_header-scaled_13lZRk8ML9rwnORdISa6_.jpg"
                  alt="How to pray"
                  fill
                  className="object-cover rounded"
                />
              </div>
              <h3 className="font-heading text-xl md:text-2xl text-black mb-2">
                How to pray?
              </h3>
              <p className="text-black text-sm md:text-lg leading-relaxed mb-4">
                Learn how to pray from 24-7 Prayer, a student-led prayer that
                went viral and led groups all over the world to pray together.
              </p>
              <CTAButton href="https://www.24-7prayer.com/how-to-pray/help-me/">
                LEARN MORE
              </CTAButton>
            </div>
          </div>
        </div>
      </section>

      {/* Teachings Section */}
      <section className=" py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-center text-black mb-4 font-black uppercase">
            Teachings
          </h2>
          <p className="text-black text-center text-sm md:text-lg mb-12">
            Listen to the past teachings on prayer.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Video 1 */}
            <div className="aspect-video w-full">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/ERm4RGcv5Fk"
                title="[May 19, 2019] Prayer: Hallowed - Esther Ku"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="rounded"
              />
            </div>

            {/* Video 2 */}
            <div className="aspect-video w-full">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/Yg_kooVvv7s"
                title="[May 26, 2019] Prayer: Unanswered Prayer - Kevin Loo"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="rounded"
              />
            </div>

            {/* Video 3 */}
            <div className="aspect-video w-full">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/wa04cOsH1Hk"
                title="[June 9, 2019] Prayer: Wordless - Kevin Loo"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="rounded"
              />
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
