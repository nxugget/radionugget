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

    // Nettoyage du conteneur parent
    parentDiv.selectAll(".no-passes-message").remove();

    if (passes.length === 0) {
      parentDiv
        .append("div")
        .attr("class", "no-passes-message")
        .style("color", "white")
        .style("text-align", "center")
        .style("margin-top", "20px")
        .text("Aucun passage avec cette configuration.");
      return;
    }

    // Marges pour ajuster l'espace (à gauche pour les noms, à droite pour la frise)
    const margin = { top: 60, right: 20, bottom: 50, left: 200 };
    const rowHeight = 40;

    // On récupère la liste unique des satellites
    const uniqueSatellites = Array.from(
      new Set(passes.map((d) => d.satelliteName))
    );
    const innerHeight = uniqueSatellites.length * rowHeight;

    // Largeur maximale : 1400, sinon fenêtre - 100
    const width = Math.min(window.innerWidth - 100, 1400);

    // Sélection et configuration de base du SVG
    const svg = d3
      .select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", innerHeight + margin.top + margin.bottom);

    // Nettoyage du SVG avant redessin
    svg.selectAll("*").remove();

    // Assigne une couleur par satellite s'il n'est pas déjà défini
    uniqueSatellites.forEach((sat, index) => {
      if (!colorMap[sat]) {
        colorMap[sat] = colors[index % colors.length];
      }
    });

    // On définit les dates min et max pour l'échelle X
    // Pour donner un repère : on part de la plus petite date (AOS) et
    // on ajoute 1h à la plus grande date (LOS) pour laisser de la marge à droite
    const minStart = d3.min(passes, (d) => new Date(d.startTime))!;
    const maxEnd = new Date(
      d3.max(passes, (d) => new Date(d.endTime)) || minStart
    );
    maxEnd.setHours(maxEnd.getHours() + 1);

    // Échelles X et Y
    const xScale = d3
      .scaleTime()
      .domain([minStart, maxEnd])
      .range([margin.left, width - margin.right]);

    const yScale = d3
      .scaleBand()
      .domain(uniqueSatellites)
      .range([margin.top, margin.top + innerHeight])
      .padding(0);

    // Format pour l'affichage des heures (on retire la date)
    const timeFormat = d3.timeFormat("%I:%M %p"); // ex: 08:05 AM

    // Axe X (en haut)
    const xAxis = d3
      .axisTop(xScale)
      .tickSize(0)
      // Force une heure sur trois
      .ticks(d3.timeHour.every(3))
      .tickFormat((d) => {
        const date = new Date(d as Date);
        if (useLocalTime) {
          date.setHours(date.getHours() + utcOffset);
        }
        return timeFormat(date);
      });

    const xAxisGroup = svg
      .append("g")
      .attr("transform", `translate(0, ${margin.top - 20})`)
      .call(xAxis);

    // Supprime la ligne noire (domain) et les petits traits (tick lines)
    xAxisGroup.select(".domain").remove();
    xAxisGroup.selectAll(".tick line").remove();

    // Couleur et taille du texte des horaires
    xAxisGroup
      .selectAll(".tick text")
      .style("fill", "#fff")
      .style("font-size", "16px");

    // Lignes verticales (grid) toutes les heures
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
      // On remonte jusqu'à (margin.top - 20) pour "déborder" sous les heures
      .attr("y1", margin.top - 20)
      .attr("y2", margin.top + innerHeight)
      .style("stroke", "rgba(255,255,255,0.3)")
      .style("stroke-dasharray", "4 2")
      .style("stroke-width", 1);

    // Axe Y (noms de satellites), sans ligne verticale
    const yAxis = d3.axisLeft(yScale).tickSize(0).tickPadding(0);
    const yAxisGroup = svg
      .append("g")
      // Ajustez le -20 pour peaufiner la distance entre noms et frise
      .attr("transform", `translate(${margin.left - 20}, 0)`)
      .call(yAxis);

    yAxisGroup.select(".domain").remove(); // supprime la ligne verticale
    yAxisGroup.selectAll(".tick line").remove(); // supprime d'éventuels petits traits
    yAxisGroup
      .selectAll<SVGTextElement, string>("text")
      .attr("text-anchor", "end")
      .attr("dx", "-0.5em")
      .style("fill", (d) => colorMap[d] || "#fff")
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
      .attr("x2", width - margin.right)
      .attr("y1", (d) => yScale(d)!)
      .attr("y2", (d) => yScale(d)!)
      .style("stroke", "rgba(255,255,255,0.5)")
      .style("stroke-width", 2);

    // Tooltip
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

    // Dessin des rectangles pour chaque passage
    const rectWidth = 30;
    svg
      .selectAll<SVGRectElement, SatellitePass>("rect.pass")
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

        // Conversion en heure locale si besoin
        if (useLocalTime) {
          aosDate.setHours(aosDate.getHours() + utcOffset);
          losDate.setHours(losDate.getHours() + utcOffset);
        }

        // Format d'heure sans la date
        const aosLabel = timeFormat(aosDate);
        let losLabel = timeFormat(losDate);

        // Calcul du +1 (ou +2, etc.) si LOS se fait le(s) jour(s) suivant(s)
        const diffLOS = dayDifference(aosDate, losDate);
        if (diffLOS > 0) {
          losLabel += `<sup>+${diffLOS}</sup>`;
        }

        // Élévation arrondie à l'entier (sans décimale)
        const elevationInt = Math.round(d.maxElevation);

        tooltip
          .style("display", "block")
          .html(
            `<strong>${d.satelliteName}</strong><br/>
             AOS: ${aosLabel}<br/>
             LOS: ${losLabel}<br/>
             Élévation max: ${elevationInt}°`
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

    // Style du conteneur parent
    if (svgRef.current?.parentElement) {
      d3.select(svgRef.current.parentElement)
        .style("background", "#1a1a1a")
        .style("border-radius", "12px")
        .style("padding", "20px")
        .style("box-shadow", "0px 4px 10px rgba(0, 0, 0, 0.3)");
    }

    // Nettoyage du tooltip lors du démontage
    return () => {
      tooltip.remove();
    };
  }, [passes, useLocalTime, utcOffset]);

  return (
    <div className="relative">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default SatelliteTimeline;
