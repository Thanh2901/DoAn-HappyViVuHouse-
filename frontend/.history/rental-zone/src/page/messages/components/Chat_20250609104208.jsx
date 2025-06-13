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
    
    // Redux state
    const newMessageCount = useSelector(state => state.messages.newMessageCount);
    const dispatch = useDispatch();
    
    // Refs
    const messagesEndRef = useRef(null);
    const stompClientRef = useRef(null);
    const subscriptionRef = useRef(null);
    const historySubscriptionRef = useRef(null);
    const hasJoinedRef = useRef(false);
    const connectionAttemptRef = useRef(0);
    const historyLoadedRef = useRef(false);
    
    // Refs for current values to avoid stale closures
    const isWindowFocusedRef = useRef(isWindowFocused);
    const currentUserRef = useRef(currentUser);
    const newMessageCountRef = useRef(newMessageCount);

    // Update refs when values change
    useEffect(() => {
        isWindowFocusedRef.current = isWindowFocused;
    }, [isWindowFocused]);

    useEffect(() => {
        currentUserRef.current = currentUser;
    }, [currentUser]);

    useEffect(() => {
        newMessageCountRef.current = newMessageCount;
    }, [newMessageCount]);

    // Enhanced message counting function
    const handleNewMessage = useCallback((message) => {
        const isOwnMessage = message.createdBy === currentUserRef.current?.name;
        const shouldCount = !isOwnMessage && !isWindowFocusedRef.current;
        
        console.group('📨 Message Received');
        console.log('Message details:', {
            type: message.type,
            from: message.createdBy,
            content: message.content?.substring(0, 50) + (message.content?.length > 50 ? '...' : ''),
            timestamp: new Date(message.sentAt).toLocaleTimeString(),
            isOwnMessage,
            windowFocused: isWindowFocusedRef.current,
            currentMessageCount: newMessageCountRef.current
        });

        if (shouldCount) {
            console.log('📈 Incrementing message count:', {
                from: newMessageCountRef.current,
                to: newMessageCountRef.current + 1,
                reason: 'New message from other user while window not focused'
            });
            dispatch(incrementMessageCount());
        } else {
            console.log('📊 Message count not incremented:', {
                reason: isOwnMessage ? 'Own message' : 'Window is focused'
            });
        }
        console.groupEnd();

        return shouldCount;
    }, [dispatch]);

    // Enhanced window focus tracking
    useEffect(() => {
        const handleFocus = () => {
            console.group('🔍 Window Focus Event');
            console.log('Window gained focus');
            console.log('Current message count:', newMessageCountRef.current);
            
            setIsWindowFocused(true);
            
            if (newMessageCountRef.current > 0) {
                console.log(`🔄 Resetting message count from ${newMessageCountRef.current} to 0 (window focused)`);
                dispatch(resetMessageCount());
            } else {
                console.log('No messages to reset');
            }
            console.groupEnd();
        };
        
        const handleBlur = () => {
            console.group('👁️ Window Blur Event');
            console.log('Window lost focus - message counting enabled');
            setIsWindowFocused(false);
            console.groupEnd();
        };

        // Add visibility change listener as backup
        const handleVisibilityChange = () => {
            const isVisible = !document.hidden;
            console.group('👀 Visibility Change');
            console.log('Page visibility changed:', isVisible ? 'visible' : 'hidden');
            
            if (isVisible) {
                setIsWindowFocused(true);
                if (newMessageCountRef.current > 0) {
                    console.log(`🔄 Resetting message count from ${newMessageCountRef.current} to 0 (page visible)`);
                    dispatch(resetMessageCount());
                }
            } else {
                setIsWindowFocused(false);
            }
            console.groupEnd();
        };
        
        window.addEventListener('focus', handleFocus);
        window.addEventListener('blur', handleBlur);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        return () => {
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('blur', handleBlur);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [dispatch]);

    // Enhanced message subscription
    const setupMessageSubscription = useCallback((client) => {
        if (subscriptionRef.current) {
            console.log('🔄 Unsubscribing existing subscription');
            subscriptionRef.current.unsubscribe();
        }

        console.log('📡 Setting up message subscription for user:', currentUserRef.current?.name);
        
        subscriptionRef.current = client.subscribe('/topic/public', (message) => {
            try {
                const receivedMessage = JSON.parse(message.body);
                
                console.group('📦 WebSocket Message Received');
                console.log('Raw message:', receivedMessage);
                
                const messageWithId = {
                    ...receivedMessage,
                    clientId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    isOwnMessage: receivedMessage.createdBy === currentUserRef.current?.name
                };
                
                if (messageWithId.type === 'JOIN' || messageWithId.type === 'LEAVE') {
                    console.log('🔔 System notification:', messageWithId.type, 'by', messageWithId.userName || messageWithId.createdBy);
                    setSystemNotifications(prev => [...prev, messageWithId]);
                } else if (messageWithId.type === 'CHAT') {
                    console.log('💬 Chat message processing...');
                    
                    setMessages(prev => {
                        const newMessages = [...prev, messageWithId];
                        
                        // Handle message counting
                        const shouldCount = handleNewMessage(messageWithId);
                        
                        // Call onNewMessage callback if needed
                        if (onNewMessage && !messageWithId.isOwnMessage) {
                            console.log('📢 Calling onNewMessage callback');
                            onNewMessage(messageWithId);
                        }
                        
                        return newMessages;
                    });
                }
                
                console.groupEnd();
            } catch (error) {
                console.error('❌ Error processing WebSocket message:', error);
            }
        });

        console.log('✅ Message subscription established');
        return subscriptionRef.current;
    }, [handleNewMessage, onNewMessage]);

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

        return () => {
            cleanupConnection();
        };
    }, [currentUser]);

    // Reset message count when component mounts or user changes
    useEffect(() => {
        if (currentUser) {
            console.group('👤 User Change Event');
            console.log('Current user changed to:', currentUser.name);
            console.log('Resetting message count to 0');
            dispatch(resetMessageCount());
            console.groupEnd();
        }
    }, [currentUser, dispatch]);

    // Enhanced logging for message count changes
    useEffect(() => {
        console.log('📊 Message count updated:', {
            newCount: newMessageCount,
            timestamp: new Date().toLocaleTimeString(),
            windowFocused: isWindowFocused
        });
        
        // Update document title to show unread count
        if (newMessageCount > 0) {
            document.title = `(${newMessageCount}) Chat Room`;
        } else {
            document.title = 'Chat Room';
        }
    }, [newMessageCount, isWindowFocused]);

    const fetchChatHistory = async () => {
        console.group('📜 Fetching Chat History');
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
                        console.log('📚 Received chat history:', historyMessages.length, 'messages');

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
            console.error('❌ Error fetching chat history:', err);
        } finally {
            setIsLoadingHistory(false);
            console.groupEnd();
        }
    };

    const cleanupConnection = () => {
        console.group('🧹 Cleaning up connection');
        
        if (historySubscriptionRef.current) {
            try {
                historySubscriptionRef.current.unsubscribe();
                console.log('✅ History subscription cleaned up');
            } catch (err) {
                console.error("❌ Error unsubscribing from history:", err);
            }
            historySubscriptionRef.current = null;
        }

        if (subscriptionRef.current) {
            try {
                subscriptionRef.current.unsubscribe();
                console.log('✅ Message subscription cleaned up');
            } catch (err) {
                console.error("❌ Error unsubscribing:", err);
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
                    console.log('📤 Leave message sent');
                }
                stompClientRef.current.disconnect();
                console.log('🔌 WebSocket disconnected');
            } catch (err) {
                console.error("❌ Error disconnecting:", err);
            }
        }
        stompClientRef.current = null;
        setConnected(false);
        console.groupEnd();
    };

    const reconnect = useCallback(() => {
        if (!currentUser || connected || stompClientRef.current?.connected) return;

        console.group('🔄 WebSocket Reconnection');
        console.log(`Reconnection attempt #${++connectionAttemptRef.current} for user:`, currentUser.name);
        
        cleanupConnection();

        const socket = new SockJS('http://localhost:8080/ws');
        const client = Stomp.over(socket);
        stompClientRef.current = client;
        client.debug = () => {};

        const onConnect = () => {
            console.log(`✅ WebSocket connected for user: ${currentUser.name}`);
            setConnected(true);
            setStompClient(client);

            // Setup message subscription
            setupMessageSubscription(client);

            if (!hasJoinedRef.current) {
                const joinMessage = {
                    ...currentUser,
                    type: 'JOIN',
                    sentAt: new Date(),
                    createdBy: 'system',
                    userName: currentUser.name
                };

                console.log('📤 Sending join message:', joinMessage);
                client.send('/app/join', {}, JSON.stringify(joinMessage));
                hasJoinedRef.current = true;
            }
            
            console.groupEnd();
        };

        const onError = (error) => {
            console.error(`❌ WebSocket connection error for user: ${currentUser.name}`, error);
            setConnected(false);
            hasJoinedRef.current = false;
            subscriptionRef.current = null;
            stompClientRef.current = null;
            console.groupEnd();
        };

        try {
            client.connect({}, onConnect, onError);
        } catch (err) {
            console.error("❌ Error during reconnect attempt:", err);
            console.groupEnd();
        }
    }, [currentUser, connected, setupMessageSubscription]);

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
                    console.log('📤 Leave message sent on page unload');
                } catch (err) {
                    console.error("❌ Error sending leave message:", err);
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
            console.error('❌ Cannot send message: WebSocket not connected or currentUser is null');
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

        console.group('📤 Sending Message');
        console.log('Message details:', {
            content: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
            from: currentUser.name,
            timestamp: new Date().toLocaleTimeString()
        });
        
        stompClientRef.current.send('/app/chat/public', {}, JSON.stringify(chatMessage));
        console.groupEnd();
    };

    // Handle notification click
    const handleNotificationClick = useCallback(() => {
        console.group('🔔 Notification Click');
        console.log('Notification clicked - focusing window and resetting count');
        console.log('Current message count:', newMessageCountRef.current);
        
        window.focus();
        scrollToBottom();
        
        if (newMessageCountRef.current > 0) {
            console.log(`🔄 Resetting message count from ${newMessageCountRef.current} to 0`);
            dispatch(resetMessageCount());
        }
        console.groupEnd();
    }, [dispatch]);

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
                        {/* Message count indicator */}
                        {newMessageCount > 0 && (
                            <span className="badge bg-warning text-dark me-2" 
                                  title={`${newMessageCount} unread messages`}>
                                {newMessageCount} new message{newMessageCount !== 1 ? 's' : ''}
                            </span>
                        )}
                        {isLoadingHistory && (
                            <span className="badge bg-info me-2">Loading history...</span>
                        )}
                        <span className={`badge fs-6 ${connected ? 'bg-success' : 'bg-danger'}`}
                              title={connected ? 'Connected to chat server' : 'Disconnected from chat server'}>
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