import React from 'react';

const Message = ({ message, isOwnMessage, username }) => {
  return (
    <div
      className={`d-flex flex-column ${isOwnMessage ? 'align-items-end' : 'align-items-start'} mb-2`}
    >
      <div
        className={`p-2 rounded-3 ${
          isOwnMessage ? 'bg-primary text-white' : 'bg-info-subtle'
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
      <small className="text-muted mt-1">
        {message.createdBy}
      </small>
    </div>
  );
};

export default Message;