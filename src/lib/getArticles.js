import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const CONTENT_PATH = path.join(process.cwd(), 'content');

export function getAllArticles() {
  const years = fs.readdirSync(CONTENT_PATH);
  let articles = [];

  years.forEach((year) => {
    const dirPath = path.join(CONTENT_PATH, year);
    if (fs.statSync(dirPath).isDirectory()) {
      const files = fs.readdirSync(dirPath);
      files.forEach((file) => {
        if (file.endsWith('.mdx')) {
          const filePath = path.join(dirPath, file);
          const fileContents = fs.readFileSync(filePath, 'utf8');
          const { data } = matter(fileContents);

          articles.push({
            ...data,
            year,
            path: `/blog/${data.slug}`, // ✅ Utilisation du slug seul !
          });
        }
      });
    }
  });

  return articles;
}
