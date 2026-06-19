import React from "react";
import styles from "./ErrorBoundary.module.scss";

interface Props {
  children: React.ReactNode;

  resetKey?: string;
}

interface State {
  hasError: boolean;
  message?: string;
  isChunkError?: boolean;
}

const isChunkLoadError = (error: Error): boolean =>
  error.name === "ChunkLoadError" ||
  /dynamically imported module|Loading chunk|Failed to fetch/i.test(
    error.message
  );

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error.message,
      isChunkError: isChunkLoadError(error),
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {

    console.error("Перехвачена ошибка интерфейса:", error, info);
  }

  componentDidUpdate(prev: Props) {

    if (this.state.hasError && prev.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false, message: undefined, isChunkError: false });
    }
  }

  handleReset = () =>
    this.setState({ hasError: false, message: undefined, isChunkError: false });

  handleReload = () => window.location.reload();

  render() {
    if (!this.state.hasError) return this.props.children;

    if (this.state.isChunkError) {
      return (
        <div className={styles.wrap} role="alert">
          <div className={styles.card}>
            <h1 className={styles.title}>Обновите страницу</h1>
            <p className={styles.text}>
              Не удалось загрузить часть приложения — вероятно, вышла новая
              версия. Обновите страницу, чтобы продолжить.
            </p>
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.primary}
                onClick={this.handleReload}
              >
                Обновить страницу
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.wrap} role="alert">
        <div className={styles.card}>
          <h1 className={styles.title}>Что-то пошло не так</h1>
          <p className={styles.text}>
            Произошла непредвиденная ошибка при отображении этого раздела.
            Попробуйте вернуться назад или обновить страницу — ваши сохранённые
            проекты не пострадали.
          </p>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.primary}
              onClick={this.handleReset}
            >
              Попробовать снова
            </button>
            <a className={styles.secondary} href="/">
              На главную
            </a>
          </div>
        </div>
      </div>
    );
  }
}
