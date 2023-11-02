import cx from "classnames";
import { FC } from "react";
import styles from "./Input.module.scss";

type Props = {
  label: string;
  value: string | undefined;
  onChange: (val: string) => void;
  onKeyDown?: (e) => void;
  classNames?: string;
};

const Input: FC<Props> = ({
  label,
  value = "",
  onChange,
  onKeyDown,
  classNames,
}) => {
  return (
    <input
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      type="text"
      placeholder={label}
      className={cx(styles.input, classNames)}
    />
  );
};

export default Input;
