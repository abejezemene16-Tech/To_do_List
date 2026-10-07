const express = require("express");
const router = express.Router();
const db = require("../db");

// ========== GET all tasks for a subfolder ==========
router.get("/:subfolderId", function (req, res) {
  var subfolderId = req.params.subfolderId;

  db.query(
    "SELECT * FROM tasks WHERE subfolder_id = ? ORDER BY id ASC",
    [subfolderId],
    function (err, results) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(results);
    }
  );
});

// ========== CREATE a task ==========
router.post("/:subfolderId", function (req, res) {
  var subfolderId = req.params.subfolderId;
  var name = req.body.name;
  var due = req.body.due || null;

  if (!name) {
    return res.status(400).json({ error: "Task name is required" });
  }

  db.query(
    "INSERT INTO tasks (subfolder_id, name, done, due) VALUES (?, ?, 0, ?)",
    [subfolderId, name, due],
    function (err, result) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({
        id: result.insertId,
        subfolder_id: Number(subfolderId),
        name: name,
        done: 0,
        due: due,
      });
    }
  );
});

// ========== UPDATE a task (edit name) ==========
router.put("/:id", function (req, res) {
  var id = req.params.id;
  var name = req.body.name;

  if (!name) {
    return res.status(400).json({ error: "Task name is required" });
  }

  db.query(
    "UPDATE tasks SET name = ? WHERE id = ?",
    [name, id],
    function (err, result) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json({ id: Number(id), name: name });
    }
  );
});

// ========== TOGGLE task done/undone ==========
router.patch("/:id/toggle", function (req, res) {
  var id = req.params.id;

  db.query("SELECT done FROM tasks WHERE id = ?", [id], function (err, rows) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    var newDone = rows[0].done ? 0 : 1;

    db.query(
      "UPDATE tasks SET done = ? WHERE id = ?",
      [newDone, id],
      function (err2, result) {
        if (err2) {
          return res.status(500).json({ error: err2.message });
        }
        res.json({ id: Number(id), done: newDone });
      }
    );
  });
});

// ========== DELETE a task ==========
router.delete("/:id", function (req, res) {
  var id = req.params.id;

  db.query("DELETE FROM tasks WHERE id = ?", [id], function (err, result) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json({ message: "Task deleted" });
  });
});

module.exports = router;

