# HabitAlgo

A professional, offline-first Progressive Web App (PWA) for personal habit tracking built with the MERN stack, TypeScript, and modern best practices.

![Tech Stack](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)
![PWA](https://img.shields.io/badge/PWA-Ready-purple)

---

## Features

### Core Functionality
- **Habit Management**: Create, update, and track up to 99 habits
- **Boolean & Numeric Tracking**: Track yes/no habits or count-based habits (reps, minutes, etc.)
- **Smart Calendar**: Navigate months/years with automatic data updates
- **Daily Check-ins**: Fast, mobile-optimized habit completion tracking
- **Streak Calculation**: Automatic streak tracking with visual indicators
- **Categories**: Health, Work, Mind, or Custom categories with color coding

### Offline-First Architecture
- **IndexedDB Storage**: All data cached locally using Dexie.js
- **Auto-Sync**: Automatic background sync when online
- **Conflict Resolution**: Smart merge strategy for offline changes
- **Queue System**: Reliable sync queue for offline operations
- **Works 100% Offline**: Full functionality without internet

### Analytics & Insights
- **Daily Completion Rate**: Track your daily progress
- **Monthly Summaries**: Pre-calculated monthly statistics
- **Streak Tracking**: Current and longest streaks per habit
- **Visual Charts**: Line, donut, and bar charts (Recharts)
- **Habit Rankings**: Best and worst performing habits

### PWA Features
- **Installable**: Install on mobile and desktop
- **App-like Experience**: Standalone display mode
- **Service Worker**: Workbox-powered offline caching
- **Push to Home Screen**: Works like a native app
- **Offline Page**: Graceful offline experience

### Advanced Features
- **Focus Mode**: Minimal UI for distraction-free tracking
- **Daily Reflection**: Journal entries with achievements and mood
- **Screen Time Tracking**: Track morning, day, evening, night usage
- **Dark Mode**: Auto, light, or dark theme support
- **TypeScript**: Full type safety across the stack

### 💡 Why & Identity Feature (NEW!)
- **Habit "Why" Statements**: Connect habits to personal meaning (500 chars)
- **Identity Anchoring**: Define who you're becoming (200 chars)
- **Motivational Prompts**: Evening reminders for missed habits with meaning
- **Weekly Review**: Reflect on progress with Start/Stop/Continue framework
- **Habit Detail Modal**: View stats and meaning in beautiful modal
- **Psychology-Backed**: 3x more likely to stick with meaningful habits

---

## Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Library**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Offline DB**: Dexie.js (IndexedDB wrapper)
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod validation
- **Date Utils**: date-fns
- **Routing**: React Router v6
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **PWA**: vite-plugin-pwa (Workbox)

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB (Atlas)
- **ODM**: Mongoose
- **Validation**: Built-in Mongoose validators
- **Security**: CORS, Rate Limiting
- **Logging**: Morgan

---

## Project Structure

```
trackHabit/
├── backend/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/
│   │   ├── habitController.js   # Habit CRUD logic
│   │   ├── logController.js     # Daily log operations
│   │   ├── analyticsController.js
│   │   ├── settingsController.js
│   │   └── syncController.js    # Offline sync logic
│   ├── middleware/
│   │   └── errorHandler.js      # Global error handling
│   ├── models/
│   │   ├── Habit.js
│   │   ├── DailyLog.js
│   │   ├── MonthlySummary.js
│   │   └── Settings.js
│   ├── routes/
│   │   ├── habits.js
│   │   ├── logs.js
│   │   ├── analytics.js
│   │   ├── settings.js
│   │   └── sync.js
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   │   └── pwa-*.png            # PWA icons
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/              # shadcn/ui components
│   │   │   ├── layout/
│   │   │   ├── habits/
│   │   │   ├── calendar/
│   │   │   ├── analytics/
│   │   │   └── focus/
│   │   ├── views/
│   │   │   ├── TodayView.tsx    # Main view
│   │   │   ├── MonthlyView.tsx
│   │   │   ├── AnalyticsView.tsx
│   │   │   └── FocusView.tsx
│   │   ├── store/
│   │   │   ├── useHabitStore.ts
│   │   │   ├── useLogStore.ts
│   │   │   └── useCalendarStore.ts
│   │   ├── services/
│   │   │   ├── habitService.ts
│   │   │   ├── logService.ts
│   │   │   ├── analyticsService.ts
│   │   │   └── syncService.ts
│   │   ├── lib/
│   │   │   ├── api.ts           # Axios instance
│   │   │   ├── db.ts            # IndexedDB (Dexie)
│   │   │   └── utils.ts
│   │   ├── utils/
│   │   │   ├── dateUtils.ts
│   │   │   ├── streakCalculator.ts
│   │   │   └── constants.ts
│   │   ├── types/
│   │   │   └── index.ts         # TypeScript types
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── package.json
│
├── ARCHITECTURE.md              # Detailed architecture docs
└── README.md                    # This file
```

---

## Installation & Setup

### Prerequisites
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** or **yarn**
- **MongoDB Atlas** account (or local MongoDB)

### 1. Clone Repository
```bash
cd trackHabit
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
# The .env file is already created with your MongoDB connection

# Start development server
npm run dev
```

Backend will run on **http://localhost:5000**

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Install missing dependency
npm install @radix-ui/react-progress

# Start development server
npm run dev
```

Frontend will run on **http://localhost:5173**

### 4. Access Application

Open **http://localhost:5173** in your browser.

---

## Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb+srv://ashking19102001_db_user:eCAa0fiaDdzfTcUw@tracker.sy6dcll.mongodb.net/habitTracker?retryWrites=true&w=majority
PORT=5000
NODE_ENV=development
```

### Frontend (.env - optional)
```env
VITE_API_URL=http://localhost:5000/api/v1
```

---

## 🚀 Deployment to Render

This app is ready to deploy on Render! See detailed guide: **[DEPLOYMENT_GUIDE.md](./docs/DEPLOYMENT_GUIDE.md)**

### Quick Steps:
1. Generate PWA icons (see [PWA_ICONS_GUIDE.md](./docs/PWA_ICONS_GUIDE.md))
2. Push code to GitHub
3. Deploy backend as Web Service on Render
4. Deploy frontend as Static Site on Render
5. Update environment variables

**Note**: Make sure to run `npm install @radix-ui/react-progress` before deploying!

📚 **See [docs/DEPLOYMENT_CHECKLIST.md](./docs/DEPLOYMENT_CHECKLIST.md)** for a complete pre-deployment checklist.

---

## Available Scripts

### Root (Run Both Frontend & Backend)
```bash
npm run install-all  # Install dependencies for both frontend & backend
npm run dev          # Run both servers concurrently (requires: npm install)
npm run dev:backend  # Run only backend
npm run dev:frontend # Run only frontend
npm run build        # Build frontend for production
npm start            # Start backend in production mode
```

**Note**: To use `npm run dev`, first install root dependencies:
```bash
npm install  # Installs concurrently package
```

### Backend (in backend/ folder)
```bash
npm start       # Production server
npm run dev     # Development with nodemon
npm run seed    # Seed database (if script exists)
```

### Frontend (in frontend/ folder)
```bash
npm run dev     # Development server
npm run build   # Production build
npm run preview # Preview production build
npm run lint    # ESLint check
```

---

## API Endpoints

### Base URL: `http://localhost:5000/api/v1`

#### Habits
```
GET    /habits              # Get all habits
POST   /habits              # Create habit
GET    /habits/:id          # Get habit by ID
PUT    /habits/:id          # Update habit
DELETE /habits/:id          # Soft delete habit
PATCH  /habits/:id/toggle   # Toggle active status
```

#### Daily Logs
```
GET    /logs                # Get logs (query: date, habitId, startDate, endDate)
POST   /logs                # Create/update log (upsert)
POST   /logs/bulk           # Bulk upsert
GET    /logs/day/:date      # Get all logs for date
PUT    /logs/:id            # Update log
DELETE /logs/:id            # Delete log
```

#### Analytics
```
GET    /analytics/summary   # Current month summary
GET    /analytics/month     # Monthly data (query: year, month)
GET    /analytics/streaks   # All habit streaks
GET    /analytics/trends    # Trends data
GET    /analytics/charts    # Chart data for dashboard
POST   /analytics/recalculate  # Recalculate summaries
```

#### Reflection & Screen Time
```
POST   /logs/reflection        # Save daily reflection
GET    /logs/reflection/:date  # Get reflection
POST   /logs/screentime        # Save screen time
GET    /logs/screentime/month  # Get monthly screen time
```

#### Settings
```
GET    /settings           # Get settings
PUT    /settings           # Update settings
PATCH  /settings/sync      # Update sync time
```

#### Sync
```
POST   /sync/push          # Push offline changes
GET    /sync/pull          # Pull latest data
POST   /sync/status        # Get sync status
```

---

## Database Schema

### Habit
```javascript
{
  name: String,
  category: 'Health' | 'Work' | 'Mind' | 'Custom',
  type: 'boolean' | 'numeric',
  targetMonthly: Number,
  isActive: Boolean,
  color: String (hex),
  icon: String (emoji),
  createdAt: Date,
  updatedAt: Date
}
```

### DailyLog
```javascript
{
  date: Date,
  habitId: ObjectId,
  completed: Boolean,
  value: Number,
  note: String,
  mood: Number (1-10),
  screenTime: { morning, day, evening, night },
  reflection: { text, achievements, energy }
}
```

### MonthlySummary (Pre-computed)
```javascript
{
  year: Number,
  month: Number,
  habitId: ObjectId,
  totalDays: Number,
  completedDays: Number,
  completionRate: Number,
  currentStreak: Number,
  longestStreak: Number,
  weeklyStats: [{ week, completed, total, rate }]
}
```

---

## Offline-First Strategy

### How It Works

1. **All operations write to IndexedDB first** (instant UI update)
2. **Operations queued for sync** (stored in `syncQueue` table)
3. **Auto-sync every 5 minutes** when online
4. **Background sync on network reconnect**
5. **Conflict resolution**: Server wins for habits, last-write-wins for logs

### Sync Flow

```
User Action
    ↓
Update IndexedDB (optimistic)
    ↓
Add to Sync Queue
    ↓
UI Updates Immediately
    ↓
Background: Wait for online
    ↓
Push changes to server
    ↓
Pull latest from server
    ↓
Merge changes
```

### Testing Offline Mode

1. Open DevTools → Network → Set to "Offline"
2. Create/update habits
3. Check habits
4. All works normally
5. Go back "Online"
6. Watch auto-sync in console

---

## PWA Installation

### Desktop (Chrome/Edge)
1. Click install icon in address bar
2. Click "Install"
3. App opens in standalone window

### Mobile (iOS)
1. Safari → Share button
2. "Add to Home Screen"
3. Tap icon on home screen

### Mobile (Android)
1. Chrome → Menu → "Install app"
2. Tap icon on home screen

---

## Adding New Features

### Add a New Habit Category
```typescript
// frontend/src/utils/constants.ts
export const CATEGORIES = [
  // ... existing
  { value: 'Social', label: 'Social', color: '#ec4899', icon: '👥' }
] as const;
```

### Add a New View
1. Create `frontend/src/views/MyView.tsx`
2. Add route in `App.tsx`
3. Add navigation link

### Add a New API Endpoint
1. Create controller function in `backend/controllers/`
2. Add route in `backend/routes/`
3. Add to router in `server.js`

---

## Performance Optimizations

- **Code Splitting**: Routes lazy-loaded
- **Memoization**: Heavy calculations cached
- **IndexedDB Indexing**: Optimized compound indexes
- **Debouncing**: Input and search operations
- **Virtual Scrolling**: For large habit lists (future)
- **Service Worker Caching**: Static assets cached

---

## Future Enhancements

### Phase 1 (Current)
- ✅ Single-user, no auth
- ✅ Offline-first
- ✅ PWA installable
- ✅ Basic analytics

### Phase 2 (Future)
- [ ] User authentication (JWT)
- [ ] Multi-device sync
- [ ] Push notifications
- [ ] Advanced charts (heatmaps, trends)
- [ ] Habit templates library
- [ ] Import/export data
- [ ] Goal setting & milestones

### Phase 3 (Advanced)
- [ ] Social features (optional sharing)
- [ ] AI-powered insights
- [ ] Habit recommendations
- [ ] Integration with health apps
- [ ] Calendar integrations

---

## Troubleshooting

### Backend won't start
```bash
# Check MongoDB connection
# Verify .env file exists
# Check port 5000 is not in use
```

### Frontend build fails
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### IndexedDB errors
```bash
# Clear browser data
# Check browser compatibility (Chrome 60+, Firefox 58+)
```

### Sync not working
```bash
# Check network tab for API errors
# Verify backend is running
# Check CORS settings
```

---

## Browser Support

| Browser | Version |
|---------|---------|
| Chrome  | 90+     |
| Firefox | 88+     |
| Safari  | 14+     |
| Edge    | 90+     |

---

## License

MIT License - Feel free to use for personal projects.

---

## Tech Highlights

### Industry Best Practices Used:
- ✅ **TypeScript** for type safety
- ✅ **shadcn/ui** for accessible, customizable components
- ✅ **TanStack Query** for server state management
- ✅ **Zustand** for client state (lightweight vs Redux)
- ✅ **Zod** for runtime validation
- ✅ **Dexie.js** for robust IndexedDB operations
- ✅ **Workbox** for production-ready service workers
- ✅ **Compound indexes** in MongoDB for performance
- ✅ **Error boundaries** for graceful failures
- ✅ **Optimistic UI updates** for instant feedback
- ✅ **CORS & Rate Limiting** for security
- ✅ **Mongoose validation** on backend
- ✅ **Custom hooks** for reusable logic
- ✅ **Path aliases** (@/) for clean imports

---

## Credits

Built with modern web technologies and best practices for a production-ready habit tracking experience.

**Stack**: MERN + TypeScript + PWA + Offline-First Architecture

---

## 📚 Documentation

All detailed documentation is in the **[docs/](./docs/)** folder:

- **[DEPLOYMENT_GUIDE.md](./docs/DEPLOYMENT_GUIDE.md)** - Complete Render deployment guide
- **[DEPLOYMENT_CHECKLIST.md](./docs/DEPLOYMENT_CHECKLIST.md)** - Pre-deployment checklist
- **[PWA_ICONS_GUIDE.md](./docs/PWA_ICONS_GUIDE.md)** - How to generate PWA icons
- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - Technical architecture details
- **[WHY_IDENTITY_FEATURE.md](./docs/WHY_IDENTITY_FEATURE.md)** - Psychology-backed Why & Identity feature
- **[ENHANCEMENT_ROADMAP.md](./docs/ENHANCEMENT_ROADMAP.md)** - Future enhancements and features

---

## Getting Help

- Check **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** for detailed technical documentation
- Review API endpoints in this README
- Check browser console for errors
- Verify MongoDB Atlas connection

---

**Happy Habit Tracking!** 🚀
#   H a b i t A l g o  
 