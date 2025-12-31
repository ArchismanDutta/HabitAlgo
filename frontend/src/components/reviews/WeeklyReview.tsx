import { useEffect, useState } from 'react';
import { useHabitStore } from '@/store/useHabitStore';
import { useLogStore } from '@/store/useLogStore';
import { Habit } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  TrendingDown,
  TrendingUp,
  Heart,
  Lightbulb,
  Target,
  Award,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { formatDate } from '@/utils/dateUtils';
import { toast } from 'sonner';

interface HabitWeekStats {
  habit: Habit;
  completed: number;
  total: number;
  rate: number;
}

interface WeeklyReviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function WeeklyReview({ open, onOpenChange }: WeeklyReviewProps) {
  const { habits } = useHabitStore();
  const { logs } = useLogStore();
  const [weekStats, setWeekStats] = useState<HabitWeekStats[]>([]);
  const [expandedHabits, setExpandedHabits] = useState<Set<string>>(new Set());
  const [reflections, setReflections] = useState({
    start: '',
    stop: '',
    continue: '',
  });

  useEffect(() => {
    if (open) {
      calculateWeekStats();
      loadReflections();
    }
  }, [open, habits, logs]);

  const calculateWeekStats = () => {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const stats: HabitWeekStats[] = habits.map((habit) => {
      let completed = 0;
      let total = 7;

      // Count completed days in the last 7 days
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = formatDate(date, 'yyyy-MM-dd');
        const dayLogs = logs[dateStr] || [];
        const log = dayLogs.find((l) => l.habitId === habit._id);

        if (log?.completed) {
          completed++;
        }
      }

      return {
        habit,
        completed,
        total,
        rate: (completed / total) * 100,
      };
    });

    // Sort by rate (struggling habits first)
    stats.sort((a, b) => a.rate - b.rate);
    setWeekStats(stats);

    // Auto-expand struggling habits with meaning
    const strugglingWithMeaning = new Set(
      stats
        .filter((s) => s.rate < 50 && !!(s.habit.why || s.habit.identityStatement))
        .map((s) => s.habit._id)
    );
    setExpandedHabits(strugglingWithMeaning);
  };

  const loadReflections = () => {
    // Load from localStorage
    const saved = localStorage.getItem('weeklyReview');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setReflections(data);
      } catch (error) {
        console.error('Failed to load reflections:', error);
      }
    }
  };

  const saveReflections = () => {
    localStorage.setItem('weeklyReview', JSON.stringify(reflections));
    toast.success('Weekly review saved!');
  };

  const toggleExpanded = (habitId: string) => {
    const newExpanded = new Set(expandedHabits);
    if (newExpanded.has(habitId)) {
      newExpanded.delete(habitId);
    } else {
      newExpanded.add(habitId);
    }
    setExpandedHabits(newExpanded);
  };

  const strugglingHabits = weekStats.filter((s) => s.rate < 50);
  const thrivingHabits = weekStats.filter((s) => s.rate >= 80);
  const averageCompletion =
    weekStats.length > 0
      ? Math.round(weekStats.reduce((acc, s) => acc + s.rate, 0) / weekStats.length)
      : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Target className="h-7 w-7 text-primary" />
            Weekly Review
          </DialogTitle>
          <DialogDescription>
            Reflect on your progress and reconnect with your why
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Overall Stats */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center mb-4">
                <div className="text-5xl font-bold text-primary mb-2">
                  {averageCompletion}%
                </div>
                <p className="text-muted-foreground">Average Completion This Week</p>
              </div>
              <Progress value={averageCompletion} className="h-3" />
            </CardContent>
          </Card>

          {/* Thriving Habits */}
          {thrivingHabits.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-green-500" />
                <h3 className="font-semibold text-lg">Thriving Habits (80%+)</h3>
              </div>
              <div className="grid gap-2">
                {thrivingHabits.map((stat) => (
                  <Card key={stat.habit._id} className="border-green-200 dark:border-green-900">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{stat.habit.icon}</span>
                          <div>
                            <h4 className="font-medium">{stat.habit.name}</h4>
                            <p className="text-xs text-muted-foreground">
                              {stat.completed}/{stat.total} days completed
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-500">
                            {Math.round(stat.rate)}%
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Struggling Habits */}
          {strugglingHabits.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-amber-500" />
                <h3 className="font-semibold text-lg">Needs Attention (&lt;50%)</h3>
              </div>
              <div className="grid gap-3">
                {strugglingHabits.map((stat) => {
                  const hasMeaning = !!(stat.habit.why || stat.habit.identityStatement);
                  const isExpanded = expandedHabits.has(stat.habit._id);

                  return (
                    <Card
                      key={stat.habit._id}
                      className="border-amber-200 dark:border-amber-900"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3 flex-1">
                            <span className="text-2xl">{stat.habit.icon}</span>
                            <div className="flex-1">
                              <h4 className="font-medium">{stat.habit.name}</h4>
                              <p className="text-xs text-muted-foreground">
                                {stat.completed}/{stat.total} days completed
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="text-2xl font-bold text-amber-500">
                                {Math.round(stat.rate)}%
                              </div>
                            </div>
                            {hasMeaning && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleExpanded(stat.habit._id)}
                                className="h-8 w-8 p-0"
                              >
                                {isExpanded ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                          </div>
                        </div>

                        {hasMeaning && isExpanded && (
                          <div className="mt-4 space-y-3 pt-3 border-t">
                            {stat.habit.why && (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                                  <h5 className="font-medium text-sm">
                                    Remember why this matters:
                                  </h5>
                                </div>
                                <p className="text-sm text-muted-foreground pl-6 leading-relaxed">
                                  {stat.habit.why}
                                </p>
                              </div>
                            )}

                            {stat.habit.identityStatement && (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Heart className="h-4 w-4 text-pink-500" />
                                  <h5 className="font-medium text-sm">Who you're becoming:</h5>
                                </div>
                                <p className="text-sm text-primary font-medium pl-6 italic">
                                  {stat.habit.identityStatement}
                                </p>
                              </div>
                            )}

                            <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded text-xs">
                              <p className="text-muted-foreground">
                                💡 It's not about perfection—it's about progress. Every small step
                                reinforces your identity and brings you closer to your goals.
                              </p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Monthly Review Section (Start/Stop/Continue) */}
          <Card className="border-purple-200 dark:border-purple-900">
            <CardContent className="pt-6 space-y-4">
              <h3 className="font-semibold text-lg mb-4">Reflect & Plan Ahead</h3>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  Start: What new habit or behavior will you adopt?
                </Label>
                <Textarea
                  placeholder="e.g., I'll start meditating for 5 minutes each morning..."
                  value={reflections.start}
                  onChange={(e) =>
                    setReflections({ ...reflections, start: e.target.value })
                  }
                  rows={2}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  Stop: What's not serving you anymore?
                </Label>
                <Textarea
                  placeholder="e.g., I'll stop checking my phone first thing in the morning..."
                  value={reflections.stop}
                  onChange={(e) => setReflections({ ...reflections, stop: e.target.value })}
                  rows={2}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-blue-500" />
                  Continue: What's working well?
                </Label>
                <Textarea
                  placeholder="e.g., I'll continue my evening reading routine..."
                  value={reflections.continue}
                  onChange={(e) =>
                    setReflections({ ...reflections, continue: e.target.value })
                  }
                  rows={2}
                  className="resize-none"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={saveReflections}>Save Review</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
