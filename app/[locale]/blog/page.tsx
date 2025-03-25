import fs from "fs";
import path from "path";
import matter from "gray-matter";
import Link from "next/link";
import Image from "next/image";
import { CardContainer, CardBody, CardItem } from "./3Dcard";

const POSTS_PER_PAGE = 6;

export const revalidate = 60; 

export default async function Blog({
  params,
  searchParams
}: { params: { locale: string }; searchParams?: { page?: string; tag?: string } }) {
  const locale = params.locale; // récupération de la locale depuis params
  const currentPage = searchParams?.page ? parseInt(searchParams.page, 10) : 1;
  const activeTag = searchParams?.tag || "";

  const contentDir = path.join(process.cwd(), "content", locale);

  // --- CHANGÉ : utilisation de fs.promises pour le traitement asynchrone ---
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
              metadata: data,
            };
          })
      );
    })
  );
  const articles = articlesNested.flat().sort((a, b) => new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime());

  const allTags = Array.from(new Set(articles.flatMap((article) => article.metadata.tags)));

  const filteredArticles = activeTag
    ? articles.filter((article) => article.metadata.tags.includes(activeTag))
    : articles;

  const totalPages = Math.ceil(filteredArticles.length / POSTS_PER_PAGE);
  const displayedArticles = filteredArticles.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE);

  return (
    <main className="min-h-screen flex flex-col items-center mx-auto w-full px-4 sm:px-10 lg:px-20 pt-5">

      {/* ✅ Filtres par tag */}
      <div className="flex flex-wrap gap-3 mb-6 justify-center">
        {allTags.map((tag) => (
          <Link
            key={tag}
            href={activeTag === tag ? "/blog" : `/blog?tag=${tag}`}
            className={`px-4 py-2 rounded-md text-white font-bold ${
              activeTag === tag ? "bg-purple" : "bg-gray-900 hover:bg-purple"
            }`}
          >
            #{tag}
          </Link>
        ))}
      </div>

      {/* ✅ Grid responsive avec hauteur uniforme */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {displayedArticles.map(({ slug, metadata }) => (
          <CardContainer
            key={slug}
            className={`inter-var h-full ${"sm:perspective-1000"}`} // Disable 3D effect on mobile
          >
            <Link href={`/${locale}/blog/${slug}`} className="w-full h-full">
              {/* Nouveau wrapper qui assure un fond noir opaque avec grille */}
              <div
                className={`w-full min-h-screen bg-grid rounded-xl overflow-hidden sm:h-auto`} // Ensure full height on mobile
                style={{ "--gap": "2em", "--line": "1px", "--color": "rgba(255,255,255,0.2)" } as React.CSSProperties}
              >
                <CardBody
                  className={`bg-transparent relative group/card border-0 h-full flex flex-col justify-between rounded-none p-6`} // Remove borders and gaps on mobile
                >
                  
                  {/* ✅ Titre traduit selon la locale */}
                  <CardItem translateZ="60" className="text-2xl font-bold text-white">
                    {locale === "fr" && metadata.title_fr ? metadata.title_fr : metadata.title}
                  </CardItem>

                  {/* ✅ Date */}
                  <CardItem as="p" translateZ="50" className="text-gray-400 text-sm mt-2">
                    {new Date(metadata.date).toLocaleDateString('fr-FR')}
                  </CardItem>

                  {/* ✅ Image avec aspect-ratio pour uniformiser la hauteur */}
                  <CardItem translateZ="120" className="w-full mt-3">
                    <Image
                      src={metadata.thumbnail}
                      alt={metadata.title}
                      width={800}
                      height={200}
                      className="w-full h-auto aspect-video object-cover rounded-lg filter brightness-100" // modified to enforce constant brightness
                    />
                  </CardItem>

                  {/* ✅ Tags */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {metadata.tags.map((tag: string) => (
                      <CardItem key={tag} translateZ="30" as="span" className="bg-purple text-white px-4 py-2 text-sm font-medium rounded-md">
                        #{tag}
                      </CardItem>
                    ))}
                  </div>

                </CardBody>
              </div>
            </Link>
          </CardContainer>
        ))}
      </div>

      {/* ✅ Pagination responsive */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8 space-x-2 mb-2">
          {Array.from({ length: totalPages }).map((_, index) => (
            <Link
              key={index}
              href={`/blog?page=${index + 1}${activeTag ? `&tag=${activeTag}` : ""}`}
              className={`px-5 py-3 rounded-lg text-white font-bold text-sm sm:text-base ${
                index + 1 === currentPage ? "bg-purple" : "bg-gray-900 hover:bg-purple"
              }`}
            >
              {index + 1}
            </Link>
          ))}
        </div>
      )}

    </main>
  );
}
