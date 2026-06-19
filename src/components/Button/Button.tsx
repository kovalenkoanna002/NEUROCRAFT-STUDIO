import React from "react";
import { Link } from "react-router-dom";
import classNames from "classnames";
import styles from "./Button.module.scss";
import Loader from "../Loader/Loader";

interface ButtonProps {
  isLoading?: boolean;
  isDisabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit" | "reset";
  color?:
    | "primary"
    | "default"
    | "link"
    | "filled"
    | "outline-blue"
    | "outline-white";
  as?: "button" | "link";
  to?: string;
}

const Button: React.FC<ButtonProps> = ({
  isLoading,
  isDisabled = isLoading,
  children,
  onClick,
  className = "",
  type = "button",
  color = "default",
  as = "button",
  to = "",
}) => {
  const buttonClass = classNames(
    styles.button,
    styles[`button--${color}`],
    className
  );

  if (as === "link" && to) {
    return (
      <Link to={to} className={buttonClass}>
        {isLoading ? <Loader /> : children}
      </Link>
    );
  }

  return (
    <button
      disabled={isDisabled}
      className={buttonClass}
      onClick={onClick}
      type={type}
    >
      {isLoading ? <Loader /> : children}
    </button>
  );
};

export default Button;
