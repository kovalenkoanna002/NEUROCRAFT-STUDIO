import React, { useEffect, useState } from "react";
import styles from "./FeatureAnimations.module.scss";

type NetNode = { x: number; y: number; layer: number };
type NetLink = { x1: number; y1: number; x2: number; y2: number };

const makeNet = (
  counts: number[],
  w: number,
  h: number,
  padx: number
): { nodes: NetNode[]; links: NetLink[] } => {
  const nodes: NetNode[] = [];
  counts.forEach((count, li) => {
    const x = padx + (li * (w - 2 * padx)) / (counts.length - 1);
    for (let i = 0; i < count; i++) {
      nodes.push({ x, y: (h * (i + 1)) / (count + 1), layer: li });
    }
  });
  const links: NetLink[] = [];
  for (let li = 0; li < counts.length - 1; li++) {
    const from = nodes.filter((n) => n.layer === li);
    const to = nodes.filter((n) => n.layer === li + 1);
    from.forEach((a) =>
      to.forEach((b) => links.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y }))
    );
  }
  return { nodes, links };
};

const NetDiagram: React.FC<{
  nodes: NetNode[];
  links: NetLink[];
  active: number;
  w: number;
  h: number;
  layerLabels: string[];
  label: string;
}> = ({ nodes, links, active, w, h, layerLabels, label }) => {
  const layerCount = layerLabels.length;

  const layerX = layerLabels.map(
    (_, li) => nodes.find((n) => n.layer === li)?.x ?? 0
  );
  return (
    <svg
      className={styles.c2a__net}
      viewBox={`0 0 ${w} ${h + 24}`}
      role="img"
      aria-label={label}
    >
      {links.map((l, i) => (
        <line
          key={i}
          className={styles.net__link}
          x1={l.x1}
          y1={l.y1}
          x2={l.x2}
          y2={l.y2}
          style={{ animationDelay: `${(i % 9) * 0.1}s` }}
        />
      ))}
      {nodes.map((n, i) => {
        const on = n.layer === active;
        const isOut = n.layer === layerCount - 1;
        return (
          <g key={i}>
            {on && (
              <circle className={styles.c2a__glow} cx={n.x} cy={n.y} r={10} />
            )}
            <circle
              className={`${styles.c2a__neuron} ${
                isOut ? styles["c2a__neuron--out"] : ""
              } ${on ? styles["c2a__neuron--on"] : ""}`}
              cx={n.x}
              cy={n.y}
              r={10}
            />
          </g>
        );
      })}
      {layerLabels.map((lbl, li) => {
        const isOut = li === layerCount - 1;
        const isIn = li === 0;
        return (
          <text
            key={li}
            x={layerX[li]}
            y={h + 14}
            textAnchor="middle"
            className={`${styles.c2a__netlabel} ${
              isOut ? styles["c2a__netlabel--out"] : ""
            } ${li === active ? styles["c2a__netlabel--on"] : ""}`}
          >
            {isIn ? "Input" : lbl}
          </text>
        );
      })}
    </svg>
  );
};

const useLayerCycle = (count: number, ms = 1100): number => {
  const [active, setActive] = useState(0);
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const step = () => {
      if (cancelled) return;
      timer = setTimeout(() => {
        setActive((a) => (a + 1) % count);
        step();
      }, ms);
    };
    step();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [count, ms]);
  return active;
};

const CodePanel: React.FC<{
  lines: { text: string; layer?: number }[];
  active: number;
}> = ({ lines, active }) => (
  <div className={styles.c2a__code}>
    {lines.map((ln, i) => (
      <div
        key={i}
        className={`${styles.c2a__line} ${
          ln.layer === active ? styles["c2a__line--active"] : ""
        }`}
      >
        {ln.text}
      </div>
    ))}
  </div>
);

const VIZ_CODE: { text: string; layer?: number }[] = [
  { text: "model = Sequential([" },
  { text: "  Input(shape=(3,))", layer: 0 },
  { text: "  Dense(5, 'relu')", layer: 1 },
  { text: "  Dense(4, 'relu')", layer: 2 },
  { text: "  Dense(2, 'softmax')", layer: 3 },
  { text: "])" },
];
const VIZ_NET = makeNet([3, 5, 4, 2], 300, 230, 34);

export const NetworkAnim: React.FC = () => {
  const active = useLayerCycle(4);
  return (
    <div className={`${styles.device} ${styles.c2a}`}>
      <div className={styles.c2a__row}>
        <CodePanel lines={VIZ_CODE} active={active} />
        <div className={styles.c2a__arrow} aria-hidden="true">
          →
        </div>
        <NetDiagram
          {...VIZ_NET}
          active={active}
          w={300}
          h={230}
          layerLabels={["Input", "Dense", "Dense", "Output"]}
          label="Архитектура сети, построенная по коду"
        />
      </div>
      <p className={styles.caption}>
        Платформа <b>разбирает ваш код</b> и строит по нему наглядную схему сети —
        каждая строка превращается в слой.
      </p>
    </div>
  );
};

const GEN_NET = makeNet([4, 6, 3], 300, 230, 34);
const GEN_CODE: { text: string; layer?: number }[] = [
  { text: "model = Sequential([" },
  { text: "  Input(4)", layer: 0 },
  { text: "  Dense(6, 'relu')", layer: 1 },
  { text: "  Dense(3, 'softmax')", layer: 2 },
  { text: "])" },
];

export const CodeGenAnim: React.FC = () => {
  const active = useLayerCycle(3);
  return (
    <div className={`${styles.device} ${styles.c2a}`}>
      <div className={styles.c2a__row}>
        <NetDiagram
          {...GEN_NET}
          active={active}
          w={300}
          h={230}
          layerLabels={["Input", "Dense", "Output"]}
          label="Архитектура сети, по которой генерируется код"
        />
        <div className={styles.c2a__arrow} aria-hidden="true">
          →
        </div>
        <CodePanel lines={GEN_CODE} active={active} />
      </div>
      <p className={styles.caption}>
        По <b>собранной архитектуре</b> сразу генерируется код — каждый слой
        превращается в строку (Keras, PyTorch, TensorFlow.js).
      </p>
    </div>
  );
};

type EdLayer = { id: string; name: string; sub: string; color: string };
const ED_FRAMES: { badge: string; layers: EdLayer[] }[] = [
  {
    badge: "🎨 меняйте цвет слоёв",
    layers: [
      { id: "in", name: "Input", sub: "784", color: "#2563EB" },
      { id: "d1", name: "Dense", sub: "128 · relu", color: "#16A34A" },
      { id: "out", name: "Output", sub: "10 · softmax", color: "#DC2626" },
    ],
  },
  {
    badge: "🎨 цвет изменён",
    layers: [
      { id: "in", name: "Input", sub: "784", color: "#2563EB" },
      { id: "d1", name: "Dense", sub: "128 · relu", color: "#7C3AED" },
      { id: "out", name: "Output", sub: "10 · softmax", color: "#DC2626" },
    ],
  },
  {
    badge: "＋ слой добавлен",
    layers: [
      { id: "in", name: "Input", sub: "784", color: "#2563EB" },
      { id: "d1", name: "Dense", sub: "128 · relu", color: "#7C3AED" },
      { id: "d2", name: "Dense", sub: "64 · relu", color: "#0891B2" },
      { id: "out", name: "Output", sub: "10 · softmax", color: "#DC2626" },
    ],
  },
  {
    badge: "✕ слой удалён",
    layers: [
      { id: "in", name: "Input", sub: "784", color: "#2563EB" },
      { id: "d1", name: "Dense", sub: "128 · relu", color: "#7C3AED" },
      { id: "out", name: "Output", sub: "10 · softmax", color: "#DC2626" },
    ],
  },
];

export const EditorAnim: React.FC = () => {
  const step = useLayerCycle(ED_FRAMES.length, 1800);
  const frame = ED_FRAMES[step];

  return (
    <div className={styles.device}>
      <div className={styles.ed}>
        <div className={styles.ed__badgewrap}>
          <span key={step} className={styles.ed__badge}>
            {frame.badge}
          </span>
        </div>

        <div className={styles.ed__list}>
          {frame.layers.map((l) => (
            <span
              key={l.id}
              className={styles.ed__chip}
              style={{ borderColor: l.color, background: `${l.color}14` }}
            >
              <span
                className={styles.ed__swatch}
                style={{ background: l.color }}
              />
              <span className={styles.ed__name} style={{ color: l.color }}>
                {l.name}
              </span>
              <span className={styles.ed__sub}>{l.sub}</span>
              <span className={styles.ed__del} aria-hidden="true">
                ×
              </span>
            </span>
          ))}
        </div>

        <div className={styles.ed__add} aria-hidden="true">
          ＋ Добавить слой
        </div>
      </div>

      <p className={styles.caption}>
        В визуальном редакторе можно <b>добавлять и удалять слои</b> и{" "}
        <b>менять их цвета</b> — настраивайте сеть как удобно.
      </p>
    </div>
  );
};

const KB_CARDS = [
  { title: "Свёрточные сети", term: false, delay: 0 },
  { title: "Функции активации", term: true, delay: 0.5 },
  { title: "Градиентный спуск", term: false, delay: 1 },
];

export const KnowledgeAnim: React.FC = () => (
  <div className={styles.device}>
    <div className={styles.kb}>
      {KB_CARDS.map((c, i) => (
        <div
          key={i}
          className={styles.kb__card}
          style={{ animationDelay: `${c.delay}s` }}
        >
          <div className={styles.kb__title}>
            {c.term ? (
              <>
                Функции <mark>активации</mark>
              </>
            ) : (
              c.title
            )}
          </div>
          <div className={styles.kb__line} />
          <div className={`${styles.kb__line} ${styles["kb__line--short"]}`} />
          {c.term && (
            <span className={styles.kb__tip}>
              ReLU, sigmoid, tanh, softmax →
            </span>
          )}
        </div>
      ))}
    </div>
    <p className={styles.caption}>
      <b>140 статей</b> с интерактивом и подсказками по терминам прямо в
      интерфейсе.
    </p>
  </div>
);

const PG_EPOCHS = 20;
const PG_LOSS = Array.from({ length: PG_EPOCHS + 1 }, (_, i) =>
  Number((1.15 * Math.exp(-i / 6) + 0.06).toFixed(3))
);
const PG_ACC = Array.from({ length: PG_EPOCHS + 1 }, (_, i) =>
  Math.round((1 - Math.exp(-i / 5)) * 97)
);
const PG_W = 320;
const PG_H = 150;
const PG_PADL = 10;
const PG_PADR = 10;
const PG_PADT = 12;
const PG_PADB = 16;
const PG_MAXLOSS = PG_LOSS[0];
const pgX = (i: number) =>
  PG_PADL + (i / PG_EPOCHS) * (PG_W - PG_PADL - PG_PADR);
const pgY = (v: number) =>
  PG_PADT + (1 - v / PG_MAXLOSS) * (PG_H - PG_PADT - PG_PADB);

export const PlaygroundAnim: React.FC = () => {
  const [t, setT] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      if (cancelled) return;
      setT((prev) => {
        if (prev >= PG_EPOCHS) {
          timer = setTimeout(() => {
            setT(0);
            timer = setTimeout(tick, 240);
          }, 1300);
          return prev;
        }
        timer = setTimeout(tick, 240);
        return prev + 1;
      });
    };
    timer = setTimeout(tick, 240);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  const pts = PG_LOSS.slice(0, t + 1)
    .map((v, i) => `${pgX(i)},${pgY(v)}`)
    .join(" ");
  const areaPts =
    `${pgX(0)},${pgY(0)} ` +
    pts +
    ` ${pgX(t)},${PG_H - PG_PADB} ${pgX(0)},${PG_H - PG_PADB}`;

  return (
    <div className={`${styles.device} ${styles.pg}`}>
      <div className={styles.pg__head}>
        <span className={styles.pg__he0}>Обучение в браузере</span>
        <span className={styles.pg__epoch}>
          эпоха {t}/{PG_EPOCHS}
        </span>
      </div>

      <svg
        className={styles.pg__chart}
        viewBox={`0 0 ${PG_W} ${PG_H}`}
        role="img"
        aria-label="График падения ошибки при обучении"
      >
        {}
        <line
          x1={PG_PADL}
          y1={PG_H - PG_PADB}
          x2={PG_W - PG_PADR}
          y2={PG_H - PG_PADB}
          className={styles.pg__axis}
        />
        {t > 0 && (
          <>
            <polygon className={styles.pg__area} points={areaPts} />
            <polyline className={styles.pg__curve} points={pts} />
            <circle
              className={styles.pg__dot}
              cx={pgX(t)}
              cy={pgY(PG_LOSS[t])}
              r={5}
            />
          </>
        )}
        <text x={PG_PADL} y={PG_PADT} className={styles.pg__axislabel}>
          loss
        </text>
      </svg>

      <div className={styles.pg__metrics}>
        <span className={styles.pg__metric}>
          loss <b>{PG_LOSS[t].toFixed(2)}</b>
        </span>
        <div className={styles.pg__bar}>
          <span
            className={styles.pg__barfill}
            style={{ width: `${PG_ACC[t]}%` }}
          />
        </div>
        <span className={styles.pg__metric}>
          точность <b>{PG_ACC[t]}%</b>
        </span>
      </div>

      <p className={styles.caption}>
        <b>Обучайте сети прямо в браузере</b> — следите за падением ошибки и
        ростом точности в реальном времени (на TensorFlow.js).
      </p>
    </div>
  );
};
