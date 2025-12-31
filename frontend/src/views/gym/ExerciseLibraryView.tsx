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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Exercise Library</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Browse {exercises.length} exercises
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Custom Exercise
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search exercises..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-orange-500 text-white'
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
              <div className="text-center py-12">
                <Dumbbell className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Exercises Found</h3>
                <p className="text-sm text-muted-foreground">
                  Try a different search or category
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredExercises.map(exercise => (
              <Card key={exercise._id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-bold text-lg">{exercise.name}</h3>
                      {exercise.isCustom && (
                        <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">Custom</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 px-2 py-1 rounded">
                        {exercise.category}
                      </span>
                      {exercise.isCompound && (
                        <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                          Compound
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {exercise.muscleGroup.join(', ')}
                    </p>

                    {exercise.equipment && (
                      <p className="text-xs text-muted-foreground">
                        Equipment: {exercise.equipment}
                      </p>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        View Details
                      </Button>
                      <Button size="sm" className="flex-1">
                        <Plus className="h-4 w-4 mr-1" />
                        Add to Program
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
