"use client";

import { useEffect, useState } from "react"
import WorksLayout from "./WorkLayout"
import swipedetect from "./swipe"

import "../styles/space_explore.scss"


const SpaceExplore = () => {
	const [passed, setPassed] = useState(false)
	const [step, setStep] = useState(0)
	const [fire, setFire] = useState(true)
  const [together, setTogether] = useState(false)
  const [moveRight, setMoveRight] = useState(false)

	useEffect(() => {
		if (step === 0) {
			setBodyOverflow("hidden");
		}
		swipedetect(document.getElementsByTagName("body")[0], function(
			evt,
			swipedir
		) {
			if (swipedir === "up") {
				scrollHandler({ deltaY: -1 });
			} else if (swipedir === "down") {
				scrollHandler({ deltaY: 1 });
			}
		});
		window.addEventListener("wheel", fire ? scrollHandler : () => {});
		return () => {
			window.removeEventListener("wheel", scrollHandler);
		};
	});

	const setBodyOverflow = val => {
		document.getElementsByTagName("body")[0].style.overflow = val;
	};

	const scrollHandler = (event) => {
		if (!fire) return;
	
		setFire(false);
		setTimeout(() => setFire(true), 1000); 
	
		if (event.deltaY > 0 && step === 0) {
			setStep(1);
			setPassed(true);
			setBodyOverflow("auto");
	
			window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
		} 
		else if (event.deltaY < 0 && step === 1) {
			// Retour en arrière
			setStep(0);
			setPassed(false);
			setBodyOverflow("hidden");
	
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	};
	
	
	return (
		<WorksLayout title="Space Explore | KP">
			<div id="section-1" className="parallax-container">
				<div className="images-container">
					<div className={`background-3 ${passed ? "scale" : ""}`}></div>
					<div className={`background-1 ${passed ? "scale" : ""}`}></div>
					<div className={`background-2 ${passed ? "scale" : ""}`}></div>
					<div className={`text-block ${moveRight ? 'flow-right' : passed ? "scale" : ""}`}>
						<p className="main">EXPLORE</p>
						<p className="sub">RADIO & SPACE</p>
					</div>
				</div>
			</div>
		</WorksLayout>
	);
};

export default SpaceExplore;