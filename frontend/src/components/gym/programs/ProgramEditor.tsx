import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { gymProgramService } from '@/services/gymProgramService';
import { exerciseService } from '@/services/exerciseService';
import { toast } from 'sonner';
import { Plus, Trash2, GripVertical, Search } from 'lucide-react';
import type { WorkoutProgram, Exercise, ExerciseInProgram, ExerciseCategory } from '@/types/gym';

interface ProgramEditorProps {
  program: WorkoutProgram | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function ProgramEditor({ program, open, onOpenChange, onSuccess }: ProgramEditorProps) {
  const [submitting, setSubmitting] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#ff6b35',
    icon: '💪',
    exercises: [] as ExerciseInProgram[],
    scheduledDays: [] as number[]
  });

  useEffect(() => {
    if (program && open) {
      setFormData({
        name: program.name,
        description: program.description || '',
        color: program.color,
        icon: program.icon,
        exercises: program.exercises || [],
        scheduledDays: program.scheduledDays
      });
    }
  }, [program, open]);

  useEffect(() => {
    if (open) {
      loadExercises();
    }
  }, [open, selectedCategory, searchQuery]);

  const loadExercises = async () => {
    try {
      const data = await exerciseService.getAll(
        selectedCategory === 'All' ? undefined : selectedCategory,
        searchQuery || undefined
      );
      setExercises(data);
    } catch (error) {
      console.error('Failed to load exercises:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error('Please enter a program name');
      return;
    }

    if (formData.scheduledDays.length === 0) {
      toast.error('Please select at least one day');
      return;
    }

    setSubmitting(true);
    try {
      if (program) {
        await gymProgramService.update(program._id, formData);
        toast.success('Program updated! 🎉');
      } else {
        await gymProgramService.create(formData);
        toast.success('Program created! 🎉');
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error(`Failed to ${program ? 'update' : 'create'} program`);
    } finally {
      setSubmitting(false);
    }
  };

  const addExerciseToProgram = (exercise: Exercise) => {
    const alreadyAdded = formData.exercises.some(
      e => (typeof e.exerciseId === 'string' ? e.exerciseId : e.exerciseId._id) === exercise._id
    );

    if (alreadyAdded) {
      toast.error('Exercise already added');
      return;
    }

    const newExercise: ExerciseInProgram = {
      exerciseId: exercise._id,
      order: formData.exercises.length + 1,
      plannedSets: 3,
      plannedReps: '8-12',
      plannedWeight: 0,
      restTime: 90,
      notes: ''
    };

    setFormData(prev => ({
      ...prev,
      exercises: [...prev.exercises, newExercise]
    }));
    toast.success(`Added ${exercise.name}`);
  };

  const removeExercise = (index: number) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index).map((ex, i) => ({
        ...ex,
        order: i + 1
      }))
    }));
  };

  const updateExercise = (index: number, updates: Partial<ExerciseInProgram>) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.map((ex, i) => i === index ? { ...ex, ...updates } : ex)
    }));
  };

  const toggleDay = (day: number) => {
    setFormData(prev => ({
      ...prev,
      scheduledDays: prev.scheduledDays.includes(day)
        ? prev.scheduledDays.filter(d => d !== day)
        : [...prev.scheduledDays, day].sort()
    }));
  };

  const days = [
    { value: 0, label: 'Sun' },
    { value: 1, label: 'Mon' },
    { value: 2, label: 'Tue' },
    { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' },
    { value: 5, label: 'Fri' },
    { value: 6, label: 'Sat' }
  ];

  const iconOptions = ['💪', '🏋️', '🔥', '⚡', '🎯', '🚀', '💯', '🦾'];
  const colorOptions = ['#ff6b35', '#4ecdc4', '#45b7d1', '#f7b731', '#5f27cd', '#00d2d3', '#ee5a6f', '#c44569'];
  const categories: (ExerciseCategory | 'All')[] = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl lg:max-w-4xl max-h-[92vh] overflow-hidden flex flex-col p-3 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">{program ? 'Edit' : 'Create'} Workout Program</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details" className="text-sm sm:text-base">Details</TabsTrigger>
            <TabsTrigger value="exercises" className="text-sm sm:text-base">
              <span className="hidden xs:inline">Exercises </span>({formData.exercises.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="overflow-y-auto flex-1">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Program Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Push Day"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Chest, shoulders, triceps workout"
                  rows={2}
                />
              </div>

              <div>
                <Label>Icon</Label>
                <div className="grid grid-cols-4 sm:flex gap-2 mt-2">
                  {iconOptions.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon })}
                      className={`min-h-[48px] text-2xl p-3 rounded-lg transition-all active:scale-95 ${
                        formData.icon === icon
                          ? 'bg-orange-100 dark:bg-orange-900 scale-110'
                          : 'bg-gray-100 dark:bg-gray-800 hover:scale-105'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Color</Label>
                <div className="grid grid-cols-4 sm:flex gap-2 mt-2">
                  {colorOptions.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`min-w-[48px] min-h-[48px] w-full sm:w-10 sm:h-10 rounded-lg transition-all active:scale-95 ${
                        formData.color === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <Label>Schedule Days *</Label>
                <div className="grid grid-cols-7 gap-1 sm:gap-2 mt-2">
                  {days.map(day => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDay(day.value)}
                      className={`min-h-[44px] py-2 px-1 sm:px-3 rounded-lg font-medium text-xs sm:text-sm transition-all active:scale-95 ${
                        formData.scheduledDays.includes(day.value)
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-800'
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="exercises" className="overflow-y-auto flex-1 space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {/* Program Exercises List */}
              <div className="space-y-3">
                <h3 className="font-semibold">Program Exercises</h3>
                {formData.exercises.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 text-center py-8">
                      <p className="text-sm text-muted-foreground">No exercises added yet</p>
                      <p className="text-xs text-muted-foreground mt-1">Add from the exercise library →</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-2">
                    {formData.exercises.map((ex, index) => {
                      const exercise = exercises.find(e => e._id === (typeof ex.exerciseId === 'string' ? ex.exerciseId : ex.exerciseId._id));
                      const exerciseName = typeof ex.exerciseId === 'string' ? exercise?.name || 'Unknown' : ex.exerciseId.name;

                      return (
                        <Card key={index}>
                          <CardContent className="pt-4 space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="font-medium">{exerciseName}</p>
                                  <p className="text-xs text-muted-foreground">Exercise #{ex.order}</p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeExercise(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <Label className="text-xs">Target Sets</Label>
                                <Input
                                  type="number"
                                  value={ex.plannedSets}
                                  onChange={(e) => updateExercise(index, { plannedSets: parseInt(e.target.value) })}
                                  min={1}
                                  className="h-10 sm:h-8"
                                  inputMode="numeric"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Target Reps</Label>
                                <Input
                                  value={ex.plannedReps}
                                  onChange={(e) => updateExercise(index, { plannedReps: e.target.value })}
                                  placeholder="8-12"
                                  className="h-10 sm:h-8"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Rest (s)</Label>
                                <Input
                                  type="number"
                                  value={ex.restTime}
                                  onChange={(e) => updateExercise(index, { restTime: parseInt(e.target.value) })}
                                  className="h-10 sm:h-8"
                                  inputMode="numeric"
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Exercise Library */}
              <div className="space-y-3">
                <h3 className="font-semibold">Exercise Library</h3>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search exercises..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="flex gap-1 overflow-x-auto pb-2 -mx-1 px-1">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`min-h-[40px] px-3 py-2 rounded-lg whitespace-nowrap text-xs sm:text-sm transition-all active:scale-95 ${
                        selectedCategory === cat
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-800'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {exercises.map(exercise => (
                    <Card key={exercise._id} className="cursor-pointer hover:border-orange-500 transition-colors">
                      <CardContent className="pt-4" onClick={() => addExerciseToProgram(exercise)}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{exercise.name}</p>
                            <p className="text-xs text-muted-foreground">{exercise.category}</p>
                          </div>
                          <Plus className="h-4 w-4 text-orange-500" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="flex-1" disabled={submitting}>
            {submitting ? 'Saving...' : program ? 'Update Program' : 'Create Program'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
