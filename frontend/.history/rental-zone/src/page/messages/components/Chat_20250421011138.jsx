import React, { useRef, useEffect, useState } from "react";
import { useUserContext } from "../context/UserContext";
import { useWebSocketContext } from "../context/WebSocketContext";
import jwtDecode from "jwt-decode";
import Message from "./Message";
import "../style.css";

const Chat = () => {
    const { messages, setMessages } = useUserContext();
    const { stompClient, connected } = useWebSocketContext();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [text, setText] = useState("");

    const accessToken = localStorage.getItem("accessToken");
    const decodedToken = jwtDecode(accessToken);
    const userId = decodedToken.sub;

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!stompClient || !connected) {
            console.error("WebSocket not connected");
            return;
        }

        if (!text.trim()) {
            console.error("Message content is empty");
            return;
        }

        if (typeof stompClient.publish !== "function") {
            console.error("stompClient.publish is not a function", stompClient);
            return;
        }

        const sendMessageData = {
            content: text,
            sentAt: new Date(),
            read: false,
            senderId: userId,
        };

        const destination = "/app/chat/public";
        stompClient.publish({
            destination,
            body: JSON.stringify(sendMessageData),
        });
        setText("");
    };

    return (
        <div className="chat-container">
            <div className="chat-wrapper">
                <div className="message-list" ref={messagesEndRef}>
                    {messages.map((message, index) => (
                        <Message
                            key={index}
                            content={message.content}
                            senderId={message.senderId}
                            sentAt={message.sentAt}
                            isOwnMessage={message.senderId === userId}
                        />
                    ))}
                </div>

                <div className="input-section">
                    <div className="input-wrapper">
                        <input
                            type="text"
                            className="chat-input"
                            placeholder="Nhập tin nhắn của bạn"
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && text.trim()) {
                                    handleSend();
                                }
                            }}
                            value={text}
                        />
                        <button
                            className="send-button"
                            onClick={handleSend}
                            disabled={!text.trim()}
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chat;