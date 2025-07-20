import i18next from "i18next";



export const serverTranslation = (lng: string = 'es', ns: string = 'server') => {

    console.log(`Initializing i18next for server-side with language: ${lng} and namespace: ${ns}`);
    console.log(`Current resources: ${JSON.stringify(i18next.store.data)}`);

    console.log(i18next.t("welcome", { lng, ns }));
    return {
        t: (key: string, options?: Record<string, unknown>) =>
            i18next.t(key, { lng, ns, ...options }),
        i18n: i18next,
    };
}
