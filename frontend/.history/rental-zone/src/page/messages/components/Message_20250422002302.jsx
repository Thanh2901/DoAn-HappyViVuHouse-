import React from 'react';

const Message = ({ message, isOwnMessage, username }) => {
  return (
    <div
      className={`d-flex ${isOwnMessage ? 'justify-content-end' : 'justify-content-start'} mb-2`}
    >
      {!isOwnMessage && (
        <small className="text-muted me-2 align-self-end">
          {message.createdBy}
        </small>
      )}
      <div
        className={`p-2 rounded-3 ${
          isOwnMessage ? 'bg-primary text-white' : 'bg-light'
        }`}
        style={{
          maxWidth: '70%',
          wordWrap: 'break-word'
        }}
      >
        <div>{message.content}</div>
        <small className={`d-block text-${isOwnMessage ? 'white-50' : 'muted'} text-end`}>
          {new Date(message.sentAt).toLocaleTimeString()}
        </small>
      </div>
      {isOwnMessage && (
        <small className="text-muted ms-2 align-self-end">
          {message.createdBy}
        </small>
      )}
    </div>
  );
};

export default Message;