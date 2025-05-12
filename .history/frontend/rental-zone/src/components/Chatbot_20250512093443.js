import React, { useState } from "react";

function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

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

  return (
    <div style={{ border: "1px solid #ccc", padding: 16, width: 350, background: "#fff", borderRadius: 8 }}>
      <div style={{ height: 300, overflowY: "auto", marginBottom: 8 }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ textAlign: msg.sender === "user" ? "right" : "left", margin: "4px 0" }}>
            <span style={{ background: msg.sender === "user" ? "#e6f7ff" : "#f5f5f5", padding: 8, borderRadius: 6, display: "inline-block" }}>
              {msg.text}
            </span>
          </div>
        ))}
        {loading && <div>Đang trả lời...</div>}
      </div>
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Nhập câu hỏi..."
        style={{ width: "80%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
        disabled={loading}
      />
      <button onClick={sendMessage} disabled={loading || !input.trim()} style={{ marginLeft: 8, padding: "8px 12px" }}>
        Gửi
      </button>
    </div>
  );
}

export default Chatbot;