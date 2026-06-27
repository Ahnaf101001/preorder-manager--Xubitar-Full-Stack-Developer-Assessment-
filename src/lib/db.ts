import { createClient } from "@libsql/client";

const db = createClient({
  url: process.env.DATABASE_URL || "file:dev.db",
});

export default db;
