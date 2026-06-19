import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./GanArchitecture.module.css";
import Button from "../../components/Button/Button";
import { GlossaryTerm } from "../../components/GlossaryTerm/GlossaryTerm";
import { useAuth } from "../../auth/useAuth";
import { saveProject, GanSpec } from "../../auth/projects";
import {
  Framework,
  FRAMEWORK_LABELS,
  generateGanCode,
} from "../../api/mock/codegen";
import { drawGanDiagram } from "./drawGanDiagram";
import { useEditableLabels } from "../../hooks/useEditableLabels";
import { usePersistedState } from "../../hooks/usePersistedState";

interface Props {
  onGenerateCode: (code: string) => void;
  initialGan?: GanSpec;
  initialLabels?: Record<string, string>;
}

const DEFAULT: GanSpec = {
  latentDim: 100,
  dataDim: 784,
  generator: [128, 256],
  discriminator: [256, 128],
};

const denseParams = (sizes: number[]): number => {
  let total = 0;
  for (let i = 0; i < sizes.length - 1; i++) {
    total += sizes[i] * sizes[i + 1] + sizes[i + 1];
  }
  return total;
};

const GanArchitecture: React.FC<Props> = ({
  onGenerateCode,
  initialGan,
  initialLabels,
}) => {
  const init = initialGan ?? DEFAULT;

  const dk = (s: string) => (initialGan ? null : `neurocraft.draft.gan.${s}`);
  const [latentDim, setLatentDim] = usePersistedState(
    dk("latentDim"),
    init.latentDim
  );
  const [dataDim, setDataDim] = usePersistedState(dk("dataDim"), init.dataDim);
  const [gen, setGen] = usePersistedState<number[]>(dk("gen"), init.generator);
  const [disc, setDisc] = usePersistedState<number[]>(
    dk("disc"),
    init.discriminator
  );
  const [framework, setFramework] = usePersistedState<Framework>(
    dk("framework"),
    "keras"
  );
  const [savedMsg, setSavedMsg] = useState("");

  const [colors, setColors] = usePersistedState(dk("colors"), {
    gen: { start: "#ede9fe", end: "#7c3aed" },
    disc: { start: "#ccfbf1", end: "#0d9488" },
    data: { start: "#cffafe", end: "#0891b2" },
  });
  const [lineColor, setLineColor] = usePersistedState(dk("lineColor"), "#64748b");

  const [solidFill, setSolidFill] = usePersistedState(dk("solidFill"), false);
  const svgRef = useRef<SVGSVGElement>(null);
  const { enhance, overlay, getLabels } = useEditableLabels(
    svgRef,
    initialLabels,
    initialGan ? undefined : "neurocraft.draft.gan.labels"
  );
  const navigate = useNavigate();
  const { user } = useAuth();

  const spec: GanSpec = {
    latentDim,
    dataDim,
    generator: gen,
    discriminator: disc,
  };

  const genParams = denseParams([latentDim, ...gen, dataDim]);
  const discParams = denseParams([dataDim, ...disc, 1]);

  const editLayer = (
    list: number[],
    setList: (v: number[]) => void,
    i: number,
    v: number
  ) => setList(list.map((x, idx) => (idx === i ? v : x)));

  const insertAt = (list: number[], setList: (v: number[]) => void, i: number) =>
    list.length < 6 &&
    setList([...list.slice(0, i + 1), 64, ...list.slice(i + 1)]);

  const addLayer = (list: number[], setList: (v: number[]) => void) =>
    list.length < 6 && setList([...list, 64]);

  const removeAt = (list: number[], setList: (v: number[]) => void, i: number) =>
    list.length > 1 && setList(list.filter((_, idx) => idx !== i));

  const moveUnit = (
    list: number[],
    setList: (v: number[]) => void,
    i: number,
    dir: -1 | 1
  ) => {
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    const a = [...list];
    [a[i], a[j]] = [a[j], a[i]];
    setList(a);
  };

  const reset = () => {
    setLatentDim(DEFAULT.latentDim);
    setDataDim(DEFAULT.dataDim);
    setGen(DEFAULT.generator);
    setDisc(DEFAULT.discriminator);
  };

  const handleSave = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    const name = window.prompt("Название архитектуры:", "Моя GAN");
    if (!name) return;
    saveProject(user.id, {
      name,
      kind: "gan",
      layers: [],
      gan: spec,
      labels: getLabels(),
    });
    setSavedMsg("Сохранено в кабинет ✓");
    setTimeout(() => setSavedMsg(""), 2500);
  };

  const handleGenerate = () => onGenerateCode(generateGanCode(spec, framework));

  const handleSaveImage = () => {
    const svgElement = svgRef.current;
    if (!svgElement) return;
    const vb = svgElement.viewBox.baseVal;
    const w = vb.width || svgElement.clientWidth || 760;
    const h = vb.height || svgElement.clientHeight || 300;
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
      link.download = "gan_visualization.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    img.src =
      "data:image/svg+xml;base64," +
      btoa(unescape(encodeURIComponent(svgString)));
  };

  useEffect(() => {
    drawGanDiagram(svgRef.current, spec, { colors, lineColor, solidFill });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latentDim, dataDim, gen, disc, colors, lineColor, solidFill]);

  useEffect(() => {
    enhance(`gan:${gen.length}/${disc.length}`);
  }, [latentDim, dataDim, gen, disc, colors, lineColor, solidFill, enhance]);

  const renderNet = (
    title: string,
    hint: string,
    list: number[],
    setList: (v: number[]) => void,
    cls: string
  ) => (
    <div className={`${styles.net} ${cls}`}>
      <span className={styles.net__title}>{title}</span>
      <span className={styles.net__hint}>{hint}</span>
      <div className={styles.layers}>
        {list.map((u, i) => (
          <span key={i} className={styles.unit}>
            <button
              className={styles.unitMove}
              title="Переместить левее"
              disabled={i === 0}
              onClick={() => moveUnit(list, setList, i, -1)}
            >
              ←
            </button>
            <input
              type="number"
              min={1}
              className={styles.num}
              value={u}
              onChange={(e) =>
                editLayer(list, setList, i, parseInt(e.target.value) || 1)
              }
            />
            <button
              className={styles.unitMove}
              title="Переместить правее"
              disabled={i === list.length - 1}
              onClick={() => moveUnit(list, setList, i, 1)}
            >
              →
            </button>
            <button
              className={styles.unitBtn}
              title="Вставить слой после этого"
              onClick={() => insertAt(list, setList, i)}
            >
              +
            </button>
            <button
              className={styles.unitBtnRemove}
              title="Удалить этот слой"
              onClick={() => removeAt(list, setList, i)}
            >
              ×
            </button>
          </span>
        ))}
        <button
          className={styles.mini}
          title="Добавить слой в конец"
          onClick={() => addLayer(list, setList)}
        >
          +
        </button>
      </div>
    </div>
  );

  return (
    <div className={styles.wrapper}>
      <div className={styles.dims}>
        <label className={styles.field}>
          Размерность шума (латент)
          <input
            type="number"
            min={1}
            className={styles.input}
            value={latentDim}
            onChange={(e) => setLatentDim(parseInt(e.target.value) || 1)}
          />
        </label>
        <label className={styles.field}>
          Размерность данных
          <input
            type="number"
            min={1}
            className={styles.input}
            value={dataDim}
            onChange={(e) => setDataDim(parseInt(e.target.value) || 1)}
          />
        </label>
      </div>

      <div className={styles.nets}>
        {renderNet(
          "Генератор",
          "Из шума создаёт правдоподобный образец (последний слой — tanh).",
          gen,
          setGen,
          styles["net--gen"]
        )}
        {renderNet(
          "Дискриминатор",
          "Отличает реальные данные от сгенерированных (выход — sigmoid).",
          disc,
          setDisc,
          styles["net--disc"]
        )}
      </div>

      <div className={styles.colors}>
        {(
          [
            ["gen", "Генератор"],
            ["disc", "Дискриминатор"],
            ["data", "Данные"],
          ] as const
        ).map(([key, label]) => (
          <div key={key} className={styles.colors__group}>
            <span>{label}</span>
            <div className={styles.colors__swatches}>
              <input
                type="color"
                title="Заливка"
                value={colors[key].start}
                onChange={(e) =>
                  setColors((p) => ({
                    ...p,
                    [key]: { ...p[key], start: e.target.value },
                  }))
                }
              />
              <input
                type="color"
                title="Контур и подпись"
                value={colors[key].end}
                onChange={(e) =>
                  setColors((p) => ({
                    ...p,
                    [key]: { ...p[key], end: e.target.value },
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
        <svg ref={svgRef} role="img" aria-label="Схема GAN" />
      </div>
      <p className={styles.editHint}>
        ✎ Нажмите на любую подпись схемы, чтобы изменить её вручную
      </p>
      {overlay}

      <p className={styles.params}>
        <GlossaryTerm id="gan">GAN</GlossaryTerm> — генератор ≈{" "}
        {genParams.toLocaleString("ru-RU")} параметров, дискриминатор ≈{" "}
        {discParams.toLocaleString("ru-RU")} параметров.
      </p>

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
        <Button type="button" color="outline-blue" onClick={reset}>
          Сбросить
        </Button>
        <Button type="button" color="outline-blue" onClick={handleSaveImage}>
          Сохранить изображение
        </Button>
        <Button type="button" color="outline-blue" onClick={handleSave}>
          Сохранить в кабинет
        </Button>
        {savedMsg && <span className={styles.params}>{savedMsg}</span>}
        <Button type="button" color="filled" onClick={handleGenerate}>
          Сгенерировать код
        </Button>
      </div>
    </div>
  );
};

export default GanArchitecture;
