export type TargetLanguageCode =
  | "bg"
  | "cs"
  | "da"
  | "de"
  | "el"
  | "es"
  | "et"
  | "fi"
  | "fr"
  | "hu"
  | "id"
  | "it"
  | "ja"
  | "ko"
  | "lt"
  | "lv"
  | "nb"
  | "nl"
  | "pl"
  | "ro"
  | "ru"
  | "sk"
  | "sl"
  | "sv"
  | "tr"
  | "uk"
  | "zh"
  | "en-GB"
  | "en-US"
  | "pt-BR"
  | "pt-PT";

export type LanguageOption = {
  code: TargetLanguageCode;
  name: string;
  nativeName: string;
};

export const SUPPORTED_LANGUAGES: readonly LanguageOption[] = [
  { code: "bg", name: "Bulgarian", nativeName: "Български" },
  { code: "cs", name: "Czech", nativeName: "Čeština" },
  { code: "da", name: "Danish", nativeName: "Dansk" },
  { code: "de", name: "German", nativeName: "Deutsch" },
  { code: "el", name: "Greek", nativeName: "Ελληνικά" },
  { code: "en-GB", name: "English (British)", nativeName: "English (UK)" },
  { code: "en-US", name: "English (American)", nativeName: "English (US)" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "et", name: "Estonian", nativeName: "Eesti" },
  { code: "fi", name: "Finnish", nativeName: "Suomi" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "hu", name: "Hungarian", nativeName: "Magyar" },
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia" },
  { code: "it", name: "Italian", nativeName: "Italiano" },
  { code: "ja", name: "Japanese", nativeName: "日本語" },
  { code: "ko", name: "Korean", nativeName: "한국어" },
  { code: "lt", name: "Lithuanian", nativeName: "Lietuvių" },
  { code: "lv", name: "Latvian", nativeName: "Latviešu" },
  { code: "nb", name: "Norwegian (Bokmål)", nativeName: "Norsk bokmål" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands" },
  { code: "pl", name: "Polish", nativeName: "Polski" },
  { code: "pt-BR", name: "Portuguese (Brazilian)", nativeName: "Português (Brasil)" },
  { code: "pt-PT", name: "Portuguese (European)", nativeName: "Português (Portugal)" },
  { code: "ro", name: "Romanian", nativeName: "Română" },
  { code: "ru", name: "Russian", nativeName: "Русский" },
  { code: "sk", name: "Slovak", nativeName: "Slovenčina" },
  { code: "sl", name: "Slovenian", nativeName: "Slovenščina" },
  { code: "sv", name: "Swedish", nativeName: "Svenska" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe" },
  { code: "uk", name: "Ukrainian", nativeName: "Українська" },
  { code: "zh", name: "Chinese", nativeName: "中文" },
] as const;

export const DEFAULT_TARGET_LANGUAGE: TargetLanguageCode = "es";

export const LANGUAGE_STORAGE_KEY = "chattr_target_language";

export const VALID_LANGUAGE_CODES = new Set<string>(
  SUPPORTED_LANGUAGES.map((lang) => lang.code)
);
