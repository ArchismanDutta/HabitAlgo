# 🚀 Deployment Guide for Render

This guide will help you deploy HabitAlgo on Render with both backend and frontend.

---

## 📋 Prerequisites

1. **Render Account**: Sign up at [https://render.com](https://render.com)
2. **GitHub Repository**: Push this code to a GitHub repository
3. **MongoDB Atlas**: Get a MongoDB connection string from [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)

---

## 🗄️ Step 1: Deploy Backend (Web Service)

### 1.1 Create a New Web Service

1. Log in to Render Dashboard
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select your repository

### 1.2 Configure Web Service

**Basic Settings:**
- **Name**: `habitalgo-api` (or any name you prefer)
- **Region**: Choose closest to your users
- **Branch**: `main` (or your default branch)
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**Instance Type:**
- Free tier is fine for testing
- Upgrade to Starter ($7/month) for production

### 1.3 Environment Variables

Click **"Advanced"** and add these environment variables:

| Key | Value | Example |
|-----|-------|---------|
| `NODE_ENV` | `production` | `production` |
| `MONGODB_URI` | Your MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/habitTracker` |
| `PORT` | `10000` (Render default) | `10000` |
| `CLIENT_URL` | Your frontend URL (add after frontend is deployed) | `https://your-app.onrender.com` |

### 1.4 Deploy

Click **"Create Web Service"**

Render will:
- Clone your repository
- Install dependencies
- Start your Node.js server
- Provide a URL like: `https://habitalgo-api.onrender.com`

**Save this backend URL** - you'll need it for the frontend!

---

## 🎨 Step 2: Deploy Frontend (Static Site)

### 2.1 Create a New Static Site

1. In Render Dashboard, click **"New +"** → **"Static Site"**
2. Connect the same GitHub repository
3. Select your repository

### 2.2 Configure Static Site

**Basic Settings:**
- **Name**: `habitalgo` (or any name you prefer)
- **Region**: Same as backend
- **Branch**: `main`
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`

### 2.3 Environment Variables

Click **"Advanced"** and add:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://habitalgo-api.onrender.com/api/v1` |

**Important**: Replace `habitalgo-api.onrender.com` with your actual backend URL from Step 1.4

### 2.4 Deploy

Click **"Create Static Site"**

Render will:
- Clone your repository
- Run `npm install`
- Build your React app with Vite
- Deploy to CDN
- Provide a URL like: `https://habitalgo.onrender.com`

---

## 🔄 Step 3: Update Backend with Frontend URL

1. Go to your **Backend Web Service** in Render Dashboard
2. Click **"Environment"** tab
3. Update `CLIENT_URL` to your frontend URL
4. Click **"Save Changes"**
5. Render will automatically redeploy

---

## ✅ Step 4: Verify Deployment

### Test Backend

Visit: `https://your-backend-url.onrender.com/health`

You should see:
```json
{
  "success": true,
  "message": "Habit Tracker API is running",
  "timestamp": "2025-01-01T12:00:00.000Z"
}
```

### Test Frontend

1. Visit: `https://your-frontend-url.onrender.com`
2. You should see the app load
3. Try creating a habit
4. Check if it syncs to the backend

---

## 📱 PWA Features

### Install App on Mobile

**iOS (Safari):**
1. Open the app in Safari
2. Tap the "Share" button
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add"

**Android (Chrome):**
1. Open the app in Chrome
2. Tap the three dots menu
3. Tap "Add to Home screen" or "Install app"
4. Tap "Install"

### Offline Mode

The app works offline! Once installed:
- All data is cached in IndexedDB
- Changes sync when you're back online
- Service worker caches static assets

---

## 🎨 Custom Domain (Optional)

### For Static Site (Frontend)

1. Go to your Static Site in Render
2. Click **"Settings"** → **"Custom Domains"**
3. Click **"Add Custom Domain"**
4. Enter your domain (e.g., `habits.yourdomain.com`)
5. Follow the DNS setup instructions

### For Web Service (Backend)

1. Go to your Web Service in Render
2. Click **"Settings"** → **"Custom Domains"**
3. Add subdomain (e.g., `api.yourdomain.com`)
4. Update `VITE_API_URL` in frontend to use new domain
5. Redeploy frontend

---

## 🔧 Troubleshooting

### Backend Issues

**Problem**: Can't connect to MongoDB
- **Solution**: Check MongoDB Atlas IP whitelist (allow all: `0.0.0.0/0`)
- **Solution**: Verify MongoDB connection string in environment variables

**Problem**: CORS errors
- **Solution**: Ensure `CLIENT_URL` matches your frontend URL exactly
- **Solution**: Check that frontend URL doesn't have trailing slash

**Problem**: Server crashes
- **Solution**: Check Render logs: Dashboard → Your Service → "Logs" tab
- **Solution**: Verify all environment variables are set

### Frontend Issues

**Problem**: Can't connect to API
- **Solution**: Verify `VITE_API_URL` is correct
- **Solution**: Check browser console for errors
- **Solution**: Ensure backend is running (visit `/health` endpoint)

**Problem**: Build fails
- **Solution**: Check Render build logs
- **Solution**: Make sure all dependencies are in `package.json`
- **Solution**: Try building locally: `npm run build`

**Problem**: PWA not installing
- **Solution**: Ensure you're using HTTPS (Render provides this)
- **Solution**: Check manifest.json is accessible
- **Solution**: Use Lighthouse in Chrome DevTools to audit PWA

### Free Tier Limitations

**Render Free Tier:**
- Services spin down after 15 minutes of inactivity
- First request after inactivity may take 30-60 seconds
- 750 hours/month free (enough for one service running 24/7)

**Solution for slow cold starts:**
- Upgrade to Starter plan ($7/month)
- Or use a uptime monitor like [UptimeRobot](https://uptimerobot.com) to ping your app every 5 minutes

---

## 🚀 Production Checklist

Before going live:

- [ ] MongoDB Atlas has proper security (strong password, IP whitelist)
- [ ] Environment variables are set correctly
- [ ] Backend health check returns 200
- [ ] Frontend can create/fetch habits
- [ ] PWA installs correctly on iOS and Android
- [ ] Offline mode works (test with DevTools → Network → Offline)
- [ ] Custom domain configured (optional)
- [ ] Analytics/monitoring setup (optional)

---

## 📊 Monitoring

### Free Options

1. **Render Dashboard**: Built-in metrics and logs
2. **UptimeRobot**: Free uptime monitoring
3. **Google Analytics**: Add to track usage (optional)

### Paid Options

1. **Sentry**: Error tracking ($26/month)
2. **LogRocket**: Session replay ($99/month)
3. **New Relic**: Full observability (free tier available)

---

## 🔄 Updates & Redeployment

Render auto-deploys on every Git push to your connected branch.

**Manual Redeploy:**
1. Go to Service/Site in Dashboard
2. Click **"Manual Deploy"** → **"Deploy latest commit"**

**Rollback:**
1. Go to **"Events"** tab
2. Find previous successful deploy
3. Click **"Rollback to this version"**

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)
- [MongoDB Atlas](https://www.mongodb.com/docs/atlas/)
- [PWA Best Practices](https://web.dev/progressive-web-apps/)

---

## 🎉 You're Done!

Your HabitAlgo app is now live! Share the URL with friends or install it on your phone.

**Questions?** Check the troubleshooting section or open an issue on GitHub.

---

**Next Steps:**
- Generate PWA icons (see PWA_ICONS_GUIDE.md)
- Set up custom domain
- Add analytics
- Monitor performance
