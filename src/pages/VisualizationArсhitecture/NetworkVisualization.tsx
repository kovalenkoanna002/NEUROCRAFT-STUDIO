import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import styles from "./NetworkVisualization.module.css";
import Button from "../../components/Button/Button";
import { glossary, LAYER_TERM } from "../../data/glossary";
import { Layer as NetLayer } from "../../api/Network";
import { drawCnnDiagram } from "../CodeGeneration/drawCnnDiagram";
import { drawSequenceDiagram } from "../CodeGeneration/drawSequenceDiagram";
import { drawGanDiagram } from "../CodeGeneration/drawGanDiagram";
import { GanSpec } from "../../auth/projects";
import { useEditableLabels } from "../../hooks/useEditableLabels";
import { usePersistedState } from "../../hooks/usePersistedState";

export type Layer = NetLayer;
export interface NeuralNetwork {
  layers: Layer[];
}

const layerHint = (type: string): string =>
  glossary[LAYER_TERM[type]]?.definition ?? "";

const LABELS: Record<string, string> = {
  input: "Input",
  conv: "Conv2D",
  pool: "MaxPool",
  flatten: "Flatten",
  dense: "Dense",
  output: "Output",
  dropout: "Dropout",
  batchnorm: "BatchNorm",
  embedding: "Embedding",
  lstm: "LSTM",
  gru: "GRU",
  rnn: "SimpleRNN",
  attention: "Transformer",
  globalpool: "GlobalPool",
};

type Pair = { start: string; end: string };
const DEFAULT_COLORS: Record<string, Pair> = {
  input: { start: "#DBEAFE", end: "#1D4ED8" },
  conv: { start: "#BFDBFE", end: "#2563EB" },
  pool: { start: "#60A5FA", end: "#1E3A8A" },
  flatten: { start: "#93C5FD", end: "#1D4ED8" },
  dense: { start: "#DBEAFE", end: "#2563EB" },
  output: { start: "#BBF7D0", end: "#16A34A" },
  dropout: { start: "#FECACA", end: "#DC2626" },
  batchnorm: { start: "#BBF7D0", end: "#059669" },
  embedding: { start: "#DDD6FE", end: "#7C3AED" },
  lstm: { start: "#99F6E4", end: "#0D9488" },
  gru: { start: "#99F6E4", end: "#0D9488" },
  rnn: { start: "#99F6E4", end: "#0D9488" },
  attention: { start: "#C7D2FE", end: "#4338CA" },
  globalpool: { start: "#A5F3FC", end: "#0891B2" },
};

const colorOf = (colors: Record<string, Pair>, t: string): Pair =>
  colors[t] ?? { start: "#E2E8F0", end: "#64748B" };

const detailOf = (l: Layer): string => {
  switch (l.type) {
    case "conv":
      return `${l.neuronCount}@${l.kernelSize ?? 3}×${l.kernelSize ?? 3}`;
    case "pool":
      return `${l.poolSize ?? 2}×${l.poolSize ?? 2}`;
    case "dropout":
      return `p=${l.rate ?? 0.5}`;
    case "embedding":
      return `${l.vocabSize ?? 0}→${l.embeddingDim ?? 0}`;
    case "lstm":
    case "gru":
    case "rnn":
      return `${l.neuronCount} units${l.returnSequences ? " ↻" : ""}`;
    case "attention":
      return `${l.numHeads ?? 0} heads`;
    case "globalpool":
      return "avg";
    case "flatten":
    case "batchnorm":
      return "—";
    default:
      return `${l.neuronCount}`;
  }
};

const isPerceptron = (layers: Layer[]) =>
  layers.every((l) =>
    ["input", "hidden", "dense", "output"].includes(l.type)
  );

const NetworkVisualization: React.FC<{
  network: NeuralNetwork;
  gan?: GanSpec;
}> = ({ network, gan }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { enhance, overlay } = useEditableLabels(
    svgRef,
    undefined,
    "neurocraft.draft.viz.labels"
  );
  const [colors, setColors] = usePersistedState<Record<string, Pair>>(
    "neurocraft.draft.viz.colors",
    DEFAULT_COLORS
  );

  const [ganColors, setGanColors] = usePersistedState(
    "neurocraft.draft.viz.ganColors",
    {
      gen: { start: "#ede9fe", end: "#7c3aed" },
      disc: { start: "#ccfbf1", end: "#0d9488" },
      data: { start: "#cffafe", end: "#0891b2" },
    }
  );
  const [lineColor, setLineColor] = usePersistedState(
    "neurocraft.draft.viz.lineColor",
    "#475569"
  );
  const [solidFill, setSolidFill] = usePersistedState(
    "neurocraft.draft.viz.solidFill",
    false
  );
  const [hoveredLayer, setHoveredLayer] = useState<Layer | null>(null);

  const [hoveredInfo, setHoveredInfo] = useState<{
    title: string;
    text: string;
  } | null>(null);

  const handleSave = () => {
    const svgElement = svgRef.current;
    if (!svgElement) return;
    const vb = svgElement.viewBox.baseVal;
    const w = svgElement.clientWidth || vb.width || 800;
    const h = svgElement.clientHeight || vb.height || 400;
    const clone = svgElement.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("width", String(w));
    clone.setAttribute("height", String(h));
    const svgString = new XMLSerializer().serializeToString(clone);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const img = new Image();
    const scaleFactor = 3;
    canvas.width = w * scaleFactor;
    canvas.height = h * scaleFactor;
    context?.scale(scaleFactor, scaleFactor);
    img.onload = () => {
      if (context) {
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, w, h);
        context.drawImage(img, 0, 0, w, h);
      }
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = "network_visualization.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    img.src =
      "data:image/svg+xml;base64," +
      btoa(unescape(encodeURIComponent(svgString)));
  };

  useEffect(() => {

    const el = svgRef.current;
    if (el) {
      el.removeAttribute("viewBox");
      el.removeAttribute("width");
      el.removeAttribute("height");
    }

    if (gan) {
      drawGanDiagram(svgRef.current, gan, {
        colors: ganColors,
        lineColor,
        solidFill,
      });
      return;
    }

    const layers = network.layers;
    if (!layers.length) return;

    const isConv = layers.some(
      (l) => l.type === "conv" || l.type === "pool" || l.type === "flatten"
    );
    if (isConv) {
      drawCnnDiagram(svgRef.current, layers, {
        colors,
        lineColor,
        solidFill,
        onHover: setHoveredLayer,
      });
      return;
    }

    const seqTypes = ["embedding", "lstm", "gru", "rnn", "attention", "globalpool"];
    const isSeq = layers.some((l) => seqTypes.includes(l.type));
    if (isSeq) {
      drawSequenceDiagram(svgRef.current, layers, {
        variant: layers.some((l) => l.type === "attention")
          ? "transformer"
          : "rnn",
        colors,
        lineColor,
        solidFill,
        onHover: setHoveredInfo,
      });
      return;
    }

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const defs = svg.append("defs");

    const shadow = defs
      .append("filter")
      .attr("id", "viz-shadow")
      .attr("x", "-20%")
      .attr("y", "-30%")
      .attr("width", "140%")
      .attr("height", "170%");
    shadow
      .append("feDropShadow")
      .attr("dx", 0)
      .attr("dy", 2)
      .attr("stdDeviation", 2.5)
      .attr("flood-color", "#0f172a")
      .attr("flood-opacity", 0.16);

    Object.entries(colors).forEach(([type, c]) => {
      const deeper = d3.color(c.start)?.darker(0.35)?.toString() ?? c.start;
      const lg = defs
        .append("linearGradient")
        .attr("id", `viz-grad-${type}`)
        .attr("x1", "0")
        .attr("y1", "0")
        .attr("x2", "0")
        .attr("y2", "1");
      lg.append("stop").attr("offset", "0%").attr("stop-color", "#ffffff");
      lg.append("stop").attr("offset", "38%").attr("stop-color", c.start);
      lg.append("stop").attr("offset", "100%").attr("stop-color", deeper);
    });

    const mkArrow = (id: string, color: string) => {
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
    mkArrow("viz-arrow", lineColor);
    mkArrow("viz-arrow-loop", "#0D9488");

    const fillFor = (type: string) =>
      solidFill ? colorOf(colors, type).start : `url(#viz-grad-${type})`;

    if (isPerceptron(layers)) {
      const layerGap = 150;
      const width = layers.length * layerGap + 150;
      const height = 600;
      svg.attr("width", width).attr("height", height);
      const neuronRadius = 15;
      const neuronGap = 50;
      const yOffset = height / 2.1;
      const counters: Record<string, number> = { dense: 1 };

      Array.from(new Set(layers.map((l) => l.type))).forEach((type) => {
        const c = colorOf(colors, type);
        const lg = defs
          .append("linearGradient")
          .attr("id", `viz-pgrad-${type}`)
          .attr("x1", "0")
          .attr("y1", "0")
          .attr("x2", "0")
          .attr("y2", "1");
        lg.append("stop").attr("offset", "0%").attr("stop-color", c.start);
        lg.append("stop").attr("offset", "100%").attr("stop-color", c.end);
      });
      const pFill = (type: string) =>
        solidFill ? colorOf(colors, type).start : `url(#viz-pgrad-${type})`;

      layers.forEach((layer, i) => {
        const x = i * layerGap + 150;
        const yCenter =
          yOffset - ((Math.min(layer.neuronCount, 10) - 1) * neuronGap) / 2;
        const fill = pFill(layer.type);

        const drawNeuron = (y: number, idx: number) => {
          svg
            .append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", neuronRadius)
            .attr("fill", fill)
            .attr("stroke", lineColor)
            .style("cursor", "help")
            .on("mouseenter", () => setHoveredLayer(layer))
            .on("mouseleave", () => setHoveredLayer(null));
          if (layer.type === "output") {
            svg
              .append("line")
              .attr("x1", x + neuronRadius + 10)
              .attr("y1", y)
              .attr("x2", x + neuronRadius + 60)
              .attr("y2", y)
              .attr("stroke", lineColor)
              .attr("marker-end", "url(#viz-arrow)");
            svg
              .append("text")
              .attr("x", x + neuronRadius + 78)
              .attr("y", y + 5)
              .attr("text-anchor", "middle")
              .attr("fill", "#475569")
              .style("font-size", "14px")
              .text(`y${idx + 1}`);
          }
          if (layer.type === "input") {
            svg
              .append("line")
              .attr("x1", x - neuronRadius - 60)
              .attr("y1", y)
              .attr("x2", x - neuronRadius - 10)
              .attr("y2", y)
              .attr("stroke", lineColor)
              .attr("marker-end", "url(#viz-arrow)");
            svg
              .append("text")
              .attr("x", x - neuronRadius - 78)
              .attr("y", y + 5)
              .attr("text-anchor", "middle")
              .attr("fill", "#475569")
              .style("font-size", "14px")
              .text(`x${idx + 1}`);
          }
        };

        let lastNeuronY =
          yCenter + (Math.min(layer.neuronCount, 10) - 1) * neuronGap;
        if (layer.neuronCount > 10) {
          for (let j = 0; j < 5; j++) drawNeuron(yCenter + j * neuronGap, j);
          [-10, 0, 10].forEach((dy) =>
            svg
              .append("text")
              .attr("x", x)
              .attr("y", yCenter + 5 * neuronGap + dy)
              .attr("dy", ".35em")
              .attr("text-anchor", "middle")
              .attr("fill", lineColor)
              .style("font-size", "10px")
              .text("•")
          );
          for (let j = layer.neuronCount - 5; j < layer.neuronCount; j++) {
            const y = yCenter + (j - (layer.neuronCount - 5) + 6) * neuronGap;
            drawNeuron(y, j);
            lastNeuronY = y;
          }
        } else {
          for (let j = 0; j < layer.neuronCount; j++) {
            drawNeuron(yCenter + j * neuronGap, j);
            lastNeuronY = yCenter + j * neuronGap;
          }
        }

        const label =
          layer.type === "dense"
            ? `DENSE ${counters.dense++}`
            : layer.type.toUpperCase();
        svg
          .append("text")
          .attr("x", x)
          .attr("y", lastNeuronY + neuronRadius + 20)
          .attr("text-anchor", "middle")
          .attr("fill", "#000")
          .style("font-size", "12px")
          .style("cursor", "help")
          .text(label)
          .append("title")
          .text(layerHint(layer.type));

        if (i < layers.length - 1) {
          const next = layers[i + 1];
          const nextX = (i + 1) * layerGap + 150;
          const nextYC =
            yOffset - ((Math.min(next.neuronCount, 10) - 1) * neuronGap) / 2;
          for (let j = 0; j < Math.min(layer.neuronCount, 11); j++) {
            const y = yCenter + j * neuronGap;
            for (let k = 0; k < Math.min(next.neuronCount, 11); k++) {
              svg
                .append("line")
                .attr("x1", x + neuronRadius)
                .attr("y1", y)
                .attr("x2", nextX - neuronRadius)
                .attr("y2", nextYC + k * neuronGap)
                .attr("stroke", lineColor)
                .attr("stroke-width", 0.7);
            }
          }
        }
      });
      return;
    }

    const baseW = 132;
    const baseH = 62;
    const gap = 46;
    const padL = 56;
    const padR = 96;
    const padY = 34;
    const isRec = (t: string) => t === "lstm" || t === "gru" || t === "rnn";
    const widthOf = (l: Layer) =>
      l.type === "embedding" || l.type === "attention" ? 172 : baseW;

    const xs: number[] = [];
    let cursor = padL;
    layers.forEach((l) => {
      xs.push(cursor);
      cursor += widthOf(l) + gap;
    });
    const totalW = cursor - gap + padR;
    const height = baseH + padY * 2 + 28;
    const midY = height / 2 + 8;
    svg.attr("width", Math.max(totalW, 460)).attr("height", height);

    svg
      .append("line")
      .attr("x1", xs[0] - 42)
      .attr("y1", midY)
      .attr("x2", xs[0])
      .attr("y2", midY)
      .attr("stroke", lineColor)
      .attr("stroke-width", 2)
      .attr("marker-end", "url(#viz-arrow)");
    svg
      .append("text")
      .attr("x", xs[0] - 42)
      .attr("y", midY - 9)
      .attr("fill", "#64748b")
      .style("font-size", "11px")
      .text("вход");

    layers.forEach((l, i) => {
      if (i >= layers.length - 1) return;
      svg
        .append("line")
        .attr("x1", xs[i] + widthOf(l))
        .attr("y1", midY)
        .attr("x2", xs[i + 1])
        .attr("y2", midY)
        .attr("stroke", lineColor)
        .attr("stroke-width", 2)
        .attr("marker-end", "url(#viz-arrow)");
    });

    const li = layers.length - 1;
    const rx = xs[li] + widthOf(layers[li]);
    svg
      .append("line")
      .attr("x1", rx)
      .attr("y1", midY)
      .attr("x2", rx + 44)
      .attr("y2", midY)
      .attr("stroke", lineColor)
      .attr("stroke-width", 2)
      .attr("marker-end", "url(#viz-arrow)");
    svg
      .append("text")
      .attr("x", rx + 50)
      .attr("y", midY + 4)
      .attr("fill", "#475569")
      .style("font-size", "12px")
      .style("font-weight", "600")
      .text("ŷ");

    layers.forEach((layer, i) => {
      const x = xs[i];
      const w = widthOf(layer);
      const c = colorOf(colors, layer.type);
      const g = svg
        .append("g")
        .style("cursor", "help")
        .on("mouseenter", () => setHoveredLayer(layer))
        .on("mouseleave", () => setHoveredLayer(null));

      g.append("rect")
        .attr("x", x)
        .attr("y", midY - baseH / 2)
        .attr("width", w)
        .attr("height", baseH)
        .attr("rx", 10)
        .attr("fill", fillFor(layer.type))
        .attr("stroke", c.end)
        .attr("stroke-width", 1.5)
        .attr("filter", "url(#viz-shadow)");
      g.append("title").text(layerHint(layer.type));

      g.append("text")
        .attr("x", x + w / 2)
        .attr("y", midY - 4)
        .attr("text-anchor", "middle")
        .style("font-size", "13px")
        .style("font-weight", "600")
        .attr("fill", c.end)
        .text(LABELS[layer.type] ?? layer.type);
      g.append("text")
        .attr("x", x + w / 2)
        .attr("y", midY + 14)
        .attr("text-anchor", "middle")
        .style("font-size", "11px")
        .attr("fill", "#475569")
        .text(detailOf(layer));

      if (isRec(layer.type)) {
        const cx = x + w / 2;
        const topY = midY - baseH / 2;
        g.append("path")
          .attr(
            "d",
            `M ${cx + 20} ${topY} C ${cx + 46} ${topY - 40}, ${
              cx - 46
            } ${topY - 40}, ${cx - 20} ${topY}`
          )
          .attr("fill", "none")
          .attr("stroke", "#0D9488")
          .attr("stroke-width", 1.8)
          .attr("marker-end", "url(#viz-arrow-loop)");
        g.append("text")
          .attr("x", cx)
          .attr("y", topY - 26)
          .attr("text-anchor", "middle")
          .style("font-size", "12px")
          .style("font-style", "italic")
          .style("font-weight", "600")
          .attr("fill", "#0D9488")
          .text("hₜ");
      }
    });
  }, [network, gan, colors, ganColors, lineColor, solidFill]);

  useEffect(() => {
    const sig = gan
      ? `gan:${gan.generator.length}/${gan.discriminator.length}`
      : network.layers.map((l) => l.type).join(",");
    enhance(sig);
  }, [network, gan, colors, ganColors, lineColor, solidFill, enhance]);

  const presentTypes = Array.from(new Set(network.layers.map((l) => l.type)));

  return (
    <div className={styles.container}>
      <div className={styles.viz}>
        <svg
          ref={svgRef}
          role="img"
          aria-label="Схема архитектуры нейронной сети: слои и связи между ними"
        ></svg>
      </div>
      <p className={styles.editHint}>
        ✎ Нажмите на любую подпись схемы, чтобы изменить её вручную
      </p>
      {overlay}

      <div className={styles.info}>
        {gan ? (
          <span className={styles.infoHint}>
            Генеративно-состязательная сеть: генератор создаёт образцы из шума,
            дискриминатор отличает их от реальных данных, и они обучаются в
            противоборстве.
          </span>
        ) : hoveredInfo ? (
          <>
            <span>
              <b>{hoveredInfo.title}</b>
            </span>
            <span className={styles.infoHint}>{hoveredInfo.text}</span>
          </>
        ) : hoveredLayer ? (
          <>
            <span>
              <b>Слой:</b> {LABELS[hoveredLayer.type] ?? hoveredLayer.type}
            </span>
            <span>{detailOf(hoveredLayer)}</span>
            <span className={styles.infoHint}>{layerHint(hoveredLayer.type)}</span>
          </>
        ) : (
          <span className={styles.infoHint}>
            Наведите курсор на слой схемы, чтобы увидеть его параметры
          </span>
        )}
      </div>

      <div className={styles.colors}>
        {gan
          ? (
              [
                ["gen", "Генератор"],
                ["disc", "Дискриминатор"],
                ["data", "Данные"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className={styles.colorsGroup}>
                <span>{label}</span>
                <div className={styles.colorsSwatches}>
                  <input
                    type="color"
                    title="Заливка"
                    value={ganColors[key].start}
                    onChange={(e) =>
                      setGanColors((p) => ({
                        ...p,
                        [key]: { ...p[key], start: e.target.value },
                      }))
                    }
                  />
                  <input
                    type="color"
                    title="Контур и подпись"
                    value={ganColors[key].end}
                    onChange={(e) =>
                      setGanColors((p) => ({
                        ...p,
                        [key]: { ...p[key], end: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>
            ))
          : presentTypes.map((type) => (
              <div key={type} className={styles.colorsGroup}>
                <span>{LABELS[type] ?? type}</span>
                <div className={styles.colorsSwatches}>
                  <input
                    type="color"
                    title="Заливка (начало градиента)"
                    value={colorOf(colors, type).start}
                    onChange={(e) =>
                      setColors((p) => ({
                        ...p,
                        [type]: { ...colorOf(p, type), start: e.target.value },
                      }))
                    }
                  />
                  <input
                    type="color"
                    title="Конец градиента / контур"
                    value={colorOf(colors, type).end}
                    onChange={(e) =>
                      setColors((p) => ({
                        ...p,
                        [type]: { ...colorOf(p, type), end: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>
            ))}
        <div className={styles.colorsGroup}>
          <span>Линии</span>
          <input
            type="color"
            value={lineColor}
            onChange={(e) => setLineColor(e.target.value)}
          />
        </div>
        <label className={styles.solidToggle}>
          <input
            type="checkbox"
            checked={solidFill}
            onChange={(e) => setSolidFill(e.target.checked)}
          />
          Без градиента
        </label>
        <Button
          type="button"
          color="outline-blue"
          className={styles.button}
          onClick={handleSave}
        >
          Сохранить изображение
        </Button>
      </div>
    </div>
  );
};

export default NetworkVisualization;
