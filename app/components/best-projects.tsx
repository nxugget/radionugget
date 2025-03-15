"use client";

import Image from "next/image";
import Link from "next/link";
import { FaLocationArrow } from "react-icons/fa6";
import { TypewriterEffectSmooth } from "./typewritter-effect"; 
import { useRef } from "react";
import { useInView } from "framer-motion"; 

const projects = [
  {
    id: 1,
    title: "Monter une station ADS-B reliée à FlightRadar",
    des: "Mettez en place votre propre station ADSB pour détecter les avions autour de chez vous et obtenez gratuitement un abonnement FlightRadar de 500€/an",
    img: "/images/best-projects/adsb.webp",
    sourceCode: "/blog/adsb",
  },
  {
    id: 2,
    title: "Écoute des satellites russes METEOR-M",
    des: "Apprenez à écouter les satellites russes METEOR-M afin de récupérer leur images avec le même matériel utilisé pour récupérer les images des satellites NOAA",
    img: "/images/best-projects/meteor.webp",
    sourceCode: "/blog/meteor",
  },
  {
    id: 3,
    title: "Recevoir des images en provenance de l'ISS",
    des: "Découvrez comment recevoir des images en SSTV provenant de l'ISS dans le cadre du programme ARISS",
    img: "/images/best-projects/sstv.webp",
    sourceCode: "/blog/sstv",
  },
  {
    id: 4,
    title: "Fabrication d'une antenne quadrifilaire (QFH)",
    des: "Apprenez à fabriquer votre propre antenne quadrifilaire (QFH) faite maison (DIY) pour la fréquence 137MHz afin de recevoir des images satellites NOAA et METEOR",
    img: "/images/best-projects/qfh.webp",
    sourceCode: "/blog/qfh",
  },
];

const BestProjects = () => {
  const titleRef = useRef(null);
  const isInView = useInView(titleRef, { once: true, margin: "-100px" });

  return (
    <section className="py-20 h-screen flex flex-col items-center justify-center bg-transparent"> {/* ✅ Ajout bg-transparent ici */}
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

      <div className="grid gap-10 px-6 md:px-20 lg:px-40 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 lg:grid-rows-2 h-[80vh]">
        {projects.map(({ id, title, des, img, sourceCode }) => (
          <div 
            key={id} 
            className="relative bg-gray-800/90 rounded-2xl p-6 shadow-lg transition transform hover:scale-105 flex flex-col justify-between"
          > {/* ✅ Fond seulement ici, pas sur la section */}
            <Image src={img} alt={title} width={500} height={300} className="rounded-xl mb-4 w-full h-60 object-cover" />
            <h3 className="text-2xl font-semibold">{title}</h3>
            <p className="text-gray-400 text-sm mt-2">{des}</p>
            <div className="mt-4 flex justify-between items-center">
              <Link href={sourceCode} className="text-[#b400ff] text-sm flex items-center">
                Read More <FaLocationArrow className="ml-2" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};




export default BestProjects;
