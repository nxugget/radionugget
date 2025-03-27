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

// Option 1 : Utiliser process.cwd() si le dossier "content" se trouve à la racine de votre projet
const POSTS_DIR = path.join(process.cwd(), "content");

// Vérification que le dossier existe
if (!fs.existsSync(POSTS_DIR)) {
  console.error("Le dossier posts n'existe pas:", POSTS_DIR);
}

// Vérifiez le contenu complet du dossier "content"
fs.readdirSync(POSTS_DIR);

export function getAllPosts(): Post[] {
  // Itère sur tous les dossiers de langue (ex: 'en', 'fr')
  const languageFolders = fs.readdirSync(POSTS_DIR).filter((folder) =>
    fs.statSync(path.join(POSTS_DIR, folder)).isDirectory()
  );

  let posts: Post[] = [];
  
  for (const lang of languageFolders) {
    const langPath = path.join(POSTS_DIR, lang);
    // Itère sur les dossiers année dans chaque dossier de langue
    const yearFolders = fs.readdirSync(langPath).filter((folder) =>
      fs.statSync(path.join(langPath, folder)).isDirectory() && /^\d{4}$/.test(folder)
    );

    for (const year of yearFolders) {
      const yearPath = path.join(langPath, year);
      const files = fs.readdirSync(yearPath).filter((file) => file.endsWith(".mdx"));

      for (const file of files) {
        const filePath = path.join(yearPath, file);
        const fileContent = fs.readFileSync(filePath, "utf-8");
        const { data } = matter(fileContent);

        posts.push({
          // Inclut le dossier d'année dans le slug
          slug: `/blog/${year}/${file.replace(".mdx", "")}`,
          metadata: data as PostMetadata,
        });
      }
    }
  }

  // Filtrer les doublons par slug
  posts = posts.filter((post, index, self) =>
    index === self.findIndex(p => p.slug === post.slug)
  );

  posts.sort((a, b) => new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime());
  return posts;
}

export function getPaginatedPosts(page: number, postsPerPage: number) {
  const allPosts = getAllPosts();
  const totalPages = Math.ceil(allPosts.length / postsPerPage);

  return {
    posts: allPosts.slice((page - 1) * postsPerPage, page * postsPerPage),
    totalPages,
  };
}
