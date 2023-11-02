import cx from "classnames";
import { FC, ReactNode } from "react";
import styles from "./MessageBox.module.scss";

type Props = {
  children: ReactNode;
  incoming?: boolean;
  classNames?: string;
};

const MessageBox: FC<Props> = ({ children, incoming = false, classNames }) => {
  return (
    <span
      className={cx(styles.messageBox, classNames, {
        [styles.incoming]: incoming,
        [styles.outgoing]: !incoming,
      })}
    >
      {children}
    </span>
  );
};

export default MessageBox;
