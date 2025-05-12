import I18n from "./i18n";

export function translate(key, option) {
  return key ? I18n.t(key, option) : "";
}