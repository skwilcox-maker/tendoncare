'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2, Circle, ChevronDown, ChevronUp, Zap, Shield,
  Dumbbell, ArrowRight, Info, Sparkles
} from 'lucide-react';
import type { ExerciseDatabase, UserData, TendonSelection, TendonMode } from '../types';
import { ALL_EQUIPMENT } from '../types';

const EQUIPMENT_ICONS: Record<string, string> = {
  bodyweight: '🏋️',
  'resistance bands': '🔴',
  dumbbells: '💪',
  kettlebells: '🔔',
  barbell: '🏗️',
  'cable machine': '⚙️',
};

interface Props {
  db: ExerciseDatabase | null;
  userData: UserData;
  onGenerate: (tendons: TendonSelection[], equipment: string[]) => void;
}

export default function SetupScreen({ db, userData, onGenerate }: Props) {
  const [selectedTendons, setSelectedTendons] = useState<TendonSelection[]>(userData?.selectedTendons ?? []);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(userData?.selectedEquipment ?? ['bodyweight']);
  const [expandedTendon, setExpandedTendon] = useState<string | null>(null);

  useEffect(() => {
    if (userData?.selectedTendons?.length) setSelectedTendons(userData.selectedTendons);
    if (userData?.selectedEquipment?.length) setSelectedEquipment(userData.selectedEquipment);
  }, [userData?.selectedTendons, userData?.selectedEquipment]);

  const toggleTendon = (tendonName: string) => {
    setSelectedTendons((prev: TendonSelection[]) => {
      const existing = (prev ?? []).find((t: TendonSelection) => t?.tendon === tendonName);
      if (existing) {
        return (prev ?? []).filter((t: TendonSelection) => t?.tendon !== tendonName);
      }
      return [...(prev ?? []), { tendon: tendonName, mode: 'rehab' as TendonMode }];
    });
  };

  const setTendonMode = (tendonName: string, mode: TendonMode) => {
    setSelectedTendons((prev: TendonSelection[]) =>
      (prev ?? []).map((t: TendonSelection) =>
        t?.tendon === tendonName ? { ...t, mode } : t
      )
    );
  };

  const toggleEquipment = (eq: string) => {
    setSelectedEquipment((prev: string[]) => {
      if ((prev ?? []).includes(eq)) {
        const filtered = (prev ?? []).filter((e: string) => e !== eq);
        return filtered?.length > 0 ? filtered : prev;
      }
      return [...(prev ?? []), eq];
    });
  };

  const isTendonSelected = (name: string) =>
    (selectedTendons ?? []).some((t: TendonSelection) => t?.tendon === name);

  const getTendonMode = (name: string): TendonMode =>
    (selectedTendons ?? []).find((t: TendonSelection) => t?.tendon === name)?.mode ?? 'rehab';

  const canGenerate = (selectedTendons?.length ?? 0) > 0 && (selectedEquipment?.length ?? 0) > 0;

  const tendons = db?.tendons ?? [];

  return (
    <div className="space-y-8 pb-8">
      {/* Hero */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
          Configure Your <span className="text-primary">Protocol</span>
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto text-sm">
          Select affected tendons and available equipment to generate a personalized
          rehabilitation or maintenance routine.
        </p>
      </div>

      {/* Step 1: Tendon Selection */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</div>
          <h3 className="text-lg font-semibold text-foreground">Select Tendons</h3>
          <span className="text-xs text-muted-foreground ml-auto">
            {selectedTendons?.length ?? 0} selected
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {tendons.map((tendon, idx) => {
            const name = tendon?.name ?? '';
            const selected = isTendonSelected(name);
            const mode = getTendonMode(name);
            const expanded = expandedTendon === name;

            return (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className={`rounded-xl p-4 shadow-sm transition-all cursor-pointer ${
                  selected
                    ? 'bg-primary/5 shadow-md ring-1 ring-primary/20'
                    : 'bg-card hover:shadow-md hover:bg-card/80'
                }`}
              >
                <div className="flex items-start gap-3" onClick={() => toggleTendon(name)}>
                  <div className="mt-0.5">
                    {selected ? (
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground/40" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm ${selected ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {name}
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-0.5 truncate">
                      {tendon?.common_issues ?? ''}
                    </p>
                  </div>
                  <button
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      setExpandedTendon(expanded ? null : name);
                    }}
                    className="text-muted-foreground/50 hover:text-muted-foreground p-1"
                  >
                    {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Expanded info */}
                {expanded && (
                  <div className="mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground">
                    <div className="flex items-start gap-1.5">
                      <Info className="w-3.5 h-3.5 mt-0.5 text-primary/60 shrink-0" />
                      <p>{tendon?.anatomical_description ?? ''}</p>
                    </div>
                  </div>
                )}

                {/* Mode toggle */}
                {selected && (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={(e: React.MouseEvent) => { e.stopPropagation(); setTendonMode(name, 'rehab'); }}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        mode === 'rehab'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5" />
                      Rehab
                    </button>
                    <button
                      onClick={(e: React.MouseEvent) => { e.stopPropagation(); setTendonMode(name, 'maintenance'); }}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        mode === 'maintenance'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      <Shield className="w-3.5 h-3.5" />
                      Maintenance
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Step 2: Equipment */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</div>
          <h3 className="text-lg font-semibold text-foreground">Available Equipment</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {ALL_EQUIPMENT.map((eq: string) => {
            const checked = (selectedEquipment ?? []).includes(eq);
            return (
              <button
                key={eq}
                onClick={() => toggleEquipment(eq)}
                className={`flex items-center gap-2.5 p-3 rounded-xl shadow-sm transition-all text-left ${
                  checked
                    ? 'bg-primary/5 shadow-md ring-1 ring-primary/20'
                    : 'bg-card hover:shadow-md'
                }`}
              >
                <span className="text-lg">{EQUIPMENT_ICONS[eq] ?? '🔧'}</span>
                <div>
                  <p className={`text-sm font-medium capitalize ${checked ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {eq}
                  </p>
                </div>
                <div className="ml-auto">
                  {checked ? (
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  ) : (
                    <Circle className="w-4 h-4 text-muted-foreground/30" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Generate Button */}
      <div className="flex justify-center pt-2">
        <button
          onClick={() => canGenerate && onGenerate(selectedTendons, selectedEquipment)}
          disabled={!canGenerate}
          className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-base shadow-lg transition-all ${
            canGenerate
              ? 'bg-primary text-primary-foreground hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          Generate Routine
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
