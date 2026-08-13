"use client";

import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const summerProgramPhotos = [
  {
    src: "/assets/program/summer/summer-program-02.jpg",
    alt: "Students preparing food together during the summer program",
  },
  {
    src: "/assets/program/summer/summer-program-01.jpg",
    alt: "Students in a small group conversation during the summer program",
  },
  {
    src: "/assets/program/summer/summer-program-03.jpg",
    alt: "Students taking part in a group activity during the summer program",
  },
  {
    src: "/assets/program/summer/summer-program-04.jpg",
    alt: "A student enjoying a barbecue during the summer program",
  },
  {
    src: "/assets/program/summer/summer-program-05.jpg",
    alt: "Students listening to a summer program session",
  },
  {
    src: "/assets/program/summer/summer-program-06.jpg",
    alt: "Students working together around a table during the summer program",
  },
  {
    src: "/assets/program/summer/summer-program-07.jpg",
    alt: "Students posing together outdoors during the summer program",
  },
  {
    src: "/assets/program/summer/summer-program-08.jpg",
    alt: "Students taking a photo together on a forest walk",
  },
  {
    src: "/assets/program/summer/summer-program-09.jpg",
    alt: "The summer program group together in the forest",
  },
  {
    src: "/assets/program/summer/summer-program-10.jpg",
    alt: "Students gathered for a summer program session",
  },
];

export default function ProgramHighlights() {
  return (
    <section
      aria-label="Summer program photo gallery"
      className="bg-black py-3 md:py-4"
    >
      <Carousel
        opts={{ align: "start", dragFree: true, loop: true }}
        className="w-full"
      >
        <CarouselContent className="-ml-2">
          {summerProgramPhotos.map((photo) => (
            <CarouselItem
              key={photo.src}
              className="basis-[84%] pl-2 sm:basis-[58%] lg:basis-[40%] xl:basis-[32%]"
            >
              <div className="relative aspect-4/3 overflow-hidden bg-white/10">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(min-width: 1280px) 32vw, (min-width: 1024px) 40vw, (min-width: 640px) 58vw, 84vw"
                  className="object-cover"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-3 size-11 border-white/70 bg-black/80 text-white shadow-[0_8px_20px_rgba(0,0,0,0.3)] hover:bg-[#f45c36] hover:text-white sm:left-4" />
        <CarouselNext className="right-3 size-11 border-white/70 bg-black/80 text-white shadow-[0_8px_20px_rgba(0,0,0,0.3)] hover:bg-[#f45c36] hover:text-white sm:right-4" />
      </Carousel>
    </section>
  );
}
