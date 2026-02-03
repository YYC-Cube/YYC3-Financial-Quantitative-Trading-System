import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import FloatingPanel from './FloatingPanel';

export default function Layout() {
  return (
    <div className="flex h-screen w-full bg-bg-main overflow-hidden font-sans text-text-main selection:bg-accent-blue/30 selection:text-white relative">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Topbar />
        <main className="flex-1 overflow-auto p-6 scroll-smooth">
          <Outlet />
        </main>
      </div>
      <FloatingPanel />
    </div>
  );
}
