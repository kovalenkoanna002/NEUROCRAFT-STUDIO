import React from "react";
import styles from "./VisualizationSection.module.scss";
import { NetworkAnim } from "./FeatureAnimations";

const VisualizationSection: React.FC = () => {
  return (
    <section className={styles.visualization}>
      <h2
        className={styles["visualization__title-right"]}
        data-text="Визуализация"
      >
        Визуализация
      </h2>

      <div className={styles["visualization__content"]}>
        <NetworkAnim />
      </div>
    </section>
  );
};

export default VisualizationSection;
