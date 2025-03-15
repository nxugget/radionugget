import fs from "fs";
import path from "path";
import matter from "gray-matter";

interface PostMetadata {
  title: string;
  date: string;
  summary: string;
  image: string;
  tags: string[];
}

interface Post {
  slug: string;
  metadata: PostMetadata;
}

const POSTS_DIR = path.join(process.cwd(), "content");

export function getAllPosts(): Post[] {
  const years = fs.readdirSync(POSTS_DIR).filter((year) => /^\d{4}$/.test(year));

  let posts: Post[] = [];
  
  for (const year of years) {
    const yearPath = path.join(POSTS_DIR, year);
    const files = fs.readdirSync(yearPath).filter((file) => file.endsWith(".mdx"));

    for (const file of files) {
      const filePath = path.join(yearPath, file);
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const { data } = matter(fileContent);

      posts.push({
        slug: `/blog/${file.replace(".mdx", "")}`,
        metadata: data as PostMetadata,
      });
    }
  }

  return posts.sort((a, b) => new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime());
}

export function getPaginatedPosts(page: number, postsPerPage: number) {
  const allPosts = getAllPosts();
  const totalPages = Math.ceil(allPosts.length / postsPerPage);

  return {
    posts: allPosts.slice((page - 1) * postsPerPage, page * postsPerPage),
    totalPages,
  };
}
