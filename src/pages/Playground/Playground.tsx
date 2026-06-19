import React, { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as d3 from "d3";
import { useSearchParams } from "react-router-dom";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import Button from "../../components/Button/Button";
import {
  DATASET_LABELS,
  DatasetKey,
  Dataset,
  generateDataset,
  parseDatasetFile,
  SAMPLE_CSV,
  classCount,
} from "./datasets";
import { PageMeta } from "../../components/PageMeta/PageMeta";
import { usePersistedState } from "../../hooks/usePersistedState";
import styles from "./Playground.module.scss";

const SIZE = 340;
const RES = 64;

const C_NEG = "#f59e0b";
const C_POS = "#0877bd";
const C_MID = "#e8eaeb";
const heatColor = d3
  .scaleLinear<string>()
  .domain([0, 0.5, 1])
  .range([C_NEG, C_MID, C_POS])
  .clamp(true);

const CLASS_COLORS = [
  C_NEG,
  C_POS,
  "#16a34a",
  "#dc2626",
  "#7c3aed",
  "#0891b2",
];
const classColor = (c: number) => CLASS_COLORS[c % CLASS_COLORS.length];
const ACTIVATIONS = ["tanh", "relu", "sigmoid"] as const;
const LR_OPTIONS = [0.001, 0.01, 0.03, 0.1, 0.3];
const BATCH_OPTIONS = [8, 16, 32, 64];
const TEST_SPLIT = 0.25;
const PATIENCE = 12;

type Activation = (typeof ACTIVATIONS)[number];

type ModelFormat = "tfjs" | "json" | "keras" | "h5";

type Hist = {
  loss: number[];
  acc: number[];
  valLoss: number[];
  valAcc: number[];
};
const EMPTY_HIST: Hist = { loss: [], acc: [], valLoss: [], valAcc: [] };

const toPx = (v: number) => ((v + 1.1) / 2.2) * SIZE;

const Playground: React.FC = () => {
  const [searchParams] = useSearchParams();

  const datasetForClasses = (c: string | null): DatasetKey | null =>
    c === "3" ? "blobs3" : c === "4" ? "blobs4" : null;
  const classesParam = searchParams.get("classes");
  const presetDataset = datasetForClasses(classesParam);

  const [datasetKey, setDatasetKey] = usePersistedState<DatasetKey>(
    presetDataset ? null : "neurocraft.draft.pg.dataset",
    presetDataset ?? "xor"
  );
  const [noise, setNoise] = usePersistedState("neurocraft.draft.pg.noise", 0.05);
  const [pointCount, setPointCount] = usePersistedState(
    "neurocraft.draft.pg.points",
    240
  );
  const [dataset, setDataset] = useState<Dataset>(() =>
    generateDataset("xor", 240, 0.05)
  );

  const [customDataset, setCustomDataset] =
    usePersistedState<Dataset | null>("neurocraft.draft.pg.custom", null);
  const [customError, setCustomError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialHidden = (() => {
    const h = searchParams.get("hidden");
    if (h) {
      const arr = h
        .split(",")
        .map((s) => parseInt(s, 10))
        .filter((n) => n > 0);
      if (arr.length) return arr;
    }
    return [6, 4];
  })();
  const [hidden, setHidden] = usePersistedState<number[]>(
    searchParams.get("hidden") ? null : "neurocraft.draft.pg.hidden",
    initialHidden
  );
  const [activation, setActivation] = usePersistedState<Activation>(
    searchParams.get("act") ? null : "neurocraft.draft.pg.activation",
    (searchParams.get("act") as Activation) || "tanh"
  );
  const [lr, setLr] = usePersistedState("neurocraft.draft.pg.lr", 0.03);
  const [epochs, setEpochs] = usePersistedState("neurocraft.draft.pg.epochs", 100);
  const [batchSize, setBatchSize] = usePersistedState(
    "neurocraft.draft.pg.batch",
    16
  );
  const [earlyStop, setEarlyStop] = usePersistedState(
    "neurocraft.draft.pg.earlyStop",
    true
  );

  const [isTraining, setIsTraining] = useState(false);
  const [stopped, setStopped] = useState(false);

  const [modelReady, setModelReady] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<ModelFormat>("tfjs");

  const [tfReady, setTfReady] = useState(false);
  const [tfError, setTfError] = useState<string | null>(null);
  const [trainError, setTrainError] = useState<string | null>(null);
  const [showTest, setShowTest] = useState(false);
  const [history, setHistory] = useState<Hist>(EMPTY_HIST);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<SVGSVGElement>(null);
  const modelRef = useRef<tf.Sequential | null>(null);
  const stopRef = useRef(false);
  const testSetRef = useRef<Set<number>>(new Set());

  const mountedRef = useRef(true);

  const trainedClassesRef = useRef(2);

  const numClasses = classCount(dataset);

  useEffect(() => {
    if (datasetKey === "custom") {
      if (customDataset) setDataset(customDataset);
    } else {
      setDataset(generateDataset(datasetKey, pointCount, noise));
    }
  }, [datasetKey, pointCount, noise, customDataset]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopRef.current = true;
      modelRef.current?.dispose();
    };
  }, []);

  const drawBoundary = async (model: tf.Sequential | null) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, SIZE, SIZE);

    if (model) {
      const grid: number[][] = [];
      for (let j = 0; j < RES; j++) {
        for (let i = 0; i < RES; i++) {
          const x = (i / (RES - 1)) * 2.2 - 1.1;
          const y = 1.1 - (j / (RES - 1)) * 2.2;
          grid.push([x, y]);
        }
      }
      const t = tf.tidy(() => model.predict(tf.tensor2d(grid)) as tf.Tensor);
      const preds = await t.data();
      t.dispose();
      const cell = SIZE / RES;

      const outDim = Math.round(preds.length / (RES * RES));
      for (let idx = 0; idx < RES * RES; idx++) {
        const i = idx % RES;
        const j = Math.floor(idx / RES);
        if (outDim === 1) {
          ctx.fillStyle = heatColor(preds[idx]);
        } else {

          let best = 0;
          let bestP = -Infinity;
          for (let c = 0; c < outDim; c++) {
            const v = preds[idx * outDim + c];
            if (v > bestP) {
              bestP = v;
              best = c;
            }
          }
          const conf = (bestP - 1 / outDim) / (1 - 1 / outDim);
          ctx.fillStyle = d3.interpolateRgb(
            C_MID,
            classColor(best)
          )(Math.max(0, Math.min(1, conf)));
        }
        ctx.fillRect(i * cell, j * cell, cell + 1, cell + 1);
      }
    }

    dataset.points.forEach(([x, y], k) => {
      const px = toPx(x);
      const py = SIZE - toPx(y);
      const isTest = showTest && testSetRef.current.has(k);
      ctx.beginPath();
      ctx.arc(px, py, isTest ? 3 : 3.4, 0, Math.PI * 2);
      ctx.fillStyle = classColor(dataset.labels[k]);
      ctx.fill();

      ctx.lineWidth = isTest ? 2 : 1;
      ctx.strokeStyle = isTest ? "#111827" : "rgba(255,255,255,0.9)";
      ctx.stroke();
    });
  };

  useEffect(() => {
    drawBoundary(isTraining ? modelRef.current : null);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataset]);

  useEffect(() => {
    drawBoundary(modelRef.current);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showTest]);

  useEffect(() => {
    const svg = d3.select(chartRef.current);
    svg.selectAll("*").remove();
    const w = 360;
    const h = 200;
    const m = { top: 12, right: 12, bottom: 24, left: 32 };
    svg.attr("viewBox", `0 0 ${w} ${h}`);
    const n = history.loss.length;
    const xs = d3.scaleLinear([0, Math.max(1, n - 1)], [m.left, w - m.right]);
    const maxLoss = Math.max(
      0.5,
      d3.max([...history.loss, ...history.valLoss]) ?? 1
    );
    const ysLoss = d3.scaleLinear([0, maxLoss], [h - m.bottom, m.top]);
    const ysAcc = d3.scaleLinear([0, 1], [h - m.bottom, m.top]);

    svg
      .append("g")
      .attr("transform", `translate(0,${h - m.bottom})`)
      .call(d3.axisBottom(xs).ticks(5))
      .attr("color", "#94a3b8");
    svg
      .append("g")
      .attr("transform", `translate(${m.left},0)`)
      .call(d3.axisLeft(ysAcc).ticks(5))
      .attr("color", "#94a3b8");

    if (n > 1) {
      const lineLoss = d3
        .line<number>()
        .x((_, i) => xs(i))
        .y((d) => ysLoss(d));
      const lineAcc = d3
        .line<number>()
        .x((_, i) => xs(i))
        .y((d) => ysAcc(d));

      const addPath = (
        data: number[],
        line: d3.Line<number>,
        color: string,
        dashed: boolean
      ) =>
        svg
          .append("path")
          .datum(data)
          .attr("fill", "none")
          .attr("stroke", color)
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", dashed ? "4 3" : "none")
          .attr("d", line);

      addPath(history.loss, lineLoss, "#ef4444", false);
      addPath(history.valLoss, lineLoss, "#ef4444", true);
      addPath(history.acc, lineAcc, "#16a34a", false);
      addPath(history.valAcc, lineAcc, "#16a34a", true);
    }
  }, [history]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await tf.ready();
        if (!cancelled) setTfReady(true);
      } catch (e) {
        console.error("TensorFlow.js не инициализировался:", e);
        if (!cancelled)
          setTfError(
            "Не удалось запустить вычислительный движок (TensorFlow.js). " +
              "Проверьте, поддерживает ли браузер WebGL."
          );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const train = async () => {
    if (!tfReady) return;
    stopRef.current = false;
    setStopped(false);
    setTrainError(null);
    setModelReady(false);
    setHistory(EMPTY_HIST);
    modelRef.current?.dispose();

    const model = tf.sequential();
    model.add(
      tf.layers.dense({
        units: hidden[0] ?? 4,
        activation,
        inputShape: [2],
      })
    );
    for (let i = 1; i < hidden.length; i++) {
      model.add(tf.layers.dense({ units: hidden[i], activation }));
    }

    const K = numClasses;
    const binary = K === 2;
    trainedClassesRef.current = K;
    if (binary) {
      model.add(tf.layers.dense({ units: 1, activation: "sigmoid" }));
      model.compile({
        optimizer: tf.train.adam(lr),
        loss: "binaryCrossentropy",
        metrics: ["accuracy"],
      });
    } else {
      model.add(tf.layers.dense({ units: K, activation: "softmax" }));
      model.compile({
        optimizer: tf.train.adam(lr),
        loss: "categoricalCrossentropy",
        metrics: ["accuracy"],
      });
    }
    modelRef.current = model;

    const order = dataset.points.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    const xs = tf.tensor2d(order.map((i) => dataset.points[i]));

    const ys = binary
      ? tf.tensor2d(order.map((i) => [dataset.labels[i]]))
      : (tf.tidy(
          () =>
            tf
              .oneHot(
                tf.tensor1d(
                  order.map((i) => dataset.labels[i]),
                  "int32"
                ),
                K
              )
              .cast("float32")
        ) as tf.Tensor2D);

    const trainN = Math.floor(order.length * (1 - TEST_SPLIT));
    testSetRef.current = new Set(order.slice(trainN));

    setIsTraining(true);
    let best = Infinity;
    let wait = 0;
    try {
      await model.fit(xs, ys, {
        epochs,
        batchSize,
        shuffle: true,
        validationSplit: TEST_SPLIT,
        callbacks: {
          onEpochEnd: async (_epoch, logs) => {

            if (!mountedRef.current) {
              model.stopTraining = true;
              return;
            }
            const loss = (logs?.loss as number) ?? 0;
            const acc = ((logs?.acc ?? logs?.accuracy) as number) ?? 0;
            const valLoss = (logs?.val_loss as number) ?? 0;
            const valAcc =
              ((logs?.val_acc ?? logs?.val_accuracy) as number) ?? 0;
            setHistory((hst) => ({
              loss: [...hst.loss, loss],
              acc: [...hst.acc, acc],
              valLoss: [...hst.valLoss, valLoss],
              valAcc: [...hst.valAcc, valAcc],
            }));
            await drawBoundary(model);

            if (earlyStop) {
              if (valLoss < best - 1e-4) {
                best = valLoss;
                wait = 0;
              } else if (++wait >= PATIENCE) {
                model.stopTraining = true;
                setStopped(true);
              }
            }
            if (stopRef.current) model.stopTraining = true;
            await tf.nextFrame();
          },
        },
      });
    } catch (e) {
      console.error("Ошибка во время обучения:", e);
      setTrainError(
        "Во время обучения произошла ошибка. Попробуйте уменьшить размер сети " +
          "или число эпох и запустить снова."
      );
    } finally {
      xs.dispose();
      ys.dispose();
      if (mountedRef.current) {
        setIsTraining(false);

        if (modelRef.current) setModelReady(true);
      }
    }
  };

  const stop = () => {
    stopRef.current = true;
  };

  const handleFile = (file: File) => {
    setCustomError(null);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = parseDatasetFile(String(reader.result ?? ""));
        setCustomDataset(parsed);
        setDatasetKey("custom");
      } catch (e) {
        setCustomError(e instanceof Error ? e.message : "Не удалось прочитать файл.");
      }
    };
    reader.onerror = () => setCustomError("Не удалось прочитать файл.");
    reader.readAsText(file);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);

    e.target.value = "";
  };

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "пример-датасета.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const saveTextFile = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const readWeights = async () => {
    const model = modelRef.current;
    if (!model) return [];
    const vars = model.weights;
    const weights = model.getWeights();
    return Promise.all(
      weights.map(async (w, i) => ({
        name: vars[i]?.name ?? `weight_${i}`,
        shape: w.shape,
        dtype: w.dtype,
        data: Array.from(await w.data()),
      }))
    );
  };

  const nest = (flat: number[], shape: number[]): unknown => {
    if (shape.length <= 1) return flat.slice(0, shape[0] ?? flat.length);
    const [head, ...rest] = shape;
    const size = rest.reduce((a, b) => a * b, 1);
    const out: unknown[] = [];
    for (let i = 0; i < head; i++) {
      out.push(nest(flat.slice(i * size, (i + 1) * size), rest));
    }
    return out;
  };

  const architecture = () => {
    const k = trainedClassesRef.current;
    const binary = k === 2;
    return {
      inputShape: [2] as number[],
      hidden,
      activation,
      classes: k,
      output: binary
        ? { units: 1, activation: "sigmoid" }
        : { units: k, activation: "softmax" },
    };
  };

  const downloadTfjs = async () => {
    const model = modelRef.current;
    if (!model) return;
    await model.save("downloads://neurocraft-model");
    const usage = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <title>Использование модели NeuroCraft</title>
  <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs"></script>
</head>
<body>
  <h1>Обученная модель NeuroCraft Studio</h1>
  <p>
    Положите рядом файлы <code>neurocraft-model.json</code> и
    <code>neurocraft-model.weights.bin</code>, затем откройте эту страницу
    через локальный сервер (например, <code>python -m http.server</code>) —
    из file:// модель не загрузится из-за ограничений браузера.
  </p>
  <pre id="out">Загрузка…</pre>
  <script type="module">
    async function run() {
      // Загружаем архитектуру и веса.
      const model = await tf.loadLayersModel("./neurocraft-model.json");
      // Вход — точка [x, y]. Координаты в том же масштабе, что при обучении
      // (в песочнице — нормализованы примерно в диапазон [-1, 1]).
      const input = tf.tensor2d([[0.3, -0.4]]);
      const out = await model.predict(input).data();
      input.dispose();
      let msg;
      if (out.length === 1) {
        // Бинарная модель: один выход — вероятность класса 1.
        const prob = out[0];
        msg = "Вероятность класса 1: " + prob.toFixed(4) +
          "\\nПредсказанный класс: " + (prob >= 0.5 ? 1 : 0);
      } else {
        // Многоклассовая: выход softmax — берём класс с макс. вероятностью.
        let best = 0;
        for (let c = 1; c < out.length; c++) if (out[c] > out[best]) best = c;
        msg = "Вероятности: [" + Array.from(out).map((v) => v.toFixed(3)).join(", ") +
          "]\\nПредсказанный класс: " + best;
      }
      document.getElementById("out").textContent = msg;
    }
    run();
  </script>
</body>
</html>
`;
    saveTextFile(usage, "neurocraft-model-usage.html", "text/html;charset=utf-8");
  };

  const downloadJson = async () => {
    const model = modelRef.current;
    if (!model) return;
    const payload = {
      format: "neurocraft-model",
      version: 1,
      createdAt: new Date().toISOString(),
      architecture: architecture(),
      topology: model.toJSON(undefined, false),
      weights: await readWeights(),
    };
    saveTextFile(
      JSON.stringify(payload, null, 2),
      "neurocraft-model.json",
      "application/json"
    );
    const usage = `// Использование модели NeuroCraft из единого JSON.
// Запуск: Node.js (npm i @tensorflow/tfjs) или в браузере с подключённым tfjs.
import * as tf from "@tensorflow/tfjs";
import fs from "node:fs";

const data = JSON.parse(fs.readFileSync("./neurocraft-model.json", "utf8"));

// Восстанавливаем архитектуру из топологии и проставляем веса.
const model = await tf.models.modelFromJSON({ modelTopology: data.topology });
model.setWeights(data.weights.map((w) => tf.tensor(w.data, w.shape, w.dtype)));

// Вход — точка [x, y] в том же масштабе, что при обучении (~[-1, 1]).
const input = tf.tensor2d([[0.3, -0.4]]);
const out = await model.predict(input).data();
if (out.length === 1) {
  // Бинарная модель: вероятность класса 1.
  console.log("Вероятность класса 1:", out[0].toFixed(4));
  console.log("Класс:", out[0] >= 0.5 ? 1 : 0);
} else {
  // Многоклассовая: класс с максимальной вероятностью.
  let best = 0;
  for (let c = 1; c < out.length; c++) if (out[c] > out[best]) best = c;
  console.log("Вероятности:", Array.from(out).map((v) => v.toFixed(3)));
  console.log("Класс:", best);
}
`;
    saveTextFile(
      usage,
      "neurocraft-model-usage.mjs",
      "text/javascript;charset=utf-8"
    );
  };

  const buildKerasBase = (
    ws: Awaited<ReturnType<typeof readWeights>>,
    k: number,
    binary: boolean
  ) => {
    const denseLines = hidden
      .map((u) => `    layers.Dense(${u}, activation='${activation}'),`)
      .join("\n");
    const outLayer = binary
      ? "    layers.Dense(1, activation='sigmoid'),"
      : `    layers.Dense(${k}, activation='softmax'),`;
    const lossName = binary ? "binary_crossentropy" : "categorical_crossentropy";

    const weightLiterals = ws
      .map((w) => `    np.array(${JSON.stringify(nest(w.data, w.shape))}),`)
      .join("\n");
    return `import numpy as np
from tensorflow import keras
from tensorflow.keras import layers

model = keras.Sequential([
    keras.Input(shape=(2,)),
${denseLines}
${outLayer}
])

# Веса в порядке слоёв: [ядро, смещение] для каждого Dense.
weights = [
${weightLiterals}
]
model.set_weights(weights)

model.compile(optimizer='adam', loss='${lossName}', metrics=['accuracy'])`;
  };

  const downloadKeras = async () => {
    const model = modelRef.current;
    if (!model) return;
    const ws = await readWeights();
    const k = trainedClassesRef.current;
    const binary = k === 2;
    const predictBody = binary
      ? `    prob = float(model.predict(np.array([[x, y]]), verbose=0)[0][0])
    return prob, (1 if prob >= 0.5 else 0)`
      : `    probs = model.predict(np.array([[x, y]]), verbose=0)[0]
    return probs, int(np.argmax(probs))`;
    const demoPrint = binary
      ? `    prob, cls = predict(0.3, -0.4)
    print(f'Вероятность класса 1: {prob:.4f}')
    print(f'Предсказанный класс: {cls}')`
      : `    probs, cls = predict(0.3, -0.4)
    print('Вероятности:', [round(float(p), 3) for p in probs])
    print(f'Предсказанный класс: {cls}')`;
    const code = `# Модель, обученная в песочнице NeuroCraft Studio (TensorFlow.js).
# Воссоздаёт ту же сеть на Keras и загружает обученные веса.
# Классов: ${k}.
${buildKerasBase(ws, k, binary)}

def predict(x, y):
    """Предсказание для точки [x, y] (масштаб как при обучении, ~[-1, 1])."""
${predictBody}

if __name__ == '__main__':
${demoPrint}
`;
    saveTextFile(code, "neurocraft-model.py", "text/x-python;charset=utf-8");
  };

  const downloadH5 = async () => {
    const model = modelRef.current;
    if (!model) return;
    const ws = await readWeights();
    const k = trainedClassesRef.current;
    const binary = k === 2;
    const code = `# Экспорт модели NeuroCraft Studio в формат Keras HDF5 (.h5).
# Браузер не умеет писать HDF5 напрямую, поэтому этот скрипт воссоздаёт сеть
# на Keras, проставляет обученные веса и сохраняет КАНОНИЧЕСКИЙ .h5.
#
# Запуск:  pip install tensorflow h5py
#          python neurocraft-export-h5.py
# Результат: файл neurocraft-model.h5, грузится через keras.models.load_model().
# Классов: ${k}.
${buildKerasBase(ws, k, binary)}

model.save('neurocraft-model.h5')
print('Сохранено: neurocraft-model.h5')
`;
    saveTextFile(code, "neurocraft-export-h5.py", "text/x-python;charset=utf-8");
  };

  const downloadModel = async () => {
    if (downloadFormat === "tfjs") await downloadTfjs();
    else if (downloadFormat === "json") await downloadJson();
    else if (downloadFormat === "keras") await downloadKeras();
    else await downloadH5();
  };

  const addLayer = () => setHidden((h) => (h.length < 5 ? [...h, 4] : h));
  const removeLayer = () =>
    setHidden((h) => (h.length > 1 ? h.slice(0, -1) : h));
  const setLayer = (i: number, v: number) =>
    setHidden((h) => h.map((x, idx) => (idx === i ? v : x)));

  const lastAcc = history.acc[history.acc.length - 1];
  const lastLoss = history.loss[history.loss.length - 1];
  const lastValAcc = history.valAcc[history.valAcc.length - 1];
  const lastValLoss = history.valLoss[history.valLoss.length - 1];
  const gap =
    lastAcc !== undefined && lastValAcc !== undefined
      ? (lastAcc - lastValAcc) * 100
      : undefined;

  return (
    <>
      <PageMeta
        title="Песочница — обучение нейросети в браузере"
        description="Обучайте нейросеть прямо в браузере на TensorFlow.js и наблюдайте за падением ошибки и границей решения в реальном времени."
      />
      <Header />
      <main className={styles.playground}>
        <div className="container">
          <h1 className={styles.title}>Обучение нейросети в браузере</h1>
          <p className={styles.subtitle}>
            Выберите датасет, настройте архитектуру и нажмите «Обучить». Обучение
            идёт прямо в браузере на TensorFlow.js — наблюдайте, как сеть строит
            границу между классами и как метрики на&nbsp;тесте отличаются
            от&nbsp;обучающих.
          </p>

          <div className={styles.layout}>
            <aside className={styles.controls}>
              <div className={styles.group}>
                <span className={styles.group__title}>Датасет</span>
                <div className={styles.datasets}>
                  {(Object.keys(DATASET_LABELS) as DatasetKey[]).map((k) => (
                    <button
                      key={k}
                      className={`${styles.chip} ${
                        datasetKey === k ? styles["chip--active"] : ""
                      }`}
                      onClick={() => setDatasetKey(k)}
                      disabled={isTraining}
                    >
                      {DATASET_LABELS[k]}
                    </button>
                  ))}
                </div>

                {datasetKey === "custom" && (
                  <div className={styles.upload}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,.txt,text/csv,text/plain"
                      hidden
                      onChange={onFileChange}
                    />
                    <div className={styles.upload__row}>
                      <button
                        type="button"
                        className={styles.chip}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isTraining}
                      >
                        📤 Загрузить CSV
                      </button>
                      <button
                        type="button"
                        className={styles.linkBtn}
                        onClick={downloadSample}
                      >
                        пример
                      </button>
                    </div>
                    <p className={styles.upload__hint}>
                      Формат: строки <code>x, y, класс</code> — два класса.
                      Координаты масштабируются автоматически. Данные
                      обрабатываются в браузере и&nbsp;никуда не&nbsp;отправляются.
                    </p>
                    {customDataset && !customError && (
                      <p className={styles.upload__ok}>
                        Загружено точек: {customDataset.points.length}
                      </p>
                    )}
                    {customError && (
                      <p className={styles.statusError} role="alert">
                        {customError}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className={styles.group}>
                <label className={styles.range}>
                  <span className={styles.range__head}>
                    Шум данных <b>{noise.toFixed(2)}</b>
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={0.5}
                    step={0.01}
                    value={noise}
                    disabled={isTraining || datasetKey === "custom"}
                    onChange={(e) => setNoise(parseFloat(e.target.value))}
                  />
                </label>
                <label className={styles.range}>
                  <span className={styles.range__head}>
                    Точек данных <b>{pointCount}</b>
                  </span>
                  <input
                    type="range"
                    min={50}
                    max={600}
                    step={10}
                    value={pointCount}
                    disabled={isTraining || datasetKey === "custom"}
                    onChange={(e) => setPointCount(parseInt(e.target.value))}
                  />
                </label>
              </div>

              <div className={styles.group}>
                <span className={styles.group__title}>
                  Скрытые слои ({hidden.length})
                </span>
                <div className={styles.layers}>
                  {hidden.map((u, i) => (
                    <input
                      key={i}
                      type="number"
                      min={1}
                      max={16}
                      value={u}
                      disabled={isTraining}
                      className={styles.num}
                      onChange={(e) =>
                        setLayer(i, parseInt(e.target.value) || 1)
                      }
                    />
                  ))}
                  <button
                    className={styles.mini}
                    onClick={removeLayer}
                    disabled={isTraining}
                  >
                    −
                  </button>
                  <button
                    className={styles.mini}
                    onClick={addLayer}
                    disabled={isTraining}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className={styles.group}>
                <label className={styles.field}>
                  Активация
                  <select
                    value={activation}
                    disabled={isTraining}
                    onChange={(e) =>
                      setActivation(e.target.value as Activation)
                    }
                  >
                    {ACTIVATIONS.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={styles.field}>
                  Learning rate
                  <select
                    value={lr}
                    disabled={isTraining}
                    onChange={(e) => setLr(parseFloat(e.target.value))}
                  >
                    {LR_OPTIONS.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={styles.field}>
                  Размер батча
                  <select
                    value={batchSize}
                    disabled={isTraining}
                    onChange={(e) => setBatchSize(parseInt(e.target.value))}
                  >
                    {BATCH_OPTIONS.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={styles.field}>
                  Эпох
                  <input
                    type="number"
                    min={1}
                    max={300}
                    value={epochs}
                    disabled={isTraining}
                    className={styles.num}
                    onChange={(e) => setEpochs(parseInt(e.target.value) || 1)}
                  />
                </label>
                <label className={styles.check}>
                  <input
                    type="checkbox"
                    checked={earlyStop}
                    disabled={isTraining}
                    onChange={(e) => setEarlyStop(e.target.checked)}
                  />
                  Ранняя остановка
                </label>
                <label className={styles.check}>
                  <input
                    type="checkbox"
                    checked={showTest}
                    onChange={(e) => setShowTest(e.target.checked)}
                  />
                  Показывать тестовые данные
                </label>
              </div>

              {tfError && (
                <p className={styles.statusError} role="alert">
                  {tfError}
                </p>
              )}
              {!tfError && !tfReady && (
                <p className={styles.statusInfo} role="status">
                  Загрузка вычислительного движка…
                </p>
              )}
              {trainError && (
                <p className={styles.statusError} role="alert">
                  {trainError}
                </p>
              )}

              {isTraining ? (
                <Button type="button" color="outline-blue" onClick={stop}>
                  Остановить
                </Button>
              ) : (
                <Button
                  type="button"
                  color="filled"
                  onClick={train}
                  isDisabled={!tfReady || !!tfError}
                >
                  {!tfReady && !tfError ? "Подготовка…" : "Обучить"}
                </Button>
              )}

              {modelReady && !isTraining && (
                <div className={styles.group}>
                  <span className={styles.group__title}>
                    Скачать обученную модель
                  </span>
                  <label className={styles.field}>
                    Формат
                    <select
                      value={downloadFormat}
                      onChange={(e) =>
                        setDownloadFormat(e.target.value as ModelFormat)
                      }
                    >
                      <option value="tfjs">TensorFlow.js (.json + .bin)</option>
                      <option value="json">Единый JSON (архитектура + веса)</option>
                      <option value="keras">Keras / Python (.py)</option>
                      <option value="h5">Keras HDF5 (.h5 через Python)</option>
                    </select>
                  </label>
                  <p className={styles.upload__hint}>
                    {downloadFormat === "tfjs" &&
                      "Два файла (.json + .bin) + HTML-скрипт использования. Грузится через tf.loadLayersModel()."}
                    {downloadFormat === "json" &&
                      "Один читаемый файл (архитектура + веса) + JS-скрипт использования."}
                    {downloadFormat === "keras" &&
                      "Python-скрипт: воссоздаёт сеть на Keras, проставляет веса и содержит пример predict()."}
                    {downloadFormat === "h5" &&
                      "Браузер не пишет HDF5 напрямую: скачивается Python-скрипт, который создаёт настоящий .h5 (load_model)."}
                  </p>
                  <Button
                    type="button"
                    color="outline-blue"
                    onClick={downloadModel}
                  >
                    ⬇ Скачать модель
                  </Button>
                </div>
              )}
            </aside>

            <div className={styles.viz}>
              <div className={styles.board}>
                <canvas
                  ref={canvasRef}
                  width={SIZE}
                  height={SIZE}
                  className={styles.canvas}
                />
                <div className={styles.legend}>
                  {Array.from({ length: numClasses }, (_, c) => (
                    <span key={c}>
                      <i style={{ background: classColor(c) }} /> класс {c}
                    </span>
                  ))}
                  {showTest && (
                    <span>
                      <i
                        style={{
                          background: "#cbd5e1",
                          border: "2px solid #111827",
                        }}
                      />{" "}
                      тест
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.chart}>
                <div className={styles.chart__stats}>
                  <span>
                    Эпоха: {history.loss.length}/{epochs}
                    {stopped ? " (стоп)" : ""}
                  </span>
                  {lastAcc !== undefined && (
                    <span style={{ color: "#16a34a" }}>
                      train acc: {(lastAcc * 100).toFixed(1)}%
                    </span>
                  )}
                  {lastValAcc !== undefined && (
                    <span style={{ color: "#16a34a" }}>
                      test acc: {(lastValAcc * 100).toFixed(1)}%
                    </span>
                  )}
                  {gap !== undefined && Math.abs(gap) >= 0.05 && (
                    <span style={{ color: gap > 8 ? "#dc2626" : "#64748b" }}>
                      разрыв: {gap.toFixed(1)}%
                    </span>
                  )}
                </div>
                <svg ref={chartRef} className={styles.chart__svg} />
                <div className={styles["chart__legend"]}>
                  <span>
                    <i style={{ borderColor: "#ef4444" }} /> train loss
                    {lastLoss !== undefined ? ` (${lastLoss.toFixed(3)})` : ""}
                  </span>
                  <span>
                    <i
                      style={{
                        borderColor: "#ef4444",
                        borderTopStyle: "dashed",
                      }}
                    />{" "}
                    test loss
                    {lastValLoss !== undefined
                      ? ` (${lastValLoss.toFixed(3)})`
                      : ""}
                  </span>
                  <span>
                    <i style={{ borderColor: "#16a34a" }} /> train acc
                  </span>
                  <span>
                    <i
                      style={{
                        borderColor: "#16a34a",
                        borderTopStyle: "dashed",
                      }}
                    />{" "}
                    test acc
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Playground;
