# 🚀 Render Deployment Guide - Step by Step

This guide will walk you through deploying HabitAlgo on Render from scratch.

## 📋 Prerequisites

Before starting, make sure you have:

✅ A GitHub account (to host your code)
✅ A Render account (sign up at https://render.com - FREE tier available)
✅ MongoDB Atlas account (FREE tier) with connection string
✅ Your code pushed to a GitHub repository

---

## 🎯 Step 1: Prepare Your Code for Deployment

### 1.1 Update Backend CORS Configuration

Your backend needs to accept requests from your Render frontend domain.

**File**: `backend/server.js`

Make sure your CORS configuration includes your production domain:

```javascript
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.CLIENT_URL  // Will be set to your frontend URL
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
```

### 1.2 Verify Backend Start Script

**File**: `backend/package.json`

Ensure you have:
```json
{
  "scripts": {
    "start": "node server.js"
  }
}
```

✅ **Already configured!**

### 1.3 Verify Frontend Build Script

**File**: `frontend/package.json`

Ensure you have:
```json
{
  "scripts": {
    "build": "tsc && vite build"
  }
}
```

✅ **Already configured!**

---

## 🌐 Step 2: Push Your Code to GitHub

### 2.1 Initialize Git (if not already done)

```bash
# In your project root directory
git init
git add .
git commit -m "Initial commit - ready for deployment"
```

### 2.2 Create GitHub Repository

1. Go to https://github.com
2. Click **"New repository"**
3. Name it: `habitalgo`
4. Keep it **Public** (required for Render free tier)
5. **DO NOT** initialize with README (you already have one)
6. Click **"Create repository"**

### 2.3 Push to GitHub

```bash
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/habitalgo.git
git branch -M main
git push -u origin main
```

**✅ Checkpoint**: Your code is now on GitHub!

---

## 🔧 Step 3: Set Up MongoDB Atlas (If Not Already Done)

### 3.1 Get Your MongoDB Connection String

You already have one in `backend/.env`:
```
mongodb+srv://ashking19102001_db_user:eCAa0fiaDdzfTcUw@tracker.sy6dcll.mongodb.net/
```

**IMPORTANT**: Add a database name to the end:
```
mongodb+srv://ashking19102001_db_user:eCAa0fiaDdzfTcUw@tracker.sy6dcll.mongodb.net/habitalgo
```

### 3.2 Whitelist Render IP Addresses

1. Go to MongoDB Atlas Dashboard
2. Navigate to **Network Access**
3. Click **"Add IP Address"**
4. Select **"Allow Access from Anywhere"** (0.0.0.0/0)
5. Click **"Confirm"**

⚠️ **Note**: This is required for Render to connect. For production, you can restrict to Render's IP ranges later.

---

## 🚀 Step 4: Deploy Backend on Render

### 4.1 Create Render Account

1. Go to https://render.com
2. Click **"Get Started for Free"**
3. Sign up with your **GitHub account** (recommended)

### 4.2 Create New Web Service for Backend

1. From Render Dashboard, click **"New +"**
2. Select **"Web Service"**
3. Click **"Connect Account"** to connect your GitHub
4. Find and select your **habitalgo** repository
5. Click **"Connect"**

### 4.3 Configure Backend Service

Fill in the following settings:

| Setting | Value |
|---------|-------|
| **Name** | `habitalgo-api` |
| **Region** | Choose closest to you (e.g., `Oregon (US West)`) |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` |

### 4.4 Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Add these variables:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | `mongodb+srv://ashking19102001_db_user:eCAa0fiaDdzfTcUw@tracker.sy6dcll.mongodb.net/habitalgo` |
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `CLIENT_URL` | Leave blank for now (we'll add this after deploying frontend) |

### 4.5 Deploy Backend

1. Click **"Create Web Service"**
2. Wait 2-5 minutes for deployment
3. Watch the logs for any errors
4. Once deployed, you'll see: ✅ **"Live"**

**Your Backend URL**: `https://habitalgo-api.onrender.com`

### 4.6 Test Backend

Open in browser:
```
https://habitalgo-api.onrender.com/health
```

You should see:
```json
{
  "success": true,
  "message": "HabitAlgo API is running",
  "timestamp": "2025-01-01T12:00:00.000Z"
}
```

✅ **Checkpoint**: Backend is deployed and running!

---

## 🎨 Step 5: Deploy Frontend on Render

### 5.1 Create New Static Site for Frontend

1. From Render Dashboard, click **"New +"**
2. Select **"Static Site"**
3. Select your **habitalgo** repository again
4. Click **"Connect"**

### 5.2 Configure Frontend Service

| Setting | Value |
|---------|-------|
| **Name** | `habitalgo` |
| **Branch** | `main` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

### 5.3 Add Frontend Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://habitalgo-api.onrender.com/api/v1` |
| `VITE_APP_NAME` | `HabitAlgo` |
| `VITE_APP_VERSION` | `1.0.0` |

### 5.4 Deploy Frontend

1. Click **"Create Static Site"**
2. Wait 3-7 minutes for build and deployment
3. Watch the build logs
4. Once deployed, you'll see: ✅ **"Live"**

**Your Frontend URL**: `https://habitalgo.onrender.com`

✅ **Checkpoint**: Frontend is deployed!

---

## 🔗 Step 6: Connect Frontend to Backend (CORS)

### 6.1 Update Backend Environment Variables

1. Go to your **habitalgo-api** service on Render
2. Click **"Environment"** in the left sidebar
3. Click **"Add Environment Variable"**
4. Add:

| Key | Value |
|-----|-------|
| `CLIENT_URL` | `https://habitalgo.onrender.com` |

5. Click **"Save Changes"**

This will trigger a **re-deploy** of your backend (takes 1-2 minutes).

### 6.2 Verify Backend Accepts Frontend Requests

Your backend's CORS configuration will now allow requests from `https://habitalgo.onrender.com`.

---

## ✅ Step 7: Test Your Deployed Application

### 7.1 Open Your App

Go to: **https://habitalgo.onrender.com**

### 7.2 Test Core Functionality

1. **Create a habit**:
   - Click **"+ New Habit"**
   - Fill in name, category, etc.
   - Click **"Create"**
   - ✅ Should save successfully

2. **Complete a habit**:
   - Go to **"Today"** view
   - Click a habit checkbox
   - ✅ Should show green checkmark

3. **View Grid**:
   - Go to **"Grid"** view
   - ✅ Should show your habits in a calendar grid

4. **Check Analytics**:
   - Go to **"Charts"** view
   - ✅ Should show completion charts (after you have some data)

### 7.3 Check Browser Console

1. Open DevTools (F12)
2. Go to **Console** tab
3. ✅ Should see no critical errors
4. You should see logs like:
   ```
   [LogStore] Upserting log: {...}
   [LogStore] Log upserted successfully: {...}
   ```

### 7.4 Test PWA Installation

1. Look for install icon in browser address bar
2. Click to install as PWA
3. ✅ App should install and work offline

---

## 🐛 Troubleshooting

### Problem: "Failed to fetch" errors

**Cause**: CORS not configured properly

**Fix**:
1. Check that `CLIENT_URL` is set in backend environment variables
2. Verify it matches your frontend URL exactly (no trailing slash)
3. Check backend logs on Render for CORS errors

### Problem: Backend won't start

**Cause**: MongoDB connection failed

**Fix**:
1. Verify `MONGODB_URI` is correct in environment variables
2. Check MongoDB Atlas Network Access allows `0.0.0.0/0`
3. Make sure database name is included in URI: `...mongodb.net/habitalgo`

### Problem: Frontend shows blank page

**Cause**: Build failed or environment variables missing

**Fix**:
1. Check Render build logs for errors
2. Verify `VITE_API_URL` is set correctly
3. Try redeploying: **"Manual Deploy"** → **"Deploy latest commit"**

### Problem: "Free instance will spin down with inactivity"

**Expected behavior**: Render free tier sleeps after 15 minutes of inactivity. First request after sleep takes 30-60 seconds.

**Fix**:
- Upgrade to paid tier ($7/month) for always-on service
- OR accept the cold start delay

---

## 📝 Post-Deployment Checklist

✅ Backend health check works: `https://habitalgo-api.onrender.com/health`
✅ Frontend loads: `https://habitalgo.onrender.com`
✅ Can create habits
✅ Can mark habits as complete
✅ Grid view works
✅ Charts display (with data)
✅ PWA can be installed
✅ Works offline after installation

---

## 🔄 Making Updates After Deployment

### To update your app:

1. **Make changes locally**
2. **Commit changes**:
   ```bash
   git add .
   git commit -m "Your update description"
   ```
3. **Push to GitHub**:
   ```bash
   git push origin main
   ```
4. **Render auto-deploys** within 1-2 minutes!

You can also trigger manual deploys from Render dashboard.

---

## 💰 Cost Breakdown

### Free Tier (What you're using):
- ✅ **Backend**: Free (sleeps after 15 min inactivity)
- ✅ **Frontend**: Free (always on)
- ✅ **MongoDB Atlas**: Free (512MB storage)
- **Total**: **$0/month**

### Paid Tier (Optional upgrade):
- **Backend**: $7/month (always on, faster)
- **Frontend**: Free (always on)
- **MongoDB Atlas**: Free (512MB) or $9/month (2GB)
- **Total**: ~$7-16/month

---

## 🎉 Congratulations!

Your HabitAlgo app is now live and accessible to anyone at:

**🌐 https://habitalgo.onrender.com**

Share it with friends and start tracking habits!

---

## 📞 Need Help?

If you encounter issues not covered here:

1. Check Render logs (Dashboard → Your Service → Logs)
2. Check MongoDB Atlas logs
3. Review browser console for frontend errors
4. Check the main DEPLOYMENT_GUIDE.md for more details
