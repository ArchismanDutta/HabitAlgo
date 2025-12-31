import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plus, Calendar, BarChart3, Target, Grid3x3, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HabitForm from '@/components/habits/HabitForm';
import ThemeToggle from '@/components/ThemeToggle';
import WeeklyReview from '@/components/reviews/WeeklyReview';

export default function Header() {
  const location = useLocation();
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [showWeeklyReview, setShowWeeklyReview] = useState(false);

  const navItems = [
    { path: '/today', label: 'Today', icon: Calendar },
    { path: '/grid', label: 'Grid', icon: Grid3x3 },
    { path: '/monthly', label: 'Monthly', icon: Calendar },
    { path: '/analytics', label: 'Charts', icon: BarChart3 },
    { path: '/enhanced-analytics', label: 'Dashboard', icon: TrendingUp },
    { path: '/focus', label: 'Focus', icon: Target },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center space-x-2">
              <Target className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">HabitAlgo</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={location.pathname === item.path ? 'default' : 'ghost'}
                    size="sm"
                    className="gap-2"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              onClick={() => setShowWeeklyReview(true)}
              size="sm"
              variant="outline"
              className="gap-2 hidden md:flex"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Review</span>
            </Button>
            <Button onClick={() => setShowHabitForm(true)} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Habit</span>
            </Button>
          </div>
        </div>

        {/* Mobile Nav */}
        <nav className="md:hidden border-t overflow-x-auto">
          <div className="container flex items-center justify-start gap-1 py-2 px-2">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={location.pathname === item.path ? 'default' : 'ghost'}
                  size="sm"
                  className="gap-1 flex-col h-auto py-2 px-3 whitespace-nowrap"
                >
                  <item.icon className="h-4 w-4" />
                  <span className="text-xs">{item.label}</span>
                </Button>
              </Link>
            ))}
          </div>
        </nav>
      </header>

      <HabitForm open={showHabitForm} onOpenChange={setShowHabitForm} />
      <WeeklyReview open={showWeeklyReview} onOpenChange={setShowWeeklyReview} />
    </>
  );
}
