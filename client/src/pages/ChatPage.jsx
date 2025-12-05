import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatUI from "../components/ChatUI";
import { http } from "../lib/http";
import ModalVocabulary from "../components/ModalVocabulary";
import ModalSettings from "../components/ModalSettings";

export default function ChatPage() {
  const [history, setHistory] = useState([]);
  const [messages, setMessages] = useState([]);
  const [theme, setTheme] = useState("dark");
  const [collapsed, setCollapsed] = useState(false);
  const [activeChat, setActiveChat] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showVocab, setShowVocab] = useState(false);

  const openVocab = () => setShowVocab(true);
  const closeVocab = () => setShowVocab(false);

  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // console.log(activeChat);
    if (activeChat) {
      loadChat(activeChat);
    }
  }, [activeChat]);

  async function loadHistory() {
    setLoading(true);
    setError(null);
    try {
      const res = await http.get(`/history`);
      const data = res.data.data;
      setHistory(data);
      setLoading(false);
      setError(null);
    } catch (err) {
      setLoading(false);
      setError(
        err?.response?.data?.message || err?.message || "Unable to load history"
      );
    }
  }

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) setTheme(savedTheme);

    loadHistory();

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

  const createNewChat = async () => {
    // const greeting = {
    //   role: "assistant",
    //   text: "Hello! How can I help you practice English today?",
    // };
    setLoading(true);
    setError(null);
    try {
      const res = await http.post(`/history`);
      const id = res.data.data.id;
      loadHistory();
      //loadChat(id); //bỏ phần này đi ko thôi bị lỗi khi không chọn vào id nào
      setActiveChat(id);
      setLoading(false);
      setError(null);
      return id;
    } catch (err) {
      setLoading(false);
      setError(
        err?.response?.data?.message || err?.message || "Unable to load history"
      );
      return null;
    }
  };

  const loadChat = async (id) => {
    setActiveChat(id);
    setLoading(true);
    setError(null);
    try {
      const res = await http.get(`/log/${id}`);
      const data = res.data.data;
      setMessages(data);
      setLoading(false);
      setError(null);
    } catch (err) {
      setLoading(false);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load messages"
      );
    }
  };

  const onRenameChat = (index, newName) => {
    // const updated = [...history];
    // updated[index].title = newName;
    // setHistory(updated);
    // localStorage.setItem("history", JSON.stringify(updated));
  };

  const onDeleteChat = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await http.delete(`/history/${id}`);
      loadHistory();
      setLoading(false);
      setError(null);
    } catch (err) {
      setLoading(false);
      setError(
        err?.response?.data?.message || err?.message || "Unable to delete chat"
      );
    }

    if (activeChat === id) {
      setMessages([]);
      setActiveChat(null);
    }
  };

  const saveChatToHistory = (id, title) => {
    if (!id) return;

    const index = history.findIndex((item) => item.id === id);
    // console.log(index);
    if (index === -1) return; // không tìm thấy thì thoát

    const updated = [...history];
    updated[index] = {
      ...updated[index],
      title,
    };

    setHistory(updated);
  };

  const logout = async () => {
    try {
      // Gửi yêu cầu đến server để vô hiệu hóa token
      const response = await http.post("/user/logout");

      if (response.status === 200) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else {
        console.error("Lỗi khi logout từ server:", response);
      }
    } catch (err) {
      console.error(
        "Có lỗi khi gửi yêu cầu logout:",
        err?.response?.data?.message || err?.message || "Đăng nhập thất bại!"
      );
    }
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
        openVocab={openVocab}
        setShowSettings={setShowSettings}
      />
      <ModalVocabulary show={showVocab} onHide={closeVocab} />
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
            // key={activeChat}
            messages={messages}
            setMessages={setMessages}
            saveChat={saveChatToHistory}
            activeChat={activeChat}
            createNewChat={createNewChat}
          />
        </div>
      </div>
      <ModalSettings
        show={showSettings}
        onHide={() => setShowSettings(false)}
      />
    </div>
  );
}
