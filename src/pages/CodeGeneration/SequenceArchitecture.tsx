import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import styles from "./SequenceArchitecture.module.css";
import Button from "../../components/Button/Button";
import { GlossaryTerm } from "../../components/GlossaryTerm/GlossaryTerm";
import { LAYER_TERM } from "../../data/glossary";
import { useAuth } from "../../auth/useAuth";
import { saveProject, NetworkKind } from "../../auth/projects";
import { queryClient } from "../../api/queryClient";
import { Code } from "../../api/Code";
import {
  Layer,
  LayerType,
  NeuralNetworkLayers,
  submitArchitecture,
} from "../../api/Network";
import { Framework, FRAMEWORK_LABELS } from "../../api/mock/codegen";
import { drawSequenceDiagram, LABELS } from "./drawSequenceDiagram";
import { useEditableLabels } from "../../hooks/useEditableLabels";
import { usePersistedState } from "../../hooks/usePersistedState";

type Variant = "rnn" | "transformer";

const RNN_DEFAULT: Layer[] = [
  { type: "embedding", neuronCount: 0, vocabSize: 10000, embeddingDim: 64 },
  { type: "lstm", neuronCount: 128, returnSequences: false },
  { type: "dense", neuronCount: 64, activationFunction: "relu" },
  { type: "output", neuronCount: 2, activationFunction: "softmax" },
];

const TRANSFORMER_DEFAULT: Layer[] = [
  { type: "embedding", neuronCount: 0, vocabSize: 20000, embeddingDim: 128 },
  { type: "attention", neuronCount: 0, numHeads: 4, ffDim: 128 },
  { type: "globalpool", neuronCount: 0 },
  { type: "dense", neuronCount: 64, activationFunction: "relu" },
  { type: "output", neuronCount: 3, activationFunction: "softmax" },
];

const ACTIVATIONS = ["relu", "tanh", "sigmoid", "softmax"];

const ADD_OPTIONS: Record<Variant, { value: LayerType; label: string }[]> = {
  rnn: [
    { value: "lstm", label: "LSTM" },
    { value: "gru", label: "GRU" },
    { value: "rnn", label: "SimpleRNN" },
    { value: "globalpool", label: "GlobalPool" },
    { value: "dense", label: "Dense" },
  ],
  transformer: [
    { value: "attention", label: "Transformer-блок" },
    { value: "globalpool", label: "GlobalPool" },
    { value: "dense", label: "Dense" },
  ],
};

const COLORS: Record<string, [string, string]> = {
  embedding: ["#DDD6FE", "#7C3AED"],
  lstm: ["#99F6E4", "#0D9488"],
  gru: ["#99F6E4", "#0D9488"],
  rnn: ["#99F6E4", "#0D9488"],
  attention: ["#C7D2FE", "#4338CA"],
  globalpool: ["#A5F3FC", "#0891B2"],
  dense: ["#DBEAFE", "#2563EB"],
  output: ["#BBF7D0", "#16A34A"],
};

const isRec = (t: LayerType) => t === "lstm" || t === "gru" || t === "rnn";

const validate = (layers: Layer[]): string[] => {
  const w: string[] = [];
  if (layers.length === 0) return w;

  if (layers[0].type !== "embedding") {
    w.push(
      "Последовательные модели обычно начинаются со слоя Embedding — он превращает индексы токенов в векторы."
    );
  }
  if (layers[layers.length - 1].type !== "output") {
    w.push("Архитектура должна заканчиваться выходным слоем (Output).");
  }

  layers.forEach((l, i) => {
    const next = layers[i + 1];
    if (!next) return;
    const nextNeedsSeq = isRec(next.type) || next.type === "attention";

    if (isRec(l.type)) {
      if (nextNeedsSeq && !l.returnSequences) {
        w.push(
          `${LABELS[l.type]} перед ${LABELS[next.type]}: включите «последовательность», иначе следующий слой получит вектор вместо всей последовательности.`
        );
      }
      if (
        !nextNeedsSeq &&
        l.returnSequences &&
        (next.type === "dense" || next.type === "output")
      ) {
        w.push(
          `${LABELS[l.type]} возвращает последовательность, но за ним идёт ${LABELS[next.type]}. Добавьте GlobalPool/Flatten или выключите «последовательность».`
        );
      }
    }

    if (
      l.type === "attention" &&
      (next.type === "dense" || next.type === "output")
    ) {
      w.push(
        "После блока внимания нужен GlobalPool, чтобы свернуть последовательность в вектор перед Dense/Output."
      );
    }
  });

  return w;
};

const estimateParams = (layers: Layer[]): number => {
  let total = 0;
  let dim = 0;
  for (const l of layers) {
    switch (l.type) {
      case "embedding": {
        const v = l.vocabSize ?? 0;
        const d = l.embeddingDim ?? 0;
        total += v * d;
        dim = d;
        break;
      }
      case "lstm":
      case "gru":
      case "rnn": {
        const gate = l.type === "lstm" ? 4 : l.type === "gru" ? 3 : 1;
        const u = l.neuronCount;
        total += gate * u * (u + dim + 1);
        dim = u;
        break;
      }
      case "attention": {
        const d = dim || 0;
        const ff = l.ffDim ?? 0;

        total += 4 * d * d + 4 * d + (2 * d * ff + d + ff) + 4 * d;
        break;
      }
      case "dense":
      case "output": {
        const u = l.neuronCount;
        total += u * (dim + 1);
        dim = u;
        break;
      }
      default:
        break;
    }
  }
  return total;
};

interface Props {
  variant: Variant;
  onGenerateCode: (code: string) => void;
  initialLayers?: Layer[];
  initialLabels?: Record<string, string>;
}

const SequenceArchitecture: React.FC<Props> = ({
  variant,
  onGenerateCode,
  initialLayers,
  initialLabels,
}) => {

  const dk = (s: string) =>
    initialLayers ? null : `neurocraft.draft.${variant}.${s}`;
  const [layers, setLayers] = usePersistedState<Layer[]>(
    dk("layers"),
    initialLayers ?? (variant === "rnn" ? RNN_DEFAULT : TRANSFORMER_DEFAULT)
  );
  const [framework, setFramework] = usePersistedState<Framework>(
    dk("framework"),
    "keras"
  );
  const [newType, setNewType] = useState<LayerType>(ADD_OPTIONS[variant][0].value);
  const [savedMsg, setSavedMsg] = useState("");

  const [colors, setColors] = usePersistedState<
    Record<string, { start: string; end: string }>
  >(
    dk("colors"),
    Object.fromEntries(
      Object.entries(COLORS).map(([k, [l, d]]) => [k, { start: l, end: d }])
    )
  );
  const [lineColor, setLineColor] = usePersistedState(dk("lineColor"), "#64748b");

  const [solidFill, setSolidFill] = usePersistedState(dk("solidFill"), false);
  const [hovered, setHovered] = useState<{ title: string; text: string } | null>(
    null
  );
  const warnings = validate(layers);
  const paramCount = estimateParams(layers);
  const svgRef = useRef<SVGSVGElement>(null);
  const { enhance, overlay, getLabels } = useEditableLabels(
    svgRef,
    initialLabels,
    initialLayers ? undefined : `neurocraft.draft.${variant}.labels`
  );
  const navigate = useNavigate();
  const { user } = useAuth();

  const update = (i: number, patch: Partial<Layer>) =>
    setLayers((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  const remove = (i: number) =>
    setLayers((prev) => prev.filter((_, idx) => idx !== i));

  const fixedPos = (t: LayerType) => t === "embedding" || t === "output";
  const canMove = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= layers.length) return false;
    return !fixedPos(layers[i].type) && !fixedPos(layers[j].type);
  };
  const move = (i: number, dir: -1 | 1) =>
    canMove(i, dir) &&
    setLayers((prev) => {
      const a = [...prev];
      [a[i], a[i + dir]] = [a[i + dir], a[i]];
      return a;
    });

  const reset = () =>
    setLayers(variant === "rnn" ? RNN_DEFAULT : TRANSFORMER_DEFAULT);

  const makeLayer = (t: LayerType): Layer => {
    switch (t) {
      case "lstm":
        return { type: "lstm", neuronCount: 64, returnSequences: false };
      case "gru":
        return { type: "gru", neuronCount: 64, returnSequences: false };
      case "rnn":
        return { type: "rnn", neuronCount: 64, returnSequences: false };
      case "attention":
        return { type: "attention", neuronCount: 0, numHeads: 4, ffDim: 128 };
      case "globalpool":
        return { type: "globalpool", neuronCount: 0 };
      default:
        return { type: "dense", neuronCount: 64, activationFunction: "relu" };
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

  const insertAfter = (i: number) =>
    setLayers((prev) => {
      const next = [...prev];
      next.splice(i + 1, 0, makeLayer(newType));
      return next;
    });

  const handleSaveImage = () => {
    const svgElement = svgRef.current;
    if (!svgElement) return;
    const w = svgElement.clientWidth || svgElement.viewBox.baseVal.width || 800;
    const h = svgElement.clientHeight || svgElement.viewBox.baseVal.height || 200;
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
      link.download = `${variant}_visualization.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    img.src =
      "data:image/svg+xml;base64," +
      btoa(unescape(encodeURIComponent(svgString)));
  };

  const handleSaveToAccount = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    const name = window.prompt(
      "Название архитектуры:",
      variant === "rnn" ? "Моя RNN" : "Мой трансформер"
    );
    if (!name) return;
    saveProject(user.id, {
      name,
      kind: variant as NetworkKind,
      layers,
      labels: getLabels(),
    });
    setSavedMsg("Сохранено в кабинет ✓");
    setTimeout(() => setSavedMsg(""), 2500);
  };

  const mutation = useMutation(
    {
      mutationFn: (vars: { network: NeuralNetworkLayers; framework: Framework }) =>
        submitArchitecture(vars.network, vars.framework).then((code: Code) =>
          onGenerateCode(code.code)
        ),
      onError: (e) => console.error("Sequence code generation failed:", e),
    },
    queryClient
  );

  useEffect(() => {
    drawSequenceDiagram(svgRef.current, layers, {
      variant,
      colors,
      lineColor,
      solidFill,
      onHover: setHovered,
    });
  }, [layers, variant, colors, lineColor, solidFill]);

  useEffect(() => {
    enhance(`${variant}:${layers.map((l) => l.type).join(",")}`);
  }, [layers, variant, colors, lineColor, solidFill, enhance]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.controls}>
        {layers.map((layer, index) => (
          <div key={index} className={styles.layer}>
            <span className={styles.layer__name}>
              <GlossaryTerm id={LAYER_TERM[layer.type]}>
                {LABELS[layer.type] ?? layer.type}
              </GlossaryTerm>
            </span>

            {layer.type === "embedding" && (
              <>
                <label className={styles.field}>
                  словарь
                  <input
                    type="number"
                    min={1}
                    className={styles.input}
                    value={layer.vocabSize ?? 10000}
                    onChange={(e) =>
                      update(index, { vocabSize: parseInt(e.target.value) || 1 })
                    }
                  />
                </label>
                <label className={styles.field}>
                  размерность
                  <input
                    type="number"
                    min={1}
                    className={styles.input}
                    value={layer.embeddingDim ?? 64}
                    onChange={(e) =>
                      update(index, {
                        embeddingDim: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </label>
              </>
            )}

            {(layer.type === "lstm" ||
              layer.type === "gru" ||
              layer.type === "rnn") && (
              <>
                <label className={styles.field}>
                  юниты
                  <input
                    type="number"
                    min={1}
                    className={styles.input}
                    value={layer.neuronCount}
                    onChange={(e) =>
                      update(index, { neuronCount: parseInt(e.target.value) || 1 })
                    }
                  />
                </label>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={!!layer.returnSequences}
                    onChange={(e) =>
                      update(index, { returnSequences: e.target.checked })
                    }
                  />
                  последовательность
                </label>
              </>
            )}

            {layer.type === "attention" && (
              <>
                <label className={styles.field}>
                  головы
                  <input
                    type="number"
                    min={1}
                    className={styles.input}
                    value={layer.numHeads ?? 4}
                    onChange={(e) =>
                      update(index, { numHeads: parseInt(e.target.value) || 1 })
                    }
                  />
                </label>
                <label className={styles.field}>
                  ff
                  <input
                    type="number"
                    min={1}
                    className={styles.input}
                    value={layer.ffDim ?? 128}
                    onChange={(e) =>
                      update(index, { ffDim: parseInt(e.target.value) || 1 })
                    }
                  />
                </label>
              </>
            )}

            {(layer.type === "dense" || layer.type === "output") && (
              <>
                <label className={styles.field}>
                  нейроны
                  <input
                    type="number"
                    min={1}
                    className={styles.input}
                    value={layer.neuronCount}
                    onChange={(e) =>
                      update(index, { neuronCount: parseInt(e.target.value) || 1 })
                    }
                  />
                </label>
                <select
                  className={styles.select}
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
                  className={styles.move}
                  title="Переместить левее"
                  disabled={!canMove(index, -1)}
                  onClick={() => move(index, -1)}
                >
                  ←
                </button>
                <button
                  className={styles.move}
                  title="Переместить правее"
                  disabled={!canMove(index, 1)}
                  onClick={() => move(index, 1)}
                >
                  →
                </button>
              </>
            )}
            {layer.type !== "embedding" && layer.type !== "output" && (
              <button
                className={styles.remove}
                title="Удалить слой"
                onClick={() => remove(index)}
              >
                ×
              </button>
            )}
            {layer.type !== "output" && (
              <button
                className={styles.insert}
                title="Вставить выбранный слой после этого"
                onClick={() => insertAfter(index)}
              >
                +
              </button>
            )}
          </div>
        ))}
      </div>

      <div className={styles.add}>
        <span>Добавить слой:</span>
        <select
          className={styles.select}
          value={newType}
          onChange={(e) => setNewType(e.target.value as LayerType)}
        >
          {ADD_OPTIONS[variant].map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <Button type="button" color="outline-blue" onClick={addLayer}>
          Добавить
        </Button>
      </div>

      {warnings.length > 0 && (
        <div className={styles.warn}>
          <span className={styles.warn__title}>⚠ Рекомендации по архитектуре</span>
          <ul className={styles.warn__list}>
            {warnings.map((wn, i) => (
              <li key={i}>{wn}</li>
            ))}
          </ul>
        </div>
      )}

      <div className={styles.colors}>
        {[...new Set(layers.map((l) => l.type))].map((type) => (
          <div key={type} className={styles.colors__group}>
            <span>{LABELS[type] ?? type}</span>
            <div className={styles.colors__swatches}>
              <input
                type="color"
                title="Заливка"
                value={colors[type]?.start ?? "#e2e8f0"}
                onChange={(e) =>
                  setColors((p) => ({
                    ...p,
                    [type]: {
                      ...(p[type] ?? { start: "#e2e8f0", end: "#64748b" }),
                      start: e.target.value,
                    },
                  }))
                }
              />
              <input
                type="color"
                title="Контур и подпись"
                value={colors[type]?.end ?? "#64748b"}
                onChange={(e) =>
                  setColors((p) => ({
                    ...p,
                    [type]: {
                      ...(p[type] ?? { start: "#e2e8f0", end: "#64748b" }),
                      end: e.target.value,
                    },
                  }))
                }
              />
            </div>
          </div>
        ))}
        <div className={styles.colors__group}>
          <span>Стрелки</span>
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
          aria-label="Схема рекуррентной сети или трансформера: последовательность слоёв"
        />
      </div>
      <p className={styles.editHint}>
        ✎ Нажмите на любую подпись схемы, чтобы изменить её вручную
      </p>
      {overlay}

      <div className={styles.info}>
        {hovered ? (
          <>
            <span className={styles.info__title}>
              <b>{hovered.title}</b>
            </span>
            <span className={styles.info__text}>{hovered.text}</span>
          </>
        ) : (
          <span className={styles.info__hint}>
            Наведите курсор на блок схемы, чтобы узнать, что делает слой
          </span>
        )}
      </div>

      <div className={styles.footer}>
        <label className={styles.field}>
          Фреймворк:
          <select
            className={styles.select}
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
          ≈ {paramCount.toLocaleString("ru-RU")} параметров
        </span>
        <Button type="button" color="outline-blue" onClick={reset}>
          Сбросить
        </Button>
        <Button type="button" color="outline-blue" onClick={handleSaveImage}>
          Сохранить изображение
        </Button>
        <Button type="button" color="outline-blue" onClick={handleSaveToAccount}>
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

export default SequenceArchitecture;
