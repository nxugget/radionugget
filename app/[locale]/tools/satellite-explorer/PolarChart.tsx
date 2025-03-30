"use client";

import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

interface PolarChartProps {
  satelliteId: string;
  trajectoryPoints?: Point[]; // Points de trajectoire pour le tracé
}

interface Point {
  az: number;
  el: number;
}

const PolarChart: React.FC<PolarChartProps> = ({ satelliteId, trajectoryPoints }) => {
  const chartRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    const width = 400, height = 400; // Increased size to prevent cutting off cardinal points
    const radius = Math.min(width, height) / 2 - 30; // Adjusted radius with margin
    const svg = d3.select(chartRef.current);
    svg.selectAll("*").remove();
    svg.attr("width", width).attr("height", height);
    const g = svg.append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    // Dessiner les cercles de référence (30°, 60°, 90°)
    [30, 60, 90].forEach(deg => {
      g.append("circle")
       .attr("r", deg * (radius / 90))
       .attr("fill", "none")
       .attr("stroke", "#b400ff") // Couleur purple
       .attr("stroke-width", 1.5); // Épaisseur des cercles
    });

    // Dessiner les directions cardinales (N, E, S, W)
    const cardinals = [
      { angle: 0, label: "N" },
      { angle: 90, label: "E" },
      { angle: 180, label: "S" },
      { angle: 270, label: "W" }
    ];
    cardinals.forEach(d => {
      const rad = (d.angle - 90) * (Math.PI / 180);
      g.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", (radius + 15) * Math.cos(rad)) // Extend lines slightly beyond the circle
        .attr("y2", (radius + 15) * Math.sin(rad)) // Extend lines slightly beyond the circle
        .attr("stroke", "#ffaa00") // Change to orange
        .attr("stroke-width", 1.5); // Line thickness
      g.append("text")
        .attr("x", (radius + 25) * Math.cos(rad)) // Position further outside the circle
        .attr("y", (radius + 25) * Math.sin(rad))
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .attr("fill", "#ffaa00") // Change to orange for cardinal points
        .attr("font-size", "14px") // Slightly larger font size for cardinal points
        .text(d.label);
    });

    // Si des points de trajectoire sont fournis, dessiner le tracé
    if (trajectoryPoints && trajectoryPoints.length) {
      const scale = radius / 90;
      const lineData = trajectoryPoints.map(p => {
        const angleRad = (p.az - 90) * (Math.PI / 180); // Ajuster pour que 0° soit en haut
        return [p.el * scale, angleRad] as [number, number];
      });
      const lineGenerator = d3.lineRadial()
                              .angle((d: any) => d[1])
                              .radius((d: any) => d[0])
                              .curve(d3.curveCardinal);
      const pathData = lineGenerator(lineData);
      g.append("path")
       .attr("d", pathData || "")
       .attr("fill", "none")
       .attr("stroke", "#ffaa00") // Couleur orange pour le tracé
       .attr("stroke-width", 2);
    }
  }, [trajectoryPoints]);

  return <svg ref={chartRef} />;
};

export default PolarChart;
