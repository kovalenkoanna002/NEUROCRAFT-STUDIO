import React, { useMemo, useState } from "react";
import { Article, Title, Lead } from "../components/ArticleKit";
import { glossary } from "../../../data/glossary";
import styles from "./GlossaryView.module.scss";

const GlossaryView: React.FC = () => {
  const [q, setQ] = useState("");

  const entries = useMemo(() => {
    const list = Object.values(glossary).sort((a, b) =>
      a.term.localeCompare(b.term, "ru")
    );
    const query = q.trim().toLowerCase();
    if (!query) return list;
    return list.filter(
      (e) =>
        e.term.toLowerCase().includes(query) ||
        e.definition.toLowerCase().includes(query)
    );
  }, [q]);

  return (
    <Article>
      <Title>Словарь терминов</Title>
      <Lead>
        Краткие определения ключевых понятий. Эти же термины подсвечиваются в
        статьях — наведите на них курсор.
      </Lead>

      <input
        className={styles.search}
        placeholder="Поиск термина…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <dl className={styles.list}>
        {entries.map((e) => (
          <div key={e.term} className={styles.item}>
            <dt className={styles.term}>{e.term}</dt>
            <dd className={styles.def}>{e.definition}</dd>
          </div>
        ))}
        {entries.length === 0 && (
          <p className={styles.empty}>Ничего не найдено.</p>
        )}
      </dl>
    </Article>
  );
};

export default GlossaryView;
