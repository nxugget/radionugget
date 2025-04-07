"use client";

import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

interface PolarChartProps {
  satelliteId: string;
  trajectoryPoints?: Point[]; // Points de trajectoire pour le tracé
  currentPosition?: Point; // New prop for real-time position
  currentTime?: Date; // New prop to determine past vs future trajectory
  isFocusMode?: boolean; // New prop to detect focus mode
}

interface Point {
  az: number;
  el: number;
  time?: Date; // Add optional timestamp to track when position occurs
}

const PolarChart: React.FC<PolarChartProps> = ({ 
  satelliteId, 
  trajectoryPoints, 
  currentPosition,
  currentTime = new Date(), // Use current time by default
  isFocusMode = false // Default to non-focus mode
}) => {
  const chartRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    console.log("Trajectory points:", trajectoryPoints);
    if (!chartRef.current) return;
    
    const svgContainer = chartRef.current.parentElement;
    const containerWidth = svgContainer ? svgContainer.clientWidth : 1800; // Larger default width for focus mode
    const width = isFocusMode ? Math.min(containerWidth, 1800) : Math.min(containerWidth, 500); // Maximized width in focus mode
    const height = width;
    const radius = Math.min(width, height) / 2 - (isFocusMode ? 0 : 40); // Maximize radius for focus mode
    
    const svg = d3.select(chartRef.current);
    svg.selectAll("*").remove();
    svg.attr("width", width).attr("height", height);
    const g = svg.append("g").attr("transform", `translate(${width / 2},${height / 2})`);

    const baseFontSize = isFocusMode ? 100 : (width < 300 ? 10 : (width < 400 ? 11 : 12)); // Extremely large font size in focus mode

    // Draw reference circles
    const refElevations = [90, 60, 30, 0];
    refElevations.forEach(elev => {
      const r = (90 - elev) * (radius / 90);
      if(r > 0) {
        g.append("circle")
         .attr("r", r)
         .attr("fill", "none")
         .attr("stroke", "#b400ff")
         .attr("stroke-width", isFocusMode ? 12 : 1.5); // Much thicker lines in focus mode
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
        .attr("x2", (radius + (isFocusMode ? 100 : 15)) * Math.cos(rad)) // Much longer lines in focus mode
        .attr("y2", (radius + (isFocusMode ? 100 : 15)) * Math.sin(rad))
        .attr("stroke", "#ffaa00")
        .attr("stroke-width", isFocusMode ? 12 : 1.5); // Much thicker lines in focus mode
      g.append("text")
        .attr("x", (radius + (isFocusMode ? 150 : 25)) * Math.cos(rad)) // Adjusted for extremely large text
        .attr("y", (radius + (isFocusMode ? 150 : 25)) * Math.sin(rad))
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .attr("fill", "#ffaa00")
        .attr("font-size", `${baseFontSize}px`) // Extremely large font size in focus mode
        .text(d.label);
    });

    // Add elevation labels
    refElevations.forEach(elev => {
      const r = (90 - elev) * (radius / 90);
      g.append("text")
       .attr("x", r * Math.cos(Math.PI/4) + (isFocusMode ? 40 : 5))
       .attr("y", r * Math.sin(Math.PI/4) + (isFocusMode ? 80 : 12)) 
       .attr("fill", "purple")
       .attr("opacity", 0.9)
       .attr("font-size", `${baseFontSize}px`) // Extremely large font size in focus mode
       .text(`${elev}°`);
    });

    g.append("circle")
     .attr("cx", 0)
     .attr("cy", 0)
     .attr("r", isFocusMode ? 20 : 4) // Much larger center point in focus mode
     .attr("fill", "#b400ff")
     .raise();

    // Remove the marker definitions entirely, we'll draw the arrow manually
    const defs = svg.append("defs");

    // Only keep the satellite pattern definition
    defs.append("pattern")
      .attr("id", "satellite-pattern")
      .attr("width", 1)
      .attr("height", 1)
      .attr("patternUnits", "objectBoundingBox")
      .append("image")
      .attr("href", "/images/icon/satellite-icon.svg")
      .attr("width", 24)
      .attr("height", 24)
      .attr("x", 0)
      .attr("y", 0);

    // Split trajectory into past and future
    if (trajectoryPoints && trajectoryPoints.length > 1) {
      const scale = radius / 90;
      const now = new Date(currentTime.getTime());
      
      let pastPoints: Point[] = [];
      let futurePoints: Point[] = [];
      
      // Handle differently based on if the satellite is visible
      if (currentPosition && currentPosition.el > 0) {
        // CASE 1: Satellite is currently visible - split into past/future
        if (trajectoryPoints.some(p => p.time !== undefined)) {
          pastPoints = trajectoryPoints
            .filter(p => p.time && p.time.getTime() <= now.getTime())
            .sort((a, b) => (a.time && b.time) ? a.time.getTime() - b.time.getTime() : 0);
            
          futurePoints = trajectoryPoints
            .filter(p => p.time && p.time.getTime() > now.getTime())
            .sort((a, b) => (a.time && b.time) ? a.time.getTime() - b.time.getTime() : 0);
        } else {
          // Fallback if no timestamps
          const midPoint = Math.floor(trajectoryPoints.length / 2);
          pastPoints = trajectoryPoints.slice(0, midPoint);
          futurePoints = trajectoryPoints.slice(midPoint);
        }
      } else {
        // CASE 2: Satellite is not visible - show all points as future trajectory
        futurePoints = [...trajectoryPoints];
        pastPoints = []; // Empty past points - don't show red line
      }

      // Draw past trajectory (red dotted line) - only if there are past points
      if (pastPoints.length > 1) {
        const pastLineData = pastPoints.map(p => {
          const angleRad = (p.az) * (Math.PI / 180);
          const el = Math.max(p.el, 0);
          const r = (90 - el) * scale;
          return [r, angleRad] as [number, number];
        });
        
        const lineGenerator = d3.lineRadial()
          .angle((d: any) => d[1])
          .radius((d: any) => d[0])
          .curve(d3.curveCardinal);
        
        const pastPathData = lineGenerator(pastLineData);
        
        g.append("path")
          .attr("d", pastPathData || "")
          .attr("fill", "none")
          .attr("stroke", "#dc2626") // Red for past
          .attr("stroke-width", isFocusMode ? 6 : 2.5) // Thicker line in focus mode
          .attr("stroke-dasharray", isFocusMode ? "10,10" : "5,5"); // Larger dashes in focus mode
      }

      // Draw future trajectory (green solid line)
      if (futurePoints.length > 1) {
        const futureLineData = futurePoints.map(p => {
          const angleRad = (p.az) * (Math.PI / 180);
          const el = Math.max(p.el, 0);
          const r = (90 - el) * scale;
          return [r, angleRad] as [number, number];
        });
        
        const lineGenerator = d3.lineRadial()
          .angle((d: any) => d[1])
          .radius((d: any) => d[0])
          .curve(d3.curveCardinal);
        
        const futurePathData = lineGenerator(futureLineData);
        
        // Create and append the path for future trajectory
        const futurePath = g.append("path")
          .attr("d", futurePathData || "")
          .attr("fill", "none")
          .attr("stroke", "#228B22") // Green for future
          .attr("stroke-width", isFocusMode ? 7 : 3); // Thicker line in focus mode
          
        // Now draw the arrow at the end of the path using the actual path endpoint
        if (futurePoints.length >= 2) {
          // Get the exact end point from the path element
          const pathNode = futurePath.node();
          if (pathNode) {
            const pathLength = pathNode.getTotalLength();
            
            // Get the last point and a point slightly before it to determine direction
            const endPoint = pathNode.getPointAtLength(pathLength);
            const beforeEndPoint = pathNode.getPointAtLength(pathLength - 15);
            
            // Calculate direction vector
            const dx = endPoint.x - beforeEndPoint.x;
            const dy = endPoint.y - beforeEndPoint.y;
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            
            // Draw arrow lines
            const arrowSize = isFocusMode ? 16 : 12; // Slightly larger arrow in focus mode
            
            // Arrow wing 1
            g.append("line")
              .attr("x1", endPoint.x)
              .attr("y1", endPoint.y)
              .attr("x2", endPoint.x - arrowSize * Math.cos((angle - 25) * (Math.PI / 180)))
              .attr("y2", endPoint.y - arrowSize * Math.sin((angle - 25) * (Math.PI / 180)))
              .attr("stroke", "#228B22")
              .attr("stroke-width", isFocusMode ? 4 : 3); // Thicker arrow in focus mode
              
            // Arrow wing 2
            g.append("line")
              .attr("x1", endPoint.x)
              .attr("y1", endPoint.y)
              .attr("x2", endPoint.x - arrowSize * Math.cos((angle + 25) * (Math.PI / 180)))
              .attr("y2", endPoint.y - arrowSize * Math.sin((angle + 25) * (Math.PI / 180)))
              .attr("stroke", "#228B22")
              .attr("stroke-width", isFocusMode ? 4 : 3); // Thicker arrow in focus mode
          }
        }
      }
    }

    // Draw current position - only if the satellite is above the horizon
    if (currentPosition) {
      const scale = radius / 90;
      const angle = (currentPosition.az - 90) * (Math.PI / 180); // Adjust azimuth to match polar chart orientation

      if (currentPosition.el > 0) {
        const posRadius = (90 - currentPosition.el) * scale;
        const x = posRadius * Math.cos(angle);
        const y = posRadius * Math.sin(angle);

        g.append("image")
          .attr("x", x - 20) // Reduced size
          .attr("y", y - 20) // Reduced size
          .attr("width", 40) // Reduced size
          .attr("height", 40) // Reduced size
          .attr("href", "/images/icon/satellite-icon.svg")
          .attr("filter", "brightness(0) invert(1) drop-shadow(0 0 5px rgba(0, 0, 0, 0.7))")
          .raise();
      }
    }
  }, [trajectoryPoints, currentPosition, currentTime, isFocusMode]);

  return (
    <div className="w-full flex justify-center items-center">
      <svg ref={chartRef} className="max-w-full h-auto" preserveAspectRatio="xMidYMid meet" />
    </div>
  );
};

export default PolarChart;
