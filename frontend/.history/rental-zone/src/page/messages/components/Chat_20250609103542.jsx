import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import Message from './Message';
import Input from './Input';
import NotificationSystem from '../components/NotificationSystem .js';
import { incrementMessageCount, resetMessageCount, setNewMessageCount } from '../../../redux/actions/messageAction';

const Chat = ({ authenticated, currentUser, onLogout, onNewMessage }) => {
    const [messages, setMessages] = useState([]);
    const [systemNotifications, setSystemNotifications] = useState([]);
    const [stompClient, setStompClient] = useState(null);
    const [connected, setConnected] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [isWindowFocused, setIsWindowFocused] = useState(true);
    
    const newMessageCount = useSelector(state => state.messages.newMessageCount);
    const dispatch = useDispatch();
    
    const messagesEndRef = useRef(null);
    const stompClientRef = useRef(null);
    const subscriptionRef = useRef(null);
    const historySubscriptionRef = useRef(null);
    const hasJoinedRef = useRef(false);
    const connectionAttemptRef = useRef(0);
    const historyLoadedRef = useRef(false);
    
    // Sử dụng ref để lưu giá trị current của isWindowFocused
    const isWindowFocusedRef = useRef(isWindowFocused);
    const currentUserRef = useRef(currentUser);
    
    // Update refs khi state thay đổi
    useEffect(() => {
        isWindowFocusedRef.current = isWindowFocused;
    }, [isWindowFocused]);
    
    useEffect(() => {
        currentUserRef.current = currentUser;
    }, [currentUser]);

    // Track window focus - sử dụng useCallback để tránh recreate function
    const handleFocus = useCallback(() => {
        console.log('🔍 Window focused - Current new message count:', newMessageCount);
        setIsWindowFocused(true);
        if (newMessageCount > 0) {
            console.log(`🔄 Resetting message count from ${newMessageCount} to 0 (window focused)`);
            dispatch(resetMessageCount());
        }
    }, [newMessageCount, dispatch]);
    
    const handleBlur = useCallback(() => {
        console.log('👁️ Window lost focus - New messages will be counted');
        setIsWindowFocused(false);
    }, []);

    useEffect(() => {
        window.addEventListener('focus', handleFocus);
        window.addEventListener('blur', handleBlur);
        
        return () => {
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('blur', handleBlur);
        };
    }, [handleFocus, handleBlur]);

    const scrollToBottom = () => {
        const chatBody = document.querySelector('.card-body');
        if (chatBody) {
            chatBody.scrollTop = chatBody.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, systemNotifications]);

    // Reset message count khi component mount hoặc currentUser thay đổi
    useEffect(() => {
        if (currentUser) {
            console.log('👤 Current user changed, resetting message count to 0');
            dispatch(resetMessageCount());
        }
    }, [currentUser, dispatch]);

    // Log khi newMessageCount thay đổi
    useEffect(() => {
        console.log('📊 New message count updated:', newMessageCount);
    }, [newMessageCount]);

    // Message handler - sử dụng useCallback để tránh stale closure
    const handleMessage = useCallback((message) => {
        const receivedMessage = JSON.parse(message.body);
        console.log('📨 Received message:', {
            type: receivedMessage.type,
            from: receivedMessage.createdBy,
            content: receivedMessage.content?.substring(0, 50),
            timestamp: receivedMessage.sentAt
        });

        const messageWithId = {
            ...receivedMessage,
            clientId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            isOwnMessage: receivedMessage.createdBy === currentUserRef.current?.name
        };
        
        if (messageWithId.type === 'JOIN' || messageWithId.type === 'LEAVE') {
            console.log('🔔 System notification received:', messageWithId.type);
            setSystemNotifications(prev => [...prev, messageWithId]);
        } else if (messageWithId.type === 'CHAT') {
            setMessages(prev => {
                const newMessages = [...prev, messageWithId];
                
                // Kiểm tra điều kiện đếm tin nhắn
                const isOwnMessage = messageWithId.isOwnMessage;
                const windowFocused = isWindowFocusedRef.current;
                const shouldCount = !isOwnMessage && !windowFocused;
                
                console.log('📊 Message count decision:', {
                    isOwnMessage,
                    windowFocused,
                    shouldCount,
                    messageFrom: messageWithId.createdBy,
                    currentUser: currentUserRef.current?.name
                });
                
                if (shouldCount) {
                    console.log('📈 Incrementing message count');
                    dispatch(incrementMessageCount());
                } else {
                    console.log('📊 Message count not incremented');
                }
                
                return newMessages;
            });
            
            // Callback cho tin nhắn mới
            if (onNewMessage && !messageWithId.isOwnMessage) {
                console.log('📢 Calling onNewMessage callback for:', messageWithId.createdBy);
                onNewMessage(messageWithId);
            }
        }
    }, [dispatch, onNewMessage]);

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
                            isOwnMessage: msg.createdBy === currentUser?.name
                        }));

                        const chatMessages = processedMessages.filter(msg => msg.type === 'CHAT');
                        const notifications = processedMessages.filter(msg => msg.type === 'JOIN' || msg.type === 'LEAVE');

                        console.log('💬 Chat messages from history:', chatMessages.length);
                        console.log('🔔 System notifications from history:', notifications.length);

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
        console.log('🧹 Cleaning up connection...');
        
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
                if (currentUserRef.current && hasJoinedRef.current) {
                    stompClientRef.current.send('/app/leave', {}, JSON.stringify({
                        ...currentUserRef.current,
                        type: 'LEAVE',
                        createdBy: 'system',
                        userName: currentUserRef.current.name
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
    };

    const reconnect = useCallback(() => {
        if (!currentUserRef.current || connected || stompClientRef.current?.connected) {
            console.log('⏭️ Skipping reconnect - conditions not met');
            return;
        }

        console.log(`🔄 Reconnection attempt: #${++connectionAttemptRef.current}`);
        cleanupConnection();

        const socket = new SockJS('http://localhost:8080/ws');
        const client = Stomp.over(socket);
        stompClientRef.current = client;
        client.debug = () => {};

        const onConnect = () => {
            console.log(`✅ WebSocket connected for user: ${currentUserRef.current.name}`);
            setConnected(true);
            setStompClient(client);

            // Tạo subscription mới
            if (!subscriptionRef.current) {
                console.log('📡 Creating new subscription...');
                subscriptionRef.current = client.subscribe('/topic/public', handleMessage);
                console.log('✅ Subscription created successfully');
            }

            // Send join message
            if (!hasJoinedRef.current) {
                const joinMessage = {
                    ...currentUserRef.current,
                    type: 'JOIN',
                    sentAt: new Date(),
                    createdBy: 'system',
                    userName: currentUserRef.current.name
                };

                console.log('📤 Sending join message:', joinMessage.userName);
                client.send('/app/join', {}, JSON.stringify(joinMessage));
                hasJoinedRef.current = true;
            }
        };

        const onError = (error) => {
            console.error(`❌ WebSocket connection error for user: ${currentUserRef.current?.name}`, error);
            setConnected(false);
            hasJoinedRef.current = false;
            subscriptionRef.current = null;
            stompClientRef.current = null;
        };

        try {
            client.connect({}, onConnect, onError);
        } catch (err) {
            console.error("Error during reconnect attempt:", err);
        }
    }, [connected, handleMessage]);

    useEffect(() => {
        if (!currentUser) return;

        fetchChatHistory();

        return () => {
            cleanupConnection();
        };
    }, [currentUser]);

    useEffect(() => {
        if (!currentUser) return;

        reconnect();

        return () => cleanupConnection();
    }, [currentUser, reconnect]);

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
            {/* Notification System */}
            {!isWindowFocused && newMessageCount > 0 && (
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
                        {/* Debug info */}
                        <span className="badge bg-secondary me-2 small">
                            Debug: Focus={isWindowFocused ? 'Y' : 'N'}, Count={newMessageCount}
                        </span>
                        
                        {/* Hiển thị số lượng tin nhắn mới */}
                        {newMessageCount > 0 && (
                            <span className="badge bg-warning text-dark me-2">
                                {newMessageCount} new messages
                            </span>
                        )}
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
                    <Input sendMessage={sendMessage} disabled={!connected} reconnect={reconnect} />
                </div>
            </div>
        </div>
    );
};

export default Chat;