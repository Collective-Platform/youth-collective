import Image from "next/image";

interface TaglineBannerProps {
  imageSrc: string;
  imageAlt?: string;
  justify?: "left" | "right" | "center";
  children: React.ReactNode;
}

export default function TaglineBanner({
  imageSrc,
  imageAlt = "Banner background",
  justify = "center",
  children,
}: TaglineBannerProps) {
  const justifyClass = {
    left: "items-start text-left",
    right: "items-end text-left",
    center: "items-center text-center",
  }[justify];

  return (
    <section className="relative w-full my-8">
      <div className="relative aspect-video w-full overflow-hidden">
        <Image src={imageSrc} alt={imageAlt} fill className="object-cover" />
        <div className="absolute inset-0 bg-black/40" />
        <div
          className={`absolute inset-0 flex flex-col justify-center px-8 md:px-16 ${justifyClass}`}
        >
          <h2 className="text-2xl md:text-4xl lg:text-6xl font-black text-black max-w-3xl bg-white px-2 lg:py-4">
            {children}
          </h2>
        </div>
      </div>
    </section>
  );
}
