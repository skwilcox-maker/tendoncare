import type { Exercise, ExerciseDatabase, RoutineExercise, TendonSelection, TendonMode } from '../types';

export function generateRoutine(
  db: ExerciseDatabase,
  selectedTendons: TendonSelection[],
  selectedEquipment: string[]
): RoutineExercise[] {
  if (!db?.exercises || !selectedTendons?.length || !selectedEquipment?.length) return [];

  const tendonMap = new Map<string, TendonMode>();
  for (const ts of selectedTendons) {
    tendonMap.set(ts?.tendon ?? '', ts?.mode ?? 'rehab');
  }

  const selectedTendonNames = new Set(tendonMap.keys());
  const equipSet = new Set(selectedEquipment);

  // Filter exercises that match equipment and target at least one selected tendon
  const candidateExercises: { exercise: Exercise; matchedTendons: string[]; primaryMode: TendonMode }[] = [];

  for (const exercise of db.exercises) {
    // Check equipment match
    const hasEquipment = (exercise?.equipment_needed ?? []).some((eq: string) => equipSet.has(eq));
    if (!hasEquipment) continue;

    // Check tendon match
    const matchedTendons = (exercise?.target_tendons ?? []).filter((t: string) => selectedTendonNames.has(t));
    if (matchedTendons?.length === 0) continue;

    // Determine mode - if any matched tendon is in rehab, use rehab
    const modes = matchedTendons.map((t: string) => tendonMap.get(t) ?? 'maintenance');
    const primaryMode: TendonMode = modes.includes('rehab') ? 'rehab' : 'maintenance';

    // Exclude rehab-only exercises when all matched tendons are in maintenance mode
    const protocolType = exercise?.protocol_type ?? 'both';
    if (primaryMode === 'maintenance' && protocolType === 'rehab') continue;

    candidateExercises.push({ exercise, matchedTendons, primaryMode });
  }

  // Greedy set-cover: pick exercises that cover the most uncovered tendons
  const uncoveredTendons = new Set(selectedTendonNames);
  const selected: typeof candidateExercises = [];

  // Sort by number of matched tendons (descending) to prefer multi-target exercises
  const sorted = [...candidateExercises].sort(
    (a, b) => b.matchedTendons.length - a.matchedTendons.length
  );

  while (uncoveredTendons.size > 0 && sorted.length > 0) {
    // Find exercise covering most uncovered tendons
    let bestIdx = 0;
    let bestCoverage = 0;
    for (let i = 0; i < sorted.length; i++) {
      const coverage = (sorted[i]?.matchedTendons ?? []).filter((t: string) => uncoveredTendons.has(t))?.length ?? 0;
      if (coverage > bestCoverage) {
        bestCoverage = coverage;
        bestIdx = i;
      }
    }
    if (bestCoverage === 0) break;
    const pick = sorted.splice(bestIdx, 1)[0];
    if (!pick) break;
    selected.push(pick);
    for (const t of pick.matchedTendons) {
      uncoveredTendons.delete(t);
    }
  }

  // Add remaining exercises that target selected tendons for variety (up to 2 extra per tendon)
  const tendonExerciseCount = new Map<string, number>();
  for (const s of selected) {
    for (const t of s.matchedTendons) {
      tendonExerciseCount.set(t, (tendonExerciseCount.get(t) ?? 0) + 1);
    }
  }

  for (const candidate of sorted) {
    const needsMore = (candidate?.matchedTendons ?? []).some(
      (t: string) => (tendonExerciseCount.get(t) ?? 0) < 2
    );
    if (needsMore) {
      selected.push(candidate);
      for (const t of candidate.matchedTendons) {
        tendonExerciseCount.set(t, (tendonExerciseCount.get(t) ?? 0) + 1);
      }
    }
  }

  return selected.map((s): RoutineExercise => ({
    ...s.exercise,
    assignedMode: s.primaryMode,
    relevantTendons: s.matchedTendons,
  }));
}
