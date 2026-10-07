const mysql = require("mysql2");

// Create MySQL connection pool (XAMPP default: root with no password)
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "todo_organiser",
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = db;

