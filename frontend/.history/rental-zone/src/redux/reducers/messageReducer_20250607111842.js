import { SET_MESSAGE_COUNT } from './types';

const initialState = {
  newMessageCount: 0,
};

const messageReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_MESSAGE_COUNT:
      return { ...state, newMessageCount: action.payload };
    default:
      return state;
  }
};

export default messageReducer;