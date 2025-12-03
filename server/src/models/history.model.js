const pool = require('../config/db');
const History = {};

History.create = async (user_id) => {
    const [result] = await pool.query(
        `INSERT INTO historys (user_id, created_at) VALUES (?, NOW())`,
        [user_id]
    );
    return result.insertId;
}

History.findByUser = async (user_id) => {
    const [rows] = await pool.query(`SELECT * FROM historys WHERE user_id = ?`, [user_id]);
    return rows;
}

module.exports = History;
