import cx from "classnames";
import { FC, ReactNode } from "react";
import styles from "./MessageBox.module.scss";

type Props = {
  children: ReactNode;
  incoming?: boolean;
  classNames?: string;
  translation?: string;
};

const MessageBox: FC<Props> = ({ 
  children, 
  incoming = false, 
  classNames,
  translation,
}) => {
  return (
    <span
      className={cx(styles.messageBox, classNames, {
        [styles.incoming]: incoming,
        [styles.outgoing]: !incoming,
        [styles.bilingual]: translation,
      })}
    >
      <div className={styles.mainText}>{children}</div>
      {translation && (
        <>
          <div className={styles.divider} />
          <div className={styles.translation}>{translation}</div>
        </>
      )}
    </span>
  );
};

export default MessageBox;
