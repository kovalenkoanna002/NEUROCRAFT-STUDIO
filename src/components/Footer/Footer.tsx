import { FC } from "react";
import styles from "./Footer.module.scss";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";

const Footer: FC = () => {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footer__container}>
          <div className={styles.footer__logo}>
            <Link to="/" className="footer__logo">
              <svg width="261" height="65" className="footer__logo-icon">
                <use href="/images/sprite.svg#logo" />
              </svg>
            </Link>
          </div>
          <nav className={styles.nav}>
            <ul className={styles.nav__list}>
              <li>
                <Link to="/about" className={styles.nav__link}>
                  Главная
                </Link>
              </li>

              <li>
                <HashLink smooth to="/#science" className={styles.nav__link}>
                  Возможности
                </HashLink>
              </li>
              <li>
                <Link to="/codegeneration" className={styles.nav__link}>
                  Визуализация архитектуры
                </Link>
              </li>
              <li>
                <Link to="/codegeneration" className={styles.nav__link}>
                  Генерация кода
                </Link>
              </li>
              <li>
                <Link to="/codegeneration" className={styles.nav__link}>
                  Редактор архитектуры
                </Link>
              </li>
              <li>
                <Link to="/codegeneration" className={styles.nav__link}>
                  База знаний
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        <p className={styles.footer__copi}>
          © 2026 NeuroCraft Studio. Все права защищены.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
