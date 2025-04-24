import React, { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import Message from './Message';
import Input from './Input';

const ChatComponent = (props) => {
  const { authenticated, currentUser, onLogout, userType } = props;
  const [messages, setMessages] = useState([]);
  const [systemNotifications, setSystemNotifications] = useState([]);
  const [stompClient, setStompClient] = useState(null);
  const [connected, setConnected] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const messagesEndRef = useRef(null);
  const stompClientRef = useRef(null);
  const subscriptionRef = useRef(null);
  const historySubscriptionRef = useRef(null);
  const hasJoinedRef = useRef(false);
  const connectionAttemptRef = useRef(0);
  const historyLoadedRef = useRef(false);

  const scrollToBottom = () => {
    const chatBody = document.querySelector('.card-body');
    if (chatBody) {
      chatBody.scrollTop = chatBody.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, systemNotifications]);

  useEffect(() => {
    // User data is already provided by parent component
    if (currentUser) {
      console.log(`Current ${userType} data:`, currentUser);
      // Fetch chat history right after getting user info
      fetchChatHistory();
    } else {
      console.error('No current user data available');
      setIsLoadingHistory(false);
    }

    // Clean up when component unmount
    return () => {
      cleanupConnection();
    };
  }, [currentUser]);

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
    }
  };

  // Rest of the component implementation...
  // Remaining WebSocket connection logic, message sending, etc.
  // Would be the same as your original implementation

  const cleanupConnection = () => {
    // Clean up connection
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

    // Clean up old connection before creating a new one
    cleanupConnection();

    console.log(`Attempting to connect: attempt #${++connectionAttemptRef.current}`);
    
    // Create new connection
    const socket = new SockJS('http:localhost:8080/ws');
    const client = Stomp.over(socket);
    stompClientRef.current = client;

    // Turn off Stomp debug messages
    client.debug = () => {};

    const onConnect = () => {
      console.log(`WebSocket connected for ${userType}: ${currentUser.name}`);
      setConnected(true);
      setStompClient(client);

      // Subscribe to messages
      if (!subscriptionRef.current) {
        subscriptionRef.current = client.subscribe('/topic/public', (message) => {
          const receivedMessage = JSON.parse(message.body);
          console.log('Received raw message:', receivedMessage);

          const messageWithId = {
            ...receivedMessage,
            clientId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            isOwnMessage: receivedMessage.createdBy === currentUser.name
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
          }
        });

        console.log('Subscription created for user:', currentUser.name);
      }

      // Send join message only once
      if (!hasJoinedRef.current) {
        const joinMessage = {
          ...currentUser,
          type: 'JOIN',
          sentAt: new Date(),
          createdBy: 'system',
          userName: currentUser.name
        };

        console.log('Sending join message:', joinMessage);
        client.send('/app/join', {}, JSON.stringify(joinMessage));
        hasJoinedRef.current = true;
      }
    };

    const onError = (error) => {
      console.error(`WebSocket connection error for ${userType}: ${currentUser.name}`, error);
      setConnected(false);
      
      // Reset flags on error
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
  }, [currentUser, userType]);

  // Handle window unload to send LEAVE message
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

  const sendMessage = (content) => {
    if (!connected || !stompClientRef.current || !currentUser) {
      console.error('Cannot send message: WebSocket not connected or currentUser is null');
      return;
    }

    if (!content.trim()) {
      return; // Don't send empty messages
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

  // System notification component
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
    return <div className="text-center mt-5">Loading {userType} information...</div>;
  }

  // Combine messages and notifications for display in chronological order
  const combinedMessages = [...messages, ...systemNotifications]
    .sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt));

  return (
    <div className="h-70 d-flex flex-column">
      <div className="card flex-grow-1">
        <div className="card-header d-flex justify-content-between align-items-center py-2">
          <h4 className="mb-0 fw-bold">PUBLIC CHAT ROOM ({userType.toUpperCase()})</h4>
          <div className="d-flex align-items-center">
            {isLoadingHistory && (
              <span className="badge bg-info me-2">Loading history...</span>
            )}
            <span className={`badge fs-6 ${connected ? 'bg-success' : 'bg-danger'}`}>
              {connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        <div className="card-body p-2 overflow-auto" style={{ height: 'calc(70vh - 100px)' }}>
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

export default ChatComponent;