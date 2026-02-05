import fs from "fs";
import path from "path";
import matter from "gray-matter";
import Link from "next/link";

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
        className="flex flex-col items-center mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-2 pb-0"
        style={{
          minHeight: "calc(100vh - 96px - 60px)",
          display: "flex",
          flexDirection: "column"
        }}
      >
        {/* ─── Tag filters ─── */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {allTags.map((tag) => (
            <Link
              key={tag}
              href={
                activeTag === tag
                  ? baseBlogPath
                  : `${baseBlogPath}?tag=${encodeURIComponent(tag)}`
              }
              className={`px-3.5 py-1.5 text-xs font-medium tracking-wider uppercase rounded-full transition-all duration-200 ${
                activeTag === tag
                  ? "bg-purple text-white shadow-glow-sm border border-purple"
                  : "bg-surface-2 text-gray-300 border border-white/[0.1] hover:text-white hover:bg-purple/20 hover:border-purple/30"
              }`}
            >
              #{tag}
            </Link>
          ))}
        </div>

        <div className="w-full flex flex-col flex-1" style={{ minHeight: 0 }}>
          <div
            className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch flex-1"
            style={{ gridAutoRows: "1fr", minHeight: 0 }}
          >
            {displayedArticles.map(({ slug, metadata }) => {
              const label = (metadata.tags ?? [])[0] ?? "Article";
              const title = locale === "fr" && metadata.title_fr ? metadata.title_fr : metadata.title;
              const summary = locale === "fr" && metadata.summary_fr ? metadata.summary_fr : metadata.summary;
              return (
                <Link
                  key={slug}
                  href={`/${locale}/blog/${slug}`}
                  className="blog-card group h-full w-full flex flex-col aspect-[4/3]"
                  aria-label={title}
                >
                  {/* Image */}
                  <div className="absolute inset-0 overflow-hidden rounded-[inherit]">
                    <img
                      src={metadata.thumbnail}
                      alt={title}
                      className="object-cover blog-card-image w-full h-full"
                      loading="lazy"
                    />
                  </div>
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent rounded-[inherit] transition-all duration-500 group-hover:from-black/95 group-hover:via-black/50" />
                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-5 rounded-[inherit] blog-card-content">
                    <div className="flex flex-col gap-2">
                      {/* Title */}
                      <h3 className="text-base sm:text-lg md:text-xl font-bold text-white leading-snug">
                        {title}
                      </h3>
                      {/* Summary - revealed on hover */}
                      {summary && (
                        <p className="blog-card-summary text-xs sm:text-sm text-gray-300 leading-relaxed line-clamp-2">
                          {summary}
                        </p>
                      )}
                      {/* Tag badge */}
                      <div className="badge w-fit text-[10px] mt-1">
                        {label}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center flex-wrap gap-2 mt-auto pt-8 mb-0">
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
                    className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 ${
                      page === currentPage
                        ? "bg-purple text-white shadow-glow"
                        : "bg-white/[0.04] border border-white/[0.06] text-gray-400 hover:text-white hover:bg-white/[0.08] hover:border-purple/30"
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
