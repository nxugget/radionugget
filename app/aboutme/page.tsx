import Image from 'next/image';
import { TypewriterEffectSmooth } from "../components/typewritter-effect"; 

export default function AboutMe() {
  return (
    <div className="flex h-screen items-center justify-center overflow-hidden p-6">
      {/* Container */}
      <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-16 w-full max-w-6xl">
        
        <div className="relative w-72 md:w-96 flex-shrink-0">
          {/* Colorful Ring */}
          {/* Logo */}
          <Image 
            src="/images/logo.webp" 
            alt="Radionugget Logo"
            width={400} 
            height={400} 
            className="relative w-full h-auto rounded-full border-4 border-purple shadow-lg"
          />
        </div>

        {/* Right Side - EVEN BIGGER Card */}
        <div className="bg-gray-800 text-white p-10 md:p-14 rounded-lg shadow-lg w-full max-w-4xl">
          {/* Name with Typewriter Effect */}
          <TypewriterEffectSmooth
            words={[
              { text: "Radionugget", className: "text-purple" },
              { text: "-", className: "text-white" },
              { text: "F4MDX", className: "text-orange" },
            ]}
            className="text-4xl md:text-5xl font-bold"
            cursorClassName="bg-purple"
          />

          {/* Description */}
          <p className="mt-6 text-xl text-gray-300 leading-relaxed">
            Yo ! Je m'appelle Alexis, indicatif radio <span className="text-orange font-bold">F4MDX</span> et je suis passionné par la radio et l'espace. 
            J'adore explorer le monde au travers des ondes et partager mes expériences sur mon blog.
          </p>
        </div>
      </div>
    </div>
  );
}
