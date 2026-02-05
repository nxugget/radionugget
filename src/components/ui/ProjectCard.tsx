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
      className={`group relative overflow-hidden rounded-xl border border-white/[0.06] shadow-card transition-all duration-500 ease-expo-out hover:shadow-card-hover hover:border-purple/20 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple/40 aspect-[4/3] ${className}`}
      aria-label={title}
    >
      <div className="absolute inset-0 overflow-hidden rounded-xl">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-700 ease-expo-out group-hover:scale-110"
          sizes={sizes}
          priority={priority}
          quality={85}
        />
      </div>
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-all duration-500 group-hover:from-black/80 rounded-xl" />
      {/* Content positioned at bottom */}
      <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-5 rounded-xl">
        <div className="flex flex-col gap-2">
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white leading-tight drop-shadow-lg">
            {title}
          </h3>
          <div className="badge w-fit">
            {label}
          </div>
        </div>
      </div>
    </Link>
  );
}