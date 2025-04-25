import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "../reducers/authReducer";
import { languageReducer } from "../reducers/languageReducer";
import { modeReducer } from "../reducers/modeReducer";
import { onlineReducer } from "../reducers/onlineReducer";

const store = configureStore({
  reducer: {
    language: languageReducer,
  },
});
export default store;