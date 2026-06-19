import React, { useEffect, useRef, useState } from "react";
import { Editor, useMonaco } from "@monaco-editor/react";
import * as monacoEditor from "monaco-editor";
import styles from "./CodeEditor.module.css";

interface CodeEditorProps {
  code: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code }) => {
  const [copyStatus, setCopyStatus] = useState("Скопировать");
  const editorRef = useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(
    null
  );
  const monaco = useMonaco();

  useEffect(() => {
    const resizeEditor = () => {
      if (editorRef.current) {
        const editor = editorRef.current;
        const contentHeight = editor.getContentHeight();
        editor.layout({
          width: editor.getLayoutInfo().width,
          height: contentHeight,
        });
      }
    };

    resizeEditor();
    window.addEventListener("resize", resizeEditor);
    return () => {
      window.removeEventListener("resize", resizeEditor);
    };
  }, [monaco]);

  const handleCopyCode = () => {
    if (editorRef.current) {
      const code = editorRef.current.getValue();
      navigator.clipboard.writeText(code).then(
        () => {
          setCopyStatus("Скопировано!");
          setTimeout(() => {
            setCopyStatus("Скопировать");
          }, 2000);
        },
        (err) => {
          console.error("Не удалось скопировать код: ", err);
        }
      );
    }
  };

  return (
    <div className={styles.form__editor}>
      <div className={styles.header}>
        <p>python</p>
        <button className={styles.copyButton} onClick={handleCopyCode}>
          {copyStatus}
        </button>
      </div>
      <div className={styles.code_editor}>
        <Editor
          className={styles.codeEditor}
          defaultLanguage="python"
          theme="vs-dark"
          value={code}
          onMount={(editor) => {
            editorRef.current = editor;
            editor.onDidContentSizeChange(() => {
              const contentHeight = editor.getContentHeight();
              editor.layout({
                width: editor.getLayoutInfo().width,
                height: contentHeight,
              });
            });
          }}
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
    </div>
  );
};

export default CodeEditor;
