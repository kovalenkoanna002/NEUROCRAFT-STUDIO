import * as d3 from "d3";
import { GanSpec } from "../../auth/projects";

export type GanRolePair = { start: string; end: string };

export interface DrawGanOptions {
  colors: { gen: GanRolePair; disc: GanRolePair; data: GanRolePair };
  lineColor: string;
  solidFill: boolean;
}

export function drawGanDiagram(
  svgEl: SVGSVGElement | null,
  spec: GanSpec,
  opts: DrawGanOptions
) {
  if (!svgEl) return;
  const { latentDim, dataDim, generator: gen, discriminator: disc } = spec;
  const { colors, lineColor, solidFill } = opts;
  const svg = d3.select(svgEl);
  svg.selectAll("*").remove();
  const W = 760;
  const H = 300;
  svg.attr("viewBox", `0 0 ${W} ${H}`).attr("width", "100%");

  const defs = svg.append("defs");

  const sh = defs
    .append("filter")
    .attr("id", "gan-shadow")
    .attr("x", "-20%")
    .attr("y", "-30%")
    .attr("width", "140%")
    .attr("height", "170%");
  sh.append("feDropShadow")
    .attr("dx", 0)
    .attr("dy", 2)
    .attr("stdDeviation", 2.5)
    .attr("flood-color", "#0f172a")
    .attr("flood-opacity", 0.16);

  const grad = (id: string, light: string, deep: string) => {
    const lg = defs
      .append("linearGradient")
      .attr("id", id)
      .attr("x1", "0")
      .attr("y1", "0")
      .attr("x2", "0")
      .attr("y2", "1");
    lg.append("stop").attr("offset", "0%").attr("stop-color", "#ffffff");
    lg.append("stop").attr("offset", "40%").attr("stop-color", light);
    lg.append("stop").attr("offset", "100%").attr("stop-color", deep);
  };
  const deeper = (hex: string) => d3.color(hex)?.darker(0.3)?.toString() ?? hex;
  const lighter = (hex: string) => d3.interpolateRgb(hex, "#ffffff")(0.5);
  grad("gan-gen", colors.gen.start, deeper(colors.gen.start));
  grad("gan-genL", lighter(colors.gen.start), colors.gen.start);
  grad("gan-disc", colors.disc.start, deeper(colors.disc.start));
  grad("gan-discL", lighter(colors.disc.start), colors.disc.start);
  grad("gan-data", colors.data.start, deeper(colors.data.start));

  const mk = (id: string, color: string) => {
    const m = defs
      .append("marker")
      .attr("id", id)
      .attr("viewBox", "0 0 10 10")
      .attr("refX", 8)
      .attr("refY", 5)
      .attr("markerWidth", 7)
      .attr("markerHeight", 7)
      .attr("orient", "auto-start-reverse");
    m.append("path").attr("d", "M0 0 L10 5 L0 10 z").attr("fill", color);
  };
  mk("gan-arrow", lineColor);
  mk("gan-arrow-fb", "#f97316");

  const arrow = (x1: number, y1: number, x2: number, y2: number) =>
    svg
      .append("path")
      .attr(
        "d",
        `M ${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}`
      )
      .attr("fill", "none")
      .attr("stroke", lineColor)
      .attr("stroke-width", 1.8)
      .attr("marker-end", "url(#gan-arrow)");

  const fillFor = (role: "gen" | "disc" | "data", light: boolean): string =>
    solidFill ? colors[role].start : `url(#gan-${role}${light ? "L" : ""})`;

  const block = (
    x: number,
    y: number,
    w: number,
    h: number,
    fill: string,
    stroke: string,
    lines: string[]
  ) => {
    const g = svg.append("g");
    g.append("rect")
      .attr("x", x)
      .attr("y", y)
      .attr("width", w)
      .attr("height", h)
      .attr("rx", 10)
      .attr("fill", fill)
      .attr("stroke", stroke)
      .attr("stroke-width", 1.5)
      .attr("filter", "url(#gan-shadow)");
    lines.forEach((t, i) => {
      g.append("text")
        .attr("x", x + w / 2)
        .attr("y", y + h / 2 - (lines.length - 1) * 8 + i * 16 + 5)
        .attr("text-anchor", "middle")
        .style("font-size", i === 0 ? "13px" : "11px")
        .style("font-weight", i === 0 ? "700" : "400")
        .attr("fill", i === 0 ? stroke : "#475569")
        .text(t);
    });
  };

  const flowLabel = (x: number, y: number, t: string) =>
    svg
      .append("text")
      .attr("x", x)
      .attr("y", y)
      .attr("text-anchor", "middle")
      .style("font-size", "10px")
      .attr("fill", "#94a3b8")
      .text(t);

  block(28, 52, 86, 48, fillFor("gen", true), colors.gen.end, [
    "Шум z",
    `${latentDim}`,
  ]);
  block(150, 30, 184, 92, fillFor("gen", false), colors.gen.end, [
    "Генератор",
    `${latentDim} → ${gen.join(" → ")} → ${dataDim}`,
  ]);
  block(370, 52, 104, 48, fillFor("gen", true), colors.gen.end, [
    "Образец",
    "(fake)",
  ]);

  block(150, 198, 184, 48, fillFor("data", false), colors.data.end, [
    "Реальные данные",
    `${dataDim}`,
  ]);

  block(520, 96, 200, 92, fillFor("disc", false), colors.disc.end, [
    "Дискриминатор",
    `${dataDim} → ${disc.join(" → ")} → 1`,
  ]);
  block(520, 210, 200, 44, fillFor("disc", true), colors.disc.end, [
    "Реально / Фейк",
    "вероятность ∈ [0, 1]",
  ]);

  arrow(114, 76, 150, 76);
  arrow(334, 76, 370, 76);
  arrow(474, 76, 520, 124);
  arrow(334, 222, 520, 160);
  arrow(620, 188, 620, 210);
  flowLabel(498, 96, "fake");
  flowLabel(432, 205, "real");

  svg
    .append("path")
    .attr("d", "M 520 232 C 360 292, 250 292, 242 122")
    .attr("fill", "none")
    .attr("stroke", "#f97316")
    .attr("stroke-width", 1.6)
    .attr("stroke-dasharray", "5 4")
    .attr("opacity", 0.9)
    .attr("marker-end", "url(#gan-arrow-fb)");
  svg
    .append("text")
    .attr("x", 372)
    .attr("y", 287)
    .attr("text-anchor", "middle")
    .style("font-size", "10.5px")
    .style("font-weight", "600")
    .attr("fill", "#ea580c")
    .text("градиент: генератор учится обманывать дискриминатор");
}
