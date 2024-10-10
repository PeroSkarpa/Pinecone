// db.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');  // For in-memory use

// Initialize the database with the `locations` table
db.serialize(() => {
  db.run(`
    CREATE TABLE locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      parent_id INTEGER,
      name TEXT NOT NULL,
      position INTEGER NOT NULL,
      FOREIGN KEY (parent_id) REFERENCES locations(id) ON DELETE CASCADE
    );
  `);

  // Insert root node (id = 1)
  db.run(`
    INSERT INTO locations (name, position)
    VALUES ('Root Node', 1);
  `);
});

module.exports = db;
