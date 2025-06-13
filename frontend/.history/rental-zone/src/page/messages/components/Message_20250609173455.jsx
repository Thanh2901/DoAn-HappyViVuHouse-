import React from 'react';

const Message = ({ message, isOwnMessage, username }) => {
  const renderFile = () => {
    if (message.type !== 'FILE') return null;
    if (!message.fileName) {
      console.warn('Missing fileName in FILE message:', message); // Debug log
      return <div className="text-danger">Error: File name missing</div>;
    }

    const fileUrl = `http://localhost:8080/files/${message.fileName}`;
    const formatFileSize = (bytes) => {
      if (bytes == null) return 'Unknown size';
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (message.fileType?.startsWith('image/')) {
      return (
        <a href={fileUrl} target="_blank" rel="noopener noreferrer">
          <img
            src={fileUrl}
            alt={message.fileName}
            style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '8px', marginTop: '5px' }}
            onError={() => console.error('Failed to load image:', fileUrl)}
          />
        </a>
      );
    } else if (message.fileType === 'application/pdf') {
      return (
        <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="file-link">
          <i className="bi bi-file-earmark-pdf"></i> {message.fileName} ({formatFileSize(message.fileSize)})
        </a>
      );
    } else {
      return (
        <a href={fileUrl} download className="file-link">
          <i className="bi bi-file-earmark"></i> {message.fileName} ({formatFileSize(message.fileSize)})
        </a>
      );
    }
  };

  return (
    <div className={`d-flex flex-column ${isOwnMessage ? 'align-items-end' : 'align-items-start'} mb-2`}>
      <div
        className={`p-2 rounded-3 ${isOwnMessage ? 'bg-primary text-white' : 'bg-info-subtle'}`}
        style={{ maxWidth: '70%', wordWrap: 'break-word' }}
      >
        <small className="d-block text-muted">{message.createdBy || username}</small>
        {message.type === 'CHAT' && <div>{message.content}</div>}
        {renderFile()}
        <small className={`d-block text-${isOwnMessage ? 'white-50' : 'muted'} text-end`}>
          {new Date(message.sentAt).toLocaleTimeString()}
        </small>
      </div>
      <style jsx>{`
        .file-link {
          display: flex;
          align-items: center;
          color: ${isOwnMessage ? '#ffffff' : '#007bff'};
          text-decoration: none;
          margin-top: 5px;
        }
        .file-link:hover {
          text-decoration: underline;
        }
        .file-link i {
          margin-right: 5px;
        }
      `}</style>
    </div>
  );
};

export default Message;