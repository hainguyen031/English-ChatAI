const pool = require("../config/db");
const SavedWord = {};
const { v4: uuidv4 } = require("uuid");

SavedWord.create = async (user_id, word, meaning) => {
  const id = uuidv4();
  const [result] = await pool.query(
    `INSERT INTO saved_words (id, user_id, word, meaning, created_at) VALUES (?, ?, ?, ?, NOW())`,
    [id, user_id, word, meaning]
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

module.exports = SavedWord;
