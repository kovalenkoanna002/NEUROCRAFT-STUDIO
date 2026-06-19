import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { glossary } from "../../data/glossary";
import styles from "./GlossaryTerm.module.scss";

const TIP_WIDTH = 300;

interface TermProps {
  id: string;
  children?: React.ReactNode;
}

export const GlossaryTerm: React.FC<TermProps> = ({ id, children }) => {
  const entry = glossary[id];
  const navigate = useNavigate();
  const ref = useRef<HTMLSpanElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const [pos, setPos] = useState<{
    top: number;
    left: number;
    below: boolean;
  } | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  useEffect(() => {
    if (!pos) return;
    const onDocPointer = (e: PointerEvent) => {
      const t = e.target as Element | null;
      if (!t) return;
      if (ref.current?.contains(t)) return;
      if (t.closest?.(`.${styles.tip}`)) return;
      setPos(null);
    };
    document.addEventListener("pointerdown", onDocPointer, true);
    return () => document.removeEventListener("pointerdown", onDocPointer, true);
  }, [pos]);

  if (!entry) return <>{children ?? id}</>;

  const isTouchOrMobile = () =>
    typeof window !== "undefined" &&
    (window.matchMedia("(hover: none), (pointer: coarse)").matches ||
      window.matchMedia("(max-width: 768px)").matches);

  const cancelClose = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = undefined;
    }
  };

  const open = () => {
    cancelClose();
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const left = Math.max(
      8,
      Math.min(
        r.left + r.width / 2 - TIP_WIDTH / 2,
        window.innerWidth - TIP_WIDTH - 8
      )
    );
    const below = r.top < 170;
    setPos({ top: below ? r.bottom + 8 : r.top - 8, left, below });
  };

  const scheduleClose = () => {
    cancelClose();
    timer.current = window.setTimeout(() => setPos(null), 160);
  };

  const go = (e: React.SyntheticEvent) => {
    if (!entry.article) return;
    e.preventDefault();
    e.stopPropagation();
    cancelClose();
    setPos(null);
    navigate(`/knowledgebase?article=${entry.article}`);
  };

  const handleTermClick = (e: React.MouseEvent) => {
    if (!entry.article) return;
    if (isTouchOrMobile()) {
      e.preventDefault();
      e.stopPropagation();
      open();
      return;
    }
    go(e);
  };

  return (
    <>
      <span
        ref={ref}
        className={`${styles.term} ${entry.article ? styles.termLink : ""}`}
        tabIndex={0}
        role={entry.article ? "link" : undefined}
        onMouseEnter={open}
        onMouseLeave={scheduleClose}
        onFocus={open}
        onBlur={scheduleClose}
        onClick={handleTermClick}
        onKeyDown={(e) => e.key === "Enter" && go(e)}
      >
        {children ?? entry.term}
      </span>
      {pos &&
        createPortal(
          <span
            className={`${styles.tip} ${pos.below ? styles.tipBelow : ""}`}
            style={{ top: pos.top, left: pos.left, width: TIP_WIDTH }}
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
          >
            <b>{entry.term}</b>
            <br />
            {entry.definition}
            {entry.article && (
              <button type="button" className={styles.tipLink} onClick={go}>
                Открыть в базе знаний →
              </button>
            )}
          </span>,
          document.body
        )}
    </>
  );
};

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const ALTS = Object.entries(glossary)
  .filter(([, e]) => e.match && e.match.length)
  .flatMap(([key, e]) => e.match!.map((stem) => ({ key, stem: stem.toLowerCase() })))
  .sort((a, b) => b.stem.length - a.stem.length);

const RE = ALTS.length
  ? new RegExp(
      `(?<![a-zа-яё0-9])(?:${ALTS.map((a) => escapeRe(a.stem)).join("|")})[a-zа-яё]*`,
      "giu"
    )
  : null;

export const AutoGlossary: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  if (typeof children !== "string" || !RE) return <>{children}</>;
  const text = children;
  const out: React.ReactNode[] = [];
  const used = new Set<string>();
  let last = 0;
  RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = RE.exec(text)) !== null) {
    const low = m[0].toLowerCase();
    const alt = ALTS.find((a) => low.startsWith(a.stem));
    if (!alt || used.has(alt.key)) continue;
    used.add(alt.key);
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(
      <GlossaryTerm key={`${alt.key}-${m.index}`} id={alt.key}>
        {m[0]}
      </GlossaryTerm>
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return <>{out}</>;
};
