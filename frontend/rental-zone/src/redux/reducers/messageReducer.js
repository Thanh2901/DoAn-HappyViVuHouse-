import { messageTypes } from "../actions/types";

const initialState = {
  newMessageCount: 0,
};

export const messageReducer = (state = initialState, action) => {
  switch (action.type) {
    case messageTypes.SET_NEW_MESSAGE_COUNT:
      return {
        ...state,
        newMessageCount: action.payload,
      };
    
    case messageTypes.INCREMENT_MESSAGE_COUNT:
      return {
        ...state,
        newMessageCount: state.newMessageCount + 1,
      };
    
    case messageTypes.RESET_MESSAGE_COUNT:
      return {
        ...state,
        newMessageCount: 0,
      };
    
    default:
      return state;
  }
};