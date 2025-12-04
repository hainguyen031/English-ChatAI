import React, { useEffect, useRef, useState } from "react";
import { http } from "../lib/http";

// Lay doi tuong SpeechRecognition
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
  const [error, setError] = useState("");

  const [isListening, setIsListening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);

  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);

  // Scroll xuong khi co tin nhan moi
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Luu lich su va title
  useEffect(() => {
    if (!activeChat || messages.length === 0) return;

    const firstUserMsg = messages.find((m) => m.item_role === "user");
    if (!firstUserMsg) return;

    const title =
      firstUserMsg.sentences.length > 25
        ? firstUserMsg.sentences.slice(0, 25) + "..."
        : firstUserMsg.sentences;

    saveChat(activeChat, title);
  }, [messages]);

  // TTS
  const speak = (text) => {
    if (!autoSpeak) return;
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    utter.rate = 1;
    utter.pitch = 1;

    window.speechSynthesis.speak(utter);
  };

  // Gui tin nhan
  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    // if (!activeChat) return;

    let chatId = activeChat;
    if (!chatId) {
      chatId = await createNewChat();
    }

    // if (messages.length === 0) {
    //   //cập nhật lại title
    //   saveChat(chatId, text);
    // }

    setMessages((prevMessages) => [
      ...prevMessages,
      { item_role: "user", sentences: text },
    ]);

    setInput("");
    setLoading(true);
    try {
      const res = await http.post("/log", {
        history_id: chatId,
        sentences: text,
        item_role: "user",
      });

      const data = res.data.data;

      const reply = data.ai.reply;
      const suggestions = data.ai.suggestions;
      // loadChat(activeChat);
      setMessages((prevMessages) => [
        ...prevMessages,
        { item_role: "assistant", sentences: reply },
      ]);
      speak(reply.text);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(
        err?.response?.data?.message || err?.message || "Unable to create chat"
      );
    }
  };

  // Enter de gui
  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // =============================
  // 🎤 STT FIX KHONG LAP LAI
  // =============================
  const startListening = () => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      alert("Trinh duyet khong ho tro Speech Recognition.");
      return;
    }

    // Neu dang nghe thi stop
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

    recognition.onresult = (event) => {
      let interim = "";

      const last = event.results.length - 1;
      const result = event.results[last];
      const transcript = result[0].transcript;

      if (result.isFinal) {
        finalText = transcript; // ❗ chi lay FINAL moi nhat
      } else {
        interim = transcript;
      }

      // cap nhat realtime
      setInput((finalText + " " + interim).trim());
    };

    recognition.onerror = (e) => {
      console.error("STT error:", e.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;

      // Tu dong gui khi user noi xong
      if (finalText.trim()) {
        setInput(finalText.trim());
        setTimeout(() => handleSend(), 300);
      }
    };
  };

  // Cleanup
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      window.speechSynthesis?.cancel();
    };
  }, []);

  // =============================
  // UI Component
  // =============================
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
            <div className="message-bubble">{m.sentences}</div>
          </div>
        ))}
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

      <button className="tts-toggle" onClick={() => setAutoSpeak((p) => !p)}>
        {autoSpeak ? "🔊 Auto Speak ON" : "🔇 Auto Speak OFF"}
      </button>
    </div>
  );
}
