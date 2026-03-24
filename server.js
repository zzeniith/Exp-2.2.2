const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const cors = require("cors");
const User = require("./models/User");
const auth = require("./middleware/auth");

const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("JWT Banking API is running 🚀");
});

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log("DB Connected"))
.catch(err => {
  console.log("DB Error:", err);
});

// ✅ Register
app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  await User.create({ email, password: hashed });
  res.json({ message: "User registered" });
});

// ✅ Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).send("User not found");
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).send("Wrong password");
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h"
  });
  res.json({ token });
});

// ✅ Protected Route (Banking)
app.get("/balance", auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({
    email: user.email,
    balance: user.balance
  });
});

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});

module.exports = app;
