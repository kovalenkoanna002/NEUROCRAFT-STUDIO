import React from "react";
import styles from "./EditorSection.module.scss";
import { EditorAnim } from "./FeatureAnimations";

const EditorSection: React.FC = () => {
  return (
    <section className={styles.editor}>
      <h2 className={styles["editor__title-right"]} data-text="Редактор ">
        Редактор
      </h2>

      <div className={styles["editor__content"]}>
        <EditorAnim />
      </div>
    </section>
  );
};

export default EditorSection;
