import Footer from "../../components/Footer/Footer";
import Header from "../../components/Header/Header";
import Architecture from "./Architecture";
import ProgramCode from "./ProgramCode";
import { NeuralNetwork } from "./NetworkVisualization";
import { GanSpec } from "../../auth/projects";
import { AutoGlossary } from "../../components/GlossaryTerm/GlossaryTerm";
import { PageMeta } from "../../components/PageMeta/PageMeta";
import { usePersistedState } from "../../hooks/usePersistedState";
import styles from "./VisualizationArсhitecture.module.scss";

const VisualizationArchitecture: React.FC = () => {

  const [network, setNetwork] = usePersistedState<NeuralNetwork | undefined>(
    "neurocraft.draft.viz.network",
    undefined
  );
  const [gan, setGan] = usePersistedState<GanSpec | undefined>(
    "neurocraft.draft.viz.gan",
    undefined
  );

  return (
    <>
      <PageMeta
        title="Визуализация архитектуры нейросети из кода"
        description="Вставьте код нейросети на Python — и получите наглядную схему её архитектуры: слои, их типы и связи между ними."
      />
      <Header />
      <main>
        <div className={styles["visualization-generation"]}>
          <div className={styles["visualization-generation__container"]}>
            <div className="container">
              <h1 className={styles["visualization-generation__title"]}>
                Визуализация архитектуры нейронной сети из программного кода
              </h1>
              <div className={styles["visualization-generation__description"]}>
                <p className={styles["visualization-generation__text"]}>
                  Введите код вашей нейронной сети
                </p>
                <p
                  className={
                    styles["visualization-generation__description-text"]
                  }
                >
                  <AutoGlossary>
                    Здесь вы&nbsp;можете ввести код на&nbsp;Python, который
                    описывает архитектуру вашей нейронной сети,
                    и&nbsp;отправить его для анализа.
                  </AutoGlossary>
                </p>
                <ProgramCode
                  onParsed={(n) => {
                    setGan(undefined);
                    setNetwork(n);
                  }}
                  onParsedGan={(g) => {
                    setNetwork(undefined);
                    setGan(g);
                  }}
                />
              </div>
              <Architecture network={network} gan={gan} />
            </div>
          </div>
        </div>
      </main>
      <footer>
        <Footer />
      </footer>
    </>
  );
};

export default VisualizationArchitecture;
