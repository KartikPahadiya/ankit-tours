# Ankit Travels — Ranthambore Safari, Stays & Tours

A full-stack travel booking platform for Ankit Tours, a local host in Sawai Madhopur, Rajasthan. Features safari bookings (Gypsy/Canter), hotel stays, curated tour packages, and a complete admin panel — all with WhatsApp-first communication.

## Features

### Public Website
- **Safari Options & Prices** — Gypsy and Canter safaris (morning/afternoon shifts), with admin-managed pricing
- **Stays** — property listings with photo galleries, room details, availability checking and online booking
- **Tour Packages** — 3-day and 5-day curated Ranthambore experiences
- **Custom Package Builder** — travellers design their own trip and request it from Ankit
- **WhatsApp Integration** — every CTA opens WhatsApp with a pre-filled message
- **Gallery** — horizontal-scroll photo galleries with room name badges

### User Accounts
- Register / Login (JWT auth)
- My Bookings with payment status and Pay Now button
- Custom plan requests with admin accept/reject flow
- Booking details with cancellation and refund support

### Admin Panel (`/admin`)
- **Dashboard** — users, properties, rooms, bookings, revenue KPIs
- **Properties** — add/edit/delete properties, manage rooms, upload photos (general + room-specific)
- **Safaris** — manage Gypsy/Canter options, set prices per shift
- **Tours** — manage tour packages, add/edit/hide/delete
- **Custom Plans** — accept or reject traveller requests
- **Bookings** — all customer bookings with contact details
- **Users** — registered user list

### Payments
- Razorpay integration for online stay bookings
- Booking hold with expiry, cancellation with refund calculation

## Tech Stack

**Frontend:** React 18, TypeScript, Vite, Tailwind CSS v4, React Router v7, Lucide Icons, Axios

**Backend:** Python FastAPI, SQLAlchemy, SQLite (dev), Pydantic, python-jose (JWT), Razorpay SDK

## Setup

### Prerequisites
- Node.js ≥ 18
- Python ≥ 3.10

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux

pip install -r requirements.txt

# Create .env file (see .env.example for required variables)
cp .env.example .env

# Create tables and seed demo data
python -m app.seed

# Start the server
uvicorn app.main:app --reload
```

The API runs at `http://127.0.0.1:8000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The site runs at `http://localhost:5173`.

### Admin Access

After seeding, an admin account is created:

| | |
|---|---|
| Email | `admin@travelnest.com` |
| Password | `Admin@12345` |

> Change these credentials before deploying.

## Admin Panel Guide

1. Log in with admin credentials → you land in the admin panel
2. **Properties** → Add Property (name, type, city, address, description) → click "Rooms & Photos" to add room types, set prices, and upload photos (property photos + room-specific photos)
3. **Safaris** → Add/manage Gypsy and Canter safari options with prices
4. **Tours** → Edit the seeded packages or add new ones
5. **Custom Plans** → Accept or reject custom package requests from travellers

## Image Storage

Property and room photos are stored locally on the server in `backend/uploads/` and served at `/uploads/...` — no external image service required. Admin can also add images by URL.

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── api/routes/        # API endpoints
│   │   ├── core/              # config, database, security
│   │   ├── models/            # SQLAlchemy models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── services/           # business logic
│   │   ├── main.py            # app entry point
│   │   └── seed.py            # demo data seeder
│   ├── uploads/               # uploaded images
│   └── requirements.txt
├── frontend/
│   ├── public/                # static assets (hero.jpg, photos)
│   ├── src/
│   │   ├── components/        # reusable components
│   │   ├── pages/             # page components
│   │   ├── services/          # API services
│   │   ├── context/           # React context (auth)
│   │   └── index.css          # global styles
│   └── package.json
└── README.md
```

## License

This project is proprietary to Ankit Tours.
