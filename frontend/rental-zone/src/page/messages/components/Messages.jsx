import React, { useContext, useEffect, useState } from "react";
import Message from "./Message";
import '../style.css'

const Messages = ({ selectedUser }) => {
  //const { data } = useContext(ChatContext);
  const realMessages = selectedUser ? selectedUser : null;
  console.log("Real messages: " + realMessages)
  
  return (
    <div className="overflow-auto messages" style={{height : "450px"}}>
    
      <Message message={realMessages} />
    </div>
  );
};

export default Messages;
