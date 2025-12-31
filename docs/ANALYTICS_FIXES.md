# Analytics Dashboard Fixes

## Issues Fixed

### 1. **HabitDetailModal Stats Calculation**
**Problem**: The component was calling `analyticsService.getMonthlySummary(habitId, year, month)` with a habitId parameter, but the service method didn't accept this parameter.

**Solution**:
- Updated HabitDetailModal to calculate stats **locally from IndexedDB logs**
- Removed dependency on backend analytics endpoint for habit stats
- Now calculates:
  - Current streak (consecutive days completed from today backwards)
  - Longest streak (best streak ever)
  - Current month completion rate
  - Total days completed this month

This aligns with the offline-first architecture - stats are now calculated from local data.

### 2. **analyticsService Enhanced**
**Problem**: Missing method to get monthly summary for individual habits.

**Solution**:
- Added `getHabitMonthlySummary(habitId, year, month)` method
- Fetches all monthly summaries and filters for the specific habit
- Falls back gracefully if backend is unavailable

### 3. **Frontend Environment Configuration**
**Problem**: No `.env` file with API URL configuration.

**Solution**:
- Created `frontend/.env` with `VITE_API_URL=http://localhost:5000/api/v1`
- Ensures consistent API endpoint configuration
- Makes it easy to change API URL for production

## How Analytics Work

### Architecture

HabitAlgo uses a **hybrid offline-first + backend sync** architecture:

1. **Primary Data Source**: IndexedDB (local browser database)
2. **Analytics Views**: Fetch from backend `/analytics/*` endpoints
3. **Habit Stats**: Calculated locally from IndexedDB logs

### Data Flow

```
┌─────────────────┐
│  User Actions   │
└────────┬────────┘
         │
         v
┌─────────────────┐      Background Sync      ┌──────────────┐
│   IndexedDB     │ ─────────────────────────> │   Backend    │
│  (Local Data)   │ <───────────────────────── │  (MongoDB)   │
└────────┬────────┘                            └──────┬───────┘
         │                                            │
         v                                            v
┌─────────────────┐                          ┌──────────────┐
│  Habit Stats    │                          │  Analytics   │
│  (Calculated)   │                          │   Charts     │
└─────────────────┘                          └──────────────┘
```

### Analytics Endpoints

| Endpoint | Purpose | Used By |
|----------|---------|---------|
| `GET /analytics/charts` | Dashboard chart data | AnalyticsView, EnhancedAnalyticsView |
| `GET /analytics/month` | Monthly summaries for all habits | analyticsService |
| `GET /analytics/streaks` | Current streaks for all habits | - |
| `GET /analytics/trends` | Trend data over time | - |

## Running the Analytics Dashboard

### Prerequisites

1. **Backend server must be running**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   Backend will run on `http://localhost:5000`

2. **MongoDB must be connected**:
   - Check `backend/.env` has correct `MONGODB_URI`
   - Current URI: `mongodb+srv://ashking19102001_db_user:***@tracker.sy6dcll.mongodb.net/`

3. **Frontend must have data**:
   - Create some habits in the app
   - Log completions for several days
   - Analytics require data to display

### Starting the App

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

Visit `http://localhost:5173` and navigate to Analytics view.

## Troubleshooting

### "No data yet" or Empty Charts

**Cause**: No habits or logs exist in the database.

**Solution**:
1. Create 2-3 habits
2. Complete them for at least 3-5 days
3. Navigate back to Analytics view

### "Loading analytics..." Forever

**Cause**: Backend server is not running or not accessible.

**Solutions**:
1. **Check backend is running**:
   ```bash
   curl http://localhost:5000/health
   # Should return: {"success":true,"message":"HabitAlgo API is running"...}
   ```

2. **Check MongoDB connection**:
   - Look at backend terminal for connection errors
   - Verify MONGODB_URI in backend/.env

3. **Check CORS**:
   - Backend allows `http://localhost:5173` by default
   - If using different port, update `backend/server.js`

4. **Check browser console**:
   - Open DevTools → Console
   - Look for network errors or API call failures

### Charts Show Zero/Empty Data

**Cause**: Backend endpoints are returning empty arrays.

**Solutions**:
1. **Sync local data to backend**:
   - The app has background sync, but you can trigger it:
   - Check Network tab to see if sync requests are successful

2. **Recalculate analytics**:
   - Backend has a recalculate endpoint:
   ```bash
   curl -X POST http://localhost:5000/api/v1/analytics/recalculate \
     -H "Content-Type: application/json" \
     -d '{"year": 2025, "month": 1}'
   ```

3. **Check backend logs**:
   - Backend terminal will show any errors

### HabitDetailModal Shows No Stats

**This should work even offline** because stats are calculated locally.

If stats are missing:
1. Check browser console for errors
2. Verify logs exist in IndexedDB:
   - Open DevTools → Application → IndexedDB → habitTracker → dailyLogs
3. Complete at least one habit to create logs

## Database Structure

### IndexedDB (Frontend)
- `habits`: Habit definitions
- `dailyLogs`: Completion records (date + habitId + completed)
- `syncQueue`: Pending sync operations
- `settings`: App settings

### MongoDB (Backend)
- `habits`: Synced habit definitions
- `dailylogs`: Synced completion records
- `monthlysummaries`: Pre-calculated analytics (updated on log creation)

## Next Steps

If you're still having issues:

1. **Reset local database** (if corrupted):
   ```javascript
   // In browser console
   window.resetDatabase()
   ```

2. **Check backend logs** for errors:
   ```bash
   cd backend
   npm run dev
   # Watch for errors in terminal
   ```

3. **Verify API responses**:
   ```bash
   # Get chart data
   curl "http://localhost:5000/api/v1/analytics/charts?year=2025&month=1"

   # Get monthly summaries
   curl "http://localhost:5000/api/v1/analytics/month?year=2025&month=1"
   ```

4. **Check network tab** in browser DevTools:
   - Look for failed requests
   - Check request/response data
   - Verify CORS headers are present

## Key Takeaways

✅ **HabitDetailModal now works offline** - calculates stats from local data
✅ **Analytics views require backend** - fetch aggregated data from MongoDB
✅ **Both require actual data** - create habits and log completions first
✅ **Backend must be running** - start with `npm run dev` in backend folder
✅ **MongoDB must be connected** - verify MONGODB_URI in backend/.env
