/**
 * Live Chat Backend — AI Bot + Live Agent Handoff
 * Stack: Express · Socket.IO · Anthropic SDK · JWT · Helmet
 */

require("dotenv").config();
const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const xss = require("xss");
const Anthropic = require("@anthropic-ai/sdk");
const {
  BRAND_CATALOG,
  HISTORY_TIMELINE,
  WEBSITE_PROFILE,
} = require("./knowledge-base");

// ─────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────
function parseList(value = "") {
  return String(value || "")
    .split(",")
    .map(item => item.trim())
    .filter(Boolean);
}

function normalizeHost(value = "") {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return "";

  try {
    const input = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`;
    return new URL(input).hostname;
  } catch {
    return raw
      .replace(/^[a-z][a-z0-9+.-]*:\/\//i, "")
      .replace(/\/.*$/, "")
      .replace(/:\d+$/, "");
  }
}

const PORT        = process.env.PORT        || 3000;
const HOST        = process.env.HOST        || '0.0.0.0';
const JWT_SECRET  = process.env.JWT_SECRET  || "change-me-in-production-secret";
const ALLOWED_ORIGINS = parseList(
  process.env.ALLOWED_ORIGINS || "http://localhost,http://127.0.0.1"
);
const ADMIN_DASHBOARD_HOSTS = parseList(process.env.ADMIN_DASHBOARD_HOSTS)
  .map(normalizeHost)
  .filter(Boolean);
const BUSINESS_NAME = (
  process.env.BUSINESS_NAME ||
  WEBSITE_PROFILE.businessName ||
  "HHC Franchise Hub"
).trim();
const BUSINESS_CONTEXT = (
  process.env.BUSINESS_CONTEXT ||
  `${WEBSITE_PROFILE.description} ${WEBSITE_PROFILE.mission}`
).trim();
const SUPPORT_EMAIL = (
  process.env.SUPPORT_EMAIL ||
  WEBSITE_PROFILE.emails?.[0] ||
  ""
).trim();
const SUPPORT_PHONE = (
  process.env.SUPPORT_PHONE ||
  WEBSITE_PROFILE.phones?.[0] ||
  ""
).trim();
const BUSINESS_HOURS = (
  process.env.BUSINESS_HOURS ||
  WEBSITE_PROFILE.hours ||
  ""
).trim();
const ANTHROPIC_API_KEY = (process.env.ANTHROPIC_API_KEY || "").trim();
const configuredBotMode = resolveBotMode(process.env.BOT_MODE);
const BOT_MODE = configuredBotMode || (ANTHROPIC_API_KEY ? "hybrid" : "keyword");

function resolveBotMode(value = "") {
  const mode = String(value || "").trim().toLowerCase();
  if (["keyword", "hybrid", "anthropic"].includes(mode)) return mode;
  return "";
}

function isLocalDevOrigin(origin = "") {
  return (
    /^https?:\/\/localhost(?::\d+)?$/i.test(origin) ||
    /^https?:\/\/127\.0\.0\.1(?::\d+)?$/i.test(origin) ||
    /^https?:\/\/\[::1\](?::\d+)?$/i.test(origin) ||
    /^https?:\/\/.+\.local(?::\d+)?$/i.test(origin) ||
    /^https?:\/\/10(?:\.\d{1,3}){3}(?::\d+)?$/i.test(origin) ||
    /^https?:\/\/192\.168(?:\.\d{1,3}){2}(?::\d+)?$/i.test(origin) ||
    /^https?:\/\/172\.(1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2}(?::\d+)?$/i.test(origin)
  );
}

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (isLocalDevOrigin(origin)) return true;
  const originHost = normalizeHost(origin);
  if (originHost && ADMIN_DASHBOARD_HOSTS.includes(originHost)) return true;
  return ALLOWED_ORIGINS.some(o => {
    const allowed = String(o || "").trim();
    return allowed && origin.startsWith(allowed);
  });
}

// Agent credentials — replace / move to DB in production
const AGENTS = [
  { id: "agent_1", username: "admin",  password: "admin123",  name: "Admin Agent"  },
  { id: "agent_2", username: "agent1", password: "agent123",  name: "Support Agent" },
];

// Anthropic client
const anthropic = ANTHROPIC_API_KEY && BOT_MODE !== "keyword"
  ? new Anthropic({ apiKey: ANTHROPIC_API_KEY })
  : null;

// ─────────────────────────────────────────────
// IN-MEMORY STATE  (swap for Redis in prod)
// ─────────────────────────────────────────────
const sessions   = new Map();   // sessionId → SessionData
const agentSockets = new Map(); // agentId → socketId
const ipFlood    = new Map();   // ip → { count, resetAt }
const blockedIPs = new Set();

// ─────────────────────────────────────────────
// SESSION HELPERS
// ─────────────────────────────────────────────
function createSession(visitorName, visitorEmail, topic) {
  const id = uuidv4();
  const session = {
    id,
    visitorName:  xss(visitorName  || "Visitor"),
    visitorEmail: xss(visitorEmail || ""),
    topic:        xss(topic        || "General Inquiry"),
    messages:     [],      // { role, content, ts }
    status:       "bot",   // "bot" | "queued" | "active" | "closed"
    assignedAgent: null,
    createdAt:    Date.now(),
    updatedAt:    Date.now(),
    visitorSocket: null,
    agentSocket:   null,
  };
  sessions.set(id, session);
  return session;
}

function pushMessage(session, role, content) {
  const msg = { role, content: xss(content), ts: Date.now() };
  session.messages.push(msg);
  session.updatedAt = Date.now();
  return msg;
}

// ─────────────────────────────────────────────
// AI BOT
// ─────────────────────────────────────────────
const HANDOFF_TO_AGENT = "HANDOFF_TO_AGENT";
const BOT_CAPABILITIES =
  "website FAQs, brand details, franchise packages, contact details, history, and live-agent handoff";
const KEYWORD_FALLBACK_TOKEN = "__KEYWORD_FALLBACK__";
const SYSTEM_PROMPT = `You are a helpful, friendly customer support assistant for ${BUSINESS_NAME}.
Your role:
- Answer visitor inquiries warmly and accurately.
- If a visitor explicitly asks to speak to a human / live agent, respond with exactly: ${HANDOFF_TO_AGENT}
- If the inquiry is too complex or sensitive (complaints, legal, billing disputes), respond with exactly: ${HANDOFF_TO_AGENT}
- Keep answers concise (2-4 sentences max) unless detail is truly needed.
- Be professional but approachable.
- Do NOT reveal that you are built on any specific AI platform.

Business context: ${BUSINESS_CONTEXT}`;

function escapeRegExp(value = "") {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeText(value = "") {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function containsAny(text, terms = []) {
  return terms.some((term) => {
    const normalizedTerm = normalizeText(term);
    if (!normalizedTerm) return false;

    if (normalizedTerm.includes(" ")) {
      return text.includes(normalizedTerm);
    }

    return new RegExp(`\\b${escapeRegExp(normalizedTerm)}\\b`, "i").test(text);
  });
}

function formatList(items = []) {
  const filtered = items.filter(Boolean);
  if (filtered.length === 0) return "";
  if (filtered.length === 1) return filtered[0];
  if (filtered.length === 2) return `${filtered[0]} and ${filtered[1]}`;
  return `${filtered.slice(0, -1).join(", ")}, and ${filtered.at(-1)}`;
}

function formatBrandGroups() {
  return Object.entries(WEBSITE_PROFILE.brandsByCategory || {})
    .map(([category, brands]) => `${category}: ${brands.join(", ")}`)
    .join(" | ");
}

function detectBrandId(text) {
  return (
    Object.entries(BRAND_CATALOG).find(([, brand]) => containsAny(text, brand.aliases || []))?.[0] ||
    ""
  );
}

function detectBrandIntent(text) {
  if (
    containsAny(text, [
      "franchise fee",
      "fee",
      "royalty",
      "capital",
      "investment",
      "cost",
      "price",
      "pricing",
      "total package",
      "total capital",
    ])
  ) {
    return "investment";
  }

  if (
    containsAny(text, [
      "package",
      "packages",
      "format",
      "option",
      "options",
      "food cart",
      "bike cart",
      "kiosk",
      "reseller",
    ])
  ) {
    return "packages";
  }

  if (
    containsAny(text, [
      "support",
      "training",
      "launch",
      "marketing",
      "setup",
      "assistance",
      "manual",
      "operations guide",
    ])
  ) {
    return "support";
  }

  if (
    containsAny(text, [
      "pos",
      "point of sale",
      "inventory",
      "sales report",
      "pharmacist",
      "fda",
      "license",
      "licensed",
      "compliance",
      "experience needed",
      "prior business experience",
      "experience required",
    ])
  ) {
    return "operations";
  }

  if (
    containsAny(text, [
      "branch",
      "branches",
      "store locations",
      "locations",
      "territory",
      "coverage",
      "where",
    ])
  ) {
    return "branches";
  }

  if (
    containsAny(text, [
      "apply",
      "application",
      "become partner",
      "partner",
      "contact",
      "call",
      "inquiry",
    ])
  ) {
    return "apply";
  }

  return "overview";
}

function detectWebsiteIntent(text) {
  if (
    containsAny(text, [
      "brand",
      "brands",
      "franchise list",
      "what franchises",
      "what brands",
      "available franchises",
      "available brands",
    ])
  ) {
    return "brands";
  }

  if (containsAny(text, ["history", "started", "founded", "timeline", "journey", "milestone"])) {
    return "history";
  }

  if (containsAny(text, ["award", "awards", "recognition", "legacy icon"])) {
    return "awards";
  }

  if (containsAny(text, ["hours", "open time", "business hours", "office hours"])) {
    return "hours";
  }

  if (containsAny(text, ["office", "address", "located", "where are you"])) {
    return "office";
  }

  if (
    containsAny(text, [
      "contact",
      "email",
      "phone",
      "call",
      "viber",
      "whatsapp",
      "reach",
    ])
  ) {
    return "contact";
  }

  if (
    containsAny(text, [
      "service",
      "services",
      "training",
      "marketing support",
      "location assistance",
      "launch support",
    ])
  ) {
    return "services";
  }

  if (containsAny(text, ["faq", "faqs", "frequently asked questions"])) {
    return "faqs";
  }

  if (containsAny(text, ["branch", "branches", "store locations"])) {
    return "branches";
  }

  if (
    containsAny(text, [
      "apply",
      "application",
      "how to apply",
      "franchise now",
      "how to start",
      "next step",
      "next steps",
    ])
  ) {
    return "apply";
  }

  if (containsAny(text, ["about", "hhc", "franchise hub", "who are you", "what is hhc"])) {
    return "about";
  }

  return "";
}

function buildBrandInvestmentReply(brand) {
  const details = brand.investment || {};
  const parts = [];
  if (details.franchiseFee) parts.push(`franchise fee: ${details.franchiseFee}`);
  if (details.totalCapital) parts.push(`total capital: ${details.totalCapital}`);
  if (details.totalPackage) parts.push(`total package: ${details.totalPackage}`);
  if (details.royalty) parts.push(`royalty: ${details.royalty}`);
  if (details.contract) parts.push(`contract: ${details.contract}`);
  if (details.floorArea) parts.push(`floor area: ${details.floorArea}`);

  if (parts.length === 0) {
    return `${brand.name} investment details are available on the website, and our team can confirm the latest package numbers for your target location.`;
  }

  const notes = details.notes ? ` ${details.notes}` : "";
  return `${brand.name} investment details: ${parts.join("; ")}.${notes}`;
}

function buildBrandSupportReply(brand) {
  const support = brand.support || [];
  if (support.length === 0) {
    return `${brand.name} includes setup, training, and ongoing operational support.`;
  }

  return `${brand.name} support includes ${support.join(", ")}.`;
}

function buildBrandOperationsReply(brand) {
  const operations = brand.operations || [];
  if (operations.length === 0) {
    return `${brand.name} has structured operating guidance, and our team can walk you through the day-to-day setup.`;
  }

  return `${brand.name} operations info: ${operations.join(", ")}.`;
}

function buildBrandPackageReply(brand) {
  if (brand.packageOptions?.length) {
    return `${brand.name} package options on the website include ${brand.packageOptions.join(", ")}.`;
  }

  return buildBrandInvestmentReply(brand);
}

function buildBrandBranchesReply(brand) {
  if (brand.branches?.length) {
    return `${brand.name} branch rollout shown on the website includes ${brand.branches.join(", ")}.`;
  }

  if (brand.investment?.floorArea) {
    return `${brand.name} location fit depends on your area and traffic. Current website guidance includes ${brand.investment.floorArea}.`;
  }

  return `${brand.name} location planning depends on your target area, foot traffic, and rollout goals.`;
}

function buildBrandApplyReply(brand) {
  if (brand.applicationPhone) {
    return `To apply for ${brand.name}, contact ${brand.applicationPhone}. You can also send your target location, budget, and timeline here so we can guide you to the next step.`;
  }

  return `To apply for ${brand.name}, send your preferred location, budget, and timeline, and our team will guide you through the next step.`;
}

function buildBrandReply(brandId, intent) {
  const brand = BRAND_CATALOG[brandId];
  if (!brand) return "";

  switch (intent) {
    case "investment":
      return buildBrandInvestmentReply(brand);
    case "packages":
      return buildBrandPackageReply(brand);
    case "support":
      return buildBrandSupportReply(brand);
    case "operations":
      return buildBrandOperationsReply(brand);
    case "branches":
      return buildBrandBranchesReply(brand);
    case "apply":
      return buildBrandApplyReply(brand);
    default:
      return `${brand.overview} ${buildBrandInvestmentReply(brand)}`;
  }
}

function buildWebsiteReply(intent) {
  switch (intent) {
    case "about":
      return `${WEBSITE_PROFILE.businessName} is ${WEBSITE_PROFILE.description} ${WEBSITE_PROFILE.mission}`;
    case "brands":
      return `HHC Franchise Hub brands are ${formatBrandGroups()}.`;
    case "history":
      return `HHC Franchise Hub timeline: ${HISTORY_TIMELINE.join("; ")}.`;
    case "awards":
      return `${WEBSITE_PROFILE.businessName} received the ${WEBSITE_PROFILE.award}. ${WEBSITE_PROFILE.awardReason}`;
    case "services":
      return `${WEBSITE_PROFILE.businessName} offers ${WEBSITE_PROFILE.services.join(", ")}.`;
    case "contact":
      return `You can contact ${WEBSITE_PROFILE.businessName} via ${WEBSITE_PROFILE.emails.join(", ")} or call ${WEBSITE_PROFILE.phones.join(", ")}. Office: ${WEBSITE_PROFILE.office}.`;
    case "hours":
      return `${WEBSITE_PROFILE.businessName} office hours are ${WEBSITE_PROFILE.hours}.`;
    case "office":
      return `${WEBSITE_PROFILE.businessName} is located at ${WEBSITE_PROFILE.office}.`;
    case "branches":
      return `The website has a dedicated store locations page, and the current BigStop rollout shown on the site includes Banlic, Bataan, Crossing, Paciano, and Tuguegarao.`;
    case "apply":
      return `To start, share your target location, budget range, and timeline. You can contact the team at ${WEBSITE_PROFILE.phones[0]} or use the website inquiry form.`;
    case "faqs":
      return `The FAQ page currently covers BigStop topics such as franchise fee, royalty, total capital, renovation costs, POS, pharmacist and FDA requirements, franchisee support, no prior experience, and how to apply.`;
    default:
      return "";
  }
}

function buildWebsiteKnowledgeReply(session, text) {
  let brandId = detectBrandId(text);

  if (!brandId && containsAny(text, ["pharmacist", "fda", "pos", "point of sale"])) {
    brandId = "bigstop";
  }

  if (!brandId && containsAny(text, ["prior business experience", "experience required", "experience needed"])) {
    return {
      type: "reply",
      intent: "experience",
      value:
        "For BigStop, no prior business experience is required. The website says the team provides training and operational support from day one.",
    };
  }

  if (brandId) {
    const value = buildBrandReply(brandId, detectBrandIntent(text));
    if (value) {
      return { type: "reply", intent: `brand:${brandId}`, value };
    }
  }

  const websiteIntent = detectWebsiteIntent(text);
  if (!websiteIntent) return null;

  const value = buildWebsiteReply(websiteIntent);
  if (!value) return null;

  return { type: "reply", intent: `site:${websiteIntent}`, value };
}

function buildSupportLine() {
  const contactOptions = [];
  if (SUPPORT_EMAIL) contactOptions.push(`email us at ${SUPPORT_EMAIL}`);
  if (SUPPORT_PHONE) contactOptions.push(`call us at ${SUPPORT_PHONE}`);
  if (BUSINESS_HOURS) contactOptions.push(`reach us during ${BUSINESS_HOURS}`);

  if (contactOptions.length === 0) {
    return "You can also request a live agent here anytime.";
  }

  return `You can also ${formatList(contactOptions)}.`;
}

function buildWelcomeMessage(session) {
  const topicLabel =
    session.topic && session.topic !== "General Inquiry"
      ? ` about ${session.topic.toLowerCase()}`
      : "";

  return `Welcome, ${session.visitorName}! I'm the chat assistant for ${BUSINESS_NAME}. I can help${topicLabel} with ${BOT_CAPABILITIES}. What would you like to know?`;
}

function buildKeywordFallbackReply() {
  return `I can help with ${BOT_CAPABILITIES}. You can ask about brands like BigStop, Herrera Pharmacy, Boss Siomai, Boss Chickn, Boss Fries, Burger 2 Go, and Noodle King. ${buildSupportLine()}`.trim();
}

function buildKeywordBotReply(session) {
  const latestUserMessage = [...session.messages]
    .reverse()
    .find((message) => message.role === "user")?.content;
  const text = normalizeText(latestUserMessage);

  if (!text) {
    return {
      type: "reply",
      value: buildKeywordFallbackReply(),
      intent: KEYWORD_FALLBACK_TOKEN,
    };
  }

  if (
    containsAny(text, [
      "agent",
      "human",
      "representative",
      "live support",
      "live agent",
      "real person",
      "customer service",
      "talk to someone",
      "speak to someone",
      "call me",
    ])
  ) {
    return { type: "handoff", value: HANDOFF_TO_AGENT, intent: "handoff" };
  }

  if (
    containsAny(text, [
      "complaint",
      "complain",
      "refund",
      "chargeback",
      "billing dispute",
      "legal",
      "lawyer",
      "attorney",
      "scam",
      "fraud",
      "cancel order",
      "cancel subscription",
    ])
  ) {
    return { type: "handoff", value: HANDOFF_TO_AGENT, intent: "handoff" };
  }

  const websiteReply = buildWebsiteKnowledgeReply(session, text);
  if (websiteReply) {
    return websiteReply;
  }

  if (
    containsAny(text, [
      "packages",
      "package",
      "option",
      "options",
      "franchise package",
      "available packages",
    ])
  ) {
    return {
      type: "reply",
      intent: "packages",
      value:
        "We can help you compare available franchise packages. Share your preferred location and budget range, and I can narrow the best option or connect you to a live agent for exact package details.",
    };
  }

  if (
    containsAny(text, [
      "price",
      "pricing",
      "cost",
      "how much",
      "budget",
      "capital",
      "investment",
      "fee",
      "franchise fee",
      "franchise cost",
    ])
  ) {
    return {
      type: "reply",
      intent: "pricing",
      value:
        "Franchise costs usually depend on the package, setup scope, and location. Share your preferred city and budget range, and I can point you to the best next step or connect you to a live agent for exact figures.",
    };
  }

  if (
    containsAny(text, [
      "requirement",
      "requirements",
      "qualifications",
      "eligible",
      "eligibility",
      "document",
      "documents",
      "what do i need",
    ])
  ) {
    return {
      type: "reply",
      intent: "requirements",
      value:
        "To get started, we usually need your preferred location, target budget, and contact details. If you already have those ready, send them here and I can guide you to the next step or connect you to a live agent.",
    };
  }

  if (
    containsAny(text, [
      "location",
      "area",
      "branch",
      "site",
      "city",
      "territory",
      "available area",
    ])
  ) {
    return {
      type: "reply",
      intent: "location",
      value:
        "We can help review your target area. Send the city or exact location you have in mind, plus your budget range, and our team can advise on the next step.",
    };
  }

  if (
    containsAny(text, [
      "apply",
      "application",
      "process",
      "start",
      "how to start",
      "next step",
      "next steps",
      "sign up",
      "open",
    ])
  ) {
    return {
      type: "reply",
      intent: "process",
      value:
        "The usual next steps are: choose the package, share your preferred location and budget, then our team reviews your details and follows up. If you want direct guidance now, I can connect you to a live agent.",
    };
  }

  if (
    containsAny(text, [
      "training",
      "support",
      "marketing",
      "setup",
      "opening",
      "assistance",
      "help after opening",
    ])
  ) {
    return {
      type: "reply",
      intent: "support",
      value:
        "We can walk you through training, setup, opening support, and ongoing assistance. Tell me which part you want details on, or ask for a live agent if you want a direct consultation.",
    };
  }

  if (
    containsAny(text, [
      "contact",
      "email",
      "phone",
      "number",
      "hours",
      "schedule",
      "office",
    ])
  ) {
    return {
      type: "reply",
      intent: "contact",
      value: `You can keep chatting here or request a live agent anytime. ${buildSupportLine()}`.trim(),
    };
  }

  if (containsAny(text, ["thanks", "thank you", "salamat"])) {
    return {
      type: "reply",
      intent: "thanks",
      value:
        "You're welcome. If you want package details, requirements, budget guidance, or a live agent, just send another message.",
    };
  }

  if (containsAny(text, ["hello", "hi", "hey", "good morning", "good afternoon", "good evening"])) {
    return {
      type: "reply",
      intent: "greeting",
      value: `Hi ${session.visitorName}! I can help with ${BOT_CAPABILITIES}. What would you like to know?`,
    };
  }

  return {
    type: "reply",
    intent: KEYWORD_FALLBACK_TOKEN,
    value: buildKeywordFallbackReply(),
  };
}

async function getAnthropicReply(session) {
  if (!anthropic) return null;

  const history = session.messages.slice(-20).map((message) => ({
    role: message.role === "agent" ? "assistant" : message.role,
    content: message.content,
  }));

  try {
    const resp = await anthropic.messages.create({
      model:      "claude-sonnet-4-20250514",
      max_tokens: 512,
      system:     SYSTEM_PROMPT,
      messages:   history,
    });

    return resp.content[0]?.text || null;
  } catch (err) {
    console.error("[Bot] Anthropic error:", err.message);
    return null;
  }
}

async function getBotReply(session) {
  const keywordReply = buildKeywordBotReply(session);

  if (keywordReply.type === "handoff") {
    return keywordReply.value;
  }

  if (BOT_MODE === "keyword") {
    return keywordReply.value;
  }

  if (BOT_MODE === "hybrid" && keywordReply.intent !== KEYWORD_FALLBACK_TOKEN) {
    return keywordReply.value;
  }

  const aiReply = await getAnthropicReply(session);
  return aiReply || keywordReply.value;
}

// ─────────────────────────────────────────────
// EXPRESS + MIDDLEWARE
// ─────────────────────────────────────────────
const app    = express();
const server = http.createServer(app);

app.use(helmet({
  contentSecurityPolicy: false,   // Allow widget embedding
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  frameguard: false,
}));

app.use(cors({
  origin: (origin, cb) => {
    if (isAllowedOrigin(origin)) {
      cb(null, true);
    } else {
      cb(new Error("CORS blocked: " + origin));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: "10kb" }));

app.get("/", (req, res) => {
  const requestHost = normalizeHost(
    req.get("x-forwarded-host") || req.get("host") || req.hostname || ""
  );

  if (requestHost && ADMIN_DASHBOARD_HOSTS.includes(requestHost)) {
    return res.redirect("/agent-dashboard");
  }

  return res.json({
    status: "ok",
    service: "live-chat",
    routes: {
      health: "/health",
      widget: "/widget",
      dashboard: "/agent-dashboard",
    },
  });
});

app.get("/widget", (_req, res) => {
  res.sendFile(path.join(__dirname, "widget.html"));
});

app.get("/agent-dashboard", (_req, res) => {
  res.sendFile(path.join(__dirname, "agent-dashboard.html"));
});

// Rate limit REST endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests" },
});
app.use("/api", apiLimiter);

// ─────────────────────────────────────────────
// REST ROUTES
// ─────────────────────────────────────────────

// Health check
app.get("/health", (_req, res) => res.json({ status: "ok", sessions: sessions.size }));

// Agent login
app.post("/api/agent/login", (req, res) => {
  const { username, password } = req.body || {};
  const agent = AGENTS.find(a => a.username === username && a.password === password);
  if (!agent) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign({ agentId: agent.id, name: agent.name }, JWT_SECRET, { expiresIn: "8h" });
  res.json({ token, agent: { id: agent.id, name: agent.name, username: agent.username } });
});

// Get all sessions (agents only)
app.get("/api/sessions", requireAgentJWT, (_req, res) => {
  const list = [...sessions.values()].map(s => ({
    id:           s.id,
    visitorName:  s.visitorName,
    visitorEmail: s.visitorEmail,
    topic:        s.topic,
    status:       s.status,
    messageCount: s.messages.length,
    assignedAgent: s.assignedAgent,
    createdAt:    s.createdAt,
    updatedAt:    s.updatedAt,
    lastMessage:  s.messages.at(-1)?.content?.slice(0, 80) || "",
  }));
  res.json(list);
});

// Get single session transcript
app.get("/api/sessions/:id", requireAgentJWT, (req, res) => {
  const s = sessions.get(req.params.id);
  if (!s) return res.status(404).json({ error: "Not found" });
  res.json(s);
});

// Close a session
app.post("/api/sessions/:id/close", requireAgentJWT, (req, res) => {
  const s = sessions.get(req.params.id);
  if (!s) return res.status(404).json({ error: "Not found" });
  s.status = "closed";
  io.to(s.id).emit("chat:closed", { message: "This chat session has been closed." });
  res.json({ ok: true });
});

// Stats
app.get("/api/stats", requireAgentJWT, (_req, res) => {
  const all = [...sessions.values()];
  res.json({
    total:   all.length,
    bot:     all.filter(s => s.status === "bot").length,
    queued:  all.filter(s => s.status === "queued").length,
    active:  all.filter(s => s.status === "active").length,
    closed:  all.filter(s => s.status === "closed").length,
  });
});

// ─────────────────────────────────────────────
// JWT MIDDLEWARE
// ─────────────────────────────────────────────
function requireAgentJWT(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: "No token" });
  try {
    req.agent = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// ─────────────────────────────────────────────
// SOCKET.IO
// ─────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: (origin, cb) => {
      if (isAllowedOrigin(origin)) cb(null, true);
      else cb(new Error("CORS blocked"));
    },
    credentials: true,
  },
  pingTimeout: 30000,
  pingInterval: 10000,
});

// ── Flood detection ──────────────────────────
function floodCheck(ip) {
  if (blockedIPs.has(ip)) return false;
  const now = Date.now();
  const entry = ipFlood.get(ip) || { count: 0, resetAt: now + 60_000 };
  if (now > entry.resetAt) { entry.count = 0; entry.resetAt = now + 60_000; }
  entry.count++;
  ipFlood.set(ip, entry);
  if (entry.count > 60) { blockedIPs.add(ip); return false; }
  return true;
}

// ── VISITOR NAMESPACE ────────────────────────
const visitorNS = io.of("/visitor");

visitorNS.on("connection", socket => {
  const ip = socket.handshake.headers["x-forwarded-for"] || socket.handshake.address;
  if (blockedIPs.has(ip)) { socket.disconnect(); return; }

  let currentSession = null;

  // Start chat
  socket.on("chat:start", async ({ name, email, topic }) => {
    if (!floodCheck(ip)) { socket.emit("error", { message: "Too many requests." }); return; }

    currentSession = createSession(name, email, topic);
    currentSession.visitorSocket = socket.id;
    socket.join(currentSession.id);

    socket.emit("chat:started", {
      sessionId: currentSession.id,
      message: buildWelcomeMessage(currentSession),
    });

    // Notify all agents of new session
    agentNS.emit("sessions:update", getSessionSummary(currentSession));
  });

  // Visitor sends message
  socket.on("chat:message", async ({ content }) => {
    if (!currentSession || currentSession.status === "closed") return;
    if (!floodCheck(ip)) { socket.emit("error", { message: "Slow down." }); return; }
    if (!content?.trim()) return;

    const clean = xss(content.trim().slice(0, 1000));
    const userMsg = pushMessage(currentSession, "user", clean);

    // Echo back with timestamp
    socket.emit("chat:message", { ...userMsg, role: "user" });

    // Notify agent if watching
    if (currentSession.agentSocket) {
      agentNS.to(currentSession.agentSocket).emit("chat:message", {
        sessionId: currentSession.id, ...userMsg,
      });
    }

    // ── BOT mode ──
    if (currentSession.status === "bot") {
      socket.emit("chat:typing", { role: "bot" });

      const reply = await getBotReply(currentSession);

      if (reply === "HANDOFF_TO_AGENT") {
        currentSession.status = "queued";
        const sysMsg = pushMessage(currentSession, "system", "Transferring you to a live agent. Please hold on...");
        socket.emit("chat:message", sysMsg);
        socket.emit("chat:status", { status: "queued" });
        agentNS.emit("sessions:queued", getSessionSummary(currentSession));
      } else {
        const botMsg = pushMessage(currentSession, "assistant", reply);
        socket.emit("chat:message", botMsg);
        if (currentSession.agentSocket) {
          agentNS.to(currentSession.agentSocket).emit("chat:message", {
            sessionId: currentSession.id, ...botMsg,
          });
        }
      }
    }

    agentNS.emit("sessions:update", getSessionSummary(currentSession));
  });

  // Visitor requests human
  socket.on("chat:request_agent", () => {
    if (!currentSession || currentSession.status !== "bot") return;
    currentSession.status = "queued";
    const msg = pushMessage(currentSession, "system", "You've requested a live agent. Connecting you now...");
    socket.emit("chat:message", msg);
    socket.emit("chat:status", { status: "queued" });
    agentNS.emit("sessions:queued", getSessionSummary(currentSession));
    agentNS.emit("sessions:update", getSessionSummary(currentSession));
  });

  socket.on("disconnect", () => {
    if (currentSession && currentSession.status !== "closed") {
      currentSession.visitorSocket = null;
      agentNS.emit("sessions:update", getSessionSummary(currentSession));
    }
  });
});

// ── AGENT NAMESPACE ──────────────────────────
const agentNS = io.of("/agent");

agentNS.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("auth required"));
  try {
    socket.agent = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    next(new Error("invalid token"));
  }
});

agentNS.on("connection", socket => {
  agentSockets.set(socket.agent.agentId, socket.id);
  console.log(`[Agent] ${socket.agent.name} connected`);

  // Send current sessions list on connect
  socket.emit("sessions:list", [...sessions.values()].map(getSessionSummary));

  // Agent joins a session
  socket.on("session:join", ({ sessionId }) => {
    const s = sessions.get(sessionId);
    if (!s) return;

    // Leave previous session room
    socket.rooms.forEach(r => { if (r !== socket.id) socket.leave(r); });
    socket.join(sessionId);

    s.assignedAgent = socket.agent.name;
    s.agentSocket   = socket.id;
    if (s.status === "queued") s.status = "active";

    // Send full transcript to agent
    socket.emit("session:transcript", s);

    // Notify visitor
    if (s.visitorSocket) {
      visitorNS.to(s.visitorSocket).emit("chat:status", { status: "active", agentName: socket.agent.name });
      const sysMsg = pushMessage(s, "system", `${socket.agent.name} has joined the chat.`);
      visitorNS.to(s.visitorSocket).emit("chat:message", sysMsg);
    }

    agentNS.emit("sessions:update", getSessionSummary(s));
  });

  // Agent sends message
  socket.on("chat:message", ({ sessionId, content }) => {
    const s = sessions.get(sessionId);
    if (!s || s.status === "closed") return;

    const clean = xss((content || "").trim().slice(0, 2000));
    if (!clean) return;

    const msg = pushMessage(s, "agent", clean);

    // Echo to agent
    socket.emit("chat:message", { sessionId, ...msg });

    // Forward to visitor
    if (s.visitorSocket) {
      visitorNS.to(s.visitorSocket).emit("chat:message", msg);
    }

    agentNS.emit("sessions:update", getSessionSummary(s));
  });

  // Agent typing indicator
  socket.on("chat:typing", ({ sessionId }) => {
    const s = sessions.get(sessionId);
    if (s?.visitorSocket) {
      visitorNS.to(s.visitorSocket).emit("chat:typing", { role: "agent" });
    }
  });

  // Agent closes session
  socket.on("session:close", ({ sessionId }) => {
    const s = sessions.get(sessionId);
    if (!s) return;
    s.status = "closed";
    if (s.visitorSocket) {
      visitorNS.to(s.visitorSocket).emit("chat:closed", { message: "The chat has been closed. Thank you!" });
    }
    agentNS.emit("sessions:update", getSessionSummary(s));
    socket.emit("session:closed", { sessionId });
  });

  // Agent transfers session back to bot
  socket.on("session:transfer_bot", ({ sessionId }) => {
    const s = sessions.get(sessionId);
    if (!s) return;
    s.status       = "bot";
    s.assignedAgent = null;
    s.agentSocket   = null;
    const msg = pushMessage(s, "system", "Session transferred back to the chat assistant.");
    if (s.visitorSocket) {
      visitorNS.to(s.visitorSocket).emit("chat:message", msg);
      visitorNS.to(s.visitorSocket).emit("chat:status", { status: "bot" });
    }
    agentNS.emit("sessions:update", getSessionSummary(s));
  });

  socket.on("disconnect", () => {
    agentSockets.delete(socket.agent.agentId);
    console.log(`[Agent] ${socket.agent.name} disconnected`);
    // Re-queue any active sessions this agent owned
    sessions.forEach(s => {
      if (s.agentSocket === socket.id && s.status === "active") {
        s.status       = "queued";
        s.assignedAgent = null;
        s.agentSocket   = null;
        if (s.visitorSocket) {
          visitorNS.to(s.visitorSocket).emit("chat:status", { status: "queued" });
          const msg = pushMessage(s, "system", "Agent disconnected. Re-queuing for next available agent...");
          visitorNS.to(s.visitorSocket).emit("chat:message", msg);
        }
        agentNS.emit("sessions:queued", getSessionSummary(s));
      }
    });
  });
});

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function getSessionSummary(s) {
  return {
    id:           s.id,
    visitorName:  s.visitorName,
    visitorEmail: s.visitorEmail,
    topic:        s.topic,
    status:       s.status,
    assignedAgent: s.assignedAgent,
    messageCount: s.messages.length,
    createdAt:    s.createdAt,
    updatedAt:    s.updatedAt,
    online:       !!s.visitorSocket,
    lastMessage:  s.messages.at(-1)?.content?.slice(0, 100) || "",
  };
}

// ─────────────────────────────────────────────
// START
// ─────────────────────────────────────────────
server.listen(PORT, HOST, () => {
  console.log(`   Bot mode   : ${BOT_MODE}`);
  console.log(`\n🚀 Live Chat Server running on port ${PORT}`);
  console.log(`   Visitor WS : ws://localhost:${PORT}/visitor`);
  console.log(`   Agent WS   : ws://localhost:${PORT}/agent`);
  console.log(`   REST API   : http://localhost:${PORT}/api\n`);
});
