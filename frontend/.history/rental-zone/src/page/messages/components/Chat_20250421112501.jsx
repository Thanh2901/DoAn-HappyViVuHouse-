import React, { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import Message from './Message';
import Input from './Input';

const Chat = ({ currentUser }) => {
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
    // Connect to WebSocket
    const socket = new SockJS('http/ws');
    const client = Stomp.over(socket);

    client.connect({}, () => {
      setConnected(true);
      setStompClient(client);

      // Subscribe to public channel
      client.subscribe('/topic/public', (message) => {
        const receivedMessage = JSON.parse(message.body);
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
      sendBy: true
    };

    stompClient.send('/app/chat/public', {}, JSON.stringify(chatMessage));
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Public Chat Room</h2>
        <span className={`status ${connected ? 'online' : 'offline'}`}>
          {connected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      <div className="messages-container">
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

      <Input sendMessage={sendMessage} disabled={!connected} />
      
      <style jsx>{`
        .chat-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          max-width: 800px;
          margin: 0 auto;
          border: 1px solid #e1e1e1;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .chat-header {
          padding: 15px;
          background: #f5f5f5;
          border-bottom: 1px solid #e1e1e1;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 15px;
          background: #f9f9f9;
        }
        
        .status {
          padding: 5px 10px;
          border-radius: 12px;
          font-size: 12px;
        }
        
        .online {
          background: #d4edda;
          color: #155724;
        }
        
        .offline {
          background: #f8d7da;
          color: #721c24;
        }
      `}</style>
    </div>
  );
};

export default Chat;