"use client";

import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";

interface AzimuthSelectorProps {
  minAzimuth: number;
  maxAzimuth: number;
  onChange: (min: number, max: number) => void;
}

const AzimuthSelector: React.FC<AzimuthSelectorProps> = ({ minAzimuth, maxAzimuth, onChange }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState<"min" | "max" | null>(null);
  const [dimensions, setDimensions] = useState({ width: 300, height: 300 });
  const [dragStartAngle, setDragStartAngle] = useState<number | null>(null);
  
  // Fonction pour normaliser un angle entre 0 et 360
  const normalizeAngle = (angle: number): number => {
    return ((angle % 360) + 360) % 360;
  };
  
  // Obtenir les points d'un arc pour le dessin du secteur sélectionné
  const getArcPath = (startAngle: number, endAngle: number, radius: number): string => {
    if (startAngle === endAngle) return "";
    
    // En SVG, 0° est à droite (Est) et 90° est en bas (Sud).
    // Pour qu'une valeur d'angle de 0° corresponde au Nord (haut),
    // nous devons soustraire 90° à l'angle.
    const toSvgAngle = (a: number) => ((a - 90) + 360) % 360;
    
    const startRadian = toSvgAngle(startAngle) * Math.PI / 180;
    const endRadian = toSvgAngle(endAngle) * Math.PI / 180;
    
    const start = {
      x: Math.cos(startRadian) * radius,
      y: Math.sin(startRadian) * radius
    };
    
    const end = {
      x: Math.cos(endRadian) * radius,
      y: Math.sin(endRadian) * radius
    };
    
    const largeArcFlag = (endAngle - startAngle + 360) % 360 > 180 ? 1 : 0;
    
    return `M 0 0 L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`;
  };

  useEffect(() => {
    if (!svgRef.current) return;
    
    // Adapter les dimensions au conteneur parent
    const containerWidth = svgRef.current.parentElement?.clientWidth || 300;
    const size = Math.min(containerWidth, 250);
    setDimensions({ width: size, height: size });
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const { width, height } = dimensions;
    const radius = Math.min(width, height) / 2 - 30;
    const innerRadius = radius - 30;
    
    // Groupe principal centré
    const g = svg.append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);
    
    // Cercle extérieur de la boussole
    g.append("circle")
      .attr("r", radius)
      .attr("fill", "none")
      .attr("stroke", "rgba(255, 255, 255, 0.3)")
      .attr("stroke-width", 2);
    
    // Cercle intérieur
    g.append("circle")
      .attr("r", innerRadius)
      .attr("fill", "none")
      .attr("stroke", "rgba(255, 255, 255, 0.2)")
      .attr("stroke-width", 1);
    
    // Points cardinaux correctement placés
    // Nord à 0° (haut), Est à 90° (droite), etc.
    const cardinalPoints = [
      { angle: 0, label: "N" },   // Nord en haut
      { angle: 90, label: "E" },  // Est à droite
      { angle: 180, label: "S" }, // Sud en bas
      { angle: 270, label: "W" }  // Ouest à gauche
    ];
    
    // Fonction pour convertir l'angle d'azimut (0° au Nord) en angle SVG (0° à l'Est)
    const toSvgAngle = (a: number) => ((a - 90) + 360) % 360;
    
    // Ajouter des graduations tous les 30 degrés
    for (let angle = 0; angle < 360; angle += 30) {
      const radian = toSvgAngle(angle) * Math.PI / 180;
      const isCardinal = angle % 90 === 0;
      const tickLength = isCardinal ? 15 : 10;
      
      g.append("line")
        .attr("x1", Math.cos(radian) * innerRadius)
        .attr("y1", Math.sin(radian) * innerRadius)
        .attr("x2", Math.cos(radian) * (innerRadius + tickLength))
        .attr("y2", Math.sin(radian) * (innerRadius + tickLength))
        .attr("stroke", isCardinal ? "white" : "rgba(255, 255, 255, 0.6)")
        .attr("stroke-width", isCardinal ? 2 : 1);
        
      // Ajouter les valeurs d'angle tous les 30 degrés
      if (!isCardinal) {
        g.append("text")
          .attr("x", Math.cos(radian) * (radius + 10))
          .attr("y", Math.sin(radian) * (radius + 10))
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("fill", "rgba(255, 255, 255, 0.6)")
          .attr("font-size", "10px")
          .text(angle.toString());
      }
    }
    
    // Ajouter les labels des points cardinaux
    cardinalPoints.forEach(point => {
      const radian = toSvgAngle(point.angle) * Math.PI / 180;
      g.append("text")
        .attr("x", Math.cos(radian) * (radius + 15))
        .attr("y", Math.sin(radian) * (radius + 15))
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", "white")
        .attr("font-weight", "bold")
        .attr("font-size", "14px")
        .text(point.label);
    });
    
    // Le secteur sélectionné
    let minAngle = minAzimuth;
    let maxAngle = maxAzimuth;
    
    // Si minAzimuth > maxAzimuth, ajuster les angles pour un tracé correct
    if (minAngle > maxAngle && maxAngle !== 0) {
      maxAngle += 360;
    }
    
    // Dessiner le secteur sélectionné - Changement de couleur à orange
    const arcPath = getArcPath(minAngle, maxAngle, innerRadius);
    g.append("path")
      .attr("d", arcPath)
      .attr("fill", "rgba(255, 170, 0, 0.4)") // Modifié à orange (ffaa00) avec transparence
      .attr("stroke", "rgba(255, 170, 0, 0.8)") // Contour orange
      .attr("stroke-width", 1);

    // Calcule l'angle à partir des coordonnées - correction pour que 0° soit au Nord
    const calculateAngle = (x: number, y: number): number => {
      // Atan2 donne l'angle en radians par rapport à l'axe positif X, où positif Y pointe vers le bas
      // Nous convertissons en degrés et ajustons pour que 0° soit au nord
      const angle = Math.atan2(y, x) * 180 / Math.PI;
      // +90 pour faire correspondre l'origine au Nord (plutôt qu'à l'Est)
      return normalizeAngle(angle + 90);
    };
    
    // Les poignées pour le min et max azimut - Changement de couleur à purple
    const createHandle = (angle: number, type: "min" | "max") => {
      const radian = toSvgAngle(angle) * Math.PI / 180;
      const x = Math.cos(radian) * innerRadius;
      const y = Math.sin(radian) * innerRadius;
      
      // Ligne du centre à la poignée
      g.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", x)
        .attr("y2", y)
        .attr("stroke", "#b400ff") // Modifié à purple
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "4 2");
      
      // Cercle poignée
      const handle = g.append("circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", 10)
        .attr("fill", "#b400ff") // Modifié à purple
        .attr("cursor", "pointer")
        .attr("class", `handle-${type}`);
      
      // Label de l'angle
      g.append("text")
        .attr("x", Math.cos(radian) * (innerRadius + 25))
        .attr("y", Math.sin(radian) * (innerRadius + 25))
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", "#b400ff") // Modifié à purple
        .attr("font-weight", "bold")
        .text(angle + "°");
      
      // Gestion du drag améliorée pour cette poignée
      handle.call(
        d3.drag<SVGCircleElement, unknown>()
          .on("start", (event) => {
            const [x, y] = d3.pointer(event, g.node());
            setDragging(type);
            setDragStartAngle(calculateAngle(x, y));
          })
          .on("drag", (event) => {
            const [x, y] = d3.pointer(event, g.node());
            const currentAngle = calculateAngle(x, y);
            
            // Calcul amélioré pour un mouvement plus fluide
            if (type === "min") {
              onChange(currentAngle, maxAzimuth);
            } else {
              onChange(minAzimuth, currentAngle);
            }
          })
          .on("end", () => {
            setDragging(null);
            setDragStartAngle(null);
          })
      );
    };
    
    // Créer les deux poignées
    createHandle(minAzimuth, "min");
    createHandle(maxAzimuth, "max");
    
  }, [minAzimuth, maxAzimuth, dimensions, onChange, dragStartAngle]);

  return (
    <div className="flex justify-center items-center w-full">
      <div className="relative">
        <svg 
          ref={svgRef} 
          width={dimensions.width} 
          height={dimensions.height}
          className="cursor-default"
          style={{ touchAction: "none" }}
        />
        {/* Format modifié pour afficher "Between X° and Y°" */}
        <div className="flex justify-center text-white mt-2 text-sm">
          <span>
            Between <span className="text-purple font-bold">{minAzimuth}°</span> and <span className="text-purple font-bold">{maxAzimuth}°</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default AzimuthSelector;
