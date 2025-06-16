export enum UserRole {
  COACH = 'coach',
  CLIENT = 'client',
  SUPER_COACH = 'super_coach',
}

export interface User {
  id: string; // Firebase UID
  role: UserRole;
  name: string;
  email: string; // Keep email for reference and initial user creation
}

export enum RoutineType {
  TRADITIONAL_WEIGHTLIFTING = 'Pesas Tradicional',
  FUNCTIONAL_EXERCISE = 'Ejercicio Funcional',
}

export interface Exercise {
  id: string; // Can remain UUID or be simplified if always part of a routine
  name: string;
  sets?: string;
  reps?: string;
  rest?: string;
  notes?: string;
}

export interface Routine {
  id: string; // Firestore document ID
  name: string;
  type: RoutineType;
  exercises: Exercise[];
  createdBy: string; // Coach's UID (or SuperCoach's UID)
  createdAt?: any; // Firestore Timestamp
}

export interface ClientProfile {
  id: string; // Client's UID (same as User.id for this client)
  coachId: string; // Coach's UID
  name: string; // Denormalized for convenience, could be fetched from User doc
  email: string; // Denormalized for convenience
  assignedRoutineIds: string[]; // Array of Routine IDs
}

export interface BodyWeightLog {
  id: string; // Firestore document ID
  date: string; // ISO date string YYYY-MM-DD
  weightKg: number;
  clientId: string; // Client's UID
}

export enum MeasurementType {
  WAIST = 'Cintura (cm)',
  CHEST = 'Pecho (cm)',
  HIPS = 'Cadera (cm)',
  ARM_L = 'Brazo Izq. (cm)',
  ARM_R = 'Brazo Der. (cm)',
  THIGH_L = 'Muslo Izq. (cm)',
  THIGH_R = 'Muslo Der. (cm)',
}

export interface BodyMeasurement {
  type: MeasurementType;
  valueCm: number;
}

export interface BodyMeasurementsLog {
  id: string; // Firestore document ID
  date: string; // ISO date string YYYY-MM-DD
  measurements: BodyMeasurement[];
  clientId: string; // Client's UID
}

export interface ExerciseProgressLog {
  id: string; // Firestore document ID
  date: string; // ISO date string YYYY-MM-DD
  routineId: string;
  exerciseId: string; // ID of the exercise within the routine
  exerciseName?: string; // Denormalized for easier display
  weightLbs?: number;
  repsAchieved?: string;
  duration?: string;
  notes?: string;
  clientId: string; // Client's UID
}

// For ProgressChart component - remains the same
export interface ProgressDataPoint {
  date: string;
  value?: number;
  [key: string]: any;
}

// AppData is no longer used for local storage persistence
// but can be a conceptual model for data held in DataContext if needed.
// For simplicity, we'll remove it as DataContext will fetch data into discrete states.
