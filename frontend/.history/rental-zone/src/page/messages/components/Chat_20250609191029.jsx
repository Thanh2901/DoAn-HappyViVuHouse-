import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import Message from './Message';
import Input from './Input';
import NotificationSystem from '../components/NotificationSystem';
import { incrementMessageCount, resetMessageCount } from '../../../redux/actions/messageAction';

const Chat = ({ authenticated, currentUser, onLogout, onNewMessage }) => {
  const [messages, setMessages] = useState([]);
  const [systemNotifications, setSystemNotifications] = useState([]);
  const [stompClient, setStompClient] = useState(null);
  const [connected, setConnected] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isWindowFocused, setIsWindowFocused] = useState(true);
  const [isReconnecting, setIsReconnecting] = useState(false);
  
  // State mới cho file viewer
  const [selectedFile, setSelectedFile] = useState(null);
  const [showFileViewer, setShowFileViewer] = useState(false);
  const [fileViewerError, setFileViewerError] = useState(null);

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

  // Hàm xử lý xem file
  const handleViewFile = (fileUrl, fileName, fileType) => {
    console.log('🔍 Viewing file:', { fileUrl, fileName, fileType });
    
    if (!fileUrl) {
      setFileViewerError('Không tìm thấy đường dẫn file');
      return;
    }

    // Xử lý đường dẫn file tương tự như trong ContractManagement
    const processedUrl = fileUrl.includes('photographer/files/') 
      ? fileUrl.replace('photographer/files/', '') 
      : fileUrl;

    setSelectedFile({
      url: processedUrl,
      name: fileName || 'Unknown file',
      type: fileType || 'unknown'
    });
    setFileViewerError(null);
    setShowFileViewer(true);
  };

  // Hàm đóng file viewer
  const closeFileViewer = () => {
    setSelectedFile(null);
    setShowFileViewer(false);
    setFileViewerError(null);
  };

  // Hàm kiểm tra loại file có thể xem được không
  const isViewableFile = (fileType) => {
    const viewableTypes = [
      'pdf', 'txt', 'doc', 'docx', 'xls', 'xlsx', 
      'jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg',
      'mp4', 'mp3', 'wav', 'avi'
    ];
    return viewableTypes.some(type => 
      fileType?.toLowerCase().includes(type)
    );
  };

  // Component FileViewer Modal
  const FileViewer = () => {
    if (!showFileViewer || !selectedFile) return null;

    return (
      <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="fas fa-file-alt me-2"></i>
                {selectedFile.name}
              </h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={closeFileViewer}
              ></button>
            </div>
            <div className="modal-body p-0" style={{ height: '70vh' }}>
              {fileViewerError ? (
                <div className="alert alert-danger m-3">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {fileViewerError}
                </div>
              ) : (
                <div className="d-flex flex-column h-100">
                  {/* File viewer actions */}
                  <div className="border-bottom p-2 bg-light">
                    <div className="btn-group">
                      <a
                        href={selectedFile.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline-primary btn-sm"
                      >
                        <i className="fas fa-external-link-alt me-1"></i>
                        Mở trong tab mới
                      </a>
                      <a
                        href={selectedFile.url}
                        download={selectedFile.name}
                        className="btn btn-outline-success btn-sm"
                      >
                        <i className="fas fa-download me-1"></i>
                        Tải xuống
                      </a>
                    </div>
                  </div>
                  
                  {/* File content */}
                  <div className="flex-grow-1 position-relative">
                    {selectedFile.type?.toLowerCase().includes('pdf') ? (
                      <iframe
                        src={selectedFile.url}
                        className="w-100 h-100 border-0"
                        title={selectedFile.name}
                      />
                    ) : selectedFile.type?.toLowerCase().match(/^image\/(jpg|jpeg|png|gif|bmp|svg)/) ? (
                      <div className="text-center p-3 h-100 d-flex align-items-center justify-content-center">
                        <img
                          src={selectedFile.url}
                          alt={selectedFile.name}
                          className="img-fluid"
                          style={{ maxHeight: '100%', maxWidth: '100%' }}
                        />
                      </div>
                    ) : selectedFile.type?.toLowerCase().includes('video') ? (
                      <div className="text-center p-3 h-100 d-flex align-items-center justify-content-center">
                        <video
                          controls
                          className="w-100"
                          style={{ maxHeight: '100%' }}
                        >
                          <source src={selectedFile.url} />
                          Trình duyệt không hỗ trợ video này.
                        </video>
                      </div>
                    ) : (
                      <div className="text-center p-5 h-100 d-flex flex-column align-items-center justify-content-center">
                        <i className="fas fa-file fa-5x text-muted mb-3"></i>
                        <h5>Không thể xem trước file này</h5>
                        <p className="text-muted">
                          File loại {selectedFile.type} không được hỗ trợ xem trước.
                          Vui lòng tải xuống để xem.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={closeFileViewer}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Existing useEffect hooks remain the same...
  useEffect(() => {
    const handleFocus = async () => {
      console.log('🔍 Window focused - Connection status:', connected);
      setIsWindowFocused(true);
      if (newMessageCount > 0) {
        dispatch(resetMessageCount());
      }
      if (!connected && currentUser && autoReconnectOnFocusRef.current && !isReconnecting) {
        setIsReconnecting(true);
        try {
          await reconnectWithRetry();
        } finally {
          setIsReconnecting(false);
        }
      }
    };

    const handleBlur = () => {
      setIsWindowFocused(false);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
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
    if (!currentUser || connected || stompClientRef.current?.connected) return Promise.resolve();

    const attemptReconnect = (attempt) => {
      return new Promise((resolve, reject) => {
        console.log(`🔄 Reconnection attempt #${attempt}/${maxRetries}`);
        cleanupConnection();
        const socket = new SockJS('http://localhost:8080/ws');
        const client = Stomp.over(socket);
        stompClientRef.current = client;
        client.debug = () => {};

        const connectionTimeout = setTimeout(() => {
          client.disconnect();
          reject(new Error(`Connection timeout on attempt ${attempt}`));
        }, 5000);

        const onConnect = () => {
          clearTimeout(connectionTimeout);
          setConnected(true);
          setStompClient(client);
          connectionAttemptRef.current = 0;

          subscriptionRef.current = client.subscribe('/topic/public', (message) => {
            const receivedMessage = JSON.parse(message.body);
            console.log('📨 Received message:', {
              type: receivedMessage.type,
              createdBy: receivedMessage.createdBy,
              currentUserName: currentUser.name,
              isOwnMessage: receivedMessage.createdBy?.toLowerCase() === currentUser.name?.toLowerCase()
            });

            const messageId = receivedMessage.id || `${receivedMessage.type}_${receivedMessage.createdBy}_${receivedMessage.sentAt}`;
            const messageWithId = {
              ...receivedMessage,
              clientId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              isOwnMessage: receivedMessage.createdBy?.toLowerCase() === currentUser.name?.toLowerCase(),
              uniqueId: messageId
            };

            if (messageWithId.type === 'JOIN' || messageWithId.type === 'LEAVE') {
              if (processedNotificationsRef.current.has(messageId)) return;
              processedNotificationsRef.current.add(messageId);
              setSystemNotifications(prev => [...prev, messageWithId]);
            } else {
              if (processedMessagesRef.current.has(messageId)) {
                console.log('🔕 Duplicate message ignored:', messageId);
                return;
              }
              processedMessagesRef.current.add(messageId);
              setMessages(prev => {
                const newMessages = [...prev, messageWithId];
                console.log('Updated messages state:', newMessages);
                return newMessages;
              });
              if (!messageWithId.isOwnMessage && !isWindowFocused) {
                dispatch(incrementMessageCount());
              }
              if (onNewMessage && (messageWithId.type === 'CHAT' || messageWithId.type === 'FILE') && !messageWithId.isOwnMessage) {
                onNewMessage(messageWithId);
              }
            }
          });

          if (!hasJoinedRef.current) {
            client.send('/app/join', {}, JSON.stringify({
              ...currentUser,
              type: 'JOIN',
              sentAt: new Date(),
              createdBy: 'system',
              userName: currentUser.name
            }));
            hasJoinedRef.current = true;
          }
          resolve();
        };

        const onError = (error) => {
          clearTimeout(connectionTimeout);
          console.error('WebSocket error:', error);
          setConnected(false);
          hasJoinedRef.current = false;
          subscriptionRef.current = null;
          stompClientRef.current = null;
          reject(error);
        };

        client.connect({}, onConnect, onError);
      });
    };

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await attemptReconnect(attempt);
        return;
      } catch (error) {
        console.error(`Reconnect attempt #${attempt} failed:`, error);
        if (attempt < maxRetries) {
          await new Promise(resolve => {
            reconnectTimeoutRef.current = setTimeout(resolve, delay * Math.pow(2, attempt - 1));
          });
        } else {
          throw new Error(`Failed to reconnect after ${maxRetries} attempts`);
        }
      }
    }
  };

  // Rest of the existing functions remain the same...
  useEffect(() => {
    if (!currentUser) return;
    let connectionCheckInterval;
    if (isWindowFocused) {
      connectionCheckInterval = setInterval(() => {
        if (!connected && !isReconnecting && autoReconnectOnFocusRef.current) {
          setIsReconnecting(true);
          reconnectWithRetry().finally(() => setIsReconnecting(false));
        }
      }, 3000);
    }
    return () => clearInterval(connectionCheckInterval);
  }, [connected, isWindowFocused, currentUser, isReconnecting]);

  const scrollToBottom = () => {
    const chatBody = document.querySelector('.card-body');
    if (chatBody) chatBody.scrollTop = chatBody.scrollHeight;
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
    return cleanupConnection;
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      dispatch(resetMessageCount());
      processedMessagesRef.current.clear();
      processedNotificationsRef.current.clear();
    }
  }, [currentUser, dispatch]);

  const fetchChatHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const tempSocket = new SockJS('http://localhost:8080/ws');
      const tempClient = Stomp.over(tempSocket);
      tempClient.debug = () => {};

      await new Promise((resolve, reject) => {
        tempClient.connect({}, () => {
          historySubscriptionRef.current = tempClient.subscribe('/topic/public/history', (message) => {
            const historyMessages = JSON.parse(message.body);
            console.log('📜 Chat history:', historyMessages);

            const processedMessages = historyMessages.map(msg => ({
              ...msg,
              clientId: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              isOwnMessage: msg.createdBy?.toLowerCase() === currentUser?.name?.toLowerCase(),
              uniqueId: msg.id || `${msg.type}_${msg.createdBy}_${msg.sentAt}`
            }));

            const chatMessages = processedMessages.filter(msg => msg.type === 'CHAT' || msg.type === 'FILE');
            const notifications = processedMessages.filter(msg => msg.type === 'JOIN' || msg.type === 'LEAVE');

            processedMessagesRef.current.clear();
            processedNotificationsRef.current.clear();
            chatMessages.forEach(msg => processedMessagesRef.current.add(msg.uniqueId));
            notifications.forEach(n => processedNotificationsRef.current.add(n.uniqueId));

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
            if (historySubscriptionRef.current) {
              historySubscriptionRef.current.unsubscribe();
              tempClient.disconnect();
              reject(new Error('History fetch timed out'));
            }
          }, 5000);
        }, reject);
      });
    } catch (err) {
      console.error('Error fetching chat history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const cleanupConnection = () => {
    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    if (historySubscriptionRef.current) historySubscriptionRef.current.unsubscribe();
    if (subscriptionRef.current) subscriptionRef.current.unsubscribe();
    if (stompClientRef.current && stompClientRef.current.connected) {
      if (currentUser && hasJoinedRef.current) {
        stompClientRef.current.send('/app/leave', {}, JSON.stringify({
          ...currentUser,
          type: 'LEAVE',
          createdBy: 'system',
          userName: currentUser.name
        }));
      }
      stompClientRef.current.disconnect();
    }
    stompClientRef.current = null;
    setConnected(false);
    hasJoinedRef.current = false;
    processedMessagesRef.current.clear();
    processedNotificationsRef.current.clear();
  };

  const reconnect = () => {
    if (!currentUser || connected || stompClientRef.current?.connected) return;
    setIsReconnecting(true);
    reconnectWithRetry().finally(() => setIsReconnecting(false));
  };

  useEffect(() => {
    if (!currentUser) return;
    reconnect();
    return cleanupConnection;
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const handleBeforeUnload = () => {
      autoReconnectOnFocusRef.current = false;
      if (stompClientRef.current && stompClientRef.current.connected && hasJoinedRef.current) {
        stompClientRef.current.send('/app/leave', {}, JSON.stringify({
          ...currentUser,
          type: 'LEAVE',
          sentAt: new Date(),
          createdBy: 'system',
          userName: currentUser.name
        }));
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentUser]);

  const sendMessage = (content, fileData = null) => {
    if (!connected || !stompClientRef.current || !currentUser) {
      console.error('Cannot send message: Invalid state', { connected, hasStompClient: !!stompClientRef.current, currentUser });
      throw new Error('WebSocket not connected or user not authenticated');
    }
    
    let chatMessage;
    
    if (fileData) {
      // File message
      chatMessage = {
        content: content || `Đã gửi file: ${fileData.name}`,
        sentAt: new Date(),
        read: false,
        sendBy: true,
        type: 'FILE',
        createdBy: currentUser.name,
        clientId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        fileUrl: fileData.url,
        fileName: fileData.name,
        fileType: fileData.type,
        fileSize: fileData.size
      };
    } else {
      // Text message
      if (!content.trim()) {
        console.log('Empty message ignored');
        return;
      }
      chatMessage = {
        content,
        sentAt: new Date(),
        read: false,
        sendBy: true,
        type: 'CHAT',
        createdBy: currentUser.name,
        clientId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
    }
    
    console.log('📤 Sending message:', chatMessage);
    try {
      stompClientRef.current.send('/app/chat/public', {}, JSON.stringify(chatMessage));
      console.log('Message sent to WebSocket');
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      throw error;
    }
  };

  const handleNotificationClick = () => {
    window.focus();
    scrollToBottom();
    dispatch(resetMessageCount());
  };

  const SystemNotification = ({ notification }) => {
    const getNotificationText = () => {
      if (notification.type === 'JOIN') return `${notification.userName || notification.createdBy} joined conversation`;
      if (notification.type === 'LEAVE') return `${notification.userName || notification.createdBy} left conversation`;
      return '';
    };
    return (
      <div className="text-center my-2">
        <span className="badge bg-light text-secondary px-3 py-2">{getNotificationText()}</span>
      </div>
    );
  };

  if (!currentUser) return <div className="text-center mt-5">Loading user information...</div>;

  const combinedMessages = [...messages, ...systemNotifications].sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt));

  return (
    <>
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
                <span className="badge bg-warning text-dark me-2">{newMessageCount} new messages</span>
              )}
              {isLoadingHistory && <span className="badge bg-info me-2">Loading history...</span>}
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
                        isOwnMessage={item.isOwnMessage}
                        username={currentUser.username}
                        onViewFile={handleViewFile} // Truyền hàm xem file xuống Message component
                      />
                    )}
                  </React.Fragment>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
          <div className="card-footer py-1">
            <Input 
              sendMessage={sendMessage} 
              disabled={!connected || isReconnecting} 
              reconnect={reconnect}
              supportFileUpload={true} // Enable file upload
            />
          </div>
        </div>
      </div>
      
      {/* File Viewer Modal */}
      <FileViewer />
    </>
  );
};

export default Chat;