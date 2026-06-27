const { createClient } = require("@libsql/client");

const db = createClient({ url: "file:dev.db" });

async function seed() {
  // Create table
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

  // Clear existing data
  await db.execute("DELETE FROM preorders");

  const rows = [
    ["With ends", 1, "regardless-of-stock", "2025-08-14 03:59:00", "2025-09-14 03:59:00", 1],
    ["Coming soon", 1, "regardless-of-stock", "2025-12-11 04:42:00", null, 1],
    ["Full payment", 1, "regardless-of-stock", "2025-08-17 04:56:00", null, 1],
    ["Shipping not sure", 1, "regardless-of-stock", "2025-08-17 04:56:00", null, 1],
    ["Partial payment", 1, "regardless-of-stock", "2025-08-17 04:56:00", null, 1],
    ["Multi variants 1", 1, "regardless-of-stock", "2025-12-15 08:24:00", null, 1],
    ["Multi variant 2", 1, "regardless-of-stock", "2025-12-15 08:24:00", "2025-12-15 08:27:00", 1],
    ["Multi variant 3", 1, "out-of-stock", "2025-12-15 08:24:00", null, 0],
  ];

  for (const row of rows) {
    await db.execute({
      sql: "INSERT INTO preorders (name, products, preorder_when, starts_at, ends_at, status) VALUES (?,?,?,?,?,?)",
      args: row,
    });
  }

  console.log("✅ Database seeded with 8 preorders!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
