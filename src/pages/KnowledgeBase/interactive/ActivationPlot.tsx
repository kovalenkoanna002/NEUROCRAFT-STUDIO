import React, { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import styles from "./Interactive.module.scss";

type FnKey = "relu" | "leaky_relu" | "sigmoid" | "tanh" | "elu";

const FUNCS: Record<FnKey, { label: string; f: (x: number) => number; formula: string }> = {
  relu: { label: "ReLU", f: (x) => Math.max(0, x), formula: "f(x) = max(0, x)" },
  leaky_relu: {
    label: "Leaky ReLU",
    f: (x) => (x >= 0 ? x : 0.1 * x),
    formula: "f(x) = x при x ≥ 0, иначе 0.1·x",
  },
  sigmoid: {
    label: "Sigmoid",
    f: (x) => 1 / (1 + Math.exp(-x)),
    formula: "σ(x) = 1 / (1 + e⁻ˣ)",
  },
  tanh: { label: "Tanh", f: (x) => Math.tanh(x), formula: "f(x) = tanh(x)" },
  elu: {
    label: "ELU",
    f: (x) => (x >= 0 ? x : Math.exp(x) - 1),
    formula: "f(x) = x при x ≥ 0, иначе eˣ − 1",
  },
};

const ActivationPlot: React.FC = () => {
  const [fn, setFn] = useState<FnKey>("relu");
  const [x, setX] = useState(1.5);
  const svgRef = useRef<SVGSVGElement>(null);

  const fy = useMemo(() => FUNCS[fn].f(x), [fn, x]);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 420;
    const height = 280;
    const m = { top: 16, right: 16, bottom: 28, left: 36 };
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const xs = d3.scaleLinear([-6, 6], [m.left, width - m.right]);
    const ys = d3.scaleLinear([-1.4, 6], [height - m.bottom, m.top]);

    svg
      .append("line")
      .attr("x1", m.left)
      .attr("x2", width - m.right)
      .attr("y1", ys(0))
      .attr("y2", ys(0))
      .attr("stroke", "#cbd5e1");
    svg
      .append("line")
      .attr("x1", xs(0))
      .attr("x2", xs(0))
      .attr("y1", m.top)
      .attr("y2", height - m.bottom)
      .attr("stroke", "#cbd5e1");

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

    const data = d3.range(-6, 6.05, 0.1).map((v) => ({ x: v, y: FUNCS[fn].f(v) }));
    const line = d3
      .line<{ x: number; y: number }>()
      .x((d) => xs(d.x))
      .y((d) => ys(d.y));
    svg
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#1d4ed8")
      .attr("stroke-width", 2.5)
      .attr("d", line);

    svg
      .append("line")
      .attr("x1", xs(x))
      .attr("x2", xs(x))
      .attr("y1", ys(0))
      .attr("y2", ys(FUNCS[fn].f(x)))
      .attr("stroke", "#ef4444")
      .attr("stroke-dasharray", "4 3");
    svg
      .append("circle")
      .attr("cx", xs(x))
      .attr("cy", ys(FUNCS[fn].f(x)))
      .attr("r", 5)
      .attr("fill", "#ef4444");
  }, [fn, x]);

  return (
    <div className={styles.box}>
      <div className={styles.box__tabs}>
        {(Object.keys(FUNCS) as FnKey[]).map((k) => (
          <button
            key={k}
            className={`${styles.tab} ${fn === k ? styles["tab--active"] : ""}`}
            onClick={() => setFn(k)}
          >
            {FUNCS[k].label}
          </button>
        ))}
      </div>
      <p className={styles.box__formula}>{FUNCS[fn].formula}</p>
      <svg ref={svgRef} className={styles.box__svg} />
      <div className={styles.box__control}>
        <label>
          x = {x.toFixed(2)}
          <input
            type="range"
            min={-6}
            max={6}
            step={0.1}
            value={x}
            onChange={(e) => setX(parseFloat(e.target.value))}
          />
        </label>
        <span className={styles.box__value}>
          f(x) = <b>{fy.toFixed(3)}</b>
        </span>
      </div>
    </div>
  );
};

export default ActivationPlot;
