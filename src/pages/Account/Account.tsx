import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import Button from "../../components/Button/Button";
import { useAuth } from "../../auth/useAuth";
import { projectsKey, removeProject, useProjects } from "../../auth/projects";
import { PageMeta } from "../../components/PageMeta/PageMeta";
import styles from "./Account.module.scss";

const Account: React.FC = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user, signOut } = useAuth();
  const { data: projects } = useProjects(user?.id);

  if (!user) return null;

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const handleDelete = (id: string) => {
    removeProject(id);
    qc.invalidateQueries({ queryKey: projectsKey(user.id) });
  };

  return (
    <>
      <PageMeta
        title="Личный кабинет"
        description="Ваши сохранённые архитектуры нейросетей в NeuroCraft Studio."
      />
      <Header />
      <main className={styles.account}>
        <div className="container">
          <section className={styles.profile}>
            <div className={styles.avatar}>
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className={styles.profile__info}>
              <h1 className={styles.profile__name}>{user.username}</h1>
              <p className={styles.profile__email}>{user.email}</p>
            </div>
            <button className={styles.logout} onClick={handleLogout}>
              Выйти
            </button>
          </section>

          <h2 className={styles.heading}>Мои архитектуры</h2>

          {projects.length === 0 ? (
            <p className={styles.empty}>
              Пока нет сохранённых архитектур. Соберите сеть в{" "}
              <Link to="/codegeneration">конструкторе</Link> и нажмите
              «Сохранить в кабинет».
            </p>
          ) : (
            <ul className={styles.grid}>
              {projects.map((p) => (
                <li key={p.id} className={styles.card}>
                  <span
                    className={`${styles.badge} ${
                      p.kind === "cnn" ? styles["badge--cnn"] : ""
                    }`}
                  >
                    {p.kind === "cnn"
                      ? "CNN"
                      : p.kind === "rnn"
                      ? "RNN"
                      : p.kind === "transformer"
                      ? "Трансформер"
                      : p.kind === "gan"
                      ? "GAN"
                      : "Перцептрон"}
                  </span>
                  <h3 className={styles.card__name}>{p.name}</h3>
                  <p className={styles.card__meta}>
                    {p.kind === "gan" && p.gan
                      ? `генератор ${p.gan.generator.length + 2} · дискриминатор ${
                          p.gan.discriminator.length + 2
                        }`
                      : `${p.layers.length} слоёв`}{" "}
                    · {new Date(p.createdAt).toLocaleDateString("ru-RU")}
                  </p>
                  <div className={styles.card__actions}>
                    <Button
                      as="link"
                      to={`/codegeneration?project=${p.id}`}
                      color="outline-blue"
                      className={styles.card__open}
                    >
                      Открыть
                    </Button>
                    <button
                      className={styles.card__delete}
                      onClick={() => handleDelete(p.id)}
                    >
                      Удалить
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Account;
