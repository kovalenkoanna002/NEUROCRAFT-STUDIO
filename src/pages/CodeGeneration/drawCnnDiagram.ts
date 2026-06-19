import * as d3 from "d3";
import { Layer } from "../../api/Network";

export type CnnColorPair = { start: string; end: string };

export interface DrawCnnOptions {
  colors: Record<string, CnnColorPair>;
  lineColor: string;
  solidFill: boolean;
  onHover: (layer: Layer | null) => void;
}

export function drawCnnDiagram(
  svgEl: SVGSVGElement | null,
  layers: Layer[],
  opts: DrawCnnOptions
) {
  if (!svgEl) return;
  const { colors, lineColor, solidFill } = opts;
  const setHoveredLayer = opts.onHover;
  const svg = d3.select(svgEl);
  svg.selectAll("*").remove();

  const height = 380;
  const midY = 190;
  const padL = 78;
  const padR = 80;
  const gap = 54;
  const stackOff = 5;
  const r = 10;
  const neuronGap = 24;

  const stackDepth = (filters: number) =>
    Math.max(2, Math.min(13, Math.round(Math.log2(Math.max(filters, 1)) * 1.6)));

  const GRAD: Record<string, [string, string]> = Object.fromEntries(
    Object.entries(colors).map(([k, c]) => [k, [c.start, c.end]])
  );
  const STROKE: Record<string, string> = Object.fromEntries(
    Object.entries(colors).map(([k, c]) => [k, c.end])
  );
  const DISPLAY: Record<string, string> = {
    input: "INPUT",
    conv: "CONV",
    pool: "POOL",
    flatten: "FLATTEN",
    dense: "DENSE",
    output: "OUTPUT",
    dropout: "DROPOUT",
    batchnorm: "BATCHNORM",
  };

  const defs = svg.append("defs");
  Object.entries(GRAD).forEach(([k, [a, b]]) => {
    const lg = defs
      .append("linearGradient")
      .attr("id", `cnng-${k}`)
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "100%");
    lg.append("stop").attr("offset", "0%").attr("stop-color", a);
    lg.append("stop").attr("offset", "100%").attr("stop-color", b);
  });
  const marker = defs
    .append("marker")
    .attr("id", "cnn-arrow")
    .attr("viewBox", "0 0 10 10")
    .attr("refX", 8)
    .attr("refY", 5)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto-start-reverse");
  marker.append("path").attr("d", "M0 0 L10 5 L0 10 z").attr("fill", lineColor);

  interface Geom {
    layer: Layer;
    kind: "stack" | "flatten" | "neurons" | "band";
    size: number;
    depth: number;
    width: number;
    x: number;
    leftX: number;
    rightX: number;
    faceTop: number;
    faceBot: number;
    cx: number;
    ys: number[];
    truncated: boolean;
    markerHalf: number;
  }

  let face = 78;
  let lastDepth = 4;

  const geom: Geom[] = layers.map((layer) => {
    let kind: Geom["kind"] = "stack";
    let depth = 1;
    let size = face;
    let width = face;
    const ys: number[] = [];
    let truncated = false;
    let markerHalf = 0;

    switch (layer.type) {
      case "input":
        depth = 1;
        size = face;
        width = size;
        break;
      case "conv":
        depth = stackDepth(layer.neuronCount);
        lastDepth = depth;
        size = face;
        width = size + (depth - 1) * stackOff;
        break;
      case "pool":
        face = Math.max(34, face * 0.82);
        depth = lastDepth;
        size = face;
        width = size + (depth - 1) * stackOff;
        break;
      case "flatten":
        kind = "flatten";
        size = face;
        width = 22;
        break;
      case "dropout":
      case "batchnorm":
        kind = "band";
        size = 150;
        width = 26;
        break;
      case "dense":
      case "output": {
        kind = "neurons";
        const max =
          layer.type === "output" ? Math.min(layer.neuronCount, 10) : 8;
        const total = Math.max(layer.neuronCount, 1);
        if (total <= max) {
          const startY = midY - ((total - 1) * neuronGap) / 2;
          for (let i = 0; i < total; i++) ys.push(startY + i * neuronGap);
        } else {
          truncated = true;
          const half = Math.floor(max / 2);
          for (let i = 0; i < half; i++)
            ys.push(midY - (half - i + 0.5) * neuronGap);
          for (let i = 0; i < half; i++)
            ys.push(midY + (i + 1.5) * neuronGap);
        }
        width = 2 * r;
        break;
      }
    }

    if (kind === "stack") markerHalf = Math.max(8, size * 0.18) / 2;

    return {
      layer,
      kind,
      size,
      depth,
      width,
      ys,
      truncated,
      markerHalf,
      x: 0,
      leftX: 0,
      rightX: 0,
      faceTop: 0,
      faceBot: 0,
      cx: 0,
    };
  });

  let cursor = padL;
  geom.forEach((g) => {
    g.x = cursor;
    if (g.kind === "neurons") {
      g.cx = g.x + r;
      g.leftX = g.cx - r;
      g.rightX = g.cx + r;
      g.faceTop = midY;
      g.faceBot = midY;
    } else if (g.kind === "band") {
      g.cx = g.x + g.width / 2;
      g.leftX = g.x;
      g.rightX = g.x + g.width;
      g.faceTop = midY - g.size / 2;
      g.faceBot = midY + g.size / 2;
    } else {
      g.cx = g.x + g.size / 2;
      g.leftX = g.x;
      g.rightX = g.kind === "flatten" ? g.x + g.width : g.x + g.size;
      g.faceTop = midY - g.size / 2;
      g.faceBot = midY + g.size / 2;
    }
    cursor += g.width + gap;
  });

  const totalWidth = cursor - gap + padR;
  svg.attr("width", Math.max(totalWidth, 600)).attr("height", height);

  const gConn = svg.append("g");
  const gNode = svg.append("g");
  const gTop = svg.append("g");

  const lineIn =
    (group: d3.Selection<SVGGElement, unknown, null, undefined>) =>
    (x1: number, y1: number, x2: number, y2: number, w = 0.5, op = 0.35) =>
      group
        .append("line")
        .attr("x1", x1)
        .attr("y1", y1)
        .attr("x2", x2)
        .attr("y2", y2)
        .attr("stroke", lineColor)
        .attr("stroke-width", w)
        .attr("opacity", op);

  const conn = lineIn(gConn);
  const connTop = lineIn(gTop);

  const rightAnchor = (g: Geom) =>
    g.kind === "stack"
      ? { x: g.cx + g.markerHalf, top: midY - g.markerHalf, bot: midY + g.markerHalf }
      : { x: g.rightX, top: g.faceTop, bot: g.faceBot };
  const leftAnchor = (g: Geom) => ({
    x: g.leftX,
    top: g.faceTop,
    bot: g.faceBot,
  });

  const flow = geom.filter((g) => g.kind !== "band");
  for (let i = 0; i < flow.length - 1; i++) {
    const a = flow[i];
    const b = flow[i + 1];
    const aN = a.kind === "neurons";
    const bN = b.kind === "neurons";

    if (aN && bN) {
      a.ys.forEach((y1) =>
        b.ys.forEach((y2) => conn(a.rightX, y1, b.leftX, y2, 0.4, 0.3))
      );
    } else if (!aN && bN) {
      const ra = rightAnchor(a);
      b.ys.forEach((y2) => conn(ra.x, midY, b.leftX, y2, 0.6, 0.45));
    } else if (aN && !bN) {
      const la = leftAnchor(b);
      a.ys.forEach((y1) => conn(a.rightX, y1, la.x, midY, 0.6, 0.45));
    } else {
      const ra = rightAnchor(a);
      const lb = leftAnchor(b);
      connTop(ra.x, ra.top, lb.x, midY, 0.9, 0.8).attr(
        "stroke-dasharray",
        "5 3"
      );
      connTop(ra.x, ra.bot, lb.x, midY, 0.9, 0.8).attr(
        "stroke-dasharray",
        "5 3"
      );
    }
  }

  const counters: Record<string, number> = {};
  geom.forEach((g) => {
    const type = g.layer.type;

    const grad = solidFill
      ? GRAD[type]?.[0] ?? "#cbd5e1"
      : `url(#cnng-${type})`;
    const stroke = STROKE[type] ?? lineColor;

    const blockG = gNode
      .append("g")
      .style("cursor", "pointer")
      .on("mouseenter", () => setHoveredLayer(g.layer))
      .on("mouseleave", () => setHoveredLayer(null));

    if (g.kind === "stack") {
      for (let k = g.depth - 1; k >= 0; k--) {
        blockG
          .append("rect")
          .attr("x", g.x + k * stackOff)
          .attr("y", g.faceTop - k * stackOff)
          .attr("width", g.size)
          .attr("height", g.size)
          .attr("rx", 3)
          .attr("fill", grad)
          .attr("stroke", stroke)
          .attr("stroke-width", 1);
      }
      if (g.markerHalf > 0) {
        blockG
          .append("rect")
          .attr("x", g.cx - g.markerHalf)
          .attr("y", midY - g.markerHalf)
          .attr("width", g.markerHalf * 2)
          .attr("height", g.markerHalf * 2)
          .attr("fill", "none")
          .attr("stroke", "#0f172a")
          .attr("stroke-width", 1);
      }
    } else if (g.kind === "flatten") {
      blockG
        .append("rect")
        .attr("x", g.x)
        .attr("y", g.faceTop)
        .attr("width", g.width)
        .attr("height", g.size)
        .attr("rx", 2)
        .attr("fill", grad)
        .attr("stroke", stroke);
    } else if (g.kind === "band") {
      const isDrop = g.layer.type === "dropout";
      const bandStroke = isDrop ? "#ef4444" : "#10b981";
      blockG
        .append("rect")
        .attr("x", g.x)
        .attr("y", g.faceTop)
        .attr("width", g.width)
        .attr("height", g.size)
        .attr("rx", 8)
        .attr("fill", isDrop ? "rgba(239,68,68,0.08)" : "rgba(16,185,129,0.08)")
        .attr("stroke", bandStroke)
        .attr("stroke-width", 1.4)
        .attr("stroke-dasharray", "5 4");
    } else {
      g.ys.forEach((y) =>
        blockG
          .append("circle")
          .attr("cx", g.cx)
          .attr("cy", y)
          .attr("r", r)
          .attr("fill", grad)
          .attr("stroke", stroke)
      );
      if (g.truncated) {
        blockG
          .append("text")
          .attr("x", g.cx)
          .attr("y", midY + 4)
          .attr("text-anchor", "middle")
          .style("font-size", "15px")
          .text("⋮");
      }
    }

    let name = DISPLAY[type] ?? type.toUpperCase();
    if (type === "conv" || type === "pool" || type === "dense") {
      counters[type] = (counters[type] ?? 0) + 1;
      name = `${name} ${counters[type]}`;
    }
    const detail =
      type === "conv"
        ? `${g.layer.neuronCount}@${g.layer.kernelSize ?? 3}×${
            g.layer.kernelSize ?? 3
          }`
        : type === "pool"
        ? `${g.layer.poolSize ?? 2}×${g.layer.poolSize ?? 2}`
        : type === "dense" || type === "output"
        ? `${g.layer.neuronCount}`
        : type === "input"
        ? `${g.layer.neuronCount} ch`
        : type === "dropout"
        ? `p=${g.layer.rate ?? 0.5}`
        : "";

    blockG
      .append("text")
      .attr("x", g.cx)
      .attr("y", height - 22)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "600")
      .text(name);
    if (detail) {
      blockG
        .append("text")
        .attr("x", g.cx)
        .attr("y", height - 8)
        .attr("text-anchor", "middle")
        .style("font-size", "11px")
        .style("fill", "#64748b")
        .text(detail);
    }
  });

  const first = geom[0];
  const inN = Math.min(Math.max(first.layer.neuronCount, 1), 3);
  const inSpread = (inN - 1) * 22;
  for (let i = 0; i < inN; i++) {
    const y = midY - inSpread / 2 + i * 22;
    gNode
      .append("line")
      .attr("x1", first.leftX - 46)
      .attr("y1", y)
      .attr("x2", first.leftX - 6)
      .attr("y2", y)
      .attr("stroke", lineColor)
      .attr("stroke-width", 1)
      .attr("marker-end", "url(#cnn-arrow)");
    gNode
      .append("text")
      .attr("x", first.leftX - 54)
      .attr("y", y + 4)
      .attr("text-anchor", "end")
      .style("font-size", "13px")
      .text(`x${i + 1}`);
  }

  const last = geom[geom.length - 1];
  if (last.kind === "neurons") {
    last.ys.forEach((y, idx) => {
      gNode
        .append("line")
        .attr("x1", last.rightX + 6)
        .attr("y1", y)
        .attr("x2", last.rightX + 44)
        .attr("y2", y)
        .attr("stroke", lineColor)
        .attr("stroke-width", 1)
        .attr("marker-end", "url(#cnn-arrow)");
      gNode
        .append("text")
        .attr("x", last.rightX + 52)
        .attr("y", y + 4)
        .style("font-size", "13px")
        .text(`y${idx + 1}`);
    });
  }
}
