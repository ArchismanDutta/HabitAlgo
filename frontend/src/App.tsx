import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/ThemeProvider';
import { syncService } from './services/syncService';
import { SYNC_INTERVAL } from './utils/constants';
import { useAuthStore } from '@/store/useAuthStore';
import ProtectedRoute from '@/components/ProtectedRoute';

// Auth Views
import LoginView from './views/LoginView';
import RegisterView from './views/RegisterView';
import ProfileView from './views/ProfileView';
import AdminView from './views/AdminView';
import LandingView from './views/LandingView';

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
import CorrelationsView from './views/gym/CorrelationsView';

// Finance Views
import FinanceDashboard from './views/finance/FinanceDashboard';
import AccountsView from './views/finance/AccountsView';
import TransactionsView from './views/finance/TransactionsView';
import BudgetsView from './views/finance/BudgetsView';
import FinanceCalendarView from './views/finance/FinanceCalendarView';
import FinanceAnalyticsView from './views/finance/FinanceAnalyticsView';
import FinanceCorrelationView from './views/finance/FinanceCorrelationView';
import FinancialGoalsView from './views/finance/FinancialGoalsView';

// Motivational Components
import MissedHabitsChecker from './components/motivational/MissedHabitsChecker';

// Finance Components
import MissedSpendRecovery from './components/finance/MissedSpendRecovery';

function App() {
  const { isAuthenticated } = useAuthStore();

  // Set up auto-sync on mount (only for authenticated users)
  useEffect(() => {
    if (!isAuthenticated) return;

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
  }, [isAuthenticated]);

  return (
    <ThemeProvider defaultTheme="system" storageKey="habit-tracker-theme">
      <div className="min-h-screen bg-background text-foreground">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={isAuthenticated ? <Navigate to="/today" replace /> : <LandingView />} />
          <Route path="/login" element={isAuthenticated ? <Navigate to="/today" replace /> : <LoginView />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/today" replace /> : <RegisterView />} />

          {/* Protected Routes */}
          <Route path="/profile" element={<ProtectedRoute><ProfileView /></ProtectedRoute>} />
          <Route path="/today" element={<ProtectedRoute><TodayView /></ProtectedRoute>} />
          <Route path="/grid" element={<ProtectedRoute><GridView /></ProtectedRoute>} />
          <Route path="/monthly" element={<ProtectedRoute><MonthlyView /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><AnalyticsView /></ProtectedRoute>} />
          <Route path="/enhanced-analytics" element={<ProtectedRoute><EnhancedAnalyticsView /></ProtectedRoute>} />
          <Route path="/focus" element={<ProtectedRoute><FocusView /></ProtectedRoute>} />

          {/* Gym Routes */}
          <Route path="/gym" element={<ProtectedRoute><GymDashboard /></ProtectedRoute>} />
          <Route path="/gym/calendar" element={<ProtectedRoute><GymCalendarView /></ProtectedRoute>} />
          <Route path="/gym/programs" element={<ProtectedRoute><ProgramsView /></ProtectedRoute>} />
          <Route path="/gym/active-workout" element={<ProtectedRoute><ActiveWorkoutView /></ProtectedRoute>} />
          <Route path="/gym/exercises" element={<ProtectedRoute><ExerciseLibraryView /></ProtectedRoute>} />
          <Route path="/gym/metrics" element={<ProtectedRoute><MetricsView /></ProtectedRoute>} />
          <Route path="/gym/supplements" element={<ProtectedRoute><SupplementsView /></ProtectedRoute>} />
          <Route path="/gym/analytics" element={<ProtectedRoute><GymAnalyticsView /></ProtectedRoute>} />
          <Route path="/gym/correlations" element={<ProtectedRoute><CorrelationsView /></ProtectedRoute>} />

          {/* Finance Routes */}
          <Route path="/finance" element={<ProtectedRoute><FinanceDashboard /></ProtectedRoute>} />
          <Route path="/finance/accounts" element={<ProtectedRoute><AccountsView /></ProtectedRoute>} />
          <Route path="/finance/transactions" element={<ProtectedRoute><TransactionsView /></ProtectedRoute>} />
          <Route path="/finance/budgets" element={<ProtectedRoute><BudgetsView /></ProtectedRoute>} />
          <Route path="/finance/goals" element={<ProtectedRoute><FinancialGoalsView /></ProtectedRoute>} />
          <Route path="/finance/calendar" element={<ProtectedRoute><FinanceCalendarView /></ProtectedRoute>} />
          <Route path="/finance/analytics" element={<ProtectedRoute><FinanceAnalyticsView /></ProtectedRoute>} />
          <Route path="/finance/correlations" element={<ProtectedRoute><FinanceCorrelationView /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminView /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to={isAuthenticated ? "/today" : "/"} replace />} />
        </Routes>
        <Toaster position="top-center" richColors />

        {/* Motivational System - Only show for authenticated users */}
        {isAuthenticated && <MissedHabitsChecker />}

        {/* Finance Recovery System - Only show for authenticated users */}
        {isAuthenticated && <MissedSpendRecovery />}
      </div>
    </ThemeProvider>
  );
}

export default App;
