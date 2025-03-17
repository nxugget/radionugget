"use client";

import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

interface SatellitePass {
  startTime: string;
  endTime: string;
  maxElevation: number;
  satelliteName: string;
}

interface TimelineProps {
  passes: SatellitePass[];
  useLocalTime: boolean;
  utcOffset: number;
}

const colorMap: { [key: string]: string } = {};
const colors = d3.schemeCategory10;

const SatelliteTimeline: React.FC<TimelineProps> = ({
  passes,
  useLocalTime,
  utcOffset,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || passes.length === 0) return;

    // Marges et dimensions
    const margin = { top: 60, right: 10, bottom: 50, left: 150 };
    const rowHeight = 40;
    const uniqueSatellites = Array.from(new Set(passes.map((d) => d.satelliteName)));
    const innerHeight = uniqueSatellites.length * rowHeight;
    const width = Math.min(window.innerWidth - 100, 1400);

    const svg = d3
      .select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", innerHeight + margin.top + margin.bottom);

    // On nettoie le SVG avant de redessiner
    svg.selectAll("*").remove();

    // Assigner une couleur par satellite si non déjà présent dans colorMap
    uniqueSatellites.forEach((sat, index) => {
      if (!colorMap[sat]) {
        colorMap[sat] = colors[index % colors.length];
      }
    });

    // Échelles X (temps) et Y (satellites)
    const xScale = d3
      .scaleTime()
      .domain([
        d3.min(passes, (d) => new Date(d.startTime))!,
        d3.max(passes, (d) => new Date(d.endTime))!,
      ])
      .range([margin.left, width]);

    const yScale = d3
      .scaleBand()
      .domain(uniqueSatellites)
      .range([margin.top, margin.top + innerHeight])
      .padding(0);

    // Formats pour l'affichage des dates/horaires
    const axisTimeFormat = d3.timeFormat("%I:%M %p");
    const tooltipFormat = d3.timeFormat("%I:%M %p %Y-%m-%d");

    // Axe X (en haut)
    const xAxis = d3
      .axisTop(xScale)
      .ticks(10)
      .tickFormat((d) => {
        const date = new Date(d as Date);
        if (useLocalTime) {
          date.setHours(date.getHours() + utcOffset);
        }
        return axisTimeFormat(date);
      });

    svg
      .append("g")
      .attr("transform", `translate(0, ${margin.top - 20})`)
      .call(xAxis)
      .selectAll("text")
      .style("fill", "#fff")
      .style("font-size", "16px");

    // Trait blanc horizontal sous la frise
    svg
      .append("line")
      .attr("x1", margin.left)
      .attr("x2", width)
      .attr("y1", margin.top)
      .attr("y2", margin.top)
      .style("stroke", "#fff")
      .style("stroke-width", 2);

    // Lignes verticales (grid) toutes les heures
    // d3.timeHour.every(1) renvoie un CountableTimeInterval ou null => on force le !
    const hourInterval = d3.timeHour.every(1)!;
    const hourTicks = xScale.ticks(hourInterval);

    svg
      .append("g")
      .attr("class", "grid-lines")
      .selectAll<SVGLineElement, Date>("line")
      .data(hourTicks)
      .enter()
      .append("line")
      .attr("x1", (d) => xScale(d))
      .attr("x2", (d) => xScale(d))
      .attr("y1", margin.top)
      .attr("y2", margin.top + innerHeight)
      .style("stroke", "rgba(255,255,255,0.3)")
      .style("stroke-dasharray", "4 2")
      .style("stroke-width", 1);

    // Axe Y (noms de satellites) en couleur
    svg
      .append("g")
      .attr("transform", `translate(${margin.left - 10}, 0)`)
      .call(d3.axisLeft(yScale))
      // On précise <SVGTextElement, string> pour que TS sache que d est un string
      .selectAll<SVGTextElement, string>("text")
      .style("fill", (event, d) => colorMap[d] || "#fff")
      .style("font-size", "16px")
      .style("font-weight", "bold");

    // Lignes horizontales pour séparer les rangées
    svg
      .selectAll<SVGLineElement, string>("line.separator")
      .data(uniqueSatellites)
      .enter()
      .append("line")
      .attr("class", "separator")
      .attr("x1", margin.left)
      .attr("x2", width)
      .attr("y1", (d) => yScale(d)!)
      .attr("y2", (d) => yScale(d)!)
      .style("stroke", "rgba(255,255,255,0.5)")
      .style("stroke-width", 2);

    // Tooltip
    const tooltip = d3
      .select("body")
      .append("div")
      .style("position", "absolute")
      .style("background", "rgba(0, 0, 0, 0.8)")
      .style("color", "#fff")
      .style("padding", "8px 12px")
      .style("border-radius", "6px")
      .style("pointer-events", "none")
      .style("display", "none")
      .style("font-size", "16px");

    // Dessin des "carrés" (rectangles) pour chaque passage
    const squareWidth = 30;
    svg
      .selectAll<SVGRectElement, SatellitePass>("rect.pass")
      .data(passes)
      .enter()
      .append("rect")
      .attr("class", "pass")
      .attr("x", (d) => xScale(new Date(d.startTime)) - squareWidth / 2)
      .attr(
        "y",
        (d) =>
          yScale(d.satelliteName)! + (yScale.bandwidth() - (rowHeight - 4)) / 2
      )
      .attr("width", squareWidth)
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
        tooltip
          .style("display", "block")
          .html(
            `<strong>${d.satelliteName}</strong><br/>AOS: ${tooltipFormat(
              aosDate
            )}<br/>LOS: ${tooltipFormat(losDate)}`
          );
      })
      .on("mousemove", (event) => {
        tooltip
          .style("top", `${event.pageY - 40}px`)
          .style("left", `${event.pageX + 10}px`);
      })
      .on("mouseout", () => {
        tooltip.style("display", "none");
      });

    // Style du conteneur parent
    if (svgRef.current?.parentElement) {
      d3.select(svgRef.current.parentElement)
        .style("background", "#1a1a1a")
        .style("border-radius", "12px")
        .style("padding", "20px")
        .style("box-shadow", "0px 4px 10px rgba(0, 0, 0, 0.3)");
    }
  }, [passes, useLocalTime, utcOffset]);

  return (
    <div className="relative">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default SatelliteTimeline;
