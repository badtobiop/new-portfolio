const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Could not connect to SQLite database:', err.message);
    } else {
        console.log('✅ Connected to SQLite database at:', dbPath);
    }
});

// Initialize Schema
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            message TEXT NOT NULL,
            ip_address TEXT,
            status TEXT DEFAULT 'unread',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('❌ Failed to create table:', err.message);
        } else {
            console.log('✅ "messages" table is ready.');
        }
    });
});

/**
 * Insert a new message into the database
 */
function saveMessage(name, email, message, ip) {
    return new Promise((resolve, reject) => {
        const query = `INSERT INTO messages (name, email, message, ip_address) VALUES (?, ?, ?, ?)`;
        db.run(query, [name, email, message, ip], function (err) {
            if (err) {
                return reject(err);
            }
            resolve({
                id: this.lastID,
                name,
                email,
                message,
                created_at: new Date().toISOString()
            });
        });
    });
}

/**
 * Fetch all messages (for admin dashboard / verification)
 */
function getMessages(limit = 50) {
    return new Promise((resolve, reject) => {
        const query = `SELECT id, name, email, message, created_at, status FROM messages ORDER BY created_at DESC LIMIT ?`;
        db.all(query, [limit], (err, rows) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
}

module.exports = {
    db,
    saveMessage,
    getMessages
};
