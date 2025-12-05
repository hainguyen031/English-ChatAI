const pool = require("../config/db");
const SavedWord = {};

SavedWord.create = async (user_id, word, meaning) => {
  const [result] = await pool.query(
    `INSERT INTO saved_words (user_id, word, meaning, created_at) VALUES (?, ?, ?, NOW())`,
    [user_id, word, meaning]
  );
  return result.insertId;
};

SavedWord.findByUser = async (user_id) => {
  const [rows] = await pool.query(
    `SELECT * FROM saved_words WHERE user_id = ?`,
    [user_id]
  );
  return rows;
};

SavedWord.deleteIfOwner = async (id, user_id) => {
  const [result] = await pool.query(
    "DELETE FROM saved_words WHERE id = ? AND user_id = ?",
    [id, user_id]
  );
  return result.affectedRows; // số row bị xóa;
};

module.exports = SavedWord;
