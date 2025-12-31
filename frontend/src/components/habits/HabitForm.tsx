import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Habit } from '@/types';
import { useHabitStore } from '@/store/useHabitStore';
import { CATEGORIES, HABIT_TYPES, NUMERIC_UNITS, COLORS, ICONS } from '@/utils/constants';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Lightbulb, Heart, Trash2 } from 'lucide-react';

const habitSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  category: z.enum(['Health', 'Work', 'Mind', 'Custom']),
  customCategory: z.string().optional(),
  type: z.enum(['boolean', 'numeric']),
  numericUnit: z.string().optional(),
  customUnit: z.string().optional(),
  targetMonthly: z.coerce.number().min(0).max(999),
  color: z.string(),
  icon: z.string(),
  why: z.string().max(500, 'Why statement too long').optional(),
  identityStatement: z.string().max(200, 'Identity statement too long').optional(),
});

type HabitFormData = z.infer<typeof habitSchema>;

interface HabitFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habit?: Habit;
}

export default function HabitForm({ open, onOpenChange, habit }: HabitFormProps) {
  const { createHabit, updateHabit, deleteHabit } = useHabitStore();
  const [selectedColor, setSelectedColor] = useState(habit?.color || COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(habit?.icon || ICONS[0]);
  const [showMeaning, setShowMeaning] = useState(!!habit?.why || !!habit?.identityStatement);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<HabitFormData>({
    resolver: zodResolver(habitSchema),
    defaultValues: {
      name: habit?.name || '',
      category: habit?.category || 'Custom',
      customCategory: habit?.customCategory || '',
      type: habit?.type || 'boolean',
      numericUnit: habit?.numericConfig?.unit || 'count',
      customUnit: habit?.numericConfig?.customUnit || '',
      targetMonthly: habit?.targetMonthly || 30,
      color: habit?.color || COLORS[0],
      icon: habit?.icon || ICONS[0],
      why: habit?.why || '',
      identityStatement: habit?.identityStatement || '',
    },
  });

  const watchCategory = watch('category');
  const watchType = watch('type');
  const watchNumericUnit = watch('numericUnit');

  const onSubmit = async (data: HabitFormData) => {
    try {
      const habitData: Partial<Habit> = {
        name: data.name,
        category: data.category,
        customCategory: data.category === 'Custom' ? data.customCategory : undefined,
        type: data.type,
        numericConfig:
          data.type === 'numeric'
            ? {
                unit: data.numericUnit as any,
                customUnit: data.numericUnit === 'custom' ? data.customUnit : undefined,
              }
            : undefined,
        targetMonthly: data.targetMonthly,
        color: selectedColor,
        icon: selectedIcon,
        why: data.why,
        identityStatement: data.identityStatement,
      };

      if (habit) {
        await updateHabit(habit._id, habitData);
        toast.success('Habit updated successfully!');
      } else {
        await createHabit(habitData);
        toast.success('Habit created successfully!');
      }

      reset();
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to save habit');
    }
  };

  const handleDelete = async () => {
    if (!habit) return;

    setIsDeleting(true);
    try {
      await deleteHabit(habit._id);
      toast.success('Habit deleted successfully');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to delete habit');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] xxs:max-w-[90vw] sm:max-w-xl md:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="px-4 xxs:px-5 sm:px-6 pt-4 xxs:pt-5 sm:pt-6">
          <DialogTitle className="text-lg xxs:text-xl sm:text-2xl">{habit ? 'Edit Habit' : 'Create New Habit'}</DialogTitle>
          <DialogDescription className="text-xs xxs:text-sm">
            {habit
              ? 'Update your habit details, goals, and meaning below.'
              : 'Create a new habit with personalized goals and meaning.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 xxs:space-y-4 px-4 xxs:px-5 sm:px-6 pb-4 xxs:pb-5 sm:pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 xxs:gap-4">
            {/* Name */}
            <div className="space-y-1.5 xxs:space-y-2 md:col-span-2">
              <Label htmlFor="name" className="text-xs xxs:text-sm">Habit Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Morning Exercise"
                {...register('name')}
                className="h-9 xxs:h-10 text-sm xxs:text-base"
              />
              {errors.name && (
                <p className="text-xs xxs:text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-1.5 xxs:space-y-2">
              <Label className="text-xs xxs:text-sm">Category</Label>
              <Select
                value={watchCategory}
                onValueChange={(value) => setValue('category', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Custom Category */}
            {watchCategory === 'Custom' && (
              <div className="space-y-1.5 xxs:space-y-2">
                <Label htmlFor="customCategory" className="text-xs xxs:text-sm">Custom Category Name</Label>
                <Input
                  id="customCategory"
                  placeholder="e.g., Social, Finance"
                  {...register('customCategory')}
                  className="h-9 xxs:h-10 text-sm xxs:text-base"
                />
              </div>
            )}

            {/* Type */}
            <div className="space-y-1.5 xxs:space-y-2">
              <Label className="text-xs xxs:text-sm">Tracking Type</Label>
              <Select
                value={watchType}
                onValueChange={(value) => setValue('type', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HABIT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Numeric Unit */}
            {watchType === 'numeric' && (
              <>
                <div className="space-y-1.5 xxs:space-y-2">
                  <Label className="text-xs xxs:text-sm">Unit</Label>
                  <Select
                    value={watchNumericUnit}
                    onValueChange={(value) => setValue('numericUnit', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {NUMERIC_UNITS.map((unit) => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {watchNumericUnit === 'custom' && (
                  <div className="space-y-1.5 xxs:space-y-2">
                    <Label htmlFor="customUnit" className="text-xs xxs:text-sm">Custom Unit</Label>
                    <Input
                      id="customUnit"
                      placeholder="e.g., pages, glasses"
                      {...register('customUnit')}
                      className="h-9 xxs:h-10 text-sm xxs:text-base"
                    />
                  </div>
                )}
              </>
            )}

            {/* Target */}
            <div className="space-y-1.5 xxs:space-y-2 md:col-span-2">
              <Label htmlFor="targetMonthly" className="text-xs xxs:text-sm">Monthly Goal</Label>
              <Input
                id="targetMonthly"
                type="number"
                min="0"
                max="999"
                {...register('targetMonthly')}
                className="h-9 xxs:h-10 text-sm xxs:text-base"
              />
              <p className="text-[10px] xxs:text-xs text-muted-foreground">
                How many days/times per month do you aim for?
              </p>
            </div>
          </div>

          {/* ✨ WHY & IDENTITY SECTION */}
          <div className="border-t pt-3 xxs:pt-4 space-y-3 xxs:space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 xxs:gap-2 min-w-0 flex-1">
                <Heart className="h-4 w-4 xxs:h-5 xxs:w-5 text-pink-500 flex-shrink-0" />
                <h3 className="font-semibold text-sm xxs:text-base sm:text-lg truncate">Give it meaning (Optional)</h3>
              </div>
              {!showMeaning && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMeaning(true)}
                  className="h-8 xxs:h-9 text-xs xxs:text-sm flex-shrink-0"
                >
                  <span className="hidden xs:inline">Add Why & Identity</span>
                  <span className="xs:hidden">Add</span>
                </Button>
              )}
            </div>

            {showMeaning && (
              <div className="space-y-3 xxs:space-y-4 bg-pink-50 dark:bg-pink-950/20 p-3 xxs:p-4 rounded-lg">
                {/* Why */}
                <div className="space-y-1.5 xxs:space-y-2">
                  <div className="flex items-center gap-1.5 xxs:gap-2">
                    <Lightbulb className="h-3.5 w-3.5 xxs:h-4 xxs:w-4 text-yellow-500" />
                    <Label htmlFor="why" className="text-xs xxs:text-sm">Why this matters to me</Label>
                  </div>
                  <Textarea
                    id="why"
                    placeholder="e.g., Exercise keeps me energized and helps me show up as my best self for my family. When I move my body, I think clearer and sleep better."
                    {...register('why')}
                    rows={3}
                    className="resize-none text-xs xxs:text-sm"
                  />
                  {errors.why && (
                    <p className="text-xs text-destructive">{errors.why.message}</p>
                  )}
                  <p className="text-[10px] xxs:text-xs text-muted-foreground">
                    Your personal reason for building this habit. Be specific and emotional.
                  </p>
                </div>

                {/* Identity Statement */}
                <div className="space-y-1.5 xxs:space-y-2">
                  <div className="flex items-center gap-1.5 xxs:gap-2">
                    <Heart className="h-3.5 w-3.5 xxs:h-4 xxs:w-4 text-pink-500" />
                    <Label htmlFor="identityStatement" className="text-xs xxs:text-sm">Who I'm becoming</Label>
                  </div>
                  <Input
                    id="identityStatement"
                    placeholder='e.g., "I am someone who prioritizes my health daily"'
                    {...register('identityStatement')}
                    className="h-9 xxs:h-10 text-sm xxs:text-base"
                  />
                  {errors.identityStatement && (
                    <p className="text-xs text-destructive">
                      {errors.identityStatement.message}
                    </p>
                  )}
                  <p className="text-[10px] xxs:text-xs text-muted-foreground">
                    Frame it as "I am someone who..." This becomes part of your identity.
                  </p>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-950/20 p-2.5 xxs:p-3 rounded text-xs xxs:text-sm">
                  <p className="font-medium mb-0.5 xxs:mb-1">💡 Why this helps:</p>
                  <p className="text-muted-foreground leading-relaxed">
                    When you connect habits to <strong>meaning</strong> and{' '}
                    <strong>identity</strong>, you're 3x more likely to stick with them. Your
                    brain treats identity-based habits as non-negotiable.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Color & Icon Pickers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 xxs:gap-4">
            {/* Color Picker */}
            <div className="space-y-1.5 xxs:space-y-2">
              <Label className="text-xs xxs:text-sm">Color</Label>
              <div className="grid grid-cols-9 gap-1 xxs:gap-1.5 sm:gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`h-7 w-7 xxs:h-8 xxs:w-8 rounded-full transition-all hover:scale-110 active:scale-95 ${
                      selectedColor === color ? 'scale-110 xxs:scale-125 ring-2 ring-offset-1 xxs:ring-offset-2 ring-primary' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Icon Picker */}
            <div className="space-y-1.5 xxs:space-y-2">
              <Label className="text-xs xxs:text-sm">Icon</Label>
              <div className="grid grid-cols-10 gap-1 xxs:gap-1.5 sm:gap-2">
                {ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setSelectedIcon(icon)}
                    className={`text-xl xxs:text-2xl h-8 w-8 xxs:h-9 xxs:w-9 sm:h-10 sm:w-10 flex items-center justify-center rounded-md hover:bg-accent transition-all hover:scale-110 active:scale-95 ${
                      selectedIcon === icon ? 'bg-accent ring-2 ring-primary' : ''
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col xxs:flex-row gap-2 sm:justify-between pt-2">
            {habit ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="destructive"
                    className="w-full xxs:w-auto xxs:mr-auto h-9 xxs:h-10 text-sm xxs:text-base"
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-3.5 w-3.5 xxs:h-4 xxs:w-4 mr-1.5 xxs:mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete <strong>{habit.name}</strong> and all its associated logs.
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeleting ? 'Deleting...' : 'Delete Habit'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <div className="hidden xxs:block" />
            )}
            <div className="flex flex-col xxs:flex-row gap-2 w-full xxs:w-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="h-9 xxs:h-10 text-sm xxs:text-base"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="h-9 xxs:h-10 text-sm xxs:text-base">
                {isSubmitting ? 'Saving...' : habit ? 'Update' : 'Create'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
