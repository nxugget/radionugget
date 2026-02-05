import React from "react";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { MDXRemote } from "next-mdx-remote/rsc";
import SmartLink from "../SmartLink";
import ScrollToTopButton from "../ScrollToTopButton";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { synthwave84 } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { Metadata } from "next";

async function getArticleData(locale: string, slug: string) {
  const contentDir = path.join(process.cwd(), "content", locale);
  const years = fs
    .readdirSync(contentDir)
    .filter((year) =>
      fs.statSync(path.join(contentDir, year)).isDirectory()
    );

  for (const year of years) {
    const possiblePath = path.join(contentDir, year, `${slug}.mdx`);
    if (fs.existsSync(possiblePath)) {
      const fileContent = fs.readFileSync(possiblePath, "utf-8");
      const parsed = matter(fileContent);
      return {
        metadata: parsed.data as any,
        content: parsed.content,
      };
    }
  }
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = await getArticleData(locale, slug);

  if (!article) {
    return {
      title: "Article not found",
    };
  }

  const { metadata } = article;
  const url = `https://radionugget.com/${locale}/blog/${slug}`;

  return {
    title: metadata.title,
    description: metadata.summary,
    openGraph: {
      type: "article",
      locale: locale,
      url: url,
      siteName: "RadioNugget",
      title: metadata.title,
      description: metadata.summary,
      images: [
        {
          url: metadata.thumbnail,
          width: 1200,
          height: 630,
          alt: metadata.title,
        },
      ],
      publishedTime: metadata.date,
      modifiedTime: metadata.modifiedDate || metadata.date,
    },
    twitter: {
      card: "summary_large_image",
      title: metadata.title,
      description: metadata.summary,
      images: [metadata.thumbnail],
    },
  };
}

export async function generateStaticParams() {
  const localesDir = path.join(process.cwd(), "content");
  const locales = fs
    .readdirSync(localesDir)
    .filter((locale) =>
      fs.statSync(path.join(localesDir, locale)).isDirectory()
    );
  const params: { locale: string; slug: string }[] = [];

  for (const locale of locales) {
    const contentDir = path.join(localesDir, locale);
    const years = fs
      .readdirSync(contentDir)
      .filter((year) =>
        fs.statSync(path.join(contentDir, year)).isDirectory()
      );
    for (const year of years) {
      const yearDir = path.join(contentDir, year);
      const files = fs
        .readdirSync(yearDir)
        .filter((f) => f.endsWith(".mdx"));
      for (const file of files) {
        params.push({
          locale,
          slug: file.replace(/\.mdx$/, ""),
        });
      }
    }
  }

  return params;
}

export default async function Article({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  if (!slug) {
    return <p className="text-white text-center">404</p>;
  }

  const article = await getArticleData(locale, slug);

  if (!article) {
    return <p className="text-white text-center">404</p>;
  }

  const { metadata, content } = article;

  return (
      <main className="flex justify-center py-6 min-h-screen relative">
        <div className="w-full max-w-6xl px-0 sm:px-6">
          {/* Hero image with fixed aspect ratio to prevent CLS */}
          <div 
            className="relative w-full overflow-hidden rounded-2xl border border-white/[0.06] shadow-card"
            style={{ aspectRatio: '16 / 9' }}
          >
            <img
              src={metadata.thumbnail || "/default-thumbnail.jpg"}
              alt={metadata.title}
              className="object-cover w-full h-full"
              loading="eager"
            />
            
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-end pb-8 px-6 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
              <h1 className="text-2xl md:text-5xl font-bold text-white text-center leading-tight max-w-3xl">
                {metadata.title}
              </h1>
              <div className="w-16 h-0.5 bg-purple mt-4 rounded-full" />
            </div>
          </div>

          {/* ARTICLE CONTAINER */}
          <article
            style={{ fontSize: "calc(0.85rem + 0.4vw)" }}
            className="font-roboto glass-card rounded-2xl p-5 md:p-10 mt-8 prose prose-invert max-w-none relative mx-0 sm:mx-0"
          >
            <MDXRemote
              source={content}
              components={{
                SmartLink: (props) => (
                  <SmartLink
                    {...props}
                    className="text-purple transition-colors duration-300 hover:text-orange"
                  />
                ),
                strong: (props) => (
                  <strong
                    className="text-orange font-semibold"
                    {...props}
                  />
                ),
                em: (props) => <em className="italic" {...props} />,
                a: (props) => (
                  <a
                    className="text-purple transition-colors duration-300 hover:text-orange"
                    {...props}
                  />
                ),
                p: (props) => (
                  <div className="mb-5 leading-relaxed text-gray-200">
                    {props.children}
                  </div>
                ),
                h1: (props) => (
                  <h1
                    className="text-3xl md:text-4xl font-bold mt-10 mb-5 text-white pb-3 border-b border-white/[0.08]"
                    {...props}
                  />
                ),
                h2: (props) => (
                  <h2
                    className="text-2xl md:text-3xl font-bold mt-8 mb-4 text-white"
                    {...props}
                  />
                ),
                h3: (props) => (
                  <h3
                    className="text-xl md:text-2xl font-semibold mt-6 mb-3 text-white"
                    {...props}
                  />
                ),
                img: (props) => {
                  const isGif = props.src?.toLowerCase().endsWith(".gif");
                  return (
                    <figure className="flex justify-center my-8 w-full">
                      <img
                        src={props.src || ""}
                        alt={props.alt || "Image"}
                        width={900}
                        height={500}
                        className="rounded-xl border border-white/[0.06] max-w-full shadow-card"
                        style={{ width: "auto", height: "auto" }}
                        loading="lazy"
                      />
                    </figure>
                  );
                },
                div: (props) => <div {...props} />,
                code: (props) => (
                  <code className="font-fira bg-white/[0.06] border border-white/[0.06] px-2 py-0.5 rounded-md text-[0.9em] text-purple-300">
                    {props.children}
                  </code>
                ),
                pre: ({ children }) => {
                  const match =
                    children?.props?.className?.match(/language-(\w+)/);
                  const language = match ? match[1] : "plaintext";
                  return (
                    <SyntaxHighlighter
                      style={synthwave84}
                      language={language}
                      PreTag="div"
                      className="rounded-lg p-4 text-sm overflow-x-auto"
                    >
                      {children.props.children}
                    </SyntaxHighlighter>
                  );
                },
                ul: (props) => (
                  <ul
                    className="list-disc list-outside pl-8 mb-4 text-gray-200 space-y-1"
                    {...props}
                  />
                ),
                li: (props) => <li className="mb-1 leading-relaxed" {...props} />,
                head: () => null,
              }}
            />
          </article>
        </div>
        <ScrollToTopButton />
      </main>
  );
}
