"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export const PinContainer = ({
  children,
  title,
  href,
  className,
  containerClassName,
}: {
  children: React.ReactNode;
  title?: string;
  href?: string;
  className?: string;
  containerClassName?: string;
}) => {
  const [transform, setTransform] = useState("translate(-50%,-50%) rotateX(0deg)");

  const onMouseEnter = () => {
    setTransform("translate(-50%,-50%) rotateX(40deg) scale(0.8)");
  };
  const onMouseLeave = () => {
    setTransform("translate(-50%,-50%) rotateX(0deg) scale(1)");
  };

  return (
    <Link
      className={cn("relative group/pin z-50 cursor-pointer w-full h-full", containerClassName)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      href={href || "/"}
    >
      <div
        style={{ perspective: "1000px", transform: "rotateX(70deg) translateZ(0deg)" }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full"
      >
        <div
          style={{ transform }}
          className="absolute left-1/2 p-4 top-1/2 flex justify-start items-start rounded-2xl shadow-lg bg-black group-hover/pin:border-white/20 transition duration-700 overflow-hidden w-full h-full"
        >
          <div className={cn("relative z-50 w-full h-full", className)}>{children}</div>
        </div>
      </div>
      <PinPerspective title={title} href={href} />
    </Link>
  );
};

export const PinPerspective = ({ title, href }: { title?: string; href?: string }) => {
  return (
    <motion.div className="pointer-events-none w-96 h-80 flex items-center justify-center opacity-0 group-hover/pin:opacity-100 z-[60] transition duration-500">
      <div className="absolute top-0 inset-x-0 flex justify-center">
        <Link href={href || "/"} className="text-white font-bold text-xs bg-zinc-950 px-4 py-1 rounded-full relative">
          {title}
          <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-16 h-px bg-gradient-to-r from-transparent via-orange to-transparent transition-opacity duration-500 group-hover/btn:opacity-40"></span>
        </Link>
      </div>

      <motion.div className="absolute right-1/2 bottom-1/2 bg-gradient-to-b from-transparent to-orange translate-y-[14px] w-px h-20 group-hover/pin:h-40 blur-[2px]" />
      <motion.div className="absolute right-1/2 bottom-1/2 bg-gradient-to-b from-transparent to-orange translate-y-[14px] w-px h-20 group-hover/pin:h-40" />
      <motion.div className="absolute right-1/2 translate-x-[1.5px] bottom-1/2 bg-orange translate-y-[14px] w-[4px] h-[4px] rounded-full z-40 blur-[3px]" />
      <motion.div className="absolute right-1/2 translate-x-[0.5px] bottom-1/2 bg-orange translate-y-[14px] w-[2px] h-[2px] rounded-full z-40" />
    </motion.div>
  );
};
