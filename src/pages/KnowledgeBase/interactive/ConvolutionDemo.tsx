import React, { useEffect, useMemo, useState } from "react";
import styles from "./Interactive.module.scss";

const INPUT: number[][] = [
  [0, 0, 0, 9, 9, 9],
  [0, 0, 0, 9, 9, 9],
  [0, 0, 0, 9, 9, 9],
  [0, 0, 0, 9, 9, 9],
  [0, 0, 0, 9, 9, 9],
  [0, 0, 0, 9, 9, 9],
];

const KERNEL = [
  [1, 0, -1],
  [2, 0, -2],
  [1, 0, -1],
];

const N = INPUT.length;
const OUT = N - 2;

function convAt(r: number, c: number): number {
  let s = 0;
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++) s += INPUT[r + i][c + j] * KERNEL[i][j];
  return s;
}

const ConvolutionDemo: React.FC = () => {
  const [pos, setPos] = useState(0);
  const [playing, setPlaying] = useState(true);

  const out = useMemo(() => {
    const r = Math.floor(pos / OUT);
    const c = pos % OUT;
    return { r, c, value: convAt(r, c) };
  }, [pos]);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setPos((p) => (p + 1) % (OUT * OUT)), 700);
    return () => clearInterval(id);
  }, [playing]);

  const inWindow = (i: number, j: number) =>
    i >= out.r && i < out.r + 3 && j >= out.c && j < out.c + 3;

  const computed = (idx: number) => {
    const r = Math.floor(idx / OUT);
    const c = idx % OUT;
    return r < out.r || (r === out.r && c <= out.c);
  };

  return (
    <div className={styles.box}>
      <div className={styles.conv}>
        <div>
          <div className={styles.conv__caption}>Вход (6×6)</div>
          <div
            className={styles.conv__grid}
            style={{ gridTemplateColumns: `repeat(${N}, 30px)` }}
          >
            {INPUT.map((row, i) =>
              row.map((v, j) => (
                <div
                  key={`${i}-${j}`}
                  className={`${styles.cell} ${
                    inWindow(i, j) ? styles["cell--win"] : ""
                  }`}
                  style={{
                    background: `rgb(${255 - v * 28}, ${255 - v * 28}, ${
                      255 - v * 28
                    })`,
                    color: v > 4 ? "#fff" : "#334155",
                  }}
                >
                  {v}
                </div>
              ))
            )}
          </div>
        </div>

        <div className={styles.conv__kernel}>
          <div className={styles.conv__caption}>Ядро 3×3</div>
          <div
            className={styles.conv__grid}
            style={{ gridTemplateColumns: "repeat(3, 30px)" }}
          >
            {KERNEL.flat().map((v, i) => (
              <div key={i} className={`${styles.cell} ${styles["cell--k"]}`}>
                {v}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className={styles.conv__caption}>Карта признаков (4×4)</div>
          <div
            className={styles.conv__grid}
            style={{ gridTemplateColumns: `repeat(${OUT}, 34px)` }}
          >
            {Array.from({ length: OUT * OUT }).map((_, idx) => {
              const r = Math.floor(idx / OUT);
              const c = idx % OUT;
              const active = idx === pos;
              const done = computed(idx);
              return (
                <div
                  key={idx}
                  className={`${styles.cell} ${styles["cell--out"]} ${
                    active ? styles["cell--active"] : ""
                  }`}
                  style={{ opacity: done ? 1 : 0.25 }}
                >
                  {done ? convAt(r, c) : ""}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className={styles.box__control}>
        <button
          className={styles.tab}
          onClick={() => setPlaying((p) => !p)}
        >
          {playing ? "⏸ Пауза" : "▶ Запуск"}
        </button>
        <button
          className={styles.tab}
          onClick={() => {
            setPlaying(false);
            setPos((p) => (p + 1) % (OUT * OUT));
          }}
        >
          Шаг →
        </button>
        <span className={styles.box__value}>
          Сумма произведений = <b>{out.value}</b>
        </span>
      </div>
    </div>
  );
};

export default ConvolutionDemo;
