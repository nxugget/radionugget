"use client";

import { useState, useEffect } from "react";
import { FocusCards } from "./ImageGallery";

const Gallery = () => {
  const [images, setImages] = useState<{ title: string; src: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch("/api/images");
        if (!response.ok) throw new Error("Network response was not ok");
        const imagePaths: string[] = await response.json();

        const formattedImages = imagePaths.map((image) => ({
          title: image.split("/").pop()?.split(".")[0] || "Image",
          src: image,
        }));

        // --- CHANGÉ : utilisation de l'algorithme Fisher-Yates pour mélanger ---
        const shuffledImages = [...formattedImages];
        for (let i = shuffledImages.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledImages[i], shuffledImages[j]] = [shuffledImages[j], shuffledImages[i]];
        }
        // --- FIN DES CHANGEMENTS ---

        // Avoid preloading all images to not compete with LCP

        setImages(shuffledImages);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching images:", error);
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex justify-center items-center text-gray-400 text-sm tracking-wide">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex justify-center px-3 py-4">
      <FocusCards cards={images} />
    </div>
  );
};

export default Gallery;
