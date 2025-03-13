import { getPaginatedPosts } from "@/lib/posts";
import Link from "next/link";
import Image from "next/image";

const POSTS_PER_PAGE = 6;

export default function Blog({ searchParams }: { searchParams?: { page?: string } }) {
  const currentPage = searchParams?.page ? parseInt(searchParams.page) : 1;
  const { posts, totalPages } = getPaginatedPosts(currentPage, POSTS_PER_PAGE);

  return (
    <main className="p-6">
      <h1 className="text-4xl font-bold text-white text-center">📚 Blog</h1>

      <div className="mt-8 space-y-8">
        {posts.map(({ slug, metadata }) => (
          <Link key={slug} href={`/blog/${slug}`} className="block bg-gray-900 p-6 rounded-xl shadow-md hover:bg-gray-800 transition">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <Image src={metadata.image} alt={metadata.title} width={120} height={80} className="rounded-md" />
              <div>
                <h2 className="text-xl font-semibold text-white">{metadata.title}</h2>
                <p className="text-gray-400 text-sm">{new Date(metadata.publishedAt).toLocaleDateString()}</p>
                <p className="mt-2 text-gray-300">{metadata.summary}</p>

                {/* 🔹 Tags */}
                {metadata.tags && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {metadata.tags.map((tag) => (
                      <span key={tag} className="bg-purple-700 text-white px-2 py-1 text-xs rounded-md">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* 🔹 Pagination */}
      <div className="flex justify-center items-center space-x-4 mt-8">
        {currentPage > 1 && (
          <Link href={`?page=${currentPage - 1}`} className="text-purple-400 hover:underline">
            ← Précédent
          </Link>
        )}
        <span className="text-white">{currentPage} / {totalPages}</span>
        {currentPage < totalPages && (
          <Link href={`?page=${currentPage + 1}`} className="text-purple-400 hover:underline">
            Suivant →
          </Link>
        )}
      </div>
    </main>
  );
}
