// Comprehensive Exercise Library
export const exercisesData = [
  // ===== CHEST =====
  {
    name: 'Barbell Bench Press',
    category: 'Chest',
    muscleGroup: ['Pectoralis Major', 'Triceps', 'Anterior Deltoid'],
    equipment: 'Barbell',
    isCompound: true,
    difficulty: 'Intermediate',
    instructions: 'Lie on bench, grip bar slightly wider than shoulders, lower to chest, press up explosively'
  },
  {
    name: 'Dumbbell Bench Press',
    category: 'Chest',
    muscleGroup: ['Pectoralis Major', 'Triceps', 'Anterior Deltoid'],
    equipment: 'Dumbbells',
    isCompound: true,
    difficulty: 'Intermediate'
  },
  {
    name: 'Incline Barbell Press',
    category: 'Chest',
    muscleGroup: ['Upper Pectoralis', 'Anterior Deltoid', 'Triceps'],
    equipment: 'Barbell',
    isCompound: true,
    difficulty: 'Intermediate'
  },
  {
    name: 'Incline Dumbbell Press',
    category: 'Chest',
    muscleGroup: ['Upper Pectoralis', 'Anterior Deltoid', 'Triceps'],
    equipment: 'Dumbbells',
    isCompound: true,
    difficulty: 'Intermediate'
  },
  {
    name: 'Decline Bench Press',
    category: 'Chest',
    muscleGroup: ['Lower Pectoralis', 'Triceps'],
    equipment: 'Barbell',
    isCompound: true,
    difficulty: 'Intermediate'
  },
  {
    name: 'Dumbbell Flyes',
    category: 'Chest',
    muscleGroup: ['Pectoralis Major'],
    equipment: 'Dumbbells',
    isCompound: false,
    difficulty: 'Beginner'
  },
  {
    name: 'Cable Flyes',
    category: 'Chest',
    muscleGroup: ['Pectoralis Major'],
    equipment: 'Cable Machine',
    isCompound: false,
    difficulty: 'Beginner'
  },
  {
    name: 'Push-Ups',
    category: 'Chest',
    muscleGroup: ['Pectoralis Major', 'Triceps', 'Anterior Deltoid'],
    equipment: 'Bodyweight',
    isCompound: true,
    difficulty: 'Beginner'
  },
  {
    name: 'Dips (Chest Focused)',
    category: 'Chest',
    muscleGroup: ['Lower Pectoralis', 'Triceps'],
    equipment: 'Dip Bar',
    isCompound: true,
    difficulty: 'Intermediate'
  },
  {
    name: 'Chest Press Machine',
    category: 'Chest',
    muscleGroup: ['Pectoralis Major', 'Triceps'],
    equipment: 'Machine',
    isCompound: true,
    difficulty: 'Beginner'
  },

  // ===== BACK =====
  {
    name: 'Deadlift',
    category: 'Back',
    muscleGroup: ['Erector Spinae', 'Lats', 'Traps', 'Glutes', 'Hamstrings'],
    equipment: 'Barbell',
    isCompound: true,
    difficulty: 'Advanced'
  },
  {
    name: 'Barbell Row',
    category: 'Back',
    muscleGroup: ['Lats', 'Rhomboids', 'Trapezius'],
    equipment: 'Barbell',
    isCompound: true,
    difficulty: 'Intermediate'
  },
  {
    name: 'Pull-Ups',
    category: 'Back',
    muscleGroup: ['Lats', 'Biceps', 'Traps'],
    equipment: 'Pull-up Bar',
    isCompound: true,
    difficulty: 'Intermediate'
  },
  {
    name: 'Lat Pulldown',
    category: 'Back',
    muscleGroup: ['Lats', 'Biceps'],
    equipment: 'Cable Machine',
    isCompound: true,
    difficulty: 'Beginner'
  },
  {
    name: 'Dumbbell Row',
    category: 'Back',
    muscleGroup: ['Lats', 'Rhomboids', 'Traps'],
    equipment: 'Dumbbells',
    isCompound: true,
    difficulty: 'Beginner'
  },
  {
    name: 'T-Bar Row',
    category: 'Back',
    muscleGroup: ['Lats', 'Rhomboids', 'Traps'],
    equipment: 'T-Bar',
    isCompound: true,
    difficulty: 'Intermediate'
  },
  {
    name: 'Seated Cable Row',
    category: 'Back',
    muscleGroup: ['Lats', 'Rhomboids', 'Traps'],
    equipment: 'Cable Machine',
    isCompound: true,
    difficulty: 'Beginner'
  },
  {
    name: 'Face Pulls',
    category: 'Back',
    muscleGroup: ['Rear Deltoid', 'Traps', 'Rhomboids'],
    equipment: 'Cable Machine',
    isCompound: false,
    difficulty: 'Beginner'
  },
  {
    name: 'Chin-Ups',
    category: 'Back',
    muscleGroup: ['Lats', 'Biceps'],
    equipment: 'Pull-up Bar',
    isCompound: true,
    difficulty: 'Intermediate'
  },
  {
    name: 'Hyperextensions',
    category: 'Back',
    muscleGroup: ['Erector Spinae', 'Glutes'],
    equipment: 'Hyperextension Bench',
    isCompound: false,
    difficulty: 'Beginner'
  },

  // ===== LEGS =====
  {
    name: 'Barbell Squat',
    category: 'Legs',
    muscleGroup: ['Quadriceps', 'Glutes', 'Hamstrings'],
    equipment: 'Barbell',
    isCompound: true,
    difficulty: 'Intermediate'
  },
  {
    name: 'Front Squat',
    category: 'Legs',
    muscleGroup: ['Quadriceps', 'Glutes', 'Core'],
    equipment: 'Barbell',
    isCompound: true,
    difficulty: 'Advanced'
  },
  {
    name: 'Romanian Deadlift',
    category: 'Legs',
    muscleGroup: ['Hamstrings', 'Glutes', 'Erector Spinae'],
    equipment: 'Barbell',
    isCompound: true,
    difficulty: 'Intermediate'
  },
  {
    name: 'Leg Press',
    category: 'Legs',
    muscleGroup: ['Quadriceps', 'Glutes', 'Hamstrings'],
    equipment: 'Machine',
    isCompound: true,
    difficulty: 'Beginner'
  },
  {
    name: 'Leg Curl',
    category: 'Legs',
    muscleGroup: ['Hamstrings'],
    equipment: 'Machine',
    isCompound: false,
    difficulty: 'Beginner'
  },
  {
    name: 'Leg Extension',
    category: 'Legs',
    muscleGroup: ['Quadriceps'],
    equipment: 'Machine',
    isCompound: false,
    difficulty: 'Beginner'
  },
  {
    name: 'Bulgarian Split Squat',
    category: 'Legs',
    muscleGroup: ['Quadriceps', 'Glutes'],
    equipment: 'Dumbbells',
    isCompound: true,
    difficulty: 'Intermediate'
  },
  {
    name: 'Walking Lunges',
    category: 'Legs',
    muscleGroup: ['Quadriceps', 'Glutes', 'Hamstrings'],
    equipment: 'Dumbbells',
    isCompound: true,
    difficulty: 'Beginner'
  },
  {
    name: 'Calf Raises',
    category: 'Legs',
    muscleGroup: ['Calves'],
    equipment: 'Machine',
    isCompound: false,
    difficulty: 'Beginner'
  },
  {
    name: 'Hack Squat',
    category: 'Legs',
    muscleGroup: ['Quadriceps', 'Glutes'],
    equipment: 'Machine',
    isCompound: true,
    difficulty: 'Intermediate'
  },

  // ===== SHOULDERS =====
  {
    name: 'Overhead Press',
    category: 'Shoulders',
    muscleGroup: ['Anterior Deltoid', 'Lateral Deltoid', 'Triceps'],
    equipment: 'Barbell',
    isCompound: true,
    difficulty: 'Intermediate'
  },
  {
    name: 'Dumbbell Shoulder Press',
    category: 'Shoulders',
    muscleGroup: ['Anterior Deltoid', 'Lateral Deltoid', 'Triceps'],
    equipment: 'Dumbbells',
    isCompound: true,
    difficulty: 'Beginner'
  },
  {
    name: 'Lateral Raises',
    category: 'Shoulders',
    muscleGroup: ['Lateral Deltoid'],
    equipment: 'Dumbbells',
    isCompound: false,
    difficulty: 'Beginner'
  },
  {
    name: 'Front Raises',
    category: 'Shoulders',
    muscleGroup: ['Anterior Deltoid'],
    equipment: 'Dumbbells',
    isCompound: false,
    difficulty: 'Beginner'
  },
  {
    name: 'Rear Delt Flyes',
    category: 'Shoulders',
    muscleGroup: ['Posterior Deltoid'],
    equipment: 'Dumbbells',
    isCompound: false,
    difficulty: 'Beginner'
  },
  {
    name: 'Arnold Press',
    category: 'Shoulders',
    muscleGroup: ['Anterior Deltoid', 'Lateral Deltoid'],
    equipment: 'Dumbbells',
    isCompound: true,
    difficulty: 'Intermediate'
  },
  {
    name: 'Upright Row',
    category: 'Shoulders',
    muscleGroup: ['Lateral Deltoid', 'Trapezius'],
    equipment: 'Barbell',
    isCompound: true,
    difficulty: 'Intermediate'
  },
  {
    name: 'Shrugs',
    category: 'Shoulders',
    muscleGroup: ['Trapezius'],
    equipment: 'Dumbbells',
    isCompound: false,
    difficulty: 'Beginner'
  },

  // ===== ARMS =====
  {
    name: 'Barbell Curl',
    category: 'Arms',
    muscleGroup: ['Biceps'],
    equipment: 'Barbell',
    isCompound: false,
    difficulty: 'Beginner'
  },
  {
    name: 'Dumbbell Curl',
    category: 'Arms',
    muscleGroup: ['Biceps'],
    equipment: 'Dumbbells',
    isCompound: false,
    difficulty: 'Beginner'
  },
  {
    name: 'Hammer Curl',
    category: 'Arms',
    muscleGroup: ['Biceps', 'Brachialis'],
    equipment: 'Dumbbells',
    isCompound: false,
    difficulty: 'Beginner'
  },
  {
    name: 'Preacher Curl',
    category: 'Arms',
    muscleGroup: ['Biceps'],
    equipment: 'Barbell',
    isCompound: false,
    difficulty: 'Beginner'
  },
  {
    name: 'Triceps Pushdown',
    category: 'Arms',
    muscleGroup: ['Triceps'],
    equipment: 'Cable Machine',
    isCompound: false,
    difficulty: 'Beginner'
  },
  {
    name: 'Overhead Triceps Extension',
    category: 'Arms',
    muscleGroup: ['Triceps'],
    equipment: 'Dumbbells',
    isCompound: false,
    difficulty: 'Beginner'
  },
  {
    name: 'Skull Crushers',
    category: 'Arms',
    muscleGroup: ['Triceps'],
    equipment: 'Barbell',
    isCompound: false,
    difficulty: 'Intermediate'
  },
  {
    name: 'Close-Grip Bench Press',
    category: 'Arms',
    muscleGroup: ['Triceps', 'Chest'],
    equipment: 'Barbell',
    isCompound: true,
    difficulty: 'Intermediate'
  },
  {
    name: 'Dips (Triceps Focused)',
    category: 'Arms',
    muscleGroup: ['Triceps'],
    equipment: 'Dip Bar',
    isCompound: true,
    difficulty: 'Intermediate'
  },

  // ===== CORE =====
  {
    name: 'Plank',
    category: 'Core',
    muscleGroup: ['Rectus Abdominis', 'Transverse Abdominis'],
    equipment: 'Bodyweight',
    isCompound: false,
    difficulty: 'Beginner'
  },
  {
    name: 'Crunches',
    category: 'Core',
    muscleGroup: ['Rectus Abdominis'],
    equipment: 'Bodyweight',
    isCompound: false,
    difficulty: 'Beginner'
  },
  {
    name: 'Russian Twists',
    category: 'Core',
    muscleGroup: ['Obliques'],
    equipment: 'Medicine Ball',
    isCompound: false,
    difficulty: 'Beginner'
  },
  {
    name: 'Hanging Leg Raises',
    category: 'Core',
    muscleGroup: ['Lower Abs', 'Hip Flexors'],
    equipment: 'Pull-up Bar',
    isCompound: false,
    difficulty: 'Intermediate'
  },
  {
    name: 'Ab Wheel Rollout',
    category: 'Core',
    muscleGroup: ['Rectus Abdominis', 'Transverse Abdominis'],
    equipment: 'Ab Wheel',
    isCompound: false,
    difficulty: 'Advanced'
  },
  {
    name: 'Cable Crunches',
    category: 'Core',
    muscleGroup: ['Rectus Abdominis'],
    equipment: 'Cable Machine',
    isCompound: false,
    difficulty: 'Beginner'
  },
  {
    name: 'Side Plank',
    category: 'Core',
    muscleGroup: ['Obliques', 'Transverse Abdominis'],
    equipment: 'Bodyweight',
    isCompound: false,
    difficulty: 'Beginner'
  },
  {
    name: 'Mountain Climbers',
    category: 'Core',
    muscleGroup: ['Rectus Abdominis', 'Hip Flexors'],
    equipment: 'Bodyweight',
    isCompound: false,
    difficulty: 'Beginner'
  },

  // ===== CARDIO =====
  {
    name: 'Treadmill Running',
    category: 'Cardio',
    muscleGroup: ['Cardiovascular System', 'Legs'],
    equipment: 'Treadmill',
    isCompound: true,
    difficulty: 'Beginner'
  },
  {
    name: 'Cycling',
    category: 'Cardio',
    muscleGroup: ['Cardiovascular System', 'Quadriceps'],
    equipment: 'Bike',
    isCompound: true,
    difficulty: 'Beginner'
  },
  {
    name: 'Rowing Machine',
    category: 'Cardio',
    muscleGroup: ['Cardiovascular System', 'Back', 'Legs'],
    equipment: 'Rowing Machine',
    isCompound: true,
    difficulty: 'Intermediate'
  },
  {
    name: 'Elliptical',
    category: 'Cardio',
    muscleGroup: ['Cardiovascular System', 'Legs'],
    equipment: 'Elliptical',
    isCompound: true,
    difficulty: 'Beginner'
  },
  {
    name: 'Jump Rope',
    category: 'Cardio',
    muscleGroup: ['Cardiovascular System', 'Calves'],
    equipment: 'Jump Rope',
    isCompound: true,
    difficulty: 'Beginner'
  },
  {
    name: 'Burpees',
    category: 'Cardio',
    muscleGroup: ['Full Body'],
    equipment: 'Bodyweight',
    isCompound: true,
    difficulty: 'Intermediate'
  },
  {
    name: 'Stair Climber',
    category: 'Cardio',
    muscleGroup: ['Cardiovascular System', 'Glutes', 'Quadriceps'],
    equipment: 'Machine',
    isCompound: true,
    difficulty: 'Intermediate'
  }
];
