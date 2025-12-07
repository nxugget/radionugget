import Image from "next/image";
import Link from "next/link";

interface ProjectCardProps {
  href: string;
  title: string;
  image: string;
  label: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
}

export function ProjectCard({
  href,
  title,
  image,
  label,
  priority = false,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  className = "",
}: ProjectCardProps) {
  return (
    <Link
      href={href}
      className={`group relative rounded-xl shadow-[0_12px_50px_rgba(0,0,0,0.45)] transition-all duration-300 hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-white/30 aspect-[4/3] ${className}`}
      aria-label={title}
    >
      <div className="absolute inset-0 overflow-hidden rounded-xl">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes={sizes}
          priority={priority}
          quality={85}
        />
      </div>
      <div className="absolute inset-0 bg-black/25 transition-colors duration-300 group-hover:bg-black/35 rounded-xl" />
      <div className="absolute inset-0 flex items-center justify-center text-center px-4 rounded-xl">
        <div className="flex flex-col items-center gap-2">
          <div className="px-8 py-4 rounded-2xl bg-black/30 backdrop-blur-xl text-xl sm:text-2xl md:text-3xl font-bold text-white drop-shadow-[0_12px_26px_rgba(0,0,0,0.6)]">
            {title}
          </div>
          <div className="px-3 py-1.5 rounded-full bg-black/65 text-[0.6rem] xs:text-[0.7rem] sm:text-[0.75rem] font-semibold uppercase tracking-wide text-white border border-white/20 shadow-md">
            {label}
          </div>
        </div>
      </div>
    </Link>
  );
}