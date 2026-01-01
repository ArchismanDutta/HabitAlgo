import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGymStore } from '@/store/useGymStore';
import Header from '@/components/layout/Header';
import { Search, Plus, Dumbbell } from 'lucide-react';
import type { ExerciseCategory } from '@/types/gym';

export default function ExerciseLibraryView() {
  const { exercises, fetchExercises, searchExercises } = useGymStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | 'All'>('All');

  const categories: (ExerciseCategory | 'All')[] = [
    'All',
    'Chest',
    'Back',
    'Legs',
    'Shoulders',
    'Arms',
    'Core',
    'Cardio',
  ];

  useEffect(() => {
    if (selectedCategory === 'All') {
      fetchExercises();
    } else {
      fetchExercises(selectedCategory);
    }
  }, [selectedCategory]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      searchExercises(query);
    } else {
      fetchExercises(selectedCategory === 'All' ? undefined : selectedCategory);
    }
  };

  const filteredExercises = exercises;

  return (
    <div className="min-h-screen bg-background">
      <Header title="Exercise Library" />

      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">Exercise Library</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Browse {exercises.length} exercises
            </p>
          </div>
          <Button className="w-full sm:w-auto text-sm">
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden xs:inline">Add Custom Exercise</span>
            <span className="xs:hidden">Add Exercise</span>
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search exercises..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 h-10 sm:h-11 text-sm"
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`min-h-[40px] px-3 sm:px-4 py-2 rounded-lg whitespace-nowrap text-xs sm:text-sm font-medium transition-all active:scale-95 flex-shrink-0 ${
                selectedCategory === category
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Exercise Grid */}
        {filteredExercises.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 sm:py-12 px-4">
                <Dumbbell className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-muted-foreground mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-semibold mb-2">No Exercises Found</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Try a different search or category
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredExercises.map(exercise => (
              <Card key={exercise._id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="pt-4 sm:pt-6 p-3 sm:p-6">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-base sm:text-lg line-clamp-2 flex-1">{exercise.name}</h3>
                      {exercise.isCustom && (
                        <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded flex-shrink-0">Custom</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 px-2 py-1 rounded">
                        {exercise.category}
                      </span>
                      {exercise.isCompound && (
                        <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                          Compound
                        </span>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
                      {exercise.muscleGroup.join(', ')}
                    </p>

                    {exercise.equipment && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        Equipment: {exercise.equipment}
                      </p>
                    )}

                    <div className="flex flex-col xs:flex-row gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1 h-9 text-xs sm:text-sm">
                        View Details
                      </Button>
                      <Button size="sm" className="flex-1 h-9 text-xs sm:text-sm">
                        <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span className="hidden xs:inline">Add to Program</span>
                        <span className="xs:hidden">Add</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
