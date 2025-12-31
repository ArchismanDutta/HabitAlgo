import { Habit } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Heart, Lightbulb } from 'lucide-react';

interface MissedHabitPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habit: Habit | null;
  onComplete: () => void;
  onSkip: () => void;
}

export default function MissedHabitPrompt({
  open,
  onOpenChange,
  habit,
  onComplete,
  onSkip,
}: MissedHabitPromptProps) {
  if (!habit) return null;

  const hasMeaning = !!(habit.why || habit.identityStatement);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            You haven't completed "{habit.name}" today
          </DialogTitle>
          <DialogDescription>
            Reconnect with your why and decide if you want to complete this habit now.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {hasMeaning ? (
            <>
              {habit.why && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    <h3 className="font-semibold">Remember why you started:</h3>
                  </div>
                  <p className="text-muted-foreground pl-7 leading-relaxed border-l-4 border-yellow-500 py-2">
                    "{habit.why}"
                  </p>
                </div>
              )}

              {habit.identityStatement && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-pink-500" />
                    <h3 className="font-semibold">Who you're becoming:</h3>
                  </div>
                  <p className="text-primary font-medium pl-7 italic border-l-4 border-pink-500 py-2">
                    {habit.identityStatement}
                  </p>
                </div>
              )}

              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg text-sm">
                <p className="text-muted-foreground">
                  💡 Every small action reinforces who you're becoming. Even if you do it now,
                  it counts. Progress over perfection.
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground">
                It's not too late to complete this habit today!
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => {
              onSkip();
              onOpenChange(false);
            }}
            className="w-full sm:w-auto"
          >
            Skip Today
          </Button>
          <Button
            onClick={() => {
              onComplete();
              onOpenChange(false);
            }}
            className="w-full sm:w-auto bg-green-500 hover:bg-green-600"
          >
            Complete Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
