import fs from "fs";
import path from "path";
import matter from "gray-matter";
import Link from "next/link";
import { ProjectCard } from "@/src/components/ui/ProjectCard";

const POSTS_PER_PAGE = 6;

export const revalidate = 60;

export default async function Blog({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ page?: string; tag?: string }>;
}) {
  // On récupère locale depuis le Promise params
  const { locale: rawLocale } = await params;
  const locale = (rawLocale ?? "en").toLowerCase();

  // Await searchParams comme c'est maintenant un Promise dans Next.js 16
  const resolvedSearchParams = await searchParams;
  const currentPage = resolvedSearchParams?.page ? parseInt(resolvedSearchParams.page, 10) : 1;
  const activeTag = resolvedSearchParams?.tag || "";

  const contentDir = path.join(process.cwd(), "content", locale);

  try {
    const years = await fs.promises.readdir(contentDir);

    const articlesNested = await Promise.all(
      years.map(async (year) => {
        const files = await fs.promises.readdir(path.join(contentDir, year));

        return Promise.all(
          files
            .filter((file) => file.endsWith(".mdx"))
            .map(async (file) => {
              const filePath = path.join(contentDir, year, file);
              const fileContent = await fs.promises.readFile(filePath, "utf-8");
              const { data } = matter(fileContent);

              return {
                slug: file.replace(".mdx", ""),
                year,
                metadata: data as any,
              };
            })
        );
      })
    );

    const articles = articlesNested
      .flat()
      .sort(
        (a, b) =>
          new Date(b.metadata.date).getTime() -
          new Date(a.metadata.date).getTime()
      );

    const allTags = Array.from(
      new Set(articles.flatMap((article) => article.metadata.tags ?? []))
    );

    const filteredArticles = activeTag
      ? articles.filter((article) =>
          (article.metadata.tags ?? []).includes(activeTag)
        )
      : articles;

    const totalPages = Math.ceil(filteredArticles.length / POSTS_PER_PAGE);
    const displayedArticles = filteredArticles.slice(
      (currentPage - 1) * POSTS_PER_PAGE,
      currentPage * POSTS_PER_PAGE
    );

    const baseBlogPath = `/${locale}/blog`;

    return (
      <main
        className="flex flex-col items-center mx-auto w-full px-4 sm:px-10 lg:px-20 pt-1 pb-0"
      >
        <div className="flex flex-wrap gap-2 mt-0 mb-3 justify-center">
          {allTags.map((tag) => (
            <Link
              key={tag}
              href={
                activeTag === tag
                  ? baseBlogPath
                  : `${baseBlogPath}?tag=${encodeURIComponent(tag)}`
              }
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-white font-bold text-sm sm:text-base ${
                activeTag === tag
                  ? "bg-purple"
                  : "bg-gray-900 hover:bg-purple"
              }`}
            >
              #{tag}
            </Link>
          ))}
        </div>

        <div className="w-full flex flex-col flex-1">
          <div
            className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch"
            style={{ gridAutoRows: "1fr", minHeight: 0 }}
          >
            {displayedArticles.map(({ slug, metadata }) => {
              const label = (metadata.tags ?? [])[0] ?? "Article";
              const title = locale === "fr" && metadata.title_fr ? metadata.title_fr : metadata.title;
              return (
                <ProjectCard
                  key={slug}
                  href={`/${locale}/blog/${slug}`}
                  title={title}
                  image={metadata.thumbnail}
                  label={label}
                  className="h-full w-full"
                  sizes="(max-width: 480px) 90vw, (max-width: 768px) 45vw, 30vw"
                />
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center flex-wrap gap-2 mt-6 mb-0">
              {Array.from({ length: totalPages }).map((_, index) => {
                const page = index + 1;
                const href =
                  page === 1 && !activeTag
                    ? baseBlogPath
                    : `${baseBlogPath}?page=${page}${
                        activeTag
                          ? `&tag=${encodeURIComponent(activeTag)}`
                          : ""
                      }`;

                return (
                  <Link
                    key={page}
                    href={href}
                    aria-current={page === currentPage ? "page" : undefined}
                    className={`px-5 py-3 rounded-lg text-white font-bold text-sm sm:text-base ${
                      page === currentPage
                        ? "bg-purple"
                        : "bg-gray-900 hover:bg-purple"
                    }`}
                  >
                    {page}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    );
  } catch (error) {
    console.error("Error loading blog data:", error);
    return (
      <p className="text-center text-white">
        Une erreur est survenue lors du chargement des articles.
      </p>
    );
  }
}
