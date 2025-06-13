import { combineReducers } from 'redux';
import languageReducer from './languageReducer'; // Your existing language reducer
import messageReducer from './messageReducer'; // The message reducer

const rootReducer = combineReducers({
  language: languageReducer,
  message: messageReducer,
  // Add other reducers here
});

export default rootReducer;