// app.js
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');  // Import the SQLite database setup

const app = express();
app.use(bodyParser.json());  // To parse incoming JSON requests

// 1. Fetch Tree or Node
app.get('/locations/:id?', (req, res) => {
  const id = req.params.id || 1;
  const query = `
    SELECT * 
    FROM locations 
    WHERE id = ? 
    OR parent_id = ?
  `;
  
  db.all(query, [id, id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 2. Add New Node
app.post('/locations', (req, res) => {
  const { parent_id, name } = req.body;

  const positionQuery = `
    SELECT MAX(position) + 1 AS next_position 
    FROM locations 
    WHERE parent_id = ?
  `;

  db.get(positionQuery, [parent_id], (err, result) => {
    const position = result?.next_position || 1;
    const insertQuery = `
      INSERT INTO locations (parent_id, name, position) 
      VALUES (?, ?, ?)
    `;
    
    db.run(insertQuery, [parent_id, name, position], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, parent_id, name, position });
    });
  });
});

// 3. Update Node
app.put('/locations/:id', (req, res) => {
  const { name } = req.body;
  const id = req.params.id;

  const query = `
    UPDATE locations 
    SET name = ? 
    WHERE id = ?
  `;
  
  db.run(query, [name, id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Node updated successfully" });
  });
});

// 4. Delete Node
app.delete('/locations/:id', (req, res) => {
  const id = req.params.id;

  const query = `
    DELETE FROM locations 
    WHERE id = ?
  `;

  db.run(query, [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Node deleted successfully" });
  });
});

// 5. Move Node
app.put('/locations/:id/move', (req, res) => {
  const { new_parent_id } = req.body;
  const id = req.params.id;

  const positionQuery = `
    SELECT MAX(position) + 1 AS next_position 
    FROM locations 
    WHERE parent_id = ?
  `;

  db.get(positionQuery, [new_parent_id], (err, result) => {
    const position = result?.next_position || 1;
    const moveQuery = `
      UPDATE locations 
      SET parent_id = ?, position = ? 
      WHERE id = ?
    `;
    
    db.run(moveQuery, [new_parent_id, position, id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Node moved successfully" });
    });
  });
});

// 6. BONUS: Reorder Node
app.put('/locations/:id/reorder', (req, res) => {
  const id = req.params.id;
  const { new_position } = req.body;

  const parentQuery = `
    SELECT parent_id 
    FROM locations 
    WHERE id = ?
  `;
  
  db.get(parentQuery, [id], (err, row) => {
    const parent_id = row?.parent_id;

    const shiftQuery = `
      UPDATE locations 
      SET position = position + 1 
      WHERE parent_id = ? 
      AND position >= ?
    `;
    
    db.run(shiftQuery, [parent_id, new_position], (err) => {
      if (err) return res.status(500).json({ error: err.message });

      const reorderQuery = `
        UPDATE locations 
        SET position = ? 
        WHERE id = ?
      `;

      db.run(reorderQuery, [new_position, id], function(err) {
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
