// A tiny JSON-file database. Good enough for a college project and demos.
// For real production use, swap this module for MongoDB / PostgreSQL.
const fs = require("fs");
const path = require("path");

const dataDir = path.resolve(process.env.DATA_DIR || path.join(__dirname, "..", "data"));
const dbFile = path.join(dataDir, "db.json");

const emptyDb = { users: [], certificates: [] };
let cache = null;

function load() {
  if (cache) return cache;

  fs.mkdirSync(dataDir, { recursive: true });

  if (!fs.existsSync(dbFile)) {
    cache = structuredClone(emptyDb);
    save();
    return cache;
  }

  try {
    cache = { ...emptyDb, ...JSON.parse(fs.readFileSync(dbFile, "utf8")) };
  } catch (err) {
    // Don't silently overwrite a damaged file - stop and let the developer look at it.
    throw new Error(`Could not read ${dbFile}: ${err.message}`);
  }
  return cache;
}

// Write to a temp file first, then rename, so a crash never leaves half a file behind.
function save() {
  const tmp = `${dbFile}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(cache, null, 2));
  fs.renameSync(tmp, dbFile);
}

module.exports = { load, save };
