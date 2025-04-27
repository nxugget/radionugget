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
  const [dimensions, setDimensions] = useState({ width: 300, height: 300 });

  // Normalize angle to 0-360 range
  const normalizeAngle = (angle: number): number => {
    return ((angle % 360) + 360) % 360;
  };

  // Function to get azimuth angle (0-360) from mouse coordinates
  // 0° is North (top), 90° is East (right), etc.
  const getAzimuthFromMouse = (x: number, y: number, centerX: number, centerY: number): number => {
    // Calculate relative position from center
    const dx = x - centerX;
    const dy = centerY - y; // Invert y because SVG y-axis goes down

    // Calculate angle in radians and convert to degrees
    let angle = Math.atan2(dx, dy) * (180 / Math.PI);

    // Normalize to 0-360 range
    return normalizeAngle(angle);
  };

  // Function to calculate position on circle from angle
  const getPositionFromAngle = (angle: number, radius: number, centerX: number, centerY: number) => {
    // Convert angle to radians, adjust for SVG coordinate system
    const radians = (90 - angle) * Math.PI / 180;

    return {
      x: centerX + radius * Math.cos(radians),
      y: centerY - radius * Math.sin(radians)
    };
  };

  // Function to create arc path for sector
  const createSectorPath = (min: number, max: number, radius: number, centerX: number, centerY: number): string => {
    // Special case for full circle (0-360)
    if ((min === 0 && max === 360) || min === max) {
      return `M ${centerX} ${centerY} L ${centerX} ${centerY - radius} A ${radius} ${radius} 0 1 1 ${centerX - 0.001} ${centerY - radius} Z`;
    }

    // Handle case when min > max (crossing 0/360 boundary)
    const actualMax = min > max ? max + 360 : max;

    // Calculate arc sweep
    const largeArcFlag = actualMax - min > 180 ? 1 : 0;

    // Get points on circle for min and max angles
    const startPos = getPositionFromAngle(min, radius, centerX, centerY);
    const endPos = getPositionFromAngle(max, radius, centerX, centerY);

    return `M ${centerX} ${centerY} L ${startPos.x} ${startPos.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endPos.x} ${endPos.y} Z`;
  };

  // Effet pour ajuster la taille du composant au montage et lors du resize
  useEffect(() => {
    const updateDimensions = () => {
      if (!svgRef.current) return;
      const containerWidth = svgRef.current.parentElement?.clientWidth || 300;
      const size = Math.min(containerWidth, window.innerWidth < 500 ? 180 : 250);
      setDimensions({ width: size, height: size });
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Effet pour dessiner le SVG, dépend uniquement des props et dimensions
  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous content
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = dimensions.width;
    const height = dimensions.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 30;
    const innerRadius = radius - 30;
    const labelRadius = radius + 18;

    // Draw outer circle
    svg.append("circle")
      .attr("cx", centerX)
      .attr("cy", centerY)
      .attr("r", radius)
      .attr("fill", "none")
      .attr("stroke", "rgba(255, 255, 255, 0.3)")
      .attr("stroke-width", 2);

    // Draw inner circle
    svg.append("circle")
      .attr("cx", centerX)
      .attr("cy", centerY)
      .attr("r", innerRadius)
      .attr("fill", "none")
      .attr("stroke", "rgba(255, 255, 255, 0.2)")
      .attr("stroke-width", 1);

    // Draw degree markings every 30 degrees
    for (let angle = 0; angle < 360; angle += 30) {
      const isCardinal = angle % 90 === 0;
      const tickLength = isCardinal ? 15 : 10;

      const innerPos = getPositionFromAngle(angle, innerRadius, centerX, centerY);
      const outerPos = getPositionFromAngle(angle, innerRadius + tickLength, centerX, centerY);

      // Draw tick mark
      svg.append("line")
        .attr("x1", innerPos.x)
        .attr("y1", innerPos.y)
        .attr("x2", outerPos.x)
        .attr("y2", outerPos.y)
        .attr("stroke", isCardinal ? "white" : "rgba(255, 255, 255, 0.6)")
        .attr("stroke-width", isCardinal ? 2 : 1);

      // Draw degree label (except for cardinal points)
      if (!isCardinal) {
        const labelPos = getPositionFromAngle(angle, labelRadius, centerX, centerY);
        svg.append("text")
          .attr("x", labelPos.x)
          .attr("y", labelPos.y)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("fill", "rgba(255, 255, 255, 0.6)")
          .attr("font-size", "10px")
          .text(angle.toString());
      }
    }

    // Draw cardinal points
    const cardinalPoints = [
      { angle: 0, label: "N" },
      { angle: 90, label: "E" },
      { angle: 180, label: "S" },
      { angle: 270, label: "W" }
    ];

    cardinalPoints.forEach(point => {
      const pos = getPositionFromAngle(point.angle, labelRadius + 5, centerX, centerY);
      svg.append("text")
        .attr("x", pos.x)
        .attr("y", pos.y)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", "white")
        .attr("font-weight", "bold")
        .attr("font-size", "14px")
        .text(point.label);
    });

    // Draw selected sector - Changed to purple with higher transparency
    const sectorPath = createSectorPath(minAzimuth, maxAzimuth, innerRadius, centerX, centerY);
    svg.append("path")
      .attr("d", sectorPath)
      .attr("fill", "rgba(180, 0, 255, 0.3)") // Changed to purple with higher transparency
      .attr("stroke", "rgba(180, 0, 255, 0.6)") // Changed to purple with medium transparency
      .attr("stroke-width", 1);

    // Create draggable handles for min and max azimuth
    const createHandle = (angle: number, type: "min" | "max") => {
      const pos = getPositionFromAngle(angle, innerRadius, centerX, centerY);

      // Draw line from center to handle - Changed back to purple
      svg.append("line")
        .attr("x1", centerX)
        .attr("y1", centerY)
        .attr("x2", pos.x)
        .attr("y2", pos.y)
        .attr("stroke", "#b400ff") // Changed back to purple from orange
        .attr("stroke-width", 2)
        .attr("class", "no-hover-effect"); // Ajout de la classe pour désactiver l'effet hover

      // Draw handle circle - Changed back to purple
      const handle = svg.append("circle")
        .attr("cx", pos.x)
        .attr("cy", pos.y)
        .attr("r", 10)
        .attr("fill", "#b400ff") // Changed back to purple from orange
        .attr("class", "no-hover-effect") // Ajout de la classe pour désactiver l'effet hover
        .attr("cursor", "pointer");

      // Add angle label - Changed back to purple
      const labelPos = getPositionFromAngle(angle, innerRadius + 25, centerX, centerY);
      svg.append("text")
        .attr("x", labelPos.x)
        .attr("y", labelPos.y)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", "#b400ff") // Changed back to purple from orange
        .attr("class", "no-hover-effect") // Ajout de la classe pour désactiver l'effet hover
        .attr("font-weight", "bold")
        .text(angle + "°");

      // Fixed drag behavior with proper TypeScript typing
      const dragBehavior = d3.drag<SVGCircleElement, unknown>()
        .on("drag", (event) => {
          // Calculate azimuth angle from mouse position
          const mouseX = event.x;
          const mouseY = event.y;
          const newAngle = normalizeAngle(getAzimuthFromMouse(mouseX, mouseY, centerX, centerY));

          // Update state based on which handle is being dragged
          if (type === "min") {
            // Keep 360 as 360, not 0
            const adjustedNewAngle = newAngle === 0 ? 360 : newAngle;
            onChange(adjustedNewAngle, maxAzimuth);
          } else {
            // Special handling for max angle - allow setting to 360
            const adjustedNewAngle = newAngle === 0 ? 360 : newAngle;
            onChange(minAzimuth, adjustedNewAngle);
          }
        });

      // Apply the drag behavior to the handle
      handle.call(dragBehavior);
    };

    // Create both handles, making sure we display 360° instead of 0° for the max if appropriate
    createHandle(minAzimuth, "min");
    createHandle(maxAzimuth === 0 ? 360 : maxAzimuth, "max");

  }, [minAzimuth, maxAzimuth, dimensions, onChange]);

  // Display 360 instead of 0 for max azimuth
  const displayMaxAzimuth = maxAzimuth === 0 ? 360 : maxAzimuth;

  return (
    <div className="flex justify-center items-center">
      <div
        className="flex flex-col items-center"
        style={{
          width: 240, // Augmente la largeur pour éviter la coupure à droite
          maxWidth: "100%",
          marginLeft: 0, // Remet à zéro le décalage gauche
        }}
      >
        <div style={{ position: "relative", width: "100%", height: dimensions.height }}>
          <svg
            ref={svgRef}
            width={dimensions.width}
            height={dimensions.height}
            className="cursor-default"
            style={{
              touchAction: "none",
              width: "100%",
              height: "auto",
              minWidth: 120,
              maxWidth: 240,
              display: "block",
              overflow: "visible", // Important pour ne rien couper
            }}
          />
        </div>
        <div className="text-white text-xs sm:text-sm" style={{ marginTop: 18 }}>
          <span>
            Between <span className="text-purple font-bold">{minAzimuth}°</span> and <span className="text-purple font-bold">{displayMaxAzimuth}°</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default AzimuthSelector;
