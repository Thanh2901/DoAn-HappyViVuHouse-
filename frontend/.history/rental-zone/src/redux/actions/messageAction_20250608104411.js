
import { messageTypes } from "./types";

// Set số lượng tin nhắn mới
export const setNewMessageCount = (count) => ({
  type: messageTypes.SET_NEW_MESSAGE_COUNT,
  payload: count,
});

// Tăng số lượng tin nhắn mới lên 1
export const incrementMessageCount = () => ({
  type: messageTypes.INCREMENT_MESSAGE_COUNT,
});

// Reset số lượng tin nhắn mới về 0
export const resetMessageCount = () => ({
  type: messageTypes.RESET_MESSAGE_COUNT,
});