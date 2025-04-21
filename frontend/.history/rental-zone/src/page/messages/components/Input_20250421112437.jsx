import React, { useState } from 'react';

const Input = ({ sendMessage, disabled }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Trim message to check for empty content
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

  return (
    <div className="input-container">
      <form onSubmit={handleSubmit}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={disabled ? "Connecting..." : "Type a message..."}
          disabled={disabled}
        />
        <button 
          type="submit" 
          disabled={disabled || !message.trim()}
        >
          Send
        </button>
      </form>
      
      <style jsx>{`
        .input-container {
          padding: 10px;
          background: #f5f5f5;
          border-top: 1px solid #e1e1e1;
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