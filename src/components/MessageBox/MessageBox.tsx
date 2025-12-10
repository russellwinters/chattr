import cx from "classnames";
import { FC, ReactNode } from "react";
import styles from "./MessageBox.module.scss";

type Props = {
  children: ReactNode;
  incoming?: boolean;
  classNames?: string;
  translation?: string;
  showTranslation?: boolean;
};

const MessageBox: FC<Props> = ({ 
  children, 
  incoming = false, 
  classNames,
  translation,
  showTranslation = false 
}) => {
  return (
    <span
      className={cx(styles.messageBox, classNames, {
        [styles.incoming]: incoming,
        [styles.outgoing]: !incoming,
        [styles.bilingual]: showTranslation && translation,
      })}
    >
      <div className={styles.mainText}>{children}</div>
      {showTranslation && translation && (
        <>
          <div className={styles.divider} />
          <div className={styles.translation}>{translation}</div>
        </>
      )}
    </span>
  );
};

export default MessageBox;
