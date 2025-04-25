import { initReactI18next } from "react-i18next";

import i18n from "i18next";

// import { KEY_STORAGE } from "../../common/constants";
// import { load } from "../../common/functions";
import { resources } from "./locales";

export const initOptionsI18n = (source) => {
//   let savedLanguage = load(KEY_STORAGE.LANGUAGE);

  return {
    fallbackLng: savedLanguage || "en",
    lng: savedLanguage || "en",
    resources: source,

    ns: ["common"],
    defaultNS: "common",
    debug: false,

    interpolation: {
      escapeValue: false,
    },
  };
};

i18n.use(initReactI18next).init(initOptionsI18n(resources));

export default i18n;