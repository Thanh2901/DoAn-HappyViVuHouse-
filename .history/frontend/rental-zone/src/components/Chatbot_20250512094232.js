import React, { useState, useRef, useEffect } from "react";

function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Tự động cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setMessages([...messages, { sender: "user", text: input }]);
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8083/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input }),
      });
      const data = await res.json();
      setMessages((msgs) => [
        ...msgs,
        { sender: "bot", text: data.answer },
      ]);
    } catch (e) {
      setMessages((msgs) => [
        ...msgs,
        { sender: "bot", text: "Có lỗi xảy ra, vui lòng thử lại!" },
      ]);
    }
    setInput("");
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          background: "linear-gradient(135deg, #1677ff 60%, #66e0ff 100%)",
          color: "#fff",
          border: "none",
          borderRadius: "50%",
          width: 60,
          height: 60,
          fontSize: 30,
          cursor: "pointer",
          boxShadow: "0 4px 16px rgba(22,119,255,0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "box-shadow 0.2s",
        }}
        title="Chatbot"
      >
        <span role="img" aria-label="chat">💬</span>
      </button>
    );
  }

  return (
    <div style={{
      border: "none",
      padding: 0,
      width: 370,
      maxWidth: "95vw",
      background: "#f9fbfd",
      borderRadius: 18,
      boxShadow: "0 8px 32px rgba(22,119,255,0.18)",
      position: "relative",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      fontFamily: "Segoe UI, Arial, sans-serif"
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #1677ff 60%, #66e0ff 100%)",
        color: "#fff",
        padding: "16px 20px",
        fontWeight: 600,
        fontSize: 18,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <span>Happi ViVu Chatbot</span>
        <button
          onClick={() => setOpen(false)}
          style={{
            background: "transparent",
            border: "none",
            color: "#fff",
            fontSize: 22,
            cursor: "pointer",
            fontWeight: "bold"
          }}
          title="Đóng"
        >×</button>
      </div>
      {/* Chat body */}
      <div style={{
        flex: 1,
        height: 340,
        overflowY: "auto",
        padding: "16px 12px",
        background: "#f9fbfd"
      }}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
              margin: "8px 0"
            }}
          >
            <div style={{
              background: msg.sender === "user"
                ? "linear-gradient(135deg, #1677ff 60%, #66e0ff 100%)"
                : "#e6f7ff",
              color: msg.sender === "user" ? "#fff" : "#222",
              padding: "10px 14px",
              borderRadius: 16,
              maxWidth: "80%",
              fontSize: 15,
              boxShadow: msg.sender === "user"
                ? "0 2px 8px rgba(22,119,255,0.10)"
                : "0 1px 4px rgba(102,224,255,0.10)"
            }}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ color: "#1677ff", fontStyle: "italic", margin: "8px 0" }}>
            Đang trả lời...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {/* Input */}
      <div style={{
        display: "flex",
        alignItems: "center",
        borderTop: "1px solid #e6f7ff",
        background: "#fff",
        padding: "10px 12px"
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nhập câu hỏi..."
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid #e6f7ff",
            fontSize: 15,
            outline: "none",
            marginRight: 8,
            background: "#f9fbfd"
          }}
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          style={{
            background: "linear-gradient(135deg, #1677ff 60%, #66e0ff 100%)",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            padding: "8px 18px",
            fontWeight: 600,
            fontSize: 15,
            cursor: loading || !input.trim() ? "not-allowed" : "pointer",
            transition: "background 0.2s"
          }}
        >
          Gửi
        </button>
      </div>
    </div>
  );
}

export default Chatbot;