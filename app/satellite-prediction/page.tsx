import { TypewriterEffectSmooth } from "../components/typewritter-effect"; 

export default function AboutMe() {
  return (
    <div className="flex items-center justify-center overflow-hidden p-6">
        <div className="bg-gray-800 p-10 md:p-8 rounded-lg shadow-lg w-full max-w-4xl">
          <TypewriterEffectSmooth
            words={[
              { text: "Coming", className: "text-orange" },
              { text: "Soon", className: "text-orange" },
            ]}
            className="text-4xl md:text-5xl font-bold"
            cursorClassName="bg-purple"
          />
        </div>
    </div>
  );
}
