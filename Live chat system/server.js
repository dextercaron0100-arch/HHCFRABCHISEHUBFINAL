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

// ─────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────
const PORT        = process.env.PORT        || 3000;
const HOST        = process.env.HOST        || '0.0.0.0';
const JWT_SECRET  = process.env.JWT_SECRET  || "change-me-in-production-secret";
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "http://localhost,http://127.0.0.1").split(",");

// Agent credentials — replace / move to DB in production
const AGENTS = [
  { id: "agent_1", username: "admin",  password: "admin123",  name: "Admin Agent"  },
  { id: "agent_2", username: "agent1", password: "agent123",  name: "Support Agent" },
];

// Anthropic client
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || "" });

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
const SYSTEM_PROMPT = `You are a helpful, friendly customer support assistant for a website.
Your role:
- Answer visitor inquiries warmly and accurately.
- If a visitor explicitly asks to speak to a human / live agent, respond with exactly: HANDOFF_TO_AGENT
- If the inquiry is too complex or sensitive (complaints, legal, billing disputes), respond with exactly: HANDOFF_TO_AGENT
- Keep answers concise (2-4 sentences max) unless detail is truly needed.
- Be professional but approachable.
- Do NOT reveal that you are built on any specific AI platform.

Business context: ${process.env.BUSINESS_CONTEXT || "We are a company providing quality products and services. Feel free to ask about our offerings, pricing, or support."}`;

async function getBotReply(session) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return "Hi! I'm the AI assistant. (Configure ANTHROPIC_API_KEY to enable full AI responses.) How can I help you today?";
  }

  // Build message history (last 20 only to keep context window reasonable)
  const history = session.messages.slice(-20).map(m => ({
    role:    m.role === "agent" ? "assistant" : m.role,
    content: m.content,
  }));

  try {
    const resp = await anthropic.messages.create({
      model:      "claude-sonnet-4-20250514",
      max_tokens: 512,
      system:     SYSTEM_PROMPT,
      messages:   history,
    });
    return resp.content[0]?.text || "I'm sorry, I couldn't process that. Could you rephrase?";
  } catch (err) {
    console.error("[Bot] Anthropic error:", err.message);
    return "I'm having trouble connecting right now. Would you like to speak with a live agent instead?";
  }
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
    if (!origin || ALLOWED_ORIGINS.some(o => origin.startsWith(o.trim()))) {
      cb(null, true);
    } else {
      cb(new Error("CORS blocked: " + origin));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: "10kb" }));

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
      if (!origin || ALLOWED_ORIGINS.some(o => origin.startsWith(o.trim()))) cb(null, true);
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
      message:   `Welcome, ${currentSession.visitorName}! I'm your AI assistant. How can I help you with "${currentSession.topic}"?`,
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
    const msg = pushMessage(s, "system", "Session transferred back to AI assistant.");
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
  console.log(`\n🚀 Live Chat Server running on port ${PORT}`);
  console.log(`   Visitor WS : ws://localhost:${PORT}/visitor`);
  console.log(`   Agent WS   : ws://localhost:${PORT}/agent`);
  console.log(`   REST API   : http://localhost:${PORT}/api\n`);
});
