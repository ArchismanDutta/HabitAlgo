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
import { Moon, Sun, Cloud } from 'lucide-react';
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
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container max-w-3xl mx-auto p-4 space-y-6">
        {/* Minimal Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold mb-2">Focus Mode</h1>
          <p className="text-muted-foreground">
            {formatDate(new Date(), 'EEEE, MMMM d')}
          </p>
        </div>

        {/* Today's Habits - Minimal Style */}
        <Card className="border-none shadow-none bg-muted/30">
          <CardContent className="pt-6 space-y-3">
            {habits.map((habit) => {
              const log = todayLogs.find((l) => l.habitId === habit._id);
              const isCompleted = log?.completed || false;

              return (
                <button
                  key={habit._id}
                  onClick={() => handleToggle(habit._id, isCompleted)}
                  className={`
                    w-full p-4 rounded-lg text-left transition-all
                    ${isCompleted
                      ? 'bg-green-500/10 border border-green-500/20'
                      : 'bg-background border border-border hover:border-primary'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className={`
                      h-8 w-8 rounded-full border-2 inline-flex items-center justify-center transition-all
                      ${isCompleted
                        ? 'border-green-500 bg-green-500 text-white'
                        : 'border-muted-foreground/30'
                      }
                    `}>
                      {isCompleted && <span className="text-lg font-bold">✓</span>}
                    </div>
                    <span className="text-2xl">{habit.icon}</span>
                    <div className="flex-1">
                      <span className={`text-lg ${isCompleted ? 'line-through opacity-60' : ''}`}>
                        {habit.name}
                      </span>
                      {habit.identityStatement && (
                        <p className="text-sm text-muted-foreground italic mt-1">
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
        <div className="text-center">
          <div className="text-6xl font-bold text-primary mb-2">
            {completedCount}/{habits.length}
          </div>
          <p className="text-muted-foreground">Completed Today</p>
        </div>

        {/* Energy Level */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <Label className="text-lg">How's your energy today?</Label>
            <div className="flex items-center gap-2">
              <Moon className="h-5 w-5 text-muted-foreground" />
              <input
                type="range"
                min="1"
                max="10"
                value={energy}
                onChange={(e) => setEnergy(parseInt(e.target.value))}
                className="flex-1"
              />
              <Sun className="h-5 w-5 text-primary" />
              <span className="min-w-[2rem] text-center font-bold">{energy}</span>
            </div>
          </CardContent>
        </Card>

        {/* Daily Reflection */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-lg">Today's Reflection</Label>
              <Textarea
                placeholder="How did today go? What did you learn?"
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-lg">Achievements</Label>
              {achievements.map((achievement, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Achievement ${index + 1}`}
                    value={achievement}
                    onChange={(e) => {
                      const newAchievements = [...achievements];
                      newAchievements[index] = e.target.value;
                      setAchievements(newAchievements);
                    }}
                  />
                  {index === achievements.length - 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setAchievements([...achievements, ''])}
                    >
                      +
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Button onClick={saveReflection} className="w-full">
              Save Reflection
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
