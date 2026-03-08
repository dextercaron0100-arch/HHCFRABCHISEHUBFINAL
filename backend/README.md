# Backend

TypeScript Node/Express backend for inquiry emails and lead tracking.

## Setup

```bash
cd backend
npm install
```

Create `.env` from `.env.example` and set values:

```env
PORT=5000
CLIENT_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
BUSINESS_NAME=HHC Franchise Hub
TIMEZONE=Asia/Manila
BUSINESS_WEBSITE=http://localhost:5173
RESPONSE_TIME=within 24 hours
GMAIL_USER=yourgmail@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password
INQUIRY_TO=your-receiving-inbox@gmail.com
MAIL_FROM_NAME=HHC Franchise Hub Website
MAIL_FROM_EMAIL=yourgmail@gmail.com
SUPPORT_EMAIL=your-receiving-inbox@gmail.com
AUTO_REPLY_ENABLED=true
DATABASE_FILE=./data/inquiries.db
DATABASE_URL=
PGSSL=true
ADMIN_API_KEY=replace-with-a-long-random-secret
```

`DATABASE_URL` takes precedence over `DATABASE_FILE`. Keep `DATABASE_FILE` for local SQLite, and set `DATABASE_URL` when you want Railway to use Neon/Postgres.

## Professional Features Added

- Branded admin notification email with lead ID and source metadata
- Customer auto-reply email confirmation
- Reply-To handling for direct customer follow-up
- SQLite fallback for local development (`data/inquiries.db`)
- Postgres/Neon support through `DATABASE_URL`
- Admin API for listing inquiries and updating lead status

## Run

Development:

```bash
npm run dev
```

Production:

```bash
npm run build
npm start
```

## Neon Setup

1. Create a Neon project and copy its Postgres connection string.
2. In Railway, set:
   - `DATABASE_URL=<your-neon-connection-string>`
   - `PGSSL=true`
3. Leave `DATABASE_FILE` unset in Railway, or keep it only for local fallback.
4. Redeploy the Railway backend.

To migrate existing local SQLite data into Neon:

```bash
npm run migrate:postgres
```

The migration script looks for a local SQLite file in this order:

- `SQLITE_FILE`
- `./data/inquiries.db`
- `DATABASE_FILE`

If needed, override it explicitly:

```bash
SQLITE_FILE=./data/inquiries.db npm run migrate:postgres
```

## API Endpoints

- `GET http://localhost:5000/`
- `GET http://localhost:5000/health`
- `GET http://localhost:5000/api/health`
- `POST http://localhost:5000/api/inquiry`
- `GET http://localhost:5000/api/inquiries?limit=50&status=new` (requires admin key)
- `PATCH http://localhost:5000/api/inquiries/:leadId/status` (requires admin key)

Admin key auth:

- Header: `x-admin-key: <ADMIN_API_KEY>`
- or query: `?key=<ADMIN_API_KEY>`

Status values:

- `new`
- `contacted`
- `qualified`
- `closed`
- `spam`
