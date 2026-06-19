import React from "react";
import styles from "./HeroSection.module.scss";
import Button from "../../../components/Button/Button";

const HERO_NODES: [number, number][] = [
  [80, 110], [210, 300], [150, 470], [330, 90], [300, 430],
  [470, 250], [440, 510], [600, 150], [620, 390], [770, 300],
  [820, 90], [900, 480], [980, 230], [1080, 130], [1120, 410], [1010, 340],
];
const HERO_LINKS: [number, number][] = [];
HERO_NODES.forEach((a, i) => {
  HERO_NODES.forEach((b, j) => {
    if (j <= i) return;
    const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
    if (d < 250) HERO_LINKS.push([i, j]);
  });
});

const HeroNetwork: React.FC = () => (
  <svg
    className={styles["hero__net"]}
    viewBox="0 0 1200 560"
    preserveAspectRatio="xMidYMid slice"
    aria-hidden="true"
  >
    {HERO_LINKS.map(([i, j], k) => (
      <line
        key={k}
        className={styles["hero__link"]}
        x1={HERO_NODES[i][0]}
        y1={HERO_NODES[i][1]}
        x2={HERO_NODES[j][0]}
        y2={HERO_NODES[j][1]}
        style={{ animationDelay: `${(k % 7) * 0.4}s` }}
      />
    ))}
    {HERO_NODES.map(([x, y], i) => (
      <circle
        key={i}
        className={styles["hero__node"]}
        cx={x}
        cy={y}
        r={i % 3 === 0 ? 4.5 : 3}
        style={{ animationDelay: `${(i % 5) * 0.6}s` }}
      />
    ))}
  </svg>
);

const HeroSection: React.FC = () => {
  return (
    <section className={styles.hero}>
      <div className={styles["hero__decor"]} aria-hidden="true">
        <HeroNetwork />
      </div>
      <div className={styles.hero__background}>
        <div className="container">
          <div className={styles.hero__content}>
            <h1 className={styles.hero__title}>NEUROCRAFT STUDIO</h1>
            <div className={styles.hero__wrapper}>
              <p className={styles.hero__subtitle}>
                Платформа для работы с архитектурами ИИ, от визуализации до
                генерации кода
              </p>
              <Button
                color="link"
                type="button"
                as="link"
                to="/login"
                className={styles.hero__button}
              >
                Попробовать сейчас
              </Button>
            </div>
            <svg
              width="457"
              height="433"
              viewBox="0 0 457 433"
              className={styles.hero__icon}
            >
              <use href="/images/sprite.svg#img-hero" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
