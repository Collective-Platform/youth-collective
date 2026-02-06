import Image from "next/image";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import InternshipFAQ from "@/app/program/InternshipFAQ";
import ProgramButton from "./ProgramButton";
import FeatureCards from "./FeatureCards";
import SkillSetSlider from "./SkillSetSlider";
import MarqueeSolid from "./MarqueeSolid";

export default function InternshipContent() {
  return (
    <main className="font-[Inter,sans-serif] bg-black">
      <div className="min-h-screen flex flex-col">
        <div className="bg-white">
          <Navbar />
        </div>

        {/* Hero Section */}
        <section className="relative bg-[#0a34df] text-white overflow-hidden min-h-svh md:min-h-0 md:flex-1 flex flex-col">
          <MarqueeSolid
            text="God is making all things new — starting from you."
            containerClassName="py-6 md:hidden"
            textClassName="text-[clamp(16px,3vw,24px)] font-bold uppercase mx-8 text-white"
          />
          <div className="flex flex-col md:flex-row flex-1 md:min-h-[80vh] relative">
            <MarqueeSolid
              text="God is making all things new — starting from you."
              containerClassName="absolute top-8 left-0 right-0 z-10 hidden md:flex items-center"
              textClassName="text-[clamp(16px,3vw,24px)] font-bold uppercase mx-8 text-[#f45c36]"
            />
            {/* Left - Text Content */}
            <div className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-16 pt-4 pb-12 md:py-16">
              <h1 className="text-[clamp(36px,5vw,56px)] font-heading uppercase mb-8 leading-10 md:leading-12 lg:leading-13">
                GET READY FOR THE BEST OF YOUR SCHOOL HOLIDAY
              </h1>

              <p className="text-md font-bold w-62.5 text-white mb-12">
                The week where you won’t just dream about your level up —{" "}
                <br></br>you’ll step into it.
              </p>

              <div className="mb-8">
                <ProgramButton href="#register" size="sm">
                  Apply Now 🚀
                </ProgramButton>
              </div>
              <p className="text-white text-sm md:text-base font-medium leading-tight">
                *Registration closes on March 8, 2026
              </p>
            </div>

            {/* Right - Image */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-[#ecebe4]">
              <div className="relative aspect-3/4 w-full max-w-125">
                <Image
                  src="/assets/internship/internship_dance.jpg"
                  alt="Youth Program"
                  fill
                  className="object-cover"
                />
                <p className="absolute bottom-4 right-4 text-white/90 text-md md:text-base text-right max-w-60 md:max-w-70 font-bold">
                  &quot;See, I am doing a new thing! Now it springs up; do you
                  not perceive it?&quot; — Isaiah 43:19
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Apply Today Marquee */}
      <MarqueeSolid
        text='"See, I am doing a new thing! Now it springs up; do you not perceive it?" — Isaiah 43:19'
        containerClassName="py-6 bg-[#f45c36] border-t-3 border-b-3 border-white"
      />

      {/* Does This Sound Familiar Section */}
      <section className="bg-[#0c0c0c] text-[#ecebe4] py-20 md:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-heading uppercase tracking-wide mb-12 text-white">
            Does this sound like you?
          </h3>

          <div className="space-y-6 py-3 text-center max-w-2xl mx-auto">
            {[
              "👀 You've tried to change before. It didn't stick.",
              "👀 You're tired of trying harder and failing.",
              "👀 You know you’re called to more, but you don’t know where to start.",
              "👀 You are hungry for what's next",
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-4 group bg-[#0a34df] border-3 border-white px-10 py-6"
              >
                <p className="text-base text-center font-bold capitalized text-white">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Isn't Another Altar Call Section */}
      <section className="relative text-white py-24 px-4 bg-cover bg-center">
        <div className="absolute inset-0 bg-[#0a34df]"></div>
        <div className="relative max-w-4xl mx-auto text-center">
          <p className="text-white font-bold uppercase text-2xl mb-4">
            &quot;Your life is hidden with Christ in God.&quot;
          </p>
          <div className="w-px h-8 bg-white mx-auto my-4"></div>
          <p className="text-white/90 text-sm uppercase mb-4">Colossians 3:3</p>
        </div>
      </section>

      {/* Your Created for More */}
      <section className="bg-[#ecebe4] text-black py-20 md:py-24 px-4 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-[clamp(32px,6vw,64px)] font-black uppercase text-center mb-8 leading-tight">
            WHAT YOU&apos;LL EXPERIENCE
          </h2>

          {/* Feature Cards */}
          <FeatureCards />
        </div>
      </section>

      {/* Apply Today Marquee */}
      <MarqueeSolid
        text="Your biggest limitation is your old identity."
        containerClassName="py-6 bg-[#0c0c0c] border-t-3 border-b-3 border-white"
      />

      {/* Skill-set Section */}
      <section className="bg-[#0a34df] text-white px-4 py-20 md:py-24">
        <div className="max-w-6xl mx-auto px-4 mb-8">
          <h2 className="text-[clamp(32px,6vw,64px)] font-black uppercase text-center mb-2 leading-tight">
            Skill-sets
          </h2>
          <p className="text-base text-center font-bold mb-8">
            Becoming who you are — practically
          </p>
        </div>
        <SkillSetSlider />
        <p className="text-center text-white text-base mt-4 capitalize md:hidden">
          &lt;&lt; Swipe for more &gt;&gt;
        </p>
        <div className="text-center mt-12">
          <ProgramButton href="#register" size="sm">
            I Want In!! 🔥
          </ProgramButton>
        </div>
      </section>

      {/* FAQ Section */}
      <InternshipFAQ />

      {/* Summer Program CTA Section */}
      <section
        id="register"
        className="bg-[#0a34df] text-white min-h-screen flex flex-col md:flex-row"
      >
        {/* Left - Image */}
        <div className="w-full aspect-5/4 md:aspect-auto md:w-1/2 md:h-screen relative shrink-0">
          <Image
            src="/assets/DSCF3714i_0z_zfBPvg8MR_d-MTR3t7.jpg"
            alt="Collective Youth Summer Program"
            fill
            className="object-cover"
          />
        </div>

        {/* Right - Content */}
        <div className="w-full md:w-1/2 flex flex-col justify-center items-start px-8 md:px-16 py-16 md:py-0">
          <h1 className="text-[clamp(32px,5vw,56px)] leading-10 md:leading-12 lg:leading-13 font-black uppercase mb-8 text-left">
            Strictly Students <br /> 1 Week Program
          </h1>

          <div className="space-y-6 text-left uppercase">
            <div>
              <h4 className="text-base tracking-wider capitalize">Dates:</h4>
              <h2 className="text-2xl md:text-4xl font-bold">
                March 23 - 29, 2026
              </h2>
            </div>

            <div>
              <h4 className="text-base capitalize tracking-wider">Location:</h4>
              <h2 className="text-2xl md:text-4xl font-bold">Collective</h2>
            </div>

            <div>
              <h4 className="text-base capitalize tracking-wider">Fee:</h4>
              <h2 className="text-2xl md:text-4xl font-bold">RM599</h2>
              <p className=" text-white/80 text-balance text-sm capitalize">
                Includes accommodation, meals and all materials.
              </p>
            </div>
          </div>

          <div className="mt-10">
            <ProgramButton href="https://tally.so/r/VLJr2y" size="sm">
              APPLY TODAY 🚀
            </ProgramButton>
          </div>

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
