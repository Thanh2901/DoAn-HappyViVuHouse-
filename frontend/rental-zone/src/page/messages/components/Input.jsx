import React, { useState, useEffect } from "react";
import jwtDecode from "jwt-decode";
import { useUserContext } from "../context/UserContext";
import { useWebSocketContext } from "../context/WebSocketContext";
import "../style.css";

const Input = () => {
  const [text, setText] = useState("");
  const [currentId, setCurrentId] = useState(null);
  const { selectedUser, setSelectedUser } = useUserContext();
  const { stompClient, connected } = useWebSocketContext();

  const accessToken = localStorage.getItem("accessToken");
  const decodedToken = jwtDecode(accessToken);
  const userId = decodedToken.sub;

  useEffect(() => {
    if (selectedUser) {
      if (userId == selectedUser.sender.id) {
        setCurrentId(selectedUser.receiver.id);
      } else {
        setCurrentId(selectedUser.sender.id);
      }
    } else {
      setCurrentId(null);
    }
  }, [selectedUser, userId]);

  const handleSend = async () => {
    console.log("handleSend - stompClient:", stompClient);
    console.log("handleSend - connected:", connected);
    console.log("handleSend - selectedUser:", selectedUser);
    console.log("handleSend - currentId:", currentId);
    console.log("handleSend - text:", text);

    if (!stompClient || !connected) {
      console.error("WebSocket not connected");
      return;
    }

    if (!selectedUser) {
      console.error("No user selected");
      alert("Vui lòng chọn một người dùng để gửi tin nhắn!");
      return;
    }

    if (!currentId) {
      console.error("No recipient selected");
      return;
    }

    const sendMessageData = {
      content: text,
      sentAt: new Date(),
      read: false,
      sendBy: userId == selectedUser.sender.id,
    };

    const destination = `/app/user/message-chat/${userId}/${currentId}`;
    console.log("Sending to destination:", destination, "with data:", sendMessageData);
    stompClient.send(destination, {}, JSON.stringify(sendMessageData));
    setText("");
  };

  return (
      <div className="flex-grow-0 py-3 px-4 border-top">
        <div className="input-group">
          <input
              type="text"
              className="form-control"
              placeholder="Nhập tin nhắn của bạn"
              onChange={(e) => {
                console.log("Input changed:", e.target.value);
                setText(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && selectedUser) {
                  handleSend();
                }
              }}
              value={text}
              style={{ width: "300px" }}
          />
          <button
              className="btn btn-primary"
              onClick={handleSend}
              disabled={!selectedUser || !text.trim()}
          >
            Send
          </button>
        </div>
      </div>
  );
};

export default Input;