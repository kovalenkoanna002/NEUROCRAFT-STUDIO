import React from "react";
import styles from "./GenerationSection.module.scss";
import { CodeGenAnim } from "./FeatureAnimations";

const GenerationSection: React.FC = () => {
  return (
    <section className={styles.generation}>
      <h2
        className={styles["generation__title-right"]}
        data-text="Генерация кода"
      >
        Генерация кода
      </h2>

      <div className={styles["generation__content"]}>
        <CodeGenAnim />
      </div>
    </section>
  );
};

export default GenerationSection;
