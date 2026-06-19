import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import Button from "../../components/Button/Button";
import { PageMeta } from "../../components/PageMeta/PageMeta";
import styles from "./NotFound.module.scss";

const NotFound: React.FC = () => {
  return (
    <>
      <PageMeta title="Страница не найдена" />
      <Header />
      <main className={styles.notfound}>
        <div className="container">
          <div className={styles.notfound__inner}>
            <p className={styles.notfound__code}>404</p>
            <h1 className={styles.notfound__title}>Страница не найдена</h1>
            <p className={styles.notfound__text}>
              Похоже, такой страницы нет или она была перемещена. Вернитесь на
              главную и продолжите работу с&nbsp;нейронными сетями.
            </p>
            <div className={styles.notfound__actions}>
              <Button as="link" to="/" color="filled">
                На главную
              </Button>
              <Button as="link" to="/codegeneration" color="outline-blue">
                Открыть редактор
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default NotFound;
