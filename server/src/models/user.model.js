const pool = require('../config/db');
const User = {};
const { v4: uuidv4 } = require("uuid");

User.create = async (username, password) => {
    const id = uuidv4();
    const [result] = await pool.query(
        `INSERT INTO users (id, username, password, created_at) VALUES (?, ?, ?, NOW())`,
        [id, username, password]
    );
    return result;
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
