import fs from "node:fs";
import path from "node:path";
import { Pool, type PoolConfig } from "pg";
import { open, type Database } from "sqlite";
import sqlite3 from "sqlite3";

export type InquiryStatus = "new" | "contacted" | "qualified" | "closed" | "spam";

export interface InquiryRecord {
  admin_email_sent: number;
  auto_reply_sent: number;
  created_at: string;
  email: string | null;
  email_error: string;
  lead_id: string;
  name: string;
  notes: string;
  phone: string;
  source: string | null;
  status: InquiryStatus;
  updated_at: string;
}

export interface CreateInquiryInput {
  comment: string;
  email: string | null;
  leadId: string;
  name: string;
  now: string;
  phone: string;
  source: string;
}

export interface DatabaseClient {
  createInquiry(input: CreateInquiryInput): Promise<void>;
  getInquiryByLeadId(leadId: string): Promise<InquiryRecord | null>;
  getInquiryNotes(leadId: string): Promise<string | null>;
  init(): Promise<void>;
  isReady(): boolean;
  kind: "postgres" | "sqlite";
  listInquiries(limit: number, status?: string): Promise<InquiryRecord[]>;
  markAdminEmailSent(leadId: string, updatedAt: string): Promise<void>;
  markAutoReplySent(leadId: string, updatedAt: string): Promise<void>;
  setEmailError(leadId: string, message: string, updatedAt: string): Promise<void>;
  updateInquiryStatus(
    leadId: string,
    status: InquiryStatus,
    notes: string,
    updatedAt: string
  ): Promise<void>;
}

interface DatabaseConfig {
  databaseFile: string;
  databaseUrl: string;
  pgSsl: boolean;
}

type SqliteDatabase = Database<sqlite3.Database, sqlite3.Statement>;

const sqliteSchemaSql = `
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS inquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    comment TEXT NOT NULL,
    source TEXT,
    status TEXT NOT NULL DEFAULT 'new',
    notes TEXT DEFAULT '',
    admin_email_sent INTEGER NOT NULL DEFAULT 0,
    auto_reply_sent INTEGER NOT NULL DEFAULT 0,
    email_error TEXT DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries (created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries (status);
`;

export const postgresSchemaSql = `
  CREATE TABLE IF NOT EXISTS inquiries (
    id SERIAL PRIMARY KEY,
    lead_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    comment TEXT NOT NULL,
    source TEXT,
    status TEXT NOT NULL DEFAULT 'new',
    notes TEXT DEFAULT '',
    admin_email_sent INTEGER NOT NULL DEFAULT 0,
    auto_reply_sent INTEGER NOT NULL DEFAULT 0,
    email_error TEXT DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries (created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries (status);
`;

const normalize = (value: unknown = ""): string => String(value ?? "").trim();

const shouldUseSsl = (databaseUrl: string, pgSsl: boolean): boolean => {
  if (!pgSsl) return false;

  const lowered = databaseUrl.toLowerCase();
  return !lowered.includes("localhost") && !lowered.includes("127.0.0.1");
};

export const getPostgresPoolConfig = (
  databaseUrl: string,
  pgSsl = true
): PoolConfig => ({
  connectionString: databaseUrl,
  ssl: shouldUseSsl(databaseUrl, pgSsl) ? { rejectUnauthorized: false } : false,
});

export const initializePostgresSchema = async (pool: Pool): Promise<void> => {
  await pool.query(postgresSchemaSql);
};

const ensureDatabaseDirectory = (filename: string): string => {
  const absolutePath = path.resolve(process.cwd(), filename);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  return absolutePath;
};

class SqliteClient implements DatabaseClient {
  public readonly kind = "sqlite";
  private db: SqliteDatabase | null = null;

  constructor(private readonly databaseFile: string) {}

  public async init(): Promise<void> {
    const filePath = ensureDatabaseDirectory(this.databaseFile);
    this.db = await open({
      filename: filePath,
      driver: sqlite3.Database,
    });

    await this.db.exec(sqliteSchemaSql);
  }

  public isReady(): boolean {
    return Boolean(this.db);
  }

  public async createInquiry(input: CreateInquiryInput): Promise<void> {
    const db = this.getDb();
    await db.run(
      `
        INSERT INTO inquiries (
          lead_id, name, phone, email, comment, source, status,
          admin_email_sent, auto_reply_sent, email_error, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, 'new', 0, 0, '', ?, ?)
      `,
      input.leadId,
      input.name,
      input.phone,
      input.email,
      input.comment,
      input.source,
      input.now,
      input.now
    );
  }

  public async markAdminEmailSent(leadId: string, updatedAt: string): Promise<void> {
    await this.getDb().run(
      `UPDATE inquiries SET admin_email_sent = 1, updated_at = ? WHERE lead_id = ?`,
      updatedAt,
      leadId
    );
  }

  public async markAutoReplySent(leadId: string, updatedAt: string): Promise<void> {
    await this.getDb().run(
      `UPDATE inquiries SET auto_reply_sent = 1, updated_at = ? WHERE lead_id = ?`,
      updatedAt,
      leadId
    );
  }

  public async setEmailError(
    leadId: string,
    message: string,
    updatedAt: string
  ): Promise<void> {
    await this.getDb().run(
      `UPDATE inquiries SET email_error = ?, updated_at = ? WHERE lead_id = ?`,
      message,
      updatedAt,
      leadId
    );
  }

  public async listInquiries(limit: number, status?: string): Promise<InquiryRecord[]> {
    let query = `
      SELECT lead_id, name, phone, email, source, status, notes,
             admin_email_sent, auto_reply_sent, email_error, created_at, updated_at
      FROM inquiries
    `;
    const params: Array<number | string> = [];

    if (status) {
      query += ` WHERE status = ?`;
      params.push(status);
    }

    query += ` ORDER BY datetime(created_at) DESC LIMIT ?`;
    params.push(limit);

    return this.getDb().all<InquiryRecord[]>(query, params);
  }

  public async getInquiryNotes(leadId: string): Promise<string | null> {
    const row = await this.getDb().get<{ notes: string }>(
      `SELECT notes FROM inquiries WHERE lead_id = ?`,
      leadId
    );
    return row?.notes ?? null;
  }

  public async updateInquiryStatus(
    leadId: string,
    status: InquiryStatus,
    notes: string,
    updatedAt: string
  ): Promise<void> {
    await this.getDb().run(
      `UPDATE inquiries SET status = ?, notes = ?, updated_at = ? WHERE lead_id = ?`,
      status,
      notes,
      updatedAt,
      leadId
    );
  }

  public async getInquiryByLeadId(leadId: string): Promise<InquiryRecord | null> {
    const row = await this.getDb().get<InquiryRecord>(
      `
        SELECT lead_id, name, phone, email, source, status, notes,
               admin_email_sent, auto_reply_sent, email_error, created_at, updated_at
        FROM inquiries
        WHERE lead_id = ?
      `,
      leadId
    );
    return row ?? null;
  }

  private getDb(): SqliteDatabase {
    if (!this.db) {
      throw new Error("SQLite database has not been initialized.");
    }

    return this.db;
  }
}

class PostgresClient implements DatabaseClient {
  public readonly kind = "postgres";
  private readonly pool: Pool;
  private ready = false;

  constructor(databaseUrl: string, pgSsl: boolean) {
    this.pool = new Pool(getPostgresPoolConfig(databaseUrl, pgSsl));
  }

  public async init(): Promise<void> {
    await initializePostgresSchema(this.pool);
    this.ready = true;
  }

  public isReady(): boolean {
    return this.ready;
  }

  public async createInquiry(input: CreateInquiryInput): Promise<void> {
    await this.pool.query(
      `
        INSERT INTO inquiries (
          lead_id, name, phone, email, comment, source, status,
          admin_email_sent, auto_reply_sent, email_error, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, 'new', 0, 0, '', $7, $8)
      `,
      [
        input.leadId,
        input.name,
        input.phone,
        input.email,
        input.comment,
        input.source,
        input.now,
        input.now,
      ]
    );
  }

  public async markAdminEmailSent(leadId: string, updatedAt: string): Promise<void> {
    await this.pool.query(
      `UPDATE inquiries SET admin_email_sent = 1, updated_at = $1 WHERE lead_id = $2`,
      [updatedAt, leadId]
    );
  }

  public async markAutoReplySent(leadId: string, updatedAt: string): Promise<void> {
    await this.pool.query(
      `UPDATE inquiries SET auto_reply_sent = 1, updated_at = $1 WHERE lead_id = $2`,
      [updatedAt, leadId]
    );
  }

  public async setEmailError(
    leadId: string,
    message: string,
    updatedAt: string
  ): Promise<void> {
    await this.pool.query(
      `UPDATE inquiries SET email_error = $1, updated_at = $2 WHERE lead_id = $3`,
      [message, updatedAt, leadId]
    );
  }

  public async listInquiries(limit: number, status?: string): Promise<InquiryRecord[]> {
    const params: Array<number | string> = [];
    let index = 1;
    let query = `
      SELECT lead_id, name, phone, email, source, status, notes,
             admin_email_sent, auto_reply_sent, email_error, created_at, updated_at
      FROM inquiries
    `;

    if (status) {
      query += ` WHERE status = $${index}`;
      params.push(status);
      index += 1;
    }

    query += ` ORDER BY created_at DESC LIMIT $${index}`;
    params.push(limit);

    const { rows } = await this.pool.query<InquiryRecord>(query, params);
    return rows;
  }

  public async getInquiryNotes(leadId: string): Promise<string | null> {
    const { rows } = await this.pool.query<{ notes: string }>(
      `SELECT notes FROM inquiries WHERE lead_id = $1`,
      [leadId]
    );
    return rows[0]?.notes ?? null;
  }

  public async updateInquiryStatus(
    leadId: string,
    status: InquiryStatus,
    notes: string,
    updatedAt: string
  ): Promise<void> {
    await this.pool.query(
      `UPDATE inquiries SET status = $1, notes = $2, updated_at = $3 WHERE lead_id = $4`,
      [status, notes, updatedAt, leadId]
    );
  }

  public async getInquiryByLeadId(leadId: string): Promise<InquiryRecord | null> {
    const { rows } = await this.pool.query<InquiryRecord>(
      `
        SELECT lead_id, name, phone, email, source, status, notes,
               admin_email_sent, auto_reply_sent, email_error, created_at, updated_at
        FROM inquiries
        WHERE lead_id = $1
      `,
      [leadId]
    );

    return rows[0] ?? null;
  }
}

export const createDatabaseClient = ({
  databaseFile,
  databaseUrl,
  pgSsl,
}: DatabaseConfig): DatabaseClient => {
  if (normalize(databaseUrl)) {
    return new PostgresClient(databaseUrl, pgSsl);
  }

  return new SqliteClient(databaseFile);
};
