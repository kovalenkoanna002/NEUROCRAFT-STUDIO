import React from "react";
import styles from "./AboutSection.module.scss";
import { AutoGlossary } from "../../../components/GlossaryTerm/GlossaryTerm";

const ScreenDefs: React.FC = () => (
  <svg
    width="0"
    height="0"
    aria-hidden="true"
    style={{ position: "absolute" }}
  >
    <defs>
      <linearGradient id="pgScreen" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#0b1640" />
        <stop offset="1" stopColor="#142a73" />
      </linearGradient>
      <linearGradient id="pgArea" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#6ea8ff" stopOpacity="0.45" />
        <stop offset="1" stopColor="#6ea8ff" stopOpacity="0" />
      </linearGradient>
    </defs>
  </svg>
);

const Screen: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg
    className={styles["about__card-img"]}
    width="170"
    height="165"
    viewBox="0 0 170 165"
    fill="none"
    aria-hidden="true"
  >
    <rect
      x="6"
      y="14"
      width="158"
      height="138"
      rx="14"
      fill="url(#pgScreen)"
      stroke="rgba(255,255,255,0.35)"
      strokeWidth="1.5"
    />
    <circle cx="20" cy="28" r="3" fill="#ff6b6b" />
    <circle cx="31" cy="28" r="3" fill="#ffd166" />
    <circle cx="42" cy="28" r="3" fill="#4ade80" />
    {children}
  </svg>
);

const NetIllu: React.FC = () => {
  const cols = [
    { x: 42, ys: [60, 92, 124] },
    { x: 86, ys: [60, 92, 124] },
    { x: 130, ys: [76, 108] },
  ];
  const links: number[][] = [];
  for (let i = 0; i < cols.length - 1; i++) {
    cols[i].ys.forEach((y1) =>
      cols[i + 1].ys.forEach((y2) =>
        links.push([cols[i].x, y1, cols[i + 1].x, y2])
      )
    );
  }
  return (
    <>
      {links.map((l, i) => (
        <line
          key={i}
          x1={l[0]}
          y1={l[1]}
          x2={l[2]}
          y2={l[3]}
          stroke="rgba(126,182,255,0.35)"
          strokeWidth="1"
        />
      ))}
      {cols.flatMap((c, ci) =>
        c.ys.map((y, i) => (
          <circle
            key={`${ci}-${i}`}
            cx={c.x}
            cy={y}
            r="5"
            fill={ci === cols.length - 1 ? "#7eb6ff" : "#cfe2ff"}
            stroke="#0b1640"
            strokeWidth="1"
          />
        ))
      )}
    </>
  );
};

const EditorIllu: React.FC = () => (
  <>
    {[
      { y: 50, c: "#7eb6ff" },
      { y: 74, c: "#4ade80" },
      { y: 98, c: "#ff9f6b" },
    ].map((r, i) => (
      <g key={i}>
        <rect
          x="38"
          y={r.y}
          width="94"
          height="18"
          rx="5"
          fill="rgba(255,255,255,0.08)"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="1"
        />
        <circle cx="48" cy={r.y + 9} r="4" fill={r.c} />
        <rect
          x="58"
          y={r.y + 5}
          width="50"
          height="3"
          rx="1.5"
          fill="rgba(255,255,255,0.5)"
        />
        <rect
          x="58"
          y={r.y + 11}
          width="30"
          height="2.5"
          rx="1.25"
          fill="rgba(255,255,255,0.3)"
        />
      </g>
    ))}
    <rect
      x="48"
      y="124"
      width="74"
      height="16"
      rx="8"
      fill="none"
      stroke="rgba(126,182,255,0.8)"
      strokeWidth="1.2"
      strokeDasharray="3 3"
    />
    <text
      x="85"
      y="135"
      textAnchor="middle"
      fill="rgba(255,255,255,0.8)"
      fontSize="9"
      fontFamily="Montserrat, sans-serif"
    >
      ＋ слой
    </text>
  </>
);

const CodeIllu: React.FC = () => {
  const rows: { x: number; w: number; c: string }[][] = [
    [
      { x: 38, w: 16, c: "#c4b5fd" },
      { x: 58, w: 48, c: "rgba(255,255,255,0.7)" },
    ],
    [{ x: 48, w: 54, c: "#6ee7b7" }],
    [
      { x: 48, w: 34, c: "#7eb6ff" },
      { x: 86, w: 22, c: "rgba(255,255,255,0.6)" },
    ],
    [{ x: 48, w: 40, c: "#6ee7b7" }],
    [{ x: 38, w: 12, c: "#c4b5fd" }],
  ];
  return (
    <>
      {rows.map((row, ri) =>
        row.map((b, bi) => (
          <rect
            key={`${ri}-${bi}`}
            x={b.x}
            y={52 + ri * 16}
            width={b.w}
            height="6"
            rx="3"
            fill={b.c}
          />
        ))
      )}
    </>
  );
};

const KbIllu: React.FC = () => (
  <>
    <rect
      x="46"
      y="48"
      width="78"
      height="90"
      rx="6"
      fill="rgba(255,255,255,0.06)"
      stroke="rgba(255,255,255,0.4)"
      strokeWidth="1"
    />
    <rect x="56" y="58" width="46" height="7" rx="3" fill="#7eb6ff" />
    {[80, 92, 104, 116].map((y, i) => (
      <rect
        key={i}
        x="56"
        y={y}
        width={i % 2 ? 44 : 58}
        height="4"
        rx="2"
        fill="rgba(255,255,255,0.45)"
      />
    ))}
  </>
);

const TrainIllu: React.FC = () => (
  <>
    <line
      x1="22"
      y1="128"
      x2="150"
      y2="128"
      stroke="rgba(255,255,255,0.25)"
      strokeWidth="1.5"
    />
    <line
      x1="22"
      y1="48"
      x2="22"
      y2="128"
      stroke="rgba(255,255,255,0.25)"
      strokeWidth="1.5"
    />
    <polygon
      points="24,56 48,84 72,104 96,116 120,122 146,124 146,128 24,128"
      fill="url(#pgArea)"
    />
    <polyline
      points="24,56 48,84 72,104 96,116 120,122 146,124"
      fill="none"
      stroke="#7eb6ff"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="146" cy="124" r="4.5" fill="#fff" />
    <text
      x="58"
      y="31"
      fill="rgba(255,255,255,0.75)"
      fontSize="11"
      fontFamily="Montserrat, sans-serif"
    >
      loss ↓
    </text>
  </>
);

type Card = {
  title: string;
  desc: string;
  href: string;
  top: boolean;
  illu: React.ReactNode;
};

const CARDS: Card[] = [
  {
    title: "ВИЗУАЛИЗАЦИЯ АРХИТЕКТУРЫ",
    desc: "Постройте интерактивную схему вашей нейросети на основе кода PyTorch или TensorFlow.",
    href: "/",
    top: true,
    illu: <NetIllu />,
  },
  {
    title: "РЕДАКТОР НЕЙРОСЕТЕЙ",
    desc: "Создавайте и редактируйте архитектуры с помощью интуитивного графического редактора.",
    href: "/",
    top: false,
    illu: <EditorIllu />,
  },
  {
    title: "ГЕНЕРАЦИЯ КОДА",
    desc: "Экспортируйте готовый проект в код для PyTorch, TensorFlow и других фреймворков.",
    href: "/",
    top: true,
    illu: <CodeIllu />,
  },
  {
    title: "БАЗА ЗНАНИЙ",
    desc: "Изучайте статьи, гайды и примеры лучших практик по работе с нейросетями.",
    href: "/",
    top: false,
    illu: <KbIllu />,
  },
  {
    title: "ПЕСОЧНИЦА",
    desc: "Обучайте нейросети прямо в браузере на TensorFlow.js и следите за падением ошибки в реальном времени.",
    href: "/playground",
    top: true,
    illu: <TrainIllu />,
  },
];

const AboutSection: React.FC = () => {
  return (
    <section id="features" className={styles.about}>
      <ScreenDefs />
      <div className={styles.about__background}>
        <div className="container">
          <div className={styles.about__content}>
            <h2 className={styles.about__title}>ВОЗМОЖНОСТИ ПЛАТФОРМЫ</h2>
            <ul className={styles.about__list}>
              {CARDS.map((card) => (
                <li
                  key={card.title}
                  className={`${styles.about__item} ${
                    card.top ? styles["about__item--top"] : ""
                  }`}
                >
                  <a href={card.href} className={styles.about__card}>
                    <div className={styles["about__card-content"]}>
                      <h3 className={styles["about__card-title"]}>
                        {card.title}
                      </h3>
                      <p className={styles["about__card-description"]}>
                        <AutoGlossary>{card.desc}</AutoGlossary>
                      </p>
                    </div>
                    <Screen>{card.illu}</Screen>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
