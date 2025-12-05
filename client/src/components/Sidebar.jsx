import React, { useState } from "react";
import {
  FaPlus,
  FaSun,
  FaMoon,
  FaHistory,
  FaCog,
  FaBook,
  FaTrash,
} from "react-icons/fa";
import "../assets/css/sidebar.css";

export default function Sidebar({
  collapsed,
  toggleSidebar,
  history,
  onNewChat,
  onSelectChat,
  onRenameChat,
  onDeleteChat,
  activeChat,
  theme,
  toggleTheme,
  openVocab,
  setShowSettings,
}) {
  const [renameIndex, setRenameIndex] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  const startRename = (e, index, current) => {
    e.stopPropagation();
    if (collapsed) return;
    setRenameIndex(index);
    setRenameValue(current);
  };

  const finishRename = (index) => {
    if (!renameValue.trim()) {
      setRenameIndex(null);
      return;
    }
    onRenameChat(index, renameValue.trim());
    setRenameIndex(null);
  };

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="top-section">
        <button className="collapse-btn" onClick={toggleSidebar}>
          {collapsed ? "»" : "«"}
        </button>

        {!collapsed && <div className="sidebar-title">Menu</div>}

        <button className="sidebar-item" onClick={onNewChat}>
          <FaPlus size={16} />
          {!collapsed && <span>New Chat</span>}
        </button>

        {!collapsed && <div className="history-label">History</div>}

        <div className="history-list">
          {history.map((item, index) => (
            <div
              key={index}
              className={`history-item ${
                activeChat === item.id ? "active" : ""
              }`}
              onClick={() => onSelectChat(item.id)}
            >
              <FaHistory size={14} />

              {renameIndex === item.id ? (
                <input
                  autoFocus
                  className="rename-input"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={() => finishRename(item.id)}
                  onKeyDown={(e) => e.key === "Enter" && finishRename(item.id)}
                />
              ) : (
                !collapsed && (
                  <span
                    className="title-text"
                    onDoubleClick={(e) => startRename(e, item.id, item.title)}
                  >
                    {item.title}
                  </span>
                )
              )}

              {!collapsed && (
                <FaTrash
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChat(item.id);
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bottom-section">
        <button className="sidebar-item" onClick={() => openVocab()}>
          <FaBook />
          {!collapsed && <span>Vocabulary</span>}
        </button>

        <button className="sidebar-item" onClick={toggleTheme}>
          {theme === "dark" ? <FaSun /> : <FaMoon />}
          {!collapsed && (
            <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
          )}
        </button>

        <button className="sidebar-item" onClick={() => setShowSettings(true)}>
          <FaCog />
          {!collapsed && <span>Settings</span>}
        </button>
      </div>
    </div>
  );
}
