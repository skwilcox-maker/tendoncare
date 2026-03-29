export interface TendonInfo {
  name: string;
  anatomical_description: string;
  common_issues: string;
}

export interface Exercise {
  exercise_name: string;
  target_tendons: string[];
  protocol_type: 'rehab' | 'both' | 'maintenance';
  equipment_needed: string[];
  hold_duration: string;
  sets: string;
  frequency: string;
  joint_angle: string;
  load_guidance: string;
  progression_steps: string;
  form_cues: string;
  safety_notes: string;
  video_url: string;
}

export interface ExerciseDatabase {
  tendons: TendonInfo[];
  exercises: Exercise[];
  metadata: {
    progress_indicators: string[];
    transition_criteria: {
      rehab_to_maintenance: string[];
      maintenance_protocol_details: string;
    };
  };
}

export type TendonMode = 'rehab' | 'maintenance';

export interface TendonSelection {
  tendon: string;
  mode: TendonMode;
}

export interface RoutineExercise extends Exercise {
  assignedMode: TendonMode;
  relevantTendons: string[];
}

export interface SessionLog {
  date: string; // ISO date string
  exercisesCompleted: string[]; // exercise names
  allCompleted: boolean;
}

export interface UserData {
  selectedTendons: TendonSelection[];
  selectedEquipment: string[];
  routine: RoutineExercise[];
  sessions: SessionLog[];
  setupComplete: boolean;
}

export const ALL_EQUIPMENT = [
  'bodyweight',
  'resistance bands',
  'dumbbells',
  'kettlebells',
  'barbell',
  'cable machine',
] as const;

export const DEFAULT_USER_DATA: UserData = {
  selectedTendons: [],
  selectedEquipment: ['bodyweight'],
  routine: [],
  sessions: [],
  setupComplete: false,
};
