const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function createToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, organization: user.organization },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, organization: user.organization };
}

router.post("/register", async (req, res) => {
  const { name, email, password, organization } = req.body || {};

  if (!name || !email || !password || !organization) {
    return res.status(400).json({ message: "Name, email, organization and password are all required." });
  }
  if (!emailPattern.test(email)) {
    return res.status(400).json({ message: "That email address doesn't look right." });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters." });
  }

  const data = db.load();
  const cleanEmail = email.trim().toLowerCase();

  if (data.users.some((u) => u.email === cleanEmail)) {
    return res.status(409).json({ message: "An account with this email already exists." });
  }

  const user = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: cleanEmail,
    organization: organization.trim(),
    passwordHash: await bcrypt.hash(password, 10),
    createdAt: new Date().toISOString(),
  };

  data.users.push(user);
  db.save();

  res.status(201).json({ token: createToken(user), user: publicUser(user) });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: "Please enter your email and password." });
  }

  const user = db.load().users.find((u) => u.email === email.trim().toLowerCase());
  const passwordOk = user && (await bcrypt.compare(password, user.passwordHash));

  // Same message for both cases so nobody can probe which emails are registered.
  if (!passwordOk) {
    return res.status(401).json({ message: "Incorrect email or password." });
  }

  res.json({ token: createToken(user), user: publicUser(user) });
});

router.get("/me", requireAuth, (req, res) => {
  const user = db.load().users.find((u) => u.id === req.user.id);
  if (!user) return res.status(401).json({ message: "Account no longer exists." });
  res.json({ user: publicUser(user) });
});

module.exports = router;
