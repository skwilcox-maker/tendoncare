'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ExternalLink, CheckCircle2, Circle, Zap, Shield, ArrowRightLeft,
  AlertTriangle, Settings, Play, Clock, Target, Lightbulb, ChevronDown, ChevronUp,
  Save, RotateCcw
} from 'lucide-react';
import type { UserData, ExerciseDatabase, RoutineExercise } from '../types';

interface Props {
  userData: UserData;
  db: ExerciseDatabase | null;
  onSessionComplete: (exercises: string[], allCompleted: boolean) => void;
  onToggleTendonMode: (tendonName: string) => void;
  onEditSetup: () => void;
}

export default function RoutineView({ userData, db, onSessionComplete, onToggleTendonMode, onEditSetup }: Props) {
  const routine = userData?.routine ?? [];
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [sessionSaved, setSessionSaved] = useState(false);

  const transitionCriteria = db?.metadata?.transition_criteria?.rehab_to_maintenance ?? [];
  const maintenanceDetails = db?.metadata?.transition_criteria?.maintenance_protocol_details ?? '';
  const progressIndicators = db?.metadata?.progress_indicators ?? [];

  const rehabTendons = useMemo(() =>
    (userData?.selectedTendons ?? []).filter((t) => t?.mode === 'rehab'),
    [userData?.selectedTendons]
  );

  const toggleExercise = (name: string) => {
    setCompletedExercises((prev: Set<string>) => {
      const next = new Set(prev);
      if (next.has(name)) { next.delete(name); } else { next.add(name); }
      return next;
    });
    setSessionSaved(false);
  };

  const allDone = (completedExercises?.size ?? 0) === (routine?.length ?? 0) && (routine?.length ?? 0) > 0;

  const handleSaveSession = () => {
    const exerciseNames = Array.from(completedExercises);
    onSessionComplete(exerciseNames, allDone);
    setSessionSaved(true);
  };

  const handleResetSession = () => {
    setCompletedExercises(new Set());
    setSessionSaved(false);
  };

  if ((routine?.length ?? 0) === 0) {
    const setupComplete = userData?.setupComplete ?? false;
    return (
      <div className="text-center py-16 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto">
          <Target className="w-8 h-8 text-muted-foreground" />
        </div>
        {setupComplete ? (
          <>
            <h3 className="text-lg font-semibold text-foreground">No Matching Exercises Found</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              No exercises match your selected tendons and equipment. Try adding more equipment types or switching any maintenance-mode tendons to rehab.
            </p>
          </>
        ) : (
          <>
            <h3 className="text-lg font-semibold text-foreground">No Routine Generated</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Configure your tendons and equipment in the Setup tab to generate a personalized routine.
            </p>
          </>
        )}
        <button
          onClick={onEditSetup}
          className="inline-flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:shadow-lg transition-all"
        >
          <Settings className="w-4 h-4" /> Go to Setup
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Your <span className="text-primary">Routine</span></h2>
          <p className="text-sm text-muted-foreground">
            {routine?.length ?? 0} exercises · {completedExercises?.size ?? 0} completed
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEditSetup}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-all"
          >
            <Settings className="w-3.5 h-3.5" /> Edit Setup
          </button>
          <button
            onClick={handleResetSession}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>

      {/* Transition criteria banner for rehab tendons */}
      {rehabTendons?.length > 0 && (
        <div className="bg-amber-50 rounded-xl p-4 shadow-sm">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800 mb-1">Transition Criteria (Rehab → Maintenance)</p>
              <ul className="text-xs text-amber-700 space-y-0.5">
                {transitionCriteria.map((c: string, i: number) => (
                  <li key={i}>• {c}</li>
                ))}
              </ul>
              <div className="mt-2 flex flex-wrap gap-2">
                {rehabTendons.map((t) => (
                  <button
                    key={t?.tendon}
                    onClick={() => onToggleTendonMode(t?.tendon ?? '')}
                    className="flex items-center gap-1 px-2.5 py-1 bg-white/80 rounded-lg text-xs font-medium text-amber-700 hover:bg-white transition-all"
                  >
                    <ArrowRightLeft className="w-3 h-3" />
                    Switch {t?.tendon ?? ''} to Maintenance
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exercise List */}
      <div className="space-y-3">
        {routine.map((exercise: RoutineExercise, idx: number) => {
          const name = exercise?.exercise_name ?? 'Unknown';
          const completed = completedExercises.has(name);
          const expanded = expandedExercise === name;
          const isRehab = exercise?.assignedMode === 'rehab';

          return (
            <motion.div
              key={name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`rounded-xl shadow-sm transition-all overflow-hidden ${
                completed ? 'bg-emerald-50/50' : 'bg-card'
              }`}
            >
              {/* Main row */}
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <button onClick={() => toggleExercise(name)} className="mt-0.5 shrink-0">
                    {completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground/30 hover:text-primary/50 transition-colors" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className={`font-semibold text-sm ${completed ? 'text-emerald-700 line-through' : 'text-foreground'}`}>
                        {name}
                      </h4>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        isRehab ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {isRehab ? 'REHAB' : 'MAINT'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(exercise?.relevantTendons ?? []).map((t: string) => (
                        <span key={t} className="px-1.5 py-0.5 bg-muted rounded text-[10px] text-muted-foreground">
                          {t}
                        </span>
                      ))}
                    </div>
                    {/* Protocol summary */}
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {isRehab ? (exercise?.hold_duration ?? 'N/A') : 'Reduced freq.'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        {exercise?.sets ?? 'Multiple sets'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Play className="w-3 h-3" />
                        {isRehab ? (exercise?.frequency ?? 'N/A') : '2-3x/week'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={exercise?.video_url ?? '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-all"
                      onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    >
                      <ExternalLink className="w-3 h-3" />
                      Video
                    </a>
                    <button
                      onClick={() => setExpandedExercise(expanded ? null : name)}
                      className="p-1 text-muted-foreground/50 hover:text-muted-foreground"
                    >
                      {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded details */}
              {expanded && (
                <div className="px-4 pb-4 pt-0 border-t border-border/30 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    <DetailBlock icon={<Target className="w-3.5 h-3.5" />} label="Joint Angle" value={exercise?.joint_angle ?? 'N/A'} />
                    <DetailBlock icon={<Zap className="w-3.5 h-3.5" />} label="Load Guidance" value={exercise?.load_guidance ?? 'N/A'} />
                  </div>
                  <DetailBlock icon={<Lightbulb className="w-3.5 h-3.5" />} label="Form Cues" value={exercise?.form_cues ?? 'N/A'} />
                  <DetailBlock icon={<AlertTriangle className="w-3.5 h-3.5" />} label="Safety Notes" value={exercise?.safety_notes ?? 'N/A'} />
                  <DetailBlock icon={<ArrowRightLeft className="w-3.5 h-3.5" />} label="Progression" value={exercise?.progression_steps ?? 'N/A'} />
                  {!isRehab && maintenanceDetails && (
                    <DetailBlock icon={<Shield className="w-3.5 h-3.5" />} label="Maintenance Protocol" value={maintenanceDetails} />
                  )}
                  <div className="text-[10px] text-muted-foreground/50">
                    Equipment: {(exercise?.equipment_needed ?? []).join(', ')}
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Save session */}
      <div className="flex justify-center pt-4">
        <button
          onClick={handleSaveSession}
          disabled={(completedExercises?.size ?? 0) === 0}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm shadow-lg transition-all ${
            sessionSaved
              ? 'bg-emerald-500 text-white'
              : (completedExercises?.size ?? 0) > 0
              ? 'bg-primary text-primary-foreground hover:shadow-xl hover:scale-[1.02]'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
        >
          {sessionSaved ? (
            <><CheckCircle2 className="w-4 h-4" /> Session Saved!</>
          ) : (
            <><Save className="w-4 h-4" /> Save Session ({completedExercises?.size ?? 0}/{routine?.length ?? 0})</>
          )}
        </button>
      </div>

      {/* Progress indicators */}
      {(progressIndicators?.length ?? 0) > 0 && (
        <div className="bg-blue-50/50 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-medium text-blue-800 mb-2 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5" /> Progress Indicators
          </p>
          <ul className="text-xs text-blue-700 space-y-0.5">
            {progressIndicators.map((p: string, i: number) => (
              <li key={i}>• {p}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function DetailBlock({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-muted/30 rounded-lg p-2.5">
      <p className="text-[10px] font-semibold text-muted-foreground mb-0.5 flex items-center gap-1">
        {icon} {label}
      </p>
      <p className="text-xs text-foreground">{value}</p>
    </div>
  );
}
