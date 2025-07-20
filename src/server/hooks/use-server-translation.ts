import i18next from "i18next";

export function useServerTranslation(lng: string = 'es', ns: string = 'common') {
    return {
        t: (key: string, options?: Record<string, unknown>) =>
            i18next.t(key, { lng, ns, ...options }),
        i18n: i18next,
    };
}
