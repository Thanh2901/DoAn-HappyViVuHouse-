import React, { useContext } from "react";
import Cam from "../img/cam.png";
import Add from "../img/add.png";
import More from "../img/more.png";
import Messages from "./Messages";
import Input from "./Input";
import { useUserContext } from "../context/UserContext";
import '../style.css'

const Chat = (props) => {
  //const { data } = props.currentUser;
  const { selectedUser } = useUserContext();

  //console.log("Chat selected User: " + selectedUser.message)

  return (
    <div className="position-relative">
      <div className="chat-messages p-4">
        <Messages selectedUser={selectedUser} />
      </div>
      <Input selectedUser={selectedUser} />
    </div>
  );
};

export default Chat;
