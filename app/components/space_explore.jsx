"use client";

import { useEffect, useState } from "react"
import WorksLayout from "./WorkLayout"
import swipedetect from "./swipe"

import "../styles/space_explore.scss"

const SpaceExplore = ({ onScrollComplete }) => { // Ajout d'une prop pour communiquer avec `page.tsx`
	const [passed, setPassed] = useState(false);
	const [step, setStep] = useState(0);
	const [fire, setFire] = useState(true);

	useEffect(() => {
		if (step === 0) {
			setBodyOverflow("hidden");
		}
		swipedetect(document.body, function(evt, swipedir) {
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
	}, [step, fire]); // Ajout de `step` et `fire` dans les dépendances pour éviter des ré-exécutions inutiles

	const setBodyOverflow = (val) => {
		document.body.style.overflow = val;
	};

	const scrollHandler = (event) => {
		if (!fire) return;

		setFire(false);
		setTimeout(() => setFire(true), 800); // Bloque juste assez longtemps pour éviter un scroll trop rapide

		if (event.deltaY > 0 && step === 0) {
			setStep(1);
			setPassed(true);
			setBodyOverflow("auto");

			// On signale à `page.tsx` que l'animation est finie et qu'il peut faire défiler la page
			setTimeout(() => {
				if (onScrollComplete) onScrollComplete();
			}, 600); // Attend un peu que l'animation visuelle soit terminée avant de scroller
		} 
		else if (event.deltaY < 0 && step === 1) {
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
					<div className={`text-block ${passed ? "scale" : ""}`}>
						<p className="main">EXPLORE</p>
						<p className="sub">RADIO & SPACE</p>
					</div>
				</div>
			</div>
		</WorksLayout>
	);
};

export default SpaceExplore;
