import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatUI from "../components/ChatUI";

export default function ChatPage() {
  const [history, setHistory] = useState([]);
  const [messages, setMessages] = useState([]);
  const [theme, setTheme] = useState("dark");
  const [collapsed, setCollapsed] = useState(false);
  const [activeChat, setActiveChat] = useState(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) setTheme(savedTheme);

    const savedHistory = localStorage.getItem("history");
    if (savedHistory) setHistory(JSON.parse(savedHistory));

    const savedCollapsed = localStorage.getItem("collapsed");
    if (savedCollapsed === "true") setCollapsed(true);
  }, []);

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 900) {
        setCollapsed(true);
      } else {
        const saved = localStorage.getItem("collapsed");
        setCollapsed(saved === "true");
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
  };

  const toggleSidebar = () => {
    setCollapsed((prev) => {
      localStorage.setItem("collapsed", !prev);
      return !prev;
    });
  };

const createNewChat = () => {
  const greeting = {
    role: "assistant",
    text: "Hello! How can I help you practice English today?"
  };

  const newChat = {
    title: "New Chat",
    messages: [greeting]
  };

  const newHistory = [...history, newChat];
  setHistory(newHistory);
  localStorage.setItem("history", JSON.stringify(newHistory));

  const newIndex = newHistory.length - 1;

  setActiveChat(newIndex);
  setMessages([greeting]);
};


  const loadChat = (index) => {
    setActiveChat(index);
    setMessages(history[index].messages);
  };

  const onRenameChat = (index, newName) => {
    const updated = [...history];
    updated[index].title = newName;
    setHistory(updated);
    localStorage.setItem("history", JSON.stringify(updated));
  };

  const onDeleteChat = (index) => {
    const updated = history.filter((_, i) => i !== index);
    setHistory(updated);
    localStorage.setItem("history", JSON.stringify(updated));

    if (activeChat === index) {
      setMessages([]);
      setActiveChat(null);
    }
  };

  const saveChatToHistory = (title, msgs) => {
    if (activeChat === null) return;
    const updated = [...history];
    updated[activeChat] = {
      title,
      messages: msgs
    };
    setHistory(updated);
    localStorage.setItem("history", JSON.stringify(updated));
  };

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="app-layout">
      <Sidebar
        collapsed={collapsed}
        toggleSidebar={toggleSidebar}
        history={history}
        onNewChat={createNewChat}
        onSelectChat={loadChat}
        onRenameChat={onRenameChat}
        onDeleteChat={onDeleteChat}
        activeChat={activeChat}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      <div className="chat-area">
          <div className="top-right-header">
    <button className="logout-btn" onClick={logout}>Logout</button>
  </div>
        <div className="chat-wrapper">
          <div className="app-title-row">
            <h1 className="app-title">English Speaking Practice</h1>
          </div>

          <ChatUI
            messages={messages}
            setMessages={setMessages}
            saveChat={saveChatToHistory}
            activeChat={activeChat}
          />
        </div>
      </div>
    </div>
  );
}
