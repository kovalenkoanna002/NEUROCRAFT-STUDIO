import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Footer from "../../components/Footer/Footer";
import Header from "../../components/Header/Header";
import styles from "./CodeGeneration.module.scss";
import CreateArchitecture from "./CreateArchitecture";
import CnnArchitecture from "./CnnArchitecture";
import SequenceArchitecture from "./SequenceArchitecture";
import GanArchitecture from "./GanArchitecture";
import ResultCode from "./ResultCode";
import { AutoGlossary } from "../../components/GlossaryTerm/GlossaryTerm";
import { getProject } from "../../auth/projects";
import { TEMPLATES, getTemplate } from "../../data/templates";
import { PageMeta } from "../../components/PageMeta/PageMeta";
import { usePersistedState } from "../../hooks/usePersistedState";

type NetworkKind = "perceptron" | "cnn" | "rnn" | "transformer" | "gan";

const KIND_TABS: { value: NetworkKind; label: string }[] = [
  { value: "perceptron", label: "Персептрон" },
  { value: "cnn", label: "Свёрточная (CNN)" },
  { value: "rnn", label: "Рекуррентная (RNN)" },
  { value: "transformer", label: "Трансформер" },
  { value: "gan", label: "GAN" },
];

const CodeGeneration: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [generatedCode, setGeneratedCode] = usePersistedState<string>(
    "neurocraft.draft.generatedCode",
    ""
  );

  const templateId = searchParams.get("template");
  const template = templateId ? getTemplate(templateId) : null;
  const projectId = searchParams.get("project");
  const project = projectId ? getProject(projectId) : null;
  const loaded = template ?? project;
  const loadKey = templateId ?? projectId ?? "blank";

  const [kind, setKind] = usePersistedState<NetworkKind>(
    loaded || searchParams.get("type") ? null : "neurocraft.draft.kind",
    loaded
      ? loaded.kind
      : searchParams.get("type") === "cnn"
      ? "cnn"
      : "perceptron"
  );

  useEffect(() => {
    if (loaded) setKind(loaded.kind);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadKey]);

  return (
    <>
      <PageMeta
        title="Редактор архитектур и генерация кода"
        description="Соберите нейросеть в графическом редакторе и получите готовый код на Keras, PyTorch или TensorFlow.js."
      />
      <Header />
      <main>
        <section className={styles["code-generation"]}>
          <div className={styles["code-generation__container"]}>
            <div className="container">
              <h1 className={styles["code-generation__title"]}>
                Создание архитектуры нейронной сети с&nbsp;нуля и&nbsp;генерация
                кода
              </h1>
              <div className={styles["code-generation__description"]}>
                <p>
                  <AutoGlossary>
                    Введите параметры вашей нейронной сети, и мы сгенерируем
                    код для её создания.
                  </AutoGlossary>
                </p>
                <p>
                  <AutoGlossary>
                    Вы можете настроить количество слоёв, типы активации и
                    другие параметры. Или начните с готового шаблона.
                  </AutoGlossary>
                </p>
              </div>
            </div>
            <div className="container">
              <div
                role="tablist"
                style={{
                  display: "flex",
                  gap: 8,
                  marginBottom: 12,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                {KIND_TABS.map((t) => (
                  <button
                    key={t.value}
                    role="tab"
                    aria-selected={kind === t.value}
                    onClick={() => setKind(t.value)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 8,
                      border: "1px solid #1D4ED8",
                      cursor: "pointer",
                      background: kind === t.value ? "#1D4ED8" : "#fff",
                      color: kind === t.value ? "#fff" : "#1D4ED8",
                    }}
                  >
                    {t.label}
                  </button>
                ))}
                <select
                  value=""
                  onChange={(e) =>
                    e.target.value &&
                    navigate(`/codegeneration?template=${e.target.value}`)
                  }
                  style={{
                    padding: "8px 36px 8px 12px",
                    borderRadius: 8,
                    border: "1px solid #1D4ED8",
                    color: "#1D4ED8",
                    cursor: "pointer",

                    maxWidth: "100%",
                    minWidth: 0,

                    appearance: "none",
                    WebkitAppearance: "none",
                    MozAppearance: "none",
                    backgroundColor: "#fff",
                    backgroundImage:
                      "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'><path d='M2 4l4 4 4-4' fill='none' stroke='%231D4ED8' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/></svg>\")",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 12px center",
                  }}
                >
                  <option value="">📋 Шаблоны…</option>
                  {TEMPLATES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <Link
                  to={`/knowledgebase?article=${
                    {
                      perceptron: "mlp",
                      cnn: "cnn",
                      rnn: "rnn",
                      transformer: "transformers",
                      gan: "gan",
                    }[kind]
                  }`}
                  style={{
                    marginLeft: "auto",
                    alignSelf: "center",
                    color: "#1D4ED8",
                    fontSize: 14,
                  }}
                >
                  📖 Подробнее в базе знаний →
                </Link>
              </div>
              {template && (
                <p
                  style={{
                    margin: "0 0 16px",
                    color: "#475569",
                    fontSize: 15,
                  }}
                >
                  <b>{template.name}.</b> {template.description}
                </p>
              )}
            </div>
            <div className={styles["code-generation__architecture"]}>
              {kind === "perceptron" && (
                <CreateArchitecture
                  key={loadKey}
                  onGenerateCode={setGeneratedCode}
                  initialLayers={
                    loaded?.kind === "perceptron" ? loaded.layers : undefined
                  }
                  initialLabels={
                    loaded && "ownerId" in loaded && loaded.kind === "perceptron"
                      ? loaded.labels
                      : undefined
                  }
                />
              )}
              {kind === "cnn" && (
                <div className="container">
                  <CnnArchitecture
                    key={loadKey}
                    onGenerateCode={setGeneratedCode}
                    initialLayers={
                      loaded?.kind === "cnn" ? loaded.layers : undefined
                    }
                    initialLabels={
                      loaded && "ownerId" in loaded && loaded.kind === "cnn"
                        ? loaded.labels
                        : undefined
                    }
                  />
                </div>
              )}
              {(kind === "rnn" || kind === "transformer") && (
                <div className="container">
                  <SequenceArchitecture
                    key={`${loadKey}-${kind}`}
                    variant={kind}
                    onGenerateCode={setGeneratedCode}
                    initialLayers={
                      loaded?.kind === kind ? loaded.layers : undefined
                    }
                    initialLabels={
                      loaded && "ownerId" in loaded && loaded.kind === kind
                        ? loaded.labels
                        : undefined
                    }
                  />
                </div>
              )}
              {kind === "gan" && (
                <div className="container">
                  <GanArchitecture
                    key={loadKey}
                    onGenerateCode={setGeneratedCode}
                    initialGan={
                      loaded && loaded.kind === "gan" && "gan" in loaded
                        ? loaded.gan
                        : undefined
                    }
                    initialLabels={
                      loaded && "ownerId" in loaded && loaded.kind === "gan"
                        ? loaded.labels
                        : undefined
                    }
                  />
                </div>
              )}
            </div>
            <ResultCode code={generatedCode} />
          </div>
        </section>
        <footer>
          <Footer />
        </footer>
      </main>
    </>
  );
};

export default CodeGeneration;
