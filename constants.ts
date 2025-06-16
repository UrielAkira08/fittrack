import { MeasurementType } from './types';

export const APP_NAME = "FitTrack Rutinas";

// --- MOCK USER EMAILS/NAMES (FOR DEMO LOGIN PREFILL - AUTH IS VIA FIREBASE) ---
export const MOCK_SUPER_COACH_EMAIL = "Jcarrerap@gmail.com"; // Real email for Super Coach
export const MOCK_SUPER_COACH_NAME = "Jair"; // Real name for Super Coach
// Password for Jcarrerap@gmail.com MUST be set directly in Firebase Authentication.

export const MOCK_COACH_EMAIL = "coach@example.com"; // Example coach email
export const MOCK_COACH_NAME = "Entrenador Alex";
// Password for coach@example.com MUST be set directly in Firebase Authentication if used for demo.

export const MOCK_CLIENT_EMAIL_1 = "cliente1@example.com"; // Example client email
export const MOCK_CLIENT_NAME_1 = "Samuel Cliente";
// Password for cliente1@example.com MUST be set directly in Firebase Authentication if used for demo.

// Note: The demo login buttons on LoginPage.tsx will prefill these emails.
// For these demo accounts to work, they MUST be created in your Firebase Authentication
// console with the corresponding emails and passwords of your choice.
// The MOCK_..._PASSWORD constants are removed as passwords are not stored/simulated in client-side code anymore.
// --- END OF MOCK USER CREDENTIALS ---


export const AVAILABLE_MEASUREMENT_TYPES: MeasurementType[] = [
  MeasurementType.WAIST,
  MeasurementType.CHEST,
  MeasurementType.HIPS,
  MeasurementType.ARM_L,
  MeasurementType.ARM_R,
  MeasurementType.THIGH_L,
  MeasurementType.THIGH_R,
];

export const COMMON_EXERCISES = [
  "Squat", "Bench Press", "Deadlift", "Overhead Press", "Barbell Row",
  "Pull Up", "Chin Up", "Push Up", "Dip", "Lunge",
  "Plank", "Bicep Curl", "Tricep Extension", "Leg Press", "Calf Raise",
  "Kettlebell Swing", "Box Jump", "Burpee", "Rowing Machine", "Running"
];
