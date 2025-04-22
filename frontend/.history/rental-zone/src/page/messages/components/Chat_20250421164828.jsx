import React, { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { getCurrentUser } from '../../../services/fetch/ApiUtils'; // Import hàm getCurrentUser
import Message from './Message';
import Input from './Input';

const Chat = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [stompClient, setStompClient] = useState(null);
  const [connected, setConnected] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Lấy thông tin người dùng hiện tại
    getCurrentUser()
      .then((user) => {
        setCurrentUser(user); // Lưu thông tin người dùng vào state
      })
      .catch((error) => {
        console.error('Failed to fetch current user:', error);
      });
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    // Connect to WebSocket
    const socket = new SockJS('http:localhost:8080/ws');
    const client = Stomp.over(socket);

    client.connect({}, () => {
      setConnected(true);
      setStompClient(client);

      // Subscribe to public channel
      client.subscribe('/topic/public', (message) => {
        const receivedMessage = JSON.parse(message.body);
        console.log('Received message:', receivedMessage);
        setMessages((prevMessages) => [...prevMessages, receivedMessage]);
      });

      // Send join message
      client.send('/app/join', {}, JSON.stringify(currentUser));
    }, (error) => {
      console.error('STOMP error:', error);
      setConnected(false);
    });

    return () => {
      // Clean up on unmount
      if (client && client.connected) {
        client.send('/app/leave', {}, JSON.stringify(currentUser));
        client.disconnect();
        setConnected(false);
      }
    };
  }, [currentUser]);

  const sendMessage = (content) => {
    if (!connected || !stompClient) return;

    const chatMessage = {
      content: content,
      sentAt: new Date(),
      read: false,
      sendBy: true,
    };

    stompClient.send('/app/chat/public', {}, JSON.stringify(chatMessage));
  };

  if (!currentUser) {
    return <div className="text-center mt-5">Loading user information...</div>;
  }

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Public Chat Room</h5>
          <span className={`badge ${connected ? 'bg-success' : 'bg-danger'}`}>
            {connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        <div className="card-body overflow-auto" style={{ height: '400px' }}>
          <div className="d-flex flex-column">
            {messages.map((msg, index) => (
              <Message
                key={index}
                message={msg}
                isOwnMessage={msg.sendBy}
                username={currentUser.username}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="card-footer">
          <Input sendMessage={sendMessage} disabled={!connected} />
        </div>
      </div>
    </div>
  );
};

export default Chat;