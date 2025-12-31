# Complete Setup Instructions

## Prerequisites Check

Before starting, verify you have:

```bash
# Check Node.js version (should be 18+)
node --version

# Check npm version
npm --version

# If not installed, download from: https://nodejs.org/
```

---

## Step-by-Step Setup

### 1. Install Backend Dependencies

```bash
# Navigate to backend folder
cd backend

# Install all packages
npm install

# Expected packages:
# - express
# - mongoose
# - cors
# - dotenv
# - morgan
# - express-rate-limit
```

### 2. Configure Backend Environment

The `.env` file is already configured with your MongoDB connection:

```env
MONGODB_URI=mongodb+srv://ashking19102001_db_user:eCAa0fiaDdzfTcUw@tracker.sy6dcll.mongodb.net/habitTracker?retryWrites=true&w=majority
PORT=5000
NODE_ENV=development
```

**Note**: Your MongoDB is already set up and ready to use!

### 3. Start Backend Server

```bash
# From the backend directory
npm run dev

# You should see:
# ✅ MongoDB Connected: tracker.sy6dcll.mongodb.net
# 🚀 Server running in development mode on port 5000
# 📡 API available at http://localhost:5000/api/v1
```

**Test**: Open http://localhost:5000/health in your browser.

Expected response:
```json
{
  "success": true,
  "message": "Habit Tracker API is running",
  "timestamp": "2024-..."
}
```

### 4. Install Frontend Dependencies

Open a **new terminal** window:

```bash
# Navigate to frontend folder
cd frontend

# Install all packages (this may take 2-3 minutes)
npm install

# Expected packages:
# - react, react-dom
# - typescript
# - vite
# - @tanstack/react-query
# - zustand
# - dexie
# - recharts
# - shadcn/ui components
# - and many more...
```

### 5. Start Frontend Development Server

```bash
# From the frontend directory
npm run dev

# You should see:
# VITE v5.x.x ready in xxx ms
# ➜  Local:   http://localhost:5173/
# ➜  Network: use --host to expose
```

### 6. Access the Application

Open your browser and go to:

**http://localhost:5173**

You should see the "Today" view with:
- Header: "Today" with current date
- Empty state message (no habits yet)
- "Create Habit" button

---

## Verify Everything Works

### Test 1: API Connection
```bash
# In a new terminal
curl http://localhost:5000/health

# Should return JSON with success: true
```

### Test 2: Create a Test Habit

1. Open browser at http://localhost:5173
2. Open DevTools (F12) → Console tab
3. Run this command:

```javascript
// This tests the API directly
fetch('http://localhost:5000/api/v1/habits', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Test Habit',
    category: 'Health',
    type: 'boolean',
    targetMonthly: 30,
    color: '#10b981',
    icon: '💪'
  })
})
  .then(res => res.json())
  .then(data => console.log('✅ Habit created:', data))
  .catch(err => console.error('❌ Error:', err));
```

### Test 3: Offline Mode

1. With the app open, press F12 (DevTools)
2. Go to **Network** tab
3. Change throttling to **Offline**
4. Try creating a habit (it should still work!)
5. Check **Application** tab → **IndexedDB** → You should see data stored
6. Go back **Online** → Watch console for sync messages

---

## Common Issues & Fixes

### Issue: Backend won't start

**Error**: `Error: listen EADDRINUSE: address already in use :::5000`

**Fix**: Port 5000 is in use. Change it:
```bash
# In backend/.env
PORT=5001

# Then restart: npm run dev
```

### Issue: MongoDB connection fails

**Error**: `MongoServerError: Authentication failed`

**Fix**: Your connection string is already correct, but if you see this:
1. Check your MongoDB Atlas dashboard
2. Verify IP whitelist (0.0.0.0/0 for development)
3. Verify database user credentials

### Issue: Frontend can't reach backend

**Error**: `Network Error` or `CORS error`

**Fix**:
1. Verify backend is running on port 5000
2. Check `frontend/vite.config.ts` proxy settings
3. Restart both servers

### Issue: TypeScript errors in frontend

**Error**: `Cannot find module '@/...'`

**Fix**:
```bash
# Make sure path alias is configured
# Check tsconfig.json has:
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Issue: Missing dependencies

**Error**: `Module not found: Can't resolve 'xxxxx'`

**Fix**:
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install

# Or force clean install
npm ci
```

---

## Production Build

### Build Frontend for Production

```bash
cd frontend
npm run build

# Creates optimized build in frontend/dist/
# Includes:
# - Minified JavaScript
# - Optimized CSS
# - PWA service worker
# - Manifest files
```

### Serve Production Build Locally

```bash
# Preview the production build
npm run preview

# Opens at http://localhost:4173
```

---

## Development Workflow

### Daily Development

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

### Making Changes

1. **Edit Backend**:
   - Modify files in `backend/`
   - Nodemon auto-restarts server
   - Check terminal for errors

2. **Edit Frontend**:
   - Modify files in `frontend/src/`
   - Vite hot-reloads automatically
   - Check browser for errors

### Database Changes

When you modify Mongoose models:
1. Update the model file
2. Server auto-restarts
3. MongoDB automatically adapts schema

---

## Next Steps

### 1. Create Your First Habit (Manual)

Even without a UI form yet, you can test with the API:

```bash
# Using curl (Mac/Linux)
curl -X POST http://localhost:5000/api/v1/habits \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Morning Exercise",
    "category": "Health",
    "type": "boolean",
    "targetMonthly": 30,
    "color": "#10b981",
    "icon": "💪"
  }'

# Using PowerShell (Windows)
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/habits" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"name":"Morning Exercise","category":"Health","type":"boolean","targetMonthly":30,"color":"#10b981","icon":"💪"}'
```

### 2. Explore the Codebase

**Start here**:
- `frontend/src/App.tsx` - Main app component
- `frontend/src/views/TodayView.tsx` - Today's habits view
- `backend/server.js` - API server entry point
- `backend/models/Habit.js` - Habit data model

### 3. Add More Features

The foundation is complete! You can now add:
- Habit creation form UI
- Monthly calendar view
- Analytics charts
- Focus mode
- Dark theme toggle

Check `ARCHITECTURE.md` for detailed implementation guidance.

---

## Development Tools

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

### Browser DevTools

**For Frontend Development**:
- **Console**: Check for errors, test API calls
- **Network**: Monitor API requests
- **Application** → **IndexedDB**: View offline data
- **Application** → **Service Workers**: Check PWA status
- **Lighthouse**: Test PWA score

**For Backend Development**:
- Use **Postman** or **Insomnia** for API testing
- Use **MongoDB Compass** to view database

---

## Getting Help

### Resources
- **Full Documentation**: `README.md`
- **Architecture Guide**: `ARCHITECTURE.md`
- **Quick Start**: `QUICKSTART.md`

### Debugging Tips

1. **Check all terminals** for error messages
2. **Clear browser cache** if you see stale data
3. **Check MongoDB Atlas** if data doesn't persist
4. **Verify both servers running** (ports 5000 & 5173)
5. **Check .env files exist** in both directories

---

## Success Checklist

- [ ] Node.js 18+ installed
- [ ] Backend dependencies installed
- [ ] Backend running on port 5000
- [ ] Health check returns success
- [ ] Frontend dependencies installed
- [ ] Frontend running on port 5173
- [ ] App opens in browser
- [ ] No console errors
- [ ] MongoDB connection successful
- [ ] Can create habits via API

**All checked?** You're ready to build! 🎉

---

## What You Have Now

✅ **Backend**:
- Express API with all routes
- MongoDB models with validation
- Error handling
- CORS and rate limiting
- Sync endpoints for offline support

✅ **Frontend**:
- React 18 + TypeScript
- Vite dev server
- Tailwind CSS configured
- shadcn/ui components
- Zustand state management
- TanStack Query for data fetching
- IndexedDB for offline storage
- PWA configuration
- Service worker ready

✅ **Features Working**:
- Create/read habits (via API)
- Offline-first architecture
- Auto-sync when online
- IndexedDB caching
- PWA installable
- Dark/light theme ready
- Mobile responsive

✅ **Features To Build** (UI exists, needs polish):
- Habit creation form
- Calendar navigation
- Analytics charts
- Focus mode
- Reflection form
- Screen time tracking

---

**Ready to code!** Start by running both servers and exploring the codebase. 🚀
