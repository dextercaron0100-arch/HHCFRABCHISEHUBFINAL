import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import fs from "node:fs";
import path from "node:path";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

dotenv.config();

const normalize = (value = "") => value.toString().trim();
const parseBoolean = (value, fallback = true) => {
  if (value === undefined || value === null || value === "") return fallback;
  return !["false", "0", "no", "off"].includes(normalize(value).toLowerCase());
};

const app = express();
const port = Number(process.env.PORT) || 5000;
const businessName = process.env.BUSINESS_NAME || "HHC Franchise Hub";
const timezone = process.env.TIMEZONE || "Asia/Manila";
const websiteUrl = process.env.BUSINESS_WEBSITE || "http://localhost:5173";
const responseTime = process.env.RESPONSE_TIME || "within 24 hours";
const autoReplyEnabled = parseBoolean(process.env.AUTO_REPLY_ENABLED, true);
const databaseFile = process.env.DATABASE_FILE || "./data/inquiries.db";
const adminApiKey = normalize(process.env.ADMIN_API_KEY);
const fromName = normalize(process.env.MAIL_FROM_NAME) || `${businessName} Website`;

const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173,http://127.0.0.1:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

let db;

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("CORS blocked: origin not allowed"));
    },
  })
);
app.use(express.json());

const escapeHtml = (value = "") =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const isValidEmail = (value = "") => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const makeLeadId = () => {
  const stamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `INQ-${stamp}-${random}`;
};

const formatSubmittedAt = (date = new Date()) =>
  new Intl.DateTimeFormat("en-PH", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: timezone,
  }).format(date);

const createTransporter = () => {
  const gmailUser = process.env.GMAIL_USER;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailAppPassword) {
    throw new Error("Email server is not configured. Missing Gmail credentials.");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: gmailUser,
      pass: gmailAppPassword,
    },
  });
};

const buildAdminInquiryEmail = ({ leadId, submittedAt, name, phone, email, comment, source }) => {
  const safeLeadId = escapeHtml(leadId);
  const safeSubmittedAt = escapeHtml(submittedAt);
  const safeName = escapeHtml(name);
  const safePhone = escapeHtml(phone);
  const safeEmail = escapeHtml(email || "N/A");
  const safeComment = escapeHtml(comment).replace(/\n/g, "<br/>");
  const safeSource = escapeHtml(source || "Website Form");

  const subject = `[${businessName}] New Franchise Inquiry - ${name}`;

  const html = `
    <div style="margin:0;padding:24px;background:#f2f5fb;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:720px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;">
        <tr>
          <td style="padding:20px 24px;background:linear-gradient(135deg,#172554,#1d4ed8);color:#ffffff;">
            <p style="margin:0;font-size:12px;letter-spacing:.08em;text-transform:uppercase;opacity:.9;">Website Lead Notification</p>
            <h1 style="margin:8px 0 0;font-size:22px;line-height:1.2;">${escapeHtml(businessName)} - New Franchise Inquiry</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:18px 24px;border-bottom:1px solid #e2e8f0;background:#f8fafc;">
            <p style="margin:0 0 6px;font-size:13px;color:#334155;"><strong>Lead ID:</strong> ${safeLeadId}</p>
            <p style="margin:0;font-size:13px;color:#334155;"><strong>Submitted:</strong> ${safeSubmittedAt}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 24px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
              <tr>
                <td style="padding:8px 0;width:140px;font-size:14px;color:#64748b;">Name</td>
                <td style="padding:8px 0;font-size:15px;color:#0f172a;"><strong>${safeName}</strong></td>
              </tr>
              <tr>
                <td style="padding:8px 0;width:140px;font-size:14px;color:#64748b;">Phone</td>
                <td style="padding:8px 0;font-size:15px;color:#0f172a;">${safePhone}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;width:140px;font-size:14px;color:#64748b;">Email</td>
                <td style="padding:8px 0;font-size:15px;color:#0f172a;">${safeEmail}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;width:140px;font-size:14px;color:#64748b;">Source</td>
                <td style="padding:8px 0;font-size:15px;color:#0f172a;">${safeSource}</td>
              </tr>
            </table>
            <div style="margin-top:16px;padding:14px;border:1px solid #dbeafe;background:#f8fbff;border-radius:10px;">
              <p style="margin:0 0 8px;font-size:13px;color:#334155;text-transform:uppercase;letter-spacing:.06em;"><strong>Comment</strong></p>
              <p style="margin:0;font-size:15px;line-height:1.6;color:#0f172a;">${safeComment}</p>
            </div>
          </td>
        </tr>
      </table>
    </div>
  `;

  const text = [
    `${businessName} - New Franchise Inquiry`,
    `Lead ID: ${leadId}`,
    `Submitted: ${submittedAt}`,
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Email: ${email || "N/A"}`,
    `Source: ${source || "Website Form"}`,
    "",
    "Comment:",
    comment,
  ].join("\n");

  return { subject, html, text };
};

const buildAutoReplyEmail = ({ leadId, name, submittedAt, comment, supportEmail }) => {
  const safeName = escapeHtml(name);
  const safeLeadId = escapeHtml(leadId);
  const safeSubmittedAt = escapeHtml(submittedAt);
  const safeComment = escapeHtml(comment).replace(/\n/g, "<br/>");
  const safeSupportEmail = escapeHtml(supportEmail);

  const subject = `[${businessName}] We received your inquiry (${leadId})`;
  const html = `
    <div style="margin:0;padding:24px;background:#f6f8fc;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;">
        <tr>
          <td style="padding:22px 24px;background:linear-gradient(135deg,#7c2d12,#ea580c);color:#ffffff;">
            <h1 style="margin:0;font-size:22px;line-height:1.3;">Thank you for your inquiry, ${safeName}</h1>
            <p style="margin:8px 0 0;font-size:14px;opacity:.92;">${escapeHtml(businessName)} has received your message.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 24px;">
            <p style="margin:0 0 12px;font-size:15px;line-height:1.7;color:#334155;">
              We appreciate your interest in our franchise opportunities. A team member will review your inquiry and contact you ${escapeHtml(responseTime)}.
            </p>
            <div style="padding:14px;border:1px solid #e2e8f0;background:#f8fafc;border-radius:10px;">
              <p style="margin:0 0 6px;font-size:13px;color:#64748b;"><strong>Reference ID:</strong> ${safeLeadId}</p>
              <p style="margin:0 0 6px;font-size:13px;color:#64748b;"><strong>Submitted:</strong> ${safeSubmittedAt}</p>
              <p style="margin:0;font-size:13px;color:#64748b;"><strong>Website:</strong> <a href="${escapeHtml(websiteUrl)}" style="color:#1d4ed8;text-decoration:none;">${escapeHtml(websiteUrl)}</a></p>
            </div>
            <div style="margin-top:16px;padding:14px;border:1px solid #fde68a;background:#fffbeb;border-radius:10px;">
              <p style="margin:0 0 8px;font-size:13px;color:#92400e;text-transform:uppercase;letter-spacing:.06em;"><strong>Your message</strong></p>
              <p style="margin:0;font-size:14px;line-height:1.6;color:#92400e;">${safeComment}</p>
            </div>
            <p style="margin:16px 0 0;font-size:13px;color:#64748b;">
              If you have additional details to share, reply to this email or contact us at
              <a href="mailto:${safeSupportEmail}" style="color:#1d4ed8;text-decoration:none;">${safeSupportEmail}</a>.
            </p>
          </td>
        </tr>
      </table>
    </div>
  `;

  const text = [
    `Thank you for your inquiry, ${name}.`,
    `${businessName} has received your message.`,
    `Reference ID: ${leadId}`,
    `Submitted: ${submittedAt}`,
    `Expected response: ${responseTime}`,
    `Website: ${websiteUrl}`,
    supportEmail ? `Support: ${supportEmail}` : "",
    "",
    "Your message:",
    comment,
  ]
    .filter(Boolean)
    .join("\n");

  return { subject, html, text };
};

const ensureDatabaseDirectory = (filename) => {
  const absolutePath = path.resolve(process.cwd(), filename);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  return absolutePath;
};

const initDatabase = async () => {
  const filePath = ensureDatabaseDirectory(databaseFile);
  const connection = await open({
    filename: filePath,
    driver: sqlite3.Database,
  });

  await connection.exec(`
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
  `);

  return connection;
};

const requireAdminKey = (req, res, next) => {
  if (!adminApiKey) {
    res.status(403).json({
      ok: false,
      message: "Admin endpoints disabled. Set ADMIN_API_KEY in backend/.env.",
    });
    return;
  }

  const providedKey = normalize(req.headers["x-admin-key"] || req.query.key);
  if (!providedKey || providedKey !== adminApiKey) {
    res.status(401).json({ ok: false, message: "Unauthorized" });
    return;
  }

  next();
};

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "hhfranchisehub-backend",
    database: Boolean(db),
    timestamp: new Date().toISOString(),
  });
});

app.post("/api/inquiry", async (req, res) => {
  try {
    const { name, phone, email, comment, message } = req.body || {};
    const normalizedName = normalize(name);
    const normalizedPhone = normalize(phone);
    const normalizedEmail = normalize(email);
    const normalizedComment = normalize(comment || message);

    if (!normalizedName || !normalizedPhone || !normalizedComment) {
      res.status(400).json({
        ok: false,
        message: "Name, phone, and comment are required.",
      });
      return;
    }

    const gmailUser = process.env.GMAIL_USER;
    const inquiryTo = process.env.INQUIRY_TO || gmailUser;
    const fromEmail = normalize(process.env.MAIL_FROM_EMAIL) || gmailUser;
    const supportEmail = normalize(process.env.SUPPORT_EMAIL) || inquiryTo;

    const leadId = makeLeadId();
    const submittedAt = formatSubmittedAt();
    const source = normalize(req.headers.origin || req.headers.referer || "Website Form");
    const now = new Date().toISOString();

    await db.run(
      `
        INSERT INTO inquiries (
          lead_id, name, phone, email, comment, source, status,
          admin_email_sent, auto_reply_sent, email_error, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, 'new', 0, 0, '', ?, ?)
      `,
      leadId,
      normalizedName,
      normalizedPhone,
      normalizedEmail || null,
      normalizedComment,
      source,
      now,
      now
    );

    const transporter = createTransporter();
    const adminEmail = buildAdminInquiryEmail({
      leadId,
      submittedAt,
      name: normalizedName,
      phone: normalizedPhone,
      email: normalizedEmail,
      comment: normalizedComment,
      source,
    });

    const adminMailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: inquiryTo,
      subject: adminEmail.subject,
      html: adminEmail.html,
      text: adminEmail.text,
    };

    if (isValidEmail(normalizedEmail)) {
      adminMailOptions.replyTo = normalizedEmail;
    }

    await transporter.sendMail(adminMailOptions);
    await db.run(
      `UPDATE inquiries SET admin_email_sent = 1, updated_at = ? WHERE lead_id = ?`,
      new Date().toISOString(),
      leadId
    );

    let autoReplySent = false;
    if (autoReplyEnabled && isValidEmail(normalizedEmail)) {
      const autoReply = buildAutoReplyEmail({
        leadId,
        name: normalizedName,
        submittedAt,
        comment: normalizedComment,
        supportEmail,
      });

      try {
        await transporter.sendMail({
          from: `"${fromName}" <${fromEmail}>`,
          to: normalizedEmail,
          subject: autoReply.subject,
          html: autoReply.html,
          text: autoReply.text,
          replyTo: supportEmail || fromEmail,
        });
        autoReplySent = true;
        await db.run(
          `UPDATE inquiries SET auto_reply_sent = 1, updated_at = ? WHERE lead_id = ?`,
          new Date().toISOString(),
          leadId
        );
      } catch (autoReplyError) {
        console.error("Auto-reply email error:", autoReplyError);
        await db.run(
          `UPDATE inquiries SET email_error = ?, updated_at = ? WHERE lead_id = ?`,
          `Auto-reply failed: ${autoReplyError.message}`,
          new Date().toISOString(),
          leadId
        );
      }
    }

    res.json({ ok: true, message: "Inquiry sent successfully!", leadId, autoReplySent });
  } catch (error) {
    console.error("Email send error:", error);
    res.status(500).json({ ok: false, message: "Failed to send inquiry." });
  }
});

app.get("/api/inquiries", requireAdminKey, async (req, res) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);
    const status = normalize(req.query.status);

    let query = `
      SELECT lead_id, name, phone, email, source, status, notes,
             admin_email_sent, auto_reply_sent, email_error, created_at, updated_at
      FROM inquiries
    `;
    const params = [];

    if (status) {
      query += ` WHERE status = ?`;
      params.push(status);
    }

    query += ` ORDER BY datetime(created_at) DESC LIMIT ?`;
    params.push(limit);

    const inquiries = await db.all(query, params);
    res.json({ ok: true, count: inquiries.length, inquiries });
  } catch (error) {
    console.error("Failed to fetch inquiries:", error);
    res.status(500).json({ ok: false, message: "Failed to fetch inquiries." });
  }
});

app.patch("/api/inquiries/:leadId/status", requireAdminKey, async (req, res) => {
  try {
    const leadId = normalize(req.params.leadId);
    const status = normalize(req.body?.status).toLowerCase();
    const note = normalize(req.body?.note);
    const allowedStatuses = new Set(["new", "contacted", "qualified", "closed", "spam"]);

    if (!leadId) {
      res.status(400).json({ ok: false, message: "leadId is required." });
      return;
    }
    if (!allowedStatuses.has(status)) {
      res.status(400).json({
        ok: false,
        message: "Invalid status. Use: new, contacted, qualified, closed, or spam.",
      });
      return;
    }

    const existing = await db.get(`SELECT notes FROM inquiries WHERE lead_id = ?`, leadId);
    if (!existing) {
      res.status(404).json({ ok: false, message: "Lead not found." });
      return;
    }

    let updatedNotes = existing.notes || "";
    if (note) {
      const nowLabel = formatSubmittedAt(new Date());
      const line = `[${nowLabel}] ${note}`;
      updatedNotes = updatedNotes ? `${updatedNotes}\n${line}` : line;
    }

    await db.run(
      `UPDATE inquiries SET status = ?, notes = ?, updated_at = ? WHERE lead_id = ?`,
      status,
      updatedNotes,
      new Date().toISOString(),
      leadId
    );

    const updated = await db.get(
      `
        SELECT lead_id, name, phone, email, source, status, notes,
               admin_email_sent, auto_reply_sent, email_error, created_at, updated_at
        FROM inquiries
        WHERE lead_id = ?
      `,
      leadId
    );

    res.json({ ok: true, inquiry: updated });
  } catch (error) {
    console.error("Failed to update inquiry:", error);
    res.status(500).json({ ok: false, message: "Failed to update inquiry." });
  }
});

const startServer = async () => {
  db = await initDatabase();
  app.listen(port, () => {
    console.log(`Backend running on http://localhost:${port}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start backend:", error);
  process.exit(1);
});
