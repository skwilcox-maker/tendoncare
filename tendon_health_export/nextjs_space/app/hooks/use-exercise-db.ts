'use client';

import type { ExerciseDatabase } from '../types';
import exerciseData from '../../public/data/exercise_database.json';

// Data is bundled at build time — no fetch needed, works with file:// and CDN alike
const db = exerciseData as ExerciseDatabase;

export function useExerciseDB(): [ExerciseDatabase | null, boolean, string | null] {
  return [db, false, null];
}
