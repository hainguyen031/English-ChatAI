import React, { useEffect, useRef, useState } from "react";

export default function ChatUI({ messages, setMessages, saveChat, activeChat }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0 || activeChat === null) return;

    const first = messages.find((x) => x.role === "user");
    if (!first) return;

    const newTitle =
      first.text.length > 25 ? first.text.slice(0, 25) + "..." : first.text;

    saveChat(newTitle, messages);
  }, [messages, activeChat, saveChat]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;

    const newMessages = [...messages, { role: "user", text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try{
      const res = await fetch("http://localhost:4000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: newMessages
        })
      });

      const data = await res.json();
      const reply = {
        role: "assistant",
        text: data.reply || "Sorry, I could not understand."
      };

      setMessages((prev) => [...prev, reply]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`message-row ${
              m.role === "user" ? "message-user" : "message-assistant"
            }`}
          >
            <div className="message-bubble">{m.text}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-row">
        <textarea
          className="chat-input"
          rows={2}
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <button
          className="send-button"
          onClick={handleSend}
          disabled={loading}
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}
