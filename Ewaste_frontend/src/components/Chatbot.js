// src/components/ChatbotBubble.js
import React, { useState, useRef, useEffect } from "react";
import { askChatbot } from "../api/api";

const ChatbotBubble = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi! I’m your E-Waste Assistant. Ask me anything or choose a suggestion below.",
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const suggestions = [
    "What is e-waste?",
    "How do I schedule a pickup?",
    "Is pickup service free?",
    "How do I track my pickup request?",
    "What if I don’t receive OTP?",
    "Can I cancel my request?",
    "How do I upload images?",
    "Where does e-waste go?",
    "How long does pickup take?",
    "How can I earn points?",
    "Is there a minimum quantity for pickup?",
    "Can I schedule multiple pickups?",
    "What devices are accepted?",
    "Do you recycle batteries?",
    "Can I donate old electronics?",
    "How do I edit my profile?",
    "How do I reset my password?",
    "What if my pickup is delayed?",
    "How do I contact support?",
    "Do you provide receipts?",
    "Is pickup service safe?",
    "How do I track eco score?",
    "Can I refer friends?",
    "How is my data used?",
    "Do you provide recycling certificates?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text) => {
    if (!text) return;
    setMessages((prev) => [...prev, { sender: "user", text }]);
    setInput("");

    try {
      const answer = await askChatbot(text);
      setMessages((prev) => [...prev, { sender: "bot", text: answer }]);
    } catch {
      setMessages((prev) => [...prev, { sender: "bot", text: "❌ Failed to contact chatbot." }]);
    }
  };

  return (
    <>
      {/* Floating Bubble */}
      {!open && (
        <div
          onClick={() => setOpen(true)}
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            width: "70px",
            height: "70px",
            borderRadius: "50%",
            background: "#1E88E5",
            color: "#fff",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "36px",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            zIndex: 1000,
            transition: "transform 0.2s",
          }}
        >
          💬
        </div>
      )}

      {/* Full-page Chat */}
      {open && (
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            width: "400px",
            height: "100vh",
            background: "#f1f5f9",
            boxShadow: "-4px 0 12px rgba(0,0,0,0.3)",
            display: "flex",
            flexDirection: "column",
            zIndex: 1000,
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "#1E88E5",
              color: "#fff",
              padding: "12px 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontWeight: "bold",
              fontSize: "16px",
            }}
          >
            E-Waste Assistant
            <button
              onClick={() => setOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "#fff",
                fontSize: "20px",
                cursor: "pointer",
              }}
            >
              ✖
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              padding: "12px",
              overflowY: "auto",
            }}
          >
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  marginBottom: "10px",
                  display: "flex",
                  justifyContent: m.sender === "bot" ? "flex-start" : "flex-end",
                }}
              >
                <div
                  style={{
                    background: m.sender === "bot" ? "#E3F2FD" : "#1E88E5",
                    color: m.sender === "bot" ? "#000" : "#fff",
                    padding: "10px 16px",
                    borderRadius: "20px",
                    maxWidth: "75%",
                    wordBreak: "break-word",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              padding: "8px",
              gap: "6px",
              background: "#e3f2fd",
              maxHeight: "120px",
              overflowY: "auto",
            }}
          >
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSend(s)}
                style={{
                  padding: "6px 10px",
                  background: "#1E88E5",
                  color: "#fff",
                  borderRadius: "16px",
                  fontSize: "12px",
                  cursor: "pointer",
                  border: "none",
                  flexShrink: 0,
                }}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <div
            style={{
              display: "flex",
              padding: "8px 12px",
              borderTop: "1px solid #ccc",
              background: "#fff",
            }}
          >
            <input
              type="text"
              placeholder="Type your question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: "20px",
                border: "1px solid #ccc",
                outline: "none",
              }}
            />
            <button
              onClick={() => handleSend(input)}
              style={{
                marginLeft: "8px",
                padding: "10px 14px",
                borderRadius: "50%",
                border: "none",
                background: "#1E88E5",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotBubble;
