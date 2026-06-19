import { useState } from "react";
import { Editor } from "@monaco-editor/react";
import Button from "../../components/Button/Button";
import styles from "./ResultCode.module.scss";

interface ResultCodeProps {
  code: string;
}

const ResultCode: React.FC<ResultCodeProps> = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const isTfjs = code.includes("import * as tf");
  const language = isTfjs ? "typescript" : "python";

  const handleCopy = async () => {
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownload = () => {
    if (!code) return;
    const fileName = isTfjs ? "model.ts" : "model.py";
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <section className={styles["result-code"]}>
      <div className={styles["result-code__container"]}>
        <div className="container">
          <h2 className={styles["result-code__title"]}>
            Код вашей нейронной сети
          </h2>

          {code ? (
            <>
              <Editor
                height="360px"
                language={language}
                theme="vs"
                value={code}
                options={{
                  readOnly: true,
                  wordWrap: "on",
                  scrollBeyondLastLine: false,
                  minimap: { enabled: false },
                  fontSize: 14,
                  padding: { top: 16, bottom: 16 },
                }}
              />
              <div className={styles["result-code__actions"]}>
                <Button type="button" color="outline-blue" onClick={handleCopy}>
                  {copied ? "Скопировано!" : "Скопировать код"}
                </Button>
                <Button type="button" color="filled" onClick={handleDownload}>
                  Скачать {isTfjs ? "model.ts" : "model.py"}
                </Button>
              </div>
            </>
          ) : (
            <p>
              Соберите архитектуру выше и нажмите «Сгенерировать код» —
              результат появится здесь.
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default ResultCode;
