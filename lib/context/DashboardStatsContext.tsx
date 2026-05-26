"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface DashboardStats {
  citasBadge: number;
  leadsBadge: number;
  cavaBadge: number;
  iqBadge: number;
}

const DEFAULT: DashboardStats = { citasBadge: 0, leadsBadge: 0, cavaBadge: 0, iqBadge: 0 };
const DashboardStatsContext = createContext<DashboardStats>(DEFAULT);

export function DashboardStatsProvider({ children }: { children: React.ReactNode }) {
  const [stats, setStats] = useState<DashboardStats>(DEFAULT);

  useEffect(() => {
    fetch("/api/stats")
      .then(r => r.ok ? (r.json() as Promise<DashboardStats>) : null)
      .then(data => { if (data) setStats(data); })
      .catch(() => {});
  }, []);

  return (
    <DashboardStatsContext.Provider value={stats}>
      {children}
    </DashboardStatsContext.Provider>
  );
}

export const useDashboardStats = () => useContext(DashboardStatsContext);
