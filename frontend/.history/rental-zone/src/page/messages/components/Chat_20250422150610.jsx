import React, { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import axios from 'axios'; // Thêm axios để gọi API
import { getCurrentUser } from '../../../services/fetch/ApiUtils';
import Message from './Message';
import Input from './Input';

const Chat = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [systemNotifications, setSystemNotifications] = useState([]);
  const [stompClient, setStompClient] = useState(null);
  const [connected, setConnected] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const stompClientRef = useRef(null);
  const subscriptionRef = useRef(null);
  const historySubscriptionRef = useRef(null);
  const hasJoinedRef = useRef(false);
  const connectionAttemptRef = useRef(0);
  const historyLoadedRef = useRef(false);
  const isScrollAtBottomRef = useRef(true);
  const chatBodyRef = useRef(null);

  const scrollToBottom = () => {
    const chatBody = chatBodyRef.current;
    if (chatBody) {
      chatBody.scrollTop = chatBody.scrollHeight;
    }
  };

  // Check if chat is scrolled to bottom
  const checkIfScrollAtBottom = () => {
    const chatBody = chatBodyRef.current;
    if (chatBody) {
      const { scrollTop, scrollHeight, clientHeight } = chatBody;
      isScrollAtBottomRef.current = scrollHeight - scrollTop - clientHeight < 50;
    }
  };

  // Scroll to bottom if user was already at bottom before new message
  useEffect(() => {
    if (isScrollAtBottomRef.current) {
      scrollToBottom();
    }
  }, [messages, systemNotifications]);

  useEffect(() => {
    // Lấy thông tin người dùng hiện tại chỉ một lần khi component mount
    getCurrentUser()
        .then((user) => {
          setCurrentUser(user);
          // Fetch chat history right after getting user info
          fetchChatHistory();
        })
        .catch((error) => {
          console.error('Failed to fetch current user:', error);
          setIsLoadingHistory(false);
        });

    // Clean up khi component unmount
    return () => {
      cleanupConnection();
    };
  }, []);

  // Đánh dấu tin nhắn đã đọc khi người dùng xem chúng
  useEffect(() => {
    if (!currentUser || messages.length === 0) return;

    // Lọc ra các tin nhắn chưa đọc và không phải của người dùng hiện tại
    const unreadMessages = messages.filter(msg =>
        !msg.read && msg.createdBy !== currentUser.name && msg.id);

    if (unreadMessages.length === 0) return;

    // Lấy ID của các tin nhắn cần đánh dấu đã đọc
    const messageIds = unreadMessages.map(msg => msg.id);

    // Gọi API để đánh dấu đã đọc
    axios.put('/api/messages/mark-read-batch', messageIds)
        .then(() => {
          // Cập nhật state của tin nhắn trong ứng dụng
          setMessages(prevMessages =>
              prevMessages.map(msg =>
                  messageIds.includes(msg.id) ? { ...msg, read: true } : msg
              )
          );

          // Cập nhật số tin nhắn chưa đọc
          updateUnreadCount();
        })
        .catch(error => {
          console.error('Failed to mark messages as read:', error);
        });
  }, [messages, currentUser]);

  // Cập nhật số lượng tin nhắn chưa đọc
  const updateUnreadCount = () => {
    if (!currentUser) return;

    axios.get(`/api/messages/unread-count?username=${currentUser.name}`)
        .then(response => {
          setUnreadCount(response.data);
        })
        .catch(error => {
          console.error('Failed to get unread count:', error);
        });
  };

  const fetchChatHistory = async () => {
    try {
      setIsLoadingHistory(true);
      // Create a temporary connection to fetch history
      const tempSocket = new SockJS('http:localhost:8080/ws');
      const tempClient = Stomp.over(tempSocket);
      tempClient.debug = () => {}; // Disable debug logs

      await new Promise((resolve, reject) => {
        tempClient.connect({}, () => {
          console.log('Connected to server for history fetch');

          // Subscribe to receive history
          historySubscriptionRef.current = tempClient.subscribe('/topic/public/history', (message) => {
            const historyMessages = JSON.parse(message.body);
            console.log('Received chat history:', historyMessages);

            // Process history messages
            const processedMessages = historyMessages.map(msg => ({
              ...msg,
              clientId: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              isOwnMessage: msg.createdBy === currentUser?.name
            }));

            // Separate messages and system notifications
            const chatMessages = processedMessages.filter(msg => msg.type === 'CHAT');
            const notifications = processedMessages.filter(msg => msg.type === 'JOIN' || msg.type === 'LEAVE');

            setMessages(chatMessages);
            setSystemNotifications(notifications);
            historyLoadedRef.current = true;

            // Cập nhật số tin nhắn chưa đọc
            updateUnreadCount();

            // Cleanup
            if (historySubscriptionRef.current) {
              historySubscriptionRef.current.unsubscribe();
              historySubscriptionRef.current = null;
            }
            tempClient.disconnect();
            resolve();
          });

          // Send request for history
          tempClient.send('/app/chat/public/history', {}, JSON.stringify({}));

          // Set timeout for history fetch
          setTimeout(() => {
            try {
              if (historySubscriptionRef.current) {
                historySubscriptionRef.current.unsubscribe();
                historySubscriptionRef.current = null;
              }
              tempClient.disconnect();
              reject(new Error('History fetch timed out'));
            } catch (err) {
              console.error('Error during history timeout cleanup:', err);
            }
          }, 5000);
        }, (error) => {
          console.error('Failed to connect for history:', error);
          reject(error);
        });
      });
    } catch (err) {
      console.error('Error fetching chat history:', err);
    } finally {
      setIsLoadingHistory(false);

      // Đánh dấu tất cả là đã đọc sau khi lấy lịch sử xong
      if (currentUser) {
        markAllAsRead();
      }
    }
  };

  // Hàm đánh dấu tất cả tin nhắn đã đọc
  const markAllAsRead = () => {
    if (!currentUser) return;

    axios.put(`/api/messages/mark-all-read?username=${currentUser.name}`)
        .then(() => {
          // Cập nhật state các tin nhắn đã đọc
          setMessages(prevMessages =>
              prevMessages.map(msg => ({ ...msg, read: true }))
          );

          // Cập nhật số tin nhắn chưa đọc thành 0
          setUnreadCount(0);
        })
        .catch(error => {
          console.error('Failed to mark all messages as read:', error);
        });
  };

  const cleanupConnection = () => {
    // Dọn dẹp kết nối cũ
    if (historySubscriptionRef.current) {
      try {
        historySubscriptionRef.current.unsubscribe();
      } catch (err) {
        console.error("Error unsubscribing from history:", err);
      }
      historySubscriptionRef.current = null;
    }

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
            type: 'LEAVE',
            createdBy: 'system',
            userName: currentUser.name
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

    // Chỉ tắt debug messages của Stomp
    client.debug = () => {};

    const onConnect = () => {
      console.log(`WebSocket connected for user: ${currentUser.name}`); // Log kết nối
      setConnected(true);
      setStompClient(client);

      // Đăng ký nhận tin nhắn
      if (!subscriptionRef.current) {
        subscriptionRef.current = client.subscribe('/topic/public', (message) => {
          const receivedMessage = JSON.parse(message.body);
          console.log('Received raw message:', receivedMessage);

          const messageWithId = {
            ...receivedMessage,
            clientId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            isOwnMessage: receivedMessage.createdBy === currentUser.name // Thêm trường isOwnMessage
          };

          console.log('Processing message:', {
            type: messageWithId.type,
            createdBy: messageWithId.createdBy,
            content: messageWithId.content,
            isOwnMessage: messageWithId.isOwnMessage
          });

          if (messageWithId.type === 'JOIN' || messageWithId.type === 'LEAVE') {
            console.log(`${messageWithId.type} event from: ${messageWithId.createdBy}`);
            setSystemNotifications(prev => [...prev, messageWithId]);
          } else {
            setMessages(prev => [...prev, messageWithId]);

            // Nếu tin nhắn này không phải của người dùng hiện tại, tăng số lượng tin nhắn chưa đọc
            if (!messageWithId.isOwnMessage) {
              setUnreadCount(prev => prev + 1);
            }
          }
        });

        console.log('Subscription created for user:', currentUser.name);
      }

      // Gửi tin nhắn join và đảm bảo nó chỉ được gửi một lần
      if (!hasJoinedRef.current) {
        const joinMessage = {
          ...currentUser,
          type: 'JOIN',
          sentAt: new Date(),
          createdBy: 'system', // Changed from currentUser.name to 'system'
          userName: currentUser.name // Keep the actual username in a separate field
        };

        console.log('Sending join message:', joinMessage);
        client.send('/app/join', {}, JSON.stringify(joinMessage));
        hasJoinedRef.current = true;
      }
    };

    const onError = (error) => {
      console.error(`WebSocket connection error for user: ${currentUser.name}`, error);
      setConnected(false);

      // Reset các flag khi có lỗi
      hasJoinedRef.current = false;
      subscriptionRef.current = null;
      stompClientRef.current = null;
    };

    try {
      client.connect({}, onConnect, onError);
    } catch (err) {
      console.error("Error during connect attempt:", err);
    }

    return () => cleanupConnection();
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
            sentAt: new Date(),
            createdBy: 'system',
            userName: currentUser.name
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

  // Thêm event listener để theo dõi vị trí cuộn
  useEffect(() => {
    const chatBody = chatBodyRef.current;
    if (chatBody) {
      const handleScroll = () => {
        checkIfScrollAtBottom();
      };

      chatBody.addEventListener('scroll', handleScroll);
      return () => {
        chatBody.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

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
        return `${notification.userName || notification.createdBy} đã tham gia cuộc trò chuyện`;
      } else if (notification.type === 'LEAVE') {
        return `${notification.userName || notification.createdBy} đã rời khỏi cuộc trò chuyện`;
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
      <div className="h-70 d-flex flex-column">
        <div className="card flex-grow-1">
          <div className="card-header d-flex justify-content-between align-items-center py-2">
            <div className="d-flex align-items-center">
              <h4 className="mb-0 fw-bold">PUBLIC CHAT ROOM</h4>
              {unreadCount > 0 && (
                  <span className="badge bg-danger rounded-pill ms-2">{unreadCount}</span>
              )}
            </div>
            <div className="d-flex align-items-center">
              {isLoadingHistory && (
                  <span className="badge bg-info me-2">Loading history...</span>
              )}
              <span className={`badge fs-6 ${connected ? 'bg-success' : 'bg-danger'}`}>
              {connected ? 'Connected' : 'Disconnected'}
            </span>
              {unreadCount > 0 && (
                  <button
                      className="btn btn-sm btn-outline-secondary ms-2"
                      onClick={markAllAsRead}
                  >
                    Mark all as read
                  </button>
              )}
            </div>
          </div>

          <div
              className="card-body p-2 overflow-auto"
              style={{ height: 'calc(70vh - 100px)' }}
              ref={chatBodyRef}
          >
            <div className="d-flex flex-column">
              {isLoadingHistory ? (
                  <div className="text-center my-3">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading chat history...</p>
                  </div>
              ) : combinedMessages.length === 0 ? (
                  <div className="text-center text-muted my-2">
                    <small className="mb-0">Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</small>
                  </div>
              ) : (
                  combinedMessages.map((item, index) => (
                      <React.Fragment key={item.clientId || `msg-${index}`}>
                        {item.type === 'JOIN' || item.type === 'LEAVE' ? (
                            <SystemNotification notification={item} />
                        ) : (
                            <Message
                                message={item}
                                isOwnMessage={item.createdBy === currentUser.name}
                                username={currentUser.username}
                            />
                        )}
                      </React.Fragment>
                  ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="card-footer py-1">
            <Input sendMessage={sendMessage} disabled={!connected} />
          </div>
        </div>
      </div>
  );
};

export default Chat;