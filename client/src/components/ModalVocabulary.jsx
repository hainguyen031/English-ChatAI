import React, { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { http } from "../lib/http";
import { toast } from "react-toastify";

export default function ModalVocabulary({ show, onHide }) {
  const [words, setWords] = useState([]);

  useEffect(() => {
    if (show) loadWords();
  }, [show]);

  // Load danh sách vocab
  const loadWords = async () => {
    try {
      const res = await http.get("/saved-words");
      setWords(res.data.data);
    } catch (err) {
      console.error("Failed to load vocabulary:", err);
      toast.error("Failed to load vocabulary!");
    }
  };

  // 🔊 TTS FE
  const speakWord = (word) => {
    if (!window.speechSynthesis) return toast.error("Browser không hỗ trợ TTS");

    window.speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(word);
    utter.lang = "en-US";
    utter.rate = 0.9;

    window.speechSynthesis.speak(utter);
  };

  // ❌ XÓA TỪ
  const deleteWord = async (id) => {
    try {
      await http.delete(`/saved-words/${id}`);
      toast.success("Deleted!");

      // load lại danh sách sau khi xóa
      loadWords();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete word");
    }
  };

  return (
    <Modal size="xl" show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>📚 Saved Vocabulary</Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
        {words.length === 0 ? (
          <p>No saved vocabulary yet.</p>
        ) : (
          <div className="row">
            {words.map((w) => (
              <div className="col-md-4 mb-3" key={w.id}>
                <div className="p-3 bg-dark text-light rounded shadow-sm border">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="fw-bold m-0">{w.word}</h5>

                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-outline-light"
                        onClick={() => speakWord(w.word)}
                      >
                        🔊
                      </button>

                      <button
                        className="btn btn-sm"
                        onClick={() => deleteWord(w.id)}
                      >
                        ❌
                      </button>
                    </div>
                  </div>

                  <p className="opacity-75 mt-2">{w.meaning}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="primary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
