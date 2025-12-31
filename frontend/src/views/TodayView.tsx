import { useEffect, useState } from 'react';
import { useHabitStore } from '@/store/useHabitStore';
import { useLogStore } from '@/store/useLogStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getTodayString, formatDate } from '@/utils/dateUtils';
import { toast } from 'sonner';
import { TrendingUp, Info } from 'lucide-react';
import Header from '@/components/layout/Header';
import HabitDetailModal from '@/components/habits/HabitDetailModal';
import HabitForm from '@/components/habits/HabitForm';
import { Habit } from '@/types';

export default function TodayView() {
  const { habits, loading, fetchHabits } = useHabitStore();
  const { logs, fetchLogsForDate, upsertLog } = useLogStore();
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState<Habit | undefined>(undefined);

  const today = getTodayString();

  useEffect(() => {
    fetchHabits();
    fetchLogsForDate(today);
  }, []);

  const handleToggle = async (habitId: string, currentValue: boolean) => {
    try {
      await upsertLog({
        date: today,
        habitId,
        completed: !currentValue,
        value: 0
      });
      toast.success(!currentValue ? 'Great job! 🎉' : 'Unmarked');
      fetchLogsForDate(today); // Refresh
    } catch (error) {
      toast.error('Failed to update habit');
    }
  };

  const handleViewDetails = (habit: Habit) => {
    setSelectedHabit(habit);
    setShowDetailModal(true);
  };

  const handleEditFromDetail = (habit: Habit) => {
    setHabitToEdit(habit);
    setShowEditModal(true);
  };

  const todayLogs = logs[today] || [];
  const completedCount = todayLogs.filter(l => l.completed).length;
  const totalCount = habits.length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-6">
      <Header />

      <div className="container max-w-4xl mx-auto px-3 xxs:px-4 sm:px-6 py-4 xxs:py-5 sm:py-6 space-y-4 xxs:space-y-5 sm:space-y-6 pb-6">
        {/* Stats Banner */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 transition-all hover:shadow-lg">
          <CardContent className="pt-4 xxs:pt-5 sm:pt-6 px-4 xxs:px-5 sm:px-6 pb-4 xxs:pb-5 sm:pb-6">
            <div className="flex items-center justify-between gap-3 xxs:gap-4">
              <div className="min-w-0 flex-1">
                <h1 className="text-xl xxs:text-2xl sm:text-3xl font-bold mb-0.5 xxs:mb-1">Today</h1>
                <p className="text-xs xxs:text-sm sm:text-base text-muted-foreground truncate">
                  {formatDate(new Date(), 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-2xl xxs:text-3xl sm:text-4xl font-bold text-primary">{completionRate}%</div>
                <p className="text-[10px] xxs:text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                  {completedCount} of {totalCount} done
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Habits List */}
        {loading ? (
          <div className="text-center py-8 xxs:py-10 sm:py-12">
            <div className="inline-block h-7 w-7 xxs:h-8 xxs:w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="mt-3 xxs:mt-4 text-sm xxs:text-base text-muted-foreground">Loading habits...</p>
          </div>
        ) : habits.length === 0 ? (
          <Card className="transition-all hover:shadow-lg">
            <CardContent className="py-8 xxs:py-10 sm:py-12 text-center px-4">
              <TrendingUp className="h-10 w-10 xxs:h-12 xxs:w-12 mx-auto text-muted-foreground mb-3 xxs:mb-4" />
              <h3 className="text-base xxs:text-lg font-semibold mb-1.5 xxs:mb-2">No habits yet</h3>
              <p className="text-xs xxs:text-sm text-muted-foreground mb-3 xxs:mb-4 max-w-md mx-auto">
                Create your first habit to start tracking your progress!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-2 xxs:gap-3">
            {habits.map((habit) => {
              const log = todayLogs.find((l) => l.habitId === habit._id);
              const isCompleted = log?.completed || false;

              return (
                <Card
                  key={habit._id}
                  className={`hover:shadow-lg transition-all ${
                    isCompleted ? 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20' : ''
                  }`}
                >
                  <CardContent className="p-3 xxs:p-4 sm:p-5">
                    <div className="flex items-center justify-between gap-2 xxs:gap-3">
                      <div className="flex items-center gap-2 xxs:gap-3 flex-1 min-w-0">
                        <div
                          className="text-2xl xxs:text-3xl flex items-center justify-center h-10 w-10 xxs:h-12 xxs:w-12 rounded-full cursor-pointer hover:scale-110 active:scale-95 transition-all flex-shrink-0"
                          style={{ backgroundColor: `${habit.color}20` }}
                          onClick={() => handleViewDetails(habit)}
                        >
                          {habit.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 xxs:gap-2">
                            <h3 className="text-base xxs:text-lg font-semibold truncate">{habit.name}</h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(habit)}
                              className="h-5 w-5 xxs:h-6 xxs:w-6 p-0 flex-shrink-0 hover:scale-110 active:scale-95 transition-all"
                            >
                              <Info className="h-3.5 w-3.5 xxs:h-4 xxs:w-4 text-muted-foreground" />
                            </Button>
                          </div>
                          {habit.identityStatement && (
                            <p className="text-xs xxs:text-sm text-muted-foreground italic mt-0.5 xxs:mt-1 line-clamp-2">
                              {habit.identityStatement}
                            </p>
                          )}
                          <div className="flex items-center gap-1.5 xxs:gap-2 text-xs xxs:text-sm text-muted-foreground mt-1">
                            <span className="px-1.5 xxs:px-2 py-0.5 rounded-full bg-secondary text-[10px] xxs:text-xs">
                              {habit.category}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="lg"
                        variant={isCompleted ? 'default' : 'outline'}
                        onClick={() => handleToggle(habit._id, isCompleted)}
                        className={`min-w-[80px] xxs:min-w-[100px] sm:min-w-[120px] h-10 xxs:h-11 text-xs xxs:text-sm sm:text-base flex-shrink-0 transition-all hover:scale-105 active:scale-95 ${
                          isCompleted
                            ? 'bg-green-500 hover:bg-green-600 text-white'
                            : ''
                        }`}
                      >
                        {isCompleted ? (
                          <>
                            <span className="mr-1 xxs:mr-2">✓</span>
                            Done
                          </>
                        ) : (
                          <span className="hidden xxs:inline">Mark Done</span>
                        )}
                        {!isCompleted && <span className="xxs:hidden">Mark</span>}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <HabitDetailModal
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
        habit={selectedHabit}
        onEdit={handleEditFromDetail}
      />

      <HabitForm
        open={showEditModal}
        onOpenChange={setShowEditModal}
        habit={habitToEdit}
      />
    </div>
  );
}
