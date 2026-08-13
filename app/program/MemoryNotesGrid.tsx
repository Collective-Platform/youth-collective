"use client";

import Image from "next/image";

type MemoryNote = {
  title: string;
  copy: string;
  image: string;
  alt: string;
};

export default function MemoryNotesGrid({ notes }: { notes: readonly MemoryNote[] }) {
  const cropPositions = [80, 70, 50, 50] as const;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 md:gap-6">
        {notes.map((note, index) => (
          <article key={note.title} className="group relative overflow-hidden border-2 border-black bg-[#f45c36] text-black">
            <div className="relative aspect-[1.5] overflow-hidden sm:aspect-[1.8]">
              <Image
                src={note.image}
                alt={note.alt}
                fill
                sizes="(min-width: 768px) 52vw, 100vw"
                style={{ objectPosition: `center ${cropPositions[index]}%` }}
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.035]"
              />
              <div className="absolute inset-0 bg-black/35" />
            </div>
            <div className="bg-[#f45c36] p-5 sm:p-6">
              <h3 className="max-w-xl font-heading text-2xl leading-[1.05] sm:text-xl">{note.title}</h3>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-black/80">{note.copy}</p>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
