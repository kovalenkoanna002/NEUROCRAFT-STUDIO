import React, { useState } from "react";
import VisualizationSection from "./VisualizationSection";
import GenerationSection from "./GenerationSection";
import KnowledgeBaseSection from "./KnowledgeBaseSection";
import EditorSection from "./EditorSection";
import PlaygroundSection from "./PlaygroundSection";
import styles from "./FeaturesWrapper.module.scss";

const PAGES = [
  {
    id: "viz",
    title: "Визуализация архитектуры",
    element: <VisualizationSection />,
  },
  { id: "gen", title: "Генерация кода", element: <GenerationSection /> },
  { id: "editor", title: "Редактор архитектуры", element: <EditorSection /> },
  {
    id: "playground",
    title: "Песочница: обучение в браузере",
    element: <PlaygroundSection />,
  },
  { id: "kb", title: "База знаний", element: <KnowledgeBaseSection /> },
];

const FeaturesWrapper: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const goPrev = () =>
    setActiveIndex((prev) => (prev - 1 + PAGES.length) % PAGES.length);
  const goNext = () => setActiveIndex((prev) => (prev + 1) % PAGES.length);

  const current = PAGES[activeIndex];

  return (
    <section className={styles["features-wrapper"]}>
      <div className="container">
        <h2 className={styles["features-wrapper__title"]}>{current.title}</h2>

        <div className={styles["features-wrapper__nav"]}>
          <button
            onClick={goPrev}
            aria-label="Предыдущая возможность"
            className={styles["features-wrapper__btn"]}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className={styles["features-wrapper__icon"]}
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7.44483 3.22192C7.35108 3.12828 7.224 3.07569 7.0915 3.07569C6.959 3.07569 6.83191 3.12828 6.73816 3.22192L2.3135 7.64658C2.21986 7.74033 2.16727 7.86741 2.16727 7.99992C2.16727 8.13242 2.21986 8.2595 2.3135 8.35325L6.73816 12.7779C6.83295 12.8662 6.95831 12.9143 7.08784 12.912C7.21738 12.9097 7.34097 12.8573 7.43258 12.7657C7.52419 12.6741 7.57666 12.5505 7.57895 12.4209C7.58123 12.2914 7.53315 12.166 7.44483 12.0712L3.87416 8.49992H13.3335C13.4661 8.49992 13.5933 8.44724 13.687 8.35347C13.7808 8.2597 13.8335 8.13252 13.8335 7.99992C13.8335 7.86731 13.7808 7.74013 13.687 7.64636C13.5933 7.55259 13.4661 7.49992 13.3335 7.49992L3.8735 7.49992L7.44483 3.92858C7.53846 3.83483 7.59106 3.70775 7.59106 3.57525C7.59106 3.44275 7.53846 3.31567 7.44483 3.22192Z"
                fill="currentColor"
              />
            </svg>
          </button>
          <button
            onClick={goNext}
            aria-label="Следующая возможность"
            className={styles["features-wrapper__btn"]}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className={styles["features-wrapper__icon"]}
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M8.55517 12.7781C8.64892 12.8717 8.776 12.9243 8.9085 12.9243C9.041 12.9243 9.16809 12.8717 9.26184 12.7781L13.6865 8.35342C13.7801 8.25967 13.8327 8.13259 13.8327 8.00008C13.8327 7.86758 13.7801 7.7405 13.6865 7.64675L9.26184 3.22209C9.16705 3.13377 9.04169 3.08568 8.91216 3.08797C8.78262 3.09025 8.65903 3.14273 8.56742 3.23434C8.47581 3.32595 8.42334 3.44954 8.42105 3.57907C8.41877 3.7086 8.46685 3.83397 8.55517 3.92875L12.1258 7.50008H2.6665C2.5339 7.50008 2.40672 7.55276 2.31295 7.64653C2.21918 7.7403 2.1665 7.86748 2.1665 8.00008C2.1665 8.13269 2.21918 8.25987 2.31295 8.35364C2.40672 8.44741 2.5339 8.50008 2.6665 8.50008H12.1265L8.55517 12.0714C8.46154 12.1652 8.40894 12.2923 8.40894 12.4248C8.40894 12.5573 8.46154 12.6843 8.55517 12.7781Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>

        <div
          key={activeIndex}
          className={styles["features-wrapper__page"]}
        >
          {current.element}
        </div>
        <div className={styles["features-wrapper__indicator"]}>
          {PAGES.map((_, i) =>
            i === activeIndex ? (
              <span key={i} className={styles["features-wrapper__line"]} />
            ) : (
              <span key={i} className={styles["features-wrapper__dot"]} />
            )
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturesWrapper;
