import { FC, useContext } from "react";
import cx from "classnames";
import { LanguageContext } from "@/contexts/LanguageContext";
import styles from "./LanguageSelector.module.scss";

type LanguageSelectorProps = {
  classNames?: string;
  disabled?: boolean;
};

const LanguageSelector: FC<LanguageSelectorProps> = ({
  classNames,
  disabled = false,
}) => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("LanguageSelector must be used within a LanguageProvider");
  }

  const { targetLanguage, setTargetLanguage, availableLanguages } = context;

  return (
    <div className={cx(styles.container, classNames)}>
      <label htmlFor="language-selector" className={styles.label}>
        Translate to:
      </label>
      <select
        id="language-selector"
        value={targetLanguage}
        onChange={(e) => setTargetLanguage(e.target.value as any)}
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
