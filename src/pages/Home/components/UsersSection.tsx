import React from "react";
import { Link } from "react-router-dom";
import styles from "./UsersSection.module.scss";

type Audience = {
  img: number;
  tags: string[];
  title: string;
  desc: string;
  accent: string;
  to: string;
};

const AUDIENCES: Audience[] = [
  {
    img: 1,
    tags: ["Студенты", "Новички"],
    title: "Освой нейросети с нуля",
    desc: "Интерактивные статьи, глоссарий и визуальные демонстрации — от перцептрона до трансформера.",
    accent: "#2563EB",
    to: "/knowledgebase",
  },
  {
    img: 2,
    tags: ["Исследователи"],
    title: "Экспериментируй с архитектурами",
    desc: "Собирай CNN, RNN и трансформеры, обучай модели прямо в браузере и сравнивай результаты.",
    accent: "#7C3AED",
    to: "/playground",
  },
  {
    img: 3,
    tags: ["Разработчики"],
    title: "Разрабатывай и внедряй решения",
    desc: "Экспортируй готовый код в Keras, PyTorch или TensorFlow.js одним кликом.",
    accent: "#0891B2",
    to: "/codegeneration",
  },
  {
    img: 4,
    tags: ["Самоучки", "Новички"],
    title: "Изучай и делись знаниями",
    desc: "140 статей с проверенными источниками и личный кабинет для сохранения архитектур.",
    accent: "#16A34A",
    to: "/account",
  },
];

const UsersSection: React.FC = () => {
  return (
    <section className={styles.users}>
      <div className="container">
        <h2
          className={styles.users__title}
          data-text="Для кого создана NeuroCraft Studio"
        >
          Для кого создана NeuroCraft Studio
        </h2>
        <ul className={styles.users__list}>
          {AUDIENCES.map((a) => (
            <li key={a.img} className={styles.users__item}>
              <Link
                to={a.to}
                className={styles.users__card}
                style={{ "--accent": a.accent } as React.CSSProperties}
              >
                <div className={styles.users__halo}>
                  <img
                    className={styles["users__card-img"]}
                    src={`/images/home/usersSection/users-img-${a.img}.png`}
                    srcSet={`/images/home/usersSection/users-img-${a.img}@2x.png 2x`}
                    alt=""
                    loading="lazy"
                  />
                </div>
                <div className={styles.users__body}>
                  <ul className={styles["users__card-tags"]}>
                    {a.tags.map((t) => (
                      <li key={t} className={styles["users__card-tag"]}>
                        {t}
                      </li>
                    ))}
                  </ul>
                  <h3 className={styles["users__card-title"]}>{a.title}</h3>
                  <p className={styles["users__card-desc"]}>{a.desc}</p>
                  <span className={styles["users__card-cta"]}>
                    Подробнее
                    <span className={styles["users__card-arrow"]}>→</span>
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default UsersSection;
