"use client";

import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

const skillSetItems = [
  {
    title: "The Bible",
    desc: "Is the Bible actually trustworthy and reliable? Look at the evidence, ask honest questions, and explore it for yourself.",
    image: "/assets/program/bible.jpg",
  },
  {
    title: "Finance",
    desc: "Learn to manage money as someone who trusts God, not someone who's just trying to survive.",
    image: "/assets/program/finance-workshop.jpg",
  },
  {
    title: "Healthy Relationships",
    desc: "Relationships shape us more than we think. Learn how to communicate honestly, love wisely, and build connections that last.",
    image: "/assets/program/life2.jpg",
  },
];

export default function SkillSetSlider() {
  return (
    <div className="w-full md:max-w-4xl md:mx-auto px-0 md:px-12">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {skillSetItems.map((item, i) => (
            <CarouselItem key={i}>
              <div className="relative aspect-5/4 md:aspect-video overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/50" />
                <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12 text-left">
                  <h3 className="text-2xl md:text-4xl font-black uppercase text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-white text-sm md:text-lg leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex bg-white/10 hover:bg-white/20 border-0 text-white" />
        <CarouselNext className="hidden md:flex bg-white/10 hover:bg-white/20 border-0 text-white" />
      </Carousel>
    </div>
  );
}
