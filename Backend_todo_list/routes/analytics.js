const express = require("express");
const router = express.Router();
const db = require("../db");

// ========== GET analytics data ==========
router.get("/", function (req, res) {
  db.query("SELECT COUNT(*) AS count FROM folders", function (err, folderRows) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    db.query(
      "SELECT COUNT(*) AS count FROM subfolders",
      function (err2, subRows) {
        if (err2) {
          return res.status(500).json({ error: err2.message });
        }

        db.query(
          "SELECT COUNT(*) AS count FROM tasks",
          function (err3, taskRows) {
            if (err3) {
              return res.status(500).json({ error: err3.message });
            }

            db.query(
              "SELECT COUNT(*) AS count FROM tasks WHERE done = 1",
              function (err4, doneRows) {
                if (err4) {
                  return res.status(500).json({ error: err4.message });
                }
     
                var folders = folderRows[0].count;

                // console.log(folderRows[0].count);
                var subfolders = subRows[0].count;
                // console.log(subfolders)
                var tasks = taskRows[0].count;
                var completed = doneRows[0].count;

                res.json({
                  folders: folders,
                  subfolders: subfolders,
                  tasks: tasks,
                  completed: completed,
                  expired: tasks - completed,
                });
              }
            );
          }
        );
      }
    );
  });
});

module.exports = router;

