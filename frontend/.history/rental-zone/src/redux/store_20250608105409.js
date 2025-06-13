// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from '@reduxjs/toolkit';
import { languageReducer } from '../redux/reducers/languageReducer';

// Combine all reducers
const rootReducer = combineReducers({
  language: languageReducer,
   messages: messageReducer,
  // Thêm các reducer khác ở đây nếu cần
});

// Configure store với Redux Toolkit
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production', // Enable Redux DevTools trong development
});

export default store;