import { FC } from "react";
import cx from "classnames";
import { useMode } from "@/hooks/useMode";
import styles from "./ModeSelector.module.scss";

type ModeSelectorProps = {
  classNames?: string;
  disabled?: boolean;
};

const ModeSelector: FC<ModeSelectorProps> = ({
  classNames,
  disabled = false,
}) => {
  const { mode, setMode } = useMode();

  const clearConversation = () => {
    window.dispatchEvent(new CustomEvent("clearConversation"));
  }

  return (
    <div className={cx(styles.container, classNames)}>
      <label className={styles.label}>Mode:</label>
      <div className={styles.toggleGroup}>
        <button
          className={cx(styles.option, {
            [styles.active]: mode === "translation",
          })}
          onClick={() => { setMode("translation"); clearConversation(); }}
          disabled={disabled}
          aria-pressed={mode === "translation"}
          aria-label="Translation mode"
        >
          Translation
        </button>
        <button
          className={cx(styles.option, {
            [styles.active]: mode === "conversation",
          })}
          onClick={() => { setMode("conversation"); clearConversation(); }}
          disabled={disabled}
          aria-pressed={mode === "conversation"}
          aria-label="Conversation mode"
        >
          Conversation
        </button>
      </div>
    </div>
  );
};

export default ModeSelector;
