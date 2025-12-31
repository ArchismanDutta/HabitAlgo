import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plus, Calendar, BarChart3, Target, Grid3x3, TrendingUp, CheckCircle2, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HabitForm from '@/components/habits/HabitForm';
import ThemeToggle from '@/components/ThemeToggle';
import WeeklyReview from '@/components/reviews/WeeklyReview';

interface HeaderProps {
  title?: string;
}

export default function Header({ title }: HeaderProps) {
  const location = useLocation();
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [showWeeklyReview, setShowWeeklyReview] = useState(false);

  const navItems = [
    { path: '/today', label: 'Today', icon: Calendar },
    { path: '/grid', label: 'Grid', icon: Grid3x3 },
    { path: '/monthly', label: 'Monthly', icon: Calendar },
    { path: '/gym', label: 'Gym', icon: Dumbbell },
    { path: '/analytics', label: 'Charts', icon: BarChart3 },
    { path: '/enhanced-analytics', label: 'Dashboard', icon: TrendingUp },
    { path: '/focus', label: 'Focus', icon: Target },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 xxs:h-16 items-center justify-between px-3 xxs:px-4 sm:px-6">
          <div className="flex items-center gap-2 xxs:gap-4 md:gap-6">
            <Link to="/" className="flex items-center space-x-1.5 xxs:space-x-2">
              <Target className="h-5 w-5 xxs:h-6 xxs:w-6 text-primary" />
              <span className="font-bold text-base xxs:text-lg sm:text-xl">{title || 'HabitAlgo'}</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path ||
                  (item.path === '/gym' && location.pathname.startsWith('/gym'));
                return (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant={isActive ? 'default' : 'ghost'}
                      size="sm"
                      className="gap-1.5 xl:gap-2 h-9 px-2.5 xl:px-3 transition-all hover:scale-105"
                    >
                      <item.icon className="h-3.5 w-3.5 xl:h-4 xl:w-4" />
                      <span className="text-xs xl:text-sm">{item.label}</span>
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-1 xxs:gap-1.5 sm:gap-2">
            <ThemeToggle />
            <Button
              onClick={() => setShowWeeklyReview(true)}
              size="sm"
              variant="outline"
              className="gap-1.5 hidden lg:flex h-9 px-2.5 xl:px-3 transition-all hover:scale-105"
            >
              <CheckCircle2 className="h-3.5 w-3.5 xl:h-4 xl:w-4" />
              <span className="text-xs xl:text-sm">Review</span>
            </Button>
            <Button
              onClick={() => setShowHabitForm(true)}
              size="sm"
              className="gap-1 xxs:gap-1.5 h-9 px-2.5 xxs:px-3 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden xs:inline text-xs sm:text-sm">New Habit</span>
            </Button>
          </div>
        </div>

        {/* Mobile & Tablet Nav */}
        <nav className="lg:hidden border-t overflow-x-auto scrollbar-hide">
          <div className="flex items-center justify-start gap-0.5 xxs:gap-1 py-2 px-2 xxs:px-3 sm:px-4 min-w-max">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path ||
                (item.path === '/gym' && location.pathname.startsWith('/gym'));
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    className="gap-1 flex-col h-auto py-2 px-2.5 xxs:px-3 sm:px-4 whitespace-nowrap min-h-[3rem] transition-all hover:scale-105 active:scale-95"
                  >
                    <item.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-[10px] xxs:text-xs sm:text-sm font-medium">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      <HabitForm open={showHabitForm} onOpenChange={setShowHabitForm} />
      <WeeklyReview open={showWeeklyReview} onOpenChange={setShowWeeklyReview} />
    </>
  );
}
