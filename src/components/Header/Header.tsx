import React, { useState, useEffect } from "react";
import "./Header.scss";
import Button from "../Button/Button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../../auth/useAuth";

const Header: React.FC = () => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isHome = pathname === "/";
  const { data: user } = useUser();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = !isHome || scrolled;

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  const goToFeatures = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuOpen(false);
    if (isHome) {
      document
        .getElementById("features")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      navigate("/", { state: { scrollTo: "features" } });
    }
  };
  return (
    <header className={`header ${solid ? "header--solid" : ""}`}>
      <div className="container">
        <div className="header__inner">
          <div className="header__logo">
            <Link to="/" className="header__logo">
              <svg
                width="261"
                height="65"
                viewBox="0 0 261 65"
                className="header__logo-icon"
              >
                <use
                  xlinkHref={`/images/sprite.svg#${solid ? "logo-dark" : "logo"}`}
                />
              </svg>
            </Link>
          </div>

          <nav className={`header__navigation ${isMenuOpen ? "open" : ""}`}>
            <ul className="header__nav-list">
              <li className="header__nav-item">
                <a
                  className="header__nav-link"
                  href="/#features"
                  onClick={goToFeatures}
                >
                  Возможности
                </a>
              </li>
              <li className="header__nav-item">
                <Link
                  className="header__nav-link"
                  to="/visualization"
                  onClick={() => setMenuOpen(false)}
                >
                  Визуализация
                </Link>
              </li>
              <li className="header__nav-item">
                <Link
                  className="header__nav-link"
                  to="/codegeneration"
                  onClick={() => setMenuOpen(false)}
                >
                  Редактор
                </Link>
              </li>
              <li className="header__nav-item">
                <Link
                  className="header__nav-link"
                  to="/playground"
                  onClick={() => setMenuOpen(false)}
                >
                  Песочница
                </Link>
              </li>
              <li className="header__nav-item">
                <Link
                  className="header__nav-link"
                  to="/knowledgebase"
                  onClick={() => setMenuOpen(false)}
                >
                  База знаний
                </Link>
              </li>
            </ul>
            <div className="header__nav-account">
              <Button
                color="outline-blue"
                as="link"
                to={user ? "/account" : "/login"}
              >
                {user ? user.username : "Личный кабинет"}
              </Button>
            </div>
          </nav>
          <div className="header__button-group">
            <Button
              className="header__button"
              color={solid ? "outline-blue" : "outline-white"}
              as="link"
              to={user ? "/account" : "/login"}
            >
              {user ? user.username : "Личный кабинет"}
            </Button>
          </div>
          <div
            className="header__burger"
            onClick={toggleMenu}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleMenu();
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={isMenuOpen ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={isMenuOpen}
          >
            <span
              className={`header__burger-line ${isMenuOpen ? "open" : ""}`}
            ></span>
            <span
              className={`header__burger-line ${isMenuOpen ? "open" : ""}`}
            ></span>
            <span
              className={`header__burger-line ${isMenuOpen ? "open" : ""}`}
            ></span>
            <span
              className={`header__burger-line ${isMenuOpen ? "open" : ""}`}
            ></span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
