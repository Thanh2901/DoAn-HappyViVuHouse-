import { languageTypes } from "../actions/types";
const initialState = {
  language: "en",
};
export const languageReducer = (state = initialState, action) => {
  switch (action.type) {
    case languageTypes.SET_ENGLISH:
    case languageTypes.SET_VIETNAMESE:
    case languageTypes.SET_FRENCH:
      return {
        ...state,
        language: action?.payload?.language,
      };
    default:
      return state;
  }
};