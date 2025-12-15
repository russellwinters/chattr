import { FC, ReactNode } from "react";
import cx from "classnames";
import styles from "./Button.module.scss";

type Props = {
  onClick: () => void;
  children: ReactNode;
  classNames?: string;
  disabled?: boolean;
  "aria-label"?: string;
};

const Button: FC<Props> = ({ onClick, children, classNames, disabled = false, "aria-label": ariaLabel }) => {
  return (
    <button 
      type="button"
      className={cx(styles.button, classNames)} 
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
};

export default Button;
