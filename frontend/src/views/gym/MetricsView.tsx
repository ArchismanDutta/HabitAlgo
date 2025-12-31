import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMetricsStore } from '@/store/useMetricsStore';
import Header from '@/components/layout/Header';
import { Plus, TrendingUp, Target, Scale, Edit } from 'lucide-react';
import { toast } from 'sonner';
import type { BodyGoalType } from '@/types/gym';

export default function MetricsView() {
  const { metrics, latestMetrics, activeGoal, fetchMetrics, fetchLatestMetrics, fetchActiveGoal, upsertMetrics, createGoal, updateGoal } = useMetricsStore();

  const [showAddWeight, setShowAddWeight] = useState(false);
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Goal form state
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalType, setGoalType] = useState<BodyGoalType>('muscle_gain');
  const [startWeight, setStartWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [weeklyTarget, setWeeklyTarget] = useState('');
  const [goalSubmitting, setGoalSubmitting] = useState(false);

  useEffect(() => {
    fetchMetrics({
      startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    });
    fetchLatestMetrics();
    fetchActiveGoal();
  }, []);

  // Populate form when editing active goal
  useEffect(() => {
    if (activeGoal && showGoalForm) {
      setGoalType(activeGoal.type);
      setStartWeight(activeGoal.startWeight.toString());
      setTargetWeight(activeGoal.targetWeight.toString());
      setWeeklyTarget(activeGoal.weeklyTarget?.toString() || '');
    }
  }, [activeGoal, showGoalForm]);

  const handleAddWeight = async () => {
    if (!weight) {
      toast.error('Please enter weight');
      return;
    }

    setSubmitting(true);
    try {
      await upsertMetrics({
        date: new Date().toISOString().split('T')[0],
        weight: parseFloat(weight),
        bodyFat: bodyFat ? parseFloat(bodyFat) : undefined,
      });
      toast.success('Weight logged! 📊');
      setShowAddWeight(false);
      setWeight('');
      setBodyFat('');
      fetchLatestMetrics();
    } catch (error) {
      toast.error('Failed to log weight');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateGoal = async () => {
    if (!startWeight || !targetWeight) {
      toast.error('Please enter start and target weight');
      return;
    }

    setGoalSubmitting(true);
    try {
      await createGoal({
        type: goalType,
        startWeight: parseFloat(startWeight),
        targetWeight: parseFloat(targetWeight),
        weeklyTarget: weeklyTarget ? parseFloat(weeklyTarget) : undefined
      });
      toast.success('Goal created! 🎯');
      setShowGoalForm(false);
      setStartWeight('');
      setTargetWeight('');
      setWeeklyTarget('');
      fetchActiveGoal();
    } catch (error) {
      toast.error('Failed to create goal');
    } finally {
      setGoalSubmitting(false);
    }
  };

  const handleUpdateGoal = async () => {
    if (!activeGoal) return;

    if (!targetWeight) {
      toast.error('Please enter target weight');
      return;
    }

    setGoalSubmitting(true);
    try {
      await updateGoal(activeGoal._id, {
        type: goalType,
        targetWeight: parseFloat(targetWeight),
        weeklyTarget: weeklyTarget ? parseFloat(weeklyTarget) : undefined
      });
      toast.success('Goal updated! 🎯');
      setShowGoalForm(false);
      setStartWeight('');
      setTargetWeight('');
      setWeeklyTarget('');
      fetchActiveGoal();
    } catch (error) {
      toast.error('Failed to update goal');
    } finally {
      setGoalSubmitting(false);
    }
  };

  const getProgressPercentage = () => {
    if (!activeGoal) return 0;
    const totalChange = activeGoal.targetWeight - activeGoal.startWeight;
    const currentChange = activeGoal.currentWeight - activeGoal.startWeight;
    return Math.min(Math.max((currentChange / totalChange) * 100, 0), 100);
  };

  const getProgressColor = () => {
    const progress = getProgressPercentage();
    if (progress >= 75) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="Body Metrics & Goals" />

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Current Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Weight</p>
                  <p className="text-3xl font-bold">{latestMetrics?.weight || '--'} kg</p>
                  {latestMetrics?.date && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(latestMetrics.date).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <Scale className="h-10 w-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Body Fat</p>
                  <p className="text-3xl font-bold">{latestMetrics?.bodyFat || '--'}%</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {latestMetrics?.bodyFat ? 'Latest' : 'Not tracked'}
                  </p>
                </div>
                <TrendingUp className="h-10 w-10 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Target Weight</p>
                  <p className="text-3xl font-bold">{activeGoal?.targetWeight || '--'} kg</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {activeGoal ? activeGoal.type.replace('_', ' ') : 'No goal set'}
                  </p>
                </div>
                <Target className="h-10 w-10 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add Weight */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Track Weight</span>
              <Button size="sm" onClick={() => setShowAddWeight(!showAddWeight)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Entry
              </Button>
            </CardTitle>
          </CardHeader>
          {showAddWeight && (
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="text-sm font-medium">Weight (kg)</label>
                  <Input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="75.0"
                    className="h-11 sm:h-auto"
                    inputMode="decimal"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Body Fat % (optional)</label>
                  <Input
                    type="number"
                    value={bodyFat}
                    onChange={(e) => setBodyFat(e.target.value)}
                    placeholder="15.0"
                    className="h-11 sm:h-auto"
                    inputMode="decimal"
                  />
                </div>
              </div>
              <Button onClick={handleAddWeight} disabled={submitting} className="w-full">
                {submitting ? 'Saving...' : 'Save Entry'}
              </Button>
            </CardContent>
          )}
        </Card>

        {/* Goal Progress or Create Goal */}
        {activeGoal ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Goal Progress</span>
                <Button size="sm" variant="outline" onClick={() => setShowGoalForm(!showGoalForm)}>
                  <Edit className="h-4 w-4 mr-2" />
                  {showGoalForm ? 'Cancel' : 'Update Goal'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {showGoalForm ? (
                // Update Goal Form
                <div className="space-y-4">
                  <div>
                    <Label>Goal Type</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {(['weight_loss', 'muscle_gain', 'maintenance', 'recomp'] as BodyGoalType[]).map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setGoalType(type)}
                          className={`min-h-[48px] p-3 rounded-lg border-2 text-sm font-medium capitalize transition-all active:scale-95 ${
                            goalType === type
                              ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                              : 'border-gray-200 dark:border-gray-700'
                          }`}
                        >
                          {type.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <Label htmlFor="updateStartWeight">Start Weight (kg)</Label>
                      <Input
                        id="updateStartWeight"
                        type="number"
                        value={startWeight}
                        disabled
                        className="bg-gray-100 dark:bg-gray-800 h-11 sm:h-auto"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Cannot change start weight</p>
                    </div>
                    <div>
                      <Label htmlFor="updateTargetWeight">Target Weight (kg)</Label>
                      <Input
                        id="updateTargetWeight"
                        type="number"
                        value={targetWeight}
                        onChange={(e) => setTargetWeight(e.target.value)}
                        placeholder="70.0"
                        className="h-11 sm:h-auto"
                        inputMode="decimal"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="updateWeeklyTarget">Weekly Target (kg/week) - Optional</Label>
                    <Input
                      id="updateWeeklyTarget"
                      type="number"
                      step="0.1"
                      value={weeklyTarget}
                      onChange={(e) => setWeeklyTarget(e.target.value)}
                      placeholder="0.5"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Recommended: 0.25-0.5 kg/week for fat loss, 0.25-1 kg/week for muscle gain
                    </p>
                  </div>

                  <Button onClick={handleUpdateGoal} disabled={goalSubmitting} className="w-full">
                    {goalSubmitting ? 'Updating...' : 'Update Goal'}
                  </Button>
                </div>
              ) : (
                // Goal Progress Display
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold capitalize">{activeGoal.type.replace('_', ' ')}</p>
                      <p className="text-sm text-muted-foreground">
                        {activeGoal.startWeight} kg → {activeGoal.targetWeight} kg
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold">{Math.round(getProgressPercentage())}%</p>
                      <p className="text-sm text-muted-foreground">Complete</p>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                    <div
                      className={`${getProgressColor()} h-4 rounded-full transition-all`}
                      style={{ width: `${getProgressPercentage()}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Start</p>
                      <p className="text-lg font-bold">{activeGoal.startWeight} kg</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Current</p>
                      <p className="text-lg font-bold">{activeGoal.currentWeight} kg</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Target</p>
                      <p className="text-lg font-bold">{activeGoal.targetWeight} kg</p>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      {Math.abs(activeGoal.targetWeight - activeGoal.currentWeight).toFixed(1)} kg to go
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Set Your Goal</span>
                <Button size="sm" onClick={() => setShowGoalForm(!showGoalForm)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Goal
                </Button>
              </CardTitle>
            </CardHeader>
            {showGoalForm && (
              <CardContent className="space-y-4">
                <div>
                  <Label>Goal Type</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {(['weight_loss', 'muscle_gain', 'maintenance', 'recomp'] as BodyGoalType[]).map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setGoalType(type)}
                        className={`min-h-[48px] p-3 rounded-lg border-2 text-sm font-medium capitalize transition-all active:scale-95 ${
                          goalType === type
                            ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        {type.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <Label htmlFor="startWeight">Start Weight (kg)</Label>
                    <Input
                      id="startWeight"
                      type="number"
                      value={startWeight}
                      onChange={(e) => setStartWeight(e.target.value)}
                      placeholder={latestMetrics?.weight?.toString() || "75.0"}
                      className="h-11 sm:h-auto"
                      inputMode="decimal"
                    />
                  </div>
                  <div>
                    <Label htmlFor="targetWeight">Target Weight (kg)</Label>
                    <Input
                      id="targetWeight"
                      type="number"
                      value={targetWeight}
                      onChange={(e) => setTargetWeight(e.target.value)}
                      placeholder="70.0"
                      className="h-11 sm:h-auto"
                      inputMode="decimal"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="weeklyTarget">Weekly Target (kg/week) - Optional</Label>
                  <Input
                    id="weeklyTarget"
                    type="number"
                    step="0.1"
                    value={weeklyTarget}
                    onChange={(e) => setWeeklyTarget(e.target.value)}
                    placeholder="0.5"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Recommended: 0.25-0.5 kg/week for fat loss, 0.25-1 kg/week for muscle gain
                  </p>
                </div>

                <Button onClick={handleCreateGoal} disabled={goalSubmitting} className="w-full">
                  {goalSubmitting ? 'Creating...' : 'Create Goal'}
                </Button>
              </CardContent>
            )}
            {!showGoalForm && (
              <CardContent>
                <div className="text-center py-8">
                  <Target className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">No active goal</p>
                  <p className="text-xs text-muted-foreground mt-1">Create a goal to track your progress</p>
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* Weight History */}
        <Card>
          <CardHeader>
            <CardTitle>Weight History (Last 90 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">No entries yet</p>
                <p className="text-xs text-muted-foreground mt-1">Start tracking your weight to see progress!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {metrics.slice(0, 10).map(metric => (
                  <div key={metric._id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{new Date(metric.date).toLocaleDateString()}</p>
                      <p className="text-xs text-muted-foreground">
                        {metric.bodyFat && `Body Fat: ${metric.bodyFat}%`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{metric.weight} kg</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
