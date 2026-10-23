const jwt = require("jsonwebtoken");

// Reads "Authorization: Bearer <token>" and attaches the user info to req.user.
function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Please log in to continue." });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Your session has expired. Please log in again." });
  }
}

module.exports = { requireAuth };
