export type EpisodeVariant = "blue" | "lime";

export interface Episode {
  number: number;
  title: string;
  date?: string | null;
  alphaWeekend?: boolean;
  variant: EpisodeVariant;
  isBold?: boolean;
}

interface EpisodeCardProps {
  episode: Episode;
}

export function EpisodeCard({ episode }: EpisodeCardProps) {
  const isBlue = episode.variant === "blue";

  return (
    <div
      className="flex flex-col items-left justify-center text-left uppercase font-inter min-w-81.25 min-h-81.25 py-5 px-10 gap-2.5"
      style={{
        backgroundColor: `var(--alpha-${episode.variant})`,
        color: isBlue ? "white" : "black",
      }}
    >
      <p className="text-[20px] font-bold tracking-[0.05em]">
        Episode {episode.number}
      </p>
      <h3 className="text-[28px] leading-none font-extrabold uppercase">
        {episode.isBold ? <strong>{episode.title}</strong> : episode.title}
      </h3>
      {episode.date && (
        <p className="text-[14px] tracking-[0.05em] py-1.25">{episode.date}</p>
      )}
      {episode.alphaWeekend && (
        <a
          href="#alpha-weekend"
          className="text-[14px] tracking-[0.05em] underline py-1.25 px-2.5"
          style={{ color: isBlue ? "white" : "black" }}
        >
          Alpha weekend getaway
        </a>
      )}
    </div>
  );
}
