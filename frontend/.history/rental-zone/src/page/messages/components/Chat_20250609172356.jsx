import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import Message from './Message';
import Input from './Input';
import NotificationSystem from '../components/NotificationSystem';
import { incrementMessageCount, resetMessageCount, setNewMessageCount } from '../../../redux/actions/messageAction';

const Chat = ({ authenticated, currentUser, onLogout, onNewMessage }) => {
  const [messages, setMessages] = useState([]);
  const [systemNotifications, setSystemNotifications] = useState([]);
  const [stompClient, setStompClient] = useState(null);
  const [connected, setConnected] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isWindowFocused, setIsWindowFocused] = useState(true);
  const [isReconnecting, setIsReconnecting] = useState(false);

  const newMessageCount = useSelector(state => state.messages.newMessageCount);
  const dispatch = useDispatch();

  const messagesEndRef = useRef(null);
  const stompClientRef = useRef(null);
  const subscriptionRef = useRef(null);
  const historySubscriptionRef = useRef(null);
  const hasJoinedRef = useRef(false);
  const connectionAttemptRef = useRef(0);
  const historyLoadedRef = useRef(false);
  const reconnectTimeoutRef = useRef(null);
  const autoReconnectOnFocusRef = useRef(true);
  const processedNotificationsRef = useRef(new Set());
  const processedMessagesRef = useRef(new Set());

  useEffect(() => {
    const handleFocus = async () => {
      console.log('🔍 Window focused - Current connection status:', connected);
      console.log('🔍 Window focused - Current new message count:', newMessageCount);
      setIsWindowFocused(true);

      if (newMessageCount > 0) {
        console.log(`🔄 Resetting message count from ${newMessageCount} to 0 (window focused)`);
        dispatch(resetMessageCount());
      }

      if (!connected && currentUser && autoReconnectOnFocusRef.current && !isReconnecting) {
        console.log('🔄 Auto-reconnecting on window focus...');
        setIsReconnecting(true);
        try {
          await reconnectWithRetry();
        } catch (error) {
          console.error('❌ Auto-reconnect failed:', error);
        } finally {
          setIsReconnecting(false);
        }
      }
    };

    const handleBlur = () => {
      console.log('👁️ Window lost focus - New messages will be counted');
      setIsWindowFocused(false);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [newMessageCount, dispatch, connected, currentUser, isReconnecting]);

  const reconnectWithRetry = async (maxRetries = 3, delay = 1000) => {
    if (!currentUser || connected || stompClientRef.current?.connected) {
      console.log('⚠️ Reconnect skipped - conditions not met');
      return Promise.resolve();
    }

    const attemptReconnect = (attempt) => {
      return new Promise((resolve, reject) => {
        console.log(`🔄 Reconnection attempt #${attempt}/${maxRetries} for user: ${currentUser.name}`);
        cleanupConnection();

        const socket = new SockJS('http://localhost:8080/ws');
        const client = Stomp.over(socket);
        stompClientRef.current = client;
        client.debug = () => {};

        const connectionTimeout = setTimeout(() => {
          console.log(`⏰ Connection timeout on attempt #${attempt}`);
          try {
            client.disconnect();
          } catch (err) {
            console.error('Error disconnecting on timeout:', err);
          }
          reject(new Error(`Connection timeout on attempt ${attempt}`));
        }, 5000);

        const onConnect = () => {
          clearTimeout(connectionTimeout);
          console.log(`✅ WebSocket reconnected successfully for user: ${currentUser.name}`);
          setConnected(true);
          setStompClient(client);
          connectionAttemptRef.current = 0;

          if (!subscriptionRef.current) {
            subscriptionRef.current = client.subscribe('/topic/public', (message) => {
              const receivedMessage = JSON.parse(message.body);
              console.log('📨 Received message:', {
                type: receivedMessage.type,
                from: receivedMessage.createdBy,
                isOwnMessage: receivedMessage.createdBy === currentUser.name,
                windowFocused: isWindowFocused
              });

              const messageId = receivedMessage.id || `${receivedMessage.type}_${receivedMessage.createdBy}_${receivedMessage.sentAt}`;
              const messageWithId = {
                ...receivedMessage,
                clientId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                isOwnMessage: receivedMessage.createdBy === currentUser.name,
                uniqueId: messageId
              };

              if (messageWithId.type === 'JOIN' || messageWithId.type === 'LEAVE') {
                if (processedNotificationsRef.current.has(messageId)) {
                  console.log('🔕 Duplicate notification ignored:', messageWithId.type, 'from', messageWithId.createdBy);
                  return;
                }
                processedNotificationsRef.current.add(messageId);
                console.log('🔔 System notification received:', messageWithId.type, 'from', messageWithId.createdBy);

                setSystemNotifications(prev => {
                  const exists = prev.some(notification => 
                    notification.uniqueId === messageId ||
                    (notification.type === messageWithId.type && 
                     notification.createdBy === messageWithId.createdBy &&
                     Math.abs(new Date(notification.sentAt) - new Date(messageWithId.sentAt)) < 1000)
                  );
                  if (exists) {
                    console.log('🔕 Notification already exists in state, skipping');
                    return prev;
                  }
                  return [...prev, messageWithId];
                });
              } else {
                if (processedMessagesRef.current.has(messageId)) {
                  console.log('🔕 Duplicate message ignored:', messageId);
                  return;
                }
                processedMessagesRef.current.add(messageId);

                setMessages(prev => {
                  const exists = prev.some(msg => 
                    msg.uniqueId === messageId ||
                    (msg.content === messageWithId.content && 
                     msg.createdBy === messageWithId.createdBy &&
                     Math.abs(new Date(msg.sentAt) - new Date(messageWithId.sentAt)) < 1000)
                  );
                  if (exists) {
                    console.log('🔕 Message already exists in state, skipping');
                    return prev;
                  }

                  const newMessages = [...prev, messageWithId];
                  const shouldCount = !messageWithId.isOwnMessage && !isWindowFocused;

                  if (shouldCount) {
                    console.log('📈 Incrementing message count:', {
                      currentCount: newMessageCount,
                      newCount: newMessageCount + 1,
                      reason: 'New message received while window not focused',
                      messageFrom: messageWithId.createdBy
                    });
                    dispatch(incrementMessageCount());
                  } else {
                    console.log('📊 Message count not incremented:', {
                      isOwnMessage: messageWithId.isOwnMessage,
                      windowFocused: isWindowFocused,
                      messageFrom: messageWithId.createdBy
                    });
                  }

                  return newMessages;
                });

                if (onNewMessage && (messageWithId.type === 'CHAT' || messageWithId.type === 'FILE') && !messageWithId.isOwnMessage) {
                  console.log('📢 Calling onNewMessage callback for:', messageWithId.createdBy);
                  onNewMessage(messageWithId);
                }
              }
            });
            console.log('📡 Subscription created for user:', currentUser.name);
          }

          if (!hasJoinedRef.current) {
            const joinMessage = {
              ...currentUser,
              type: 'JOIN',
              sentAt: new Date(),
              createdBy: 'system',
              userName: currentUser.name
            };
            console.log('👋 Sending join message:', joinMessage);
            client.send('/app/join', {}, JSON.stringify(joinMessage));
            hasJoinedRef.current = true;
          }

          resolve();
        };

        const onError = (error) => {
          clearTimeout(connectionTimeout);
          console.error(`❌ WebSocket connection error on attempt #${attempt}:`, error);
          setConnected(false);
          hasJoinedRef.current = false;
          subscriptionRef.current = null;
          stompClientRef.current = null;
          reject(error);
        };

        try {
          client.connect({}, onConnect, onError);
        } catch (err) {
          clearTimeout(connectionTimeout);
          console.error(`❌ Error during reconnect attempt #${attempt}:`, err);
          reject(err);
        }
      });
    };

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await attemptReconnect(attempt);
        console.log(`✅ Successfully reconnected on attempt #${attempt}`);
        return;
      } catch (error) {
        console.error(`❌ Reconnect attempt #${attempt} failed:`, error.message);
        if (attempt < maxRetries) {
          const backoffDelay = delay * Math.pow(2, attempt - 1);
          console.log(`⏳ Waiting ${backoffDelay}ms before next attempt...`);
          await new Promise(resolve => {
            reconnectTimeoutRef.current = setTimeout(resolve, backoffDelay);
          });
        } else {
          console.error(`❌ All ${maxRetries} reconnection attempts failed`);
          throw new Error(`Failed to reconnect after ${maxRetries} attempts`);
        }
      }
    }
  };

  useEffect(() => {
    if (!currentUser) return;

    let connectionCheckInterval;
    const checkConnection = () => {
      if (!connected && isWindowFocused && !isReconnecting && autoReconnectOnFocusRef.current) {
        console.log('🔍 Connection lost detected, attempting auto-reconnect...');
        setIsReconnecting(true);
        reconnectWithRetry()
          .then(() => console.log('✅ Auto-reconnect successful'))
          .catch(error => console.error('❌ Auto-reconnect failed:', error))
          .finally(() => setIsReconnecting(false));
      }
    };

    if (isWindowFocused) {
      connectionCheckInterval = setInterval(checkConnection, 3000);
    }

    return () => {
      if (connectionCheckInterval) {
        clearInterval(connectionCheckInterval);
      }
    };
  }, [connected, isWindowFocused, currentUser, isReconnecting]);

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
    if (!currentUser) {
      setIsLoadingHistory(false);
      return;
    }

    fetchChatHistory();

    return () => cleanupConnection();
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      console.log('👤 Current user changed, resetting message count to 0');
      dispatch(resetMessageCount());
      processedMessagesRef.current.clear();
      processedNotificationsRef.current.clear();
    }
  }, [currentUser, dispatch]);

  useEffect(() => {
    console.log('📊 New message count updated:', newMessageCount);
  }, [newMessageCount]);

  const fetchChatHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const tempSocket = new SockJS('http://localhost:8080/ws');
      const tempClient = Stomp.over(tempSocket);
      tempClient.debug = () => {};

      await new Promise((resolve, reject) => {
        tempClient.connect({}, () => {
          console.log('Connected to server for history fetch');

          historySubscriptionRef.current = tempClient.subscribe('/topic/public/history', (message) => {
            const historyMessages = JSON.parse(message.body);
            console.log('📜 Received chat history:', historyMessages.length, 'messages');

            const processedMessages = historyMessages.map(msg => ({
              ...msg,
              clientId: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              isOwnMessage: msg.createdBy === currentUser?.name,
              uniqueId: msg.id || `${msg.type}_${msg.createdBy}_${msg.sentAt}`
            }));

            const chatMessages = processedMessages.filter(msg => msg.type === 'CHAT' || msg.type === 'FILE');
            const notifications = processedMessages.filter(msg => msg.type === 'JOIN' || msg.type === 'LEAVE');

            console.log('💬 Chat messages from history:', chatMessages.length);
            console.log('🔔 System notifications from history:', notifications.length);

            processedMessagesRef.current.clear();
            processedNotificationsRef.current.clear();

            chatMessages.forEach(msg => {
              if (msg.uniqueId) {
                processedMessagesRef.current.add(msg.uniqueId);
              }
            });

            notifications.forEach(notification => {
              if (notification.uniqueId) {
                processedNotificationsRef.current.add(notification.uniqueId);
              }
            });

            setMessages(chatMessages);
            setSystemNotifications(notifications);
            historyLoadedRef.current = true;

            if (historySubscriptionRef.current) {
              historySubscriptionRef.current.unsubscribe();
              historySubscriptionRef.current = null;
            }
            tempClient.disconnect();
            resolve();
          });

          tempClient.send('/app/chat/public/history', {}, JSON.stringify({}));

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

  const cleanupConnection = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

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
    hasJoinedRef.current = false;
    processedMessagesRef.current.clear();
    processedNotificationsRef.current.clear();
  };

  const reconnect = () => {
    if (!currentUser || connected || stompClientRef.current?.connected) return;

    console.log(`Manual reconnection attempt: attempt #${++connectionAttemptRef.current}`);
    setIsReconnecting(true);

    reconnectWithRetry()
      .then(() => console.log('✅ Manual reconnect successful'))
      .catch(error => console.error('❌ Manual reconnect failed:', error))
      .finally(() => setIsReconnecting(false));
  };

  useEffect(() => {
    if (!currentUser) return;

    reconnect();

    return () => cleanupConnection();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;

    const handleBeforeUnload = (e) => {
      autoReconnectOnFocusRef.current = false;
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
      return;
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

    console.log('📤 Sending message:', {
      content: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
      from: currentUser.name,
      timestamp: chatMessage.sentAt
    });
    stompClientRef.current.send('/app/chat/public', {}, JSON.stringify(chatMessage));
  };

  const handleNotificationClick = () => {
    console.log('🔔 Notification clicked - focusing window and resetting count');
    window.focus();
    scrollToBottom();
    console.log(`🔄 Resetting message count from ${newMessageCount} to 0 (notification clicked)`);
    dispatch(resetMessageCount());
  };

  const SystemNotification = ({ notification }) => {
    const getNotificationText = () => {
      if (notification.type === 'JOIN') {
        return `${notification.userName || notification.createdBy} joined conversation`;
      } else if (notification.type === 'LEAVE') {
        return `${notification.userName || notification.createdBy} left conversation`;
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

  const combinedMessages = [...messages, ...systemNotifications]
    .sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt));

  return (
    <div className="h-70 d-flex flex-column">
      {!isWindowFocused && (
        <NotificationSystem
          onNotificationClick={handleNotificationClick}
          position="top-right"
          autoHide={true}
          hideDelay={8000}
        />
      )}
      
      <div className="card flex-grow-1">
        <div className="card-header d-flex justify-content-between align-items-center py-2">
          <h4 className="mb-0 fw-bold">PUBLIC CHAT ROOM</h4>
          <div className="d-flex align-items-center">
            {newMessageCount > 0 && (
              <span className="badge bg-warning text-dark me-2">
                {newMessageCount} new messages
              </span>
            )}
            {isLoadingHistory && (
              <span className="badge bg-info me-2">Loading history...</span>
            )}
            {isReconnecting && (
              <span className="badge bg-warning text-dark me-2">
                <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                Reconnecting...
              </span>
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
                <small className="mb-0">No messages yet. Start the conversation!</small>
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
          <Input sendMessage={sendMessage} disabled={!connected || isReconnecting} reconnect={reconnect} />
        </div>
      </div>
    </div>
  );
};

export default Chat;