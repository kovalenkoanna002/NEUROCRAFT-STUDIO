import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import styles from "./Interactive.module.scss";

const f = (x: number) => x * x;
const grad = (x: number) => 2 * x;

const GradientDescentDemo: React.FC = () => {
  const [lr, setLr] = useState(0.1);
  const [x, setX] = useState(4.5);
  const [steps, setSteps] = useState(0);
  const [playing, setPlaying] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const step = () => {
    setX((prev) => {
      const next = prev - lr * grad(prev);
      return Math.abs(next) > 6 ? Math.sign(next) * 6 : next;
    });
    setSteps((s) => s + 1);
  };

  const reset = () => {
    setPlaying(false);
    setX(4.5);
    setSteps(0);
  };

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(step, 500);
    return () => clearInterval(id);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, lr]);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    const width = 420;
    const height = 280;
    const m = { top: 16, right: 16, bottom: 28, left: 36 };
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const xs = d3.scaleLinear([-6, 6], [m.left, width - m.right]);
    const ys = d3.scaleLinear([0, 36], [height - m.bottom, m.top]);

    svg
      .append("g")
      .attr("transform", `translate(0,${height - m.bottom})`)
      .call(d3.axisBottom(xs).ticks(6))
      .attr("color", "#94a3b8");
    svg
      .append("g")
      .attr("transform", `translate(${m.left},0)`)
      .call(d3.axisLeft(ys).ticks(5))
      .attr("color", "#94a3b8");

    const data = d3.range(-6, 6.05, 0.1).map((v) => ({ x: v, y: f(v) }));
    const line = d3
      .line<{ x: number; y: number }>()
      .x((d) => xs(d.x))
      .y((d) => ys(d.y));
    svg
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#94a3b8")
      .attr("stroke-width", 2)
      .attr("d", line);

    svg
      .append("circle")
      .attr("cx", xs(x))
      .attr("cy", ys(f(x)))
      .attr("r", 8)
      .attr("fill", "#1d4ed8")
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);
  }, [x]);

  return (
    <div className={styles.box}>
      <svg ref={svgRef} className={styles.box__svg} />
      <div className={styles.box__control}>
        <label>
          learning rate = {lr.toFixed(2)}
          <input
            type="range"
            min={0.01}
            max={1.05}
            step={0.01}
            value={lr}
            onChange={(e) => setLr(parseFloat(e.target.value))}
          />
        </label>
      </div>
      <div className={styles.box__control}>
        <button className={styles.tab} onClick={() => setPlaying((p) => !p)}>
          {playing ? "⏸ Пауза" : "▶ Запуск"}
        </button>
        <button className={styles.tab} onClick={step}>
          Шаг →
        </button>
        <button className={styles.tab} onClick={reset}>
          Сброс
        </button>
        <span className={styles.box__value}>
          шаг {steps} · x = <b>{x.toFixed(3)}</b> · f(x) ={" "}
          <b>{f(x).toFixed(3)}</b>
        </span>
      </div>
      {lr > 1 && (
        <p className={styles.box__warn}>
          ⚠️ При learning rate &gt; 1 шаги слишком большие — спуск расходится.
        </p>
      )}
    </div>
  );
};

export default GradientDescentDemo;
