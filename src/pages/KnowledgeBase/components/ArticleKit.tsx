import React, { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./ArticleKit.module.scss";
import { Reference } from "../references";

type Kids = { children: React.ReactNode };

export const Article: React.FC<Kids> = ({ children }) => (
  <div className={styles.article}>{children}</div>
);

export const Title: React.FC<Kids> = ({ children }) => (
  <h1 className={styles.title}>{children}</h1>
);

export const Lead: React.FC<Kids> = ({ children }) => (
  <p className={styles.lead}>{children}</p>
);

export const H2: React.FC<Kids & { id?: string }> = ({ children, id }) => (
  <h2 className={styles.h2} id={id}>
    {children}
  </h2>
);

export const H3: React.FC<Kids> = ({ children }) => (
  <h3 className={styles.h3}>{children}</h3>
);

export const P: React.FC<Kids> = ({ children }) => (
  <p className={styles.p}>{children}</p>
);

export const Ul: React.FC<{ items: React.ReactNode[] }> = ({ items }) => (
  <ul className={styles.ul}>
    {items.map((it, i) => (
      <li key={i}>{it}</li>
    ))}
  </ul>
);

export const Formula: React.FC<Kids> = ({ children }) => (
  <span className={styles.formula}>{children}</span>
);

export const InlineCode: React.FC<Kids> = ({ children }) => (
  <code className={styles.inlineCode}>{children}</code>
);

export const Callout: React.FC<
  Kids & { variant?: "info" | "tip" | "warn" }
> = ({ children, variant = "info" }) => {
  const icon = variant === "tip" ? "💡" : variant === "warn" ? "⚠️" : "ℹ️";
  return (
    <div className={`${styles.callout} ${styles[`callout--${variant}`]}`}>
      <span className={styles.callout__icon}>{icon}</span>
      <div>{children}</div>
    </div>
  );
};

export const CodeBlock: React.FC<{ code: string; language?: string }> = ({
  code,
  language = "python",
}) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className={styles.code}>
      <div className={styles.code__head}>
        <span>{language}</span>
        <button className={styles.code__copy} onClick={copy}>
          {copied ? "Скопировано!" : "Копировать"}
        </button>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
};

export { GlossaryTerm as Term } from "../../../components/GlossaryTerm/GlossaryTerm";

export const BuilderLink: React.FC<{ type?: "perceptron" | "cnn" }> = ({
  type = "perceptron",
}) => (
  <Link className={styles.builderLink} to={`/codegeneration?type=${type}`}>
    🛠 Открыть в конструкторе
  </Link>
);

export const Sources: React.FC<{ refs: Reference[] }> = ({ refs }) => (
  <div className={styles.sources}>
    <h2 className={styles.h2}>Источники</h2>
    <ol className={styles.sources__list}>
      {refs.map((r, i) => (
        <li key={i}>
          {r.authors} <i>{r.title}</i>. — {r.source}.
          {r.url && (
            <>
              {" "}
              <a href={r.url} target="_blank" rel="noreferrer">
                ↗ источник
              </a>
            </>
          )}
        </li>
      ))}
    </ol>
  </div>
);
