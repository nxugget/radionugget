"use client";
// Use native <img> to avoid on-demand transformations
import React, { useState } from "react";
import { cn } from "@/src/lib/utils";

export const Card = React.memo(
  ({
    card,
    index,
    hovered,
    setHovered,
    onSelect,
    selectedImage,
  }: {
    card: { title: string; src: string };
    index: number;
    hovered: number | null;
    setHovered: React.Dispatch<React.SetStateAction<number | null>>;
    onSelect: (src: string) => void;
    selectedImage: string | null;
  }) => {
    const isHovered = hovered === index;

    return (
      <div
        onMouseEnter={() => setHovered(index)}
        onMouseLeave={() => setHovered(null)}
        onClick={() => onSelect(card.src)}
        className={cn(
          "relative rounded-xl overflow-hidden h-[400px] md:h-[500px] w-full transition-all duration-500 ease-expo-out cursor-pointer border border-white/[0.06]",
          hovered !== null && !isHovered ? "blur-[2px] scale-[0.98] opacity-70" : "",
          isHovered ? "scale-[1.02] shadow-card-hover border-purple/20" : ""
        )}
      >
        {/* Image */}
        <img
          src={card.src}
          alt={card.title}
          className="object-cover absolute inset-0 transition-transform duration-300 ease-out w-full h-full"
          loading="lazy"
        />

        {/* Image Title with Black Transparent Background */}
        <div
          className={cn(
            "absolute bottom-3 left-3 bg-surface-2/80 backdrop-blur-md px-3 py-2 rounded-lg border border-white/[0.06] transition-all duration-300",
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          )}
        >
          <div className="text-white text-sm md:text-base font-medium">
            {card.title}
          </div>
        </div>
      </div>
    );
  }
);

Card.displayName = "Card";

type CardProps = {
  title: string;
  src: string;
};

export function FocusCards({ cards }: { cards: CardProps[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [isVisible, setIsVisible] = useState(false);

  const openImage = (src: string) => {
    setSelectedImage(src);
    setZoom(1);
    setTimeout(() => setIsVisible(true), 10);
  };

  const closeImage = () => {
    setIsVisible(false);
    setTimeout(() => setSelectedImage(null), 300);
  };

  const handleWheel = (event: React.WheelEvent<HTMLImageElement>) => {
    event.preventDefault();
    setZoom((prevZoom) => {
      let newZoom = prevZoom + event.deltaY * -0.002;
      return Math.min(Math.max(newZoom, 1), 3);
    });
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto w-full">
        {cards.map((card, index) => (
          <Card
            key={`${card.title}-${card.src}`}
            card={card}
            index={index}
            hovered={hovered}
            setHovered={setHovered}
            onSelect={openImage}
            selectedImage={selectedImage}
          />
        ))}
      </div>

      {/* Full-screen Image View with Zoom */}
      {selectedImage && (
        <div 
          className={cn(
            "fixed inset-0 flex items-center justify-center bg-black/90 backdrop-blur-2xl z-50 transition-opacity duration-300",
            isVisible ? "opacity-100" : "opacity-0"
          )}
          onClick={closeImage}
        >
          <img 
            src={selectedImage} 
            alt="Selected image"
            className="max-w-[95%] max-h-[95vh] object-contain transition-transform duration-300"
            style={{
              transform: isVisible ? `scale(${zoom})` : "scale(0.8)",
              opacity: isVisible ? 1 : 0,
            }}
            onWheel={handleWheel}
          />
        </div>
      )}
    </>
  );
}
