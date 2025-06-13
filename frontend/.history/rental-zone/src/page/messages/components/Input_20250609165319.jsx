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
          formData.append('clientId', clientId);

          try {
            await axios.post('http://localhost:8080/upload-file', formData, {
              headers: {
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
        /* Existing styles */
      `}</style>
    </div>
  );
};

export default Input;