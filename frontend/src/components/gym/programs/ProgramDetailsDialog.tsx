import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { WorkoutProgram, Exercise } from '@/types/gym';
import { Dumbbell, Calendar, Clock, Weight, Repeat, Edit } from 'lucide-react';

interface ProgramDetailsDialogProps {
  program: WorkoutProgram | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: () => void;
}

export default function ProgramDetailsDialog({
  program,
  open,
  onOpenChange,
  onEdit
}: ProgramDetailsDialogProps) {
  if (!program) return null;

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{program.icon}</span>
              <span style={{ color: program.color }}>{program.name}</span>
            </div>
            {onEdit && (
              <Button variant="ghost" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="space-y-6 pr-4">
            {/* Description */}
            {program.description && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">Description</h3>
                <p className="text-sm">{program.description}</p>
              </div>
            )}

            {/* Scheduled Days */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Scheduled Days
              </h3>
              <div className="flex gap-2 flex-wrap">
                {program.scheduledDays.length > 0 ? (
                  program.scheduledDays.sort((a, b) => a - b).map(day => (
                    <span
                      key={day}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                    >
                      {daysOfWeek[day]}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No scheduled days</span>
                )}
              </div>
            </div>

            {/* Exercises */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <Dumbbell className="h-4 w-4" />
                Exercises ({program.exercises.length})
              </h3>
              <div className="space-y-3">
                {program.exercises.map((exercise, index) => {
                  const exerciseData = typeof exercise.exerciseId === 'object'
                    ? exercise.exerciseId as Exercise
                    : null;

                  return (
                    <div
                      key={index}
                      className="p-4 border rounded-lg bg-card hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-muted-foreground">
                              #{exercise.order}
                            </span>
                            <h4 className="font-semibold">
                              {exerciseData?.name || 'Unknown Exercise'}
                            </h4>
                          </div>
                          {exerciseData && (
                            <div className="flex gap-2 flex-wrap mt-1">
                              <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded">
                                {exerciseData.category}
                              </span>
                              {exerciseData.isCompound && (
                                <span className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded">
                                  Compound
                                </span>
                              )}
                              <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 rounded">
                                {exerciseData.difficulty}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Exercise Details Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Repeat className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div>
                            <div className="text-xs text-muted-foreground">Sets</div>
                            <div className="font-semibold">{exercise.plannedSets}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Repeat className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div>
                            <div className="text-xs text-muted-foreground">Reps</div>
                            <div className="font-semibold">{exercise.plannedReps}</div>
                          </div>
                        </div>
                        {exercise.plannedWeight && (
                          <div className="flex items-center gap-2 text-sm">
                            <Weight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <div>
                              <div className="text-xs text-muted-foreground">Weight</div>
                              <div className="font-semibold">{exercise.plannedWeight} kg</div>
                            </div>
                          </div>
                        )}
                        {exercise.restTime && (
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <div>
                              <div className="text-xs text-muted-foreground">Rest</div>
                              <div className="font-semibold">{exercise.restTime}s</div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Exercise Notes */}
                      {exercise.notes && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm text-muted-foreground italic">
                            Note: {exercise.notes}
                          </p>
                        </div>
                      )}

                      {/* Exercise Instructions */}
                      {exerciseData?.instructions && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm text-muted-foreground">
                            {exerciseData.instructions}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Summary Stats */}
            <div className="pt-4 border-t">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold">{program.exercises.length}</div>
                  <div className="text-xs text-muted-foreground">Total Exercises</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold">
                    {program.exercises.reduce((sum, ex) => sum + ex.plannedSets, 0)}
                  </div>
                  <div className="text-xs text-muted-foreground">Total Sets</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold">{program.scheduledDays.length}</div>
                  <div className="text-xs text-muted-foreground">Days/Week</div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
