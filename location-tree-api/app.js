// app.js
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');  // Import the SQLite database setup

const app = express();
app.use(bodyParser.json());  // To parse incoming JSON requests

// 1. Fetch Tree or Node
app.get('/locations/:id?', (req, res) => {
  const id = req.params.id || 1;
  db.all(`SELECT * FROM locations WHERE id = ? OR parent_id = ?`, [id, id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 2. Add New Node
app.post('/locations', (req, res) => {
  const { parent_id, name } = req.body;

  // Find next available position under the parent
  db.get(`SELECT MAX(position) + 1 AS next_position FROM locations WHERE parent_id = ?`, [parent_id], (err, result) => {
    const position = result?.next_position || 1;

    db.run(`INSERT INTO locations (parent_id, name, position) VALUES (?, ?, ?)`, [parent_id, name, position], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, parent_id, name, position });
    });
  });
});

// 3. Update Node
app.put('/locations/:id', (req, res) => {
  const { name } = req.body;
  const id = req.params.id;

  db.run(`UPDATE locations SET name = ? WHERE id = ?`, [name, id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Node updated successfully" });
  });
});

// 4. Delete Node
app.delete('/locations/:id', (req, res) => {
  const id = req.params.id;

  db.run(`DELETE FROM locations WHERE id = ?`, [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Node deleted successfully" });
  });
});

// 5. Move Node
app.put('/locations/:id/move', (req, res) => {
  const { new_parent_id } = req.body;
  const id = req.params.id;

  // Find next available position under the new parent
  db.get(`SELECT MAX(position) + 1 AS next_position FROM locations WHERE parent_id = ?`, [new_parent_id], (err, result) => {
    const position = result?.next_position || 1;

    db.run(`UPDATE locations SET parent_id = ?, position = ? WHERE id = ?`, [new_parent_id, position, id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Node moved successfully" });
    });
  });
});

// 6. BONUS: Reorder Node
app.put('/locations/:id/reorder', (req, res) => {
  const id = req.params.id;
  const { new_position } = req.body;

  // Get the parent of the node to reorder siblings
  db.get(`SELECT parent_id FROM locations WHERE id = ?`, [id], (err, row) => {
    const parent_id = row?.parent_id;

    // Update positions of sibling nodes
    db.run(`UPDATE locations SET position = position + 1 WHERE parent_id = ? AND position >= ?`, [parent_id, new_position], (err) => {
      if (err) return res.status(500).json({ error: err.message });

      // Set the new position of the target node
      db.run(`UPDATE locations SET position = ? WHERE id = ?`, [new_position, id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Node reordered successfully" });
      });
    });
  });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
