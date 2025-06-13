import React, { useState, useRef } from 'react';
import EmojiPicker from 'emoji-picker-react';
import axios from 'axios';

const Input = ({ sendMessage, disabled, reconnect }) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const trimmedMessage = message.trim();
    const currentUser = JSON.parse(localStorage.getItem('currentUser')); // Adjust based on your auth

    if ((trimmedMessage || selectedFiles.length > 0) && !disabled) {
      // Send text message
      if (trimmedMessage) {
        sendMessage(trimmedMessage);
      }

      // Send files
      if (selectedFiles.length > 0) {
        const clientId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        for (const file of selectedFiles) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('createdBy', currentUser.name);
          formData.append('clientAbstractEntity<Long> {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
}Id', clientId);

          try {
            await axios.post('http://localhost:8080/upload-file', formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}` // Adjust based on your auth
              }
            });
          } catch (error) {
            console.error('Error uploading file:', error);
          }
        }
      }

      setMessage('');
      setSelectedFiles([]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  const onEmojiClick = (emojiObject) => {
    setMessage(prevMessage => prevMessage + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const handleInputClick = () => {
    if (disabled) {
      reconnect();
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prevFiles => [...prevFiles, ...files]);
    e.target.value = '';
  };

  const removeFile = (index) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="input-container">
      <form onSubmit={handleSubmit}>
        {selectedFiles.length > 0 && (
          <div className="selected-files">
            {selectedFiles.map((file, index) => (
              <div key={index} className="file-item">
                <div className="file-info">
                  <i className="bi bi-file-earmark"></i>
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">({formatFileSize(file.size)})</span>
                </div>
                <button
                  type="button"
                  className="remove-file-btn"
                  onClick={() => removeFile(index)}
                >
                  <i className="bi bi-x"></i>
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="input-group">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <i className="bi bi-emoji-smile"></i>
          </button>
          
          <button
            type="button"
            className="btn btn-outline-secondary file-btn"
            onClick={openFileDialog}
            disabled={disabled}
          >
            <i className="bi bi-paperclip"></i>
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            style={{ display: 'none' }}
            onChange={handleFileSelect}
            accept="image/*,application/pdf"
          />
          
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            onClick={handleInputClick}
            placeholder={disabled ? "Connecting..." : "Type a message..."}
            disabled={disabled}
          />
          <button 
            type="submit" 
            disabled={disabled || (!message.trim() && selectedFiles.length === 0)}
          >
            <i className="bi bi-send"></i>
          </button>
        </div>
        
        {showEmojiPicker && (
          <div 
            className="position-absolute"
            style={{ 
              bottom: '100%',
              left: '0',
              marginBottom: '5px',
              zIndex: 1000,
              boxShadow: '0 0 10px rgba(0,0,0,0.1)'
            }}
          >
            <EmojiPicker
              onEmojiClick={onEmojiClick}
              searchDisabled
              skinTonesDisabled
              width={300}
              height={320}
            />
          </div>
        )}
      </form>
      
      <style jsx>{`
        .input-container {
          padding: 10px;
          background: #f5f5f5;
          border-top: 1px solid #e1e1e1;
          position: relative;
        }
        
        .selected-files {
          margin-bottom: 10px;
          max-height: 120px;
          overflow-y: auto;
        }
        
        .file-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 8px 12px;
          margin-bottom: 5px;
          font-size: 13px;
        }
        
        .file-info {
          display: flex;
          align-items: center;
          flex: 1;
          min-width: 0;
        }
        
        .file-info i {
          margin-right: 8px;
          color: #666;
        }
        
        .file-name {
          font-weight: 500;
          margin-right: 8px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 200px;
        }
        
        .file-size {
          color: #888;
          font-size: 12px;
        }
        
        .remove-file-btn {
          background: none !important;
          border: none !important;
          color: #999 !important;
          padding: 4px !important;
          margin: 0 !important;
          border-radius: 50% !important;
          width: 20px !important;
          height: 20px !important;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: color 0.2s;
        }
        
        .remove-file-btn:hover {
          color: #dc3545 !important;
          background: #f8f9fa !important;
        }
        
        form {
          display: flex;
          flex-direction: column;
        }
        
        .input-group {
          display: flex;
          align-items: center;
        }
        
        textarea {
          flex: 1;
          border: 1px solid #ddd;
          border-radius: 20px;
          padding: 10px 15px;
          font-size: 14px;
          resize: none;
          height: 40px;
          outline: none;
          font-family: inherit;
          overflow: hidden;
          line-height: 20px;
          max-height: 40px;
        }
        
        textarea:focus {
          border-color: #aaa;
        }
        
        button {
          margin-left: 10px;
          background: #5c6bc0;
          color: white;
          border: none;
          border-radius: 20px;
          padding: 10px 15px;
          font-size: 14px;
          cursor: pointer;
          height: 40px;
          outline: none;
          transition: background 0.3s;
        }
        
        .btn.btn-outline-secondary {
          background: white;
          color: #666;
          border: 1px solid #ddd;
          margin-right: 5px;
          margin-left: 0;
          padding: 8px 12px;
        }
        
        .btn.btn-outline-secondary:hover:not(:disabled) {
          background: #f8f9fa;
          color: #333;
        }
        
        .file-btn {
          margin-right: 5px !important;
        }
        
        button:hover:not(:disabled) {
          background: #3f51b5;
        }
        
        button:disabled {
          background: #b5b5b5;
          cursor: not-allowed;
        }
        
        .btn.btn-outline-secondary:disabled {
          background: #f8f9fa;
          color: #ccc;
          border-color: #e9ecef;
        }
      `}</style>
    </div>
  );
};

export default Input;