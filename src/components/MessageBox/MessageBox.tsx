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
      role="article"
      aria-label={incoming ? "Incoming message" : "Outgoing message"}
    >
      <div className={styles.mainText}>{children}</div>
      {translation && (
        <>
          <div className={styles.divider} aria-hidden="true" />
          <div className={styles.translation} aria-label="Translation">
            {translation}
          </div>
        </>
      )}
    </span>
  );
};

export default MessageBox;
