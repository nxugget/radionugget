"use client";

import { useEffect, useState } from "react";
import WorksLayout from "./WorkLayout";
import swipedetect from "./swipe";

const SpaceExplore = ({ scrollPhase }: { scrollPhase: number }) => {
    const [passed, setPassed] = useState(false);
    const [step, setStep] = useState(0);

    useEffect(() => {
        swipedetect(document.body, function (_evt: Event, swipedir: string) {
            if (swipedir === "up") {
                scrollHandler({ deltaY: -1 });
            } else if (swipedir === "down") {
                scrollHandler({ deltaY: 1 });
            }
        });

        window.addEventListener("wheel", scrollHandler);
        return () => {
            window.removeEventListener("wheel", scrollHandler);
        };
    }, [step]);

    useEffect(() => {
        if (scrollPhase === 1) {
            setStep(1);
            setPassed(true);
        } else if (scrollPhase === 0) {
            setStep(0);
            setPassed(false);
        }
    }, [scrollPhase]);

    const scrollHandler = (event: { deltaY: number }) => {
        if (event.deltaY > 0 && step === 0) {
            setStep(1);
            setPassed(true);
        } else if (event.deltaY < 0 && step === 1) {
            setStep(0);
            setPassed(false);
        }
    };

    return (
        <WorksLayout>
            <div id="section-1" className="relative w-full h-screen overflow-hidden">
                <div className="relative h-[101vh] overflow-hidden">
                    
                    {/* Backgrounds */}
                    <div
                        className={`absolute top-0 left-0 w-full h-full bg-center bg-cover transition-transform duration-[1500ms] ${passed ? "scale-[1]" : "scale-[1.4]"}`}
                        style={{ backgroundImage: "url('/images/background4.png')", zIndex: 0 }}
                    ></div>
                        
                    <div
                        className={`absolute inset-0 bg-center bg-cover transition-transform duration-[1500ms] ${passed ? "scale-[1.4]" : "scale-[1]"}`}
                        style={{ backgroundImage: "url('/images/background.webp')", zIndex: 1 }}
                    ></div>
                        
                    <div
                        className={`absolute inset-0 bg-center bg-cover transition-transform duration-[1500ms] ${passed ? "scale-[1.4]" : "scale-[1]"}`}
                        style={{ backgroundImage: "url('/images/background.webp')", zIndex: 2 }}
                    ></div>



                    {/* Texte */}
                    <div
                        className={`absolute top-0 right-0 h-screen text-center mt-20 pr-20 transition-transform duration-[1500ms] 
                        ${step === 1 ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}
                        ${step === 0 ? "translate-y-full opacity-0" : ""}`}
                        style={{ zIndex: 20 }}
                    >
                        <p className="text-white text-[6vw] font-poppins leading-[1.5]">EXPLORE</p>
                        <p className="text-white text-[4.5vw] font-poppins leading-[1.5]">RADIO & SPACE</p>
                    </div>
                </div>
            </div>
        </WorksLayout>
    );
};

export default SpaceExplore;
