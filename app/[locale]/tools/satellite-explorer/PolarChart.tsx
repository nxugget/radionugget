"use client";

import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

interface PolarChartProps {
  satelliteId: string;
  trajectoryPoints?: Point[]; // Points de trajectoire pour le tracé
  currentPosition?: Point; // New prop for real-time position
}

interface Point {
  az: number;
  el: number;
}

const PolarChart: React.FC<PolarChartProps> = ({ satelliteId, trajectoryPoints, currentPosition }) => {
  const chartRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    console.log("Trajectory points:", trajectoryPoints);
    if (!chartRef.current) return;
    const width = 400, height = 400;
    const radius = Math.min(width, height) / 2 - 30;
    const svg = d3.select(chartRef.current);
    svg.selectAll("*").remove();
    svg.attr("width", width).attr("height", height);
    const g = svg.append("g").attr("transform", `translate(${width / 2},${height / 2})`);

    // Draw reference circles (without labels yet)
    const refElevations = [90, 60, 30, 0];
    refElevations.forEach(elev => {
      const r = (90 - elev) * (radius / 90);
      if(r > 0) {
        g.append("circle")
         .attr("r", r)
         .attr("fill", "none")
         .attr("stroke", "#b400ff")
         .attr("stroke-width", 1.5);
      }
    });

    // Draw cardinal directions
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
        .attr("x2", (radius + 15) * Math.cos(rad))
        .attr("y2", (radius + 15) * Math.sin(rad))
        .attr("stroke", "#ffaa00")
        .attr("stroke-width", 1.5);
      g.append("text")
        .attr("x", (radius + 25) * Math.cos(rad))
        .attr("y", (radius + 25) * Math.sin(rad))
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .attr("fill", "#ffaa00")
        .attr("font-size", "14px")
        .text(d.label);
    });

    // Then add elevation labels on top (to be in foreground)
    refElevations.forEach(elev => {
      const r = (90 - elev) * (radius / 90);
      g.append("text")
       .attr("x", r * Math.cos(Math.PI/4) + 5)
       .attr("y", r * Math.sin(Math.PI/4) + 5)
       .attr("fill", "purple")
       .attr("opacity", 0.9)
       .attr("font-size", "12px")
       .text(`${elev}°`);
    });

    g.append("circle")
     .attr("cx", 0)
     .attr("cy", 0)
     .attr("r", 4)
     .attr("fill", "#b400ff")
     .raise();

    const defs = svg.append("defs");
    defs.append("marker")
      .attr("id", "arrow")
      .attr("markerWidth", 5)
      .attr("markerHeight", 5)
      .attr("refX", 0)
      .attr("refY", 2.5)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,0 L0,5 L4,2.5 z")
      .attr("fill", "#228B22");

    // Use an azimuth offset (-90°) so 0° maps to the top.
    if (trajectoryPoints && trajectoryPoints.length) {
      const scale = radius / 90;
      // Use: angle = (p.az - 180) converted to radians.
      const lineData = trajectoryPoints.map(p => {
        const angleRad = (p.az - 180) * (Math.PI / 180);
        return [(90 - p.el) * scale, angleRad] as [number, number];
      });
      const lineGenerator = d3.lineRadial()
                              .angle((d: any) => d[1])
                              .radius((d: any) => d[0])
                              .curve(d3.curveCardinal);
      const pathData = lineGenerator(lineData);
      g.append("path")
       .attr("d", pathData || "")
       .attr("fill", "none")
       .attr("stroke", "#228B22")
       .attr("stroke-width", 3);
    }

    // Adjust current position similarly:
    if (currentPosition && currentPosition.el > 0) {
      const scale = radius / 90;
      const rPos = (90 - currentPosition.el) * scale;
      const angle = (currentPosition.az - 180) * (Math.PI / 180);
      const x = rPos * Math.cos(angle);
      const y = rPos * Math.sin(angle);
      g.append("circle")
       .attr("cx", x)
       .attr("cy", y)
       .attr("r", 5)
       .attr("fill", "red")
       .raise();
    }
  }, [trajectoryPoints, currentPosition]);

  return <svg ref={chartRef} />;
};

export default PolarChart;
