"use client";
import Image from "next/image";
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
          "relative rounded-lg overflow-hidden h-[400px] md:h-[500px] w-full transition-all duration-300 ease-out cursor-pointer",
          hovered !== null && !isHovered ? "blur-[3px] scale-[0.98]" : "",
          isHovered ? "scale-105" : ""
        )}
      >
        {/* Image */}
        <Image
          src={card.src}
          alt={card.title}
          fill
          className="object-cover absolute inset-0 transition-transform duration-300 ease-out"
        />

        {/* Image Title with Black Transparent Background */}
        <div
          className={cn(
            "absolute bottom-2 left-2 bg-black/60 px-3 py-2 rounded-md transition-opacity duration-300",
            isHovered ? "opacity-100" : "opacity-0"
          )}
        >
          <div className="text-white text-lg md:text-xl font-medium">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-[98vw] mx-auto w-full">
        {cards.map((card, index) => (
          <Card
            key={card.title}
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
            "fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-lg z-50 transition-opacity duration-300",
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
