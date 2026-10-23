require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/auth");
const certificateRoutes = require("./routes/certificates");

const isProduction = process.env.NODE_ENV === "production";

// Refuse to start in production with a missing secret - a guessable one would let anyone forge logins.
if (!process.env.JWT_SECRET) {
  if (isProduction) {
    console.error("JWT_SECRET is not set. Add it to your environment variables and restart.");
    process.exit(1);
  }
  process.env.JWT_SECRET = "dev-only-secret-do-not-use-in-production";
  console.warn("JWT_SECRET not set - using an insecure development default.");
}

const app = express();

// Hosting platforms (Render, Railway, ...) sit behind a proxy; this keeps rate limiting accurate.
app.set("trust proxy", 1);

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:3000")
  .split(",")
  .map((url) => url.trim().replace(/\/$/, ""));

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // No origin means a tool like curl or a health check, which is fine.
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error("Not allowed by CORS"));
    },
  })
);
app.use(express.json({ limit: "100kb" }));

const limiter = (max) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests. Please try again in a few minutes." },
  });

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", limiter(30), authRoutes);
app.use("/api/certificates", limiter(200), certificateRoutes);

app.use((req, res) => res.status(404).json({ message: "Route not found." }));

// Last-resort error handler so users never see a raw stack trace.
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.message === "Not allowed by CORS" ? 403 : 500;
  res.status(status).json({ message: status === 403 ? err.message : "Something went wrong on our side." });
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`API running on port ${port}`));
