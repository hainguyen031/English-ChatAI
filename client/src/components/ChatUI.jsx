import React, { useEffect, useRef, useState } from "react";
import { http } from "../lib/http";
import {
  generateConversation,
  textToSpeech,
  speechToText,
} from "../api/openaiAPI";

// Lấy đối tượng SpeechRecognition từ trình duyệt
const getSpeechRecognition = () => {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
};

export default function ChatUI({
  messages,
  setMessages,
  saveChat,
  activeChat,
  createNewChat,
}) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState("");

  const [isListening, setIsListening] = useState(false);

  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);

  // Scroll xuống mỗi khi có tin nhắn
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // Lưu title vào lịch sử
  useEffect(() => {
    if (!activeChat || messages.length === 0) return;

    const first = messages.find((m) => m.item_role === "user");
    if (!first) return;

    const title =
      first.sentences.length > 25
        ? first.sentences.slice(0, 25) + "..."
        : first.sentences;

    saveChat(activeChat, title);
  }, [messages]);

  // ===========================
  // 🎤 Speech-to-Text (STT)
  // ===========================
  const startListening = () => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      alert("Trình duyệt của bạn không hỗ trợ Speech Recognition.");
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();

    let finalText = "";

    recognition.onresult = async (event) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript;

      if (result.isFinal) {
        finalText = transcript;
        setInput(transcript);
      } else {
        setInput(transcript);
      }
    };

    recognition.onerror = (e) => {
      console.error("STT error:", e.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);

      if (finalText.trim()) {
        setInput(finalText.trim());
        setTimeout(() => handleSend(), 200);
      }
    };
  };

  // ===========================
  // 🔊 Text-to-Speech (AI Voice)
  // ===========================
  const playTTS = async (text) => {
    try {
      const audioBlob = await textToSpeech(text);

      if (!audioBlob) {
        // fallback using browser TTS
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = "en-US";
        utter.rate = 1;
        window.speechSynthesis.speak(utter);
        return;
      }

      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (e) {
      console.log("TTS fallback:", e);
    }
  };

  // ===========================
  // ✉️ Gửi tin nhắn
  // ===========================
  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;

    let chatId = activeChat;

    if (!chatId) {
      chatId = await createNewChat();
    }

    setMessages((prev) => [...prev, { item_role: "user", sentences: text }]);

    setInput("");
    setError("");
    setTyping(true);
    setLoading(true);

    try {
      // 1️⃣ FE → gọi OpenAI
      const result = await generateConversation(text);

      const reply = result.answer;
      const suggestions = result.suggestions;
console.log("TOKEN SENT:", localStorage.getItem("token"));

      // 2️⃣ Lưu user → DB
      // await http.post("/log", {
      //   history_id: chatId,
      //   sentences: text,
      //   item_role: "user",
      // });

      // 3️⃣ Lưu assistant → DB
      // await http.post("/log", {
      //   history_id: chatId,
      //   sentences: reply,
      //   item_role: "assistant",
      // });

      // 4️⃣ Hiển thị AI
      setMessages((prev) => [
        ...prev,
        {
          item_role: "assistant",
          sentences: reply,
          suggestions,
        },
      ]);

      // 5️⃣ Đọc giọng
      playTTS(reply);
    } catch (err) {
      console.error(err);
      setError("Lỗi khi gửi tin nhắn.");
    }

    setTyping(false);
    setLoading(false);
  };

  // Enter để gửi
  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`message-row ${
              m.item_role === "user" ? "message-user" : "message-assistant"
            }`}
          >
            <div className="message-bubble">
              {m.sentences}

              {/* suggestions */}
              {m.suggestions && m.suggestions.length > 0 && (
                <div className="suggestions-box">
                  {m.suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      className="suggestion-btn"
                      onClick={() => setInput(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {typing && (
          <div className="message-row message-assistant">
            <div className="typing-bubble">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="chat-input-row">
        <button
          className={`mic-btn ${isListening ? "listening" : ""}`}
          onClick={startListening}
        >
          🎙️
        </button>

        <textarea
          className="chat-input"
          placeholder="Type or speak English..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          rows={2}
        />

        <button className="send-button" onClick={handleSend} disabled={loading}>
          {loading ? "..." : "Send"}
        </button>
      </div>

      {error && <p className="error-text">{error}</p>}
    </div>
  );
}
