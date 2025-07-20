import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import clientES from "@/shared/i18n/locales/client/es.json";
import serverES from "@/shared/i18n/locales/server/es.json";

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            es: {
                client: clientES,
                server: serverES
            },
        },
        lng: "es",
        fallbackLng: "es",
        detection: {
            order: ["localStorage", "navigator"],
            caches: ["localStorage"],
        },
    });

export default i18n;
