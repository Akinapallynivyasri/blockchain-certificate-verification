**Live demo:** https://blockchain-certificate-verification-pi.vercel.app
# Blockchain-Based Certificate Verification System

Institutions issue certificates; employers and anyone else can check whether a certificate is genuine - instantly and without an account.

**How it works**

1. An institution logs in and uploads a certificate (PDF/PNG/JPG).
2. The server computes the file's **SHA-256 hash** and stores it with the student details.
3. Each record is also linked to the previous one (`previousHash` -> `blockHash`), forming a small tamper-evident hash chain.
4. To verify, anyone uploads the certificate (or pastes its hash). If the hash matches a stored record, it is **valid**; otherwise it is **fake or altered**. Changing even one pixel changes the hash.

The certificate file itself is never stored - only its hash.

**Tech stack:** React, Bootstrap, Node.js, Express, JWT auth, JSON-file database.

## Project structure

```
backend/    Express API (auth, issue, verify, chain check)
frontend/   React app (Create React App)
render.yaml Optional Render config for the backend
```

## Run locally

Requires Node.js 18+.

```bash
# 1. Backend
cd backend
cp .env.example .env        # then edit JWT_SECRET
npm install
npm run dev                 # http://localhost:5000

# 2. Frontend (new terminal)
cd frontend
cp .env.example .env
npm install
npm start                   # http://localhost:3000
```

## API

| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| POST | `/api/auth/register` | - | Create an institution account |
| POST | `/api/auth/login` | - | Log in, receive a token |
| GET | `/api/auth/me` | Yes | Current user |
| POST | `/api/certificates/issue` | Yes | Issue a certificate (multipart: `studentId`, `studentName`, `course`, `file`) |
| GET | `/api/certificates/mine` | Yes | Certificates issued by you |
| POST | `/api/certificates/verify` | - | Verify with `file` or `hash` |
| GET | `/api/certificates/chain/status` | - | Checks the hash chain is intact |
| GET | `/api/health` | - | Health check |

## Deploy

**Backend (Render / Railway)**
- Root directory: `backend`, build `npm install`, start `npm start`.
- Environment variables: `NODE_ENV=production`, `JWT_SECRET` (long random string), `CLIENT_URL` (your frontend URL), `DATA_DIR` (path on a persistent disk).

**Frontend (Vercel / Netlify)**
- Root directory: `frontend`, build `npm run build`, output `build`.
- Environment variable: `REACT_APP_API_URL` = your deployed backend URL (no trailing slash).
- SPA routing is already handled by `vercel.json` and `public/_redirects`.

**Important:** the JSON database is a file. On free hosting tiers the disk is wiped on every redeploy/restart, so issued certificates would disappear. For a real deployment, use a persistent disk or replace `backend/src/db.js` with MongoDB/PostgreSQL.

## Authors

A. Nivya Sri, A. Vaishnavi, B. Varsha - CSE III, Malla Reddy Engineering College for Women.
