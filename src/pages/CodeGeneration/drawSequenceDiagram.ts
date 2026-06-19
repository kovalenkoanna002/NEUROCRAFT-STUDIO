import * as d3 from "d3";
import { Layer } from "../../api/Network";

export type SeqColorPair = { start: string; end: string };

export const LABELS: Record<string, string> = {
  embedding: "Embedding",
  lstm: "LSTM",
  gru: "GRU",
  rnn: "SimpleRNN",
  attention: "Transformer",
  globalpool: "GlobalPool",
  dense: "Dense",
  output: "Output",
};

const EXPLAIN: Record<string, string> = {
  embedding:
    "Преобразует индексы токенов в плотные векторы фиксированной размерности. В трансформере к ним добавляется позиционное кодирование, чтобы сохранить порядок слов.",
  lstm: "Рекуррентный слой с памятью (ячейкой состояния) и вентилями — хранит информацию о предыдущих шагах последовательности и борется с затуханием градиента.",
  gru: "Облегчённая рекуррентная ячейка с двумя вентилями (обновления и сброса) — быстрее LSTM при сравнимом качестве.",
  rnn: "Простая рекуррентная ячейка: скрытое состояние hₜ зависит от входа и предыдущего состояния. Чувствительна к затуханию градиента на длинных последовательностях.",
  attention:
    "Энкодер трансформера: Multi-Head Attention позволяет каждому токену взвешенно «смотреть» на все остальные, затем Feed Forward обрабатывает позиции независимо. Add & Norm — остаточная связь и нормализация.",
  mha: "Multi-Head Attention: несколько параллельных «голов» внимания вычисляют взвешенные связи между всеми токенами последовательности и объединяют результат — модель учится разным типам зависимостей.",
  ffn: "Feed Forward: два полносвязных слоя, применяемые к каждой позиции независимо. Даёт нелинейное преобразование признаков после слоя внимания.",
  addnorm:
    "Add & Norm: остаточная связь (вход прибавляется к выходу под-слоя) и нормализация слоя (LayerNorm) — стабилизируют обучение глубокого стека.",
  globalpool:
    "Global Average Pooling: усредняет представления всех позиций в один вектор фиксированного размера для классификатора.",
  dense: "Полносвязный слой: каждый нейрон связан со всеми входами. Извлекает признаки и комбинирует их.",
  output:
    "Выходной слой: число нейронов = число классов. Функция softmax даёт распределение вероятностей по классам.",
};

export const seqDetailOf = (l: Layer): string => {
  switch (l.type) {
    case "embedding":
      return `${l.vocabSize ?? 0}→${l.embeddingDim ?? 0}`;
    case "lstm":
    case "gru":
    case "rnn":
      return `${l.neuronCount} units${l.returnSequences ? " ↻" : ""}`;
    case "attention":
      return `${l.numHeads ?? 0} heads`;
    case "globalpool":
      return "avg";
    default:
      return `${l.neuronCount}`;
  }
};

export interface DrawSeqOptions {
  variant: "rnn" | "transformer";
  colors: Record<string, SeqColorPair>;
  lineColor: string;
  solidFill: boolean;
  onHover: (info: { title: string; text: string } | null) => void;
}

export function drawSequenceDiagram(
  svgEl: SVGSVGElement | null,
  layers: Layer[],
  opts: DrawSeqOptions
) {
  if (!svgEl) return;
  const { variant, colors, lineColor, solidFill } = opts;
  const setHovered = opts.onHover;
  const detailOf = seqDetailOf;
  const svg = d3.select(svgEl);
  svg.selectAll("*").remove();

  const baseW = 124;
  const baseH = 64;
  const attnW = 212;
  const attnH = 188;
  const gap = 58;
  const padL = 60;
  const padR = 104;
  const padY = 32;

  const isAttn = (l: Layer) => l.type === "attention";
  const isRecurrent = (l: Layer) =>
    l.type === "lstm" || l.type === "gru" || l.type === "rnn";
  const widthOf = (l: Layer) => (isAttn(l) ? attnW : baseW);

  const hasAttn = layers.some(isAttn);
  const height = (hasAttn ? attnH : 132) + padY * 2;
  const midY = height / 2;

  const xs: number[] = [];
  let cursor = padL;
  layers.forEach((l) => {
    xs.push(cursor);
    cursor += widthOf(l) + gap;
  });
  const totalW = cursor - gap + padR;
  svg.attr("width", Math.max(totalW, 460)).attr("height", height);

  const defs = svg.append("defs");

  const shadow = defs
    .append("filter")
    .attr("id", "seq-shadow")
    .attr("x", "-20%")
    .attr("y", "-30%")
    .attr("width", "140%")
    .attr("height", "170%");
  shadow
    .append("feDropShadow")
    .attr("dx", 0)
    .attr("dy", 2)
    .attr("stdDeviation", 2.5)
    .attr("flood-color", "#0f172a")
    .attr("flood-opacity", 0.16);

  Object.entries(colors).forEach(([type, { start }]) => {
    const deeper = d3.color(start)?.darker(0.35)?.toString() ?? start;
    const lg = defs
      .append("linearGradient")
      .attr("id", `seq-grad-${type}`)
      .attr("x1", "0")
      .attr("y1", "0")
      .attr("x2", "0")
      .attr("y2", "1");
    lg.append("stop").attr("offset", "0%").attr("stop-color", "#ffffff");
    lg.append("stop").attr("offset", "38%").attr("stop-color", start);
    lg.append("stop").attr("offset", "100%").attr("stop-color", deeper);
  });

  const mk = (id: string, color: string) => {
    const m = defs
      .append("marker")
      .attr("id", id)
      .attr("viewBox", "0 0 10 10")
      .attr("refX", 8)
      .attr("refY", 5)
      .attr("markerWidth", 7)
      .attr("markerHeight", 7)
      .attr("orient", "auto-start-reverse");
    m.append("path").attr("d", "M0 0 L10 5 L0 10 z").attr("fill", color);
  };
  mk("seq-arrow", lineColor);
  mk("seq-arrow-loop", "#0D9488");

  if (layers.length) {
    svg
      .append("line")
      .attr("x1", xs[0] - 42)
      .attr("y1", midY)
      .attr("x2", xs[0])
      .attr("y2", midY)
      .attr("stroke", lineColor)
      .attr("stroke-width", 2)
      .attr("marker-end", "url(#seq-arrow)");
    svg
      .append("text")
      .attr("x", xs[0] - 42)
      .attr("y", midY - 9)
      .attr("text-anchor", "start")
      .style("font-size", "11px")
      .attr("fill", "#64748b")
      .text("вход");
  }

  layers.forEach((layer, i) => {
    if (i >= layers.length - 1) return;
    const x = xs[i] + widthOf(layer);
    svg
      .append("line")
      .attr("x1", x)
      .attr("y1", midY)
      .attr("x2", xs[i + 1])
      .attr("y2", midY)
      .attr("stroke", lineColor)
      .attr("stroke-width", 2)
      .attr("marker-end", "url(#seq-arrow)");
  });

  if (layers.length) {
    const li = layers.length - 1;
    const rx = xs[li] + widthOf(layers[li]);
    svg
      .append("line")
      .attr("x1", rx)
      .attr("y1", midY)
      .attr("x2", rx + 44)
      .attr("y2", midY)
      .attr("stroke", lineColor)
      .attr("stroke-width", 2)
      .attr("marker-end", "url(#seq-arrow)");
    svg
      .append("text")
      .attr("x", rx + 50)
      .attr("y", midY - 2)
      .attr("text-anchor", "start")
      .style("font-size", "12px")
      .style("font-weight", "600")
      .attr("fill", "#475569")
      .text("ŷ");
    svg
      .append("text")
      .attr("x", rx + 50)
      .attr("y", midY + 13)
      .attr("text-anchor", "start")
      .style("font-size", "10px")
      .attr("fill", "#94a3b8")
      .text("классы");
  }

  const roundedLabel = (
    gsel: d3.Selection<SVGGElement, unknown, null, undefined>,
    x: number,
    y: number,
    w: number,
    h: number,
    fill: string,
    stroke: string,
    title: string,
    sub?: string
  ) => {
    gsel
      .append("rect")
      .attr("x", x)
      .attr("y", y)
      .attr("width", w)
      .attr("height", h)
      .attr("rx", 10)
      .attr("fill", fill)
      .attr("stroke", stroke)
      .attr("stroke-width", 1.5)
      .attr("filter", "url(#seq-shadow)");
    gsel
      .append("text")
      .attr("x", x + w / 2)
      .attr("y", sub ? y + h / 2 - 4 : y + h / 2 + 4)
      .attr("text-anchor", "middle")
      .style("font-size", "13px")
      .style("font-weight", "600")
      .attr("fill", stroke)
      .text(title);
    if (sub)
      gsel
        .append("text")
        .attr("x", x + w / 2)
        .attr("y", y + h / 2 + 13)
        .attr("text-anchor", "middle")
        .style("font-size", "11px")
        .attr("fill", "#475569")
        .text(sub);
  };

  layers.forEach((layer, i) => {
    const x = xs[i];
    const stroke = colors[layer.type]?.end ?? "#64748b";
    const g = svg.append("g");
    g.style("cursor", "help")
      .on("mouseenter", () =>
        setHovered({
          title: `${LABELS[layer.type] ?? layer.type} — ${detailOf(layer)}`,
          text: EXPLAIN[layer.type] ?? "",
        })
      )
      .on("mouseleave", () => setHovered(null));

    if (isAttn(layer)) {
      const top = midY - attnH / 2;
      const innerX = x + 16;
      const innerW = attnW - 32;
      const attnInfo = {
        title: "Энкодер трансформера",
        text: EXPLAIN.attention,
      };
      g.on("mouseenter", () => setHovered(attnInfo)).on("mouseleave", () =>
        setHovered(null)
      );

      g.append("rect")
        .attr("x", x)
        .attr("y", top)
        .attr("width", attnW)
        .attr("height", attnH)
        .attr("rx", 12)
        .attr("fill", "#f5f7ff")
        .attr("stroke", stroke)
        .attr("stroke-width", 1.5)
        .attr("filter", "url(#seq-shadow)");
      g.append("rect")
        .attr("x", x + 4)
        .attr("y", top + 4)
        .attr("width", attnW - 8)
        .attr("height", attnH - 8)
        .attr("rx", 9)
        .attr("fill", "none")
        .attr("stroke", stroke)
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "4 3")
        .attr("opacity", 0.5);
      g.append("text")
        .attr("x", x + attnW / 2)
        .attr("y", top + 17)
        .attr("text-anchor", "middle")
        .style("font-size", "11px")
        .style("font-weight", "700")
        .attr("fill", stroke)
        .text("Энкодер трансформера");

      const sub = [
        {
          t: `Multi-Head Attention`,
          s: `${layer.numHeads ?? 4} heads`,
          h: 30,
          key: "mha",
        },
        { t: "Add & Norm", s: "", h: 20, key: "addnorm" },
        { t: "Feed Forward", s: `${layer.ffDim ?? 128}`, h: 30, key: "ffn" },
        { t: "Add & Norm", s: "", h: 20, key: "addnorm" },
      ];
      let yy = top + 26;
      const centers: number[] = [];
      sub.forEach((b) => {
        const norm = b.t === "Add & Norm";
        const sg = g.append("g");
        roundedLabel(
          sg,
          innerX,
          yy,
          innerW,
          b.h,
          norm
            ? "#ffffff"
            : solidFill
            ? colors[layer.type]?.start ?? "#e2e8f0"
            : `url(#seq-grad-${layer.type})`,
          stroke,
          b.t,
          b.s || undefined
        );
        sg.style("cursor", "help")
          .on("mouseenter", () =>
            setHovered({ title: b.t, text: EXPLAIN[b.key] ?? "" })
          )
          .on("mouseleave", () => setHovered(attnInfo));
        centers.push(yy + b.h / 2);
        yy += b.h + 6;
      });

      const resX = x + 7;
      [
        [centers[0], centers[1]],
        [centers[2], centers[3]],
      ].forEach(([a, b]) => {
        g.append("path")
          .attr(
            "d",
            `M ${innerX} ${a} L ${resX} ${a} L ${resX} ${b} L ${innerX} ${b}`
          )
          .attr("fill", "none")
          .attr("stroke", stroke)
          .attr("stroke-width", 1.2)
          .attr("opacity", 0.7)
          .attr("marker-end", "url(#seq-arrow)");
      });
      return;
    }

    const sub =
      layer.type === "embedding" && variant === "transformer"
        ? "+ позиц. кодирование"
        : detailOf(layer);
    roundedLabel(
      g,
      x,
      midY - baseH / 2,
      baseW,
      baseH,
      solidFill
        ? colors[layer.type]?.start ?? "#e2e8f0"
        : `url(#seq-grad-${layer.type})`,
      stroke,
      LABELS[layer.type] ?? layer.type,
      sub
    );

    if (isRecurrent(layer)) {
      const cx = x + baseW / 2;
      const topY = midY - baseH / 2;
      g.append("path")
        .attr(
          "d",
          `M ${cx + 20} ${topY} C ${cx + 48} ${topY - 46}, ${
            cx - 48
          } ${topY - 46}, ${cx - 20} ${topY}`
        )
        .attr("fill", "none")
        .attr("stroke", "#0D9488")
        .attr("stroke-width", 1.8)
        .attr("marker-end", "url(#seq-arrow-loop)");
      g.append("text")
        .attr("x", cx)
        .attr("y", topY - 40)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-style", "italic")
        .style("font-weight", "600")
        .attr("fill", "#0D9488")
        .text("hₜ");
    }
  });
}
