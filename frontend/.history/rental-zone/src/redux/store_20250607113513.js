import { combineReducers } from 'redux';
import messageReducer from './messageReducer'; // The message reducer

const rootReducer = combineReducers({
  message: messageReducer,
  // Add other reducers here
});

export default rootReducer;