const express = require("express");
const multer = require("multer");
const crypto = require("crypto");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["application/pdf", "image/png", "image/jpeg"];

// Files are kept in memory only long enough to hash them. We never save the certificate itself.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) return cb(null, true);
    cb(new Error("Only PDF, PNG or JPG certificates are allowed."));
  },
});

const sha256 = (input) => crypto.createHash("sha256").update(input).digest("hex");

// Each record is linked to the one before it, like a (very small) blockchain.
// If anyone edits an old record, every block after it stops matching.
function makeBlockHash({ previousHash, hash, studentId, issuedAt }) {
  return sha256(`${previousHash}|${hash}|${studentId}|${issuedAt}`);
}

// Wraps multer so its errors (file too big, wrong type) come back as friendly 400s.
function handleUpload(req, res, next) {
  upload.single("file")(req, res, (err) => {
    if (!err) return next();
    const message =
      err.code === "LIMIT_FILE_SIZE" ? "File is too large. The limit is 5 MB." : err.message;
    res.status(400).json({ message });
  });
}

// ---- Issue a certificate (institutions only) ----
router.post("/issue", requireAuth, handleUpload, (req, res) => {
  const { studentId, studentName, course } = req.body;

  if (!studentId || !studentName || !course) {
    return res.status(400).json({ message: "Student ID, name and course are required." });
  }
  if (!req.file) {
    return res.status(400).json({ message: "Please attach the certificate file." });
  }

  const data = db.load();
  const hash = sha256(req.file.buffer);

  if (data.certificates.some((c) => c.hash === hash)) {
    return res.status(409).json({ message: "This certificate has already been issued." });
  }

  const last = data.certificates[data.certificates.length - 1];
  const previousHash = last ? last.blockHash : "GENESIS";
  const issuedAt = new Date().toISOString();

  const record = {
    id: crypto.randomUUID(),
    studentId: studentId.trim(),
    studentName: studentName.trim(),
    course: course.trim(),
    fileName: req.file.originalname,
    hash,
    previousHash,
    blockHash: makeBlockHash({ previousHash, hash, studentId: studentId.trim(), issuedAt }),
    issuedBy: req.user.id,
    issuedByName: req.user.organization || req.user.name,
    issuedAt,
  };

  data.certificates.push(record);
  db.save();

  res.status(201).json({ message: "Certificate issued successfully.", certificate: record });
});

// ---- List certificates issued by the logged-in institution ----
router.get("/mine", requireAuth, (req, res) => {
  const mine = db
    .load()
    .certificates.filter((c) => c.issuedBy === req.user.id)
    .reverse();
  res.json({ certificates: mine });
});

// ---- Verify a certificate (public, so employers don't need an account) ----
// Accepts either an uploaded file or a pasted hash.
router.post("/verify", handleUpload, (req, res) => {
  let hash;

  if (req.file) {
    hash = sha256(req.file.buffer);
  } else if (req.body && req.body.hash) {
    hash = String(req.body.hash).trim().toLowerCase();
    if (!/^[a-f0-9]{64}$/.test(hash)) {
      return res.status(400).json({ message: "A SHA-256 hash is 64 characters (0-9, a-f)." });
    }
  } else {
    return res.status(400).json({ message: "Upload a certificate or enter its hash." });
  }

  const match = db.load().certificates.find((c) => c.hash === hash);

  if (!match) {
    return res.json({ valid: false, hash, message: "No matching certificate was found. It may be fake or altered." });
  }

  res.json({
    valid: true,
    hash,
    message: "This certificate is authentic.",
    certificate: {
      studentName: match.studentName,
      studentId: match.studentId,
      course: match.course,
      issuedBy: match.issuedByName,
      issuedAt: match.issuedAt,
    },
  });
});

// ---- Check that no stored record has been tampered with ----
router.get("/chain/status", (req, res) => {
  const { certificates } = db.load();
  let previousHash = "GENESIS";

  for (let i = 0; i < certificates.length; i++) {
    const c = certificates[i];
    const expected = makeBlockHash({
      previousHash,
      hash: c.hash,
      studentId: c.studentId,
      issuedAt: c.issuedAt,
    });

    if (c.previousHash !== previousHash || c.blockHash !== expected) {
      return res.json({ intact: false, total: certificates.length, brokenAtIndex: i });
    }
    previousHash = c.blockHash;
  }

  res.json({ intact: true, total: certificates.length });
});

module.exports = router;
