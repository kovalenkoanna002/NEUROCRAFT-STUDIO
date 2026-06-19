import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import styles from "./CreateArchitecture.module.scss";

import { useMutation } from "@tanstack/react-query";
import {
  Layer,
  NeuralNetworkLayers,
  submitArchitecture,
} from "../../api/Network";
import { queryClient } from "../../api/queryClient";
import { Code } from "../../api/Code";
import Button from "../../components/Button/Button";
import { GlossaryTerm } from "../../components/GlossaryTerm/GlossaryTerm";
import { LAYER_TERM } from "../../data/glossary";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { saveProject } from "../../auth/projects";
import { useEditableLabels } from "../../hooks/useEditableLabels";
import { usePersistedState } from "../../hooks/usePersistedState";
import {
  Framework,
  FRAMEWORK_LABELS,
  countParameters,
} from "../../api/mock/codegen";

type LayerColor = { start: string; end: string };
type NeuronType = "input" | "dense" | "output";

interface NeuralNetworkArhitectureProps {
  onGenerateCode: (code: string) => void;
  initialLayers?: Layer[];
  initialLabels?: Record<string, string>;
}

const PTYPE_LABEL: Record<"dense" | "dropout" | "batchnorm", string> = {
  dense: "Dense",
  dropout: "Dropout",
  batchnorm: "BatchNorm",
};

const ACTIVATIONS = ["relu", "sigmoid", "tanh", "softmax", "elu", "selu"];

const DEFAULT_PERCEPTRON_LAYERS: Layer[] = [
  { type: "input", neuronCount: 2 },
  { type: "dense", neuronCount: 4, activationFunction: "relu" },
  { type: "dense", neuronCount: 2, activationFunction: "relu" },
  { type: "output", neuronCount: 2, activationFunction: "softmax" },
];

const validatePerceptron = (layers: Layer[]): string[] => {
  const w: string[] = [];
  if (!layers.length) return w;
  const hasHidden = layers.some((l) => l.type === "dense");
  if (!hasHidden) {
    w.push(
      "Нет скрытых слоёв: сеть из входа и выхода эквивалентна линейной модели. Добавьте хотя бы один слой Dense."
    );
  }
  const out = layers[layers.length - 1];
  if (
    out?.type === "output" &&
    !["softmax", "sigmoid"].includes(out.activationFunction ?? "")
  ) {
    w.push(
      "Для классификации на выходе обычно используют softmax (несколько классов) или sigmoid (два класса)."
    );
  }
  return w;
};

const CreateArchitecture: React.FC<NeuralNetworkArhitectureProps> = ({
  onGenerateCode,
  initialLayers,
  initialLabels,
}) => {

  const dk = (s: string) =>
    initialLayers ? null : `neurocraft.draft.perceptron.${s}`;
  const [network, setNetwork] = usePersistedState<NeuralNetworkLayers>(
    dk("network"),
    { layers: initialLayers ?? DEFAULT_PERCEPTRON_LAYERS }
  );
  const navigate = useNavigate();
  const { user } = useAuth();
  const [savedMsg, setSavedMsg] = useState("");

  const handleSaveToAccount = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    const name = window.prompt("Название архитектуры:", "Мой перцептрон");
    if (!name) return;
    saveProject(user.id, {
      name,
      kind: "perceptron",
      layers: network.layers,
      labels: getLabels(),
    });
    setSavedMsg("Сохранено в кабинет ✓");
    setTimeout(() => setSavedMsg(""), 2500);
  };

  const goPlayground = () => {
    const hidden = network.layers
      .filter((l) => l.type === "dense")
      .map((l) => l.neuronCount);
    const firstAct = network.layers.find((l) => l.type === "dense")
      ?.activationFunction;

    const ACT_MAP: Record<string, string> = {
      relu: "relu",
      tanh: "tanh",
      sigmoid: "sigmoid",
      elu: "relu",
      selu: "relu",
      softmax: "relu",
    };
    const act = ACT_MAP[firstAct ?? ""] ?? "tanh";

    const outLayer = network.layers.find((l) => l.type === "output");
    const classes = outLayer?.neuronCount ?? 2;
    const params = new URLSearchParams();
    if (hidden.length) params.set("hidden", hidden.join(","));
    params.set("act", act);
    if (classes >= 2) params.set("classes", String(classes));
    navigate(`/playground?${params.toString()}`);
  };
  const svgRef = useRef<SVGSVGElement>(null);
  const { enhance, overlay, getLabels } = useEditableLabels(
    svgRef,
    initialLabels,
    initialLayers ? undefined : "neurocraft.draft.perceptron.labels"
  );
  const [colors, setColors] = usePersistedState<Record<NeuronType, LayerColor>>(
    dk("colors"),
    {
      input: { start: "#1E3A8A", end: "#1D4ED8" },
      dense: { start: "#1D4ED8", end: "#60A5FA" },
      output: { start: "#60A5FA", end: "#BFDBFE" },
    }
  );

  const [solidFill, setSolidFill] = usePersistedState(dk("solidFill"), false);
  const [lineColor, setLineColor] = usePersistedState(dk("lineColor"), "#000000");
  const [hoveredLayer, setHoveredLayer] = useState<Layer | null>(null);

  const [newType, setNewType] = useState<"dense" | "dropout" | "batchnorm">(
    "dense"
  );
  const [framework, setFramework] = usePersistedState<Framework>(
    dk("framework"),
    "keras"
  );
  const handleMouseEnter = (layer: Layer) => {
    setHoveredLayer(layer);
  };

  const handleMouseLeave = () => {
    setHoveredLayer(null);
  };
  const handleSave = () => {
    const svgElement = svgRef.current;
    if (!svgElement) return;

    const svgString = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const img = new Image();
    const scaleFactor = 4;
    const svgWidth = svgElement.clientWidth;
    const svgHeight = svgElement.clientHeight;

    canvas.width = svgWidth * scaleFactor;
    canvas.height = svgHeight * scaleFactor;
    context?.scale(scaleFactor, scaleFactor);

    img.onload = () => {
      context?.drawImage(img, 0, 0);
      const pngDataUrl = canvas.toDataURL("image/png");

      const link = document.createElement("a");
      link.href = pngDataUrl;
      link.download = "conv_network_visualization.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    img.src =
      "data:image/svg+xml;base64," +
      btoa(unescape(encodeURIComponent(svgString)));
  };

  const architectureMutation = useMutation(
    {
      mutationFn: (vars: {
        network: NeuralNetworkLayers;
        framework: Framework;
      }) =>
        submitArchitecture(vars.network, vars.framework)
          .then((code: Code) => {
            onGenerateCode(code.code);
          })
          .catch((error) => {
            console.error("Error fetching generated code:", error);
          }),
      onError: (error) => {

        console.error("Error submitting code:", error);
      },
    },
    queryClient
  );
  const handleGenerateCode = () => {
    architectureMutation.mutate({
      network: { layers: network.layers },
      framework,
    });
  };

  const totalParams = countParameters(network);

  const update = (index: number, patch: Partial<Layer>) => {
    setNetwork((prev) => ({
      layers: prev.layers.map((l, i) => (i === index ? { ...l, ...patch } : l)),
    }));
  };

  const makePLayer = (type: "dense" | "dropout" | "batchnorm"): Layer => {
    if (type === "dropout") return { type: "dropout", neuronCount: 0, rate: 0.5 };
    if (type === "batchnorm") return { type: "batchnorm", neuronCount: 0 };
    return { type: "dense", neuronCount: 4, activationFunction: "relu" };
  };

  const insertAfter = (index: number) => {
    setNetwork((prev) => {
      const next = [...prev.layers];
      next.splice(index + 1, 0, makePLayer(newType));
      return { layers: next };
    });
  };

  const addAtEnd = () => {
    setNetwork((prev) => {
      const outIdx = prev.layers.findIndex((l) => l.type === "output");
      const at = outIdx === -1 ? prev.layers.length : outIdx;
      const next = [...prev.layers];
      next.splice(at, 0, makePLayer(newType));
      return { layers: next };
    });
  };

  const removeHiddenLayer = (index: number) => {

    setNetwork((prev) => ({
      layers: prev.layers.filter((_, i) => i !== index),
    }));
  };

  const fixedPos = (t: Layer["type"]) => t === "input" || t === "output";
  const canMove = (index: number, dir: -1 | 1) => {
    const j = index + dir;
    if (j < 0 || j >= network.layers.length) return false;
    return (
      !fixedPos(network.layers[index].type) &&
      !fixedPos(network.layers[j].type)
    );
  };
  const move = (index: number, dir: -1 | 1) => {
    if (!canMove(index, dir)) return;
    setNetwork((prev) => {
      const next = [...prev.layers];
      [next[index], next[index + dir]] = [next[index + dir], next[index]];
      return { layers: next };
    });
  };

  const reset = () => setNetwork({ layers: DEFAULT_PERCEPTRON_LAYERS });

  const warnings = validatePerceptron(network.layers);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    const layerGap = 150;
    const width = network.layers.length * layerGap + 150;
    const height = 500;
    svg.attr("width", width).attr("height", height);

    svg
      .append("defs")
      .append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 0 10 10")
      .attr("refX", "5")
      .attr("refY", "5")
      .attr("markerWidth", "6")
      .attr("markerHeight", "6")
      .attr("orient", "auto-start-reverse")
      .append("path")
      .attr("d", "M 0 0 L 10 5 L 0 10 z")
      .attr("fill", "#000");

    const neuronRadius = 15;

    const neuronGap = 50;
    const yOffset = height / 2.1;
    const layerCounters: { [key: string]: number } = {
      dense: 1,
    };

    Object.entries(colors).forEach(([type, c]) => {
      const gradient = svg
        .append("defs")
        .append("linearGradient")
        .attr("id", `${type}-gradient`)
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "100%");

      gradient.append("stop").attr("offset", "0%").attr("stop-color", c.start);
      gradient.append("stop").attr("offset", "100%").attr("stop-color", c.end);
    });

    const isReg = (t: string) => t === "dropout" || t === "batchnorm";
    const drawRegBand = (x: number, layer: Layer) => {
      const isDrop = layer.type === "dropout";
      const stroke = isDrop ? "#ef4444" : "#10b981";
      const bandTop = yOffset - 150;
      const bandH = 300;
      svg
        .append("rect")
        .attr("x", x - 20)
        .attr("y", bandTop)
        .attr("width", 40)
        .attr("height", bandH)
        .attr("rx", 12)
        .attr("fill", isDrop ? "rgba(239,68,68,0.07)" : "rgba(16,185,129,0.07)")
        .attr("stroke", stroke)
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "6 4")
        .style("cursor", "pointer")
        .on("mouseenter", () => handleMouseEnter(layer))
        .on("mouseleave", handleMouseLeave);
      svg
        .append("text")
        .attr("x", x)
        .attr("y", yOffset)
        .attr("text-anchor", "middle")
        .attr("transform", `rotate(-90 ${x} ${yOffset})`)
        .attr("fill", stroke)
        .style("font-size", "13px")
        .style("font-weight", "600")
        .text(isDrop ? `Dropout ${layer.rate ?? 0.5}` : "BatchNorm");
      svg
        .append("text")
        .attr("x", x)
        .attr("y", bandTop + bandH + 18)
        .attr("text-anchor", "middle")
        .attr("fill", "#000")
        .style("font-size", "12px")
        .text(layer.type.toUpperCase());
    };

    network.layers.forEach((layer, i) => {
      const x = i * layerGap + 150;
      if (isReg(layer.type)) {
        drawRegBand(x, layer);
        return;
      }
      const yCenter =
        yOffset - ((Math.min(layer.neuronCount, 8) - 1) * neuronGap) / 2;
      const fillColor = solidFill
        ? colors[layer.type as NeuronType].start
        : `url(#${layer.type}-gradient)`;

      {
        const drawNeuron = (y: number, neuronIndex: number) => {
          svg
            .append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", neuronRadius)
            .attr("fill", fillColor)
            .attr("stroke", lineColor)
            .on("mouseenter", () => handleMouseEnter(layer))
            .on("mouseleave", handleMouseLeave);
          if (layer.type === "output") {
            svg
              .append("line")
              .attr("x1", x + neuronRadius + 10)
              .attr("y1", y)
              .attr("x2", x + neuronRadius + 70)
              .attr("y2", y)
              .attr("stroke", "#000")
              .attr("stroke-width", "1")
              .attr("marker-end", "url(#arrow)");
            svg
              .append("text")
              .attr("x", x + neuronRadius + 90)
              .attr("y", y + 5)
              .attr("text-anchor", "middle")
              .attr("fill", "#000")
              .style("font-size", "16px")
              .text(`y${neuronIndex + 1}`);
          }
          if (layer.type === "input") {
            svg
              .append("line")
              .attr("x1", x - neuronRadius - 70)
              .attr("y1", y)
              .attr("x2", x - neuronRadius - 10)
              .attr("y2", y)
              .attr("stroke", "#000")
              .attr("stroke-width", "1")
              .attr("marker-end", "url(#arrow)");
            svg
              .append("text")
              .attr("x", x - neuronRadius - 90)
              .attr("y", y + 5)
              .attr("text-anchor", "middle")
              .attr("fill", "#000")
              .style("font-size", "16px")
              .text(`x${neuronIndex + 1}`);
          }
        };
        let lastNeuronY =
          yCenter + (Math.min(layer.neuronCount, 8) - 1) * neuronGap;
        if (layer.neuronCount > 8) {
          for (let j = 0; j < 4; j++) {
            const y = yCenter + j * neuronGap;
            drawNeuron(y, j);
          }

          svg
            .append("text")
            .attr("x", x)
            .attr("y", yCenter + 4 * neuronGap - 10)
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .attr("fill", lineColor)
            .style("font-size", "10px")
            .text("•");

          svg
            .append("text")
            .attr("x", x)
            .attr("y", yCenter + 4 * neuronGap)
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .attr("fill", lineColor)
            .style("font-size", "10px")
            .text("•");

          svg
            .append("text")
            .attr("x", x)
            .attr("y", yCenter + 4 * neuronGap + 10)
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .attr("fill", lineColor)
            .style("font-size", "10px")
            .text("•");
          for (let j = layer.neuronCount - 4; j < layer.neuronCount; j++) {
            const y = yCenter + (j - (layer.neuronCount - 4) + 5) * neuronGap;
            drawNeuron(y, j);
            lastNeuronY = y;
          }
        } else {
          for (let j = 0; j < layer.neuronCount; j++) {
            const y = yCenter + j * neuronGap;
            drawNeuron(y, j);
            lastNeuronY = y;
          }
        }

        if (layer.type === "dense") {
          svg
            .append("text")
            .attr("x", x)
            .attr("y", lastNeuronY + neuronRadius + 20)
            .attr("text-anchor", "middle")
            .attr("fill", "#000")
            .style("font-size", "12px")
            .text(`${layer.type.toUpperCase()} ${layerCounters[layer.type]}`);
          layerCounters[layer.type] += 1;
        } else {
          svg
            .append("text")
            .attr("x", x)
            .attr("y", lastNeuronY + neuronRadius + 20)
            .attr("text-anchor", "middle")
            .attr("fill", "#000")
            .style("font-size", "12px")
            .text(layer.type.toUpperCase());
        }
      }

      let ni = i + 1;
      while (ni < network.layers.length && isReg(network.layers[ni].type)) ni++;
      if (ni < network.layers.length) {
        const nextLayer = network.layers[ni];
        const nextX = ni * layerGap + 150;
        const nextYCenter =
          yOffset - ((Math.min(nextLayer.neuronCount, 8) - 1) * neuronGap) / 2;

        for (let j = 0; j < Math.min(layer.neuronCount, 9); j++) {
          const y = yCenter + j * neuronGap;
          for (let k = 0; k < Math.min(nextLayer.neuronCount, 9); k++) {
            const nextY = nextYCenter + k * neuronGap;
            svg
              .append("line")
              .attr("x1", x + neuronRadius)
              .attr("y1", y)
              .attr("x2", nextX - neuronRadius)
              .attr("y2", nextY)
              .attr("stroke", lineColor)
              .attr("stroke-width", 0.7);
          }
        }
      }
    });
  }, [network, colors, solidFill, lineColor]);

  useEffect(() => {
    enhance(network.layers.map((l) => l.type).join(","));
  }, [network, colors, solidFill, lineColor, enhance]);

  return (
    <div className="container">
      <div className={styles["create-architecture__container"]}>
        <div className={styles["create-architecture__controls"]}>
          {network.layers.map((layer, index) => {
            const isReg =
              layer.type === "dropout" || layer.type === "batchnorm";
            return (
              <div
                key={index}
                className={styles["create-architecture__layer-control"]}
              >
                <span
                  className={styles["create-architecture__layer-control-name"]}
                >
                  {layer.type === "dense" ? (
                    <>
                      <GlossaryTerm id="dense">Dense</GlossaryTerm>{" "}
                      {
                        network.layers.filter(
                          (l, idx) => l.type === "dense" && idx <= index
                        ).length
                      }
                    </>
                  ) : (
                    <GlossaryTerm
                      id={isReg ? layer.type : LAYER_TERM[layer.type] ?? "dense"}
                    >
                      {layer.type === "dropout"
                        ? "Dropout"
                        : layer.type === "batchnorm"
                        ? "BatchNorm"
                        : layer.type.charAt(0).toUpperCase() +
                          layer.type.slice(1)}
                    </GlossaryTerm>
                  )}
                </span>

                {(layer.type === "input" ||
                  layer.type === "dense" ||
                  layer.type === "output") && (
                  <label
                    className={
                      styles["create-architecture__layer-control-field"]
                    }
                  >
                    {layer.type === "input" ? "входы" : "нейроны"}
                    <input
                      type="number"
                      min="1"
                      className={
                        styles["create-architecture__layer-control-input"]
                      }
                      value={layer.neuronCount}
                      onChange={(e) =>
                        update(index, {
                          neuronCount: parseInt(e.target.value) || 1,
                        })
                      }
                    />
                  </label>
                )}

                {layer.type === "dropout" && (
                  <label
                    className={
                      styles["create-architecture__layer-control-field"]
                    }
                  >
                    доля
                    <input
                      type="number"
                      min="0.05"
                      max="0.9"
                      step="0.05"
                      className={
                        styles["create-architecture__layer-control-input"]
                      }
                      value={layer.rate ?? 0.5}
                      onChange={(e) =>
                        update(index, {
                          rate: parseFloat(e.target.value) || 0.5,
                        })
                      }
                    />
                  </label>
                )}

                {(layer.type === "dense" || layer.type === "output") && (
                  <select
                    className={
                      styles["create-architecture__layer-control-select"]
                    }
                    value={layer.activationFunction ?? "relu"}
                    onChange={(e) =>
                      update(index, { activationFunction: e.target.value })
                    }
                  >
                    {ACTIVATIONS.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                )}

                {!fixedPos(layer.type) && (
                  <>
                    <button
                      className={
                        styles["create-architecture__layer-control-move"]
                      }
                      title="Переместить левее"
                      disabled={!canMove(index, -1)}
                      onClick={() => move(index, -1)}
                    >
                      ←
                    </button>
                    <button
                      className={
                        styles["create-architecture__layer-control-move"]
                      }
                      title="Переместить правее"
                      disabled={!canMove(index, 1)}
                      onClick={() => move(index, 1)}
                    >
                      →
                    </button>
                  </>
                )}
                {layer.type !== "output" && (
                  <button
                    className={
                      styles["create-architecture__layer-control-insert"]
                    }
                    title={`Вставить «${PTYPE_LABEL[newType]}» после этого слоя`}
                    onClick={() => insertAfter(index)}
                  >
                    +
                  </button>
                )}
                {(layer.type === "dense" || isReg) && (
                  <button
                    className={
                      styles["create-architecture__layer-control-remove"]
                    }
                    title="Удалить слой"
                    onClick={() => removeHiddenLayer(index)}
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })}
        </div>
        <div className={styles["create-architecture__add-group"]}>
          <span>Добавить слой:</span>
            <select
              className={styles["create-architecture__add-select"]}
              value={newType}
              onChange={(e) =>
                setNewType(
                  e.target.value as "dense" | "dropout" | "batchnorm"
                )
              }
            >
              <option value="dense">Dense (полносвязный)</option>
              <option value="dropout">Dropout (регуляризация)</option>
              <option value="batchnorm">BatchNorm (нормализация)</option>
            </select>
            <Button type="button" color="outline-blue" onClick={addAtEnd}>
              Добавить в конец
            </Button>
        </div>
        {warnings.length > 0 && (
          <div className={styles["create-architecture__warn"]}>
            <span className={styles["create-architecture__warn-title"]}>
              ⚠ Рекомендации по архитектуре
            </span>
            <ul className={styles["create-architecture__warn-list"]}>
              {warnings.map((wn, i) => (
                <li key={i}>{wn}</li>
              ))}
            </ul>
          </div>
        )}
        <div className={styles["create-architecture__colors"]}>
          {(["input", "dense", "output"] as NeuronType[]).map((type) => (
            <div
              key={type}
              className={styles["create-architecture__colors-group"]}
            >
              <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
              <div className={styles["create-architecture__colors-swatches"]}>
                <input
                  type="color"
                  title="Начало градиента / сплошная заливка"
                  value={colors[type].start}
                  onChange={(e) =>
                    setColors((p) => ({
                      ...p,
                      [type]: { ...p[type], start: e.target.value },
                    }))
                  }
                />
                <input
                  type="color"
                  title="Конец градиента"
                  disabled={solidFill}
                  value={colors[type].end}
                  onChange={(e) =>
                    setColors((p) => ({
                      ...p,
                      [type]: { ...p[type], end: e.target.value },
                    }))
                  }
                />
              </div>
            </div>
          ))}
          <div className={styles["create-architecture__colors-group"]}>
            <span>Линии</span>
            <input
              type="color"
              value={lineColor}
              onChange={(e) => setLineColor(e.target.value)}
            />
          </div>
          <label className={styles["create-architecture__solid-toggle"]}>
            <input
              type="checkbox"
              checked={solidFill}
              onChange={(e) => setSolidFill(e.target.checked)}
            />
            Без градиента
          </label>
        </div>
        <div className={styles["create-architecture__viz"]}>
          <svg
            ref={svgRef}
            role="img"
            aria-label="Схема перцептрона: слои и связи между ними"
          ></svg>
        </div>
        <p className={styles["create-architecture__edit-hint"]}>
          ✎ Нажмите на любую подпись схемы, чтобы изменить или удалить её
        </p>
        {overlay}
        <div className={styles["create-architecture__layer-info"]}>
          {hoveredLayer ? (
            <>
              <span>
                <b>Слой:</b>{" "}
                {hoveredLayer.type === "dropout"
                  ? "Dropout"
                  : hoveredLayer.type === "batchnorm"
                  ? "BatchNorm"
                  : hoveredLayer.type.charAt(0).toUpperCase() +
                    hoveredLayer.type.slice(1)}
              </span>
              {hoveredLayer.type === "dropout" ? (
                <span>Доля отключения: {hoveredLayer.rate ?? 0.5}</span>
              ) : hoveredLayer.type === "batchnorm" ? (
                <span>Нормализация активаций по мини-батчу</span>
              ) : (
                <span>Нейронов: {hoveredLayer.neuronCount}</span>
              )}
              {(hoveredLayer.type === "dense" ||
                hoveredLayer.type === "output") && (
                <span>
                  Активация: {hoveredLayer.activationFunction ?? "—"}
                </span>
              )}
              {hoveredLayer.description && (
                <span>Описание: {hoveredLayer.description}</span>
              )}
            </>
          ) : (
            <span className={styles["create-architecture__layer-hint"]}>
              Наведите курсор на слой схемы, чтобы увидеть его параметры
            </span>
          )}
        </div>
        <div className={styles["create-architecture__footer"]}>
          <label className={styles["create-architecture__field"]}>
            Фреймворк:&nbsp;
            <select
              value={framework}
              onChange={(e) => setFramework(e.target.value as Framework)}
            >
              {Object.entries(FRAMEWORK_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <span className={styles["create-architecture__params"]}>
            Параметров модели: ~{totalParams.toLocaleString("ru-RU")}
          </span>
          <Button type="button" color="outline-blue" onClick={handleSave}>
            Сохранить изображение
          </Button>
          <Button
            type="button"
            color="outline-blue"
            onClick={handleSaveToAccount}
          >
            Сохранить в кабинет
          </Button>
          <Button type="button" color="outline-blue" onClick={goPlayground}>
            Обучить в песочнице
          </Button>
          <Button type="button" color="outline-blue" onClick={reset}>
            Сбросить
          </Button>
          {savedMsg && (
            <span className={styles["create-architecture__params"]}>
              {savedMsg}
            </span>
          )}
          <Button type="button" color="filled" onClick={handleGenerateCode}>
            {architectureMutation.isPending
              ? "Генерация..."
              : "Сгенерировать код"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateArchitecture;
