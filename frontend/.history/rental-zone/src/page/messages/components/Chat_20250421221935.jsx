import React, { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { getCurrentUser } from '../../../services/fetch/ApiUtils';
import Message from './Message';
import Input from './Input';

const Chat = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [systemNotifications, setSystemNotifications] = useState([]);
  const [stompClient, setStompClient] = useState(null);
  const [connected, setConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const stompClientRef = useRef(null);
  const subscriptionRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, systemNotifications]);

  useEffect(() => {
    // Lấy thông tin người dùng hiện tại
    getCurrentUser()
      .then((user) => {
        setCurrentUser(user);
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
    stompClientRef.current = client;

    const onConnect = () => {
      setConnected(true);
      setStompClient(client);

      // Subscribe to public chat messages
      subscriptionRef.current = client.subscribe('/topic/public', (message) => {
        const receivedMessage = JSON.parse(message.body);
        console.log('Received message from server:', receivedMessage);
        
        // Phân biệt loại tin nhắn
        if (receivedMessage.type === 'JOIN' || receivedMessage.type === 'LEAVE') {
          // Đây là thông báo hệ thống
          setSystemNotifications(prev => [...prev, receivedMessage]);
        } else {
          // Đây là tin nhắn thông thường
          setMessages(prev => [...prev, receivedMessage]);
        }
      });

      // Send join message
      client.send('/app/join', {}, JSON.stringify({
        ...currentUser,
        type: 'JOIN'
      }));
      console.log('Join message sent:', currentUser);
    };

    const onError = (error) => {
      console.error('STOMP error:', error);
      setConnected(false);
    };

    client.connect({}, onConnect, onError);

    return () => {
      // Clean up on unmount
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
      
      if (client && client.connected) {
        client.send('/app/leave', {}, JSON.stringify({
          ...currentUser,
          type: 'LEAVE'
        }));
        client.disconnect();
        setConnected(false);
      }
    };
  }, [currentUser]);

  const sendMessage = (content) => {
    if (!connected || !stompClient || !currentUser) {
      console.error('Cannot send message: WebSocket not connected or currentUser is null');
      return;
    }

    const chatMessage = {
      content: content,
      sentAt: new Date(),
      read: false,
      sendBy: true,
      type: 'CHAT', // Đánh dấu là tin nhắn thông thường
      createdBy: currentUser.name,
    };

    console.log('Sending message:', chatMessage);
    stompClient.send('/app/chat/public', {}, JSON.stringify(chatMessage));
  };

  // Component hiển thị thông báo hệ thống
  const SystemNotification = ({ notification }) => {
    const getNotificationText = () => {
      if (notification.type === 'JOIN') {
        return `${notification.createdBy} đã tham gia cuộc trò chuyện`;
      } else if (notification.type === 'LEAVE') {
        return `${notification.createdBy} đã rời khỏi cuộc trò chuyện`;
      }
      return '';
    };

    return (
      <div className="text-center my-2">
        <span className="badge bg-light text-secondary px-3 py-2">
          {getNotificationText()}
        </span>
      </div>
    );
  };

  if (!currentUser) {
    return <div className="text-center mt-5">Loading user information...</div>;
  }

  // Kết hợp cả tin nhắn và thông báo để hiển thị theo thứ tự thời gian
  const combinedMessages = [...messages, ...systemNotifications]
    .sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt));

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
            {combinedMessages.map((item, index) => (
              item.type === 'JOIN' || item.type === 'LEAVE' ? (
                <SystemNotification key={index} notification={item} />
              ) : (
                <Message
                  key={index}
                  message={item}
                  isOwnMessage={item.sendBy}
                  username={currentUser.username}
                />
              )
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