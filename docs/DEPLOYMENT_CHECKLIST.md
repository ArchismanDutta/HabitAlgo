# 📋 Pre-Deployment Checklist

Complete this checklist before deploying to production.

---

## ✅ Code & Dependencies

- [ ] **Install missing dependencies**
  ```bash
  cd frontend
  npm install @radix-ui/react-progress
  ```

- [ ] **Run production build locally**
  ```bash
  cd frontend
  npm run build
  ```
  - Check for build errors
  - Verify `dist/` folder is created

- [ ] **Test backend locally**
  ```bash
  cd backend
  NODE_ENV=production npm start
  ```

- [ ] **All environment variables configured**
  - Backend: `MONGODB_URI`, `PORT`, `NODE_ENV`, `CLIENT_URL`
  - Frontend: `VITE_API_URL`

---

## 🎨 PWA Icons & Assets

- [ ] **Generate all PWA icons** (Required!)
  - Option 1: Use `@vite-pwa/assets-generator`
  - Option 2: Use [RealFaviconGenerator.net](https://realfavicongenerator.net/)
  - See [PWA_ICONS_GUIDE.md](./PWA_ICONS_GUIDE.md) for details

- [ ] **Required icons created in `frontend/public/`:**
  - `favicon-16x16.png`
  - `favicon-32x32.png`
  - `apple-touch-icon.png` (180×180)
  - `pwa-192x192.png`
  - `pwa-512x512.png`

- [ ] **Optional but recommended:**
  - iOS splash screens (in `/splash/` folder)
  - `og-image.png` for social sharing
  - `screenshot-mobile.png` and `screenshot-wide.png`

- [ ] **manifest.json exists in `frontend/public/`**
  - Verify it's valid JSON
  - Check icon paths are correct

---

## 🗄️ Database Setup

- [ ] **MongoDB Atlas configured**
  - Database created
  - User created with read/write permissions
  - IP whitelist set to `0.0.0.0/0` (allow all) for Render
  - Connection string tested

- [ ] **Connection string format correct:**
  ```
  mongodb+srv://username:password@cluster.mongodb.net/databaseName?retryWrites=true&w=majority
  ```

---

## 📱 Mobile & PWA Testing

- [ ] **Test PWA installation locally**
  - Desktop Chrome: Install button appears
  - Mobile Android: Add to Home screen works
  - Mobile iOS Safari: Add to Home screen works

- [ ] **Test offline functionality**
  - DevTools → Network → Offline
  - App still loads and works
  - Changes sync when back online

- [ ] **Test on real devices**
  - iPhone (Safari)
  - Android phone (Chrome)
  - Tablet (optional)

- [ ] **Responsive design verified**
  - Mobile (320px - 480px)
  - Tablet (768px - 1024px)
  - Desktop (1280px+)

---

## 🔒 Security & Performance

- [ ] **CORS configured correctly**
  - `CLIENT_URL` in backend points to frontend domain
  - No wildcards in production

- [ ] **Rate limiting enabled**
  - Check `express-rate-limit` is configured
  - Default: 100 requests per 15 minutes

- [ ] **Secrets not exposed**
  - No API keys in frontend code
  - `.env` files not committed to Git
  - MongoDB password not in public files

- [ ] **Performance checks**
  - Lighthouse audit score > 90 for PWA
  - No console errors
  - Network requests optimized

---

## 🚀 Git & GitHub

- [ ] **Code pushed to GitHub**
  ```bash
  git add .
  git commit -m "Prepare for deployment"
  git push origin main
  ```

- [ ] **`.gitignore` configured**
  - `node_modules/` excluded
  - `.env` files excluded
  - `dist/` folder excluded

- [ ] **Repository is public or Render has access**

---

## 🌐 Render Deployment

### Backend (Web Service)

- [ ] **Create Web Service on Render**
  - Name: `habit-tracker-api`
  - Root Directory: `backend`
  - Build Command: `npm install`
  - Start Command: `npm start`
  - Instance: Free or Starter

- [ ] **Environment variables added:**
  - `NODE_ENV` = `production`
  - `MONGODB_URI` = (your MongoDB connection string)
  - `PORT` = `10000`
  - `CLIENT_URL` = (will add after frontend deployed)

- [ ] **Health check works**
  - Visit: `https://your-backend.onrender.com/health`
  - Should return JSON with `success: true`

### Frontend (Static Site)

- [ ] **Create Static Site on Render**
  - Name: `habit-tracker`
  - Root Directory: `frontend`
  - Build Command: `npm install && npm run build`
  - Publish Directory: `dist`

- [ ] **Environment variables added:**
  - `VITE_API_URL` = `https://your-backend.onrender.com/api/v1`

- [ ] **Build succeeds on Render**
  - Check build logs for errors
  - Verify deployment URL works

### Post-Deployment

- [ ] **Update backend `CLIENT_URL`**
  - Go to backend service
  - Add/update `CLIENT_URL` to frontend URL
  - Redeploy backend

- [ ] **Test production app**
  - Visit frontend URL
  - Create a habit
  - Mark it complete
  - Check it syncs to backend
  - Refresh page - data should persist

---

## 🧪 Production Testing

- [ ] **Core functionality works:**
  - [ ] Create habit
  - [ ] Edit habit
  - [ ] Delete habit
  - [ ] Mark habit complete
  - [ ] View today's habits
  - [ ] View calendar grid
  - [ ] View analytics

- [ ] **Why & Identity features work:**
  - [ ] Add "why" and identity to habit
  - [ ] View in habit detail modal
  - [ ] See identity in Today/Focus views
  - [ ] Weekly review shows struggling habits
  - [ ] Missed habit prompts appear (after 6 PM)

- [ ] **PWA features work:**
  - [ ] Install on mobile
  - [ ] Works offline
  - [ ] Auto-syncs when online
  - [ ] Push notifications (if enabled)

- [ ] **Cross-browser testing:**
  - [ ] Chrome (Desktop & Mobile)
  - [ ] Safari (Desktop & iOS)
  - [ ] Firefox (Desktop)
  - [ ] Edge (Desktop)

---

## 📊 Monitoring & Analytics

- [ ] **Set up monitoring** (Optional)
  - UptimeRobot for uptime monitoring
  - Sentry for error tracking
  - Google Analytics for usage

- [ ] **Check Render dashboard**
  - No errors in logs
  - Services are running
  - No excessive resource usage

---

## 📝 Documentation

- [ ] **README.md updated**
  - Deployment section complete
  - Environment variables documented
  - Known issues listed

- [ ] **DEPLOYMENT_GUIDE.md reviewed**
  - All steps accurate
  - Links work
  - Examples are correct

- [ ] **Screenshot/demo ready** (Optional)
  - Take screenshots for README
  - Record demo video
  - Create GIF of core features

---

## 🎉 Post-Launch

- [ ] **Share with testers**
  - Send link to friends/family
  - Collect feedback
  - Monitor for issues

- [ ] **Install on your own device**
  - Add to home screen
  - Use daily for testing
  - Track real-world usage

- [ ] **Monitor first 24 hours**
  - Check Render logs
  - Watch for errors
  - Verify sync works correctly

---

## 🐛 Common Issues Checklist

If something doesn't work, check:

- [ ] MongoDB IP whitelist allows Render's IPs
- [ ] `CLIENT_URL` and `VITE_API_URL` match exactly
- [ ] No trailing slashes in URLs
- [ ] Environment variables saved and deployed
- [ ] PWA icons exist and are correct sizes
- [ ] manifest.json is valid JSON
- [ ] CORS is configured in backend
- [ ] Both backend and frontend are deployed

---

## ✅ Final Pre-Launch Command

Run this before deploying:

```bash
# Backend
cd backend
npm install
npm start  # Test locally

# Frontend
cd frontend
npm install
npm install @radix-ui/react-progress
npm run build  # Must succeed
npm run preview  # Test production build

# If all good, commit and push
git add .
git commit -m "Ready for production deployment"
git push origin main
```

---

## 🎯 Success Criteria

Your deployment is successful when:

✅ Frontend loads without errors
✅ Backend health check returns 200
✅ Can create and track habits
✅ Data persists after refresh
✅ Works offline
✅ PWA installs on mobile
✅ Identity statements display correctly
✅ Weekly review works

---

**Once all items are checked, you're ready to deploy!** 🚀

Good luck! 🎉
