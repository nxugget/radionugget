import fs from "fs";
import path from "path";
import matter from "gray-matter";
import Link from "next/link";
import Image from "next/image";
import { CardContainer, CardBody, CardItem } from "./3Dcard";

const POSTS_PER_PAGE = 6;

export default async function Blog({ searchParams }: { searchParams?: { page?: string; tag?: string } }) {
  const currentPage = searchParams?.page ? parseInt(searchParams.page, 10) : 1;
  const activeTag = searchParams?.tag || "";

  const contentDir = path.join(process.cwd(), "content");

  const articles = fs
    .readdirSync(contentDir)
    .flatMap((year) =>
      fs
        .readdirSync(path.join(contentDir, year))
        .filter((file) => file.endsWith(".mdx"))
        .map((file) => {
          const filePath = path.join(contentDir, year, file);
          const fileContent = fs.readFileSync(filePath, "utf-8");
          const { data } = matter(fileContent);

          return {
            slug: file.replace(".mdx", ""),
            year,
            metadata: data,
          };
        })
    )
    .sort((a, b) => new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime());

  const allTags = Array.from(new Set(articles.flatMap((article) => article.metadata.tags)));

  const filteredArticles = activeTag
    ? articles.filter((article) => article.metadata.tags.includes(activeTag))
    : articles;

  const totalPages = Math.ceil(filteredArticles.length / POSTS_PER_PAGE);
  const displayedArticles = filteredArticles.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE);

  return (
    <main className="flex flex-col items-center mx-auto w-full px-4 sm:px-10 lg:px-20 pt-5">

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
          <CardContainer key={slug} className="inter-var bg-grid-white/[0.1] dark:bg-grid-gray-800/[0.2] h-full">
            <Link href={`/blog/${slug}`} className="w-full h-full">
              <CardBody className="bg-[#1d1c1c] relative group/card border border-white/[0.2] h-full flex flex-col justify-between rounded-xl p-6">
                
                {/* ✅ Titre */}
                <CardItem translateZ="60" className="text-2xl font-bold text-white">
                  {metadata.title}
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
                    className="w-full h-auto aspect-video object-cover rounded-lg"
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
            </Link>
          </CardContainer>
        ))}
      </div>

      {/* ✅ Pagination responsive */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8 space-x-2 pb-10">
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
