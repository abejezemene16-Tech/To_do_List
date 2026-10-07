const express = require("express");
const router = express.Router();
const db = require("../db");

// // ========== GET all tasks for a subfolder ==========
router.get("/:subfolderId", function (req, res) {
  // console.log(req.params.subfolderId);
  var subfolderId = req.params.subfolderId;

  db.query("SELECT * FROM tasks WHERE subfolder_id = ? ORDER BY id ASC",
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
  // console.log(req.body);
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
      //this is the response that will be sent back to the client 
      // after a successful insertion of a new task into the database.
      //  It includes the newly created task's ID, the subfolder ID it belongs to, 
      // its name, its done status (which is set to 0 by default), and its due date (if provided).
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
  //this id is the id of the task that we want to update.
  //  It is extracted from the URL parameters using req.params.id.
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
      // Check if any rows were affected (i.e., if the task was found and updated)
      // console.log("this is results",result);//output: {fieldCount: 0, affectedRows: 0, insertId: 0, serverStatus: 2, warningCount: 0, …}
      // console.log("i am here ??",result.affectedRows);//output: i am here ?? 0
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
    //this check is to ensure that the task with the specified ID exists in the database.
    if (rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }


    //  console.log(rows);
    // output: [{ done: 0 } ]  or [{ done: 1 }]
     // 0 means the task is not done(false), and 1 means the task is done(true).
    var newDone = rows[0].done ? 0 : 1;

    db.query(
      "UPDATE tasks SET done = ? WHERE id = ?",
      [newDone, id],
      function (err2, result) {
        if (err2) {
          return res.status(500).json({ error: err2.message });
        }
        //respond with the updated task's ID and its new done status (0 or 1).
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

