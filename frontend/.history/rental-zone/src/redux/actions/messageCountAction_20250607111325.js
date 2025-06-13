import { SET_MESSAGE_COUNT } from './actionTypes';

export const setMessageCount = (count) => ({
  type: SET_MESSAGE_COUNT,
  payload: count,
});