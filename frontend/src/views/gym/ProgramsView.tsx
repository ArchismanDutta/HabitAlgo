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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">My Programs</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Create and manage your workout routines
            </p>
          </div>
          <Button onClick={handleCreateProgram} className="w-full sm:w-auto text-sm">
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden xs:inline">Create Program</span>
            <span className="xs:hidden">Create</span>
          </Button>
        </div>

        {programs.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 sm:py-12 px-4">
                <Dumbbell className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-muted-foreground mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-semibold mb-2">No Programs Yet</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
                  Create your first workout program to get started
                </p>
                <Button onClick={handleCreateProgram} className="text-sm">
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="hidden xs:inline">Create Your First Program</span>
                  <span className="xs:hidden">Create Program</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {programs.map(program => (
              <Card key={program._id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-start justify-between gap-2">
                    <span className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="text-xl sm:text-2xl flex-shrink-0" style={{ color: program.color }}>{program.icon}</span>
                      <span className="text-base sm:text-lg truncate">{program.name}</span>
                    </span>
                    {program.isActive && (
                      <span className="text-xs bg-green-500 text-white px-2 py-1 rounded flex-shrink-0">Active</span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
                  {program.description && (
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{program.description}</p>
                  )}

                  <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                    <Dumbbell className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span>{program.exercises.length} exercises</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                    <div className="flex gap-1 flex-wrap">
                      {program.scheduledDays.map(day => (
                        <span key={day} className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-100 dark:bg-blue-900 rounded text-[10px] sm:text-xs">
                          {getDayName(day)}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1 h-9 text-xs sm:text-sm" onClick={() => handleEditProgram(program)}>
                      <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 px-3"
                      onClick={() => handleDeleteProgram(program._id)}
                      disabled={loading}
                    >
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
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
