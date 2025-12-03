import React, { useEffect, useRef, useState } from "react";

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
}) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

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

    const firstUserMsg = messages.find((m) => m.role === "user");
    if (!firstUserMsg) return;

    const title =
      firstUserMsg.text.length > 25
        ? firstUserMsg.text.slice(0, 25) + "..."
        : firstUserMsg.text;

    saveChat(title, messages);
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

    const nextMessages = [...messages, { role: "user", text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:4000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: nextMessages,
        }),
      });

      const data = await res.json();

      const reply = {
        role: "assistant",
        text: data.reply || "I could not understand.",
      };

      setMessages((prev) => [...prev, reply]);
      speak(reply.text);
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setLoading(false);
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
              m.role === "user" ? "message-user" : "message-assistant"
            }`}
          >
            <div className="message-bubble">{m.text}</div>
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
