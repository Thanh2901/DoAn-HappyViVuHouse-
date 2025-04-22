import { createContext } from "react";
import '../style.css';

export const ChatContext = createContext();

export const ChatContextProvider = ({ children }) => {
  return (
    <ChatContext.Provider value={{}}>
      {children}
    </ChatContext.Provider>
  );
};
