import { configureStore } from "@reduxjs/toolkit";
import { languageReducer } from "../reducers/languageReducer";

const store = configureStore({
  reducer: {
    language: languageReducer,
  },
});
export default store;