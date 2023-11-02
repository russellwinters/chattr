import { FC, ReactNode } from "react";
import cx from "classnames";
import styles from "./Button.module.scss";

type Props = {
  onClick: () => void;
  children: ReactNode;
  classNames?: string;
};

const Button: FC<Props> = ({ onClick, children, classNames }) => {
  return (
    <button className={cx(styles.button, classNames)} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
