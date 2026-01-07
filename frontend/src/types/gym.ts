// ===== ENUMS & CONSTANTS =====

export type ExerciseCategory = 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core' | 'Cardio' | 'Custom';
export type ExerciseDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type EnergyLevel = 'low' | 'normal' | 'high' | 'extra_power';
export type SupplementType = 'protein' | 'creatine' | 'pre_workout' | 'bcaa' | 'vitamins' | 'other';
export type SupplementTiming = 'morning' | 'pre_workout' | 'post_workout' | 'night';
export type BodyGoalType = 'weight_loss' | 'muscle_gain' | 'maintenance' | 'recomp';
export type PRType = '1RM' | 'max_reps' | 'max_volume';

// ===== EXERCISE =====

export interface Exercise {
  _id: string;
  name: string;
  category: ExerciseCategory;
  muscleGroup: string[];
  equipment?: string;
  isCompound: boolean;
  isCustom: boolean;
  userId?: string;
  instructions?: string;
  videoUrl?: string;
  difficulty: ExerciseDifficulty;
  createdAt: Date;
  updatedAt?: Date;
}

// ===== WORKOUT PROGRAM =====

export interface ExerciseInProgram {
  exerciseId: string | Exercise;
  order: number;
  plannedSets: number;
  plannedReps: string; // "8-12" or "10"
  plannedWeight?: number;
  restTime?: number; // seconds
  notes?: string;
}

export interface WorkoutProgram {
  _id: string;
  userId: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  exercises: ExerciseInProgram[];
  scheduledDays: number[]; // 0-6 (Sun-Sat)
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ===== WORKOUT SESSION =====

export interface SetPerformance {
  setNumber: number;
  plannedReps: number;
  actualReps: number;
  plannedWeight: number;
  actualWeight: number;
  completed: boolean;
  restTime?: number; // seconds
  rpe?: number; // 1-10
  notes?: string;
}

export interface ExercisePerformance {
  exerciseId: string;
  exerciseName: string;
  sets: SetPerformance[];
  completed: boolean;
  notes?: string;
  energy?: EnergyLevel;
  // Substitution tracking
  isSubstitute?: boolean;
  substitutedFor?: {
    exerciseId: string;
    exerciseName: string;
    reason?: string;
  };
  // Optional reference values from the program (as guidelines only)
  plannedSets?: number;
  plannedReps?: string;
  plannedWeight?: number;
  restTime?: number;
}

export interface WorkoutSession {
  _id: string;
  userId: string;
  programId: string;
  programName: string;
  date: string; // "2025-12-31"
  startTime?: Date;
  endTime?: Date;
  duration?: number; // minutes
  completed: boolean;
  exercises: ExercisePerformance[];
  overallEnergy: EnergyLevel;
  bodyWeight?: number;
  totalVolume: number;
  completionStats?: {
    exercisesCompleted: number;
    exercisesPlanned: number;
    setsCompleted: number;
    setsPlanned: number;
    completionPercentage: number;
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ===== BODY METRICS =====

export interface BodyMeasurements {
  chest?: number;
  waist?: number;
  hips?: number;
  biceps?: number;
  thighs?: number;
  calves?: number;
  neck?: number;
  shoulders?: number;
}

export interface BodyMetrics {
  _id: string;
  userId: string;
  date: string; // "2025-12-31"
  weight?: number;
  bodyFat?: number;
  measurements?: BodyMeasurements;
  photos?: string[];
  notes?: string;
  createdAt: Date;
  updatedAt?: Date;
}

// ===== BODY GOAL =====

export interface BodyGoal {
  _id: string;
  userId: string;
  type: BodyGoalType;
  startWeight: number;
  currentWeight: number;
  targetWeight: number;
  startDate: Date;
  targetDate?: Date;
  weeklyTarget?: number;
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ===== SUPPLEMENT =====

export interface Supplement {
  _id: string;
  userId: string;
  name: string;
  type: SupplementType;
  dosage: string;
  timing: SupplementTiming[];
  color: string;
  icon: string;
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface SupplementLog {
  _id: string;
  userId: string;
  supplementId: string | Supplement;
  date: string; // "2025-12-31"
  timing: SupplementTiming;
  taken: boolean;
  amount?: string;
  notes?: string;
  createdAt: Date;
}

// ===== PERSONAL RECORD =====

export interface PersonalRecord {
  _id: string;
  userId: string;
  exerciseId: string;
  exerciseName: string;
  type: PRType;
  value: number;
  weight?: number;
  reps?: number;
  date: Date;
  sessionId?: string;
  notes?: string;
  createdAt: Date;
}

// ===== ANALYTICS =====

export interface VolumeData {
  date: string;
  volume: number;
  sessionCount: number;
}

export interface ExerciseProgress {
  exerciseId: string;
  exerciseName: string;
  sessions: {
    date: string;
    maxWeight: number;
    totalVolume: number;
  }[];
}

export interface SupplementAdherence {
  supplement: Supplement;
  totalExpected: number;
  takenCount: number;
  adherenceRate: number;
}

// ===== HEALTH REPORTS =====

export type HealthMetricCategory =
  | 'hormone'
  | 'vitamin'
  | 'mineral'
  | 'blood_marker'
  | 'liver'
  | 'kidney'
  | 'thyroid'
  | 'other';

export type HealthMetricStatus = 'low' | 'normal' | 'high';

export interface ReferenceRange {
  min: number;
  max: number;
  unit: string;
}

export interface HealthMetric {
  category: HealthMetricCategory;
  name: string;
  value: number;
  unit: string;
  referenceRange: ReferenceRange;
  status: HealthMetricStatus;
  notes?: string;
}

export interface HealthReport {
  _id: string;
  userId: string;
  reportDate: string; // "YYYY-MM-DD"
  reportName?: string;
  labName?: string;
  metrics: HealthMetric[];
  overallNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface HealthReportFormData {
  reportDate: string;
  reportName?: string;
  labName?: string;
  metrics: Omit<HealthMetric, 'status'>[];
  overallNotes?: string;
}

export interface MetricTrend {
  date: string;
  value: number;
  unit: string;
  status: HealthMetricStatus;
  referenceRange: ReferenceRange;
}

export interface MetricTrendData {
  metricName: string;
  trend: MetricTrend[];
  latestValue?: MetricTrend;
  change: number;
}

export interface HealthReportSummary {
  reportDate: string;
  reportName: string;
  totalMetrics: number;
  statusSummary: {
    low: number;
    normal: number;
    high: number;
  };
  daysAgo: number;
}

// ===== API RESPONSES =====

export interface GymApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ===== FORM DATA =====

export interface WorkoutProgramFormData {
  name: string;
  description?: string;
  color: string;
  icon: string;
  exercises: ExerciseInProgram[];
  scheduledDays: number[];
}

export interface ExerciseFormData {
  name: string;
  category: ExerciseCategory;
  muscleGroup: string[];
  equipment?: string;
  isCompound: boolean;
  difficulty: ExerciseDifficulty;
  instructions?: string;
  videoUrl?: string;
}

export interface BodyMetricsFormData {
  date: string;
  weight?: number;
  bodyFat?: number;
  measurements?: BodyMeasurements;
  photos?: string[];
  notes?: string;
}

export interface BodyGoalFormData {
  type: BodyGoalType;
  startWeight: number;
  targetWeight: number;
  targetDate?: Date;
  weeklyTarget?: number;
  notes?: string;
}

export interface SupplementFormData {
  name: string;
  type: SupplementType;
  dosage: string;
  timing: SupplementTiming[];
  color: string;
  icon: string;
  notes?: string;
}
