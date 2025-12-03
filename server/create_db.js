import mysql from 'mysql2/promise';
import { config } from 'dotenv';

config();

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    port: Number(process.env.DB_PORT),
};

const initializeDatabase = async () => {
    // Create connection without selecting a database
    const pool = mysql.createPool(dbConfig);

    try {
        // Create database if it doesn't exist
        await pool.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
        console.log(`Database "${process.env.DB_NAME}" created or already exists.`);

        // Switch to the new database for table creation
        await pool.query(`USE ${process.env.DB_NAME}`);

        // SQL statements to create tables
        const sqlInitTables = [
            `
            CREATE TABLE IF NOT EXISTS users (
                id INT PRIMARY KEY AUTO_INCREMENT,
                username VARCHAR(30) NOT NULL,
                password VARCHAR(100) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NULL,
                deleted_at TIMESTAMP NULL
            );
            `,
            `
            CREATE TABLE IF NOT EXISTS historys (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NULL,
                deleted_at TIMESTAMP NULL,
                FOREIGN KEY (user_id) REFERENCES users(id)
                    ON DELETE CASCADE
            );
            `,
            `
            CREATE TABLE IF NOT EXISTS logs (
                id INT PRIMARY KEY AUTO_INCREMENT,
                number_sentence INT,
                sentences TEXT,
                history_id INT,
                item_role VARCHAR(30),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NULL,
                deleted_at TIMESTAMP NULL,
                FOREIGN KEY (history_id) REFERENCES historys(id)
                    ON DELETE CASCADE
            );
            `,
            `
            CREATE TABLE IF NOT EXISTS saved_words (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NOT NULL,
                word VARCHAR(255) NOT NULL,
                meaning TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
                    ON DELETE CASCADE
            );
            `
        ];

        for (const sql of sqlInitTables) {
            await pool.query(sql);
        }
        console.log('Tables initialized successfully.');
    } catch (err) {
        console.error('Error initializing database:', err);
        // Exit process if DB initialization fails, as the app cannot run
        process.exit(1);
    } finally {
        await pool.end();
    }
};

initializeDatabase();