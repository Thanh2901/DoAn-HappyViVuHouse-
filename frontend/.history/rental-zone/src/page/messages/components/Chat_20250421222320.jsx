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
  const hasJoinedRef = useRef(false);
  const connectionAttemptRef = useRef(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, systemNotifications]);

  useEffect(() => {
    // Lấy thông tin người dùng hiện tại chỉ một lần khi component mount
    getCurrentUser()
      .then((user) => {
        setCurrentUser(user);
      })
      .catch((error) => {
        console.error('Failed to fetch current user:', error);
      });

    // Clean up khi component unmount
    return () => {
      cleanupConnection();
    };
  }, []);

  const cleanupConnection = () => {
    // Dọn dẹp kết nối cũ
    if (subscriptionRef.current) {
      try {
        subscriptionRef.current.unsubscribe();
      } catch (err) {
        console.error("Error unsubscribing:", err);
      }
      subscriptionRef.current = null;
    }

    if (stompClientRef.current && stompClientRef.current.connected) {
      try {
        if (currentUser && hasJoinedRef.current) {
          stompClientRef.current.send('/app/leave', {}, JSON.stringify({
            ...currentUser,
            type: 'LEAVE'
          }));
        }
        stompClientRef.current.disconnect();
      } catch (err) {
        console.error("Error disconnecting:", err);
      }
    }
    stompClientRef.current = null;
    setConnected(false);
  };

  useEffect(() => {
    if (!currentUser) return;

    // Dọn dẹp kết nối cũ trước khi tạo kết nối mới
    cleanupConnection();

    console.log(`Attempting to connect: attempt #${++connectionAttemptRef.current}`);
    
    // Tạo kết nối mới
    const socket = new SockJS('http:localhost:8080/ws');
    const client = Stomp.over(socket);
    stompClientRef.current = client;

    // Tắt log của Stomp để tránh spam console
    client.debug = null;

    const onConnect = () => {
      console.log(`Connection successful on attempt #${connectionAttemptRef.current}`);
      setConnected(true);
      setStompClient(client);

      // Đăng ký nhận tin nhắn
      if (!subscriptionRef.current) {
        subscriptionRef.current = client.subscribe('/topic/public', (message) => {
          const receivedMessage = JSON.parse(message.body);
          
          // Thêm ID duy nhất cho mỗi tin nhắn để dễ debug
          const messageWithId = {
            ...receivedMessage,
            clientId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          };
          
          console.log('Received message:', messageWithId);
          
          // Phân loại tin nhắn
          if (messageWithId.type === 'JOIN' || messageWithId.type === 'LEAVE') {
            setSystemNotifications(prev => [...prev, messageWithId]);
          } else {
            setMessages(prev => [...prev, messageWithId]);
          }
        });
      }

      // Gửi tin nhắn join chỉ một lần
      if (!hasJoinedRef.current) {
        client.send('/app/join', {}, JSON.stringify({
          ...currentUser,
          type: 'JOIN',
          sentAt: new Date()
        }));
        hasJoinedRef.current = true;
        console.log('Join message sent');
      }
    };

    const onError = (error) => {
      console.error(`WebSocket connection error on attempt #${connectionAttemptRef.current}:`, error);
      setConnected(false);
      
      // Reset flags để có thể thử kết nối lại
      hasJoinedRef.current = false;
      subscriptionRef.current = null;
      stompClientRef.current = null;
    };

    // Kết nối đến WebSocket server
    try {
      client.connect({}, onConnect, onError);
    } catch (err) {
      console.error("Error during connect attempt:", err);
    }

    // Cleanup function
    return () => {
      // Không cần gọi cleanupConnection ở đây vì nó sẽ được gọi 
      // trong effect tiếp theo khi currentUser thay đổi hoặc khi component unmount
    };
  }, [currentUser]);

  // Xử lý window unload/beforeunload để gửi tin nhắn LEAVE
  useEffect(() => {
    if (!currentUser) return;

    const handleBeforeUnload = (e) => {
      if (stompClientRef.current && stompClientRef.current.connected && hasJoinedRef.current) {
        try {
          stompClientRef.current.send('/app/leave', {}, JSON.stringify({
            ...currentUser,
            type: 'LEAVE',
            sentAt: new Date()
          }));
        } catch (err) {
          console.error("Error sending leave message:", err);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentUser]);

  const sendMessage = (content) => {
    if (!connected || !stompClientRef.current || !currentUser) {
      console.error('Cannot send message: WebSocket not connected or currentUser is null');
      return;
    }

    if (!content.trim()) {
      return; // Không gửi tin nhắn rỗng
    }

    const chatMessage = {
      content: content,
      sentAt: new Date(),
      read: false,
      sendBy: true,
      type: 'CHAT',
      createdBy: currentUser.name,
      clientId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    console.log('Sending message:', chatMessage);
    stompClientRef.current.send('/app/chat/public', {}, JSON.stringify(chatMessage));
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
            {connected ? 'Connected' : 'Disconnecting'}
          </span>
        </div>

        <div className="card-body overflow-auto" style={{ height: '400px' }}>
          <div className="d-flex flex-column">
            {combinedMessages.length === 0 ? (
              <div className="text-center text-muted my-5">
                <p>Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</p>
              </div>
            ) : (
              combinedMessages.map((item, index) => (
                <React.Fragment key={item.clientId || `msg-${index}`}>
                  {item.type === 'JOIN' || item.type === 'LEAVE' ? (
                    <SystemNotification notification={item} />
                  ) : (
                    <Message
                      message={item}
                      isOwnMessage={item.sendBy}
                      username={currentUser.username}
                    />
                  )}
                </React.Fragment>
              ))
            )}
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