const express = require("express");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

const SECRET = "mysecretkey";

// Fake database (in-memory)
const users = [];

// ✅ Register
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  users.push({ email, password });

  res.json({ message: "User registered" });
});

// ✅ Login
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ email }, SECRET, { expiresIn: "1h" });

  res.json({ token });
});

// ✅ Middleware
function auth(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({ message: "Invalid token" });
  }
}

// ✅ Protected Route
app.get("/balance", auth, (req, res) => {
  res.json({
    message: "Secure banking data",
    user: req.user.email,
    balance: 10000
  });
});

// Server
app.listen(5000, () => {
  console.log("Server running on https://exp-2-2-2-6fbn.onrender.com/");
});