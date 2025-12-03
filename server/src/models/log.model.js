const pool = require('../config/db');
const Log = {};

Log.create = async (history_id, number_sentence, sentences, item_role) => {
    const [result] = await pool.query(
        `INSERT INTO logs (history_id, number_sentence, sentences, item_role, created_at) VALUES (?, ?, ?, ?, NOW())`,
        [history_id, number_sentence, sentences, item_role]
    );
    return result.insertId;
}

Log.findByHistory = async (history_id) => {
    const [rows] = await pool.query(`SELECT * FROM logs WHERE history_id = ?`, [history_id]);
    return rows;
}

module.exports = Log;
