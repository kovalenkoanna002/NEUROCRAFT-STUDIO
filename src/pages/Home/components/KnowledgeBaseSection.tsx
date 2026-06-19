import React from "react";
import styles from "./KnowledgeBaseSection.module.scss";
import { KnowledgeAnim } from "./FeatureAnimations";

const KnowledgeBaseSection: React.FC = () => {
  return (
    <section className={styles.knowledge}>
      <h2 className={styles["knowledge__title-right"]} data-text="База знаний">
        База знаний
      </h2>

      <div className={styles["knowledge__content"]}>
        <KnowledgeAnim />
      </div>
    </section>
  );
};

export default KnowledgeBaseSection;
