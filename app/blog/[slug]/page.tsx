import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { MDXRemote } from "next-mdx-remote/rsc";
import Image from "next/image";
import SmartLink from "../../components/SmartLink";
import ScrollToTopButton from "../../components/ScrollToTopButton"; 
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { synthwave84 } from "react-syntax-highlighter/dist/esm/styles/prism";
import { TypewriterEffectSmooth } from "../../components/typewritter-effect"; // Assurez-vous que le chemin est correct

export default async function Article({ params }: { params: { slug?: string } }) {
  if (!params?.slug) return <p className="text-white text-center">404</p>;

  const contentDir = path.join(process.cwd(), "content");
  const years = fs.readdirSync(contentDir).filter((year) => fs.statSync(path.join(contentDir, year)).isDirectory());

  let filePath = "";
  let metadata = null;
  let content = "";

  for (const year of years) {
    const possiblePath = path.join(contentDir, year, `${params.slug}.mdx`);
    if (fs.existsSync(possiblePath)) {
      filePath = possiblePath;
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const parsed = matter(fileContent);
      metadata = parsed.data;
      content = parsed.content;
      break;
    }
  }

  if (!filePath || !metadata) return <p className="text-white text-center">404</p>;

  return (
    <main className="flex justify-center py-8 min-h-screen relative">
      <div className="w-full max-w-7xl px-8">

        {/* 🔥 HEADER AVEC IMAGE BLURRED */}
        <div className="relative w-full h-[350px] md:h-[450px] overflow-hidden rounded-lg shadow-lg">
          <div className="absolute inset-0">
            <Image 
              src={metadata.thumbnail} 
              alt={metadata.title} 
              fill 
              className="object-cover blur-md brightness-50"
              priority
            />
          </div>

          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white">
            <TypewriterEffectSmooth
              words={metadata.title.split(" ").map((word: string, index: number) => ({
                text: word,
                className: "text-white" 
              }))}
              className="text-4xl md:text-6xl font-bold border-b-4 border-gray-500 pb-2"
              cursorClassName="bg-[#b400ff]"
            />
            <p className="text-lg md:text-xl opacity-80">{metadata.date}</p>
          </div>
        </div>

        {/* ARTICLE CONTAINER */}
        <article className="bg-[#0f0e11] text-white rounded-lg shadow-xl p-8 mt-10 prose prose-invert max-w-none relative">
          <MDXRemote
            source={content}
            components={{
              SmartLink: (props) => (
                <SmartLink
                  {...props}
                  className="text-purple transition-colors duration-300 hover:text-[#8000bf]"
                />
              ),
              strong: (props) => <strong className="text-orange font-semibold" {...props} />,
              a: (props) => <a className="text-purple transition-colors duration-300 hover:text-[#8000bf]" {...props} />,
              p: (props) => <p className="mb-4 leading-relaxed" {...props} />,
              h1: (props) => <h1 className="text-4xl font-bold mt-8 mb-4 text-white border-b-4 border-gray-500 pb-2" {...props} />,
              h2: (props) => <h2 className="text-3xl font-bold mt-6 mb-3 text-white" {...props} />,
              h3: (props) => <h3 className="text-2xl font-semibold mt-5 mb-2 text-white" {...props} />,
              img: (props) => {
                return (
                  <div className="flex justify-center my-6 w-full">
                    <Image {...props} className="rounded-lg shadow-lg max-w-full" alt={props.alt || "Image"} width={900} height={500} />
                  </div>
                );
              },
              div: (props) => <div {...props} />, 
              code: (props) => <code className="bg-[#2e2c2c] px-2 py-1 rounded text-sm">{props.children}</code>,
              pre: ({ children }) => {
                const match = children?.props?.className?.match(/language-(\w+)/);
                const language = match ? match[1] : "plaintext"; // Détecte la langue ou fallback à "plaintext"
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
            }}
          />
        </article>

      </div>

      {/* 🔼 BOUTON RETOUR EN HAUT (Client Component) */}
      <ScrollToTopButton />
    </main>
  );
}
