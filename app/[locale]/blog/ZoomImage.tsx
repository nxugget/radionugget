"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";

type ZoomImageProps = React.ComponentProps<typeof Image> & {
  className?: string;
};

export default function ZoomImage(props: ZoomImageProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalAnimation, setModalAnimation] = useState(false);
  const [scale, setScale] = useState(1);
  // Removed transformOrigin state

  const { src, alt, ...rest } = props;

  useEffect(() => {
    if (!modalVisible) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [modalVisible]);

  const handleOpen = () => {
    setModalVisible(true);
    setScale(1);
    // Removed dynamic transform origin update
    setTimeout(() => setModalAnimation(true), 10);
  };

  const handleClose = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setModalAnimation(false);
      setTimeout(() => setModalVisible(false), 300);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setScale(prevScale => {
      const newScale = prevScale - e.deltaY * 0.001;
      return Math.min(3, Math.max(0.5, newScale));
    });
  };

  // Removed handleMouseMove function

  return (
    <>
      <div onClick={handleOpen} className="cursor-pointer">
        <Image 
          src={src} 
          alt={alt || "Image"} 
          {...rest}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8VAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k="
        />
      </div>
      {modalVisible && (
        <div
          onClick={handleClose}
          onWheel={handleWheel}
          // Removed onMouseMove prop to prevent dynamic transform origin adjustments
          className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50 transition-all duration-300 ${modalAnimation ? "opacity-100" : "opacity-0"}`}
        >
          <div
            className={`transform transition-all duration-300 ${modalAnimation ? "scale-100" : "scale-90"}`}
            style={{ transform: `scale(${scale})` }} // Fixed transform origin by default
          >
            <Image 
              src={src} 
              alt={alt || "Image"} 
              {...rest} 
              quality={100}
              priority
              className="object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}
