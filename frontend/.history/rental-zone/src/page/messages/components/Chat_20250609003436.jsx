import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import Message from './Message';
import Input from './Input';
import { incrementMessageCount, resetMessageCount, setNewMessageCount } from '../../../redux/actions/messageAction';

const Chat = ({ authenticated, currentUser, onLogout, onNewMessage }) => {
    const [messages, setMessages] = useState([]);
    const [systemNotifications, setSystemNotifications] = useState([]);
    const [stompClient, setStompClient] = useState(null);
    const [connected, setConnected] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [connectionError, setConnectionError] = useState(null);
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
    const maxReconnectAttempts = 5;

    const scrollToBottom = useCallback(() => {
        const chatBody = document.querySelector('.card-body');
        if (chatBody) {
            chatBody.scrollTop = chatBody.scrollHeight;
        }
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, systemNotifications, scrollToBottom]);

    const fetchChatHistory = useCallback(async () => {
        if (!currentUser) {
            setIsLoadingHistory(false);
            return;
        }

        try {
            setIsLoadingHistory(true);
            const tempSocket = new SockJS('http://localhost:8080/ws');
            const tempClient = Stomp.over(tempSocket);
            tempClient.debug = () => {};

            await new Promise((resolve, reject) => {
                const timeoutId = setTimeout(() => {
                    try {
                        if (historySubscriptionRef.current) {
                            historySubscriptionRef.current.unsubscribe();
                            historySubscriptionRef.current = null;
                        }
                        tempClient.disconnect();
                        reject(new Error('History fetch timed out'));
                    } catch (err) {
                        console.error('Error during history timeout cleanup:', err);
                        reject(err);
                    }
                }, 10000); // Increased timeout to 10 seconds

                tempClient.connect({}, () => {
                    console.log('Connected to server for history fetch');

                    historySubscriptionRef.current = tempClient.subscribe('/topic/public/history', (message) => {
                        try {
                            clearTimeout(timeoutId);
                            const historyMessages = JSON.parse(message.body);
                            console.log('Received chat history:', historyMessages);

                            const processedMessages = historyMessages.map(msg => ({
                                ...msg,
                                clientId: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                                isOwnMessage: msg.createdBy === currentUser?.name
                            }));

                            const chatMessages = processedMessages.filter(msg => msg.type === 'CHAT');
                            const notifications = processedMessages.filter(msg => msg.type === 'JOIN' || msg.type === 'LEAVE');

                            setMessages(chatMessages);
                            setSystemNotifications(notifications);
                            historyLoadedRef.current = true;

                            if (historySubscriptionRef.current) {
                                historySubscriptionRef.current.unsubscribe();
                                historySubscriptionRef.current = null;
                            }
                            tempClient.disconnect();
                            resolve();
                        } catch (error) {
                            clearTimeout(timeoutId);
                            console.error('Error processing history response:', error);
                            reject(error);
                        }
                    });

                    tempClient.send('/app/chat/public/history', {}, JSON.stringify({}));
                }, (error) => {
                    clearTimeout(timeoutId);
                    console.error('Failed to connect for history:', error);
                    reject(error);
                });
            });
        } catch (err) {
            console.error('Error fetching chat history:', err);
            setConnectionError('Failed to load chat history');
        } finally {
            setIsLoadingHistory(false);
        }
    }, [currentUser]);

    const cleanupConnection = useCallback(() => {
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
        setIsReconnecting(false);
    }, [currentUser]);

    const scheduleReconnect = useCallback(() => {
        if (connectionAttemptRef.current >= maxReconnectAttempts) {
            console.log('Max reconnection attempts reached');
            setConnectionError('Unable to connect to chat server');
            setIsReconnecting(false);
            return;
        }

        const delay = Math.min(1000 * Math.pow(2, connectionAttemptRef.current), 30000); // Exponential backoff, max 30s
        console.log(`Scheduling reconnection attempt in ${delay}ms`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
            reconnect();
        }, delay);
    }, []);

    const reconnect = useCallback(() => {
        if (!currentUser || connected || stompClientRef.current?.connected || isReconnecting) return;

        console.log(`Reconnection attempt: #${++connectionAttemptRef.current}`);
        setIsReconnecting(true);
        setConnectionError(null);
        
        cleanupConnection();

        const socket = new SockJS('http://localhost:8080/ws');
        const client = Stomp.over(socket);
        stompClientRef.current = client;
        client.debug = () => {};

        const onConnect = () => {
            console.log(`WebSocket connected for user: ${currentUser.name}`);
            setConnected(true);
            setStompClient(client);
            setIsReconnecting(false);
            setConnectionError(null);
            connectionAttemptRef.current = 0; // Reset counter on successful connection

            if (!subscriptionRef.current) {
                subscriptionRef.current = client.subscribe('/topic/public', (message) => {
                    try {
                        const receivedMessage = JSON.parse(message.body);
                        const messageWithId = {
                            ...receivedMessage,
                            clientId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                            isOwnMessage: receivedMessage.createdBy === currentUser.name
                        };
                        
                        if (messageWithId.type === 'JOIN' || messageWithId.type === 'LEAVE') {
                            setSystemNotifications(prev => [...prev, messageWithId]);
                        } else {
                            setMessages(prev => {
                                const newMessages = [...prev, messageWithId];
                                
                                // Only increment counter for messages from other users
                                if (!messageWithId.isOwnMessage) {
                                    dispatch(incrementMessageCount());
                                    console.log(`New message received from ${messageWithId.createdBy}`);
                                }
                                
                                return newMessages;
                            });
                            
                            if (onNewMessage && messageWithId.type === 'CHAT' && !messageWithId.isOwnMessage) {
                                onNewMessage(messageWithId);
                            }
                        }
                    } catch (error) {
                        console.error('Error processing received message:', error);
                    }
                });

                console.log('Subscription created for user:', currentUser.name);
            }

            // Subscribe to personal message count updates
            client.subscribe(`/user/${currentUser.name}/topic/message-count`, (message) => {
                try {
                    const countUpdate = JSON.parse(message.body);
                    dispatch(setNewMessageCount(countUpdate.unreadCount));
                } catch (error) {
                    console.error('Error processing message count update:', error);
                }
            });

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
            console.error(`WebSocket connection error for user: ${currentUser.name}`, error);
            setConnected(false);
            setIsReconnecting(false);
            hasJoinedRef.current = false;
            subscriptionRef.current = null;
            stompClientRef.current = null;
            
            setConnectionError('Connection lost. Attempting to reconnect...');
            scheduleReconnect();
        };

        try {
            client.connect({}, onConnect, onError);
        } catch (err) {
            console.error("Error during reconnect attempt:", err);
            setIsReconnecting(false);
            scheduleReconnect();
        }
    }, [currentUser, connected, isReconnecting, cleanupConnection, scheduleReconnect, dispatch, onNewMessage]);

    // Mark messages as read when chat becomes visible
    const markMessagesAsRead = useCallback(async () => {
        if (!currentUser || newMessageCount === 0) return;

        try {
            const response = await fetch('/api/message-count/mark-read', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                dispatch(resetMessageCount());
            }
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    }, [currentUser, newMessageCount, dispatch]);

    // Initial setup
    useEffect(() => {
        if (!currentUser) {
            setIsLoadingHistory(false);
            return;
        }

        fetchChatHistory();
        dispatch(resetMessageCount());

        return () => {
            cleanupConnection();
        };
    }, [currentUser, fetchChatHistory, dispatch, cleanupConnection]);

    // Connection management
    useEffect(() => {
        if (!currentUser) return;

        reconnect();

        return () => cleanupConnection();
    }, [currentUser, reconnect, cleanupConnection]);

    // Handle page visibility changes
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden && newMessageCount > 0) {
                markMessagesAsRead();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [newMessageCount, markMessagesAsRead]);

    // Handle beforeunload
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
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [currentUser]);

    const sendMessage = useCallback((content) => {
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

        try {
            console.log('Sending message:', chatMessage);
            stompClientRef.current.send('/app/chat/public', {}, JSON.stringify(chatMessage));
        } catch (error) {
            console.error('Error sending message:', error);
            setConnectionError('Failed to send message. Please try again.');
        }
    }, [connected, currentUser]);

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
            <div className="card flex-grow-1">
                <div className="card-header d-flex justify-content-between align-items-center py-2">
                    <h4 className="mb-0 fw-bold">PUBLIC CHAT ROOM</h4>
                    <div className="d-flex align-items-center">
                        {newMessageCount > 0 && (
                            <span className="badge bg-warning text-dark me-2">
                                {newMessageCount} new message{newMessageCount > 1 ? 's' : ''}
                            </span>
                        )}
                        {isLoadingHistory && (
                            <span className="badge bg-info me-2">Loading history...</span>
                        )}
                        {isReconnecting && (
                            <span className="badge bg-warning me-2">Reconnecting...</span>
                        )}
                        {connectionError && (
                            <span className="badge bg-danger me-2" title={connectionError}>
                                Connection Error
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
                    <Input 
                        sendMessage={sendMessage} 
                        disabled={!connected || isReconnecting} 
                        reconnect={reconnect}
                        placeholder={!connected ? 'Connecting...' : 'Type your message...'}
                    />
                    {connectionError && (
                        <div className="text-danger small mt-1">
                            {connectionError}
                            <button 
                                className="btn btn-link btn-sm p-0 ms-2" 
                                onClick={reconnect}
                                disabled={isReconnecting}
                            >
                                Retry
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Chat;