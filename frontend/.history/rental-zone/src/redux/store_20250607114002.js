import { combineReducers } from 'redux';
import messageReducer from './reducers/messageReducer'; // The message reducer

const rootReducer = combineReducers({
  message: messageReducer,
  // Add other reducers here
});

export default rootReducer;