const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Pool } = require("pg");

const app = express();
app.use(cors());

const port = 3001; // Change to your desired port

app.use(bodyParser.json());

const pool = new Pool({
  user: "juliaadmin",
  host: "35.188.122.210",
  database: "julialabs", // Change to your new database name
  password: "juliaadmin",
  port: 5432,
});

// Signup API
app.post("/api/signup", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Insert user data into the database
    await pool.query("INSERT INTO signup_history (user_email) VALUES ($1)", [
      email,
    ]);
    console.log("signup history inserted");

    // Store the email and password in the users table
    await pool.query(
      "INSERT INTO users (user_email, user_password) VALUES ($1, $2)",
      [email, password]
    );

    console.log("users table inserted");

    res.sendStatus(200);
  } catch (error) {
    console.error("Error executing SQL query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

// Login API
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT user_password FROM users WHERE user_email = $1",
      [email]
    );
    console.log("password checked");

    await pool.query("INSERT INTO login_history (user_email) VALUES ($1)", [
      email,
    ]);
    console.log("login_history inserted");

    if (result.rowCount === 0) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    const storedPassword = result.rows[0].user_password;

    if (storedPassword === password) {
      // Passwords match, allow login
      const userName = email.split("@")[0];
      res.status(200).json({ success: true, userName });
    } else {
      // Passwords do not match
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Error executing SQL query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
