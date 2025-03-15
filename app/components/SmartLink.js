import Link from "next/link";
import { getAllArticles } from "@/lib/getArticles";

const articles = getAllArticles();

export default function SmartLink({ slug, children }) {
  const article = articles.find((art) => art.slug === slug);
  
  if (!article) {
    console.warn(`❌ Article avec le slug "${slug}" introuvable.`);
    return <span>{children}</span>;
  }

  return <Link href={article.path} className="text-blue-500 hover:underline">{children}</Link>;
}
