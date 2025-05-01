const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 8085;

app.use(cors());
app.use(bodyParser.json());

// MySQL Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "shriyash27@",
  database: "polling_app",
});

db.connect((err) => {
  if (err) {
    console.log("DB Connection Error:", err);
  } else {
    console.log("Connected to MySQL Database.");
  }
});

// Create Poll
app.post("/polls", (req, res) => {
  const { question, options, created_by } = req.body;
  db.query("INSERT INTO polls (question, created_by) VALUES (?, ?)", [question, created_by], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    const pollId = result.insertId;
    const values = options.map((opt) => [pollId, opt]);
    db.query("INSERT INTO poll_options (poll_id, option_text) VALUES ?", [values], (err2) => {
      if (err2) return res.status(500).json({ error: err2 });
      res.json({ message: "Poll created", pollId });
    });
  });
});

// Get All Polls
app.get("/polls", (req, res) => {
  db.query("SELECT * FROM polls ORDER BY created_at DESC", (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Get Single Poll with Options
app.get("/polls/:id", (req, res) => {
  const pollId = req.params.id;
  db.query("SELECT * FROM polls WHERE id = ?", [pollId], (err, pollData) => {
    if (err) return res.status(500).json({ error: err });
    db.query("SELECT * FROM poll_options WHERE poll_id = ?", [pollId], (err2, options) => {
      if (err2) return res.status(500).json({ error: err2 });
      res.json({ poll: pollData[0], options });
    });
  });
});

// Vote on a poll
app.post("/polls/:id/vote", (req, res) => {
  const { user_id, option_id } = req.body;
  const pollId = req.params.id;
  db.query("UPDATE poll_options SET vote_count = vote_count + 1 WHERE id = ?", [option_id], (err) => {
    if (err) return res.status(500).json({ error: err });
    db.query("INSERT INTO poll_votes (user_id, poll_id, option_id) VALUES (?, ?, ?)", [user_id, pollId, option_id], (err2) => {
      if (err2) return res.status(500).json({ error: err2 });
      res.json({ message: "Vote submitted" });
    });
  });
});

// Get results
app.get("/polls/:id/results", (req, res) => {
  const pollId = req.params.id;
  db.query("SELECT option_text, vote_count FROM poll_options WHERE poll_id = ?", [pollId], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
