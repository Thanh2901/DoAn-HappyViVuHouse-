import React from 'react';

const Message = ({ message, isOwnMessage, username }) => {
  return (
    <div
      className={`d-flex ${isOwnMessage ? 'justify-content-end' : 'justify-content-start'} mb-2`}
    >
      <div
        className={`p-2 rounded-3 ${isOwnMessage ? 'bg-success text-white' : 'bg-light text-dark'}`}
        style={{
          maxWidth: '75%', // Giới hạn chiều rộng tối đa
          wordWrap: 'break-word', // Tự động xuống dòng nếu nội dung quá dài
        }}
      >
        <div>{message.content}</div>
        <div className="text-end text-muted" style={{ fontSize: '0.8rem' }}>
          {new Date(message.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export default Message;