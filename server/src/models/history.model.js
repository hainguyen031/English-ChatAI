const pool = require("../config/db");
const History = {};

History.create = async (user_id) => {
  const [result] = await pool.query(
    `INSERT INTO historys (user_id, created_at) VALUES (?, NOW())`,
    [user_id]
  );
  return result.insertId;
};

History.findByUser = async (user_id) => {
  const [rows] = await pool.query(`SELECT * FROM historys WHERE user_id = ?`, [
    user_id,
  ]);
  return rows;
};

History.updateTitle = async (id, title) => {
  const [result] = await pool.query(
    "UPDATE historys SET title = ? WHERE id = ?",
    [title, id]
  );
  return result;
};

History.deleteIfOwner = async (id, user_id) => {
  const [result] = await pool.query(
    "DELETE FROM historys WHERE id = ? AND user_id = ?",
    [id, user_id]
  );
  return result.affectedRows; // số row bị xóa;
};

module.exports = History;
