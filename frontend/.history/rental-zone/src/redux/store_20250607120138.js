// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from '@reduxjs/toolkit';
import { languageReducer } from '../redux/reducers/languageReducer';

// Combine all reducers
const rootReducer = combineReducers({
  language: languageReducer,
  // Thêm các reducer khác ở đây nếu cần
});

// Configure store với Redux Toolkit
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],1111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111``
      },
    }),
  devTools: process.env.NODE_ENV !== 'production', // Enable Redux DevTools trong development
});

export default store;