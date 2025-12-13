import React from "react";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { MDXRemote } from "next-mdx-remote/rsc";
import Image from "next/image";
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
      <main className="flex justify-center py-8 min-h-screen relative">
        <div className="w-full max-w-7xl px-0 sm:px-8">
          {/* Hero image with fixed aspect ratio to prevent CLS */}
          <div 
            className="relative w-full overflow-hidden rounded-lg shadow-lg"
            style={{ aspectRatio: '16 / 9' }}
          >
            <Image
              src={metadata.thumbnail || "/default-thumbnail.jpg"}
              alt={metadata.title}
              fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              className="object-cover"
              quality={75}
              priority
              placeholder="blur"
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFdgI2gSHnWAAAAABJRU5ErkJggg=="
            />
            
            <div className="absolute inset-0 z-10 flex items-center justify-center px-4">
              <div
                className="bg-black/50 rounded-lg py-2 px-4 text-center w-full break-words whitespace-normal max-w-full"
                style={{
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                }}
              >
                <h1 className="text-3xl md:text-6xl font-bold text-white break-words max-w-full overflow-hidden text-ellipsis leading-tight pb-2">
                  {metadata.title}
                </h1>
                <div className="border-b-4 border-purple w-1/2 mx-auto mt-2"></div>
              </div>
            </div>
          </div>

          {/* ARTICLE CONTAINER */}
          <article
            style={{ fontSize: "calc(0.8rem + 0.5vw)" }}
            className="font-roboto bg-[#0f0e11] text-white rounded-lg shadow-xl p-4 md:p-8 mt-10 prose prose-invert max-w-none relative mx-0 sm:mx-2"
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
                  <div className="mb-4 leading-relaxed">
                    {props.children}
                  </div>
                ),
                h1: (props) => (
                  <h1
                    className="text-4xl font-bold mt-8 mb-4 text-white border-b-4 border-gray-500 pb-2"
                    {...props}
                  />
                ),
                h2: (props) => (
                  <h2
                    className="text-3xl font-bold mt-6 mb-3 text-white"
                    {...props}
                  />
                ),
                h3: (props) => (
                  <h3
                    className="text-2xl font-semibold mt-5 mb-2 text-white"
                    {...props}
                  />
                ),
                img: (props) => {
                  const isGif = props.src?.toLowerCase().endsWith(".gif");
                  return (
                    <figure className="flex justify-center my-6 w-full">
                      <Image
                        src={props.src || ""}
                        alt={props.alt || "Image"}
                        width={900}
                        height={500}
                        sizes="(max-width: 768px) 100vw, 900px"
                        className="rounded-lg shadow-lg max-w-full shadow-black/50"
                        style={{ width: "auto", height: "auto" }}
                        loading="lazy"
                        unoptimized={isGif}
                      />
                    </figure>
                  );
                },
                div: (props) => <div {...props} />,
                code: (props) => (
                  <code className="font-fira bg-[#2e2c2c] px-2 py-0.5 rounded text-base align-middle">
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
                    className="list-disc list-outside pl-16 mb-2"
                    {...props}
                  />
                ),
                li: (props) => <li className="mb-1" {...props} />,
                head: () => null,
              }}
            />
          </article>
        </div>
        <ScrollToTopButton />
      </main>
  );
}
