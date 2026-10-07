const express = require("express");
const router = express.Router();
const db = require("../db");

// ========== GET all subfolders for a folder ==========
router.get("/:folderId", function (req, res) {
  var folderId = req.params.folderId;

  db.query(
    "SELECT * FROM subfolders WHERE folder_id = ? ORDER BY id ASC",
    [folderId],
    function (err, results) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(results);
    }
  );
});

// ========== CREATE a subfolder ==========
router.post("/:folderId", function (req, res) {
  var folderId = req.params.folderId;
  var name = req.body.name;

  if (!name) {
    return res.status(400).json({ error: "SubFolder name is required" });
  }

  db.query(
    "INSERT INTO subfolders (folder_id, name) VALUES (?, ?)",
    [folderId, name],
    function (err, result) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({
        id: result.insertId,
        folder_id: Number(folderId),
        name: name,
      });
    }
  );
});

// ========== UPDATE a subfolder ==========
router.put("/:id", function (req, res) {
  var id = req.params.id;
  var name = req.body.name;

  if (!name) {
    return res.status(400).json({ error: "SubFolder name is required" });
  }

  db.query(
    "UPDATE subfolders SET name = ? WHERE id = ?",
    [name, id],
    function (err, result) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "SubFolder not found" });
      }
      res.json({ id: Number(id), name: name });
    }
  );
});

// ========== DELETE a subfolder ==========
router.delete("/:id", function (req, res) {
  var id = req.params.id;

  db.query(
    "DELETE FROM subfolders WHERE id = ?",
    [id],
    function (err, result) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "SubFolder not found" });
      }
      res.json({ message: "SubFolder deleted" });
    }
  );
});

module.exports = router;

