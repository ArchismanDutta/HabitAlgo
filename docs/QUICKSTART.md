# Quick Start Guide

Get the Ultimate Habit Tracker running in 5 minutes!

## Prerequisites
- Node.js 18+ installed
- npm or yarn

## Installation

### Option 1: One Command Install (Recommended)
```bash
# Install all dependencies
npm run install-all

# Start both backend and frontend
npm run dev
```

### Option 2: Manual Install
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (in new terminal)
cd frontend
npm install
npm run dev
```

## Access the App

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api/v1
- **Health Check**: http://localhost:5000/health

## First Steps

1. **Create Your First Habit**
   - Click "Create Habit" button
   - Enter name (e.g., "Morning Exercise")
   - Choose category
   - Select type (Boolean or Numeric)
   - Click Save

2. **Check In Today**
   - Click "Mark Done" on any habit
   - Watch the checkmark animation
   - See your streak start!

3. **Test Offline Mode**
   - Open DevTools (F12)
   - Network tab → Set to "Offline"
   - Create habits and check them off
   - Everything still works!
   - Go back online → auto-sync happens

4. **Install as PWA**
   - Look for install icon in address bar
   - Click to install
   - Now it works like a native app!

## Common Commands

```bash
# Root directory
npm run install-all     # Install all dependencies
npm run dev            # Start both servers
npm run build          # Build frontend for production

# Backend only
cd backend
npm run dev            # Development with nodemon
npm start              # Production server

# Frontend only
cd frontend
npm run dev            # Development server
npm run build          # Production build
npm run preview        # Preview production build
```

## Tech Stack Summary

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: shadcn/ui (Tailwind CSS)
- **State**: Zustand + TanStack Query
- **Backend**: Node.js + Express
- **Database**: MongoDB Atlas
- **Offline**: IndexedDB (Dexie.js)
- **PWA**: Workbox Service Worker

## File Structure

```
trackHabit/
├── backend/          # Express API
│   ├── models/       # Mongoose schemas
│   ├── controllers/  # Business logic
│   ├── routes/       # API routes
│   └── server.js     # Entry point
│
├── frontend/         # React app
│   ├── src/
│   │   ├── views/    # Page components
│   │   ├── store/    # Zustand stores
│   │   ├── services/ # API calls
│   │   └── lib/      # Utilities
│   └── vite.config.ts
│
└── README.md         # Full documentation
```

## Need Help?

- **Full Documentation**: See `README.md`
- **Architecture Details**: See `ARCHITECTURE.md`
- **MongoDB Issues**: Check `.env` file
- **Port Conflicts**: Change PORT in `.env`

## What's Next?

- Explore the Analytics view (coming soon)
- Try Focus Mode for distraction-free tracking
- Add daily reflections
- Track screen time
- Install on your phone!

---

**You're all set!** Start tracking habits and building momentum. 🚀
