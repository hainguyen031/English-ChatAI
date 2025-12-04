import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatUI from "../components/ChatUI";
import { http } from "../lib/http";

export default function ChatPage() {
  const [history, setHistory] = useState([]);
  const [messages, setMessages] = useState([]);
  const [theme, setTheme] = useState("dark");
  const [collapsed, setCollapsed] = useState(false);
  const [activeChat, setActiveChat] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================
  // Load history tại lần đầu mở trang
  // ============================================
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) setTheme(savedTheme);

    const savedCollapsed = localStorage.getItem("collapsed");
    if (savedCollapsed === "true") setCollapsed(true);

    loadHistory();
  }, []);

  // apply theme
  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  // ============================================
  // Load lịch sử chat
  // ============================================
  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await http.get("/history");
      setHistory(res.data.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err?.response?.data?.message || "Unable to load history");
    }
  };

  // ============================================
  // Load chat message theo history id
  // ============================================
  const loadChat = async (id) => {
    setActiveChat(id);
    setLoading(true);
    setMessages([]);

    try {
      const res = await http.get(`/log/${id}`);
      setMessages(res.data.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err?.response?.data?.message || "Unable to load messages");
    }
  };

  // ============================================
  // Tạo chat mới → backend tạo history và trả ID
  // ============================================
  const createNewChat = async () => {
    setLoading(true);
    try {
      const res = await http.post("/history");
      const id = res.data.data.id;

      await loadHistory(); // refresh sidebar
      setActiveChat(id);
      setMessages([]);

      setLoading(false);
      return id;
    } catch (err) {
      setLoading(false);
      setError(err?.response?.data?.message || "Unable to create chat");
      return null;
    }
  };

  // ============================================
  // Lưu Title của chat vào DB
  // ============================================
  const saveChatToHistory = async (id, title) => {
    if (!id) return;

    const index = history.findIndex((item) => item.id === id);
    if (index === -1) return;

    const updated = [...history];
    updated[index] = {
      ...updated[index],
      title,
    };

    setHistory(updated);
  };

  // ============================================
  // Xóa chat
  // ============================================
  const onDeleteChat = async (id) => {
    try {
      await http.delete(`/history/${id}`);
      loadHistory();

      if (activeChat === id) {
        setActiveChat(null);
        setMessages([]);
      }
    } catch (err) {
      setError("Unable to delete chat");
    }
  };

  // ============================================
  // Sidebar toggle
  // ============================================
  const toggleSidebar = () => {
    setCollapsed((prev) => {
      localStorage.setItem("collapsed", !prev);
      return !prev;
    });
  };

  // Auto collapse khi < 900px
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

  // ============================================
  // Light/Dark Mode
  // ============================================
  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
  };

  // ============================================
  // Logout
  // ============================================
  const logout = async () => {
    try {
      await http.post("/user/logout");
      localStorage.removeItem("token");
      window.location.href = "/login";
    } catch (err) {
      console.log(err);
    }
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="app-layout">
      <Sidebar
        collapsed={collapsed}
        toggleSidebar={toggleSidebar}
        history={history}
        onNewChat={createNewChat}
        onSelectChat={loadChat}
        onDeleteChat={onDeleteChat}
        activeChat={activeChat}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      <div className="chat-area">
        <div className="top-right-header">
          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
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
            createNewChat={createNewChat}
          />
        </div>
      </div>
    </div>
  );
}
