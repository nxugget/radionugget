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
  const [transformOrigin, setTransformOrigin] = useState("50% 50%");
  const { src, alt, ...rest } = props;

  useEffect(() => {
    document.body.style.overflow = modalVisible ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [modalVisible]);

  const handleOpen = () => {
    setModalVisible(true);
    setScale(1);
    setTransformOrigin("50% 50%");
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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setTransformOrigin(`${x.toFixed(0)}% ${y.toFixed(0)}%`);
  };

  return (
    <>
      <div onClick={handleOpen} className="cursor-pointer">
        <Image src={src} alt={alt || "Image"} {...rest} />
      </div>
      {modalVisible && (
        <div
          onClick={handleClose}
          onWheel={handleWheel}
          onMouseMove={handleMouseMove}
          className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50 transition-all duration-300 ${modalAnimation ? "opacity-100" : "opacity-0"}`}
        >
          <div
            className={`transform transition-all duration-300 ${modalAnimation ? "scale-100" : "scale-90"}`}
            style={{ transform: `scale(${scale})`, transformOrigin }}
          >
            <Image 
              src={src} 
              alt={alt || "Image"} 
              {...rest} 
              quality={100}
              className="object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}
