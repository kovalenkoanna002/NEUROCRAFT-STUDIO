import { RefObject, useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";

const SKIP = new Set(["•", "·", "…", ""]);
const SVGNS = "http://www.w3.org/2000/svg";

const GRAPHIC_SEL = "circle, rect, ellipse, image, line";

const STRUCT_SEL = "circle, rect, ellipse, image, line, path, polygon, polyline";

interface EditState {
  i: number;
  left: number;
  top: number;
  width: number;
  value: string;
}

type Box = { x: number; y: number; width: number; height: number };
type Obstacle = { box: Box; text: boolean };

function visibleText(t: SVGTextElement): string {
  let s = "";
  t.childNodes.forEach((n) => {
    if (n.nodeType === Node.TEXT_NODE) s += n.nodeValue ?? "";
    else if (n.nodeName.toLowerCase() === "tspan") s += n.textContent ?? "";
  });
  return s.trim();
}

function setVisibleText(t: SVGTextElement, value: string) {
  const title = Array.from(t.childNodes).find(
    (n) => n.nodeName.toLowerCase() === "title"
  );
  while (t.firstChild) t.removeChild(t.firstChild);
  if (value !== "") t.appendChild(document.createTextNode(value));
  if (title) t.appendChild(title);
}

function bboxOf(el: SVGGraphicsElement): Box | null {
  try {
    const b = el.getBBox();
    return b.width || b.height
      ? { x: b.x, y: b.y, width: b.width, height: b.height }
      : null;
  } catch {
    return null;
  }
}

function splitLines(fullText: string, maxChars: number): string[] {
  const words = fullText.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const cand = cur ? `${cur} ${w}` : w;
    if (cand.length > maxChars && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = cand;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

function placeLabel(
  t: SVGTextElement,
  fullText: string,
  midX: number,
  cy: number,
  top: number,
  bottom: number,
  boxW: number,
  baseFont: number
) {
  let naturalLen = 0;
  try {
    naturalLen = t.getComputedTextLength();
  } catch {

  }
  if (!naturalLen) naturalLen = fullText.length * baseFont * 0.55;
  const avgChar0 = naturalLen / Math.max(fullText.length, 1);
  const availW = Math.max(24, boxW);
  const availH = Math.max(baseFont, bottom - top);
  const baseFontR = Math.round(baseFont);
  const x = String(Math.round(midX));
  const title = Array.from(t.childNodes).find(
    (n) => n.nodeName.toLowerCase() === "title"
  );

  const render = (font: number, lines: string[]) => {
    const lh = font * 1.2;
    const blockH = lines.length * lh;
    let topPos = cy - blockH / 2;
    if (topPos + blockH > bottom - 2) topPos = bottom - 2 - blockH;
    if (topPos < top + 2) topPos = top + 2;
    const baseline0 = topPos + font * 0.8;
    while (t.firstChild) t.removeChild(t.firstChild);
    t.style.fontSize = font !== baseFontR ? `${font}px` : t.dataset.of ?? "";
    lines.forEach((ln, idx) => {
      const ts = document.createElementNS(SVGNS, "tspan");
      ts.setAttribute("x", x);
      ts.setAttribute("y", String(Math.round(baseline0 + idx * lh)));
      ts.textContent = ln;
      t.appendChild(ts);
    });
    if (title) t.appendChild(title);
    t.setAttribute("text-anchor", "middle");
    t.setAttribute("x", x);
  };

  let font = baseFontR;
  let lines = splitLines(fullText, Math.max(3, Math.floor(availW / avgChar0)));
  for (let f = baseFontR; f >= 7; f--) {
    const maxChars = Math.max(3, Math.floor((availW * baseFont) / (avgChar0 * f)));
    const ls = splitLines(fullText, maxChars);
    if (ls.length * f * 1.2 <= availH) {
      font = f;
      lines = ls;
      break;
    }
    if (f === 7) {
      font = 7;
      lines = ls;
    }
  }
  let curFont = font;
  render(font, lines);

  try {
    const bw = t.getBBox().width;
    if (bw > availW + 1) {
      const nf = Math.max(6, Math.floor((font * availW) / bw));
      if (nf < font) {
        curFont = nf;
        render(nf, lines);
      }
    }
  } catch {

  }

  t.querySelectorAll("tspan").forEach((ts) => {
    const ln = ts.textContent || "";
    let w = 0;
    try {
      w = ts.getComputedTextLength();
    } catch {

    }
    if (!w) w = ln.length * avgChar0 * (curFont / baseFont);
    if (w > availW + 0.5) {
      ts.setAttribute("textLength", String(Math.floor(availW)));
      ts.setAttribute("lengthAdjust", "spacingAndGlyphs");
    } else {
      ts.removeAttribute("textLength");
      ts.removeAttribute("lengthAdjust");
    }
  });
}

function unionBounds(
  svg: SVGSVGElement,
  selector: string,
  includeText: boolean
): Box | null {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  const add = (b: Box | null) => {
    if (!b) return;
    minX = Math.min(minX, b.x);
    minY = Math.min(minY, b.y);
    maxX = Math.max(maxX, b.x + b.width);
    maxY = Math.max(maxY, b.y + b.height);
  };
  svg
    .querySelectorAll<SVGGraphicsElement>(selector)
    .forEach((el) => add(bboxOf(el)));
  if (includeText)
    svg.querySelectorAll<SVGTextElement>("text").forEach((el) => add(bboxOf(el)));
  if (!isFinite(minX)) return null;
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

function fitToContent(svg: SVGSVGElement, native: Box | null) {
  const struct = unionBounds(svg, STRUCT_SEL, false);
  if (!struct && !native) return;
  const base =
    native ?? {
      x: struct!.x - 16,
      y: struct!.y - 16,
      width: struct!.width + 32,
      height: struct!.height + 32,
    };
  let minX = base.x;
  let minY = base.y;
  let maxX = base.x + base.width;
  let maxY = base.y + base.height;

  const text = unionBounds(svg, "text", true);
  if (text) {
    minX = Math.min(minX, text.x - 4);
    minY = Math.min(minY, text.y - 4);
    maxX = Math.max(maxX, text.x + text.width + 4);
    maxY = Math.max(maxY, text.y + text.height + 4);
  }
  const w = Math.ceil(maxX - minX);
  const h = Math.ceil(maxY - minY);
  svg.setAttribute("viewBox", `${Math.floor(minX)} ${Math.floor(minY)} ${w} ${h}`);
  svg.setAttribute("width", String(w));
  svg.setAttribute("height", String(h));
}

function relayout(
  svg: SVGSVGElement,
  overrides: Map<number, string>,
  native: Box | null
) {
  const texts = Array.from(svg.querySelectorAll<SVGTextElement>("text"));

  texts.forEach((t, i) => {

    const isOv = overrides.has(i) && overrides.get(i) !== "";
    if (!isOv && t.dataset.ox === undefined) return;
    if (t.dataset.ox === undefined) {
      t.dataset.ox = t.getAttribute("x") ?? "";
      t.dataset.oa = t.getAttribute("text-anchor") ?? "";
      t.dataset.of = t.style.fontSize ?? "";
    }
    t.setAttribute("x", t.dataset.ox);
    if (t.dataset.oa) t.setAttribute("text-anchor", t.dataset.oa);
    else t.removeAttribute("text-anchor");
    t.removeAttribute("textLength");
    t.removeAttribute("lengthAdjust");
    t.style.fontSize = t.dataset.of ?? "";
    if (isOv) setVisibleText(t, overrides.get(i) as string);
  });

  const textBoxes = texts.map(bboxOf);
  const obstacles: Obstacle[] = [];
  textBoxes.forEach((b) => b && obstacles.push({ box: b, text: true }));
  svg.querySelectorAll<SVGGraphicsElement>(GRAPHIC_SEL).forEach((el) => {
    const ob = bboxOf(el);
    if (ob) obstacles.push({ box: ob, text: false });
  });

  const structB = unionBounds(svg, STRUCT_SEL, false);
  const structCenterX = structB ? structB.x + structB.width / 2 : 0;

  overrides.forEach((_v, i) => {
    if (_v === "") return;
    const t = texts[i];
    const b = textBoxes[i];
    if (!t || !b) return;
    const cx = b.x + b.width / 2;
    const cy = b.y + b.height / 2;
    const half = b.width / 2;
    const fontPx = parseFloat(getComputedStyle(t).fontSize) || b.height || 12;
    const fullText = overrides.get(i) as string;

    const vBounds = (loX: number, hiX: number, ft: number, fb: number) => {
      let aboveBottom = ft;
      let belowTop = fb;
      obstacles.forEach((o) => {
        const ob = o.box;
        if (ob === b) return;
        if (ob.x > hiX || ob.x + ob.width < loX) return;

        if (ob.y < cy && ob.y + ob.height > cy) return;
        const oCy = ob.y + ob.height / 2;
        if (Math.abs(oCy - cy) <= b.height * 0.6) return;
        if (oCy < cy) aboveBottom = Math.max(aboveBottom, ob.y + ob.height);
        else belowTop = Math.min(belowTop, ob.y);
      });
      return [aboveBottom, belowTop] as const;
    };

    const oAnchor =
      t.dataset.oa !== undefined
        ? t.dataset.oa
        : t.getAttribute("text-anchor") ?? "";
    if (oAnchor === "start" || oAnchor === "end") {
      const ax = parseFloat(t.dataset.ox ?? t.getAttribute("x") ?? "");
      if (!Number.isNaN(ax)) {
        if (ax < structCenterX) {

          let rb = Infinity;
          obstacles.forEach((o) => {
            if (o.text) return;
            const ob = o.box;
            if (ob.width < 24 || ob.height < 20) return;
            if (ob.x > ax) rb = Math.min(rb, ob.x);
          });
          t.setAttribute("text-anchor", "end");
          t.setAttribute("x", String(Math.round(isFinite(rb) ? rb - 10 : ax)));
        } else {

          t.setAttribute("text-anchor", "start");
          t.setAttribute("x", String(Math.round(ax)));
        }
      }
      return;
    }

    let container: Box | null = null;
    for (const o of obstacles) {
      if (o.text) continue;
      const ob = o.box;
      const contains =
        ob.x <= cx && ob.x + ob.width >= cx && ob.y <= cy && ob.y + ob.height >= cy;
      if (!contains) continue;
      if (ob.width * ob.height < b.width * b.height * 1.4) continue;
      if (!container || ob.width * ob.height < container.width * container.height)
        container = ob;
    }
    if (container) {
      const c: Box = container;
      const midX = c.x + c.width / 2;
      const boxW = Math.max(30, c.width - 16);
      const [aboveBottom, belowTop] = vBounds(c.x, c.x + c.width, c.y + 2, c.y + c.height - 2);
      if (b.width > boxW || b.height > belowTop - aboveBottom) {
        placeLabel(t, fullText, midX, cy, aboveBottom, belowTop, boxW, fontPx);
      } else {
        t.setAttribute("text-anchor", "middle");
        t.setAttribute("x", String(Math.round(midX)));
      }
      return;
    }

    let leftSet = false;
    let rightSet = false;
    let leftEdge = 0;
    let rightEdge = 0;
    let leftCenter = 0;
    let rightCenter = 0;
    let leftText = false;
    let rightText = false;
    obstacles.forEach((o) => {
      const ob = o.box;
      if (ob === b) return;

      const contains =
        ob.x <= cx && ob.x + ob.width >= cx && ob.y <= cy && ob.y + ob.height >= cy;
      if (!o.text && contains) return;
      const oCy = ob.y + ob.height / 2;
      if (Math.abs(oCy - cy) > Math.max(b.height, ob.height) * 0.6) return;
      const oCx = ob.x + ob.width / 2;
      if (oCx < cx) {
        if (!leftSet || oCx > leftCenter) {
          leftSet = true;
          leftCenter = oCx;
          leftEdge = ob.x + ob.width;
          leftText = o.text;
        }
      } else if (oCx > cx) {
        if (!rightSet || oCx < rightCenter) {
          rightSet = true;
          rightCenter = oCx;
          rightEdge = ob.x;
          rightText = o.text;
        }
      }
    });

    const m = 8;

    const halfRight = rightSet
      ? (rightText ? (rightCenter - cx) / 2 : rightEdge - cx) - m
      : Infinity;
    const halfLeft = leftSet
      ? (leftText ? (cx - leftCenter) / 2 : cx - leftEdge) - m
      : Infinity;

    if (half <= halfLeft && half <= halfRight) return;

    const shiftCase =
      (!leftSet && rightSet && !rightText) ||
      (!rightSet && leftSet && !leftText);
    if (shiftCase) {
      if (!leftSet) {
        t.setAttribute("text-anchor", "end");
        t.setAttribute("x", String(Math.round(rightEdge - m)));
      } else {
        t.setAttribute("text-anchor", "start");
        t.setAttribute("x", String(Math.round(leftEdge + m)));
      }
      return;
    }

    let wrapHalf = Math.min(halfLeft, halfRight);
    if (!isFinite(wrapHalf)) wrapHalf = half;
    wrapHalf = Math.max(20, wrapHalf);
    const boxW = 2 * wrapHalf;
    const [aboveBottom, belowTop] = vBounds(cx - wrapHalf, cx + wrapHalf, -Infinity, Infinity);
    placeLabel(t, fullText, cx, cy, aboveBottom, belowTop, boxW, fontPx);
  });

  fitToContent(svg, native);
}

export function useEditableLabels(
  svgRef: RefObject<SVGSVGElement>,
  initialLabels?: Record<string, string>,

  storageKey?: string
) {
  const overrides = useRef<Map<number, string>>(
    new Map(
      Object.entries(
        (() => {
          if (storageKey) {
            try {
              const raw = localStorage.getItem(storageKey);
              if (raw != null) return JSON.parse(raw) as Record<string, string>;
            } catch {

            }
          }
          return initialLabels ?? {};
        })()
      ).map(([k, v]) => [Number(k), v])
    )
  );

  const persist = useCallback(() => {
    if (!storageKey) return;
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify(
          Object.fromEntries(
            Array.from(overrides.current.entries()).map(([k, v]) => [
              String(k),
              v,
            ])
          )
        )
      );
    } catch {

    }
  }, [storageKey]);

  const defaults = useRef<Map<number, string>>(new Map());

  const sigRef = useRef<string | null>(null);
  const escaping = useRef(false);

  const nativeRef = useRef<Box | null>(null);
  const [edit, setEdit] = useState<EditState | null>(null);

  const enhance = useCallback(
    (signature: string) => {
      const svg = svgRef.current;
      if (!svg) return;
      if (sigRef.current === null) {
        sigRef.current = signature;
      } else if (sigRef.current !== signature) {

        overrides.current.clear();
        sigRef.current = signature;
        persist();
      }

      const wAttr = svg.getAttribute("width");
      const hAttr = svg.getAttribute("height");
      const vb = svg.viewBox.baseVal;
      if (wAttr && !wAttr.includes("%") && hAttr && parseFloat(hAttr) > 0) {
        nativeRef.current = {
          x: 0,
          y: 0,
          width: parseFloat(wAttr),
          height: parseFloat(hAttr),
        };
      } else if (vb && vb.width) {
        nativeRef.current = {
          x: vb.x,
          y: vb.y,
          width: vb.width,
          height: vb.height,
        };
      }
      defaults.current.clear();
      const overridden = new Set<number>();
      const texts = Array.from(svg.querySelectorAll<SVGTextElement>("text"));
      texts.forEach((t, i) => {
        const original = visibleText(t);
        if (SKIP.has(original)) return;

        defaults.current.set(i, original);
        const ov = overrides.current.get(i);
        if (ov === "") {

          t.style.opacity = "0";
        } else if (ov !== undefined) {
          t.style.opacity = "";
          setVisibleText(t, ov);
          overridden.add(i);
        } else {
          t.style.opacity = "";
        }
        t.style.cursor = "pointer";
        t.setAttribute("data-editable", "1");
        t.onclick = (e) => {
          e.stopPropagation();
          escaping.current = false;
          const r = t.getBoundingClientRect();
          const w = Math.min(Math.max(r.width + 28, 120), 320);
          let left = r.left + r.width / 2;

          left = Math.min(Math.max(left, w / 2 + 8), window.innerWidth - w / 2 - 8);

          const value = overrides.current.get(i) ?? visibleText(t);
          setEdit({ i, left, top: r.top, width: w, value });
        };
      });

      if (overridden.size > 0) relayout(svg, overrides.current, nativeRef.current);
    },
    [svgRef, persist]
  );

  const commit = useCallback(() => {
    if (escaping.current) {
      escaping.current = false;
      setEdit(null);
      return;
    }
    setEdit((cur) => {
      if (!cur) return null;
      const svg = svgRef.current;
      const t = svg?.querySelectorAll<SVGTextElement>("text")[cur.i];
      if (t && svg) {
        const v = cur.value.trim();
        t.style.opacity = "";
        if (v === "") {

          overrides.current.delete(cur.i);
          setVisibleText(t, defaults.current.get(cur.i) ?? "");
          t.removeAttribute("textLength");
          t.removeAttribute("lengthAdjust");

          if (t.dataset.of !== undefined) t.style.fontSize = t.dataset.of;
        } else {
          overrides.current.set(cur.i, v);
          setVisibleText(t, v);
        }

        relayout(svg, overrides.current, nativeRef.current);
        persist();
      }
      return null;
    });
  }, [svgRef, persist]);

  const deleteLabel = useCallback(() => {
    setEdit((cur) => {
      if (!cur) return null;
      const svg = svgRef.current;
      const t = svg?.querySelectorAll<SVGTextElement>("text")[cur.i];
      if (t && svg) {
        overrides.current.set(cur.i, "");

        setVisibleText(t, defaults.current.get(cur.i) ?? "");
        if (t.dataset.ox !== undefined) {
          t.setAttribute("x", t.dataset.ox);
          if (t.dataset.oa) t.setAttribute("text-anchor", t.dataset.oa);
          else t.removeAttribute("text-anchor");
        }
        t.removeAttribute("textLength");
        t.removeAttribute("lengthAdjust");
        if (t.dataset.of !== undefined) t.style.fontSize = t.dataset.of;
        t.style.opacity = "0";
        relayout(svg, overrides.current, nativeRef.current);
        persist();
      }
      return null;
    });
  }, [svgRef, persist]);

  const getLabels = useCallback(
    (): Record<string, string> =>
      Object.fromEntries(
        Array.from(overrides.current.entries()).map(([k, v]) => [String(k), v])
      ),
    []
  );

  const overlay = edit
    ? createPortal(
        <div
          style={{
            position: "fixed",
            left: edit.left,
            top: edit.top,
            transform: "translate(-50%, -115%)",
            zIndex: 4000,
            display: "flex",
            gap: 4,
            alignItems: "stretch",
          }}
        >
          <input
            autoFocus
            aria-label="Новое название подписи"
            value={edit.value}
            onChange={(e) =>
              setEdit((cur) => (cur ? { ...cur, value: e.target.value } : cur))
            }
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commit();
              } else if (e.key === "Escape") {
                e.preventDefault();
                escaping.current = true;
                (e.target as HTMLInputElement).blur();
              }
            }}
            style={{
              width: edit.width,
              padding: "4px 8px",
              border: "1px solid #1d4ed8",
              borderRadius: 6,
              outline: "none",
              font: "13px Montserrat, Arial, sans-serif",
              textAlign: "center",
              background: "#fff",
              color: "#0f172a",
              boxShadow: "0 6px 18px rgba(13, 33, 91, 0.18)",
            }}
          />
          <button
            type="button"
            title="Удалить подпись"
            aria-label="Удалить подпись"

            onMouseDown={(e) => {
              e.preventDefault();
              escaping.current = true;
              deleteLabel();
            }}
            style={{
              padding: "0 10px",
              border: "1px solid #dc2626",
              borderRadius: 6,
              background: "#fff",
              color: "#dc2626",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 700,
              boxShadow: "0 6px 18px rgba(13, 33, 91, 0.18)",
            }}
          >
            ✕
          </button>
        </div>,
        document.body
      )
    : null;

  return { enhance, overlay, getLabels };
}
