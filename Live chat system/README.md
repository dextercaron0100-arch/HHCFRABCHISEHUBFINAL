# Live Chat System - Keyword Bot + Live Agent Backend

## Files
- `server.js` - Node.js/Express/Socket.IO backend
- `knowledge-base.js` - website facts, brand details, and FAQ answers used by the keyword bot
- `widget.html` - Visitor-facing embeddable chat widget
- `agent-dashboard.html` - Agent dashboard
- `.env.example` - Environment variable template
- `railway.toml` - Railway deploy config for this service

## Setup

```bash
npm install
copy .env.example .env
node server.js
```

Set these values in `.env` before production use:
- `JWT_SECRET`
- `ALLOWED_ORIGINS`
- `BUSINESS_NAME`
- `BUSINESS_CONTEXT`
- `BOT_MODE`

Optional values:
- `ADMIN_DASHBOARD_HOSTS`
- `SUPPORT_EMAIL`
- `SUPPORT_PHONE`
- `BUSINESS_HOURS`
- `ANTHROPIC_API_KEY` if you want `hybrid` or `anthropic` mode

## Bot Modes

- `keyword` - free keyword-based replies only
- `hybrid` - keyword replies first, Anthropic fallback for unmatched questions
- `anthropic` - Anthropic replies only

If `BOT_MODE` is not set, the server defaults to `keyword` when no `ANTHROPIC_API_KEY` exists and `hybrid` when one is present.

The keyword bot in `server.js` is already wired for common franchise questions such as:
- pricing and budget
- requirements and documents
- location and territory
- process and next steps
- training and support
- live-agent handoff

To update the bot with new website answers later, edit `knowledge-base.js`.

## Railway Deploy

This folder can be deployed as its own Railway service.

1. Create a Railway service from this repository.
2. Set `Root Directory` to `/Live chat system`.
3. Set the Railway config file path to `/Live chat system/railway.toml`.
4. Add the required environment variables from `.env.example`.
5. Generate a public Railway domain.
6. Test these routes:
   - `/health`
   - `/widget`
   - `/agent-dashboard`

The included `railway.toml` sets:
- `startCommand = "npm start"`
- `healthcheckPath = "/health"`
- `watchPatterns = ["/Live chat system/**"]`

For production, include both your website domain and your Railway chat domain in `ALLOWED_ORIGINS`.

If you want a dedicated dashboard subdomain such as `admin.yourdomain.com`, add:

- `ADMIN_DASHBOARD_HOSTS=admin.yourdomain.com`

Then connect that custom domain to the Railway service. Requests to `/` on that host will redirect to `/agent-dashboard`.

## Website Connection

After Railway gives you a public URL, set this in your Vercel project:

- `HHF_LIVE_CHAT_URL=https://your-chat-service.up.railway.app`

Then redeploy the website so the live chat loader can use the Railway chat server.

## Agent Dashboard

Default credentials in `server.js`:
- `admin / admin123`
- `agent1 / agent123`

Change these before production.

Example setup for a dedicated admin URL:

- `admin.hhcfranchisehub.com.ph` -> Railway chat service custom domain
- `ADMIN_DASHBOARD_HOSTS=admin.hhcfranchisehub.com.ph`
- Dashboard URL: `https://admin.hhcfranchisehub.com.ph`

## REST API
- `GET /health`
- `POST /api/agent/login`
- `GET /api/sessions`
- `GET /api/sessions/:id`
- `POST /api/sessions/:id/close`
- `GET /api/stats`

## Production Checklist
- Change `JWT_SECRET`.
- Replace the hardcoded agent credentials.
- Set real `ALLOWED_ORIGINS` values.
- Fill in `SUPPORT_EMAIL`, `SUPPORT_PHONE`, and `BUSINESS_HOURS` if you want the bot to mention them.
- Add persistent storage if you need saved chat history.
- Add Redis if you need multi-instance session state.
