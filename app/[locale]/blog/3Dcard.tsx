"use client";

import { cn } from "@/src/lib/utils";
import React, {
  createContext,
  useState,
  useContext,
  useRef,
  useEffect,
} from "react";

// Ajout d'un contexte pour la rotation
type RotationContextType = {
  rotateX: number;
  rotateY: number;
};
const RotationContext = createContext<RotationContextType>({ rotateX: 0, rotateY: 0 });

const MouseEnterContext = createContext<
  [boolean, React.Dispatch<React.SetStateAction<boolean>>] | undefined
>(undefined);

export const CardContainer = ({
  children,
  className,
  containerClassName,
  style,
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  style?: React.CSSProperties;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMouseEntered, setIsMouseEntered] = useState(false);
  const animationFrame = useRef<number | null>(null);

  // Ajout : état pour la rotation
  const [rotation, setRotation] = useState({ rotateX: 0, rotateY: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
    animationFrame.current = requestAnimationFrame(() => {
      const { left, top, width, height } = containerRef.current!.getBoundingClientRect();
      const x = (e.clientX - left - width / 2) / 25;
      const y = (e.clientY - top - height / 2) / 25;
      containerRef.current!.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`;
      setRotation({ rotateX: y, rotateY: x }); // Ajout : stocke la rotation pour les enfants
    });
  };

  const handleMouseEnter = () => {
    setIsMouseEntered(true);
  };

  const handleMouseLeave = () => {
    if (!containerRef.current) return;
    setIsMouseEntered(false);
    containerRef.current.style.transform = `rotateY(0deg) rotateX(0deg)`;
    setRotation({ rotateX: 0, rotateY: 0 }); // Reset
  };

  return (
    <MouseEnterContext.Provider value={[isMouseEntered, setIsMouseEntered]}>
      <RotationContext.Provider value={rotation}>
        <div
          className={cn("flex items-center justify-center", containerClassName)}
          style={{ perspective: "1000px", ...style }}
        >
          <div
            ref={containerRef}
            onMouseEnter={handleMouseEnter}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={cn(
              "flex items-center justify-center relative transition-all duration-200 ease-linear",
              className
            )}
            style={{
              transformStyle: "preserve-3d",
            }}
          >
            {children}
          </div>
        </div>
      </RotationContext.Provider>
    </MouseEnterContext.Provider>
  );
};

export const CardBody = ({
  children,
  className = "h-full w-full",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "[transform-style:preserve-3d] [&>*]:[transform-style:preserve-3d]",
        className
      )}
    >
      {children}
    </div>
  );
};

export const CardItem = ({
  as: Tag = "div",
  children,
  className,
  translateX = 0,
  translateY = 0,
  translateZ = 0,
  rotateX = 0,
  rotateY = 0,
  rotateZ = 0,
  ...rest
}: {
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  translateX?: number | string;
  translateY?: number | string;
  translateZ?: number | string;
  rotateX?: number | string;
  rotateY?: number | string;
  rotateZ?: number | string;
  [key: string]: any;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isMouseEntered] = useMouseEnter();
  const { rotateX: parentRotateX, rotateY: parentRotateY } = useContext(RotationContext);

  useEffect(() => {
    handleAnimations();
  }, [
    isMouseEntered,
    translateX,
    translateY,
    translateZ,
    rotateX,
    rotateY,
    rotateZ,
    parentRotateX,
    parentRotateY,
  ]);

  const handleAnimations = () => {
    if (!ref.current) return;
    // Accentue au maximum l'effet 3D en multipliant translateZ lors du hover
    const z = isMouseEntered ? Number(translateZ) * 15 : Number(translateZ);
    if (isMouseEntered) {
      ref.current.style.transform = `
        translateX(${translateX}px)
        translateY(${translateY}px)
        translateZ(${z}px)
        rotateX(${Number(rotateX) + parentRotateX}deg)
        rotateY(${Number(rotateY) + parentRotateY}deg)
        rotateZ(${rotateZ}deg)
      `;
    } else {
      ref.current.style.transform = `
        translateX(0px)
        translateY(0px)
        translateZ(${z}px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        rotateZ(${rotateZ}deg)
      `;
    }
  };

  return (
    <Tag
      ref={ref}
      className={cn("w-fit transition-all duration-200 ease-linear", className)}
      {...rest}
    >
      {children}
    </Tag>
  );
};

export const useMouseEnter = () => {
  const context = useContext(MouseEnterContext);
  if (context === undefined) {
    throw new Error("useMouseEnter must be used within a MouseEnterProvider");
  }
  return context;
};
