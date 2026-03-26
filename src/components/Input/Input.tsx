import cx from "classnames";
import { ChangeEventHandler, FC, forwardRef, KeyboardEventHandler } from "react";
import styles from "./Input.module.scss";

type Props = {
  label: string;
  value: string | undefined;
  onChange: ChangeEventHandler<HTMLInputElement>;
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
  classNames?: string;
  disabled?: boolean;
  "aria-label"?: string;
};

const Input = forwardRef<HTMLInputElement, Props>(({
  label,
  value = "",
  onChange,
  onKeyDown,
  classNames,
  disabled = false,
  "aria-label": ariaLabel,
}, ref) => {
  return (
    <input
      ref={ref}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      type="text"
      placeholder={label}
      className={cx(styles.input, classNames)}
      disabled={disabled}
      {...(ariaLabel && { "aria-label": ariaLabel })}
    />
  );
});

Input.displayName = "Input";

export default Input;
