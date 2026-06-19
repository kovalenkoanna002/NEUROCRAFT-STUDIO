import React from "react";
import styles from "./PlaygroundSection.module.scss";
import { PlaygroundAnim } from "./FeatureAnimations";

const PlaygroundSection: React.FC = () => {
  return (
    <section className={styles.playground}>
      <h2 className={styles["playground__title-right"]} data-text="Песочница">
        Песочница
      </h2>

      <div className={styles["playground__content"]}>
        <PlaygroundAnim />
      </div>
    </section>
  );
};

export default PlaygroundSection;
