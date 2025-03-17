"use client";

import Image from "next/image";
import Link from "next/link";
import { TypewriterEffectSmooth } from "./typewritter-effect"; 
import { useRef } from "react";
import { useInView } from "framer-motion"; 
import { PinContainer } from "./3D-pin";

const projects = [
  {
    id: 1,
    title: "Monter une station ADS-B reliée à FlightRadar",
    img: "/images/blog/thumbnail/adsb.webp",
    sourceCode: "/blog/adsb",
  },
  {
    id: 2,
    title: "Réception automatique d'images satellites NOAA",
    img: "/images/blog/thumbnail/noaa.webp",
    sourceCode: "/blog/noaa",
  },
  {
    id: 3,
    title: "Recevoir des images en provenance de l'ISS",
    img: "/images/blog/thumbnail/sstv.webp",
    sourceCode: "/blog/sstv",
  },
  {
    id: 4,
    title: "Fabrication d'une antenne quadrifilaire (QFH)",
    img: "/images/blog/thumbnail/qfh.webp",
    sourceCode: "/blog/qfh",
  },
];

const BestProjects = () => {
  const titleRef = useRef(null);
  const isInView = useInView(titleRef, { once: true, margin: "-100px" });

  return (
    <section className="py-20 h-full w-full flex flex-col items-center justify-center">
      <div ref={titleRef}>
        {isInView && (
          <TypewriterEffectSmooth
            words={[
              { text: "A", className: "text-[#b400ff]" },
              { text: "small", className: "text-[#b400ff]" },
              { text: "selection", className: "text-[#b400ff]" },
              { text: "of", className: "text-[#b400ff]" },
              { text: "my", className: "text-[#ffaa00]" },
              { text: "best", className: "text-[#ffaa00]" },
              { text: "projects", className: "text-[#ffaa00]" },
            ]}
            className="text-lg sm:text-xl md:text-2xl font-bold text-center mb-10"
            cursorClassName="bg-[#b400ff]"
          />
        )}
      </div>
      <div className="grid gap-8 px-10 md:px-20 lg:px-40 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 w-full h-full">
        {projects.map(({ id, title, img, sourceCode }) => (
          <div key={id} className="w-full h-full">
            <Link href={sourceCode} className="block w-full h-full">
              <PinContainer title="Read More" className="w-full h-full">
                <div className="relative w-full h-full rounded-2xl overflow-hidden">
                  <Image src={img} alt={title} layout="fill" objectFit="cover" className="absolute inset-0 w-full h-full" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black/50 backdrop-blur-md rounded-xl p-4 w-3/4 text-center">
                      <h3 className="text-xl font-bold text-white">{title}</h3>
                    </div>
                  </div>
                </div>
              </PinContainer>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BestProjects;
