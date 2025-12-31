import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { gymProgramService } from '@/services/gymProgramService';
import { toast } from 'sonner';
import type { WorkoutProgramFormData } from '@/types/gym';

interface ProgramFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function ProgramForm({ open, onOpenChange, onSuccess }: ProgramFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<WorkoutProgramFormData>({
    name: '',
    description: '',
    color: '#ff6b35',
    icon: '💪',
    exercises: [],
    scheduledDays: []
  });

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
      await gymProgramService.create(formData);
      toast.success('Program created! 🎉');
      onOpenChange(false);
      onSuccess?.();
      // Reset form
      setFormData({
        name: '',
        description: '',
        color: '#ff6b35',
        icon: '💪',
        exercises: [],
        scheduledDays: []
      });
    } catch (error) {
      toast.error('Failed to create program');
    } finally {
      setSubmitting(false);
    }
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Workout Program</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
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
              <div className="flex gap-2 mt-2">
                {iconOptions.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon })}
                    className={`text-2xl p-3 rounded-lg transition-all ${
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
              <div className="flex gap-2 mt-2">
                {colorOptions.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-10 h-10 rounded-lg transition-all ${
                      formData.color === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div>
              <Label>Schedule Days *</Label>
              <div className="flex gap-2 mt-2">
                {days.map(day => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDay(day.value)}
                    className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors ${
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

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                You can add exercises to this program after creating it.
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Program'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
