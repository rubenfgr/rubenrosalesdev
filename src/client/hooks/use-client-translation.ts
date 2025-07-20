import { useTranslation as useI18nTranslation } from "react-i18next";

export const useClientTranslation = () => {
  const { t, i18n } = useI18nTranslation("client");

  const changeLanguage = async (language: string) => {
    await i18n.changeLanguage(language);
  };

  const getCurrentLanguage = () => {
    return i18n.language;
  };

  return {
    t,
    changeLanguage,
    getCurrentLanguage,
  };
};
