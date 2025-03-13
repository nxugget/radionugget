import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDir = path.join(process.cwd(), "content");

interface PostMetadata {
  title: string;
  publishedAt: string;
  summary: string;
  image: string;
  tags: string[];
}

interface Post {
  slug: string;
  metadata: PostMetadata;
  content?: string;
}

/** 🔹 Récupérer tous les articles */
export const getAllPosts = (): Post[] => {
  return fs.readdirSync(postsDir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const filePath = path.join(postsDir, file);
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const { data, content } = matter(fileContent);

      return {
        slug: file.replace(".md", ""),
        metadata: data as PostMetadata,
        content,
      };
    })
    .sort((a, b) => new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime());
};

/** 🔹 Pagination des articles */
export const getPaginatedPosts = (page: number, perPage: number) => {
  const allPosts = getAllPosts();
  const totalPages = Math.ceil(allPosts.length / perPage);
  const posts = allPosts.slice((page - 1) * perPage, page * perPage);

  return { posts, totalPages };
};

/** 🔹 Récupérer un article par son slug */
export const getPostBySlug = (slug: string): Post => {
  const filePath = path.join(postsDir, `${slug}.md`);
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(fileContent);

  return {
    slug,
    metadata: data as PostMetadata,
    content,
  };
};
