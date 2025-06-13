import { createStore, combineReducers, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import messageReducer from './messageReducer';

const rootReducer = combineReducers({
  message: messageReducer,
});

const store = createStore(
  rootReducer,
  composeWithDevTools(applyMiddleware())
);

export default store;