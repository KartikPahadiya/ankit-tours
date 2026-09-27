# Deployment Guide — Ankit Travels

This guide covers deploying the backend to **Render** and the frontend to **Vercel** using free tiers.

---

## Step 1: Create a PostgreSQL Database on Render

1. Go to [render.com](https://render.com) and sign up/log in
2. Click **New +** → **PostgreSQL**
3. Name it: `ankit-tours-db`
4. Plan: **Free**
5. Click **Create Database**
6. Wait for it to finish provisioning
7. **Copy the Internal Database URL** (it looks like `postgresql://ankit_user:password@dpg-xxx.db.ondigitalocean.com:5432/ankit_tours_db`)

> Keep this URL — you'll need it in Step 2.

---

## Step 2: Deploy the Backend on Render

1. On Render, click **New +** → **Web Service**
2. Connect your GitHub repo: `KartikPahadiya/ankit-tours`
3. Configure:

| Setting | Value |
|---|---|
| Name | `ankit-tours-api` |
| Root Directory | `backend` |
| Environment | `Python 3` |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `python -m app.seed && uvicorn app.main:app --host 0.0.0.0 --port $PORT` |

4. Under **Environment Variables**, add these:

| Key | Value |
|---|---|
| `APP_NAME` | `Ankit Travels API` |
| `DATABASE_URL` | *(paste the Internal Database URL from Step 1)* |
| `JWT_SECRET_KEY` | *(any long random string, e.g. run `python -c "import secrets; print(secrets.token_hex(32))"`)* |
| `CORS_ORIGINS` | `["https://your-app.vercel.app"]` *(add your Vercel URL after Step 3; you can update this later)* |
| `RAZORPAY_KEY_ID` | *(from Razorpay dashboard)* |
| `RAZORPAY_KEY_SECRET` | *(from Razorpay dashboard)* |
| `RAZORPAY_WEBHOOK_SECRET` | *(from Razorpay dashboard)* |
| `BOOKING_HOLD_MINUTES` | `10` |

5. Click **Create Web Service**
6. Wait for the build to finish — your backend will be live at:
   ```
   https://ankit-tours-api.onrender.com
   ```
7. **Test it**: visit `https://ankit-tours-api.onrender.com/api/health` — you should see `{"status": "healthy"}`

---

## Step 3: Deploy the Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) and sign up/log in
2. Click **Add New +** → **Project**
3. Import your GitHub repo: `KartikPahadiya/ankit-tours`
4. Configure:

| Setting | Value |
|---|---|
| Framework Preset | `Vite` |
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

5. Under **Environment Variables**, add:

| Key | Value |
|---|---|
| `VITE_API_URL` | `https://ankit-tours-api.onrender.com` |

6. Click **Deploy**
7. Your frontend will be live at:
   ```
   https://ankit-tours.vercel.app
   ```

---

## Step 4: Update CORS on Render

Now that you have the Vercel URL:

1. Go back to Render → your backend service → **Environment**
2. Update `CORS_ORIGINS` to include your Vercel URL:
   ```
   CORS_ORIGINS=["https://ankit-tours.vercel.app","http://localhost:5173"]
   ```
3. Save — Render will auto-redeploy

---

## Step 5: Verify Everything Works

| Test | URL | Expected |
|---|---|---|
| Backend health | `https://ankit-tours-api.onrender.com/api/health` | `{"status": "healthy"}` |
| Frontend loads | `https://ankit-tours.vercel.app` | Ankit Travels homepage |
| Stays list | `https://ankit-tours-api.onrender.com/api/stays` | List of properties |
| Safari options | `https://ankit-tours-api.onrender.com/api/safaris` | Gypsy/Canter prices |
| Admin login | `https://ankit-tours.vercel.app/login` | Login with admin credentials |

---

## Important Notes

### Database (PostgreSQL on Render)
- The **free PostgreSQL** on Render has a 90-day expiry — after 90 days it gets deleted unless you upgrade
- Run `python -m app.seed` to populate the database (the start command already does this)
- The seed is **idempotent** — it won't duplicate data on restarts
- Your data persists across restarts and redeploys

### Uploaded Photos
- Admin-uploaded photos are stored on Render's **ephemeral filesystem** — they are **lost on every deploy/restart**
- **Solution**: Use a persistent disk (Render paid plan, ~$1/month) or configure **Cloudinary** for image storage
- Photos in `frontend/public/` (hero.jpg, gypsy.jpg, etc.) are NOT affected — they're part of the frontend build

### Admin Credentials
After first deploy, the admin account is created by the seed script:
- Email: `admin@travelnest.com`
- Password: `Admin@12345`

**Change these immediately** in production:
1. Log in to the admin panel
2. Or update the seed.py file before deploying

### Razorpay Keys
- Use **test keys** (`rzp_test_*`) during development
- Switch to **live keys** (`rzp_live_*`) only when ready to accept real payments
- Set the webhook URL in the Razorpay dashboard to: `https://ankit-tours-api.onrender.com/api/payments/webhook`

### Frontend API URL
- The frontend reads `VITE_API_URL` at **build time** (not runtime)
- If you change the Render backend URL, you must **redeploy the frontend** on Vercel
- Local development uses `http://127.0.0.1:8000` automatically (from `.env`)

---

## Quick Reference: Local vs Production

| | Local Development | Production |
|---|---|---|
| Database | SQLite (`travelnest.db`) | PostgreSQL (Render) |
| Backend URL | `http://127.0.0.1:8000` | `https://your-api.onrender.com` |
| Frontend URL | `http://localhost:5173` | `https://your-app.vercel.app` |
| Start backend | `uvicorn app.main:app --reload` | Render auto-runs |
| Start frontend | `npm run dev` | Vercel auto-runs |
| Seed data | `python -m app.seed` | In start command (auto) |
