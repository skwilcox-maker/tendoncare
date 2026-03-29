'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Settings, Dumbbell, BarChart3 } from 'lucide-react';
import { useLocalStorage } from '../hooks/use-local-storage';
import { useExerciseDB } from '../hooks/use-exercise-db';
import { generateRoutine } from '../lib/routine-generator';
import type { UserData, TendonSelection, RoutineExercise } from '../types';
import { DEFAULT_USER_DATA } from '../types';
import SetupScreen from './setup-screen';
import RoutineView from './routine-view';
import ProgressView from './progress-view';
import LoadingScreen from './loading-screen';

type Tab = 'setup' | 'routine' | 'progress';

export default function AppShell() {
  const [userData, setUserData, isLoaded] = useLocalStorage<UserData>('tendoncare-data', DEFAULT_USER_DATA);
  const [db, dbLoading, dbError] = useExerciseDB();
  const [activeTab, setActiveTab] = useState<Tab>('setup');
  const [mounted, setMounted] = useState(false);
  const hasInitialNavigated = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!hasInitialNavigated.current && isLoaded && userData?.setupComplete && (userData?.routine?.length ?? 0) > 0) {
      setActiveTab('routine');
      hasInitialNavigated.current = true;
    }
  }, [isLoaded, userData?.setupComplete, userData?.routine?.length]);

  const handleGenerateRoutine = (tendons: TendonSelection[], equipment: string[]) => {
    if (!db) return;
    const routine = generateRoutine(db, tendons, equipment);
    setUserData((prev: UserData) => ({
      ...(prev ?? DEFAULT_USER_DATA),
      selectedTendons: tendons,
      selectedEquipment: equipment,
      routine,
      setupComplete: true,
    }));
    setActiveTab('routine');
  };

  const handleSessionComplete = (exercisesCompleted: string[], allCompleted: boolean) => {
    const today = new Date().toISOString().split('T')[0] ?? '';
    setUserData((prev: UserData) => {
      const sessions = [...(prev?.sessions ?? [])];
      const existingIdx = sessions.findIndex((s) => s?.date === today);
      const entry = { date: today, exercisesCompleted, allCompleted };
      if (existingIdx >= 0) {
        sessions[existingIdx] = entry;
      } else {
        sessions.push(entry);
      }
      return { ...(prev ?? DEFAULT_USER_DATA), sessions };
    });
  };

  const handleToggleTendonMode = (tendonName: string) => {
    if (!db) return;
    setUserData((prev: UserData) => {
      const tendons = (prev?.selectedTendons ?? []).map((ts: TendonSelection) =>
        ts?.tendon === tendonName
          ? { ...ts, mode: ts?.mode === 'rehab' ? 'maintenance' as const : 'rehab' as const }
          : ts
      );
      const routine = generateRoutine(db, tendons, prev?.selectedEquipment ?? []);
      return { ...(prev ?? DEFAULT_USER_DATA), selectedTendons: tendons, routine };
    });
  };

  if (!mounted || !isLoaded || dbLoading) {
    return <LoadingScreen />;
  }

  if (dbError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-3 max-w-sm">
          <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center mx-auto">
            <Activity className="w-6 h-6 text-destructive" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Failed to Load</h2>
          <p className="text-sm text-muted-foreground">{dbError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:shadow-lg transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'setup', label: 'Setup', icon: <Settings className="w-4 h-4" /> },
    { id: 'routine', label: 'Routine', icon: <Dumbbell className="w-4 h-4" /> },
    { id: 'progress', label: 'Progress', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-[1200px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground leading-tight">TendonCare</h1>

            </div>
          </div>
          <nav className="flex gap-1 bg-muted/60 rounded-lg p-1">
            {tabs.map((tab) => (
              <button
                key={tab?.id}
                onClick={() => setActiveTab(tab?.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab?.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/60'
                }`}
              >
                {tab?.icon}
                <span className="hidden sm:inline">{tab?.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-[1200px] mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {activeTab === 'setup' && (
            <motion.div key="setup" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <SetupScreen
                db={db}
                userData={userData}
                onGenerate={handleGenerateRoutine}
              />
            </motion.div>
          )}
          {activeTab === 'routine' && (
            <motion.div key="routine" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <RoutineView
                userData={userData}
                db={db}
                onSessionComplete={handleSessionComplete}
                onToggleTendonMode={handleToggleTendonMode}
                onEditSetup={() => setActiveTab('setup')}
              />
            </motion.div>
          )}
          {activeTab === 'progress' && (
            <motion.div key="progress" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <ProgressView
                userData={userData}
                db={db}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
