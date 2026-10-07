const express = require("express");
const path = require("path");
const cors = require("cors");
const db = require("./db");

// Import route files
const folderRoutes = require("./routes/folders");
const subfolderRoutes = require("./routes/subfolders");
const taskRoutes = require("./routes/tasks");
const analyticsRoutes = require("./routes/analytics");

const app = express();
const PORT = 3000;

// ========== Middleware ==========
// Enable CORS for all routes
app.use(cors());
// Parse incoming JSON requests used by the frontend
app.use(express.json());
// Parse incoming URL-encoded requests (for form submissions)
app.use(express.urlencoded({ extended: true }));
//those middlewares are used to handle incoming requests and responses in the Express application.
//uses for req.body to parse JSON and URL-encoded data, and
//  cors to allow cross-origin requests from the frontend.




// Serve the frontend static files
// console.log(path.join(__dirname, "..", "Frontend_todo_list"));
app.use(express.static(path.join(__dirname, "..", "Frontend_todo_list")));

// ========== API Routes ==========
// Use the imported route files for specific API endpoints
app.use("/api/folders", folderRoutes);
app.use("/api/subfolders", subfolderRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/analytics", analyticsRoutes);

// ========== GET all data (nested structure for the frontend) ==========
app.get("/api/all", function (req, res) {
  // Step 1: Get all folders
  db.query("SELECT * FROM folders ORDER BY id ASC", function (err, folders) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (folders.length === 0) {
      return res.json([]);
    }

    var completed = 0;
    var result = [];

    // Step 2: For each folder, get its subfolders
    folders.forEach(function (folder, folderIndex) {
      var folderObj = {
        id: folder.id,
        name: folder.name,
        color: folder.color,
        subfolders: [],
      };

      db.query(
        "SELECT * FROM subfolders WHERE folder_id = ? ORDER BY id ASC",
        [folder.id],
        function (err2, subfolders) {
          if (err2) {
            return res.status(500).json({ error: err2.message });
          }

          if (subfolders.length === 0) {
            folderObj.subfolders = [];
            result[folderIndex] = folderObj;
            completed++;

            if (completed === folders.length) {
              return res.json(result);
            }
            return;
          }

          var subCompleted = 0;

          // Step 3: For each subfolder, get its tasks
          subfolders.forEach(function (sub, subIndex) {
            var subObj = {
              id: sub.id,
              name: sub.name,
              tasks: [],
            };

            db.query(
              "SELECT * FROM tasks WHERE subfolder_id = ? ORDER BY id ASC",
              [sub.id],
              function (err3, tasks) {
                if (err3) {
                  return res.status(500).json({ error: err3.message });
                }

                subObj.tasks = tasks.map(function (t) {
                  return {
                    id: t.id,
                    name: t.name,
                    done: t.done === 1,
                    due: t.due,
                  };
                });

                folderObj.subfolders[subIndex] = subObj;
                subCompleted++;

                if (subCompleted === subfolders.length) {
                  result[folderIndex] = folderObj;
                  completed++;

                  if (completed === folders.length) {
                    return res.json(result);
                  }
                }
              }
            );
          });
        }
      );
    });
  });
});

// ========== Serve index.html for root ==========
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "..", "Frontend_todo_list", "index.html"));
});

// ========== Start the server ==========
app.listen(PORT, function () {
  console.log("========================================");
  console.log("  To-Do Organizer Backend is running!");
  console.log("  http://localhost:" + PORT);
  console.log("========================================");
});

