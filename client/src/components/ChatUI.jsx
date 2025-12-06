import React, { useEffect, useRef, useState } from "react";
import { http } from "../lib/http";
import DictionaryModal from "./DictionaryModal";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";

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
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState("");

  const [isListening, setIsListening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(
    localStorage.getItem("autoSpeak") === "true"
  );
  const [autoMode, setAutoMode] = useState(
    localStorage.getItem("autoMode") === "true"
  );

  const [selectedWord, setSelectedWord] = useState("");
  const [showDict, setShowDict] = useState(false);

  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);

  const openDictionary = (word) => {
    if (!word.trim()) return;
    const clean = word.replace(/[^a-zA-Z]/g, "");
    if (!clean) return;
    setSelectedWord(clean);
    setShowDict(true);
  };

  const translateMessage = async (index) => {
    try {
      const text = messages[index].sentences;
      const res = await http.post("/log/translate", { text });

      setMessages((prev) => {
        const updated = [...prev];
        updated[index].translated = res.data.data.translatedText;
        return updated;
      });
    } catch (err) {
      console.error("Translate error:", err);
    }
  };

  //  Khi settings thay doi
  useEffect(() => {
    const reloadSettings = () => {
      setAutoSpeak(localStorage.getItem("autoSpeak") === "true");
      setAutoMode(localStorage.getItem("autoMode") === "true");
    };

    window.addEventListener("settings-updated", reloadSettings);
    return () => window.removeEventListener("settings-updated", reloadSettings);
  }, []);

  // Scroll xuong khi co tin nhan moi
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

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

  //stt
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

  // TTS
  const playTTS = async (text, force = false) => {
    if (!autoSpeak && !force) return; //tắt autoSpeak
    try {
      const response = await http.post(
        "/log/tts",
        { text },
        { responseType: "blob" } // BẮT BUỘC CHO TTS
      );

      const audioBlob = response.data; // Axios blob trả trong data
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (e) {
      console.log("TTS fallback:", e);
    }
  };

  // Gui tin nhan
  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;

    let chatId = activeChat;
    if (!chatId) {
      chatId = await createNewChat();
    }

    setMessages((prevMessages) => [
      ...prevMessages,
      { item_role: "user", sentences: text },
    ]);

    setInput("");
    setError("");
    setTyping(true);
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
        { item_role: "assistant", sentences: reply, suggestions },
      ]);
      playTTS(reply);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(
        err?.response?.data?.message || err?.message || "Unable to create chat"
      );
    }
    setTyping(false);
    setLoading(false);
  };

  // Enter de gui
  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      window.speechSynthesis?.cancel();
    };
  }, []);

  const lastAssistantMsg = messages.filter((m) => m.suggestions)?.slice(-1)[0];
  const lastSuggestions = lastAssistantMsg?.suggestions || [];

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
              {/* hiển thị từng từ để click */}
              {m.sentences.split(" ").map((w, idx) => (
                <span
                  key={idx}
                  className="word"
                  onClick={() => openDictionary(w)}
                >
                  {w + " "}
                </span>
              ))}
            </div>
            {m.item_role !== "user" && (
              <div className="reply-tools">
                {/* 🔊 Replay */}
                <button
                  className="tool-btn"
                  onClick={() => playTTS(m.sentences, true)}
                >
                  🔊
                </button>

                {/* 🌐 TRANSLATE WITH POPOVER */}
                <OverlayTrigger
                  trigger="click"
                  placement="bottom"
                  flip
                  rootClose
                  overlay={
                    <Popover>
                      <Popover.Header as="h3">
                        Vietnamese Translation
                      </Popover.Header>
                      <Popover.Body>
                        {m.translated ? m.translated : "Translating..."}
                      </Popover.Body>
                    </Popover>
                  }
                  onToggle={(show) => {
                    if (show && !m.translated) translateMessage(i);
                  }}
                >
                  <button className="tool-btn">🌐</button>
                </OverlayTrigger>
              </div>
            )}
          </div>
        ))}

        {typing && (
          <div className="message-row message-assistant">
            <div className="typing-bubble">
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />

        <DictionaryModal
          show={showDict}
          onHide={() => setShowDict(false)}
          word={selectedWord}
        />
      </div>

      {lastSuggestions.length > 0 && (
        <div className="suggestions-bar">
          {lastSuggestions.map((s, i) => (
            <button
              key={i}
              className="suggestion-pill"
              onClick={() => setInput(s)}
            >
              {s}
            </button>
          ))}
        </div>
      )}

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
