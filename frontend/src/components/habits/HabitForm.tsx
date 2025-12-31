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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Lightbulb, Heart } from 'lucide-react';

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
  const { createHabit, updateHabit } = useHabitStore();
  const [selectedColor, setSelectedColor] = useState(habit?.color || COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(habit?.icon || ICONS[0]);
  const [showMeaning, setShowMeaning] = useState(!!habit?.why || !!habit?.identityStatement);

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{habit ? 'Edit Habit' : 'Create New Habit'}</DialogTitle>
          <DialogDescription>
            {habit
              ? 'Update your habit details, goals, and meaning below.'
              : 'Create a new habit with personalized goals and meaning.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Habit Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Morning Exercise"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Category</Label>
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
              <div className="space-y-2">
                <Label htmlFor="customCategory">Custom Category Name</Label>
                <Input
                  id="customCategory"
                  placeholder="e.g., Social, Finance"
                  {...register('customCategory')}
                />
              </div>
            )}

            {/* Type */}
            <div className="space-y-2">
              <Label>Tracking Type</Label>
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
                <div className="space-y-2">
                  <Label>Unit</Label>
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
                  <div className="space-y-2">
                    <Label htmlFor="customUnit">Custom Unit</Label>
                    <Input
                      id="customUnit"
                      placeholder="e.g., pages, glasses"
                      {...register('customUnit')}
                    />
                  </div>
                )}
              </>
            )}

            {/* Target */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="targetMonthly">Monthly Goal</Label>
              <Input
                id="targetMonthly"
                type="number"
                min="0"
                max="999"
                {...register('targetMonthly')}
              />
              <p className="text-xs text-muted-foreground">
                How many days/times per month do you aim for?
              </p>
            </div>
          </div>

          {/* ✨ WHY & IDENTITY SECTION */}
          <div className="border-t pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-pink-500" />
                <h3 className="font-semibold text-lg">Give it meaning (Optional)</h3>
              </div>
              {!showMeaning && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMeaning(true)}
                >
                  Add Why & Identity
                </Button>
              )}
            </div>

            {showMeaning && (
              <div className="space-y-4 bg-pink-50 dark:bg-pink-950/20 p-4 rounded-lg">
                {/* Why */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    <Label htmlFor="why">Why this matters to me</Label>
                  </div>
                  <Textarea
                    id="why"
                    placeholder="e.g., Exercise keeps me energized and helps me show up as my best self for my family. When I move my body, I think clearer and sleep better."
                    {...register('why')}
                    rows={3}
                    className="resize-none"
                  />
                  {errors.why && (
                    <p className="text-sm text-destructive">{errors.why.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Your personal reason for building this habit. Be specific and emotional.
                  </p>
                </div>

                {/* Identity Statement */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-pink-500" />
                    <Label htmlFor="identityStatement">Who I'm becoming</Label>
                  </div>
                  <Input
                    id="identityStatement"
                    placeholder='e.g., "I am someone who prioritizes my health daily"'
                    {...register('identityStatement')}
                  />
                  {errors.identityStatement && (
                    <p className="text-sm text-destructive">
                      {errors.identityStatement.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Frame it as "I am someone who..." This becomes part of your identity.
                  </p>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded text-sm">
                  <p className="font-medium mb-1">💡 Why this helps:</p>
                  <p className="text-muted-foreground">
                    When you connect habits to <strong>meaning</strong> and{' '}
                    <strong>identity</strong>, you're 3x more likely to stick with them. Your
                    brain treats identity-based habits as non-negotiable.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Color & Icon Pickers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Color Picker */}
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="grid grid-cols-9 gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`h-8 w-8 rounded-full transition-transform ${
                      selectedColor === color ? 'scale-125 ring-2 ring-offset-2 ring-primary' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Icon Picker */}
            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="grid grid-cols-10 gap-2">
                {ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setSelectedIcon(icon)}
                    className={`text-2xl h-10 w-10 flex items-center justify-center rounded-md hover:bg-accent transition-colors ${
                      selectedIcon === icon ? 'bg-accent ring-2 ring-primary' : ''
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : habit ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
