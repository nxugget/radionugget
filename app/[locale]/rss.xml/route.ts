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
      let enclosure = '';
      if (data.thumbnail) {
        let enclosureUrl = data.thumbnail;
        if (!/^https?:\/\//.test(enclosureUrl)) {
          enclosureUrl = baseUrl + (enclosureUrl.startsWith('/') ? '' : '/') + enclosureUrl;
        }
        let length = 0;
        try {
          // Only try to stat local files
          if (enclosureUrl.startsWith(baseUrl + '/')) {
            const localPath = path.join(process.cwd(), enclosureUrl.replace(baseUrl, ''));
            const stat = await fs.promises.stat(localPath);
            length = stat.size;
          }
        } catch {
          // ignore stat errors, leave length as 0
        }
        enclosure = `<enclosure url="${enclosureUrl}" type="image/jpeg" length="${length}" />`;
      }
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
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>${titles[locale] || "RadioNugget Blog"}</title>
<link>${baseUrl}/${locale}/blog</link>
<atom:link href="${baseUrl}/${locale}/rss.xml" rel="self" type="application/rss+xml" />
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
