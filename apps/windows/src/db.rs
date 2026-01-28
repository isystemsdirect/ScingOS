// Database module (SQLite)
// src/db.rs

use rusqlite::{Connection, Result as SqliteResult};
use std::path::PathBuf;

pub struct Database {
    conn: Connection,
}

impl Database {
    pub fn new(path: &PathBuf) -> SqliteResult<Self> {
        let conn = Connection::open(path)?;
        conn.execute_batch(
            "
            CREATE TABLE IF NOT EXISTS messages (
                id TEXT PRIMARY KEY,
                message_id TEXT NOT NULL,
                sender_device_id TEXT,
                type TEXT DEFAULT 'text',
                content TEXT,
                created_at INTEGER,
                downloaded_at INTEGER,
                is_favorite BOOLEAN DEFAULT 0,
                is_last BOOLEAN DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS devices (
                id TEXT PRIMARY KEY,
                device_id TEXT,
                platform TEXT,
                name TEXT,
                created_at INTEGER,
                last_seen_at INTEGER
            );
            ",
        )?;
        Ok(Database { conn })
    }

    pub fn add_message(
        &self,
        message_id: &str,
        content: &str,
        sender_device_id: &str,
    ) -> SqliteResult<()> {
        self.conn.execute(
            "INSERT INTO messages (id, message_id, content, sender_device_id, downloaded_at, is_last)
             VALUES (?, ?, ?, ?, ?, ?)",
            rusqlite::params![
                uuid::Uuid::new_v4().to_string(),
                message_id,
                content,
                sender_device_id,
                std::time::SystemTime::now()
                    .duration_since(std::time::UNIX_EPOCH)
                    .unwrap()
                    .as_secs(),
                true
            ],
        )?;
        Ok(())
    }

    pub fn get_messages(&self) -> SqliteResult<Vec<String>> {
        let mut stmt = self
            .conn
            .prepare("SELECT message_id, content FROM messages ORDER BY downloaded_at DESC LIMIT 100")?;
        let messages = stmt
            .query_map([], |row| {
                Ok(format!("{}: {}", row.get::<_, String>(0)?, row.get::<_, String>(1)?))
            })?
            .collect::<Result<Vec<_>, _>>()?;
        Ok(messages)
    }

    pub fn get_last_message(&self) -> SqliteResult<Option<String>> {
        let mut stmt = self
            .conn
            .prepare("SELECT content FROM messages WHERE is_last = true ORDER BY downloaded_at DESC LIMIT 1")?;
        let result = stmt.query_row([], |row| row.get(0)).ok();
        Ok(result)
    }
}
