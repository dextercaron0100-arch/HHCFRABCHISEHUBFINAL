# Live Chat System — AI Bot + Live Agent Backend

## Files
- `server.js` — Node.js/Express/Socket.IO backend
- `widget.html` — Visitor-facing embeddable chat widget
- `agent-dashboard.html` — Agent admin dashboard
- `.env.example` — Copy to `.env` and configure

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env — set ANTHROPIC_API_KEY, JWT_SECRET, ALLOWED_ORIGINS, BUSINESS_CONTEXT

# 3. Run
node server.js
# or in dev: npx nodemon server.js
```

---

## Embed Widget on Your Website

Add this before `</body>` on any page:

```html
<script>
  window.CHAT_SERVER_URL = 'https://your-server.com';
</script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.7.2/socket.io.min.js"></script>
<!-- Copy the contents of widget.html here, or serve it as an iframe -->
```

### iframe Embed (simplest)
```html
<iframe src="https://your-server.com/widget" style="position:fixed;bottom:0;right:0;width:400px;height:650px;border:none;z-index:9999" allow="notifications"></iframe>
```

Serve `widget.html` statically:
```js
app.use(express.static('public')); // put widget.html in /public
```

---

## Agent Dashboard

Open `agent-dashboard.html` in a browser (or serve statically).

Default credentials:
| Username | Password |
|----------|----------|
| admin    | admin123 |
| agent1   | agent123 |

**Change credentials in `server.js` → AGENTS array, or connect to a database.**

---

## Architecture

```
Visitor Widget (visitor namespace /visitor)
    ↕ Socket.IO
Server (Express + Socket.IO)
    ├── AI Bot (Anthropic claude-sonnet-4)
    ├── Session Manager (in-memory / swap for Redis)
    └── Agent Namespace (/agent) ← JWT protected
            ↕
Agent Dashboard (agent-dashboard.html)
```

### Session Flow
1. Visitor fills pre-chat form → session created → AI bot responds
2. If bot says `HANDOFF_TO_AGENT` or visitor clicks "Talk to agent" → status = `queued`
3. Agent sees queued session on dashboard → clicks "Take Chat" → status = `active`
4. Agent can close session or transfer back to bot
5. If agent disconnects, session re-queues automatically

---

## Security Features
- Helmet.js HTTP headers
- CORS whitelist (ALLOWED_ORIGINS)
- JWT authentication for agent endpoints
- Rate limiting (REST + Socket.IO flood detection)
- IP blocking after 60 msgs/min
- XSS sanitization on all user input
- Message length limits (1000 chars visitor, 2000 agent)

---

## Production Checklist
- [ ] Change `JWT_SECRET` to a long random string
- [ ] Move agent credentials to a database (bcrypt passwords)
- [ ] Replace in-memory session store with Redis
- [ ] Set `ALLOWED_ORIGINS` to your actual domain(s)
- [ ] Set `ANTHROPIC_API_KEY`
- [ ] Write your `BUSINESS_CONTEXT` for the AI bot
- [ ] Use HTTPS + WSS (reverse proxy via nginx or Caddy)
- [ ] Add persistent chat history storage (PostgreSQL / MongoDB)

---

## REST API

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET    | /health | — | Server health |
| POST   | /api/agent/login | — | Get JWT token |
| GET    | /api/sessions | JWT | List all sessions |
| GET    | /api/sessions/:id | JWT | Session transcript |
| POST   | /api/sessions/:id/close | JWT | Close session |
| GET    | /api/stats | JWT | Session counts |

---

## Socket.IO Events

### Visitor (`/visitor` namespace)
| Emit | Receive |
|------|---------|
| `chat:start` | `chat:started` |
| `chat:message` | `chat:message` |
| `chat:request_agent` | `chat:status` |
| — | `chat:typing` |
| — | `chat:closed` |

### Agent (`/agent` namespace — JWT required)
| Emit | Receive |
|------|---------|
| `session:join` | `session:transcript` |
| `chat:message` | `chat:message` |
| `chat:typing` | `sessions:update` |
| `session:close` | `sessions:list` |
| `session:transfer_bot` | `sessions:queued` |
