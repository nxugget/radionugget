import Link from "next/link";
import { getAllArticles } from "@/src/lib/getArticles";
import clsx from "clsx"; 

const articles = getAllArticles();

export default function SmartLink({ slug, children, className, ...props }) {
  const article = articles.find((art) => art.slug === slug);

  if (!article) {
    console.warn(`❌ Article avec le slug "${slug}" introuvable.`);
    return <span className={clsx("text-gray-400 italic", className)}>{children}</span>;
  }

  return (
    <Link
      href={article.path}
      className={clsx(
        "text-purple transition-colors duration-300 hover:text-[#8000bf]", 
        className 
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
