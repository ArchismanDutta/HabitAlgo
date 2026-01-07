import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useWorkoutStore } from '@/store/useWorkoutStore';
import Header from '@/components/layout/Header';
import { Clock, ChevronLeft, ChevronRight, CheckCircle, XCircle, Plus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import type { EnergyLevel } from '@/types/gym';
import ExerciseSubstitutionDialog from '@/components/gym/workout/ExerciseSubstitutionDialog';

export default function ActiveWorkoutView() {
  const navigate = useNavigate();
  const { activeSession, logSet, completeWorkout, cancelWorkout, substituteExercise } = useWorkoutStore();

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [actualWeight, setActualWeight] = useState('');
  const [actualReps, setActualReps] = useState('');
  const [setNotes, setSetNotes] = useState('');
  const [exerciseNotes, setExerciseNotes] = useState('');
  const [energy, setEnergy] = useState<EnergyLevel>('normal');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [completing, setCompleting] = useState(false);
  const [showSubstitutionDialog, setShowSubstitutionDialog] = useState(false);

  useEffect(() => {
    if (!activeSession) {
      navigate('/gym');
      return;
    }

    // Timer
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession, navigate]);

  if (!activeSession) return null;

  const currentExercise = activeSession.exercises[currentExerciseIndex];
  const totalExercises = activeSession.exercises.length;
  const currentSetNumber = currentExercise.sets.length + 1;

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return hrs > 0
      ? `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      : `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLogSet = async () => {
    if (!actualWeight || !actualReps) {
      toast.error('Please enter weight and reps');
      return;
    }

    try {
      await logSet(activeSession._id, currentExercise.exerciseId, {
        setNumber: currentSetNumber,
        plannedReps: parseInt(actualReps),
        actualReps: parseInt(actualReps),
        plannedWeight: parseFloat(actualWeight),
        actualWeight: parseFloat(actualWeight),
        completed: true,
        notes: setNotes || undefined,
      });

      toast.success(`Set ${currentSetNumber} logged! 💪`);

      // Reset inputs for next set
      setActualWeight('');
      setActualReps('');
      setSetNotes('');
    } catch (error) {
      toast.error('Failed to log set');
    }
  };

  const handlePreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(prev => prev - 1);
      setActualWeight('');
      setActualReps('');
      setSetNotes('');
    }
  };

  const handleNextExercise = () => {
    if (currentExerciseIndex < totalExercises - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setActualWeight('');
      setActualReps('');
      setSetNotes('');
    }
  };

  const handleCompleteWorkout = async () => {
    setCompleting(true);
    try {
      await completeWorkout(activeSession._id);
      toast.success('Workout completed! 🎉');
      navigate('/gym');
    } catch (error) {
      toast.error('Failed to complete workout');
      setCompleting(false);
    }
  };

  const handleCancelWorkout = () => {
    if (confirm('Are you sure you want to cancel this workout? Progress will not be saved.')) {
      cancelWorkout();
      navigate('/gym');
    }
  };

  const handleSubstitute = async (newExerciseId: string, newExerciseName: string, reason?: string) => {
    try {
      await substituteExercise(
        activeSession!._id,
        currentExercise.exerciseId,
        newExerciseId,
        newExerciseName,
        reason
      );
      toast.success(`Exercise substituted: ${newExerciseName} 🔄`);
      // Move to the substituted exercise (next in list)
      if (currentExerciseIndex < totalExercises) {
        setCurrentExerciseIndex(prev => prev + 1);
      }
    } catch (error) {
      toast.error('Failed to substitute exercise');
    }
  };

  const energyOptions: { level: EnergyLevel; emoji: string; label: string }[] = [
    { level: 'low', emoji: '😴', label: 'Low' },
    { level: 'normal', emoji: '😊', label: 'Normal' },
    { level: 'high', emoji: '💪', label: 'High' },
    { level: 'extra_power', emoji: '⚡', label: 'Extra' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header title="Active Workout" />

      <div className="container mx-auto px-4 py-6 space-y-6 max-w-2xl">
        {/* Workout Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold">{activeSession.programName}</h2>
                <p className="text-sm text-muted-foreground">
                  Exercise {currentExerciseIndex + 1} of {totalExercises}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-2xl font-mono">
                  <Clock className="h-5 w-5" />
                  {formatTime(elapsedTime)}
                </div>
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${((currentExerciseIndex + 1) / totalExercises) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Completion Progress */}
        {activeSession.completionStats && (
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-green-200 dark:border-green-800">
            <CardContent className="pt-4 xxs:pt-5 px-3 xxs:px-4 sm:px-6 pb-4 xxs:pb-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm xxs:text-base font-semibold text-green-700 dark:text-green-400">Session Progress</h3>
                <div className="flex items-center gap-1.5 xxs:gap-2 px-2 xxs:px-3 py-1 bg-green-500 text-white rounded-full">
                  <CheckCircle className="h-3.5 w-3.5 xxs:h-4 xxs:w-4" />
                  <span className="text-xs xxs:text-sm font-bold">{activeSession.completionStats.completionPercentage}%</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 xxs:gap-3 sm:gap-4">
                <div className="text-center p-2 xxs:p-3 bg-white/60 dark:bg-gray-800/40 rounded-lg">
                  <div className="text-lg xxs:text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
                    {activeSession.completionStats.exercisesCompleted}/{activeSession.completionStats.exercisesPlanned}
                  </div>
                  <div className="text-[10px] xxs:text-xs text-muted-foreground mt-0.5 xxs:mt-1">Exercises</div>
                </div>
                <div className="text-center p-2 xxs:p-3 bg-white/60 dark:bg-gray-800/40 rounded-lg">
                  <div className="text-lg xxs:text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {activeSession.completionStats.setsCompleted}/{activeSession.completionStats.setsPlanned}
                  </div>
                  <div className="text-[10px] xxs:text-xs text-muted-foreground mt-0.5 xxs:mt-1">Sets</div>
                </div>
                <div className="text-center p-2 xxs:p-3 bg-white/60 dark:bg-gray-800/40 rounded-lg">
                  <div className="text-lg xxs:text-xl sm:text-2xl font-bold text-gray-700 dark:text-gray-300">
                    {formatTime(elapsedTime)}
                  </div>
                  <div className="text-[10px] xxs:text-xs text-muted-foreground mt-0.5 xxs:mt-1">Time</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current Exercise */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate">{currentExercise.exerciseName}</span>
                  {currentExercise.isSubstitute && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400">
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Substitute
                    </span>
                  )}
                </div>
                {currentExercise.substitutedFor && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Replaces: {currentExercise.substitutedFor.exerciseName}
                    {currentExercise.substitutedFor.reason && ` (${currentExercise.substitutedFor.reason})`}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePreviousExercise}
                  disabled={currentExerciseIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNextExercise}
                  disabled={currentExerciseIndex === totalExercises - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Substitute Exercise Button */}
            {currentExercise.sets.length === 0 && !currentExercise.isSubstitute && (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSubstitutionDialog(true)}
                  className="text-orange-600 border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Can't do this exercise? Substitute it
                </Button>
              </div>
            )}
            {/* Completed Sets */}
            {currentExercise.sets.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Completed Sets:</p>
                {currentExercise.sets.map((set, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Set {set.setNumber}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-bold">{set.actualWeight} kg</span> × <span className="font-bold">{set.actualReps}</span> reps
                      {set.notes && <p className="text-xs text-muted-foreground mt-1">{set.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Current Set Input */}
            <div className="space-y-4 p-4 border-2 border-orange-500 rounded-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Set {currentSetNumber}</h3>
                <div className="text-right">
                  <span className="text-sm text-muted-foreground">
                    {currentExercise.sets.length} set{currentExercise.sets.length !== 1 ? 's' : ''} completed
                  </span>
                  {currentExercise.plannedSets && (
                    <p className="text-xs text-muted-foreground">
                      Target: {currentExercise.plannedSets} sets × {currentExercise.plannedReps} reps
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="text-sm font-medium">Weight (kg)</label>
                  <Input
                    type="number"
                    step="0.5"
                    value={actualWeight}
                    onChange={(e) => setActualWeight(e.target.value)}
                    placeholder={currentExercise.plannedWeight ? `${currentExercise.plannedWeight}` : "0"}
                    className="text-lg h-12 xxs:h-14"
                    inputMode="decimal"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Reps</label>
                  <Input
                    type="number"
                    value={actualReps}
                    onChange={(e) => setActualReps(e.target.value)}
                    placeholder={currentExercise.plannedReps || "0"}
                    className="text-lg h-12 xxs:h-14"
                    inputMode="numeric"
                  />
                </div>
              </div>

              {/* Energy Level */}
              <div>
                <label className="text-sm font-medium mb-2 block">Energy Level</label>
                <div className="grid grid-cols-2 xs:grid-cols-4 gap-2">
                  {energyOptions.map(option => (
                    <button
                      key={option.level}
                      onClick={() => setEnergy(option.level)}
                      className={`min-h-[64px] p-3 xxs:p-4 rounded-lg border-2 transition-all active:scale-95 ${
                        energy === option.level
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className="text-2xl sm:text-3xl mb-1">{option.emoji}</div>
                      <div className="text-xs sm:text-sm">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Set Notes */}
              <div>
                <label className="text-sm font-medium">Notes (optional)</label>
                <Textarea
                  value={setNotes}
                  onChange={(e) => setSetNotes(e.target.value)}
                  placeholder="How did this set feel?"
                  rows={2}
                />
              </div>

              <Button onClick={handleLogSet} className="w-full min-h-[48px]" size="lg">
                <Plus className="h-5 w-5 mr-2" />
                <span className="text-base sm:text-lg font-semibold">Log Set {currentSetNumber}</span>
              </Button>
            </div>

            {/* Exercise Notes */}
            {currentExercise.sets.length > 0 && (
              <div>
                <label className="text-sm font-medium">Exercise Notes (optional)</label>
                <Textarea
                  value={exerciseNotes}
                  onChange={(e) => setExerciseNotes(e.target.value)}
                  placeholder="Overall thoughts on this exercise..."
                  rows={2}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <Button
            variant="outline"
            onClick={handlePreviousExercise}
            disabled={currentExerciseIndex === 0}
            className="min-h-[44px]"
          >
            <ChevronLeft className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="text-sm sm:text-base">Previous</span>
          </Button>
          <Button
            variant="outline"
            onClick={handleNextExercise}
            disabled={currentExerciseIndex === totalExercises - 1}
            className="min-h-[44px]"
          >
            <span className="text-sm sm:text-base">Next</span>
            <ChevronRight className="h-4 w-4 ml-1 sm:ml-2" />
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 sm:gap-3 pb-4">
          <Button variant="outline" onClick={handleCancelWorkout} className="flex-1 min-h-[48px]">
            <XCircle className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="text-sm sm:text-base">Cancel</span>
          </Button>
          <Button onClick={handleCompleteWorkout} disabled={completing} className="flex-1 min-h-[48px]">
            <CheckCircle className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="text-sm sm:text-base">{completing ? 'Finishing...' : 'Finish'}</span>
          </Button>
        </div>
      </div>

      {/* Exercise Substitution Dialog */}
      <ExerciseSubstitutionDialog
        open={showSubstitutionDialog}
        onOpenChange={setShowSubstitutionDialog}
        originalExerciseName={currentExercise.exerciseName}
        onSubstitute={handleSubstitute}
      />
    </div>
  );
}
