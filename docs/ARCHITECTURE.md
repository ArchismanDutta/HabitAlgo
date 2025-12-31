# Ultimate Habit Tracker - System Architecture

## 🏗️ SYSTEM OVERVIEW

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │          React PWA (Vite + React Router)            │   │
│  │  ┌──────────┐ ┌──────────┐ ┌────────────────────┐  │   │
│  │  │  Views   │ │Components│ │   Hooks & Context  │  │   │
│  │  └──────────┘ └──────────┘ └────────────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
│                           ↕                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              OFFLINE-FIRST LAYER                    │   │
│  │  ┌────────────────┐  ┌─────────────────────────┐   │   │
│  │  │   IndexedDB    │  │   Service Worker        │   │   │
│  │  │  (Dexie.js)    │  │   (Workbox)            │   │   │
│  │  └────────────────┘  └─────────────────────────┘   │   │
│  │  ┌────────────────────────────────────────────┐    │   │
│  │  │   Sync Manager (Online/Offline Bridge)     │    │   │
│  │  └────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           ↕ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                        SERVER LAYER                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │       Express.js API Server (Node.js)               │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │   │
│  │  │  Routes  │ │Controllers│ │   Middleware     │   │   │
│  │  └──────────┘ └──────────┘ └──────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
│                           ↕                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │       MongoDB + Mongoose (Data Persistence)         │   │
│  │  Collections: habits | dailyLogs | settings         │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 DATABASE SCHEMA

### 1. Habit Model
```javascript
{
  _id: ObjectId,
  name: String (required, max 100 chars),
  category: String (enum: ['Health', 'Work', 'Mind', 'Custom']),
  customCategory: String (if category = 'Custom'),
  type: String (enum: ['boolean', 'numeric']),
  numericConfig: {
    unit: String ('minutes', 'reps', 'count', 'custom'),
    customUnit: String
  },
  targetMonthly: Number (default 0),
  isActive: Boolean (default true),
  color: String (hex color for UI),
  icon: String (emoji or icon identifier),
  createdAt: Date,
  updatedAt: Date
}

Indexes:
- isActive: 1, createdAt: -1 (for active habits list)
- category: 1 (for filtering)
```

### 2. DailyLog Model
```javascript
{
  _id: ObjectId,
  date: Date (required, unique composite with habitId),
  habitId: ObjectId (ref: 'Habit', required),

  // Check-in data
  completed: Boolean (for boolean habits),
  value: Number (for numeric habits),

  // Metadata
  note: String (max 500 chars),
  mood: Number (1-10, optional),

  // Screen time (stored at day level, not habit level)
  screenTime: {
    morning: Number (minutes),
    day: Number,
    evening: Number,
    night: Number
  },

  // Daily reflection (one per day, not per habit)
  reflection: {
    text: String (max 2000 chars),
    achievements: [String],
    energy: Number (1-10)
  },

  createdAt: Date,
  updatedAt: Date
}

Indexes:
- { date: -1, habitId: 1 } (compound index for queries)
- { habitId: 1, date: -1 } (for habit-specific history)
- { date: -1 } (for daily views)

Note: Screen time & reflection stored as denormalized fields
in the first dailyLog entry of each day for simplicity.
```

### 3. MonthlySummary Model (Pre-computed)
```javascript
{
  _id: ObjectId,
  year: Number (required),
  month: Number (1-12, required),
  habitId: ObjectId (ref: 'Habit'),

  // Computed metrics
  totalDays: Number,
  completedDays: Number,
  completionRate: Number (percentage),
  currentStreak: Number,
  longestStreak: Number,
  totalValue: Number (for numeric habits),

  // Weekly breakdown
  weeklyStats: [{
    week: Number (1-5),
    completed: Number,
    total: Number
  }],

  lastCalculated: Date,
  createdAt: Date
}

Indexes:
- { year: 1, month: 1, habitId: 1 } (unique compound)
- { habitId: 1, year: -1, month: -1 } (for trends)
```

### 4. Settings Model (Single Document)
```javascript
{
  _id: ObjectId (single document, always same ID),

  // UI Preferences
  theme: String (enum: ['light', 'dark', 'auto']),
  primaryView: String (enum: ['today', 'monthly', 'weekly', 'analytics']),

  // Calendar state
  selectedMonth: Number (1-12),
  selectedYear: Number,

  // Display options
  showStreaks: Boolean (default true),
  showCompletionRate: Boolean (default true),
  compactMode: Boolean (default false),

  // Data
  lastSyncTime: Date,
  totalHabits: Number,

  updatedAt: Date
}

Indexes:
- None needed (single document)
```

---

## 🔌 API ROUTES

### Base URL: `/api/v1`

#### Habits
```
GET    /habits              → Get all habits (with optional filter ?active=true)
POST   /habits              → Create new habit
GET    /habits/:id          → Get specific habit with recent logs
PUT    /habits/:id          → Update habit
DELETE /habits/:id          → Soft delete (set isActive = false)
PATCH  /habits/:id/toggle   → Toggle active/paused
```

#### Daily Logs
```
GET    /logs                → Get logs (query: ?date=YYYY-MM-DD&habitId=xxx)
POST   /logs                → Create/update daily log (upsert by date+habitId)
GET    /logs/day/:date      → Get all logs for specific date
POST   /logs/bulk           → Bulk create/update (for backfill)
PUT    /logs/:id            → Update specific log
DELETE /logs/:id            → Delete log
```

#### Analytics
```
GET    /analytics/summary   → Get current month summary
GET    /analytics/month     → Get monthly data (query: ?year=2025&month=1)
GET    /analytics/streaks   → Get all habit streaks
GET    /analytics/trends    → Get weekly/monthly trends
GET    /analytics/charts    → Get chart data for dashboard
```

#### Reflection & Screen Time
```
GET    /reflection/:date    → Get daily reflection
POST   /reflection          → Save daily reflection
GET    /screentime/month    → Get screen time for month
POST   /screentime          → Update daily screen time
```

#### Settings
```
GET    /settings            → Get user settings
PUT    /settings            → Update settings
PATCH  /settings/sync       → Update last sync time
```

#### Sync
```
POST   /sync/push           → Push offline changes to server
GET    /sync/pull           → Pull latest data from server
POST   /sync/status         → Check sync status
```

---

## 🎨 FRONTEND STRUCTURE

```
src/
├── main.jsx                 # Entry point
├── App.jsx                  # Root component with routing
├── index.css                # Tailwind imports
│
├── assets/
│   └── icons/              # PWA icons
│
├── components/
│   ├── layout/
│   │   ├── Header.jsx      # Top bar with calendar selector
│   │   ├── Navigation.jsx  # Bottom nav (mobile) / side nav (desktop)
│   │   └── Layout.jsx      # Main layout wrapper
│   │
│   ├── habits/
│   │   ├── HabitCard.jsx   # Individual habit in grid
│   │   ├── HabitGrid.jsx   # Daily habit list
│   │   ├── HabitForm.jsx   # Create/edit habit modal
│   │   └── HabitStats.jsx  # Mini stats for habit card
│   │
│   ├── calendar/
│   │   ├── MonthSelector.jsx
│   │   ├── YearSelector.jsx
│   │   ├── CalendarGrid.jsx    # Monthly view grid
│   │   └── WeekView.jsx
│   │
│   ├── analytics/
│   │   ├── DashboardCard.jsx
│   │   ├── LineChart.jsx       # Daily consistency
│   │   ├── DonutChart.jsx      # Completion rate
│   │   ├── BarChart.jsx        # Weekly comparison
│   │   └── HabitRanking.jsx    # Top/worst habits
│   │
│   ├── focus/
│   │   ├── FocusView.jsx       # Minimal today view
│   │   ├── ReflectionForm.jsx  # Daily reflection
│   │   └── ScreenTimeInput.jsx
│   │
│   └── common/
│       ├── Button.jsx
│       ├── Modal.jsx
│       ├── Checkbox.jsx
│       ├── Input.jsx
│       ├── Spinner.jsx
│       └── Empty.jsx
│
├── views/
│   ├── TodayView.jsx       # Default view
│   ├── MonthlyView.jsx     # Calendar grid
│   ├── WeeklyView.jsx      # Week summary
│   ├── AnalyticsView.jsx   # Charts dashboard
│   ├── FocusView.jsx       # Minimal mode
│   └── SettingsView.jsx    # Preferences
│
├── hooks/
│   ├── useHabits.js        # Habit CRUD operations
│   ├── useDailyLogs.js     # Log operations
│   ├── useAnalytics.js     # Analytics data
│   ├── useOfflineSync.js   # Sync manager
│   ├── useCalendar.js      # Month/year state
│   └── useTheme.js         # Dark mode toggle
│
├── context/
│   ├── HabitContext.jsx    # Global habit state
│   ├── CalendarContext.jsx # Selected month/year
│   └── SyncContext.jsx     # Sync status
│
├── services/
│   ├── api.js              # Axios instance
│   ├── habitService.js     # Habit API calls
│   ├── logService.js       # Log API calls
│   ├── analyticsService.js # Analytics API
│   ├── db.js               # IndexedDB wrapper (Dexie)
│   └── syncService.js      # Sync logic
│
├── utils/
│   ├── dateUtils.js        # Date formatting, calculations
│   ├── streakCalculator.js # Streak algorithms
│   ├── chartDataMapper.js  # Transform data for charts
│   └── constants.js        # App constants
│
└── pwa/
    ├── service-worker.js   # SW registration
    └── manifest.json       # PWA manifest
```

---

## 💾 OFFLINE-FIRST STRATEGY

### IndexedDB Schema (Dexie.js)

```javascript
// Local database stores
const db = new Dexie('HabitTrackerDB');

db.version(1).stores({
  habits: '_id, name, isActive, createdAt',
  dailyLogs: '_id, date, habitId, [date+habitId]',
  syncQueue: '++id, type, timestamp, synced',
  settings: '_id'
});
```

### Sync Queue Structure
```javascript
{
  id: auto-increment,
  type: 'CREATE' | 'UPDATE' | 'DELETE',
  entity: 'habit' | 'log' | 'reflection',
  entityId: String,
  payload: Object,
  timestamp: Date,
  synced: Boolean
}
```

### Sync Flow

**1. Offline Operation:**
```
User Action
    ↓
Update IndexedDB immediately (optimistic UI)
    ↓
Add to Sync Queue
    ↓
Show in UI instantly
```

**2. Going Online:**
```
Detect online event
    ↓
Process Sync Queue (FIFO)
    ↓
For each item:
  - Send to server
  - On success: mark synced, remove from queue
  - On conflict: resolve (server wins, update local)
  - On error: retry with exponential backoff
    ↓
Pull latest data from server
    ↓
Merge with local (last-write-wins)
    ↓
Update UI
```

**3. Conflict Resolution:**
- **Server Wins** for habit definitions
- **Last Write Wins** for daily logs (using updatedAt timestamp)
- **No conflicts** for single-user app, but ready for future multi-device sync

---

## 🔄 DATA FLOW

### Daily Check-in Flow
```
User taps habit checkbox
    ↓
1. Update local IndexedDB immediately
2. Update UI (show checked)
3. Add to sync queue
4. If online → sync immediately
5. Calculate streak locally
6. Update habit card stats
```

### Month Change Flow
```
User selects new month
    ↓
1. Update CalendarContext state
2. Save to localStorage
3. Trigger re-fetch:
   - Fetch logs for selected month
   - Recalculate analytics
   - Update all charts
4. Update URL (optional, for bookmarking)
```

### Analytics Calculation
```
Client-side (for real-time):
- Current day stats
- Week-to-date
- Streaks (calculated from logs)

Server-side (for heavy computation):
- Monthly summaries
- Multi-month trends
- Aggregated statistics
```

---

## 📱 PWA CONFIGURATION

### manifest.json
```json
{
  "name": "Ultimate Habit Tracker",
  "short_name": "Habits",
  "description": "Personal habit tracking PWA",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#6366f1",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "categories": ["productivity", "lifestyle"],
  "screenshots": []
}
```

### Service Worker Strategy (Workbox)
```javascript
// Cache strategies
- Static assets (HTML, CSS, JS): CacheFirst
- API calls (/api/*): NetworkFirst, fallback to cache
- Images/icons: CacheFirst
- Analytics data: NetworkOnly (but stored in IndexedDB)

// Background sync
- Register sync event for failed requests
- Retry when connection restored
```

---

## 🎯 PERFORMANCE OPTIMIZATIONS

1. **Lazy Loading**
   - Code split by route
   - Charts load on-demand
   - Heavy analytics computed on worker thread (future)

2. **Memoization**
   - useMemo for chart data transformations
   - React.memo for habit cards
   - useCallback for event handlers

3. **Virtual Scrolling**
   - For habit lists > 50 items (future)

4. **Debouncing**
   - Note input (500ms)
   - Search/filter (300ms)

5. **IndexedDB Indexing**
   - Compound indexes for date+habitId queries
   - Optimize for "today" queries

---

## 🔐 FUTURE EXTENSIBILITY: ADDING AUTH

### Phase 1: Current (No Auth)
```javascript
// API middleware
app.use('/api', (req, res, next) => {
  req.userId = 'default-user-id'; // Hardcoded
  next();
});
```

### Phase 2: Auth-Ready (Future)
```javascript
// 1. Add User model
User {
  email, password, name, createdAt
}

// 2. Update all models
Habit {
  userId: ObjectId (ref: 'User'), // Add this field
  // ... rest stays same
}

// 3. Add auth middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization;
  const user = verifyToken(token);
  req.userId = user._id;
  next();
};

// 4. Protect routes
app.use('/api', authenticate);

// 5. Update frontend
- Add login/signup views
- Store JWT in localStorage
- Add to axios interceptor
- Add logout functionality
```

**No breaking changes needed** — all queries already scoped by implicit userId.

---

## 📏 UI/UX PRINCIPLES

### Mobile-First Design
- Thumb-friendly tap targets (min 44x44px)
- Bottom navigation for primary actions
- Swipe gestures for navigation
- Pull-to-refresh for sync

### Visual Feedback
- Instant check animation
- Skeleton loading states
- Optimistic UI updates
- Progress indicators

### Accessibility
- ARIA labels
- Keyboard navigation
- Focus indicators
- Screen reader support

### Color System (Tailwind)
```
Primary: Indigo (habits, actions)
Success: Green (completed)
Warning: Amber (low completion)
Danger: Red (missed)
Neutral: Gray (inactive, disabled)
```

---

## 🚀 DEPLOYMENT CHECKLIST

### Backend (Node.js/Express)
- [ ] Environment variables (.env)
- [ ] MongoDB connection with retry logic
- [ ] CORS configuration
- [ ] Rate limiting
- [ ] Error handling middleware
- [ ] Logging (Winston/Morgan)
- [ ] Health check endpoint

### Frontend (React/Vite)
- [ ] Production build optimization
- [ ] Service worker registration
- [ ] PWA manifest linked
- [ ] Environment-specific API URLs
- [ ] Error boundaries
- [ ] Analytics (optional)

### PWA
- [ ] HTTPS enabled
- [ ] Service worker tested
- [ ] Install prompt working
- [ ] Offline page
- [ ] Cache invalidation strategy

---

## 📊 SAMPLE CALCULATIONS

### Streak Algorithm
```javascript
function calculateStreak(logs) {
  // logs = [{date, completed}] sorted by date DESC
  let streak = 0;
  let currentDate = today;

  for (let log of logs) {
    if (isSameDay(log.date, currentDate) && log.completed) {
      streak++;
      currentDate = previousDay(currentDate);
    } else {
      break;
    }
  }

  return streak;
}
```

### Completion Rate
```javascript
function monthlyCompletionRate(logs, daysInMonth) {
  const completed = logs.filter(l => l.completed).length;
  return (completed / daysInMonth) * 100;
}
```

---

## 🎨 THEME TOKENS (Tailwind Config)

```javascript
theme: {
  extend: {
    colors: {
      habit: {
        health: '#10b981', // green
        work: '#3b82f6',   // blue
        mind: '#8b5cf6',   // purple
        custom: '#f59e0b', // amber
      }
    },
    animation: {
      'check': 'check 0.3s ease-in-out',
      'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    }
  }
}
```

---

## 📝 NOTES

1. **Why no authentication now?**
   - Faster MVP development
   - Personal use only
   - Reduces complexity
   - Easy to add later without refactor

2. **Why IndexedDB + MongoDB?**
   - IndexedDB for instant offline access
   - MongoDB for persistence and backup
   - Hybrid approach = best of both worlds

3. **Why separate MonthlySummary collection?**
   - Pre-computed analytics for speed
   - Reduces real-time calculation load
   - Can regenerate if needed

4. **Why single Settings document?**
   - Only one user
   - Simpler than user-scoped settings
   - Fast lookups (no query needed)

---

## 🎯 SUCCESS METRICS

- ✅ App loads in < 2s
- ✅ Offline check-ins work 100%
- ✅ Sync completes in < 5s
- ✅ Mobile lighthouse score > 90
- ✅ PWA installable
- ✅ Works with 0 network
