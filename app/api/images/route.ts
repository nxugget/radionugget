import fs from 'fs';
import path from 'path';

export async function GET() {
  const imagesDir = path.join(process.cwd(), 'public', 'images', 'gallery');
  const imageFiles = fs.readdirSync(imagesDir);

  const imagePaths = imageFiles.filter((file) =>
    file.match(/\.(jpg|jpeg|png|webp)$/i)
  );

  const imageUrls = imagePaths.map((file) => `/images/gallery/${file}`);

  return new Response(JSON.stringify(imageUrls), {
    headers: { 'Content-Type': 'application/json' },
  });
}
