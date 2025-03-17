"use client";

import { useState, useEffect } from "react";
import { FocusCards } from "../components/focus-cards"; 

const Gallery = () => {
  const [images, setImages] = useState<{ title: string; src: string }[]>([]);

  useEffect(() => {
    const fetchImages = async () => {
      const response = await fetch("/api/images");
      const imagePaths: string[] = await response.json();

      // Transformation des images en objets avec titre
      const formattedImages = imagePaths.map((image) => ({
        title: image.split("/").pop()?.split(".")[0] || "Image",
        src: image,
      }));

      // Mélange aléatoire
      const shuffledImages = formattedImages.sort(() => Math.random() - 0.5);
      setImages(shuffledImages);
    };

    fetchImages();
  }, []);

  return (
    <div className="min-h-screen flex justify-center px-2 py-3">
      <FocusCards cards={images} />
    </div>
  );
};

export default Gallery;
