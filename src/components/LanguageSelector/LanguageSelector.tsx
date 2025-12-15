import { FC } from "react";
import cx from "classnames";
import { useLanguage } from "@/hooks/useLanguage";
import { TargetLanguageCode } from "@/utils/languages";
import styles from "./LanguageSelector.module.scss";

type LanguageSelectorProps = {
  classNames?: string;
  disabled?: boolean;
};

const LanguageSelector: FC<LanguageSelectorProps> = ({
  classNames,
  disabled = false,
}) => {
  const { targetLanguage, setTargetLanguage, availableLanguages } = useLanguage();

  const clearConversation = () => {
    window.dispatchEvent(new CustomEvent("clearConversation"));
  }

  return (
    <div className={cx(styles.container, classNames)}>
      <label htmlFor="language-selector" className={styles.label}>
        Translate to:
      </label>
      <select
        id="language-selector"
        value={targetLanguage}
        onChange={(e) => { setTargetLanguage(e.target.value as TargetLanguageCode); clearConversation() }}
        disabled={disabled}
        className={styles.select}
        aria-label="Select target translation language"
      >
        {availableLanguages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name} ({lang.nativeName})
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;
