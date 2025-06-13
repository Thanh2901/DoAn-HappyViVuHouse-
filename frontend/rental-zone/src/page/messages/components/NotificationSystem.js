// src/components/NotificationSystem.js
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import './NotificationSystem.css'; // CSS file để styling

const NotificationSystem = ({ 
  onNotificationClick = () => {}, 
  position = 'top-right', 
  autoHide = true, 
  hideDelay = 5000,
  newMessage = null, // Prop mới để nhận tin nhắn từ Chat component
  onNewMessage = null // Callback để xử lý tin nhắn mới
}) => {
  const [notifications, setNotifications] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [lastMessageId, setLastMessageId] = useState(null);
  
  // Lấy message count từ Redux
  const newMessageCount = useSelector(state => state.messages.newMessageCount);

  // Effect để tạo thông báo khi có tin nhắn mới từ prop
  useEffect(() => {
    if (newMessage && newMessage.uniqueId !== lastMessageId) {
      setLastMessageId(newMessage.uniqueId);
      
      const notification = {
        id: `msg-${newMessage.uniqueId || Date.now()}`,
        title: `${newMessage.createdBy || 'Người dùng'}`,
        message: truncateMessage(newMessage.content || newMessage.message || 'Tin nhắn mới'),
        type: getMessageType(newMessage.type),
        timestamp: new Date(newMessage.sentAt || new Date()),
        fullMessage: newMessage,
        avatar: newMessage.avatar || null,
      };
      
      showNotification(notification);
    }
  }, [newMessage, lastMessageId]);

  // Effect để tạo thông báo dựa trên message count (fallback)
  useEffect(() => {
    if (newMessageCount > 0 && !newMessage) {
      const notification = {
        id: `count-${Date.now()}`,
        title: 'Tin nhắn mới',
        message: `Bạn có ${newMessageCount} tin nhắn mới chưa đọc`,
        type: 'message',
        timestamp: new Date(),
      };
      
      showNotification(notification);
    }
  }, [newMessageCount, newMessage]);

  // Hàm cắt ngắn tin nhắn
  const truncateMessage = (message, maxLength = 60) => {
    if (!message) return 'Tin nhắn mới';
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  // Xác định loại tin nhắn
  const getMessageType = (messageType) => {
    switch (messageType) {
      case 'CHAT':
        return 'message';
      case 'FILE':
        return 'file';
      case 'IMAGE':
        return 'image';
      case 'JOIN':
        return 'join';
      case 'LEAVE':
        return 'leave';
      default:
        return 'message';
    }
  };

  const showNotification = (notification) => {
    setNotifications(prev => {
      // Tránh duplicate notifications
      const exists = prev.some(n => n.id === notification.id);
      if (exists) return prev;
      
      return [notification, ...prev.slice(0, 4)]; // Giữ tối đa 5 thông báo
    });
    setIsVisible(true);

    // Hiển thị browser notification
    showBrowserNotification(notification.title, notification.message);

    // Tự động ẩn thông báo sau một khoảng thời gian
    if (autoHide) {
      setTimeout(() => {
        removeNotification(notification.id);
      }, hideDelay);
    }
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const handleNotificationClick = (notification) => {
    onNotificationClick(notification);
    if (onNewMessage && notification.fullMessage) {
      onNewMessage(notification.fullMessage);
    }
    removeNotification(notification.id);
  };

  // Request permission cho browser notifications
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  // Hiển thị browser notification
  const showBrowserNotification = (title, body, icon = null) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body,
        icon: icon || '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'chat-message',
        requireInteraction: false,
        silent: false,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
        onNotificationClick();
      };

      // Tự động đóng sau 5 giây
      setTimeout(() => notification.close(), 5000);
    }
  };

  // Request permission khi component mount
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // Render icon dựa trên loại thông báo
  const renderIcon = (type) => {
    switch (type) {
      case 'message':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
          </svg>
        );
      case 'file':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
          </svg>
        );
      case 'image':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z"/>
          </svg>
        );
      case 'join':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
          </svg>
        );
      case 'leave':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
          </svg>
        );
      default:
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
          </svg>
        );
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className={`notification-container ${position}`}>
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`notification ${notification.type} notification-enter`}
          onClick={() => handleNotificationClick(notification)}
        >
          <div className="notification-content">
            <div className="notification-header">
              <div className="notification-icon">
                {renderIcon(notification.type)}
              </div>
              <div className="notification-info">
                <div className="notification-title">{notification.title}</div>
                <div className="notification-time">
                  {notification.timestamp.toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
              <button
                className="notification-close"
                onClick={(e) => {
                  e.stopPropagation();
                  removeNotification(notification.id);
                }}
              >
                ×
              </button>
            </div>
            <div className="notification-message">{notification.message}</div>
            {notification.fullMessage?.type === 'FILE' && (
              <div className="notification-file-info">
                📎 File đính kèm
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationSystem;