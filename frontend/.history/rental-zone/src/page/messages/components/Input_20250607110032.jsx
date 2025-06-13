import React, { useState } from 'react';
import EmojiPicker from 'emoji-picker-react';

const Input = ({ sendMessage, disabled, reconnect }) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const trimmedMessage = message.trim();
    
    if (trimmedMessage && !disabled) {
      sendMessage(trimmedMessage);
      setMessage('');
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

  return (
    <div className="input-container">
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <i className="bi bi-emoji-smile"></i>
          </button>
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
            disabled={disabled || !message.trim()}
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
        
        form {
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
        
        button:hover:not(:disabled) {
          background: #3f51b5;
        }
        
        button:disabled {
          background: #b5b5b5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default Input;