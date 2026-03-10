import cors from "cors";
import dotenv from "dotenv";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import nodemailer, { type Transporter } from "nodemailer";
import { Resend } from "resend";
import {
  createDatabaseClient,
  type InquiryRecord,
  type InquiryStatus,
} from "./database.js";

dotenv.config();

interface MailerConfigBase {
  fromEmail: string;
  inquiryTo: string;
  provider: "gmail" | "resend";
  supportEmail: string;
}

interface GmailMailerConfig extends MailerConfigBase {
  gmailAppPassword: string;
  gmailUser: string;
  provider: "gmail";
}

interface ResendMailerConfig extends MailerConfigBase {
  provider: "resend";
  resendApiKey: string;
}

type MailerConfig = GmailMailerConfig | ResendMailerConfig;

interface EmailPayload {
  html: string;
  subject: string;
  text: string;
}

interface OutboundEmail {
  html: string;
  replyTo?: string;
  subject: string;
  text: string;
  to: string;
}

interface AdminInquiryEmailInput {
  budget: string;
  comment: string;
  email: string;
  experience: string;
  franchiseInterest: string;
  leadId: string;
  location: string;
  name: string;
  phone: string;
  source: string;
  submittedAt: string;
}

interface AutoReplyEmailInput {
  comment: string;
  leadId: string;
  name: string;
  submittedAt: string;
  supportEmail: string;
}

interface InquiryRequestBody {
  budget?: unknown;
  comment?: unknown;
  email?: unknown;
  experience?: unknown;
  franchise_interest?: unknown;
  location?: unknown;
  message?: unknown;
  name?: unknown;
  phone?: unknown;
  source?: unknown;
}

interface InquiryStatusUpdateBody {
  note?: unknown;
  status?: unknown;
}

const allowedStatuses = new Set<InquiryStatus>([
  "new",
  "contacted",
  "qualified",
  "closed",
  "spam",
]);

const normalize = (value: unknown = ""): string => String(value ?? "").trim();

const parseBoolean = (value: unknown, fallback = true): boolean => {
  if (value === undefined || value === null || value === "") return fallback;
  return !["false", "0", "no", "off"].includes(normalize(value).toLowerCase());
};

const isInquiryStatus = (value: string): value is InquiryStatus =>
  allowedStatuses.has(value as InquiryStatus);

const toErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : "Unknown error";

const app = express();
const port = Number(process.env.PORT) || 5000;
const businessName = process.env.BUSINESS_NAME || "HHC Franchise Hub";
const timezone = process.env.TIMEZONE || "Asia/Manila";
const websiteUrl = process.env.BUSINESS_WEBSITE || "http://localhost:5173";
const responseTime = process.env.RESPONSE_TIME || "within 24 hours";
const autoReplyEnabled = parseBoolean(process.env.AUTO_REPLY_ENABLED, true);
const emailTimeoutMs = Math.max(Number(process.env.EMAIL_TIMEOUT_MS) || 15000, 1000);
const databaseFile = process.env.DATABASE_FILE || "./data/inquiries.db";
const databaseUrl = normalize(process.env.DATABASE_URL);
const pgSsl = parseBoolean(process.env.PGSSL, true);
const adminApiKey = normalize(process.env.ADMIN_API_KEY);
const fromName = normalize(process.env.MAIL_FROM_NAME) || `${businessName} Website`;

const allowedOrigins = (
  process.env.CLIENT_ORIGIN || "http://localhost:5173,http://127.0.0.1:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const database = createDatabaseClient({
  databaseFile,
  databaseUrl,
  pgSsl,
});

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

const escapeHtml = (value: string = ""): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const isValidEmail = (value: string = ""): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const formatFromAddress = (name: string, email: string): string =>
  `"${name.replaceAll('"', '\\"')}" <${email}>`;

const normalizeForCompare = (value: string = ""): string =>
  value.replace(/\s+/g, " ").trim().toLowerCase();

const toTelHref = (value: string = ""): string => {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const hasLeadingPlus = trimmed.startsWith("+");
  const digitsOnly = trimmed.replace(/\D/g, "");
  if (!digitsOnly) return "";

  return `tel:${hasLeadingPlus ? `+${digitsOnly}` : digitsOnly}`;
};

const parseStructuredComment = (
  comment: string
): { details: Array<{ label: string; value: string }>; notes: string[] } => {
  const lines = comment
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.reduce(
    (sections, line) => {
      const match = line.match(/^([A-Za-z][A-Za-z0-9/&() \-]{1,50}):\s*(.+)$/);
      if (match) {
        sections.details.push({
          label: match[1].trim(),
          value: match[2].trim(),
        });
      } else {
        sections.notes.push(line);
      }

      return sections;
    },
    { details: [] as Array<{ label: string; value: string }>, notes: [] as string[] }
  );
};

const withTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number,
  label: string
): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error(`${label} timed out after ${timeoutMs}ms`));
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
};

const makeLeadId = (): string => {
  const stamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `INQ-${stamp}-${random}`;
};

const formatSubmittedAt = (date: Date = new Date()): string =>
  new Intl.DateTimeFormat("en-PH", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: timezone,
  }).format(date);

const getConfiguredEmailProvider = (): MailerConfig["provider"] | "none" => {
  if (normalize(process.env.RESEND_API_KEY)) return "resend";
  if (
    normalize(process.env.GMAIL_USER) &&
    normalize(process.env.GMAIL_APP_PASSWORD)
  ) {
    return "gmail";
  }
  return "none";
};

const getMailerConfig = (): MailerConfig => {
  const resendApiKey = normalize(process.env.RESEND_API_KEY);
  const gmailUser = normalize(process.env.GMAIL_USER);
  const gmailAppPassword = normalize(process.env.GMAIL_APP_PASSWORD);
  const configuredFromEmail = normalize(process.env.MAIL_FROM_EMAIL);
  const defaultRecipient = configuredFromEmail || gmailUser;
  const inquiryTo = normalize(process.env.INQUIRY_TO) || defaultRecipient;
  const supportEmail = normalize(process.env.SUPPORT_EMAIL) || inquiryTo;

  if (resendApiKey) {
    if (!configuredFromEmail) {
      throw new Error(
        "MAIL_FROM_EMAIL is required when RESEND_API_KEY is configured."
      );
    }

    return {
      provider: "resend",
      resendApiKey,
      inquiryTo: inquiryTo || configuredFromEmail,
      fromEmail: configuredFromEmail,
      supportEmail: supportEmail || configuredFromEmail,
    };
  }

  if (!gmailUser || !gmailAppPassword) {
    throw new Error(
      "Email server is not configured. Set RESEND_API_KEY for Railway or Gmail credentials for local SMTP."
    );
  }

  const resolvedInquiryTo = inquiryTo || gmailUser;

  return {
    provider: "gmail",
    gmailUser,
    gmailAppPassword,
    inquiryTo: resolvedInquiryTo,
    fromEmail: configuredFromEmail || gmailUser,
    supportEmail: supportEmail || resolvedInquiryTo,
  };
};

const createEmailClient = (config: MailerConfig) => {
  if (config.provider === "resend") {
    const resend = new Resend(config.resendApiKey);

    return {
      async send(message: OutboundEmail): Promise<void> {
        const { error } = await resend.emails.send({
          from: formatFromAddress(fromName, config.fromEmail),
          to: [message.to],
          subject: message.subject,
          html: message.html,
          text: message.text,
          ...(message.replyTo ? { replyTo: message.replyTo } : {}),
        });

        if (error) {
          throw new Error(`Resend API error: ${error.message}`);
        }
      },
    };
  }

  const transporter: Transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: config.gmailUser,
      pass: config.gmailAppPassword,
    },
  });

  return {
    async send(message: OutboundEmail): Promise<void> {
      await transporter.sendMail({
        from: formatFromAddress(fromName, config.fromEmail),
        to: message.to,
        subject: message.subject,
        html: message.html,
        text: message.text,
        ...(message.replyTo ? { replyTo: message.replyTo } : {}),
      });
    },
  };
};

const buildAdminInquiryEmail = ({
  leadId,
  submittedAt,
  name,
  phone,
  email,
  comment,
  source,
  franchiseInterest,
  location,
  experience,
  budget,
}: AdminInquiryEmailInput): EmailPayload => {
  const safeLeadId = escapeHtml(leadId);
  const safeSubmittedAt = escapeHtml(submittedAt);
  const safeName = escapeHtml(name);
  const safePhone = escapeHtml(phone);
  const safeEmail = escapeHtml(email || "N/A");
  const safeSource = escapeHtml(source || "Website Form");
  const safeFranchiseInterest = escapeHtml(franchiseInterest);
  const safeLocation = escapeHtml(location);
  const safeExperience = escapeHtml(experience);
  const safeBudget = escapeHtml(budget);
  const { details: parsedCommentDetails, notes: parsedCommentNotes } =
    parseStructuredComment(comment);
  const normalizedBudget = normalizeForCompare(budget);
  const normalizedExperience = normalizeForCompare(experience);
  const normalizedFranchiseInterest = normalizeForCompare(franchiseInterest);
  const normalizedLocation = normalizeForCompare(location);
  const consultationDetails = parsedCommentDetails.filter(({ label, value }) => {
    const normalizedLabel = normalizeForCompare(label);
    const normalizedValue = normalizeForCompare(value);

    if (
      normalizedBudget &&
      normalizedLabel.includes("budget") &&
      normalizedValue === normalizedBudget
    ) {
      return false;
    }

    if (
      normalizedFranchiseInterest &&
      (normalizedLabel.includes("franchise") ||
        normalizedLabel.includes("package")) &&
      normalizedValue === normalizedFranchiseInterest
    ) {
      return false;
    }

    if (
      normalizedExperience &&
      (normalizedLabel.includes("current work") ||
        normalizedLabel.includes("business experience") ||
        normalizedLabel === "experience") &&
      normalizedValue === normalizedExperience
    ) {
      return false;
    }

    if (
      normalizedLocation &&
      normalizedLabel.includes("location") &&
      normalizedValue === normalizedLocation
    ) {
      return false;
    }

    return true;
  });
  const noteLines =
    parsedCommentNotes.length > 0
      ? parsedCommentNotes
      : consultationDetails.length === 0
        ? [comment]
        : [];
  const consultationDetailRows = consultationDetails
    .map(
      ({ label, value }) => `
                  <tr>
                    <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;width:220px;font-size:13px;font-weight:700;color:#1e3a8a;background:#f8fafc;">${escapeHtml(
                      label
                    )}</td>
                    <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-size:14px;line-height:1.6;color:#0f172a;">${escapeHtml(
                      value
                    )}</td>
                  </tr>`
    )
    .join("");
  const noteMarkup = noteLines
    .map(
      (line) => `
                <li style="margin:0 0 8px;line-height:1.7;">${escapeHtml(line)}</li>`
    )
    .join("");
  const actionLinks = [
    isValidEmail(email)
      ? `<a href="mailto:${escapeHtml(
          email
        )}" style="display:inline-block;padding:10px 14px;border-radius:999px;background:#dbeafe;color:#1d4ed8;text-decoration:none;font-size:13px;font-weight:700;">Reply via Email</a>`
      : "",
    toTelHref(phone)
      ? `<a href="${escapeHtml(
          toTelHref(phone)
        )}" style="display:inline-block;padding:10px 14px;border-radius:999px;background:#eff6ff;color:#0f172a;text-decoration:none;font-size:13px;font-weight:700;border:1px solid #bfdbfe;">Call Lead</a>`
      : "",
  ]
    .filter(Boolean)
    .join("&nbsp;");
  const leadDetailRows = [
    franchiseInterest
      ? `
              <tr>
                <td style="padding:8px 0;width:140px;font-size:14px;color:#64748b;">Franchise</td>
                <td style="padding:8px 0;font-size:15px;color:#0f172a;">${safeFranchiseInterest}</td>
              </tr>`
      : "",
    location
      ? `
              <tr>
                <td style="padding:8px 0;width:140px;font-size:14px;color:#64748b;">Location</td>
                <td style="padding:8px 0;font-size:15px;color:#0f172a;">${safeLocation}</td>
              </tr>`
      : "",
    experience
      ? `
              <tr>
                <td style="padding:8px 0;width:140px;font-size:14px;color:#64748b;">Experience</td>
                <td style="padding:8px 0;font-size:15px;color:#0f172a;">${safeExperience}</td>
              </tr>`
      : "",
    budget
      ? `
              <tr>
                <td style="padding:8px 0;width:140px;font-size:14px;color:#64748b;">Budget</td>
                <td style="padding:8px 0;font-size:15px;color:#0f172a;">${safeBudget}</td>
              </tr>`
      : "",
  ]
    .filter(Boolean)
    .join("");

  const subject = `[${businessName}] New Franchise Inquiry - ${name}`;

  const html = `
    <div style="margin:0;padding:24px;background:#f2f5fb;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:720px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;">
        <tr>
          <td style="padding:22px 24px;background:linear-gradient(135deg,#172554,#1d4ed8);color:#ffffff;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
              <tr>
                <td style="vertical-align:top;">
                  <p style="margin:0;font-size:12px;letter-spacing:.08em;text-transform:uppercase;opacity:.9;">Website Lead Notification</p>
                  <h1 style="margin:8px 0 0;font-size:24px;line-height:1.2;">${escapeHtml(
                    businessName
                  )} - New Franchise Inquiry</h1>
                </td>
                <td style="vertical-align:top;text-align:right;">
                  <span style="display:inline-block;padding:8px 12px;border-radius:999px;background:rgba(255,255,255,.14);font-size:12px;line-height:1.4;font-weight:700;">${safeSource}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:18px 24px;border-bottom:1px solid #e2e8f0;background:#f8fafc;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
              <tr>
                <td style="vertical-align:top;">
                  <p style="margin:0 0 6px;font-size:13px;color:#334155;"><strong>Lead ID:</strong> ${safeLeadId}</p>
                  <p style="margin:0;font-size:13px;color:#334155;"><strong>Submitted:</strong> ${safeSubmittedAt}</p>
                </td>
                <td style="vertical-align:top;text-align:right;">${actionLinks}</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 24px;">
            <div style="margin-bottom:18px;padding:16px;border:1px solid #dbeafe;background:#f8fbff;border-radius:12px;">
              <p style="margin:0 0 12px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#1d4ed8;font-weight:700;">Lead Summary</p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                <tr>
                  <td style="padding:0 0 10px;width:140px;font-size:14px;color:#64748b;">Name</td>
                  <td style="padding:0 0 10px;font-size:16px;color:#0f172a;"><strong>${safeName}</strong></td>
                </tr>
                <tr>
                  <td style="padding:8px 0;width:140px;font-size:14px;color:#64748b;">Phone</td>
                  <td style="padding:8px 0;font-size:15px;color:#0f172a;">${safePhone}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;width:140px;font-size:14px;color:#64748b;">Email</td>
                  <td style="padding:8px 0;font-size:15px;color:#0f172a;">${safeEmail}</td>
                </tr>
              </table>
            </div>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
              <tr>
                <td colspan="2" style="padding:0 0 10px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#1d4ed8;font-weight:700;">Franchise Fit</td>
              </tr>
              ${leadDetailRows}
            </table>
            ${
              consultationDetailRows
                ? `
            <div style="margin-top:18px;padding:16px;border:1px solid #e2e8f0;background:#ffffff;border-radius:12px;">
              <p style="margin:0 0 12px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#1d4ed8;font-weight:700;">Consultation Answers</p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;">
                ${consultationDetailRows}
              </table>
            </div>`
                : ""
            }
            ${
              noteMarkup
                ? `
            <div style="margin-top:18px;padding:16px;border:1px solid #dbeafe;background:#f8fbff;border-radius:12px;">
              <p style="margin:0 0 10px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#1d4ed8;font-weight:700;">Lead Note</p>
              <ul style="margin:0;padding-left:18px;font-size:15px;color:#0f172a;">${noteMarkup}</ul>
            </div>`
                : ""
            }
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
    franchiseInterest ? `Franchise: ${franchiseInterest}` : "",
    location ? `Location: ${location}` : "",
    experience ? `Experience: ${experience}` : "",
    budget ? `Budget: ${budget}` : "",
    "",
    consultationDetails.length > 0 ? "Consultation Answers:" : "",
    ...consultationDetails.map(({ label, value }) => `${label}: ${value}`),
    "",
    noteLines.length > 0 ? "Lead Note:" : "",
    ...noteLines,
  ]
    .filter(Boolean)
    .join("\n");

  return { subject, html, text };
};

const buildAutoReplyEmail = ({
  leadId,
  name,
  submittedAt,
  comment,
  supportEmail,
}: AutoReplyEmailInput): EmailPayload => {
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

const requireAdminKey = (req: Request, res: Response, next: NextFunction): void => {
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

const buildHealthPayload = () => ({
  ok: true,
  service: "hhfranchisehub-backend",
  database: database.isReady(),
  databaseType: database.kind,
  emailProvider: getConfiguredEmailProvider(),
  timestamp: new Date().toISOString(),
});

app.get("/", (_req, res) => {
  res.json({
    ...buildHealthPayload(),
    message: "Backend is running.",
  });
});

app.get("/health", (_req, res) => {
  res.json(buildHealthPayload());
});

app.get("/api/health", (_req, res) => {
  res.json(buildHealthPayload());
});

app.post(
  "/api/inquiry",
  async (req: Request<object, object, InquiryRequestBody>, res: Response) => {
    try {
      const {
        name,
        phone,
        email,
        comment,
        message,
        franchise_interest,
        location,
        experience,
        budget,
        source,
      } = req.body || {};
      const normalizedName = normalize(name);
      const normalizedPhone = normalize(phone);
      const normalizedEmail = normalize(email);
      const normalizedFranchiseInterest = normalize(franchise_interest);
      const normalizedLocation = normalize(location);
      const normalizedExperience = normalize(experience);
      const normalizedBudget = normalize(budget);
      const normalizedMessage = normalize(comment || message);
      const normalizedComment = [
        normalizedMessage,
        normalizedFranchiseInterest
          ? `Franchise interest: ${normalizedFranchiseInterest}`
          : "",
        normalizedLocation ? `Preferred location: ${normalizedLocation}` : "",
        normalizedExperience
          ? `Business experience: ${normalizedExperience}`
          : "",
        normalizedBudget ? `Budget range: ${normalizedBudget}` : "",
      ]
        .filter(Boolean)
        .join("\n");

      if (!normalizedName || !normalizedPhone || !normalizedComment) {
        res.status(400).json({
          ok: false,
          message: "Name, phone, and comment are required.",
        });
        return;
      }

      const mailerConfig = getMailerConfig();
      const leadId = makeLeadId();
      const submittedAt = formatSubmittedAt();
      const normalizedSource =
        normalize(source) ||
        normalize(req.headers.origin || req.headers.referer || "Website Form");
      const now = new Date().toISOString();

      await database.createInquiry({
        leadId,
        name: normalizedName,
        phone: normalizedPhone,
        email: normalizedEmail || null,
        comment: normalizedComment,
        source: normalizedSource,
        now,
      });

      const emailClient = createEmailClient(mailerConfig);
      const adminEmail = buildAdminInquiryEmail({
        leadId,
        submittedAt,
        name: normalizedName,
        phone: normalizedPhone,
        email: normalizedEmail,
        comment: normalizedComment,
        source: normalizedSource,
        franchiseInterest: normalizedFranchiseInterest,
        location: normalizedLocation,
        experience: normalizedExperience,
        budget: normalizedBudget,
      });

      const adminMail: OutboundEmail = {
        to: mailerConfig.inquiryTo,
        subject: adminEmail.subject,
        html: adminEmail.html,
        text: adminEmail.text,
      };

      if (isValidEmail(normalizedEmail)) {
        adminMail.replyTo = normalizedEmail;
      }

      let adminEmailSent = false;
      let autoReplySent = false;
      const emailErrors: string[] = [];

      try {
        await withTimeout(emailClient.send(adminMail), emailTimeoutMs, "Admin email");
        adminEmailSent = true;
        await database.markAdminEmailSent(leadId, new Date().toISOString());
      } catch (adminEmailError) {
        console.error("Admin email error:", adminEmailError);
        emailErrors.push(`Admin email failed: ${toErrorMessage(adminEmailError)}`);
      }

      if (autoReplyEnabled && isValidEmail(normalizedEmail)) {
        const autoReply = buildAutoReplyEmail({
          leadId,
          name: normalizedName,
          submittedAt,
          comment: normalizedComment,
          supportEmail: mailerConfig.supportEmail,
        });

        try {
          await withTimeout(
            emailClient.send({
              to: normalizedEmail,
              subject: autoReply.subject,
              html: autoReply.html,
              text: autoReply.text,
              replyTo: mailerConfig.supportEmail || mailerConfig.fromEmail,
            }),
            emailTimeoutMs,
            "Auto-reply email"
          );
          autoReplySent = true;
          await database.markAutoReplySent(leadId, new Date().toISOString());
        } catch (autoReplyError) {
          console.error("Auto-reply email error:", autoReplyError);
          emailErrors.push(`Auto-reply failed: ${toErrorMessage(autoReplyError)}`);
        }
      }

      if (emailErrors.length > 0) {
        await database.setEmailError(leadId, emailErrors.join(" | "), new Date().toISOString());
      }

      res.json({
        ok: true,
        message: adminEmailSent
          ? "Inquiry sent successfully!"
          : "Inquiry received successfully!",
        leadId,
        autoReplySent,
        adminEmailSent,
      });
    } catch (error) {
      console.error("Email send error:", error);
      res.status(500).json({ ok: false, message: "Failed to send inquiry." });
    }
  }
);

app.get("/api/inquiries", requireAdminKey, async (req: Request, res: Response) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);
    const status = normalize(req.query.status);
    const inquiries = await database.listInquiries(limit, status || undefined);
    res.json({ ok: true, count: inquiries.length, inquiries });
  } catch (error) {
    console.error("Failed to fetch inquiries:", error);
    res.status(500).json({ ok: false, message: "Failed to fetch inquiries." });
  }
});

app.patch(
  "/api/inquiries/:leadId/status",
  requireAdminKey,
  async (
    req: Request<{ leadId: string }, object, InquiryStatusUpdateBody>,
    res: Response
  ) => {
    try {
      const leadId = normalize(req.params.leadId);
      const status = normalize(req.body?.status).toLowerCase();
      const note = normalize(req.body?.note);

      if (!leadId) {
        res.status(400).json({ ok: false, message: "leadId is required." });
        return;
      }
      if (!isInquiryStatus(status)) {
        res.status(400).json({
          ok: false,
          message: "Invalid status. Use: new, contacted, qualified, closed, or spam.",
        });
        return;
      }

      const existingNotes = await database.getInquiryNotes(leadId);
      if (existingNotes === null) {
        res.status(404).json({ ok: false, message: "Lead not found." });
        return;
      }

      let updatedNotes = existingNotes || "";
      if (note) {
        const nowLabel = formatSubmittedAt(new Date());
        const line = `[${nowLabel}] ${note}`;
        updatedNotes = updatedNotes ? `${updatedNotes}\n${line}` : line;
      }

      await database.updateInquiryStatus(
        leadId,
        status,
        updatedNotes,
        new Date().toISOString()
      );

      const updated = await database.getInquiryByLeadId(leadId);

      res.json({ ok: true, inquiry: updated });
    } catch (error) {
      console.error("Failed to update inquiry:", error);
      res.status(500).json({ ok: false, message: "Failed to update inquiry." });
    }
  }
);

const startServer = async (): Promise<void> => {
  await database.init();
  app.listen(port, "0.0.0.0", () => {
    console.log(`Backend running on port ${port}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start backend:", error);
  process.exit(1);
});
