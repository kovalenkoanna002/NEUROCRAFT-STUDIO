import styles from "./RegisterForm.module.scss";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FC } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { FormField } from "../../components/FormField/FormField";
import Button from "../../components/Button/Button";
import { PageMeta } from "../../components/PageMeta/PageMeta";
import { useAuth } from "../../auth/useAuth";

const RegisterFormSchema = z
  .object({
    username: z
      .string()
      .min(2, "Имя должно содержать не менее 2 символов"),
    email: z.string().email("Введите корректный email"),
    password: z.string().min(8, "Пароль должен содержать не менее 8 символов"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof RegisterFormSchema>;

export const RegisterForm: FC = () => {
  const navigate = useNavigate();
  const { signUp, signingUp, signUpError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(RegisterFormSchema),
  });

  const onSubmit = handleSubmit(async ({ username, email, password }) => {
    try {
      await signUp({ username, email, password });
      navigate("/account", { replace: true });
    } catch {

    }
  });

  return (
    <div className={styles["registration-form"]}>
      <PageMeta
        title="Регистрация"
        description="Создайте аккаунт NeuroCraft Studio, чтобы сохранять архитектуры нейросетей в личном кабинете."
      />
      <div className="container">
        <div className={styles["registration-form__inner"]}>
          <Link to="/" className={styles["registration-form__logo"]}>
            <svg
              width="294"
              height="65"
              viewBox="0 0 294 65"
              className={styles["registration-form__logo-icon"]}
            >
              <use xlinkHref="/images/sprite.svg#logo" />
            </svg>
          </Link>
          <h1 className={styles["registration-form__title"]}>Регистрация</h1>
          <form
            className={styles["registration-form__form"]}
            onSubmit={onSubmit}
          >
            <FormField label="Имя" errorMessage={errors.username?.message}>
              <input
                type="text"
                placeholder="Введите имя пользователя"
                autoComplete="username"
                {...register("username")}
              />
            </FormField>
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
                autoComplete="new-password"
                {...register("password")}
              />
            </FormField>
            <FormField
              label="Повторите пароль"
              errorMessage={errors.confirmPassword?.message}
            >
              <input
                type="password"
                placeholder="Повторите пароль"
                autoComplete="new-password"
                {...register("confirmPassword")}
              />
            </FormField>

            {signUpError && (
              <p className={styles["registration-form__error"]}>
                {signUpError.message}
              </p>
            )}

            <div className={styles["registration-form__register"]}>
              <Link
                className={styles["registration-form__register-link"]}
                to="/login"
              >
                У меня уже есть аккаунт
              </Link>
            </div>
            <Button
              className={styles["registration-form__button"]}
              type="submit"
              color="outline-white"
              isLoading={signingUp}
            >
              Зарегистрироваться
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
