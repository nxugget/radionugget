import { NextResponse } from 'next/server';
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const baseUrl = 'https://radionugget.com';

export async function GET(
  request: Request,
  { params }: { params: { locale: string } }
) {
  const locale = params.locale;
  let items: string[] = [];
  const contentDir = path.join(process.cwd(), "content", locale);
  let years: string[] = [];
  try {
    years = await fs.promises.readdir(contentDir);
  } catch {
    // no articles
  }
  for (const year of years) {
    const yearDir = path.join(contentDir, year);
    let files: string[] = [];
    try {
      files = await fs.promises.readdir(yearDir);
    } catch {
      continue;
    }
    for (const file of files) {
      if (!file.endsWith('.mdx')) continue;
      const filePath = path.join(yearDir, file);
      const fileContent = await fs.promises.readFile(filePath, "utf-8");
      const { data } = matter(fileContent);
      const slug = file.replace('.mdx', '');
      const url = `${baseUrl}/${locale}/blog/${slug}`;
      const enclosure = data.thumbnail
        ? `<enclosure url="${data.thumbnail}" type="image/jpeg" />`
        : '';
      items.push(
`<item>
<title><![CDATA[${data.title || ''}]]></title>
<link>${url}</link>
<guid>${url}</guid>
<pubDate>${new Date(data.date).toUTCString()}</pubDate>
<description><![CDATA[${data.summary || ''}]]></description>
${enclosure}
</item>`.trim()
      );
    }
  }

  const descriptions: Record<string, string> = {
    fr: "Articles du blog RadioNugget",
    en: "RadioNugget blog articles"
  };

  const titles: Record<string, string> = {
    fr: "RadioNugget Blog",
    en: "RadioNugget Blog"
  };

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
<title>${titles[locale] || "RadioNugget Blog"}</title>
<link>${baseUrl}/${locale}/blog</link>
<description>${descriptions[locale] || "RadioNugget blog articles"}</description>
<language>${locale}</language>
${items.join('\n')}
</channel>
</rss>`.trim();

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
