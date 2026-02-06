"use client";

export default function MarqueeSolid({
  text,
  reverse = false,
  containerClassName = "py-6 bg-[#0a34df] border-t-3 border-b-3 border-white",
  textClassName = "text-[clamp(16px,3vw,24px)] font-bold uppercase mx-8 text-white",
  duration = reverse ? 30 : 80,
}: {
  text: string;
  reverse?: boolean;
  containerClassName?: string;
  textClassName?: string;
  duration?: number;
}) {
  return (
    <>
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
      `}</style>
      <div className={`overflow-hidden whitespace-nowrap ${containerClassName}`}>
        <div
          className="inline-flex"
          style={{
            animation: `${reverse ? "marquee-reverse" : "marquee"} ${duration}s linear infinite`,
          }}
        >
          {[...Array(12)].map((_, i) => (
            <span key={i} className={textClassName}>
              {text}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
