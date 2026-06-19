import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import styles from "./CnnArchitecture.module.css";
import Button from "../../components/Button/Button";
import { GlossaryTerm } from "../../components/GlossaryTerm/GlossaryTerm";
import { LAYER_TERM } from "../../data/glossary";
import { useAuth } from "../../auth/useAuth";
import { saveProject } from "../../auth/projects";
import { queryClient } from "../../api/queryClient";
import { Code } from "../../api/Code";
import { Layer, NeuralNetworkLayers, submitArchitecture } from "../../api/Network";
import {
  Framework,
  FRAMEWORK_LABELS,
  countParameters,
} from "../../api/mock/codegen";
import { drawCnnDiagram } from "./drawCnnDiagram";
import { useEditableLabels } from "../../hooks/useEditableLabels";
import { usePersistedState } from "../../hooks/usePersistedState";

const ACTIVATIONS = ["relu", "sigmoid", "tanh", "softmax", "elu", "selu"];

type CnnLayerType =
  | "input"
  | "conv"
  | "pool"
  | "flatten"
  | "dense"
  | "output"
  | "dropout"
  | "batchnorm";

type ColorableType =
  | "input"
  | "conv"
  | "pool"
  | "flatten"
  | "dense"
  | "output";

const DEFAULT_LAYERS: Layer[] = [
  { type: "input", neuronCount: 1, description: "channels" },
  { type: "conv", neuronCount: 32, kernelSize: 3, activationFunction: "relu" },
  { type: "pool", neuronCount: 0, poolSize: 2 },
  { type: "conv", neuronCount: 64, kernelSize: 3, activationFunction: "relu" },
  { type: "pool", neuronCount: 0, poolSize: 2 },
  { type: "flatten", neuronCount: 0 },
  { type: "dense", neuronCount: 128, activationFunction: "relu" },
  { type: "output", neuronCount: 10, activationFunction: "softmax" },
];

interface CnnArchitectureProps {
  onGenerateCode: (code: string) => void;
  initialLayers?: Layer[];
  initialLabels?: Record<string, string>;
}

const LABELS: Record<CnnLayerType, string> = {
  input: "Input",
  conv: "Conv2D",
  pool: "MaxPool",
  flatten: "Flatten",
  dense: "Dense",
  output: "Output",
  dropout: "Dropout",
  batchnorm: "BatchNorm",
};

const validateCnn = (layers: Layer[]): string[] => {
  const w: string[] = [];
  if (!layers.length) return w;
  const hasConv = layers.some((l) => l.type === "conv");
  let flattened = false;
  let flattenCount = 0;
  let convAfterFlatten = false;
  let denseBeforeFlatten = false;
  layers.forEach((l) => {
    if (l.type === "flatten") {
      flattened = true;
      flattenCount += 1;
    } else if ((l.type === "conv" || l.type === "pool") && flattened) {
      convAfterFlatten = true;
    } else if (l.type === "dense" && hasConv && !flattened) {
      denseBeforeFlatten = true;
    }
  });
  if (denseBeforeFlatten)
    w.push(
      "Перед полносвязным слоем нужен Flatten — иначе Dense получит многомерный тензор вместо вектора."
    );
  if (convAfterFlatten)
    w.push(
      "Conv/Pooling после Flatten работают с одномерным вектором — обычно их ставят до Flatten."
    );
  if (flattenCount > 1)
    w.push(
      "Слоёв Flatten больше одного — достаточно одного перед полносвязной частью."
    );
  const out = layers[layers.length - 1];
  if (
    out?.type === "output" &&
    !["softmax", "sigmoid"].includes(out.activationFunction ?? "")
  )
    w.push(
      "Для классификации на выходе обычно используют softmax (несколько классов) или sigmoid (два класса)."
    );
  return w;
};

interface ColorPair {
  start: string;
  end: string;
}

const DEFAULT_COLORS: Record<ColorableType, ColorPair> = {
  input: { start: "#6EE7B7", end: "#059669" },
  conv: { start: "#BFDBFE", end: "#2563EB" },
  pool: { start: "#60A5FA", end: "#1E3A8A" },
  flatten: { start: "#93C5FD", end: "#1D4ED8" },
  dense: { start: "#DBEAFE", end: "#3B82F6" },
  output: { start: "#DDD6FE", end: "#7C3AED" },
};

const CnnArchitecture: React.FC<CnnArchitectureProps> = ({
  onGenerateCode,
  initialLayers,
  initialLabels,
}) => {

  const dk = (s: string) => (initialLayers ? null : `neurocraft.draft.cnn.${s}`);
  const [layers, setLayers] = usePersistedState<Layer[]>(
    dk("layers"),
    initialLayers ?? DEFAULT_LAYERS
  );
  const navigate = useNavigate();
  const { user } = useAuth();
  const [savedMsg, setSavedMsg] = useState("");

  const handleSaveToAccount = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    const name = window.prompt("Название архитектуры:", "Моя CNN");
    if (!name) return;
    saveProject(user.id, { name, kind: "cnn", layers, labels: getLabels() });
    setSavedMsg("Сохранено в кабинет ✓");
    setTimeout(() => setSavedMsg(""), 2500);
  };
  const [framework, setFramework] = usePersistedState<Framework>(
    dk("framework"),
    "keras"
  );
  const [newType, setNewType] = useState<CnnLayerType>("conv");
  const [hoveredLayer, setHoveredLayer] = useState<Layer | null>(null);
  const [colors, setColors] = usePersistedState<Record<ColorableType, ColorPair>>(
    dk("colors"),
    DEFAULT_COLORS
  );
  const [lineColor, setLineColor] = usePersistedState(dk("lineColor"), "#475569");

  const [solidFill, setSolidFill] = usePersistedState(dk("solidFill"), false);
  const svgRef = useRef<SVGSVGElement>(null);
  const { enhance, overlay, getLabels } = useEditableLabels(
    svgRef,
    initialLabels,
    initialLayers ? undefined : "neurocraft.draft.cnn.labels"
  );

  const update = (index: number, patch: Partial<Layer>) => {
    setLayers((prev) =>
      prev.map((l, i) => (i === index ? { ...l, ...patch } : l))
    );
  };

  const remove = (index: number) => {
    setLayers((prev) => prev.filter((_, i) => i !== index));
  };

  const fixedPos = (t: string) => t === "input" || t === "output";
  const canMove = (index: number, dir: -1 | 1) => {
    const j = index + dir;
    if (j < 0 || j >= layers.length) return false;
    return !fixedPos(layers[index].type) && !fixedPos(layers[j].type);
  };
  const move = (index: number, dir: -1 | 1) => {
    if (!canMove(index, dir)) return;
    setLayers((prev) => {
      const a = [...prev];
      [a[index], a[index + dir]] = [a[index + dir], a[index]];
      return a;
    });
  };

  const reset = () => setLayers(DEFAULT_LAYERS);

  const warnings = validateCnn(layers);

  const makeLayer = (type: CnnLayerType): Layer => {
    switch (type) {
      case "conv":
        return {
          type: "conv",
          neuronCount: 64,
          kernelSize: 3,
          activationFunction: "relu",
        };
      case "pool":
        return { type: "pool", neuronCount: 0, poolSize: 2 };
      case "flatten":
        return { type: "flatten", neuronCount: 0 };
      case "dropout":
        return { type: "dropout", neuronCount: 0, rate: 0.5 };
      case "batchnorm":
        return { type: "batchnorm", neuronCount: 0 };
      case "dense":
        return { type: "dense", neuronCount: 64, activationFunction: "relu" };
      default:
        return { type: "conv", neuronCount: 64, kernelSize: 3 };
    }
  };

  const addLayer = () => {
    setLayers((prev) => {
      const outIdx = prev.findIndex((l) => l.type === "output");
      const at = outIdx === -1 ? prev.length : outIdx;
      const next = [...prev];
      next.splice(at, 0, makeLayer(newType));
      return next;
    });
  };

  const addLayerAt = (index: number) => {
    setLayers((prev) => {
      const next = [...prev];
      next.splice(index + 1, 0, makeLayer(newType));
      return next;
    });
  };

  const setColor = (type: ColorableType, patch: Partial<ColorPair>) => {
    setColors((prev) => ({ ...prev, [type]: { ...prev[type], ...patch } }));
  };

  const handleSave = () => {
    const svgElement = svgRef.current;
    if (!svgElement) return;

    const svgString = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const img = new Image();
    const scaleFactor = 3;
    const svgWidth = svgElement.clientWidth || svgElement.viewBox.baseVal.width;
    const svgHeight =
      svgElement.clientHeight || svgElement.viewBox.baseVal.height;

    canvas.width = svgWidth * scaleFactor;
    canvas.height = svgHeight * scaleFactor;
    context?.scale(scaleFactor, scaleFactor);

    img.onload = () => {
      if (context) {
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, svgWidth, svgHeight);
        context.drawImage(img, 0, 0);
      }
      const pngDataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = pngDataUrl;
      link.download = "cnn_network_visualization.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    img.src =
      "data:image/svg+xml;base64," +
      btoa(unescape(encodeURIComponent(svgString)));
  };

  const mutation = useMutation(
    {
      mutationFn: (vars: { network: NeuralNetworkLayers; framework: Framework }) =>
        submitArchitecture(vars.network, vars.framework).then((code: Code) =>
          onGenerateCode(code.code)
        ),
      onError: (e) => console.error("CNN code generation failed:", e),
    },
    queryClient
  );

  const totalParams = useMemo(() => countParameters({ layers }), [layers]);

  useEffect(() => {
    drawCnnDiagram(svgRef.current, layers, {
      colors,
      lineColor,
      solidFill,
      onHover: setHoveredLayer,
    });
  }, [layers, colors, lineColor, solidFill]);

  useEffect(() => {
    enhance(layers.map((l) => l.type).join(","));
  }, [layers, colors, lineColor, solidFill, enhance]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.controls}>
        {layers.map((layer, index) => (
          <div key={index} className={styles.layer}>
            <span className={styles.layer__name}>
              <GlossaryTerm id={LAYER_TERM[layer.type]}>
                {LABELS[layer.type as CnnLayerType]}
              </GlossaryTerm>
            </span>

            {layer.type === "input" && (
              <label className={styles.layer__field}>
                каналы
                <input
                  type="number"
                  min={1}
                  className={styles.layer__input}
                  value={layer.neuronCount}
                  onChange={(e) =>
                    update(index, { neuronCount: parseInt(e.target.value) || 1 })
                  }
                />
              </label>
            )}

            {layer.type === "conv" && (
              <>
                <label className={styles.layer__field}>
                  фильтры
                  <input
                    type="number"
                    min={1}
                    className={styles.layer__input}
                    value={layer.neuronCount}
                    onChange={(e) =>
                      update(index, {
                        neuronCount: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </label>
                <label className={styles.layer__field}>
                  ядро
                  <input
                    type="number"
                    min={1}
                    className={styles.layer__input}
                    value={layer.kernelSize ?? 3}
                    onChange={(e) =>
                      update(index, { kernelSize: parseInt(e.target.value) || 1 })
                    }
                  />
                </label>
                <select
                  className={styles.layer__select}
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
              </>
            )}

            {layer.type === "pool" && (
              <label className={styles.layer__field}>
                окно
                <input
                  type="number"
                  min={2}
                  className={styles.layer__input}
                  value={layer.poolSize ?? 2}
                  onChange={(e) =>
                    update(index, { poolSize: parseInt(e.target.value) || 2 })
                  }
                />
              </label>
            )}

            {layer.type === "dropout" && (
              <label className={styles.layer__field}>
                доля
                <input
                  type="number"
                  min={0.05}
                  max={0.9}
                  step={0.05}
                  className={styles.layer__input}
                  value={layer.rate ?? 0.5}
                  onChange={(e) =>
                    update(index, { rate: parseFloat(e.target.value) || 0.5 })
                  }
                />
              </label>
            )}

            {(layer.type === "dense" || layer.type === "output") && (
              <>
                <label className={styles.layer__field}>
                  нейроны
                  <input
                    type="number"
                    min={1}
                    className={styles.layer__input}
                    value={layer.neuronCount}
                    onChange={(e) =>
                      update(index, {
                        neuronCount: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </label>
                <select
                  className={styles.layer__select}
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
              </>
            )}

            {!fixedPos(layer.type) && (
              <>
                <button
                  className={styles.layer__move}
                  title="Переместить левее"
                  disabled={!canMove(index, -1)}
                  onClick={() => move(index, -1)}
                >
                  ←
                </button>
                <button
                  className={styles.layer__move}
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
                className={styles.layer__insert}
                title={`Вставить «${LABELS[newType]}» после этого слоя`}
                onClick={() => addLayerAt(index)}
              >
                +
              </button>
            )}
            {layer.type !== "input" && layer.type !== "output" && (
              <button
                className={styles.layer__remove}
                title="Удалить слой"
                onClick={() => remove(index)}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      {warnings.length > 0 && (
        <div className={styles.warn}>
          <span className={styles.warn__title}>
            ⚠ Рекомендации по архитектуре
          </span>
          <ul className={styles.warn__list}>
            {warnings.map((wn, i) => (
              <li key={i}>{wn}</li>
            ))}
          </ul>
        </div>
      )}

      <div className={styles.add}>
        <span>Добавить слой:</span>
        <select
          className={styles.layer__select}
          value={newType}
          onChange={(e) => setNewType(e.target.value as CnnLayerType)}
        >
          <option value="conv">Conv2D (свёртка)</option>
          <option value="pool">MaxPooling (пулинг)</option>
          <option value="flatten">Flatten</option>
          <option value="dropout">Dropout (регуляризация)</option>
          <option value="batchnorm">BatchNorm (нормализация)</option>
          <option value="dense">Dense (полносвязный)</option>
        </select>
        <Button type="button" color="outline-blue" onClick={addLayer}>
          Добавить в конец
        </Button>
      </div>

      <div className={styles.colors}>
        {(Object.keys(colors) as ColorableType[]).map((type) => (
          <div key={type} className={styles.colors__group}>
            <span>{LABELS[type]}</span>
            <div className={styles.colors__swatches}>
              <input
                type="color"
                title="Начальный цвет градиента"
                value={colors[type].start}
                onChange={(e) => setColor(type, { start: e.target.value })}
              />
              <input
                type="color"
                title="Конечный цвет градиента"
                value={colors[type].end}
                onChange={(e) => setColor(type, { end: e.target.value })}
              />
            </div>
          </div>
        ))}
        <div className={styles.colors__group}>
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
      </div>

      <div className={styles.viz}>
        <svg
          ref={svgRef}
          role="img"
          aria-label="Схема свёрточной нейронной сети (CNN)"
        />
      </div>
      <p className={styles.editHint}>
        ✎ Нажмите на любую подпись схемы, чтобы изменить её вручную
      </p>
      {overlay}

      <div className={styles.info}>
        {hoveredLayer ? (
          <>
            <span>
              <b>Слой:</b> {LABELS[hoveredLayer.type as CnnLayerType]}
            </span>
            {hoveredLayer.type === "input" && (
              <span>Каналов: {hoveredLayer.neuronCount}</span>
            )}
            {hoveredLayer.type === "conv" && (
              <>
                <span>Фильтров: {hoveredLayer.neuronCount}</span>
                <span>
                  Ядро: {hoveredLayer.kernelSize ?? 3}×
                  {hoveredLayer.kernelSize ?? 3}
                </span>
                <span>
                  Активация: {hoveredLayer.activationFunction ?? "relu"}
                </span>
              </>
            )}
            {hoveredLayer.type === "pool" && (
              <span>
                Окно: {hoveredLayer.poolSize ?? 2}×{hoveredLayer.poolSize ?? 2}
              </span>
            )}
            {(hoveredLayer.type === "dense" ||
              hoveredLayer.type === "output") && (
              <>
                <span>Нейронов: {hoveredLayer.neuronCount}</span>
                <span>
                  Активация: {hoveredLayer.activationFunction ?? "relu"}
                </span>
              </>
            )}
            {hoveredLayer.type === "dropout" && (
              <span>Доля отключения: {hoveredLayer.rate ?? 0.5}</span>
            )}
            {hoveredLayer.type === "batchnorm" && (
              <span>Нормализация активаций по мини-батчу</span>
            )}
          </>
        ) : (
          <span className={styles.info__hint}>
            Наведите курсор на слой схемы, чтобы увидеть его параметры
          </span>
        )}
      </div>

      <div className={styles.footer}>
        <label className={styles.layer__field}>
          Фреймворк:
          <select
            className={styles.layer__select}
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
        <span className={styles.params}>
          Параметров (полносвязная часть): ~
          {totalParams.toLocaleString("ru-RU")}
        </span>
        <Button type="button" color="outline-blue" onClick={reset}>
          Сбросить
        </Button>
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
        {savedMsg && <span className={styles.params}>{savedMsg}</span>}
        <Button
          type="button"
          color="filled"
          onClick={() => mutation.mutate({ network: { layers }, framework })}
        >
          {mutation.isPending ? "Генерация..." : "Сгенерировать код"}
        </Button>
      </div>
    </div>
  );
};

export default CnnArchitecture;
