const { createClient } = require("@libsql/client");

const db = createClient({ url: "file:dev.db" });

async function setup() {
  console.log("🔧 Setting up database...");

  await db.execute(`CREATE TABLE IF NOT EXISTS preorders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    products INTEGER DEFAULT 1,
    preorder_when TEXT DEFAULT 'regardless-of-stock',
    starts_at TEXT NOT NULL,
    ends_at TEXT,
    status INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )`);

  console.log("✅ Table created (or already exists)");
  process.exit(0);
}

setup().catch((err) => {
  console.error("❌ Setup failed:", err);
  process.exit(1);
});
