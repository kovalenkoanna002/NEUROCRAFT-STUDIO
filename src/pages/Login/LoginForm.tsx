import styles from "./LoginForm.module.scss";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FC } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "../../components/Button/Button";
import { FormField } from "../../components/FormField/FormField";
import { PageMeta } from "../../components/PageMeta/PageMeta";
import { useAuth } from "../../auth/useAuth";

const LoginFormSchema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(8, "Пароль должен содержать не менее 8 символов"),
});

type LoginFormValues = z.infer<typeof LoginFormSchema>;

interface LocationState {
  from?: { pathname: string };
}

export const LoginForm: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signingIn, signInError } = useAuth();
  const from = (location.state as LocationState | null)?.from?.pathname ?? "/account";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(LoginFormSchema),
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      await signIn(data);
      navigate(from, { replace: true });
    } catch {

    }
  });

  return (
    <div className={styles["login-form"]}>
      <PageMeta
        title="Вход в личный кабинет"
        description="Войдите в личный кабинет NeuroCraft Studio, чтобы сохранять и открывать свои архитектуры нейросетей."
      />
      <div className="container">
        <div className={styles["login-form__inner"]}>
          <Link to="/" className={styles["login-form__logo"]}>
            <svg
              width="294"
              height="65"
              viewBox="0 0 294 65"
              className={styles["login-form__logo-icon"]}
            >
              <use xlinkHref="/images/sprite.svg#logo" />
            </svg>
          </Link>
          <h1 className={styles["login-form__title"]}>Вход</h1>
          <form className={styles["login-form__form"]} onSubmit={onSubmit}>
            <FormField label="Email" errorMessage={errors.email?.message}>
              <input
                type="email"
                placeholder="Введите email"
                autoComplete="email"
                {...register("email")}
              />
            </FormField>
            <FormField label="Пароль" errorMessage={errors.password?.message}>
              <input
                type="password"
                placeholder="Введите пароль"
                autoComplete="current-password"
                {...register("password")}
              />
            </FormField>

            {signInError && (
              <p className={styles["login-form__error"]}>
                {signInError.message}
              </p>
            )}

            <div className={styles["login-form__register"]}>
              <Link
                className={styles["login-form__register-link"]}
                to="/registration"
              >
                Зарегистрироваться
              </Link>
            </div>

            <Button
              className={styles["login-form__button"]}
              type="submit"
              color="outline-white"
              isLoading={signingIn}
            >
              Войти
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
