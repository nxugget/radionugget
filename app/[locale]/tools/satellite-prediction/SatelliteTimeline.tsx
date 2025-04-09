"use client";

import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import Link from "next/link";

interface SatellitePass {
  startTime: string;
  endTime: string;
  maxElevation: number;
  satelliteName: string;
  satelliteId: string; // Added satelliteId property
}

interface TimelineProps {
  passes: SatellitePass[];
  useLocalTime: boolean;
  utcOffset: number;
}

const colorMap: { [key: string]: string } = {};
const colors = d3.schemeCategory10;

/**
 * Calcule la différence en jours entiers entre deux dates
 * (ne tenant compte que de l'année, du mois et du jour).
 * Exemple :
 *   - 2023-03-17 23:30 et 2023-03-18 00:15 => 1
 *   - 2023-03-17 10:00 et 2023-03-17 22:00 => 0
 */
function dayDifference(d1: Date, d2: Date): number {
  const date1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate());
  const date2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate());
  return Math.floor((date2.getTime() - date1.getTime()) / (24 * 3600 * 1000));
}

const SatelliteTimeline: React.FC<TimelineProps> = ({
  passes,
  useLocalTime,
  utcOffset,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const parentDiv = d3.select(svgRef.current.parentElement);

    // Reduced maximum width to fit better in container
    const width = Math.min(window.innerWidth - 150, 1200);
    const margin = { top: 60, right: 20, bottom: 50, left: 90 }; // Reduced left margin
    const rowHeight = 40;

    // Unique satellites and inner height calculation
    const uniqueSatellites = Array.from(
      new Set(passes.map((d) => d.satelliteName))
    );
    const innerHeight = uniqueSatellites.length * rowHeight;

    // Set SVG dimensions
    const svg = d3
      .select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", innerHeight + margin.top + margin.bottom);
    svg.selectAll("*").remove();

    // Set color for satellites
    uniqueSatellites.forEach((sat, index) => {
      if (!colorMap[sat]) {
        colorMap[sat] = colors[index % colors.length];
      }
    });

    // X axis: time scale
    const now = new Date();
    now.setMinutes(0, 0, 0); // Round to the nearest hour
    const maxEnd = new Date(now);
    maxEnd.setHours(maxEnd.getHours() + 24); // 24 hours from now
    const xScale = d3
      .scaleTime()
      .domain([now, maxEnd])
      .range([margin.left, width - margin.right]);

    // Y scale
    const yScale = d3
      .scaleBand()
      .domain(uniqueSatellites)
      .range([margin.top, margin.top + innerHeight])
      .padding(0);

    // Time format and X axis drawing
    const timeFormat = d3.timeFormat("%H"); // Changed to display only the hour
    const tooltipTimeFormat = d3.timeFormat("%I:%M %p");
    const xAxis = d3
      .axisTop(xScale)
      .tickSize(0)
      .ticks(d3.timeHour.every(2)) // Changed from every(1) to every(2)
      .tickFormat((d) => {
        const date = new Date(d as Date);
        if (useLocalTime) date.setHours(date.getHours() + utcOffset);
        return timeFormat(date); // Use the updated format
      });
    const xAxisGroup = svg
      .append("g")
      .attr("transform", `translate(0, ${margin.top - 20})`)
      .call(xAxis);
    xAxisGroup.select(".domain").remove();
    xAxisGroup.selectAll(".tick line").remove();
    xAxisGroup.selectAll(".tick text")
      .style("fill", "#fff")
      .style("font-size", "14px"); // Reduced font size

    // Vertical grid lines
    const hourInterval = d3.timeHour.every(2)!; // Changed from every(1) to every(2)
    const hourTicks = xScale.ticks(hourInterval);
    svg
      .append("g")
      .attr("class", "grid-lines")
      .selectAll("line")
      .data(hourTicks)
      .enter()
      .append("line")
      .attr("x1", (d) => xScale(d))
      .attr("x2", (d) => xScale(d))
      .attr("y1", margin.top - 20)
      .attr("y2", margin.top + innerHeight)
      .style("stroke", "rgba(255,255,255,0.3)")
      .style("stroke-dasharray", "4 2")
      .style("stroke-width", 1);

    // Always draw Y axis for desktop
    const yAxis = d3.axisLeft(yScale).tickSize(0).tickPadding(5); // Reduced tick padding
    const yAxisGroup = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(yAxis);
    yAxisGroup.select(".domain").remove();
    yAxisGroup.selectAll(".tick line").remove();
    yAxisGroup.selectAll<SVGTextElement, string>("text")
      .attr("text-anchor", "end")
      .attr("dx", "-0.5em")
      .style("font-size", "14px") // Reduced font size
      .style("font-weight", "bold")
      .style("fill", (d: string) => colorMap[d] || "#fff") // Apply the satellite's color
      .text((d: string) => d) // Set the text content
      .each(function (d: string) {
        const satelliteId = passes.find((p) => p.satelliteName === d)?.satelliteId;

        if (satelliteId) {
          const textElement = d3.select(this);
          textElement
            .html("") // Clear existing text
            .append("a")
            .attr("href", `/${"fr" /* ou dynamique */}/tools/satellite-explorer?satelliteId=${encodeURIComponent(satelliteId)}`)
            .attr("target", "_blank")
            .style("text-decoration", "none")
            .style("fill", colorMap[d] || "#fff") // Ensure the link inherits the satellite's color
            .text(d);
        }
      });

    // Draw horizontal separator lines for each row
    svg
      .selectAll("line.separator")
      .data(uniqueSatellites)
      .enter()
      .append("line")
      .attr("class", "separator")
      .attr("x1", margin.left)
      .attr("x2", width - margin.right)
      .attr("y1", (d) => yScale(d)!)
      .attr("y2", (d) => yScale(d)!)
      .style("stroke", "rgba(255,255,255,0.5)")
      .style("stroke-width", 2);

    // Tooltip setup
    const tooltip = parentDiv
      .append("div")
      .style("position", "absolute")
      .style("background", "rgba(0, 0, 0, 0.8)")
      .style("color", "#fff")
      .style("padding", "8px 12px")
      .style("border-radius", "6px")
      .style("pointer-events", "none")
      .style("display", "none")
      .style("font-size", "16px");

    // Draw the pass rectangles
    const rectWidth = 30;
    svg
      .selectAll("rect.pass")
      .data(passes)
      .enter()
      .append("rect")
      .attr("class", "pass")
      .attr("x", (d) => {
        const passStart = new Date(d.startTime);
        return xScale(passStart) - rectWidth / 2;
      })
      .attr("y", (d) => {
        const yPos = yScale(d.satelliteName)!;
        // Center in the band
        return yPos + (yScale.bandwidth() - (rowHeight - 4)) / 2;
      })
      .attr("width", rectWidth)
      .attr("height", rowHeight - 4)
      .attr("fill", (d) => colorMap[d.satelliteName])
      .attr("rx", 5)
      .attr("ry", 5)
      .on("mouseover", (event, d) => {
        const aosDate = new Date(d.startTime);
        const losDate = new Date(d.endTime);
        if (useLocalTime) {
          aosDate.setHours(aosDate.getHours() + utcOffset);
          losDate.setHours(losDate.getHours() + utcOffset);
        }
        const aosLabel = tooltipTimeFormat(aosDate);
        let losLabel = tooltipTimeFormat(losDate);
        const diffLOS = dayDifference(aosDate, losDate);
        if (diffLOS > 0) {
          losLabel += `<sup>+${diffLOS}</sup>`;
        }
        const elevationInt = Math.round(d.maxElevation);
        tooltip
          .style("display", "block")
          .html(
            `<strong>${d.satelliteName}</strong><br/>
             AOS: ${aosLabel}<br/>
             LOS: ${losLabel}<br/>
             Élévation max: ${elevationInt}°<br/>`
          );
      })
      .on("mousemove", (event) => {
        tooltip
          .style("top", `${event.offsetY - 40}px`)
          .style("left", `${event.offsetX + 10}px`);
      })
      .on("mouseout", () => {
        tooltip.style("display", "none");
      });

    // Container styling
    if (svgRef.current?.parentElement) {
      d3.select(svgRef.current.parentElement)
        .style("background", "#1a1a1a")
        .style("border-radius", "12px")
        .style("padding", "20px")
        .style("box-shadow", "0px 4px 10px rgba(0, 0, 0, 0.3)")
        .style("overflow-x", "auto") // Enable horizontal scrolling
        .style("white-space", "nowrap") // Prevent wrapping
        .style("max-width", "100%"); // Ensure container doesn't exceed parent width
    }

    return () => {
      tooltip.remove();
    };
  }, [passes, useLocalTime, utcOffset]);

  return (
    <div className="relative w-full">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default SatelliteTimeline;
