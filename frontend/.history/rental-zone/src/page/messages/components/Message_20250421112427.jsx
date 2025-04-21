import React from 'react';

const Message = ({ message, isOwnMessage, username }) => {
  // Check if this is a system message (join/leave notifications)
  const isSystemMessage = message.content && 
    (message.content.includes("join in conversation") || 
     message.content.includes("leave conversation"));

  // Format the timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isSystemMessage) {
    return (
      <div className="system-message">
        <p>{message.content}</p>
        <span className="time">{formatTime(message.sentAt)}</span>
        
        <style jsx>{`
          .system-message {
            text-align: center;
            margin: 10px 0;
            padding: 5px;
          }
          
          .system-message p {
            display: inline-block;
            background: #f0f0f0;
            border-radius: 15px;
            padding: 5px 10px;
            margin: 0;
            font-size: 12px;
            color: #666;
          }
          
          .time {
            display: block;
            font-size: 10px;
            color: #999;
            margin-top: 2px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className={`message ${isOwnMessage ? 'own-message' : 'other-message'}`}>
      <div className="message-bubble">
        {!isOwnMessage && <div className="username">{username}</div>}
        <div className="content">{message.content}</div>
        <div className="meta">
          <span className="time">{formatTime(message.sentAt)}</span>
          {message.read && <span className="read-status">✓</span>}
        </div>
      </div>
      
      <style jsx>{`
        .message {
          display: flex;
          margin-bottom: 15px;
        }
        
        .own-message {
          justify-content: flex-end;
        }
        
        .message-bubble {
          max-width: 70%;
          padding: 10px 15px;
          border-radius: 18px;
          position: relative;
          word-wrap: break-word;
        }
        
        .own-message .message-bubble {
          background-color: #dcf8c6;
          border-bottom-right-radius: 5px;
        }
        
        .other-message .message-bubble {
          background-color: #fff;
          border-bottom-left-radius: 5px;
          box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
        }
        
        .username {
          font-weight: bold;
          font-size: 12px;
          margin-bottom: 3px;
          color: #555;
        }
        
        .content {
          font-size: 14px;
        }
        
        .meta {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          margin-top: 5px;
        }
        
        .time {
          font-size: 10px;
          color: #999;
        }
        
        .read-status {
          margin-left: 5px;
          color: #63a8e2;
        }
      `}</style>
    </div>
  );
};

export default Message;