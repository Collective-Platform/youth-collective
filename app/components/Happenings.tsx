export interface Announcement {
  id: string;
  title: string;
  description?: string;
  date?: string;
  link?: string;
}

interface HappeningsProps {
  announcements: Announcement[];
}

export default function Happenings({ announcements }: HappeningsProps) {
  if (announcements.length === 0) {
    return null;
  }

  return (
    <section className="py-4 md:py-16 px-4 max-w-4xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-heading mb-6">Happenings</h2>

      <p className="text-sm md:text-lg  mb-8">
        Look forward to upcoming events available throughout the year to have
        fun, make new friends and form our lives around Jesus.
      </p>

      <div className="space-y-4 mb-8">
        {announcements.map((item) => (
          <div key={item.id} className="border-b border-gray-200 pb-4">
            <h3 className="font-bold text-lg">{item.title}</h3>
            {item.date && <p className="text-sm text-gray-500">{item.date}</p>}
            {item.description && (
              <p className=" mt-1">{item.description}</p>
            )}
          </div>
        ))}
      </div>

      <hr className="border-gray-300" />
    </section>
  );
}
