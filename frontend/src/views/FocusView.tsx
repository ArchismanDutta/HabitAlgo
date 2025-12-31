import { useEffect, useState } from 'react';
import { useHabitStore } from '@/store/useHabitStore';
import { useLogStore } from '@/store/useLogStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getTodayString, formatDate } from '@/utils/dateUtils';
import { logService } from '@/services/logService';
import { toast } from 'sonner';
import { Moon, Sun } from 'lucide-react';
import Header from '@/components/layout/Header';

export default function FocusView() {
  const { habits, fetchHabits } = useHabitStore();
  const { logs, fetchLogsForDate, upsertLog } = useLogStore();
  const [reflectionText, setReflectionText] = useState('');
  const [achievements, setAchievements] = useState<string[]>(['']);
  const [energy, setEnergy] = useState(5);
  const today = getTodayString();

  useEffect(() => {
    fetchHabits();
    fetchLogsForDate(today);
    loadReflection();
  }, []);

  const loadReflection = async () => {
    try {
      const reflection = await logService.getReflection(today);
      if (reflection) {
        setReflectionText(reflection.text || '');
        setAchievements(reflection.achievements || ['']);
        setEnergy(reflection.energy || 5);
      }
    } catch (error) {
      console.error('Failed to load reflection:', error);
    }
  };

  const handleToggle = async (habitId: string, currentValue: boolean) => {
    try {
      // Upsert log - this updates the local state immediately
      await upsertLog({
        date: today,
        habitId,
        completed: !currentValue,
        value: 0
      });
      // Refetch to ensure we have latest data
      await fetchLogsForDate(today);
    } catch (error) {
      console.error('Failed to toggle habit:', error);
      toast.error('Failed to update habit');
    }
  };

  const saveReflection = async () => {
    try {
      await logService.saveReflection(today, {
        text: reflectionText,
        achievements: achievements.filter(a => a.trim() !== ''),
        energy
      });
      toast.success('Reflection saved!');
    } catch (error) {
      toast.error('Failed to save reflection');
    }
  };

  const todayLogs = logs[today] || [];
  const completedCount = todayLogs.filter(l => l.completed).length;

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-6">
      <Header />

      <div className="container max-w-3xl mx-auto px-3 xxs:px-4 sm:px-6 py-4 xxs:py-5 sm:py-6 space-y-4 xxs:space-y-5 sm:space-y-6 pb-6">
        {/* Minimal Header */}
        <div className="text-center py-6 xxs:py-8 sm:py-10">
          <h1 className="text-2xl xxs:text-3xl sm:text-4xl font-bold mb-1 xxs:mb-2">Focus Mode</h1>
          <p className="text-xs xxs:text-sm sm:text-base text-muted-foreground">
            {formatDate(new Date(), 'EEEE, MMMM d')}
          </p>
        </div>

        {/* Today's Habits - Minimal Style */}
        <Card className="border-none shadow-none bg-muted/30 transition-all hover:shadow-lg">
          <CardContent className="pt-4 xxs:pt-5 sm:pt-6 px-3 xxs:px-4 sm:px-6 pb-4 xxs:pb-5 sm:pb-6 space-y-2 xxs:space-y-3">
            {habits.map((habit) => {
              const log = todayLogs.find((l) => l.habitId === habit._id);
              const isCompleted = log?.completed || false;

              return (
                <button
                  key={habit._id}
                  onClick={() => handleToggle(habit._id, isCompleted)}
                  className={`
                    w-full p-3 xxs:p-4 rounded-lg text-left transition-all hover:scale-[1.02] active:scale-[0.98]
                    ${isCompleted
                      ? 'bg-green-500/10 border border-green-500/20'
                      : 'bg-background border border-border hover:border-primary'
                    }
                  `}
                >
                  <div className="flex items-center gap-2 xxs:gap-3">
                    <div className={`
                      h-7 w-7 xxs:h-8 xxs:w-8 rounded-full border-2 inline-flex items-center justify-center transition-all flex-shrink-0
                      ${isCompleted
                        ? 'border-green-500 bg-green-500 text-white'
                        : 'border-muted-foreground/30'
                      }
                    `}>
                      {isCompleted && <span className="text-base xxs:text-lg font-bold">✓</span>}
                    </div>
                    <span className="text-xl xxs:text-2xl flex-shrink-0">{habit.icon}</span>
                    <div className="flex-1 min-w-0">
                      <span className={`text-sm xxs:text-base sm:text-lg block ${isCompleted ? 'line-through opacity-60' : ''}`}>
                        {habit.name}
                      </span>
                      {habit.identityStatement && (
                        <p className="text-xs xxs:text-sm text-muted-foreground italic mt-0.5 xxs:mt-1 line-clamp-2">
                          {habit.identityStatement}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Progress */}
        <div className="text-center py-4 xxs:py-6">
          <div className="text-4xl xxs:text-5xl sm:text-6xl font-bold text-primary mb-1 xxs:mb-2">
            {completedCount}/{habits.length}
          </div>
          <p className="text-xs xxs:text-sm sm:text-base text-muted-foreground">Completed Today</p>
        </div>

        {/* Energy Level */}
        <Card className="transition-all hover:shadow-lg">
          <CardContent className="pt-4 xxs:pt-5 sm:pt-6 px-3 xxs:px-4 sm:px-6 pb-4 xxs:pb-5 sm:pb-6 space-y-3 xxs:space-y-4">
            <Label className="text-base xxs:text-lg">How's your energy today?</Label>
            <div className="flex items-center gap-2 xxs:gap-3">
              <Moon className="h-4 w-4 xxs:h-5 xxs:w-5 text-muted-foreground flex-shrink-0" />
              <input
                type="range"
                min="1"
                max="10"
                value={energy}
                onChange={(e) => setEnergy(parseInt(e.target.value))}
                className="flex-1 h-2 xxs:h-2.5"
              />
              <Sun className="h-4 w-4 xxs:h-5 xxs:w-5 text-primary flex-shrink-0" />
              <span className="min-w-[1.5rem] xxs:min-w-[2rem] text-center font-bold text-sm xxs:text-base">{energy}</span>
            </div>
          </CardContent>
        </Card>

        {/* Daily Reflection */}
        <Card className="transition-all hover:shadow-lg">
          <CardContent className="pt-4 xxs:pt-5 sm:pt-6 px-3 xxs:px-4 sm:px-6 pb-4 xxs:pb-5 sm:pb-6 space-y-3 xxs:space-y-4">
            <div className="space-y-1.5 xxs:space-y-2">
              <Label className="text-base xxs:text-lg">Today's Reflection</Label>
              <Textarea
                placeholder="How did today go? What did you learn?"
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                rows={4}
                className="resize-none text-sm xxs:text-base"
              />
            </div>

            <div className="space-y-1.5 xxs:space-y-2">
              <Label className="text-base xxs:text-lg">Achievements</Label>
              {achievements.map((achievement, index) => (
                <div key={index} className="flex gap-1.5 xxs:gap-2">
                  <Input
                    placeholder={`Achievement ${index + 1}`}
                    value={achievement}
                    onChange={(e) => {
                      const newAchievements = [...achievements];
                      newAchievements[index] = e.target.value;
                      setAchievements(newAchievements);
                    }}
                    className="h-9 xxs:h-10 text-sm xxs:text-base"
                  />
                  {index === achievements.length - 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setAchievements([...achievements, ''])}
                      className="h-9 xxs:h-10 w-9 xxs:w-10 p-0 flex-shrink-0 transition-all hover:scale-110 active:scale-95"
                    >
                      <span className="text-lg xxs:text-xl">+</span>
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Button onClick={saveReflection} className="w-full h-10 xxs:h-11 text-sm xxs:text-base transition-all hover:scale-105 active:scale-95">
              Save Reflection
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
