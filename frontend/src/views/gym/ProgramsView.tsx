import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGymStore } from '@/store/useGymStore';
import Header from '@/components/layout/Header';
import { Plus, Dumbbell, Calendar, Edit, Trash2 } from 'lucide-react';
import { gymProgramService } from '@/services/gymProgramService';
import { toast } from 'sonner';
import ProgramEditor from '@/components/gym/programs/ProgramEditor';
import type { WorkoutProgram } from '@/types/gym';

export default function ProgramsView() {
  const { programs, fetchPrograms } = useGymStore();
  const [loading, setLoading] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editingProgram, setEditingProgram] = useState<WorkoutProgram | null>(null);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const handleDeleteProgram = async (id: string) => {
    if (!confirm('Are you sure you want to delete this program?')) return;

    setLoading(true);
    try {
      await gymProgramService.delete(id);
      await fetchPrograms();
      toast.success('Program deleted');
    } catch (error) {
      toast.error('Failed to delete program');
    } finally {
      setLoading(false);
    }
  };

  const getDayName = (day: number) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[day];
  };

  const handleCreateProgram = () => {
    setEditingProgram(null);
    setShowEditor(true);
  };

  const handleEditProgram = (program: WorkoutProgram) => {
    setEditingProgram(program);
    setShowEditor(true);
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
    setEditingProgram(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="Workout Programs" />

      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">My Programs</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Create and manage your workout routines
            </p>
          </div>
          <Button onClick={handleCreateProgram}>
            <Plus className="h-4 w-4 mr-2" />
            Create Program
          </Button>
        </div>

        {programs.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Dumbbell className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Programs Yet</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Create your first workout program to get started
                </p>
                <Button onClick={handleCreateProgram}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Program
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {programs.map(program => (
              <Card key={program._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span style={{ color: program.color }}>{program.icon}</span>
                      <span>{program.name}</span>
                    </span>
                    {program.isActive && (
                      <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">Active</span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {program.description && (
                    <p className="text-sm text-muted-foreground">{program.description}</p>
                  )}

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Dumbbell className="h-4 w-4" />
                    <span>{program.exercises.length} exercises</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <div className="flex gap-1">
                      {program.scheduledDays.map(day => (
                        <span key={day} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded text-xs">
                          {getDayName(day)}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditProgram(program)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteProgram(program._id)}
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <ProgramEditor
          program={editingProgram}
          open={showEditor}
          onOpenChange={handleCloseEditor}
          onSuccess={fetchPrograms}
        />
      </div>
    </div>
  );
}
