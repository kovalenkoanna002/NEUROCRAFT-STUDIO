
export interface Dataset {
  points: [number, number][];
  labels: number[];
}

export type DatasetKey =
  | "xor"
  | "circle"
  | "spiral"
  | "gauss"
  | "blobs3"
  | "blobs4"
  | "custom";

export const DATASET_LABELS: Record<DatasetKey, string> = {
  xor: "XOR",
  circle: "Кольца",
  spiral: "Спирали",
  gauss: "Два кластера",
  blobs3: "3 класса",
  blobs4: "4 класса",
  custom: "Свои данные",
};

export const MAX_CLASSES = 6;

export const classCount = (d: Dataset): number =>
  d.labels.length ? Math.max(2, Math.max(...d.labels) + 1) : 2;

const rand = (a: number, b: number) => Math.random() * (b - a) + a;

function xor(n: number, noise: number): Dataset {
  const points: [number, number][] = [];
  const labels: number[] = [];
  for (let i = 0; i < n; i++) {
    const x = rand(-1, 1);
    const y = rand(-1, 1);
    const label = x > 0 !== y > 0 ? 1 : 0;
    points.push([x + rand(-noise, noise), y + rand(-noise, noise)]);
    labels.push(label);
  }
  return { points, labels };
}

function circle(n: number, noise: number): Dataset {
  const points: [number, number][] = [];
  const labels: number[] = [];
  for (let i = 0; i < n; i++) {
    const label = i % 2;
    const r = label === 0 ? rand(0, 0.45) : rand(0.6, 1);
    const a = rand(0, Math.PI * 2);
    points.push([
      r * Math.cos(a) + rand(-noise, noise),
      r * Math.sin(a) + rand(-noise, noise),
    ]);
    labels.push(label);
  }
  return { points, labels };
}

function spiral(n: number, noise: number): Dataset {
  const points: [number, number][] = [];
  const labels: number[] = [];
  const arm = Math.floor(n / 2);
  for (let s = 0; s < 2; s++) {
    for (let i = 0; i < arm; i++) {
      const t = (i / arm) * 3.5;
      const a = t * 2 + s * Math.PI;
      points.push([
        t * Math.cos(a) * 0.28 + rand(-noise, noise),
        t * Math.sin(a) * 0.28 + rand(-noise, noise),
      ]);
      labels.push(s);
    }
  }
  return { points, labels };
}

function gauss(n: number, noise: number): Dataset {
  const points: [number, number][] = [];
  const labels: number[] = [];
  const g = () => (rand(0, 1) + rand(0, 1) + rand(0, 1) - 1.5) * 0.5;
  for (let i = 0; i < n; i++) {
    const label = i % 2;
    const cx = label === 0 ? -0.5 : 0.5;
    const cy = label === 0 ? -0.5 : 0.5;
    points.push([cx + g() + rand(-noise, noise), cy + g() + rand(-noise, noise)]);
    labels.push(label);
  }
  return { points, labels };
}

function blobs(n: number, noise: number, k: number): Dataset {
  const points: [number, number][] = [];
  const labels: number[] = [];
  const g = () => (rand(0, 1) + rand(0, 1) + rand(0, 1) - 1.5) * 0.4;
  for (let i = 0; i < n; i++) {
    const label = i % k;
    const a = (label / k) * Math.PI * 2;
    const cx = Math.cos(a) * 0.6;
    const cy = Math.sin(a) * 0.6;
    points.push([
      cx + g() + rand(-noise, noise),
      cy + g() + rand(-noise, noise),
    ]);
    labels.push(label);
  }
  return { points, labels };
}

export function generateDataset(
  key: DatasetKey,
  n = 240,
  noise = 0.05
): Dataset {
  switch (key) {
    case "circle":
      return circle(n, noise);
    case "spiral":
      return spiral(n, noise);
    case "gauss":
      return gauss(n, noise);
    case "blobs3":
      return blobs(n, noise, 3);
    case "blobs4":
      return blobs(n, noise, 4);
    default:
      return xor(n, noise);
  }
}

export const CUSTOM_DATASET_LIMIT = 2000;

export const SAMPLE_CSV = `x,y,class
-0.8,-0.7,0
0.7,0.8,0
-0.6,0.75,1
0.65,-0.6,1
-0.9,-0.4,0
0.85,0.5,0
-0.5,0.9,1
0.55,-0.85,1`;

export function parseDatasetFile(text: string): Dataset {
  const rows = text
    .trim()
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => line.split(/[,;\t ]+/));

  const parsed: { x: number; y: number; raw: string }[] = [];
  for (const cols of rows) {
    if (cols.length < 3) continue;
    const x = parseFloat(cols[0]);
    const y = parseFloat(cols[1]);

    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    parsed.push({ x, y, raw: cols[2] });
  }

  if (parsed.length < 4) {
    throw new Error(
      "Не удалось прочитать данные. Нужно минимум 4 строки вида «x, y, класс»."
    );
  }
  if (parsed.length > CUSTOM_DATASET_LIMIT) {
    throw new Error(
      `Слишком много точек (${parsed.length}). Максимум — ${CUSTOM_DATASET_LIMIT}.`
    );
  }

  const uniq = Array.from(new Set(parsed.map((p) => p.raw)));
  if (uniq.length < 2) {
    throw new Error("В данных только один класс — нужно минимум два класса.");
  }
  if (uniq.length > MAX_CLASSES) {
    throw new Error(
      `Слишком много классов (${uniq.length}). Максимум — ${MAX_CLASSES}.`
    );
  }

  const bothNumeric = uniq.every((v) => Number.isFinite(parseFloat(v)));
  const sorted = [...uniq].sort((a, b) =>
    bothNumeric ? parseFloat(a) - parseFloat(b) : a.localeCompare(b)
  );
  const labelOf = (raw: string) => sorted.indexOf(raw);

  const xsArr = parsed.map((p) => p.x);
  const ysArr = parsed.map((p) => p.y);
  const xmin = Math.min(...xsArr);
  const xmax = Math.max(...xsArr);
  const ymin = Math.min(...ysArr);
  const ymax = Math.max(...ysArr);
  const norm = (v: number, min: number, max: number) =>
    max === min ? 0 : ((v - min) / (max - min)) * 2 - 1;

  const points: [number, number][] = parsed.map((p) => [
    norm(p.x, xmin, xmax),
    norm(p.y, ymin, ymax),
  ]);
  const labels = parsed.map((p) => labelOf(p.raw));
  return { points, labels };
}
