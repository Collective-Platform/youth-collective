"use client";

type MemoryNote = {
  title: string;
  copy: string;
};

export default function MemoryNotesGrid({ notes }: { notes: readonly MemoryNote[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 md:gap-6">
      {notes.map((note) => (
        <article key={note.title} className="border-2 border-black bg-[#f45c36] p-5 text-black sm:p-6">
          <h3 className="max-w-xl font-heading text-2xl leading-[1.05] sm:text-xl">{note.title}</h3>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-black/80">{note.copy}</p>
        </article>
      ))}
    </div>
  );
}
