// src/redux/actions/messageActions.js
import { SET_MESSAGE_COUNT } from '../types';

export const setMessageCount = (count) => ({
  type: SET_MESSAGE_COUNT,
  payload: count,
});