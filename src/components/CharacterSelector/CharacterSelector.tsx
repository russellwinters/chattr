import { FC } from "react";
import cx from "classnames";
import { useCharacter } from "@/hooks/useCharacter";
import { useMode } from "@/hooks/useMode";
import styles from "./CharacterSelector.module.scss";

type CharacterSelectorProps = {
  classNames?: string;
  disabled?: boolean;
};

const CharacterSelector: FC<CharacterSelectorProps> = ({
  classNames,
  disabled = false,
}) => {
  const { mode } = useMode();
  const { selectedCharacter, setSelectedCharacter, availableCharacters } =
    useCharacter();

  // Only show in conversation mode
  if (mode !== "conversation") {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const character = availableCharacters.find((c) => c.id === e.target.value);
    if (character) {
      setSelectedCharacter(character);
    }
  };

  return (
    <div className={cx(styles.container, classNames)}>
      <label htmlFor="character-selector" className={styles.label}>
        Character:
      </label>
      <select
        id="character-selector"
        value={selectedCharacter.id}
        onChange={handleChange}
        disabled={disabled}
        className={styles.select}
        aria-label="Select character persona"
      >
        {availableCharacters.map((character) => (
          <option key={character.id} value={character.id}>
            {character.icon} {character.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CharacterSelector;
