"use client";

import { useState, useEffect } from "react";
import { FocusCards } from "./ImageGallery";

const Gallery = () => {
  const [images, setImages] = useState<{ title: string; src: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      const response = await fetch("/api/images");
      const imagePaths: string[] = await response.json();

      const formattedImages = imagePaths.map((image) => ({
        title: image.split("/").pop()?.split(".")[0] || "Image",
        src: image,
      }));

      const shuffledImages = formattedImages.sort(() => Math.random() - 0.5);

      // Preload images
      await Promise.all(
        shuffledImages.map(
          (image) =>
            new Promise<void>((resolve) => {
              const img = new Image();
              img.src = image.src;
              img.onload = () => resolve();
              img.onerror = () => resolve(); // Resolve even if an image fails to load
            })
        )
      );

      setImages(shuffledImages);
      setLoading(false);
    };

    fetchImages();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex justify-center items-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex justify-center px-2 py-3">
      <FocusCards cards={images} />
    </div>
  );
};

export default Gallery;
