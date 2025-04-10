"use client";

import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import Link from "next/link";
import { satelliteColors } from "@/src/utils/satelliteColors";

interface SatellitePass {
  startTime: string;
  endTime: string;
  maxElevation: number;
  satelliteName: string;
  satelliteId: string;
  aosAzimuth: number; // Ajout de la propriété aosAzimuth
  losAzimuth: number; // Ajout de la propriété losAzimuth
}

interface TimelineProps {
  passes: SatellitePass[];
  useLocalTime: boolean;
  utcOffset: number;
}

const colorMap: { [key: string]: string } = {};
// Utilisation des couleurs définies dans l'utilitaire
const colors = satelliteColors;

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

// Fonction pour convertir un azimut en direction cardinale
const getCardinalDirection = (azimuth: number): string => {
  const directions = [
    "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
    "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW", "N",
  ];
  const index = Math.round((azimuth % 360) / 22.5);
  return directions[index];
};

const SatelliteTimeline: React.FC<TimelineProps> = ({
  passes,
  useLocalTime,
  utcOffset,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const parentDiv = d3.select(svgRef.current.parentElement);

    // Get parent container width for better sizing
    const containerWidth = svgRef.current.parentElement?.clientWidth || window.innerWidth;

    // Increase left margin to accommodate longer satellite names
    const width = Math.min(containerWidth - 100, 1600);
    const margin = { top: 60, right: 50, bottom: 50, left: 180 }; // Increased from 140 to 180
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

    // X axis: time scale with better tick spacing for wider display
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

    // Time format and X axis drawing with more frequent ticks for wider timeline
    const timeFormat = d3.timeFormat("%H");
    const tooltipTimeFormat = d3.timeFormat("%I:%M %p");

    // Adapt tick frequency based on available width for better readability
    const tickInterval = width > 1000 ? 1 : 2; // Use hourly ticks for wider displays

    const xAxis = d3
      .axisTop(xScale)
      .tickSize(0)
      .ticks(d3.timeHour.every(tickInterval))
      .tickFormat((d) => {
        const date = new Date(d as Date);
        if (useLocalTime) date.setHours(date.getHours() + utcOffset);
        return timeFormat(date);
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

    // Vertical grid lines - match tick frequency
    const hourInterval = d3.timeHour.every(tickInterval)!;
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
    const yAxis = d3.axisLeft(yScale).tickSize(0).tickPadding(15); // Increased tick padding for more space
    const yAxisGroup = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(yAxis);
    yAxisGroup.select(".domain").remove();
    yAxisGroup.selectAll(".tick line").remove();
    yAxisGroup.selectAll<SVGTextElement, string>("text")
      .attr("text-anchor", "end")
      .attr("dx", "-1em") // More space between text and axis
      .style("font-size", "14px") // Reduced font size
      .style("font-weight", "bold")
      .style("fill", (d: string) => colorMap[d] || "#fff") // Apply the satellite's color
      .text((d: string) => d) // Set the text content
      .each(function (d: string) {
        const satelliteId = passes.find((p) => p.satelliteName === d)?.satelliteId;

        if (satelliteId) {
          const textElement = d3.select(this);
          const textNode = textElement.node();

          // More aggressive text truncation
          if (textNode) {
            const textWidth = (textNode as SVGTextElement).getComputedTextLength();
            const availableWidth = margin.left - 30; // More space reserved for text

            // If text is too long, truncate with ellipsis with more aggressive ratio
            if (textWidth > availableWidth) {
              const text = d;
              const ellipsis = "...";
              // More conservative ratio to ensure text fits
              const ratio = (availableWidth - 20) / textWidth;
              const visibleLength = Math.max(5, Math.floor(text.length * ratio) - ellipsis.length);
              const truncatedText = text.substring(0, visibleLength) + ellipsis;

              // Apply truncated text
              textElement.text(truncatedText);

              // Add tooltip with full name
              textElement
                .append("title") // Native SVG title element acts as a tooltip
                .text(d);
            }
          }

          textElement
            .html("") // Clear existing text
            .append("a")
            .attr("href", `/${"fr" /* ou dynamique */}/tools/satellite-explorer?satelliteId=${encodeURIComponent(satelliteId)}`)
            .attr("target", "_blank")
            .style("text-decoration", "none")
            .style("fill", colorMap[d] || "#fff")
            .text(function() {
              // Get the truncated text if we calculated it above
              if (textNode && (textNode as SVGTextElement).getComputedTextLength() > (margin.left - 30)) {
                const text = d;
                const ellipsis = "...";
                const ratio = (margin.left - 30 - 20) / (textNode as SVGTextElement).getComputedTextLength();
                const visibleLength = Math.max(5, Math.floor(text.length * ratio) - ellipsis.length);
                return text.substring(0, visibleLength) + ellipsis;
              }
              return d;
            })
            .append("title") // Add tooltip regardless
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
        const aosAzInt = Math.round(d.aosAzimuth);
        const losAzInt = Math.round(d.losAzimuth);
        tooltip
          .style("display", "block")
          .html(
            `<strong>${d.satelliteName}</strong><br/>
             AOS: ${aosLabel}<br/>
             LOS: ${losLabel}<br/>
             Élévation max: ${elevationInt}°<br/>
             Azimuth: ${aosAzInt}° (${getCardinalDirection(d.aosAzimuth)}) → 
             ${losAzInt}° (${getCardinalDirection(d.losAzimuth)})<br/>`
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

    // Container styling - add padding on the left side
    if (svgRef.current?.parentElement) {
      d3.select(svgRef.current.parentElement)
        .style("background", "#1a1a1a")
        .style("border-radius", "12px")
        .style("padding", "20px 10px")
        .style("box-shadow", "0px 4px 10px rgba(0, 0, 0, 0.3)")
        .style("overflow-x", "auto")
        .style("white-space", "nowrap")
        .style("max-width", "100%")
        .style("display", "flex")
        .style("justify-content", "center")
        .style("padding-left", "20px"); // Add explicit left padding
    }

    return () => {
      tooltip.remove();
    };
  }, [passes, useLocalTime, utcOffset]);

  return (
    <div className="relative w-full flex justify-center">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default SatelliteTimeline;
