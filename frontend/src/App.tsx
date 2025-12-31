import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/ThemeProvider';
import { syncService } from './services/syncService';
import { SYNC_INTERVAL } from './utils/constants';

// Views
import TodayView from './views/TodayView';
import MonthlyView from './views/MonthlyView';
import AnalyticsView from './views/AnalyticsView';
import FocusView from './views/FocusView';
import GridView from './views/GridView';
import EnhancedAnalyticsView from './views/EnhancedAnalyticsView';

// Gym Views
import GymDashboard from './views/gym/GymDashboard';
import ProgramsView from './views/gym/ProgramsView';
import ActiveWorkoutView from './views/gym/ActiveWorkoutView';
import ExerciseLibraryView from './views/gym/ExerciseLibraryView';
import MetricsView from './views/gym/MetricsView';
import SupplementsView from './views/gym/SupplementsView';
import GymAnalyticsView from './views/gym/GymAnalyticsView';
import GymCalendarView from './views/gym/GymCalendarView';

// Motivational Components
import MissedHabitsChecker from './components/motivational/MissedHabitsChecker';

function App() {
  // Set up auto-sync on mount
  useEffect(() => {
    // Initial sync
    syncService.fullSync().catch(console.error);

    // Set up periodic sync
    const syncInterval = setInterval(() => {
      syncService.fullSync().catch(console.error);
    }, SYNC_INTERVAL);

    // Sync when coming back online
    const handleOnline = () => {
      syncService.fullSync().catch(console.error);
    };

    window.addEventListener('online', handleOnline);

    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return (
    <ThemeProvider defaultTheme="system" storageKey="habit-tracker-theme">
      <div className="min-h-screen bg-background text-foreground">
        <Routes>
          <Route path="/" element={<Navigate to="/today" replace />} />
          <Route path="/today" element={<TodayView />} />
          <Route path="/grid" element={<GridView />} />
          <Route path="/monthly" element={<MonthlyView />} />
          <Route path="/analytics" element={<AnalyticsView />} />
          <Route path="/enhanced-analytics" element={<EnhancedAnalyticsView />} />
          <Route path="/focus" element={<FocusView />} />

          {/* Gym Routes */}
          <Route path="/gym" element={<GymDashboard />} />
          <Route path="/gym/calendar" element={<GymCalendarView />} />
          <Route path="/gym/programs" element={<ProgramsView />} />
          <Route path="/gym/active-workout" element={<ActiveWorkoutView />} />
          <Route path="/gym/exercises" element={<ExerciseLibraryView />} />
          <Route path="/gym/metrics" element={<MetricsView />} />
          <Route path="/gym/supplements" element={<SupplementsView />} />
          <Route path="/gym/analytics" element={<GymAnalyticsView />} />

          <Route path="*" element={<Navigate to="/today" replace />} />
        </Routes>
        <Toaster position="top-center" richColors />

        {/* Motivational System */}
        <MissedHabitsChecker />
      </div>
    </ThemeProvider>
  );
}

export default App;
