const pool = require('../config/db');
const User = {};

User.create = async (username, password) => {
    const [result] = await pool.query(
        `INSERT INTO users (username, password, created_at) VALUES (?, ?, NOW())`,
        [username, password]
    );
    return result.insertId;
}

User.findByUsername = async (username) => {
    const [rows] = await pool.query(`SELECT * FROM users WHERE username = ?`, [username]);
    return rows[0];
}

User.findById = async (id) => {
    const [rows] = await pool.query(`SELECT * FROM users WHERE id = ?`, [id]);
    return rows[0];
}

module.exports = User;
