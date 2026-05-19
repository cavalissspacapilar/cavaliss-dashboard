"use client";
import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden animated-bg">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className="flex flex-col flex-1 overflow-hidden" style={{ marginLeft: 0 }}>
        <Header collapsed={collapsed} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="page-enter">{children}</div>
        </main>
      </div>
    </div>
  );
}
