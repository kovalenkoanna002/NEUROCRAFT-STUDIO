import React, { useState } from "react";
import { Editor, EditorProps } from "@monaco-editor/react";
import styles from "./ProgramCode.module.scss";

import { queryClient } from "../../api/queryClient";
import { useMutation } from "@tanstack/react-query";
import { submitCode } from "../../api/Code";
import { parseGanFromCode } from "../../api/mock/parseCode";
import { GanSpec } from "../../auth/projects";
import { NeuralNetwork } from "./NetworkVisualization";
import Button from "../../components/Button/Button";
import { usePersistedState } from "../../hooks/usePersistedState";

interface ProgramCodeProps {

  onParsed?: (network: NeuralNetwork) => void;

  onParsedGan?: (spec: GanSpec) => void;
}

const SAMPLE = `model = keras.Sequential([
    keras.Input(shape=(4,)),
    layers.Dense(16, activation='relu'),
    layers.Dense(8, activation='relu'),
    layers.Dense(3, activation='softmax'),
])`;

const EXAMPLES: { label: string; code: string }[] = [
  { label: "Полносвязная (MLP)", code: SAMPLE },
  {
    label: "Свёрточная (CNN)",
    code: `model = keras.Sequential([
    keras.Input(shape=(28, 28, 1)),
    layers.Conv2D(6, (5, 5), activation='tanh'),
    layers.MaxPooling2D(pool_size=(2, 2)),
    layers.Conv2D(16, (5, 5), activation='tanh'),
    layers.MaxPooling2D(pool_size=(2, 2)),
    layers.Flatten(),
    layers.Dense(120, activation='tanh'),
    layers.Dense(84, activation='tanh'),
    layers.Dense(10, activation='softmax'),
])`,
  },
  {
    label: "Рекуррентная (LSTM)",
    code: `model = keras.Sequential([
    layers.Embedding(input_dim=10000, output_dim=64),
    layers.LSTM(128),
    layers.Dense(64, activation='relu'),
    layers.Dense(2, activation='softmax'),
])`,
  },
  {
    label: "Трансформер",
    code: `model = keras.Sequential([
    layers.Embedding(input_dim=20000, output_dim=128),
    TransformerBlock(num_heads=4, ff_dim=128),
    layers.GlobalAveragePooling1D(),
    layers.Dense(64, activation='relu'),
    layers.Dense(3, activation='softmax'),
])`,
  },
  {
    label: "GAN",
    code: `LATENT_DIM = 100
DATA_DIM = 784

def build_generator():
    return keras.Sequential([
        keras.Input(shape=(LATENT_DIM,)),
        layers.Dense(128, activation='relu'),
        layers.Dense(256, activation='relu'),
        layers.Dense(DATA_DIM, activation='tanh'),
    ])

def build_discriminator():
    return keras.Sequential([
        keras.Input(shape=(DATA_DIM,)),
        layers.Dense(256, activation='relu'),
        layers.Dense(128, activation='relu'),
        layers.Dense(1, activation='sigmoid'),
    ])`,
  },
];

const ProgramCode: React.FC<ProgramCodeProps> = ({ onParsed, onParsedGan }) => {

  const [code, setCode] = usePersistedState<string>(
    "neurocraft.draft.viz.code",
    ""
  );
  const [notRecognized, setNotRecognized] = useState(false);

  const handleCodeChange: EditorProps["onChange"] = (value) => {
    setCode(value || "");
  };

  const isFallback = (net: NeuralNetwork) => {
    const f = [
      ["input", 3],
      ["dense", 8],
      ["dense", 6],
      ["output", 2],
    ] as const;
    return (
      net.layers.length === f.length &&
      net.layers.every((l, i) => l.type === f[i][0] && l.neuronCount === f[i][1])
    );
  };

  const codeMutation = useMutation(
    {
      mutationFn: (modelCode: string) => submitCode(modelCode),
      onSuccess(network) {
        const net = network as NeuralNetwork;

        setNotRecognized(code.trim().length > 0 && isFallback(net));
        onParsed?.(net);
      },
      onError: (error) => {
        console.error("Error submitting code:", error);
      },
    },
    queryClient
  );

  const runCode = (src: string) => {

    const gan = parseGanFromCode(src);
    if (gan) {
      setNotRecognized(false);
      onParsedGan?.(gan);
      return;
    }
    codeMutation.mutate(src);
  };

  const handleSubmit = () => runCode(code || SAMPLE);

  const loadExample = (exampleCode: string) => {
    setCode(exampleCode);
    setNotRecognized(false);
    runCode(exampleCode);
  };

  return (
    <div className={styles.container}>
      <div className={styles.examples}>
        <span className={styles.examplesLabel}>Примеры:</span>
        {EXAMPLES.map((ex) => (
          <button
            key={ex.label}
            type="button"
            className={styles.exampleChip}
            onClick={() => loadExample(ex.code)}
          >
            {ex.label}
          </button>
        ))}
      </div>
      <div className={styles.form__editor}>
        <div className={styles.header}>
          <p>python</p>
        </div>
        <div className={styles.code_editor}>
          <Editor
            className={styles.codeEditor}
            defaultLanguage="python"
            theme="vs"
            value={code}
            onChange={handleCodeChange}
            options={{
              automaticLayout: true,
              wordWrap: "on",
              tabSize: 4,
              scrollBeyondLastLine: false,
              minimap: { enabled: false },
              fontSize: 14,
              padding: { top: 20, bottom: 20 },
            }}
          />
        </div>
        <div className={styles.submitSection}>
          {notRecognized ? (
            <p className={`${styles.hint} ${styles.hintWarn}`}>
              ⚠ Слои не распознаны — показан пример. Поддерживаются Keras,
              TensorFlow.js, PyTorch.
            </p>
          ) : (
            <p className={styles.hint}>
              Keras · TensorFlow.js · PyTorch — можно вставить код из&nbsp;редактора
            </p>
          )}
          <Button
            onClick={handleSubmit}
            className={styles.submitButton}
            type="submit"
            color="filled"
          >
            {codeMutation.isPending ? "Анализ…" : "Визуализировать"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProgramCode;
