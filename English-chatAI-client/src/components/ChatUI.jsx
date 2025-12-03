import React, { useEffect, useRef, useState } from "react";

// lay doi tuong SpeechRecognition (neu browser ho tro)
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

  const [isListening, setIsListening] = useState(false); // STT
  const [autoSpeak, setAutoSpeak] = useState(true); // TTS on/off

  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);

  // scroll xuong cuoi khi co tin nhan moi
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // luu lai lich su / title dua tren tin nhan dau tien cua user
  useEffect(() => {
    if (messages.length === 0 || activeChat === null) return;

    const first = messages.find((x) => x.role === "user");
    if (!first) return;

    const newTitle =
      first.text.length > 25 ? first.text.slice(0, 25) + "..." : first.text;

    saveChat(newTitle, messages);
  }, [messages, activeChat, saveChat]);

  // ham doc TTS
  const speak = (text) => {
    if (!autoSpeak) return;
    if (typeof window === "undefined") return;
    if (!window.speechSynthesis) return;

    // huy cac gi dang doc
    window.speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    utter.rate = 1;
    utter.pitch = 1;
    window.speechSynthesis.speak(utter);
  };

  // gui tin nhan
  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;

    const newMessages = [...messages, { role: "user", text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:4000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: newMessages,
        }),
      });

      const data = await res.json();

      const reply = {
        role: "assistant",
        text: data.reply || "Sorry, I could not understand.",
      };

      setMessages((prev) => [...prev, reply]);

      // doc lai cau tra loi
      speak(reply.text);
    } catch (err) {
      console.error("Chat error:", err);
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

  // bat STT
const startListening = () => {
  const SpeechRecognition = getSpeechRecognition();
  if (!SpeechRecognition) {
    alert("Trinh duyet cua ban khong ho tro Speech Recognition.");
    return;
  }

  // neu dang nghe thi stop
  if (isListening && recognitionRef.current) {
    recognitionRef.current.stop();
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.continuous = true; // nghe liên tục
  recognition.interimResults = true; // cho phép text realtime

  recognitionRef.current = recognition;
  setIsListening(true);
  recognition.start();

  // BIẾN TẠM ĐỂ LƯU TEXT CUỐI CÙNG (FINAL)
  let finalTranscript = "";

  recognition.onresult = (event) => {
    let interimTranscript = "";

    for (let i = 0; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;

      if (event.results[i].isFinal) {
        finalTranscript += transcript + " ";
      } else {
        interimTranscript += transcript;
      }
    }

    // cập nhật input realtime (interim)
    setInput(finalTranscript + interimTranscript);
  };

  recognition.onerror = (e) => {
    console.error("STT error:", e.error);
    setIsListening(false);
  };

  recognition.onend = () => {
    setIsListening(false);
    recognitionRef.current = null;

    // nếu có final transcript → gửi
    if (finalTranscript.trim().length > 0) {
      setInput(finalTranscript.trim());
      setTimeout(() => handleSend(), 200);
    }
  };
};


  // cleanup khi unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div className="chat-container">
      {/* danh sach tin nhan */}
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

      {/* hang input + mic */}
      <div className="chat-input-row">
        <button
          type="button"
          className={`mic-btn ${isListening ? "listening" : ""}`}
          onClick={startListening}
          title="Nhan de noi tieng Anh"
        >
          🎙️
        </button>

        <textarea
          className="chat-input"
          rows={2}
          placeholder="Type or speak in English..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
        />

        <button className="send-button" onClick={handleSend} disabled={loading}>
          {loading ? "..." : "Send"}
        </button>
      </div>

      {/* nut bat/tat tu doc TTS */}
      <div style={{ marginTop: 8 }}>
        <button
          type="button"
          className="tts-toggle"
          onClick={() => setAutoSpeak((prev) => !prev)}
        >
          {autoSpeak ? "🔊 Auto Speak ON" : "🔇 Auto Speak OFF"}
        </button>
      </div>
    </div>
  );
}
