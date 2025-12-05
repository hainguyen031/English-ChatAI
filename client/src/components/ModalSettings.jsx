import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

export default function ModalSettings({ show, onHide }) {
  const [autoSpeak, setAutoSpeak] = useState(
    localStorage.getItem("autoSpeak") === "true"
  );

  const [autoMode, setAutoMode] = useState(
    localStorage.getItem("autoMode") === "true"
  );

  const saveSettings = () => {
    localStorage.setItem("autoSpeak", autoSpeak);
    localStorage.setItem("autoMode", autoMode);
    window.dispatchEvent(new Event("settings-updated"));
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered size="md">
      <Modal.Header closeButton>
        <Modal.Title>⚙️ Settings</Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ fontSize: "16px" }}>
        {/* Auto Speak */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span>🔊 Auto Speak (AI tự đọc)</span>
          <input
            type="checkbox"
            checked={autoSpeak}
            onChange={(e) => setAutoSpeak(e.target.checked)}
          />
        </div>

        {/* Auto Mode */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span>🤖 Auto Conversation Mode</span>
          <input
            type="checkbox"
            checked={autoMode}
            onChange={(e) => setAutoMode(e.target.checked)}
          />
        </div>

        <small className="text-secondary">
          * Auto Mode: AI sẽ tự động phản hồi mà không cần nhấn Send.
        </small>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={saveSettings}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
