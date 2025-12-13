import { ProjectCard } from "@/src/components/ui/ProjectCard";

export type ProjectItem = {
  title: string;
  image: string;
  link: string;
  type: string;
};

interface ProjectsGridProps {
  title: string;
  items: ProjectItem[];
  priorityCount?: number;
}

const gridClasses = `
  grid w-full
  gap-5 sm:gap-6
  grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
  items-stretch
  sm:auto-rows-fr
`;

// Grille des projets sélectionnés (blog + outils)
export function ProjectsGrid({ title, items, priorityCount = 2 }: ProjectsGridProps) {
  return (
    <section
      id="projects-section"
      className="relative flex flex-col items-center z-0 w-full justify-start h-auto sm:h-screen bg-black overflow-visible sm:overflow-hidden"
    >
      <div className="h-24 sm:h-18 md:h-20" />
      <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-6xl font-bold text-white font-alien tracking-wide z-10 mb-4 sm:mb-4 md:mb-5 text-center px-6 drop-shadow-[0_6px_18px_rgba(0,0,0,0.6)] flex-shrink-0">
        {title}
      </h2>
      <div className="w-full flex justify-center z-10 relative px-6 pb-6 sm:pb-10 sm:flex-1 sm:min-h-0">
        <div className="relative w-full max-w-none sm:h-full sm:pb-4">
          <div className={gridClasses}>
            {items.map((item, idx) => (
              <ProjectCard
                key={idx}
                href={item.link}
                title={item.title}
                image={item.image}
                label={item.type}
                priority={idx < priorityCount}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
