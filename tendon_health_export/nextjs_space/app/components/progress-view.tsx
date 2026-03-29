'use client';

import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarDays, Flame, TrendingUp, Activity, CheckCircle2, Target, BarChart3
} from 'lucide-react';
import type { UserData, ExerciseDatabase, SessionLog } from '../types';
import ProgressChart from './progress-chart';

interface Props {
  userData: UserData;
  db: ExerciseDatabase | null;
}

export default function ProgressView({ userData, db }: Props) {
  const sessions = userData?.sessions ?? [];
  const routine = userData?.routine ?? [];
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const stats = useMemo(() => {
    if ((sessions?.length ?? 0) === 0) return { totalSessions: 0, completedSessions: 0, streak: 0, completionRate: 0, last30: [] as { date: string; completed: number; total: number }[] };

    const sorted = [...(sessions ?? [])].sort((a: SessionLog, b: SessionLog) =>
      (a?.date ?? '').localeCompare(b?.date ?? '')
    );

    const completedSessions = sorted.filter((s: SessionLog) => s?.allCompleted)?.length ?? 0;
    const totalSessions = sorted?.length ?? 0;
    const completionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

    // Calculate streak
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0] ?? '';
      const hasSession = sorted.some((s: SessionLog) => s?.date === dateStr);
      if (hasSession) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    // Last 30 days data for chart
    const last30: { date: string; completed: number; total: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0] ?? '';
      const session = sorted.find((s: SessionLog) => s?.date === dateStr);
      last30.push({
        date: dateStr,
        completed: session ? (session?.exercisesCompleted?.length ?? 0) : 0,
        total: routine?.length ?? 0,
      });
    }

    return { totalSessions, completedSessions, streak, completionRate, last30 };
  }, [sessions, routine?.length]);

  // Calendar heatmap for last 12 weeks
  const calendarData = useMemo(() => {
    const weeks: { date: string; level: number }[][] = [];
    const today = new Date();
    const sessionDates = new Set((sessions ?? []).map((s: SessionLog) => s?.date ?? ''));
    const completeDates = new Set(
      (sessions ?? []).filter((s: SessionLog) => s?.allCompleted).map((s: SessionLog) => s?.date ?? '')
    );

    for (let w = 11; w >= 0; w--) {
      const week: { date: string; level: number }[] = [];
      for (let d = 0; d < 7; d++) {
        const dayOffset = w * 7 + (6 - d);
        const date = new Date(today);
        date.setDate(today.getDate() - dayOffset);
        const dateStr = date.toISOString().split('T')[0] ?? '';
        let level = 0;
        if (completeDates.has(dateStr)) level = 2;
        else if (sessionDates.has(dateStr)) level = 1;
        week.push({ date: dateStr, level });
      }
      weeks.push(week);
    }
    return weeks;
  }, [sessions]);

  if (!mounted) return null;

  const hasData = (sessions?.length ?? 0) > 0;

  return (
    <div className="space-y-6 pb-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          Track Your <span className="text-primary">Progress</span>
        </h2>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto">
          Monitor session consistency and tendon health improvements over time.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={<CalendarDays className="w-5 h-5" />} label="Total Sessions" value={stats.totalSessions} color="text-blue-500" bg="bg-blue-50" />
        <StatCard icon={<CheckCircle2 className="w-5 h-5" />} label="Full Completions" value={stats.completedSessions} color="text-emerald-500" bg="bg-emerald-50" />
        <StatCard icon={<Flame className="w-5 h-5" />} label="Current Streak" value={`${stats.streak}d`} color="text-orange-500" bg="bg-orange-50" />
        <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Completion Rate" value={`${stats.completionRate}%`} color="text-purple-500" bg="bg-purple-50" />
      </div>

      {/* Activity Calendar */}
      <div className="bg-card rounded-xl p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" /> Activity (Last 12 Weeks)
        </h3>
        <div className="flex gap-1 justify-center overflow-x-auto pb-2">
          {calendarData.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((day, di) => (
                <div
                  key={`${wi}-${di}`}
                  title={`${day?.date ?? ''}: ${day?.level === 2 ? 'Complete' : day?.level === 1 ? 'Partial' : 'No session'}`}
                  className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-sm transition-colors ${
                    (day?.level ?? 0) === 2
                      ? 'bg-emerald-500'
                      : (day?.level ?? 0) === 1
                      ? 'bg-emerald-200'
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-3 mt-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-muted inline-block" /> No session</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-200 inline-block" /> Partial</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" /> Complete</span>
        </div>
      </div>

      {/* Chart */}
      {hasData && (
        <div className="bg-card rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" /> Exercises Completed (Last 30 Days)
          </h3>
          <div className="h-64">
            <ProgressChart data={stats.last30} />
          </div>
        </div>
      )}

      {/* Session history */}
      {hasData && (
        <div className="bg-card rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" /> Session History
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {[...(sessions ?? [])]
              .sort((a: SessionLog, b: SessionLog) => (b?.date ?? '').localeCompare(a?.date ?? ''))
              .map((session: SessionLog, idx: number) => (
                <motion.div
                  key={session?.date ?? idx}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="flex items-center gap-3 p-2.5 bg-muted/30 rounded-lg"
                >
                  {session?.allCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <Activity className="w-4 h-4 text-amber-500 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground">
                      {formatDate(session?.date ?? '')}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {session?.exercisesCompleted?.length ?? 0}/{routine?.length ?? 0} exercises
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                    session?.allCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {session?.allCompleted ? 'Complete' : 'Partial'}
                  </span>
                </motion.div>
              ))}
          </div>
        </div>
      )}

      {!hasData && (
        <div className="text-center py-10 text-muted-foreground">
          <CalendarDays className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No sessions recorded yet.</p>
          <p className="text-xs mt-1">Complete exercises in the Routine tab and save your session to start tracking.</p>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color, bg }: { icon: React.ReactNode; label: string; value: string | number; color: string; bg: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`${bg} rounded-xl p-4 shadow-sm`}
    >
      <div className={`${color} mb-2`}>{icon}</div>
      <p className="text-xl sm:text-2xl font-bold text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
    </motion.div>
  );
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const monthIdx = parseInt(parts?.[1] ?? '1', 10) - 1;
    return `${months[monthIdx] ?? 'Jan'} ${parseInt(parts?.[2] ?? '1', 10)}, ${parts?.[0] ?? ''}`;
  } catch {
    return dateStr;
  }
}
