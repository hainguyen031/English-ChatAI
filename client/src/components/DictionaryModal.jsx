import React, { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { http } from "../lib/http";
import { toast } from "react-toastify";

export default function DictionaryModal({ show, onHide, word }) {
  const [meaning, setMeaning] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (show && word) fetchMeaning(word);
  }, [show, word]);

  const fetchMeaning = async () => {
    if (!word) return;

    setLoading(true);
    try {
      const res = await http.post("/log/translate", { text: word });

      setMeaning(res.data.data.translatedText);
    } catch (err) {
      console.error("Translate error:", err);
      setMeaning("Không thể dịch từ này.");
    }
    setLoading(false);
  };

  const saveWord = async () => {
    try {
      await http.post("/saved-words", {
        word,
        meaning,
      });
      toast.success("Saved to vocabulary list!", {
        position: "top-right",
        autoClose: 2000,
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to save vocabulary!", {
        position: "top-right",
        autoClose: 2000,
      });
    }
  };

  const speakWord = () => {
    const utter = new SpeechSynthesisUtterance(word);
    utter.lang = "en-US";
    window.speechSynthesis.speak(utter);
  };

  return (
    <Modal size="md" show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>📘 {word}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <h5>Meaning (Vietnamese):</h5>
            <p style={{ fontSize: "18px" }}>{meaning}</p>

            <Button variant="outline-primary" onClick={speakWord}>
              🔊 Pronounce
            </Button>
          </>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="success" onClick={saveWord}>
          Save to Vocabulary
        </Button>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
