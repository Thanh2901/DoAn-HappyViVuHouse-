import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "../reducers/authReducer";
import { languageReducer } from "../reducers/languageReducer";
import { modeReducer } from "../reducers/modeReducer";
import { onlineReducer } from "../reducers/onlineReducer";

const store = configureStore({
  reducer: {
    auth: authReducer,
    mode: modeReducer,
    language: languageReducer,
    online: onlineReducer,
  },
});
export default store;