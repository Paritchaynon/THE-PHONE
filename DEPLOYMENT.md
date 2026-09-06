# Free Deployment Guide for "BETWEEN US"

Since **BETWEEN US** has two distinct components:
1. **Frontend**: Vite + React static app
2. **Backend**: Authoritative Node.js + Colyseus WebSocket server

Here is the best completely free setup:

---

## 🏆 Option 1: Render (Recommended - 1-Click All-in-One)
We created a `render.yaml` blueprint in the repository root.

- **Frontend**: Render Static Site (**100% Free Forever**, custom domains, SSL, CDN)
- **Backend**: Render Web Service (**Free tier**, supports WebSockets `wss://`, 512MB RAM)

### Steps to Deploy on Render:
1. Push your project to a GitHub or GitLab repository.
2. Go to [dashboard.render.com](https://dashboard.render.com) and log in.
3. Click **New +** → **Blueprints**.
4. Select your repository. Render will automatically detect [render.yaml](file:///d:/THE%20PHONE/render.yaml) and configure both the backend server and static frontend!
5. Click **Apply**.

---

## ⚡ Option 2: Vercel / Netlify (Frontend) + Railway (Backend)

If you prefer Vercel for fast global edge deployment:

### Backend on Railway / Fly.io:
1. Create a free account at [Railway.app](https://railway.app).
2. Click **New Project** → **Deploy from GitHub repo** → select your repo.
3. Set the Root Directory to `packages/server`.
4. Add start command: `npm run build && node dist/index.js`.
5. Railway provides public `https://...` and `wss://...` domains automatically.

### Frontend on Vercel:
1. Create a free account at [Vercel.com](https://vercel.com).
2. Click **Add New Project** → Import repo.
3. Set Root Directory to `packages/client`.
4. Build Command: `npm run build`.
5. Output Directory: `dist`.
6. Add Environment Variable:
   - `VITE_SERVER_URL` = `wss://your-railway-backend-url`

---

## 💾 Database (Supabase Free Tier)
For persistent game records and share result storage:
1. Go to [supabase.com](https://supabase.com) and create a free project.
2. Free tier includes 500MB database, 50,000 monthly active users, and global REST API.
