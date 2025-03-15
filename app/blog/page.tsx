import fs from "fs";
import path from "path";
import matter from "gray-matter";
import Link from "next/link";
import Image from "next/image";
import { CardContainer, CardBody, CardItem } from "../components/3D-card";

const POSTS_PER_PAGE = 6;

export default async function Blog({ searchParams }: { searchParams?: { page?: string; tag?: string } }) {
  const currentPage = searchParams?.page ? parseInt(searchParams.page, 10) : 1;
  const activeTag = searchParams?.tag || ""; // Tag actif sélectionné (vide = tous les articles)

  const contentDir = path.join(process.cwd(), "content");

  // ✅ Récupération des articles
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

  // ✅ Extraction des tags uniques
  const allTags = Array.from(new Set(articles.flatMap((article) => article.metadata.tags)));

  // ✅ Filtrage des articles par tag si un tag est sélectionné
  const filteredArticles = activeTag
    ? articles.filter((article) => article.metadata.tags.includes(activeTag))
    : articles;

  // ✅ Gestion de la pagination
  const totalPages = Math.ceil(filteredArticles.length / POSTS_PER_PAGE);
  const displayedArticles = filteredArticles.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE);

  return (
    <main className="h-screen flex flex-col items-center mx-auto w-full px-6 md:px-20 pt-10">
      
      {/* ✅ Filtres par tag */}
      <div className="flex flex-wrap gap-4 mb-6">
        {allTags.map((tag) => (
          <Link
            key={tag}
            href={activeTag === tag ? "/blog" : `/blog?tag=${tag}`} // Basculer l'état du tag
            className={`px-4 py-2 rounded-md text-white font-bold ${
              activeTag === tag ? "bg-purple-700" : "bg-gray-800 hover:bg-purple-600"
            }`}
          >
            #{tag}
          </Link>
        ))}
      </div>

      {/* ✅ Grille des articles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full ">
        {displayedArticles.map(({ slug, metadata }) => (
          <CardContainer key={slug} className="inter-var">
            <Link href={`/blog/${slug}`} className="w-full">
              <CardBody className="bg-black relative group/card border border-white/[0.2] h-[40vh] w-[50vh] flex flex-col justify-between rounded-xl p-6">
                
                <CardItem translateZ="60" className="text-2xl font-bold text-white h-[65px] flex items-center">
                  {metadata.title}
                </CardItem>

                <CardItem as="p" translateZ="50" className="text-gray-400 text-md h-[20px]">
                  {new Date(metadata.date).toLocaleDateString('fr-FR')}
                </CardItem>

                <CardItem translateZ="120" className="w-full mt-2">
                  <Image
                    src={metadata.thumbnail}
                    alt={metadata.title}
                    width={800}
                    height={180}
                    className="h-[18vh] w-full object-cover"
                  />
                </CardItem>

                <div className="mt-2 flex flex-wrap gap-2">
                  {metadata.tags.map((tag: string) => (
                    <CardItem key={tag} translateZ="30" as="span" className="bg-purple-700 text-white px-4 py-2 text-md font-medium rounded-md">
                      #{tag}
                    </CardItem>
                  ))}
                </div>

              </CardBody>
            </Link>
          </CardContainer>
        ))}
      </div>

      {/* ✅ Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8 space-x-4 pb-6">
          {Array.from({ length: totalPages }).map((_, index) => (
            <Link
              key={index}
              href={`/blog?page=${index + 1}${activeTag ? `&tag=${activeTag}` : ""}`}
              className={`px-6 py-4 rounded-lg text-white font-bold ${
                index + 1 === currentPage ? "bg-purple-700" : "bg-gray-800 hover:bg-purple-600"
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
