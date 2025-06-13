import { messageTypes } from "./types";

export const setNewMessageCount = (count) => ({
  type: messageTypes.SET_NEW_MESSAGE_COUNT,
  payload: count,
});

export const incrementMessageCount = () => ({
  type: messageTypes.INCREMENT_MESSAGE_COUNT,
});

export const resetMessageCount = () => ({
  type: messageTypes.RESET_MESSAGE_COUNT,
});