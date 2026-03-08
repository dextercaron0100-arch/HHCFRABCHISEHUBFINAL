import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { Pool } from "pg";
import { open } from "sqlite";
import sqlite3 from "sqlite3";
import {
  getPostgresPoolConfig,
  initializePostgresSchema,
  type InquiryRecord,
} from "../src/database.js";

dotenv.config();

const normalize = (value: unknown = ""): string => String(value ?? "").trim();

const databaseUrl = normalize(process.env.DATABASE_URL);
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to migrate data into Postgres/Neon.");
}

const sqliteCandidates = [
  normalize(process.env.SQLITE_FILE),
  "./data/inquiries.db",
  normalize(process.env.DATABASE_FILE),
]
  .filter(Boolean)
  .map((filename) =>
    path.isAbsolute(filename) ? filename : path.resolve(process.cwd(), filename)
  );

const sqliteFile = sqliteCandidates.find((filename) => fs.existsSync(filename));

if (!sqliteFile) {
  throw new Error(
    `Unable to find a local SQLite file. Checked: ${sqliteCandidates.join(", ")}`
  );
}

const pool = new Pool(getPostgresPoolConfig(databaseUrl, true));
const sqliteDb = await open({
  filename: sqliteFile,
  driver: sqlite3.Database,
});

try {
  await initializePostgresSchema(pool);

  const rows = await sqliteDb.all<
    Array<InquiryRecord & { comment: string }>
  >(
    `
      SELECT lead_id, name, phone, email, comment, source, status, notes,
             admin_email_sent, auto_reply_sent, email_error, created_at, updated_at
      FROM inquiries
      ORDER BY datetime(created_at) ASC
    `
  );

  for (const row of rows) {
    await pool.query(
      `
        INSERT INTO inquiries (
          lead_id, name, phone, email, comment, source, status, notes,
          admin_email_sent, auto_reply_sent, email_error, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (lead_id) DO UPDATE SET
          name = EXCLUDED.name,
          phone = EXCLUDED.phone,
          email = EXCLUDED.email,
          comment = EXCLUDED.comment,
          source = EXCLUDED.source,
          status = EXCLUDED.status,
          notes = EXCLUDED.notes,
          admin_email_sent = EXCLUDED.admin_email_sent,
          auto_reply_sent = EXCLUDED.auto_reply_sent,
          email_error = EXCLUDED.email_error,
          created_at = EXCLUDED.created_at,
          updated_at = EXCLUDED.updated_at
      `,
      [
        row.lead_id,
        row.name,
        row.phone,
        row.email,
        row.comment,
        row.source,
        row.status,
        row.notes,
        row.admin_email_sent,
        row.auto_reply_sent,
        row.email_error,
        row.created_at,
        row.updated_at,
      ]
    );
  }

  console.log(
    `Migrated ${rows.length} inquiry rows from SQLite (${sqliteFile}) to Postgres.`
  );
} finally {
  await sqliteDb.close();
  await pool.end();
}
