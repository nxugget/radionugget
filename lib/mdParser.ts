import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const contentDirectory = path.join(process.cwd(), "content");

export function getAllPosts() {
  const categories = fs.readdirSync(contentDirectory);

  let posts: { title: string; slug: string; date: string; category: string }[] = [];

  categories.forEach((category) => {
    const categoryPath = path.join(contentDirectory, category);
    const files = fs.readdirSync(categoryPath);

    files.forEach((filename) => {
      const filePath = path.join(categoryPath, filename);
      const fileContents = fs.readFileSync(filePath, "utf8");
      const { data } = matter(fileContents);

      posts.push({
        title: data.title,
        slug: `${category}/${filename.replace(".md", "")}`,
        date: data.date,
        category,
      });
    });
  });

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getPostBySlug(category: string, slug: string) {
  const filePath = path.join(contentDirectory, category, `${slug}.md`);
  const fileContents = fs.readFileSync(filePath, "utf8");

  const { data, content } = matter(fileContents);
  const processedContent = await remark().use(html).process(content);
  const contentHtml = processedContent.toString();

  return {
    title: data.title,
    date: data.date,
    content: contentHtml,
    category,
  };
}
