import { getPostBySlug } from "@/lib/posts";
import { MDXRemote } from "next-mdx-remote/rsc";
import Image from "next/image";

export default function BlogPost({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold text-white">{post.metadata.title}</h1>
      <p className="text-gray-400">{new Date(post.metadata.publishedAt).toLocaleDateString()}</p>

      <Image src={post.metadata.image} alt={post.metadata.title} width={800} height={400} className="rounded-md mt-4" />

      <article className="prose prose-invert mt-6">
        {post.content ? <MDXRemote source={post.content} /> : <p className="text-gray-400">Aucun contenu disponible.</p>}
      </article>

      {/* 🔹 Tags */}
      <div className="mt-6 flex flex-wrap gap-2">
        {post.metadata.tags.map((tag) => (
          <span key={tag} className="bg-purple-700 text-white px-2 py-1 text-xs rounded-md">
            #{tag}
          </span>
        ))}
      </div>
    </main>
  );
}
