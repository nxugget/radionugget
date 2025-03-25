import { getAllPosts } from "./getPosts";

export function getRandomProjects() {
  const posts = getAllPosts();
  // Mélanger le tableau
  for (let i = posts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [posts[i], posts[j]] = [posts[j], posts[i]];
  }
  // Retourner 8 projets uniquement (ajout de "image" pour la preview)
  return posts.slice(0, 8).map(post => ({
    title: post.metadata.title,
    summary: post.metadata.summary,
    path: post.slug,
    image: post.metadata.image
  }));
}
