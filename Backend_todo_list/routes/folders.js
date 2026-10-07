const express = require("express");
const router = express.Router();
const db = require("../db");

// ========== GET all folders ==========
router.get("/", function (req, res) {
  db.query("SELECT * FROM folders ORDER BY id ASC", function (err, results) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// ========== CREATE a folder ==========
router.post("/", function (req, res) {
  // console.log(req.body);
  let data=req.body;
  var name = req.body.name;
  var color = req.body.color || "#2196f3";

  if (!name) {
    return res.status(400).json({ error: "Folder name is required" });
  }

// data={ 
//   InsertId=1
//   name="john",
//   color="red"
// }
  db.query(
    "INSERT INTO folders (name, color) VALUES (?, ?)",
    [name, color],
    function (err, result) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: result.insertId, name: name, color: color });
    }
  );
});

// ========== UPDATE a folder ==========
router.put("/:id", function (req, res) {
  var id = req.params.id;
  var name = req.body.name;

  if (!name) {
    return res.status(400).json({ error: "Folder name is required" });
  }

  db.query(
    "UPDATE folders SET name = ? WHERE id = ?",
    [name, id],
    function (err, result) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Folder not found" });
      }
      res.json({ id: Number(id), name: name });
    }
  );
});

// ========== DELETE a folder ==========
router.delete("/:id", function (req, res) {
  var id = req.params.id;

  db.query("DELETE FROM folders WHERE id = ?", [id], function (err, result) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Folder not found" });
    }
    res.json({ message: "Folder deleted" });
  });
});

module.exports = router;

