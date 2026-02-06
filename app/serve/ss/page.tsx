import type { Metadata } from "next";
import Footer from "@/app/components/Footer";
import Navbar from "@/app/components/Navbar";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Serve",
  description:
    "We are a family, and like a family, we all must pitch in. Discover how you can care for others and be part of the team.",
};

export default function ServeIndexPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      {/* Hero Section */}
      <section className="flex flex-col lg:flex-row gap-0 lg:gap-8 py-16 px-6 lg:px-16 xl:px-24">
        {/* Left Content */}
        <div className="flex flex-col gap-6 items-center lg:items-start text-center lg:text-left flex-1">
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            <span className="text-black">Youth</span>
          </h1>

          <p className="text-sm md:text-lg max-w-xl leading-relaxed">
            <span className="block">
              We are a family, and like a family, we all must pitch in. We use
              our hands to show our hearts - for God and others. It starts from
              SS@2PM to the rest of the church. Look through each one to
              discover how you can care for others and be part of the team.
            </span>
          </p>

          {/* Mobile Image */}
          <div className="block lg:hidden w-full">
            <Image
              src="/assets/carina-in-van.jpg"
              width={750}
              height={1127}
              alt="Youth serving"
              className="w-full h-auto rounded-lg object-cover"
              priority
            />
          </div>

          {/* Tally Form Embed */}
          <div
            className="w-full"
            dangerouslySetInnerHTML={{
              __html: `<iframe data-tally-src="https://tally.so/embed/wQV24p?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1" loading="lazy" width="100%" height="416" frameborder="0" marginheight="0" marginwidth="0" title="Serving Form"></iframe><script>var d=document,w="https://tally.so/widgets/embed.js",v=function(){"undefined"!=typeof Tally?Tally.loadEmbeds():d.querySelectorAll("iframe[data-tally-src]:not([src])").forEach((function(e){e.src=e.dataset.tallySrc}))};if("undefined"!=typeof Tally)v();else if(d.querySelector('script[src="'+w+'"]')==null){var s=d.createElement("script");s.src=w,s.onload=v,s.onerror=v,d.body.appendChild(s);}</script>`,
            }}
          />
        </div>

        {/* Right Image (Desktop only) */}
        <div className="hidden lg:flex flex-1 items-center justify-center">
          <Image
            src="/assets/carina-in-van.jpg"
            width={750}
            height={1127}
            alt="Youth serving"
            className="w-full max-w-md h-auto rounded-lg object-cover"
            priority
          />
        </div>
      </section>

      <Footer />
    </main>
  );
}
