'use client';

import { Activity } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Activity className="w-7 h-7 text-primary" />
        </div>
        <p className="text-muted-foreground text-sm">Loading TendonCare...</p>
      </div>
    </div>
  );
}
