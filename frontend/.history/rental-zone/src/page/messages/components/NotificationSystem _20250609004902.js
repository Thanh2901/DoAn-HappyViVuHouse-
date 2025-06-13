// src/components/NotificationSystem.js
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import './NotificationSystem.css'; // CSS file để styling

const NotificationSystem = ({ 
  onNotificationClick = () => {}, 
  position = 'top-right', 
  autoHide = true, 
  hideDelay = 5000 
}) => {
  const [notifications, setNotifications] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  
  // Lấy message count từ Redux
  const newMessageCount = useSelector(state => state.messages.newMessageCount);

  // Effect để tạo thông báo khi có tin nhắn mới
  useEffect(() => {
    if (newMessageCount > 0) {
      const notification = {
        id: `msg-${Date.now()}`,
        title: 'Tin nhắn mới',
        message: `Bạn có ${newMessageCount} tin nhắn mới`,
        type: 'message',
        timestamp: new Date(),
      };
      
      showNotification(notification);
    }
  }, [newMessageCount]);

  const showNotification = (notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Giữ tối đa 5 thông báo
    setIsVisible(true);

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

  // Effect để hiển thị browser notification
  useEffect(() => {
    if (newMessageCount > 0) {
      showBrowserNotification(
        'Chat App - Tin nhắn mới',
        `Bạn có ${newMessageCount} tin nhắn mới chưa đọc`
      );
    }
  }, [newMessageCount]);

  // Request permission khi component mount
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  if (notifications.length === 0) return null;

  return (
    <div className={`notification-container ${position}`}>
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`notification ${notification.type} notification-enter`}
          onClick={() => handleNotificationClick(notification)}
        >
          <div className="notification-header">
            <div className="notification-icon">
              {notification.type === 'message' && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                </svg>
              )}
            </div>
            <div className="notification-title">{notification.title}</div>
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
          <div className="notification-time">
            {notification.timestamp.toLocaleTimeString()}
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationSystem;