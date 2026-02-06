"use client";

import Image from "next/image";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import InternshipFAQ from "@/app/internship/InternshipFAQ";

const MarqueeSolid = ({
  text,
  reverse = false,
}: {
  text: string;
  reverse?: boolean;
}) => (
  <div className="overflow-hidden whitespace-nowrap py-6 bg-[#0a34df] border-t-3 border-b-3 border-white">
    <div
      className={`inline-flex ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}
    >
      {[...Array(12)].map((_, i) => (
        <span
          key={i}
          className="text-[clamp(16px,3vw,24px)] font-bold uppercase mx-8 text-white"
        >
          {text}
        </span>
      ))}
    </div>
  </div>
);

export default function InternshipContent() {
  return (
    <main className="font-[Inter,sans-serif] bg-black">
      <style jsx global>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        @keyframes marquee-reverse {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-marquee-reverse {
          animation: marquee-reverse 30s linear infinite;
        }
        @keyframes slideDown {
          from {
            height: 0;
          }
          to {
            height: var(--radix-accordion-content-height);
          }
        }
        @keyframes slideUp {
          from {
            height: var(--radix-accordion-content-height);
          }
          to {
            height: 0;
          }
        }
        .animate-slideDown {
          animation: slideDown 300ms ease-out;
        }
        .animate-slideUp {
          animation: slideUp 300ms ease-out;
        }
      `}</style>

      <div className="min-h-screen flex flex-col">
        <div className="bg-white">
          <Navbar />
        </div>

        {/* Hero Section */}
        <section className="relative flex-1 bg-black text-white overflow-hidden">
          <div className="flex flex-col md:flex-row min-h-[80vh]">
            {/* Left - Text Content */}
            <div className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-16 py-16">
              <h1 className="text-[clamp(32px,5vw,56px)] font-black uppercase mb-8 leading-tight">
                Get ready for the best school break week
              </h1>

              <p className="text-xl font-bold text-white mb-12">
                The week where you discover God, learn essential life skills,
                and connect meaningfully with the world beyond you.
              </p>

              <div className="mb-8">
                <a
                  href="#register"
                  className="inline-block bg-[#f45c36] text-white font-bold uppercase px-10 py-5 text-lg tracking-wider hover:bg-white hover:text-black transition-all duration-300 transform hover:scale-105 border-white border-2"
                >
                  Apply Now 🚀
                </a>
              </div>
              <p className="text-white text-sm md:text-base font-medium leading-tight">
                *Registration closes on March 8, 2026
              </p>
            </div>

            {/* Right - Image */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-black">
              <div className="relative aspect-3/4 w-full max-w-125">
                <Image
                  src="/assets/internship/internship_dance.jpg"
                  alt="Youth Program"
                  fill
                  className="object-cover"
                />
                <p className="absolute bottom-4 right-4 text-white/90 text-sm md:text-base text-right max-w-50 md:max-w-70 leading-tight font-bold">
                  Not just another camp or program, but a door to your
                  transformation.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Apply Today Marquee */}
      <MarqueeSolid text="Apply Today" />

      {/* Does This Sound Familiar Section */}
      <section className="bg-[#0a34df] text-white py-24 px-4 border-y-3 border-white">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-bold uppercase tracking-wide mb-12 text-white">
            Does this sound like you?
          </h3>

          <div className="space-y-6 py-3 text-center max-w-2xl mx-auto">
            {[
              "👀 You're tired of going through the motions or feeling stuck, but not sure how to get out of it.",
              "👀 You're seeking to discover more about who God is and who He is calling you to be.",
              "👀 You're eager and ready to learn, grow, and step out of your comfort zone.",
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-4 group bg-[#0a34df] border-3 border-white px-13 py-6"
              >
                <p className="text-base font-bold uppercase text-white/80">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Isn't Another Altar Call Section */}
      <section className="bg-black text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[#FF6B35] uppercase font-bold mb-4">
            &quot;Sometimes a calling is staring us in the face, we just need to
            make eye contact.&quot;
          </p>
          <div className="w-px h-8 bg-[#FF6B35] mx-auto my-4"></div>
          <p className="text-[#FF6B35]/80 uppercase mb-4">John Mark Comer</p>
        </div>
      </section>

      {/* Your Created for More */}
      <section className="bg-black text-white py-24 px-4 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-[clamp(32px,6vw,64px)] font-black uppercase text-center mb-8 leading-tight">
            You were created for more 💥
          </h2>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {[
              {
                title: "Be rooted",
                desc: `Practice living in the present in His presence and ground your identity in the One who created you.

"I am the vine; you are the branches. If you remain in me and I in you, you will bear much fruit; apart from me you can do nothing" 
- John 15:5`,
                icon: "📖",
              },
              {
                title: "Be formed",
                desc: `Step into the process God has already begun—becoming a person marked by love, authenticity, and courage.

"Yet you, Lord, are our Father. We are the clay, you are the potter; we are all the work of your hand."
- Isaiah 64:8`,
                icon: "🛠️",
              },
              {
                title: "Be in community",
                desc: `Break out of your comfort into a fulfilling life, not on your own, but with God as your Captain.

"For we are God's masterpiece. He has created us anew in Christ Jesus, so we can do the good things he planned for us long ago." 
- Ephesians 2:10`,
                icon: "🤝",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="group relative bg-linear-to-b from-[#0a0a0a] to-black border border-white/10 p-8 hover:border-[#FF6B35] transition-all duration-500"
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-black uppercase mb-3 group-hover:text-[#FF6B35] transition-colors">
                  {item.title}
                </h3>
                <p className="text-white/60 leading-relaxed">{item.desc}</p>
                <div className="absolute bottom-0 left-0 w-0 h-1 bg-[#FF6B35] group-hover:w-full transition-all duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's In Store Section */}
      <section className="bg-black text-white py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-[clamp(32px,6vw,64px)] font-black uppercase text-center mb-16">
            What&apos;s in store 👀
          </h2>
          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {[
              {
                title: "GROW",
                desc: "Scripture workshops and leadership training to build your foundation.",
                icon: "📖",
              },
              {
                title: "Be in community",
                desc: "Real skills, real practice, real growth. No more hypotheticals.",
                icon: "🛠️",
              },
              {
                title: "Explore",
                desc: "Connect with others running after Jesus just as hard as you.",
                icon: "🤝",
              },
              {
                title: "Serve",
                desc: "Connect with others running after Jesus just as hard as you.",
                icon: "🤝",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="group relative bg-linear-to-b from-[#0a0a0a] to-black border border-white/10 p-8 hover:border-[#FF6B35] transition-all duration-500"
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-black uppercase mb-3 group-hover:text-[#FF6B35] transition-colors">
                  {item.title}
                </h3>
                <p className="text-white/60 leading-relaxed">{item.desc}</p>
                <div className="absolute bottom-0 left-0 w-0 h-1 bg-[#FF6B35] group-hover:w-full transition-all duration-500" />
              </div>
            ))}
          </div>

          {/* 4 Quadrant Grid with hover effects */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1 mb-16">
            {[
              {
                title: "GROW",
                items: [
                  "Scripture Workshops",
                  "Skills Training",
                  "Personal Development",
                ],
                bg: "bg-[#0a0a0a] border border-[#FF6B35]",
              },
              {
                title: "BE IN COMMUNITY",
                items: ["Worship Together", "Pray Together", "Life Together"],
                bg: "bg-[#0a0a0a] border border-[#FF6B35]",
              },
              {
                title: "EXPLORE",
                items: ["Bouldering", "Hiking", "Adventure Activities"],
                bg: "bg-[#0a0a0a] border border-[#FF6B35]",
              },
              {
                title: "SERVE",
                items: [
                  "Outreach Projects",
                  "Practical Service",
                  "Kingdom Impact",
                ],
                bg: "bg-[#0a0a0a] border border-[#FF6B35]",
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`${item.bg} p-10 group cursor-default transition-all duration-300 hover:scale-[1.02]`}
              >
                <h3 className="text-3xl font-black mb-6 tracking-tight">
                  {item.title}
                </h3>
                <ul className="space-y-2">
                  {item.items.map((subItem, j) => (
                    <li
                      key={j}
                      className="text-lg opacity-80 group-hover:opacity-100 transition-opacity"
                    >
                      → {subItem}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="text-center">
            <a
              href="#register"
              className="inline-block bg-[#f45c36] text-white font-black uppercase px-12 py-5 text-xl tracking-wider hover:bg-white hover:text-black transition-all duration-300 transform hover:scale-105 border-white border-2"
            >
              I Want In!! 🔥
            </a>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <InternshipFAQ />

      {/* Summer Program CTA Section */}
      <section className="bg-black text-white min-h-screen flex flex-col md:flex-row">
        {/* Left - Image */}
        <div className="w-full md:w-[30%] h-[50vw] md:h-screen relative shrink-0">
          <Image
            src="/assets/DSCF3714i_0z_zfBPvg8MR_d-MTR3t7.jpg"
            alt="Collective Youth Summer Program"
            className="w-full h-full object-cover"
            width={300}
            height={400}
          />
        </div>

        {/* Right - Content */}
        <div className="flex-1 flex flex-col justify-center items-center md:items-start px-8 md:px-16 py-16 md:py-0">
          <h1 className="text-[clamp(32px,5vw,56px)] font-black uppercase mb-8 text-center md:text-left">
            Collective Youth <br /> Summer Program
          </h1>

          <div className="space-y-6 text-center md:text-left uppercase">
            <div>
              <h4 className="text-lg font-bold tracking-wider">Dates:</h4>
              <h2 className="text-3xl md:text-4xl font-bold">
                March 23 - 29, 2026
              </h2>
            </div>

            <div>
              <h4 className="text-lg font-bold tracking-wider">Location:</h4>
              <h2 className="text-3xl md:text-4xl font-bold">Collective</h2>
            </div>

            <div>
              <h4 className="text-lg font-bold tracking-wider">Fee:</h4>
              <h2 className="text-3xl md:text-4xl font-bold">RM599</h2>
            </div>
          </div>

          <a
            href="#register"
            className="inline-block bg-[#f45c36] text-white font-bold uppercase px-12 py-5 text-xl tracking-wider hover:bg-white hover:text-black transition-all duration-300 transform hover:scale-105 mt-10 border-white border-2"
          >
            APPLY TODAY
          </a>

          <p className="mt-6 text-white/70 text-sm">
            *Registration closes on March 8, 2026
          </p>
        </div>
      </section>

      <div className="bg-white">
        <Footer />
      </div>
    </main>
  );
}
