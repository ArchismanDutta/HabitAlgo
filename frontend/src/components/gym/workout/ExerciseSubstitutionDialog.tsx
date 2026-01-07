import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Exercise } from '@/types/gym';
import { exerciseService } from '@/services/exerciseService';
import { Search, RefreshCw } from 'lucide-react';

interface ExerciseSubstitutionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  originalExerciseName: string;
  onSubstitute: (newExerciseId: string, newExerciseName: string, reason?: string) => void;
}

export default function ExerciseSubstitutionDialog({
  open,
  onOpenChange,
  originalExerciseName,
  onSubstitute
}: ExerciseSubstitutionDialogProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadExercises();
    }
  }, [open]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      setFilteredExercises(
        exercises.filter(
          ex =>
            ex.name.toLowerCase().includes(query) ||
            ex.category.toLowerCase().includes(query) ||
            ex.muscleGroup.some(mg => mg.toLowerCase().includes(query))
        )
      );
    } else {
      setFilteredExercises(exercises);
    }
  }, [searchQuery, exercises]);

  const loadExercises = async () => {
    setLoading(true);
    try {
      const data = await exerciseService.getAll();
      setExercises(data);
      setFilteredExercises(data);
    } catch (error) {
      console.error('Failed to load exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubstitute = () => {
    if (!selectedExercise) return;
    onSubstitute(selectedExercise._id, selectedExercise.name, reason || undefined);
    handleClose();
  };

  const handleClose = () => {
    setSearchQuery('');
    setSelectedExercise(null);
    setReason('');
    onOpenChange(false);
  };

  const reasonOptions = [
    'Equipment unavailable',
    'Injury or discomfort',
    'Personal preference',
    'Better alternative'
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Substitute Exercise
          </DialogTitle>
          <DialogDescription>
            Replace <strong>{originalExerciseName}</strong> with a different exercise
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Reason Selection */}
          <div>
            <Label>Reason for substitution (optional)</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {reasonOptions.map(option => (
                <Button
                  key={option}
                  type="button"
                  variant={reason === option ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setReason(option)}
                  className="justify-start"
                >
                  {option}
                </Button>
              ))}
            </div>
            <Textarea
              placeholder="Or enter custom reason..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-2"
              rows={2}
            />
          </div>

          {/* Exercise Search */}
          <div>
            <Label>Search for replacement exercise</Label>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, category, or muscle group..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Exercise List */}
          <div className="border rounded-lg">
            <ScrollArea className="h-[300px]">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-muted-foreground">Loading exercises...</p>
                </div>
              ) : filteredExercises.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-muted-foreground">No exercises found</p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {filteredExercises.map((exercise) => (
                    <button
                      key={exercise._id}
                      onClick={() => setSelectedExercise(exercise)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        selectedExercise?._id === exercise._id
                          ? 'border-primary bg-primary/10'
                          : 'border-transparent hover:bg-accent'
                      }`}
                    >
                      <div className="font-medium">{exercise.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {exercise.category} • {exercise.muscleGroup.join(', ')}
                        {exercise.equipment && ` • ${exercise.equipment}`}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubstitute}
            disabled={!selectedExercise}
          >
            Substitute Exercise
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
