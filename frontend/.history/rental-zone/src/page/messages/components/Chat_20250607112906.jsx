import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import Message from './Message';
import Input from './Input';
import { setMessageCount } from '../redux/actions/messageActions'; // Adjust path as needed

const Chat = ({ authenticated, currentUser, onLogout, onNewMessage }) => {
    const [messages, setMessages] = useState([]);
    const [systemNotifications, setSystemNotifications] = useState([]);
    const [stompClient, setStompClient] = useState(null);
    const [connected, setConnected] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [newMessageCount, setNewMessageCount] = useState(0);
    const messagesEndRef = useRef(null);
    const stompClientRef = useRef(null);
    const subscriptionRef = useRef(null);
    const historySubscriptionRef = useRef(null);
    const hasJoinedRef = useRef(false);
    const connectionAttemptRef = useRef(0);
    const historyLoadedRef = useRef(false);
    
    const dispatch = useDispatch(); // Add Redux dispatch

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

    // Update Redux store when newMessageCount changes
    useEffect(() => {
        dispatch(setMessageCount(newMessageCount));
    }, [newMessageCount, dispatch]);

    // Reset message count when chat component is focused/viewed
    useEffect(() => {
        const handleFocus = () => {
            setNewMessageCount(0);
            dispatch(setMessageCount(0));
        };

        // Reset count when component mounts (user enters chat)
        setNewMessageCount(0);
        dispatch(setMessageCount(0));

        window.addEventListener('focus', handleFocus);
        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [dispatch]);

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

    const reconnect = () => {
        if (!currentUser || connected || stompClientRef.current?.connected) return;

        console.log(`Reconnection attempt: attempt #${++connectionAttemptRef.current}`);
        cleanupConnection();

        const socket = new SockJS('http://localhost:8080/ws');
        const client = Stomp.over(socket);
        stompClientRef.current = client;
        client.debug = () => {};

        const onConnect = () => {
            console.log(`WebSocket reconnected for user: ${currentUser.name}`);
            setConnected(true);
            setStompClient(client);

            if (!subscriptionRef.current) {
                subscriptionRef.current = client.subscribe('/topic/public', (message) => {
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
                            // Only increment count for messages from other users
                            if (!messageWithId.isOwnMessage && messageWithId.type === 'CHAT') {
                                setNewMessageCount(prevCount => {
                                    const updatedCount = prevCount + 1;
                                    console.log(`Total new messages received: ${updatedCount}`);
                                    return updatedCount;
                                });
                            }
                            return newMessages;
                        });
                        if (onNewMessage && messageWithId.type === 'CHAT' && !messageWithId.isOwnMessage) {
                            onNewMessage(messageWithId);
                        }
                    }
                });

                console.log('Subscription created for user:', currentUser.name);
            }

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
            console.error(`WebSocket reconnection error for user: ${currentUser.name}`, error);
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
    };

    useEffect(() => {
        if (!currentUser) return;

        reconnect();

        return () => cleanupConnection();
    }, [currentUser]);

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

        console.log('Sending message:', chatMessage);
        stompClientRef.current.send('/app/chat/public', {}, JSON.stringify(chatMessage));
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
            <div className="card flex-grow-1">
                <div className="card-header d-flex justify-content-between align-items-center py-2">
                    <h4 className="mb-0 fw-bold">PUBLIC CHAT ROOM</h4>
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