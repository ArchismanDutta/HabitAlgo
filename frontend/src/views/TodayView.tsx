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
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container max-w-4xl mx-auto p-4 space-y-6">
        {/* Stats Banner */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-1">Today</h1>
                <p className="text-muted-foreground">
                  {formatDate(new Date(), 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-primary">{completionRate}%</div>
                <p className="text-sm text-muted-foreground">
                  {completedCount} of {totalCount} completed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Habits List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="mt-4 text-muted-foreground">Loading habits...</p>
          </div>
        ) : habits.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No habits yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first habit to start tracking your progress!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {habits.map((habit) => {
              const log = todayLogs.find((l) => l.habitId === habit._id);
              const isCompleted = log?.completed || false;

              return (
                <Card
                  key={habit._id}
                  className={`hover:shadow-md transition-all ${
                    isCompleted ? 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className="text-3xl flex items-center justify-center h-12 w-12 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
                          style={{ backgroundColor: `${habit.color}20` }}
                          onClick={() => handleViewDetails(habit)}
                        >
                          {habit.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">{habit.name}</h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(habit)}
                              className="h-6 w-6 p-0"
                            >
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                          {habit.identityStatement && (
                            <p className="text-sm text-muted-foreground italic mt-1">
                              {habit.identityStatement}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <span className="px-2 py-0.5 rounded-full bg-secondary text-xs">
                              {habit.category}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="lg"
                        variant={isCompleted ? 'default' : 'outline'}
                        onClick={() => handleToggle(habit._id, isCompleted)}
                        className={`min-w-[120px] ${
                          isCompleted
                            ? 'bg-green-500 hover:bg-green-600 text-white'
                            : ''
                        }`}
                      >
                        {isCompleted ? (
                          <>
                            <span className="mr-2">✓</span>
                            Done
                          </>
                        ) : (
                          'Mark Done'
                        )}
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
